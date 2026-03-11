// スキルデータ — 6軸スキルシステム v4.0
// 軸: 共通 / 所属 / 配属 / 覚醒 / 背景 / 武器技能

// ===== 共通スキル（6種） =====
export const COMMON_SKILLS = [
    { id: '応急処置', attr: '識', level: 1, type: 'サブ', effect: '味方1人のHPを2回復' },
    { id: '鼓舞', attr: '魂', level: 2, type: 'サブ', effect: '味方1人の次の判定に+1' },
    { id: '高速移動', attr: '疾', level: 3, type: 'サブ', effect: 'このラウンドのリアクション判定+2' },
    { id: '看破', attr: '察', level: 4, type: 'サブ', effect: '護衛の特性を1つ自動開示' },
    { id: '窮地の一撃', attr: '体', level: 5, type: 'メイン', effect: 'HP50%以下時、ダメージ+4' },
    { id: '戦場鑑定', attr: '識', level: 5, type: 'サブ', effect: '核のHPを±2の精度で把握' },
];

// ===== 所属スキル =====
export const FACTION_SKILLS = {
    '祓部': [
        { id: '公文書照会', attr: '識', level: 1, type: 'サブ', effect: '調査判定+2、データベースアクセス（3回/シナリオ）' },
        { id: '援軍通信', attr: '判', level: 3, type: 'メイン', effect: 'NPC祓士を2ラウンド召喚（1回/シナリオ）' },
        { id: '組織命令', attr: '判', level: 5, type: 'メイン', effect: '味方全員の次の判定+1。使用者はそのラウンド攻撃不可' },
    ],
    '傭兵': [
        { id: 'コネクション', attr: '判', level: 1, type: 'サブ', effect: '情報収集+2、裏社会アクセス（3回/シナリオ）' },
        { id: '二つ名の威圧', attr: '魂', level: 3, type: 'サブ', effect: '護衛1体の次の行動を遅延（イニシアチブ-3）' },
        { id: '傭兵の矜持', attr: '体', level: 5, type: 'パッシブ', effect: 'HP50%以下時、攻撃判定+1' },
    ],
    '無所属': [
        { id: '裏ルート', attr: '察', level: 1, type: 'サブ', effect: '非合法な情報・装備にアクセス（2回/シナリオ）' },
        { id: '独立生存術', attr: '体', level: 3, type: 'パッシブ', effect: 'HP50%以下時、全防御修正+1' },
        { id: '偽装工作', attr: '判', level: 5, type: 'サブ', effect: '身分偽装。他所属のスキル1つを借用（1回/シナリオ）' },
    ],
};

// ===== 配属スキル =====
export const ASSIGNMENT_SKILLS = {
    // 祓部
    '古怪班': [
        { id: '古文書解読', attr: '識', level: 1, type: 'メイン', effect: '解明判定+2。甲種以上の古い怪異には追加+1' },
        { id: '戦場解明', attr: '識', level: 3, type: 'メイン', effect: '1回の判定で解明鍵を2つ同時に進行可能' },
        { id: '真名暴露', attr: '判', level: 7, type: 'メイン', effect: '4鍵完了時のみ。核に直接6ダメージ' },
    ],
    '新怪班': [
        { id: 'デジタル追跡', attr: '察', level: 1, type: 'メイン', effect: '電子調査+2。SNS・通信ログへのアクセス' },
        { id: '拡散分析', attr: '察', level: 3, type: 'サブ', effect: '噂の拡散を分析。護衛の特性を1つ自動開示' },
        { id: '情報遮断', attr: '判', level: 7, type: 'メイン', effect: '核の信念密度を低下。1ラウンド核の防御力=0' },
    ],
    '封印班': [
        { id: '浄化の祈り', attr: '魂', level: 1, type: 'メイン', effect: '浄化強化。共鳴メーター-3（通常-2）' },
        { id: '大祓', attr: '魂', level: 3, type: 'メイン', effect: '信念1点消費。味方全員の全共鳴メーター-1' },
        { id: '封印術式', attr: '魂', level: 7, type: 'メイン', effect: '封印ゲージ+3。特級専用' },
    ],
    '機動班': [
        { id: '鉄壁', attr: '体', level: 1, type: 'リアクション', effect: '受けるダメージ-2' },
        { id: '連携突破', attr: '体', level: 3, type: 'メイン', effect: '味方1人と同時攻撃。高い方の達成値+2を採用' },
        { id: '不落の構え', attr: '体', level: 7, type: 'サブ', effect: '次のかばう判定が自動成功。全ダメージを吸収' },
    ],
    // 傭兵
    '突撃型': [
        { id: '全力打撃', attr: '体', level: 1, type: 'メイン', effect: '武器修正2倍。自身に反動2ダメージ' },
        { id: '連鎖衝撃', attr: '体', level: 3, type: 'パッシブ', effect: '護衛撃破時、余剰ダメージが核に伝播' },
        { id: '一騎当千', attr: '体', level: 7, type: 'メイン', effect: '護衛全体に攻撃。達成値-1だが全体にダメージ' },
    ],
    '偵察型': [
        { id: '観察眼', attr: '察', level: 1, type: 'パッシブ', effect: '護衛のHP値を常に把握' },
        { id: '弱点看破', attr: '判', level: 3, type: 'サブ', effect: '護衛の特性を1つ開示+弱点（防御無視の攻撃属性）特定' },
        { id: '暗躍', attr: '判', level: 7, type: 'メイン', effect: '味方全員と護衛全体の行動順を再配置（1ラウンド）' },
    ],
    '技術型': [
        { id: '魔力集中', attr: '術', level: 1, type: 'サブ', effect: '次の魔法行使+2' },
        { id: '現場改造', attr: '術', level: 3, type: 'サブ', effect: '味方1人の武器修正を1ラウンド+2（CPコストなし）' },
        { id: '術式連鎖', attr: '術', level: 7, type: 'メイン', effect: '魔法攻撃成功時、追加対象にも半分のダメージ' },
    ],
    // 無所属
    '野良討伐者': [
        { id: '生き残りの反射', attr: '疾', level: 1, type: 'リアクション', effect: '回避+2。HP50%以下で追加+1' },
        { id: '噛みつき', attr: '体', level: 3, type: 'メイン', effect: '護衛に攻撃。成功時、対象の防御力を次ラウンド-2' },
        { id: '死線の一撃', attr: '体', level: 7, type: 'メイン', effect: 'HP4以下のみ。ダメージ+6（1回/シナリオ）' },
    ],
    '裏社会の住人': [
        { id: '裏取引', attr: '判', level: 1, type: 'メイン', effect: '信念1点消費。解明鍵のヒントを自動入手' },
        { id: '予兆操作', attr: '判', level: 3, type: 'サブ', effect: '怪異予兆カードの公開条件を変更（1回/シナリオ）' },
        { id: '偽情報', attr: '判', level: 7, type: 'サブ', effect: '判定成功で護衛1体の次の行動をスキップ' },
    ],
    '在野研究者': [
        { id: '速読解析', attr: '識', level: 1, type: 'メイン', effect: '解明判定+2' },
        { id: '情報共有', attr: '判', level: 3, type: 'サブ', effect: '次ラウンド、味方全員の判定+1' },
        { id: '禁忌知識', attr: '識', level: 7, type: 'メイン', effect: '4鍵完了時のみ。核に直接5ダメージ。渇望+2' },
    ],
};

// ===== 覚醒パターンスキル =====
export const AWAKENING_SKILLS = {
    '先天覚醒型': [
        { id: '霊障結界', attr: '魂', level: 1, type: 'リアクション', effect: '魔法ダメージを魂ランク値分軽減' },
        { id: '制御された力', attr: '術', level: 5, type: 'パッシブ', effect: '怪異誘発判定の確率が1ランク改善' },
    ],
    'ショック覚醒型': [
        { id: '喪失の怒り', attr: '魂', level: 1, type: 'パッシブ', effect: '怒りメーター4以上で攻撃ダメージ+1' },
        { id: '因縁の力', attr: '魂', level: 5, type: 'メイン', effect: '信念1点消費。因縁の敵にダメージ+4' },
    ],
    '実験覚醒型': [
        { id: '異能制御', attr: '魂', level: 1, type: 'パッシブ', effect: '異能ファンブル時、渇望上昇を+1に軽減（通常+2）' },
        { id: '過負荷発動', attr: '魂', level: 5, type: 'メイン', effect: '異能効果を2倍化。渇望+3' },
    ],
    '接触覚醒型': [
        { id: '共鳴読み', attr: '察', level: 1, type: 'サブ', effect: '怪異の感情状態を察知（GMからヒント1つ）' },
        { id: '怪異共振', attr: '魂', level: 5, type: 'メイン', effect: '護衛1体を1ラウンド味方化（魂判定。失敗時：渇望+3）' },
    ],
};

// ===== 背景スキル（自動取得・スロット不要） =====
export const BACKGROUND_SKILLS = {
    '神社育ち': { id: '禁足地の知恵', attr: '識', type: 'パッシブ', effect: '鎮座済み怪異の調査判定+1' },
    '元傭兵': { id: '初撃の勘', attr: '疾', type: 'パッシブ', effect: '戦闘1ラウンド目の攻撃判定+1' },
    '都市伝説研究者': { id: '調査ノート', attr: '識', type: 'パッシブ', effect: '調査スペシャル時、解明鍵への追加ヒント' },
    '元実験体': { id: '怪異への親和性', attr: '魂', type: 'パッシブ', effect: '覚醒ギフトの共鳴コストが1段階低下' },
    'ハッカー上がり': { id: '電子侵入', attr: '識', type: 'パッシブ', effect: 'NGT魔法+1。電子機器の調査+1' },
    '魔法資格持ち': { id: '安全術式', attr: '術', type: 'パッシブ', effect: '怪異誘発判定の確率が1ランク改善' },
};

// ===== 武器技能 =====
export const WEAPON_SKILLS = {
    '斬撃型': [
        { id: '連斬', attr: '疾', level: 1, type: 'メイン', effect: '攻撃判定を2回行い、高い方の達成値を採用' },
        { id: '兜割り', attr: '体', level: 3, type: 'メイン', effect: '対象の防御力を無視（ダメージ=達成値+武器修正）' },
        { id: '居合い', attr: '疾', level: 5, type: 'リアクション', effect: '護衛の攻撃に反撃。成功で敵の行動をキャンセル' },
    ],
    '打撃型': [
        { id: '重撃', attr: '体', level: 1, type: 'メイン', effect: 'ダメージ+2' },
        { id: '叩き伏せ', attr: '体', level: 3, type: 'メイン', effect: '成功時、護衛1体の行動を遅延（イニシアチブ-5）' },
        { id: '粉砕', attr: '体', level: 5, type: 'パッシブ', effect: '護衛撃破時、余剰ダメージが核に伝播' },
    ],
    '射撃型': [
        { id: '精密射撃', attr: '疾', level: 1, type: 'メイン', effect: '攻撃判定+1。射程無制限' },
        { id: '制圧射撃', attr: '疾', level: 3, type: 'メイン', effect: '護衛2体に同時攻撃（各ダメージ-1）' },
        { id: '狙撃', attr: '察', level: 5, type: 'メイン', effect: '1ラウンド準備。次ターン：ダメージ+3＋防御無視' },
    ],
    '魔導型': [
        { id: '魔力装填', attr: '術', level: 1, type: 'サブ', effect: '次の魔法行使+1' },
        { id: '広域術式', attr: '術', level: 3, type: 'メイン', effect: '護衛全体に魔法攻撃（各ダメージ-2）' },
        { id: '大術式', attr: '術', level: 5, type: 'メイン', effect: '護衛全体に防御無視の魔法ダメージ。渇望+2' },
    ],
    '体術型': [
        { id: '連撃', attr: '疾', level: 1, type: 'メイン', effect: '2回攻撃（各ダメージ-1、武器修正なし）' },
        { id: '崩し', attr: '体', level: 3, type: 'サブ', effect: '護衛1体の防御力を次ラウンドまで-2' },
        { id: '奥義', attr: '体', level: 5, type: 'メイン', effect: 'HP50%以下のみ。ダメージ2倍。失敗時：反動3ダメージ' },
    ],
};

// ===== ヘルパー =====

/** キャラクターが取得可能なスキル一覧を返す */
export function getAvailableSkills({ affiliation, assignment, awakening, weaponType }) {
    const skills = [];

    // 共通
    COMMON_SKILLS.forEach(s => skills.push({ ...s, axis: '共通' }));

    // 所属
    if (affiliation && FACTION_SKILLS[affiliation]) {
        FACTION_SKILLS[affiliation].forEach(s => skills.push({ ...s, axis: '所属' }));
    }

    // 配属
    if (assignment && ASSIGNMENT_SKILLS[assignment]) {
        ASSIGNMENT_SKILLS[assignment].forEach(s => skills.push({ ...s, axis: '配属' }));
    }

    // 覚醒
    if (awakening && AWAKENING_SKILLS[awakening]) {
        AWAKENING_SKILLS[awakening].forEach(s => skills.push({ ...s, axis: '覚醒' }));
    }

    // 武器技能
    if (weaponType && WEAPON_SKILLS[weaponType]) {
        WEAPON_SKILLS[weaponType].forEach(s => skills.push({ ...s, axis: '武器' }));
    }

    return skills;
}

/** 背景スキル（スロット不要・自動取得）を返す */
export function getBackgroundSkill(background) {
    return BACKGROUND_SKILLS[background] || null;
}

/** スキルの行動種別カラー */
export function getSkillTypeColor(type) {
    switch (type) {
        case 'メイン': return '#ff8844';
        case 'サブ': return '#44aaff';
        case 'リアクション': return '#aa44ff';
        case 'パッシブ': return '#44cc88';
        default: return 'var(--text-muted)';
    }
}

/** 軸のカラー */
export function getAxisColor(axis) {
    switch (axis) {
        case '共通': return 'var(--text-secondary)';
        case '所属': return '#d4af37';
        case '配属': return '#44aaff';
        case '覚醒': return '#aa44ff';
        case '武器': return '#ff6644';
        default: return 'var(--text-muted)';
    }
}
