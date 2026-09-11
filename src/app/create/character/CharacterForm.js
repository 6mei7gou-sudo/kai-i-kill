// キャラクターシート作成・編集フォーム — v4.0
// 既定は「RPシート（簡易キャラクターシート）」。ゲームデータ（ステータス・戦闘用データ）は
// スイッチで追加する。ステータスの構造は変えず、見せ方だけを一本道にしている。
'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { S } from '@/components/FormFields';
import { findOption, getWeaponSpec } from '@/data/weaponData';
import { GAME_DATA_STEPS, INNATE_AWAKENING, DEFAULT_INNATE_CHOICE, RANK_VALUE, BASE_BELIEF_POINTS } from '@/data/characterBuildData';
import { computeRanks, getGameDataStatus, validateCharacterForm, buildCharacterPayload, hasGameData } from '@/lib/characterBuild';
import RpSections from './RpSections';
import GameDataSections, { calcUsedCp } from './GameDataSections';
import StatusSummary from './StatusSummary';
import ExportSection from './ExportSection';
import { Notice } from './formStyles';
import './CharacterForm.css';

// 初期値
const INITIAL = {
    author_name: '', visibility: '公開', thumbnail_url: '', icon_url: '', image_urls: ['', '', ''],
    character_name: '', character_name_kana: '', title: '', age: '', gender: '',
    affiliation: '祓部', sub_affiliation: '', awakening: '先天覚醒型',
    background: '', weapon_type: '', gift: '',
    rank_tai: 'D', rank_haya: 'D', rank_shiki: 'D', rank_han: 'D',
    rank_shiya: 'D', rank_jutsu: 'D', rank_kon: 'D',
    stage_plus: [],
    skills: [],
    proficient_languages: [], weak_languages: [],
    equipment_type: '武装型', equipment_name: '', custom_equipment_name: '', equipment_maker: '', equipment_detail: '', equipment_options: [],
    linked_gear_id: '',
    belief_points: BASE_BELIEF_POINTS,
    level: 1, fate: '', backstory: '', brief_history: '', hidden_abilities: [],
    appearance: '', personality: '', speech_style: '',
    related_anomalies: '', related_characters: '', related_factions: '',
    social_x: '', social_vrc: '', social_url: '',
    cyber_grade: 'none',
    cybernetics: [{ name: '', part: '' }, { name: '', part: '' }, { name: '', part: '' }],
    fanart_policy: {
        coupling: 'ng', bl: 'ng', gl: 'ng', nl: 'ng', yume: 'ng',
        commission: 'ng', body_change: 'ng', gender_swap: 'ng',
        hairstyle_change: 'ng', costume_change: 'ng', parody: 'ng',
        mild_sexual: 'ng', mild_violence: 'ng', r18: 'ng', r18g: 'ng',
        note: '',
    },
};

// DBから読んだ行をフォーム状態に整える（null → 空文字／配列を保証）
function normalizeRecord(data) {
    const f = { ...INITIAL, ...data };
    ['sub_affiliation', 'background', 'weapon_type', 'gift', 'equipment_type', 'equipment_name', 'custom_equipment_name', 'equipment_maker', 'equipment_detail',
        'linked_gear_id', 'title', 'age', 'gender', 'character_name_kana', 'appearance', 'personality', 'speech_style', 'brief_history', 'fate', 'backstory',
        'related_anomalies', 'related_characters', 'related_factions', 'social_x', 'social_vrc', 'social_url', 'thumbnail_url', 'icon_url', 'author_name'].forEach(k => {
        if (f[k] == null) f[k] = '';
    });
    if (!f.equipment_type) f.equipment_type = '武装型';
    ['skills', 'stage_plus', 'proficient_languages', 'weak_languages', 'equipment_options', 'hidden_abilities'].forEach(k => {
        if (!Array.isArray(f[k])) f[k] = [];
    });
    if (!Array.isArray(f.image_urls) || f.image_urls.length < 3) f.image_urls = [...(Array.isArray(f.image_urls) ? f.image_urls : []), '', '', ''].slice(0, 3);
    let cyber = Array.isArray(f.cybernetics) ? f.cybernetics : [];
    while (cyber.length < 3) cyber = [...cyber, { name: '', part: '' }];
    f.cybernetics = cyber;
    f.fanart_policy = { ...INITIAL.fanart_policy, ...(f.fanart_policy || {}) };
    if (!f.cyber_grade) f.cyber_grade = 'none';
    if (!f.level) f.level = 1;
    return f;
}

// 既存レコードから先天覚醒型の選択（術/魂）を推定する
function inferInnateChoice(data) {
    if (!data || data.awakening !== INNATE_AWAKENING) return DEFAULT_INNATE_CHOICE;
    const kon = RANK_VALUE[data.rank_kon] || 0;
    const jutsu = RANK_VALUE[data.rank_jutsu] || 0;
    return kon > jutsu ? 'rank_kon' : DEFAULT_INNATE_CHOICE;
}

export default function CharacterForm({ editId = null, initialData = null }) {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const isEdit = !!editId;
    const isOfficial = !!(initialData?.is_official);

    // 下書きキーはユーザーIDごとに分ける（同じブラウザーで別アカウントに復元させない）
    const draftUserId = user?.id || null;
    const DRAFT_KEY = draftUserId ? `kaiii_char_draft_${editId || 'new'}_${draftUserId}` : null;
    const LEGACY_DRAFT_KEY = 'kaiii_char_draft_new';

    const [form, setForm] = useState(INITIAL);
    const [gameEnabled, setGameEnabled] = useState(false);
    const [draftLoaded, setDraftLoaded] = useState(false);
    const [innateChoice, setInnateChoice] = useState(DEFAULT_INNATE_CHOICE);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [myGear, setMyGear] = useState([]);
    const [draftMsg, setDraftMsg] = useState(null);
    const [hasDraft, setHasDraft] = useState(false);

    // 編集モード：initialDataで上書き。ゲームデータがあればスイッチON
    useEffect(() => {
        if (initialData) {
            setForm(normalizeRecord(initialData));
            setGameEnabled(hasGameData(initialData) || isOfficial);
            setInnateChoice(inferInnateChoice(initialData));
        }
    }, [initialData, isOfficial]);

    // 認証情報の読み込み後に、そのユーザーの下書きだけを復元する。
    // 所有者の無い旧キーは別ユーザーへ取り込まず削除する。アカウントが変わればフォームは初期化する
    useEffect(() => {
        if (isEdit || !isLoaded) return;
        setDraftLoaded(false);
        setForm(INITIAL);
        setGameEnabled(false);
        setHasDraft(false);
        try { localStorage.removeItem(LEGACY_DRAFT_KEY); } catch {}
        if (!DRAFT_KEY) return;
        try {
            const saved = localStorage.getItem(DRAFT_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setForm(normalizeRecord(parsed));
                setGameEnabled(typeof parsed._game_enabled === 'boolean' ? parsed._game_enabled : hasGameData(parsed));
                setHasDraft(true);
            }
        } catch {}
        setDraftLoaded(true);
    }, [isEdit, isLoaded, DRAFT_KEY]);

    // 自動保存（2秒デバウンス）。ログイン済みで下書き復元が終わった後のみ
    useEffect(() => {
        if (isEdit || !DRAFT_KEY || !draftLoaded) return;
        const timer = setTimeout(() => {
            try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...form, _game_enabled: gameEnabled })); } catch {}
        }, 2000);
        return () => clearTimeout(timer);
    }, [form, gameEnabled, isEdit, DRAFT_KEY, draftLoaded]);

    const clearDraft = () => { try { if (DRAFT_KEY) localStorage.removeItem(DRAFT_KEY); } catch {} };

    useEffect(() => {
        if (user && !form.author_name && !isEdit) {
            setForm(prev => ({ ...prev, author_name: `@${user.username || user.firstName || 'user'}` }));
        }
    }, [user, isEdit]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!user) return;
        fetch(`/api/posts?table=gear_posts&user_id=${user.id}`)
            .then(r => r.json())
            .then(res => { if (res.ok) setMyGear(res.data || []); })
            .catch(() => {});
    }, [user]);

    const set = useCallback((key, val) => setForm(prev => ({ ...prev, [key]: val })), []);

    // --- 派生値 ---
    const ranks = useMemo(() => computeRanks(form, {
        innateChoice, isOfficial,
        savedRanks: isEdit ? initialData : null,
    }), [form, innateChoice, isOfficial, isEdit, initialData]);
    const gameStatus = useMemo(() => getGameDataStatus(form), [form]);
    const { usedCp } = useMemo(() => calcUsedCp(form, myGear), [form, myGear]);
    const rpDone = !!form.character_name.trim();

    const jumpTo = useCallback((key) => {
        const el = document.getElementById(`gd-${key}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    // --- 投稿処理 ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validateCharacterForm(form, { gameEnabled, isOfficial });
        if (err) { setResult({ ok: false, msg: err }); return; }

        setSubmitting(true); setResult(null);
        try {
            const payload = buildCharacterPayload(form, { gameEnabled, isEdit, isOfficial, initialData, innateChoice });

            const method = isEdit ? 'PATCH' : 'POST';
            const body = isEdit
                ? { table: 'character_sheets', id: editId, data: payload }
                : { table: 'character_sheets', data: payload };

            const res = await fetch('/api/posts', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);

            // 新規作成時、戦闘流派が選択されていたら自動で武器投稿して紐づける
            let gearPosted = false;
            let gearError = null;
            if (!isEdit && gameEnabled && form.weapon_type && !form.linked_gear_id) {
                try {
                    const spec = getWeaponSpec(form.weapon_type, form.equipment_maker || '汎用品', form.equipment_type, form.equipment_name);
                    const optionsData = form.equipment_options.map(name => {
                        const o = findOption(name);
                        return o ? { name: o.name, cp: o.cp, resonance: o.resonance, risk: o.risk } : { name, cp: 0, resonance: '', risk: '低' };
                    });
                    const baseCp = spec ? spec.cp : 0;
                    const totalCp = baseCp + optionsData.reduce((s, o) => s + o.cp, 0);
                    const gearPayload = {
                        gear_name: form.custom_equipment_name || `【${form.character_name}】の${form.weapon_type}武器`,
                        category: form.equipment_type,
                        manufacturer: form.equipment_maker || '汎用品',
                        weapon_type: form.weapon_type,
                        weapon_subtype: form.equipment_name || '',
                        base_name: `${form.weapon_type}${form.equipment_name ? '・' + form.equipment_name : ''}（${form.equipment_maker || '汎用品'}）`,
                        base_cp: baseCp,
                        slot_count: spec ? spec.slot : 2,
                        options: optionsData,
                        option_count: optionsData.length,
                        total_cp: totalCp,
                        risk_level: optionsData.some(o => o.risk === '高') ? '高' : optionsData.some(o => o.risk === '中') ? '中' : '低',
                        summary: form.equipment_detail || '',
                        visibility: form.visibility || '公開',
                    };
                    const gearRes = await fetch('/api/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'gear_posts', data: gearPayload }) });
                    const gearJson = await gearRes.json();
                    if (!gearRes.ok) gearError = gearJson.error || '装備の自動投稿に失敗しました';
                    if (gearRes.ok && gearJson.data?.id && json.data?.id) {
                        await fetch('/api/posts', {
                            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ table: 'character_sheets', id: json.data.id, data: { linked_gear_id: gearJson.data.id } }),
                        });
                        gearPosted = true;
                    }
                } catch (gearErr) {
                    console.warn('武器自動投稿に失敗:', gearErr);
                }
            }

            setResult({ ok: true, msg: isEdit ? 'シートを更新しました！' : `キャラクターシートを投稿しました！${gearPosted ? '装備も自動投稿されました。' : ''}${gearError ? `（装備の自動投稿は行われませんでした：${gearError}）` : ''}` });
            clearDraft();
            if (!isEdit) setForm(INITIAL);
            setTimeout(() => router.push(`/community/characters/${json.data?.id || editId}/`), 1500);
        } catch (err) {
            setResult({ ok: false, msg: `${isEdit ? '更新' : '投稿'}に失敗: ${err.message}` });
        } finally { setSubmitting(false); }
    };

    const toggleGame = () => setGameEnabled(v => !v);

    return (
        <div className="container">
            <section className="section">
                <span className="section__title">// {isEdit ? 'EDIT' : 'CREATE'} — CHARACTER SHEET v4</span>
                <h1 className="section__heading">{isEdit ? 'キャラクターシートを編集' : 'キャラクターシートを作成'}</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)', lineHeight: 1.8 }}>
                    まずは<strong style={{ color: 'var(--text-primary)' }}>RPシート</strong>（名前・立場・見た目・来歴）を作る。キャラ名だけあれば投稿できる。
                    セッションで判定に使う<strong style={{ color: 'var(--text-primary)' }}>ゲームデータ</strong>は、必要になったらスイッチで追加すればいい。
                    <Link href="/quickstart/" style={{ color: 'var(--accent-gold)', marginLeft: '6px' }}>作り方の解説はクイックスタート →</Link>
                </p>
            </section>

            <form onSubmit={handleSubmit}>
                {/* 下書き通知 */}
                {!isEdit && hasDraft && (
                    <div style={{ padding: '10px 14px', marginBottom: 'var(--space-md)', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-gold)' }}>下書きを自動復元しました（入力内容は自動保存されます）</span>
                        <button type="button" onClick={() => { clearDraft(); setForm(INITIAL); setGameEnabled(false); setHasDraft(false); setDraftMsg('下書きをクリアしました'); }}
                            style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '3px 10px', cursor: 'pointer' }}>
                            下書きをクリア
                        </button>
                    </div>
                )}
                {draftMsg && <div style={{ padding: '8px 14px', marginBottom: 'var(--space-md)', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>{draftMsg}</div>}

                {/* モードバー */}
                <div className="cf-mode-bar">
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.15em', color: 'var(--accent-gold)' }}>RP SHEET</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: rpDone ? '#44cc88' : 'var(--text-muted)' }}>{rpDone ? '✓ 投稿できる' : '○ キャラ名を入力'}</div>
                        </div>
                        <button type="button" className="cf-switch" onClick={toggleGame} aria-pressed={gameEnabled}>
                            <span className={`cf-switch__track${gameEnabled ? ' cf-switch__track--on' : ''}`}><span className="cf-switch__knob" /></span>
                            <span>
                                <span style={{ display: 'block', fontSize: '10px', letterSpacing: '0.15em', color: gameEnabled ? 'var(--accent-gold)' : 'var(--text-muted)' }}>GAME DATA</span>
                                <span style={{ color: gameEnabled ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                    ゲームデータを{gameEnabled ? '付ける' : '付けない'}
                                    {gameEnabled && <span style={{ marginLeft: '8px', fontSize: '11px', color: gameStatus.complete ? '#44cc88' : '#ffaa00' }}>{gameStatus.complete ? '✓ 完成' : `未選択：${gameStatus.missing.join('・')}`}</span>}
                                </span>
                            </span>
                        </button>
                    </div>
                    <nav className="cf-jump-nav" aria-label="セクションへ移動">
                        <a href="#rp-identity">名前と立場</a>
                        <a href="#rp-profile">プロフィール</a>
                        <a href="#rp-story">来歴</a>
                        <a href="#rp-fanart">二次創作</a>
                        {gameEnabled && GAME_DATA_STEPS.map(s => <a key={s.key} href={`#gd-${s.key}`}>{s.no}.{s.title}</a>)}
                        <a href="#export">出力</a>
                    </nav>
                </div>

                {/* ====== RPシート ====== */}
                <RpSections form={form} set={set} isEdit={isEdit} />

                {/* ====== ゲームデータ ====== */}
                {gameEnabled ? (
                    <div className="cf-game-layout">
                        <div>
                            <div style={{ ...S.section, padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)', borderColor: 'var(--accent-gold-border)' }}>
                                <div style={S.sectionTitle}>GAME DATA — 判定に使うデータ</div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8, margin: 0 }}>
                                    全能力値はDから始まる。<span style={{ color: 'var(--accent-gold)' }}>背景</span>で2つがC、<span style={{ color: '#44aaff' }}>配属</span>で1つがB、<span style={{ color: '#aa44ff' }}>先天覚醒</span>なら術か魂がCになり、最後に<span style={{ color: '#64c8ff' }}>+段階</span>を2つ足す。
                                    右の概要パネルに、いまの選択で決まったランクと「どこから昇格したか」が常に表示される。必須は STEP 1・2・7。
                                </p>
                            </div>
                            {isOfficial && <Notice tone="gold">公式キャラクター：ランクは直接設定でき、スロット・段階・言語の上限は適用されない。</Notice>}
                            <GameDataSections
                                form={form} set={set} setForm={setForm}
                                isOfficial={isOfficial}
                                innateChoice={innateChoice} setInnateChoice={setInnateChoice}
                                ranks={ranks} myGear={myGear}
                            />
                        </div>
                        <div className="cf-game-side">
                            <div className="cf-summary-full"><StatusSummary form={form} ranks={ranks} status={gameStatus} usedCp={usedCp} onJump={jumpTo} /></div>
                            <div className="cf-summary-compact"><StatusSummary form={form} ranks={ranks} status={gameStatus} usedCp={usedCp} onJump={jumpTo} compact /></div>
                        </div>
                    </div>
                ) : (
                    <div id="game-teaser" style={{ ...S.section, borderStyle: 'dashed', borderColor: 'rgba(212,175,55,0.25)' }}>
                        <div style={S.sectionTitle}>GAME DATA — 任意</div>
                        <h2 style={{ ...S.sectionHeading, marginBottom: 'var(--space-sm)' }}>ゲームデータを付ける</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8, marginBottom: 'var(--space-md)' }}>
                            セッションで判定に使うステータス。背景・配属・戦闘流派を選ぶだけで七つの能力値のランクが自動で決まり、スキル・ギフト・装備をそこに足していく。
                            RPシートだけで投稿しておき、あとから編集で追加してもいい。
                        </p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
                            {GAME_DATA_STEPS.map(s => (
                                <span key={s.key} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '3px 8px', border: s.required ? '1px solid var(--accent-gold-border)' : '1px solid rgba(255,255,255,0.08)', color: s.required ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                                    {s.no}. {s.title}{s.required ? ' *' : ''}
                                </span>
                            ))}
                        </div>
                        <button type="button" onClick={toggleGame}
                            style={{ padding: '10px 24px', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', fontWeight: 700, background: 'rgba(212,175,55,0.1)', border: '1px solid var(--accent-gold-border)', color: 'var(--accent-gold)', cursor: 'pointer' }}>
                            ＋ ゲームデータを付ける
                        </button>
                        {(gameStatus.started) && (
                            <div style={{ marginTop: 'var(--space-md)' }}>
                                <Notice tone="warn">入力済みのゲームデータは保持されるが、オフのまま投稿するとシートには含まれない。</Notice>
                            </div>
                        )}
                    </div>
                )}

                {/* ====== 出力 ====== */}
                <ExportSection form={form} gameEnabled={gameEnabled} ranks={ranks} innateChoice={innateChoice} />

                {/* ====== 結果 + 送信 ====== */}
                {result && (
                    <div className="callout" style={{ marginBottom: 'var(--space-xl)', borderColor: result.ok ? 'var(--accent-gold)' : 'var(--accent-danger)' }}>
                        <div className="callout__label" style={{ color: result.ok ? 'var(--accent-gold)' : 'var(--accent-danger)' }}>{result.ok ? '投稿完了' : 'エラー'}</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{result.msg}</p>
                    </div>
                )}

                <button type="submit" style={S.submitBtn} disabled={submitting}
                    onMouseEnter={e => { e.target.style.background = 'rgba(212, 175, 55, 0.2)'; e.target.style.boxShadow = '0 0 30px var(--accent-gold-glow)'; }}
                    onMouseLeave={e => { e.target.style.background = S.submitBtn.background; e.target.style.boxShadow = 'none'; }}>
                    {submitting ? 'SUBMITTING...' : isEdit ? '▶ シートを更新' : gameEnabled ? '▶ キャラクターシートを投稿（ゲームデータ付き）' : '▶ RPシートを投稿'}
                </button>
            </form>
        </div>
    );
}
