// =====================================================
// キャラクター作成 純粋ロジック
// ランク計算・完成度判定・投稿ペイロード整形・テキスト出力。
// React に依存しないので、フォーム・詳細ページ・ガイド・テストで共有する。
// =====================================================

import {
    ABILITIES, RANKS, RANK_VALUE, RANK_DICE,
    BACKGROUND_BY_ID, findAssignment,
    INNATE_AWAKENING, INNATE_CHOICES, DEFAULT_INNATE_CHOICE,
    STAGE_PLUS_MAX, BASE_BELIEF_POINTS, BASE_CP_BUDGET,
    SKILL_SLOTS_BY_LEVEL, CYBER_GRADE_MIN_LEVEL,
} from '@/data/characterBuildData';

const higher = (a, b) => (RANK_VALUE[a] >= RANK_VALUE[b] ? a : b);

/**
 * 背景・配属・覚醒から各能力値のランクと「昇格の出どころ」を計算する。
 *
 * @param {object} form           character_sheets 相当のオブジェクト（background / affiliation / sub_affiliation / awakening / stage_plus / rank_*）
 * @param {object} [opts]
 * @param {string} [opts.innateChoice]  先天覚醒型でC昇格させる能力値キー（rank_jutsu / rank_kon）
 * @param {object} [opts.savedRanks]    既存レコードのランク（ステータスポイント等で上昇済みの値を下げないために使う）
 * @param {boolean} [opts.isOfficial]   公式キャラはフォームの値をそのまま使う
 * @returns {{ [key: string]: { rank: string, plus: boolean, display: string, dice: string, sources: Array<{type: string, label: string, to: string}> } }}
 */
export function computeRanks(form, opts = {}) {
    const f = form || {};
    const innateChoice = INNATE_CHOICES.includes(opts.innateChoice) ? opts.innateChoice : DEFAULT_INNATE_CHOICE;
    const bg = f.background ? BACKGROUND_BY_ID[f.background] : null;
    const asn = findAssignment(f.affiliation, f.sub_affiliation);
    const stagePlus = Array.isArray(f.stage_plus) ? f.stage_plus : [];
    const result = {};

    ABILITIES.forEach(({ key }) => {
        let rank = 'D';
        const sources = [];

        if (opts.isOfficial) {
            rank = RANKS.includes(f[key]) ? f[key] : 'D';
            if (rank !== 'D') sources.push({ type: '公式', label: '直接設定', to: rank });
        } else {
            if (bg && bg.upgrades.includes(key)) {
                rank = higher(rank, 'C');
                sources.push({ type: '背景', label: bg.id, to: 'C' });
            }
            if (f.awakening === INNATE_AWAKENING && key === innateChoice) {
                rank = higher(rank, 'C');
                sources.push({ type: '覚醒', label: '先天型', to: 'C' });
            }
            if (asn && asn.upgrade === key) {
                rank = higher(rank, 'B');
                sources.push({ type: '配属', label: asn.id, to: 'B' });
            }
            // 既存レコード（ステータスポイント等）で上昇済みなら下げない
            const saved = opts.savedRanks?.[key];
            if (saved && RANKS.includes(saved) && RANK_VALUE[saved] > RANK_VALUE[rank]) {
                rank = saved;
                sources.push({ type: '成長', label: 'ステータスポイント', to: saved });
            }
        }

        const plus = stagePlus.includes(key) && rank !== 'S';
        if (plus) sources.push({ type: '段階', label: '+段階', to: `${rank}+` });

        result[key] = {
            rank,
            plus,
            display: plus ? `${rank}+` : rank,
            dice: RANK_DICE[rank],
            sources,
        };
    });

    return result;
}

/** 信念ポイント初期値（ショック覚醒型は+1） */
export function calcBeliefPoints(awakening) {
    let pts = BASE_BELIEF_POINTS;
    if (awakening === 'ショック覚醒型') pts += 1;
    return pts;
}

/** 装備CP予算（Lv1基本10 + 背景×装備形態の補正） */
export function calcCpBudget(background, equipmentType) {
    let budget = BASE_CP_BUDGET;
    if (background === '鋼の肉体' && (equipmentType === '武装型' || equipmentType === '半装身型')) budget += 4;
    if (background === 'ハッカー上がり' && equipmentType === '独立型') budget += 3;
    return budget;
}

/** レベル別スキルスロット数 */
export function getSkillSlots(level) {
    const lv = Number(level) || 1;
    return SKILL_SLOTS_BY_LEVEL[Math.min(lv, SKILL_SLOTS_BY_LEVEL.length - 1)] || 1;
}

/** サイバネティクス等級のレベル要件を満たしているか */
export function cyberGradeAllowed(grade, level) {
    if (!grade || grade === 'none') return true;
    return (Number(level) || 1) >= (CYBER_GRADE_MIN_LEVEL[grade] || 1);
}

/**
 * レコードにゲームデータ（ステータス・戦闘用データ）が含まれているか。
 * RPシートのみのキャラクターでは false。
 */
export function hasGameData(record) {
    const r = record || {};
    const skills = Array.isArray(r.skills) ? r.skills : [];
    const stagePlus = Array.isArray(r.stage_plus) ? r.stage_plus : [];
    return !!(
        r.background ||
        r.weapon_type ||
        r.gift ||
        skills.length > 0 ||
        stagePlus.length > 0 ||
        r.linked_gear_id ||
        (r.cyber_grade && r.cyber_grade !== 'none') ||
        (Number(r.level) || 1) > 1
    );
}

/**
 * ゲームデータの入力状況。
 * @returns {{ started: boolean, complete: boolean, missing: string[] }}
 */
export function getGameDataStatus(form) {
    const f = form || {};
    const missing = [];
    if (!f.background) missing.push('背景');
    if (!f.sub_affiliation) missing.push('配属');
    if (!f.weapon_type) missing.push('戦闘流派');
    const started = hasGameData(f) || !!f.sub_affiliation;
    return { started, complete: missing.length === 0, missing };
}

/**
 * 投稿前バリデーション。エラーがなければ null、あれば日本語メッセージを返す。
 * @param {object} form
 * @param {{ gameEnabled: boolean, isOfficial?: boolean }} opts
 */
export function validateCharacterForm(form, { gameEnabled, isOfficial = false }) {
    const f = form || {};
    if (!String(f.character_name || '').trim()) return 'キャラ名は必須です';
    if (!gameEnabled) return null;

    const status = getGameDataStatus(f);
    if (!status.complete) return `ゲームデータが未完成です：${status.missing.join('・')} を選択してください（RPシートだけで投稿する場合はゲームデータをオフにしてください）`;

    if (f.cyber_grade && f.cyber_grade !== 'none') {
        const hasCyber = (f.cybernetics || []).some(c => c && c.name);
        if (!hasCyber) return `サイバネティクス等級${f.cyber_grade}を選択していますが、パーツが未選択です。最低1つ選択してください`;
        if (!isOfficial && !cyberGradeAllowed(f.cyber_grade, f.level)) {
            return `サイバネティクス等級${f.cyber_grade}の施術にはレベル${CYBER_GRADE_MIN_LEVEL[f.cyber_grade]}以上が必要です`;
        }
    }

    const profLen = (f.proficient_languages || []).length;
    const weakLen = (f.weak_languages || []).length;
    if (profLen !== weakLen) return `得意言語と苦手言語の数を揃えてください（得意${profLen} / 苦手${weakLen}）`;

    if (!isOfficial && (f.stage_plus || []).length > STAGE_PLUS_MAX) return `+段階は${STAGE_PLUS_MAX}つまでです`;
    return null;
}

/** ゲームデータ列の初期値（オフにした時に投稿ペイロードへ入れる値） */
export const GAME_DATA_DEFAULTS = {
    background: null, weapon_type: null, gift: null,
    skills: [], stage_plus: [],
    proficient_languages: [], weak_languages: [],
    equipment_type: null, equipment_name: '', custom_equipment_name: '', equipment_maker: '', equipment_detail: '', equipment_options: [],
    linked_gear_id: null,
    cyber_grade: 'none', cybernetics: [],
    belief_points: BASE_BELIEF_POINTS,
};

// DB の CHECK 制約がある列：空文字は不可なので null に正規化する
const NULLABLE_ENUM_COLUMNS = ['background', 'sub_affiliation', 'weapon_type', 'gift', 'equipment_type', 'linked_gear_id'];

/**
 * フォーム状態から投稿ペイロードを作る。
 * - ゲームデータOFF：ステータス系の列を初期値に戻す（RP列はそのまま）
 * - 空文字の列挙型列を null に
 * - 計算済みランクを反映（編集時は既存値を下げない）
 */
export function buildCharacterPayload(form, { gameEnabled, isEdit = false, isOfficial = false, initialData = null, innateChoice } = {}) {
    const payload = { ...form };
    delete payload.id; delete payload.created_at; delete payload.updated_at; delete payload.user_id; delete payload.image_url;
    delete payload._game_enabled;

    if (!gameEnabled) {
        Object.assign(payload, GAME_DATA_DEFAULTS);
        if (!isEdit) payload.level = 1;
    }

    const ranks = computeRanks(payload, {
        innateChoice,
        isOfficial,
        savedRanks: isEdit ? { ...(initialData || {}), ...pickRanks(form) } : null,
    });
    ABILITIES.forEach(a => { payload[a.key] = ranks[a.key].rank; });

    payload.belief_points = gameEnabled ? calcBeliefPoints(payload.awakening) : BASE_BELIEF_POINTS;
    payload.class = null; // 後方互換列

    NULLABLE_ENUM_COLUMNS.forEach(col => { if (payload[col] === '' || payload[col] === undefined) payload[col] = null; });
    return payload;
}

function pickRanks(form) {
    const out = {};
    ABILITIES.forEach(a => { if (form && RANKS.includes(form[a.key])) out[a.key] = form[a.key]; });
    return out;
}

/**
 * Discord 等に貼り付けるプレーンテキスト。
 * RP情報を先に、ゲームデータは含まれている場合だけ後段に出す。
 */
export function buildPlainText(form, { gameEnabled = true, innateChoice } = {}) {
    const f = form || {};
    const L = [];
    const bar = '═══════════════════════════════════';
    L.push(bar, '  KAI-I//KILL キャラクターシート', bar, '');
    L.push('【基本情報】');
    L.push(`名前：${f.character_name || '（名前なし）'}${f.character_name_kana ? `（${f.character_name_kana}）` : ''}`);
    if (f.title) L.push(`二つ名：${f.title}`);
    if (f.age || f.gender) L.push(`年齢／性別：${f.age || '—'} / ${f.gender || '—'}`);
    if (f.affiliation) L.push(`所属：${f.affiliation}${f.sub_affiliation ? `（${f.sub_affiliation}）` : ''}`);
    if (f.awakening) L.push(`覚醒：${f.awakening}`);

    if (f.appearance || f.personality || f.speech_style) {
        L.push('', '【プロフィール】');
        if (f.appearance) L.push(`外見：${f.appearance}`);
        if (f.personality) L.push(`性格：${f.personality}`);
        if (f.speech_style) L.push(`口調：${f.speech_style}`);
    }
    if (f.brief_history || f.fate) {
        L.push('', '【物語】');
        if (f.brief_history) L.push(f.brief_history);
        if (f.fate) L.push(`因縁：${f.fate}`);
    }

    if (gameEnabled && (hasGameData(f) || f.sub_affiliation)) {
        const ranks = computeRanks(f, { innateChoice, isOfficial: !!f.is_official, savedRanks: pickRanks(f) });
        L.push('', '【ゲームデータ】');
        if (f.background) L.push(`背景：${f.background}`);
        if (f.weapon_type) L.push(`戦闘流派：${f.weapon_type}`);
        L.push(`レベル：${f.level || 1}　信念：${calcBeliefPoints(f.awakening)}`);
        L.push('', '【能力値】');
        L.push(ABILITIES.map(a => `${a.name}${ranks[a.key].display}`).join('　'));
        ABILITIES.forEach(a => {
            const src = ranks[a.key].sources.filter(s => s.type !== '段階').map(s => `${s.type}:${s.label}`).join('・');
            L.push(`  ${a.name}：${ranks[a.key].display}（${ranks[a.key].dice}）${src ? `　← ${src}` : ''}`);
        });
        if (Array.isArray(f.skills) && f.skills.length > 0) {
            L.push('', '【スキル】');
            f.skills.forEach(s => L.push(`  • ${s}`));
        }
        if (f.gift) L.push('', `【ギフト】${f.gift}`);
        const prof = Array.isArray(f.proficient_languages) ? f.proficient_languages : [];
        const weak = Array.isArray(f.weak_languages) ? f.weak_languages : [];
        if (prof.length || weak.length) L.push('', `【魔法言語】得意：${prof.join('、') || '—'} / 苦手：${weak.join('、') || '—'}`);
        if (f.weapon_type || f.custom_equipment_name || f.equipment_name) {
            L.push('', '【装備】');
            L.push(`  ${f.custom_equipment_name || f.equipment_name || '（未命名）'}${f.equipment_type ? ` / ${f.equipment_type}` : ''}${f.equipment_maker ? ` / ${f.equipment_maker}` : ''}`);
        }
    }

    L.push('', bar);
    return L.join('\n');
}
