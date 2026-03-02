// キャラクターシート投稿フォーム — 新ルールブック対応 v2
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { S, FormSelect, FormInput, FormTextArea } from '@/components/FormFields';

// ===== 定数定義 =====

const RANKS = ['D', 'C', 'B', 'A', 'S'];
const RANK_DICE = { D: '1d6', C: '2d6', B: '3d6', A: '4d6', S: '4d6+特典' };

// 7能力値
const ABILITIES = [
    { key: 'rank_tai', name: '体', reading: 'たい', desc: '格闘・突破・物理耐久' },
    { key: 'rank_haya', name: '疾', reading: 'はや', desc: '先手・回避・追跡（イニシアチブ）' },
    { key: 'rank_shiki', name: '識', reading: 'しき', desc: '調査・知識・文献・解明' },
    { key: 'rank_han', name: '判', reading: 'はん', desc: '解明宣言・看破・戦術判断' },
    { key: 'rank_shiya', name: '視野', reading: 'しや', desc: '怪異感知・観察・証言聴取' },
    { key: 'rank_jutsu', name: '術', reading: 'じゅつ', desc: '魔法行使・魔導具操作' },
    { key: 'rank_kon', name: '魂', reading: 'こん', desc: '侵食抵抗・信念維持・精神防御' },
];

// 背景（5種）— 選択で2能力値がC昇格+初期効果
const BACKGROUNDS = [
    { id: '鋼の肉体', upgrades: ['rank_tai', 'rank_haya'], effect: '護衛への初回攻撃に+1修正。戦術的な離脱判定+1' },
    { id: '学者肌', upgrades: ['rank_shiki', 'rank_han'], effect: '調査スペシャル時に解明鍵追加入手の可能性。古い文献の識判定+1' },
    { id: '霊媒体質', upgrades: ['rank_shiya', 'rank_kon'], effect: '怪異の気配感知+1。得意言語を1つ追加選択可（苦手追加なし）' },
    { id: '技術畑', upgrades: ['rank_jutsu', 'rank_shiki'], effect: '装備CP+2。魔導具の調整・修理判定+1' },
    { id: 'ストリート上がり', upgrades: ['rank_haya', 'rank_kon'], effect: 'NGT魔法判定に+1。闇市場での入手判定+2' },
    { id: '信仰者', upgrades: ['rank_kon', 'rank_han'], effect: '初期信念ポイント+1。浄化メーター上昇時に追加+1' },
];

// クラス（5種）— 選択で1能力値がB昇格+クラス特技
const CLASSES = [
    { id: '祓士', upgrade: 'rank_kon', effect: '浄化ギフトを1ランク低い覚醒段階から使用可能' },
    { id: '機甲士', upgrade: 'rank_tai', effect: '護衛への連鎖ダメージ条件が「耐久値以上」→「耐久値−2以上」に緩和' },
    { id: '魂使い', upgrade: 'rank_kon', effect: '侵食抵抗判定+1。ファンブル時の侵食率上昇を+10%に軽減' },
    { id: '解明師', upgrade: 'rank_han', effect: '解明完了宣言時に討伐クロック追加−1' },
    { id: '情報屋', upgrade: 'rank_shiki', effect: '怪異予兆カードの公開条件を1回だけ「任意のタイミング」に変更可' },
];

// 魔法言語（得意/苦手の対象7言語。Pは全員使用可能なので選択対象外）
const LANGUAGES = [
    { id: 'Igniscript', color: '赤', desc: '燃やす・爆発・熱変容', hex: '#ff4444' },
    { id: 'Lupis Surf', color: '青', desc: '流す・包む・圧力', hex: '#4488ff' },
    { id: 'Ivyo', color: '緑', desc: '育てる・自然サイクル', hex: '#44cc44' },
    { id: 'NGT', color: '黄', desc: '加速・電気的処理・情報解析', hex: '#ffcc00' },
    { id: 'Monyx', color: '無色', desc: '最小術式・汎用転用', hex: '#aaaaaa' },
    { id: 'P:', color: '紫', desc: '弱体化・妨害・封印（P派生）', hex: '#aa44ff' },
    { id: "P'", color: '桃', desc: '回復・強化・修復（P派生）', hex: '#ff88cc' },
];

const AFFILIATIONS = ['祓部', '傭兵', '無所属'];
const AWAKENINGS = ['先天覚醒型', 'ショック覚醒型', '実験覚醒型', '接触覚醒型'];
const EQUIPMENT_TYPES = ['武装型', '独立型', '半装身型', '全装身型', '搭乗型', '戦闘用搭乗型'];

// 所属特典の詳細（バランス調整済み）
const AFFILIATION_INFO = {
    '祓部': {
        bonus: '識の調査+1（3回/セッション）＋班ボーナス',
        constraint: '任務命令への服従が義務。装備・行動に法的制限。',
    },
    '傭兵': {
        bonus: '装備1ランクUP、二つ名+1（常時）＋系統ボーナス',
        constraint: '収益がないと活動困難。バック企業の方針に縛られる。',
    },
    '無所属': {
        bonus: '視野+1常時、裏ルート（1回/セッション）、改造センサー（1回/セッション）＋出自ボーナス',
        constraint: '法的保護なし。全組織から警戒される。補給ルート不安定。',
    },
};

// 所属サブカテゴリ
const SUB_AFFILIATIONS = {
    '祓部': [
        { id: '古怪班', desc: '古い怪異の専門部署。文献調査と封印管理', bonus: '一級・二級の古い怪異への識判定+2。禁足地知識判定+1' },
        { id: '新怪班', desc: '新規発生怪異への初動対応。SNS型・流行型に強い', bonus: 'SNS起源怪異への視野判定+1。ルール発動直後に視野再判定（1回/セッション）' },
        { id: '特務班', desc: '少数精鋭の実戦部隊。危険等級の現場に投入', bonus: '甲種怪異戦闘時、体/疾判定+1。援軍要請（1回/セッション）' },
        { id: '技術班', desc: '魔導具の整備・解析・現場支援', bonus: '装備の応急修理判定+2。味方の装備不具合を無効化（1回/セッション）' },
    ],
    '傭兵': [
        { id: '戦闘屋', desc: '正面火力で解決する。腕が商品', bonus: '護衛への初回攻撃+1。スペシャル時追加ダメージ+1' },
        { id: '調査屋', desc: '情報に値段をつける。解明が本業', bonus: '調査判定+1（常時）。NPCから追加情報引き出し（1回/セッション）' },
        { id: '運び屋', desc: '護衛と輸送の専門家。逃走のプロ', bonus: '疾判定+1（逃走・離脱時）。仲間1人へのダメージ1点肩代わり' },
        { id: '技術屋', desc: '装備のカスタムと現場修理が得意', bonus: '装備CP+2。オプション一時差し替え（1回/セッション）' },
    ],
    '無所属': [
        { id: '路地裏の犬', desc: 'スラムで生き延びた。暴力と飢えが教師', bonus: '体判定+1（素手・逃走）。NPCの嘘看破時、判/視野判定+1' },
        { id: 'はぐれ狼', desc: '流れの用心棒。一人で戦い続けてきた', bonus: '魂判定+1（単独行動時）。先行行動（イニシアチブ無視、1回/セッション）' },
        { id: '小さな群れ', desc: '仲間と生きる小規模クラン。信頼だけが武器', bonus: '信念ポイント+1。仲間隣接時、全判定+1' },
        { id: '脱走兵', desc: '祓部か企業の育成施設から逃げた。内部知識がある', bonus: '識+1（セッション2回まで）。企業製装備の弱点判定+1' },
    ],
};

// 覚醒パターン情報
const AWAKENING_INFO = {
    '先天覚醒型': { effect: '術または魂がランクCでスタート（背景とは別枠）', extra: null },
    'ショック覚醒型': { effect: '恨み/喪失に対する判定+1。初期信念ポイント+1', extra: null },
    '実験覚醒型': { effect: '怪異の気配に対する視野判定+1。初期侵食率+10%', extra: 'erosion' },
    '接触覚醒型': { effect: '視野判定に常時+1（怪異の気配への鋭敏さ）', extra: null },
};

const EROSION_STAGES = [
    { max: 25, name: '正常', color: '#88cc44', desc: '影響なし' },
    { max: 50, name: '変容の兆し', color: '#ffcc00', desc: '外見に軽微な変化。怪異の「声」が断片的に聞こえ始める' },
    { max: 75, name: '半化の影', color: '#ff8800', desc: '目に見える異形化。怪異の一部の能力が扱えるようになる' },
    { max: 99, name: '臨界', color: '#ff4444', desc: '重度の異形化。強力な異能が使用可能' },
    { max: 100, name: '怪異化', color: '#ff0000', desc: 'キャラクター終了。PCはGMが管理する怪異になる' },
];

// 初期値
const INITIAL = {
    author_name: '', visibility: '公開', image_url: '',
    character_name: '', title: '', age: '', gender: '',
    affiliation: '祓部', sub_affiliation: '', awakening: '先天覚醒型',
    background: '', class: '',
    // 7能力値ランク（全てDスタート）
    rank_tai: 'D', rank_haya: 'D', rank_shiki: 'D', rank_han: 'D',
    rank_shiya: 'D', rank_jutsu: 'D', rank_kon: 'D',
    // 得意/苦手言語
    proficient_languages: [], weak_languages: [],
    // 装備
    equipment_type: '武装型', equipment_name: '', equipment_maker: '', equipment_detail: '',
    // 侵食率・信念
    erosion_rate: 0, belief_points: 5,
    // ストーリー
    fate: '', backstory: '',
    related_anomalies: '', related_characters: '', related_factions: '',
};

// ===== コンポーネント =====

export default function CharacterForm({ editId = null, initialData = null }) {
    const { user } = useUser();
    const router = useRouter();
    const isEdit = !!editId;

    const [form, setForm] = useState(INITIAL);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    // 編集モード
    useEffect(() => {
        if (initialData) setForm(prev => ({ ...prev, ...initialData }));
    }, [initialData]);

    // ユーザー名自動セット
    useEffect(() => {
        if (user && !form.author_name && !isEdit) {
            setForm(prev => ({ ...prev, author_name: `@${user.username || user.firstName || 'user'}` }));
        }
    }, [user, isEdit]);

    const set = useCallback((key, val) => setForm(prev => ({ ...prev, [key]: val })), []);

    // 背景選択で2能力値をC昇格
    const selectedBg = BACKGROUNDS.find(b => b.id === form.background);
    // クラス選択で1能力値をB昇格
    const selectedClass = CLASSES.find(c => c.id === form.class);

    // 計算済みランクを取得（背景・クラスの昇格を反映）
    const getEffectiveRank = useCallback((abilityKey) => {
        let rank = form[abilityKey] || 'D';
        // 背景による昇格（D→C）
        if (selectedBg && selectedBg.upgrades.includes(abilityKey)) {
            if (rank === 'D') rank = 'C';
        }
        // クラスによる昇格（→B）
        if (selectedClass && selectedClass.upgrade === abilityKey) {
            const idx = RANKS.indexOf(rank);
            const bIdx = RANKS.indexOf('B');
            if (idx < bIdx) rank = 'B';
        }
        return rank;
    }, [form, selectedBg, selectedClass]);

    // 信念ポイント計算（背景・覚醒で+1の場合あり）
    const calcBeliefPoints = useCallback(() => {
        let pts = 5;
        if (form.background === '信仰者') pts += 1;
        if (form.awakening === 'ショック覚醒型') pts += 1;
        return pts;
    }, [form.background, form.awakening]);

    // 得意/苦手言語のトグル
    const toggleLanguage = useCallback((type, langId) => {
        setForm(prev => {
            const key = type === 'proficient' ? 'proficient_languages' : 'weak_languages';
            const otherKey = type === 'proficient' ? 'weak_languages' : 'proficient_languages';
            const current = [...(prev[key] || [])];
            const other = prev[otherKey] || [];
            if (current.includes(langId)) {
                return { ...prev, [key]: current.filter(l => l !== langId) };
            }
            if (current.length >= 3) return prev;
            if (other.includes(langId)) return prev; // 同じ言語を両方に選べない
            return { ...prev, [key]: [...current, langId] };
        });
    }, []);

    // 侵食段階
    const getErosionStage = (rate) => EROSION_STAGES.find(s => rate <= s.max) || EROSION_STAGES[4];
    const erosionStage = getErosionStage(form.erosion_rate);

    // 投稿処理
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.character_name.trim()) { setResult({ ok: false, msg: 'キャラ名は必須です' }); return; }
        if (!form.background) { setResult({ ok: false, msg: '背景を選択してください' }); return; }
        if (!form.class) { setResult({ ok: false, msg: 'クラスを選択してください' }); return; }

        const profLen = (form.proficient_languages || []).length;
        const weakLen = (form.weak_languages || []).length;
        if (profLen !== weakLen) { setResult({ ok: false, msg: `得意言語と苦手言語の数を揃えてください（現在: 得意${profLen} / 苦手${weakLen}）` }); return; }

        setSubmitting(true); setResult(null);
        try {
            // 計算済みランクを反映
            const payload = { ...form };
            ABILITIES.forEach(a => { payload[a.key] = getEffectiveRank(a.key); });
            payload.belief_points = calcBeliefPoints();
            delete payload.id; delete payload.created_at; delete payload.updated_at; delete payload.user_id;

            const method = isEdit ? 'PATCH' : 'POST';
            const body = isEdit
                ? { table: 'character_sheets', id: editId, data: payload }
                : { table: 'character_sheets', data: payload };

            const res = await fetch('/api/posts', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);

            setResult({ ok: true, msg: isEdit ? 'シートを更新しました！' : 'キャラクターシートを投稿しました！' });
            if (!isEdit) setForm(INITIAL);
            setTimeout(() => router.push(`/community/characters/${json.data?.id || editId}/`), 1500);
        } catch (err) {
            setResult({ ok: false, msg: `${isEdit ? '更新' : '投稿'}に失敗: ${err.message}` });
        } finally { setSubmitting(false); }
    };

    const affInfo = AFFILIATION_INFO[form.affiliation];
    const awkInfo = AWAKENING_INFO[form.awakening];

    // ===== ランクバッジのスタイル =====
    const rankBadgeStyle = (rank, isUpgraded = false) => ({
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '36px', height: '36px',
        fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-lg)', fontWeight: 700,
        background: isUpgraded ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.04)',
        border: isUpgraded ? '1px solid var(--accent-gold-border)' : 'var(--border-subtle)',
        color: rank === 'S' ? '#ff4444' : rank === 'A' ? '#ffcc00' : rank === 'B' ? 'var(--accent-gold)' : rank === 'C' ? '#88aacc' : 'var(--text-muted)',
    });

    return (
        <div className="container">
            <section className="section">
                <span className="section__title">// {isEdit ? 'EDIT' : 'CREATE'} — CHARACTER SHEET v2</span>
                <h1 className="section__heading">{isEdit ? 'キャラクターシートを編集' : 'キャラクターシートを作成'}</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
                    {isEdit ? 'シートの内容を修正できます。' : '討伐者のキャラクターシートを作成してコミュニティに共有しましょう。'}
                </p>
            </section>

            <form onSubmit={handleSubmit}>
                {/* SEC 0: メタ */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 0 — META</div>
                    <h2 style={S.sectionHeading}>メタ情報</h2>
                    <div style={S.row}>
                        <FormInput label="投稿者名" value={form.author_name} onChange={v => set('author_name', v)} placeholder="@ユーザー名" />
                        <FormSelect label="公開範囲" value={form.visibility} onChange={v => set('visibility', v)} options={['公開', '限定']} />
                        <FormInput label="キャラ画像URL（任意）" value={form.image_url} onChange={v => set('image_url', v)} placeholder="https://..." />
                    </div>
                </div>

                {/* SEC 1: 基本情報 */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 1 — IDENTITY</div>
                    <h2 style={S.sectionHeading}>基本情報</h2>
                    <div style={S.row}>
                        <FormInput label="キャラ名 *" value={form.character_name} onChange={v => set('character_name', v)} placeholder="例：黒崎 蓮" />
                        <FormInput label="二つ名（任意）" value={form.title} onChange={v => set('title', v)} placeholder="例：封印の名手" />
                    </div>
                    <div style={S.row}>
                        <FormInput label="年齢" value={form.age} onChange={v => set('age', v)} placeholder="例：24" />
                        <FormInput label="性別" value={form.gender} onChange={v => set('gender', v)} placeholder="自由記述" />
                        <FormSelect label="所属 *" value={form.affiliation} onChange={v => { set('affiliation', v); set('sub_affiliation', ''); }} options={AFFILIATIONS} />
                        <FormSelect label="覚醒パターン *" value={form.awakening} onChange={v => set('awakening', v)} options={AWAKENINGS} />
                    </div>
                    {/* 所属ボーナス */}
                    <div style={{ marginTop: 'var(--space-sm)', padding: '12px', background: 'rgba(0,0,0,0.3)', border: 'var(--border-subtle)' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', marginBottom: '6px' }}>{form.affiliation}の特性</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', marginBottom: '4px' }}>▸ {affInfo.bonus}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>▹ {affInfo.constraint}</div>
                    </div>

                    {/* 所属サブカテゴリ選択 */}
                    {SUB_AFFILIATIONS[form.affiliation] && (
                        <div style={{ marginTop: 'var(--space-lg)' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', marginBottom: 'var(--space-sm)' }}>
                                {form.affiliation === '祓部' ? '配属班 *' : form.affiliation === '傭兵' ? '系統 *' : '出自 *'}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
                                {SUB_AFFILIATIONS[form.affiliation].map(sub => {
                                    const selected = form.sub_affiliation === sub.id;
                                    return (
                                        <button key={sub.id} type="button"
                                            onClick={() => set('sub_affiliation', selected ? '' : sub.id)}
                                            style={{
                                                padding: '12px', textAlign: 'left', cursor: 'pointer',
                                                border: selected ? '1px solid var(--accent-gold-border)' : 'var(--border-subtle)',
                                                background: selected ? 'rgba(212, 175, 55, 0.08)' : 'rgba(0,0,0,0.2)',
                                                color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                transition: 'all 0.2s',
                                            }}>
                                            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--font-size-sm)', marginBottom: '4px', color: selected ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                                                {sub.id}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', lineHeight: 1.5 }}>{sub.desc}</div>
                                            <div style={{ fontSize: '10px', color: selected ? 'var(--accent-gold)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>▸ {sub.bonus}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 覚醒パターン情報 */}
                    <div style={{ marginTop: 'var(--space-sm)', padding: '12px', background: 'rgba(0,0,0,0.3)', border: 'var(--border-subtle)' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', marginBottom: '6px' }}>{form.awakening}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{awkInfo.effect}</div>
                        {awkInfo.extra === 'erosion' && (
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-danger)', marginTop: '4px' }}>⚠ 初期侵食率+10%</div>
                        )}
                    </div>
                </div>

                {/* SEC 2: 背景 */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 2 — BACKGROUND</div>
                    <h2 style={S.sectionHeading}>背景</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-lg)', fontStyle: 'italic' }}>
                        背景を選ぶと2つの能力値がランクDからCに昇格します。
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
                        {BACKGROUNDS.map(bg => {
                            const selected = form.background === bg.id;
                            const upgradeNames = bg.upgrades.map(k => ABILITIES.find(a => a.key === k)?.name).join('・');
                            return (
                                <button key={bg.id} type="button"
                                    onClick={() => set('background', selected ? '' : bg.id)}
                                    style={{
                                        padding: '14px', textAlign: 'left', cursor: 'pointer',
                                        border: selected ? '1px solid var(--accent-gold-border)' : 'var(--border-subtle)',
                                        background: selected ? 'rgba(212, 175, 55, 0.08)' : 'rgba(0,0,0,0.2)',
                                        color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        transition: 'all 0.2s',
                                    }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--font-size-md)', marginBottom: '4px', color: selected ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                                        {bg.id}
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', marginBottom: '4px' }}>
                                        {upgradeNames} → C昇格
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{bg.effect}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* SEC 3: クラス */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 3 — CLASS</div>
                    <h2 style={S.sectionHeading}>クラス</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-lg)', fontStyle: 'italic' }}>
                        クラスを選ぶと1つの能力値がランクBに昇格し、クラス特技が付与されます。
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
                        {CLASSES.map(cls => {
                            const selected = form.class === cls.id;
                            const upgradeName = ABILITIES.find(a => a.key === cls.upgrade)?.name;
                            return (
                                <button key={cls.id} type="button"
                                    onClick={() => set('class', selected ? '' : cls.id)}
                                    style={{
                                        padding: '14px', textAlign: 'left', cursor: 'pointer',
                                        border: selected ? '1px solid var(--accent-gold-border)' : 'var(--border-subtle)',
                                        background: selected ? 'rgba(212, 175, 55, 0.08)' : 'rgba(0,0,0,0.2)',
                                        color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        transition: 'all 0.2s',
                                    }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--font-size-md)', marginBottom: '4px', color: selected ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                                        {cls.id}
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', marginBottom: '4px' }}>
                                        {upgradeName} → B昇格
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{cls.effect}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* SEC 4: 能力値一覧（自動計算結果の表示） */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 4 — ABILITIES</div>
                    <h2 style={S.sectionHeading}>能力値ランク</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-lg)', fontStyle: 'italic' }}>
                        全能力値はDスタート。背景・クラスの選択で自動的に昇格します。
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
                        {ABILITIES.map(ability => {
                            const baseRank = 'D';
                            const effectiveRank = getEffectiveRank(ability.key);
                            const isUpgraded = effectiveRank !== baseRank;
                            const upgradeSource = [];
                            if (selectedBg && selectedBg.upgrades.includes(ability.key)) upgradeSource.push(`背景:${selectedBg.id}`);
                            if (selectedClass && selectedClass.upgrade === ability.key) upgradeSource.push(`クラス:${selectedClass.id}`);
                            return (
                                <div key={ability.key} style={{ padding: '14px', background: 'rgba(0,0,0,0.2)', border: isUpgraded ? '1px solid var(--accent-gold-border)' : 'var(--border-subtle)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <div>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-md)', fontWeight: 700 }}>{ability.name}</span>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginLeft: '8px' }}>({ability.reading})</span>
                                        </div>
                                        <span style={rankBadgeStyle(effectiveRank, isUpgraded)}>{effectiveRank}</span>
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>{ability.desc}</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                                        ダイス: {RANK_DICE[effectiveRank]}
                                    </div>
                                    {upgradeSource.length > 0 && (
                                        <div style={{ fontSize: '10px', color: 'var(--accent-gold)', marginTop: '4px' }}>
                                            ▲ {upgradeSource.join(' / ')}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {/* 信念ポイント表示 */}
                    <div style={{ marginTop: 'var(--space-lg)', padding: '12px', background: 'rgba(0,0,0,0.3)', border: 'var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', marginBottom: '4px' }}>信念ポイント (BELIEF)</div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>判定を振り直す、シーンに介入するなどの消費リソース</div>
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--accent-gold)' }}>{calcBeliefPoints()}</span>
                    </div>
                </div>

                {/* SEC 5: 得意/苦手言語 */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 5 — LANGUAGE</div>
                    <h2 style={S.sectionHeading}>得意言語・苦手言語</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-sm)', fontStyle: 'italic' }}>
                        得意と苦手は同じ数だけ選んでください（0〜3個ずつ）。P言語は全員が使用可能です。
                    </p>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: (form.proficient_languages || []).length === (form.weak_languages || []).length ? 'var(--accent-gold)' : 'var(--accent-danger)', marginBottom: 'var(--space-lg)' }}>
                        得意: {(form.proficient_languages || []).length} / 苦手: {(form.weak_languages || []).length}
                        {(form.proficient_languages || []).length === (form.weak_languages || []).length ? ' ✓ バランスOK' : ' — 数を揃えてください'}
                    </div>

                    {/* 得意言語 */}
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', marginBottom: 'var(--space-sm)' }}>得意言語（術判定+1）</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: 'var(--space-xl)' }}>
                        {LANGUAGES.map(lang => {
                            const selected = (form.proficient_languages || []).includes(lang.id);
                            const inWeak = (form.weak_languages || []).includes(lang.id);
                            return (
                                <button key={lang.id} type="button"
                                    onClick={() => toggleLanguage('proficient', lang.id)}
                                    disabled={inWeak}
                                    style={{
                                        padding: '10px 12px', textAlign: 'left', cursor: inWeak ? 'not-allowed' : 'pointer',
                                        border: selected ? `2px solid ${lang.hex}` : 'var(--border-subtle)',
                                        background: selected ? `${lang.hex}15` : inWeak ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.2)',
                                        color: selected ? lang.hex : inWeak ? 'var(--text-muted)' : 'var(--text-secondary)',
                                        opacity: inWeak ? 0.4 : 1,
                                        fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', transition: 'all 0.2s',
                                    }}>
                                    <div style={{ fontWeight: 700 }}>{lang.id} <span style={{ fontWeight: 400, fontSize: 'var(--font-size-xs)', color: lang.hex }}>({lang.color})</span></div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{lang.desc}</div>
                                </button>
                            );
                        })}
                    </div>

                    {/* 苦手言語 */}
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-danger)', marginBottom: 'var(--space-sm)' }}>苦手言語（術判定−1）</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                        {LANGUAGES.map(lang => {
                            const selected = (form.weak_languages || []).includes(lang.id);
                            const inProf = (form.proficient_languages || []).includes(lang.id);
                            return (
                                <button key={lang.id} type="button"
                                    onClick={() => toggleLanguage('weak', lang.id)}
                                    disabled={inProf}
                                    style={{
                                        padding: '10px 12px', textAlign: 'left', cursor: inProf ? 'not-allowed' : 'pointer',
                                        border: selected ? `2px solid var(--accent-danger)` : 'var(--border-subtle)',
                                        background: selected ? 'rgba(230, 57, 70, 0.1)' : inProf ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.2)',
                                        color: selected ? 'var(--accent-danger)' : inProf ? 'var(--text-muted)' : 'var(--text-secondary)',
                                        opacity: inProf ? 0.4 : 1,
                                        fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', transition: 'all 0.2s',
                                    }}>
                                    <div style={{ fontWeight: 700 }}>{lang.id}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* SEC 6: 装備 */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 6 — EQUIPMENT</div>
                    <h2 style={S.sectionHeading}>主力装備</h2>
                    <div style={S.row}>
                        <FormSelect label="装備種別" value={form.equipment_type} onChange={v => set('equipment_type', v)} options={EQUIPMENT_TYPES} />
                        <FormInput label="装備名" value={form.equipment_name} onChange={v => set('equipment_name', v)} placeholder="例：強化戦術銃【制式型】" />
                        <FormInput label="メーカー" value={form.equipment_maker} onChange={v => set('equipment_maker', v)} placeholder="例：蒼鉄機工" />
                    </div>
                    <FormTextArea label="装備の詳細・カスタム（任意）" value={form.equipment_detail} onChange={v => set('equipment_detail', v)} placeholder="改造内容、特殊機能、入手経緯、搭載オプションなど" />
                </div>

                {/* SEC 7: 侵食率 */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 7 — EROSION</div>
                    <h2 style={S.sectionHeading}>侵食率</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: erosionStage.color }}>{form.erosion_rate}%</span>
                        <div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: erosionStage.color, fontWeight: 700 }}>{erosionStage.name}</div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', maxWidth: '400px' }}>{erosionStage.desc}</div>
                        </div>
                    </div>
                    <input type="range" min={0} max={100} value={form.erosion_rate} onChange={e => set('erosion_rate', parseInt(e.target.value))}
                        style={{ width: '100%', accentColor: erosionStage.color }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                    </div>
                    {form.awakening === '実験覚醒型' && (
                        <div style={{ padding: '8px 12px', background: 'rgba(230, 57, 70, 0.08)', border: '1px solid rgba(230, 57, 70, 0.25)', marginTop: 'var(--space-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-danger)' }}>
                            ⚠ 実験覚醒型: 初期侵食率+10%（10%以上でスタートしてください）
                        </div>
                    )}
                </div>

                {/* SEC 8: 因縁・バックストーリー */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 8 — STORY</div>
                    <h2 style={S.sectionHeading}>因縁・バックストーリー</h2>
                    <FormTextArea label="因縁" value={form.fate} onChange={v => set('fate', v)} placeholder="何を失ったか、何を追っているか。この世界で戦い続ける理由。" />
                    <FormTextArea label="バックストーリー（任意）" value={form.backstory} onChange={v => set('backstory', v)} placeholder="キャラクターの過去、人間関係、転機となった出来事..." rows={6} />
                </div>

                {/* SEC 9: 関連リンク */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 9 — LINKS</div>
                    <h2 style={S.sectionHeading}>関連リンク</h2>
                    <div style={S.row}>
                        <FormInput label="関連怪異" value={form.related_anomalies} onChange={v => set('related_anomalies', v)} placeholder="TMP-??? / KAI-####" />
                        <FormInput label="関連キャラ" value={form.related_characters} onChange={v => set('related_characters', v)} placeholder="CHAR-???" />
                        <FormInput label="関連組織" value={form.related_factions} onChange={v => set('related_factions', v)} placeholder="FAC-???" />
                    </div>
                </div>

                {result && (
                    <div className="callout" style={{ marginBottom: 'var(--space-xl)', borderColor: result.ok ? 'var(--accent-gold)' : 'var(--accent-danger)' }}>
                        <div className="callout__label" style={{ color: result.ok ? 'var(--accent-gold)' : 'var(--accent-danger)' }}>{result.ok ? '投稿完了' : 'エラー'}</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{result.msg}</p>
                    </div>
                )}

                <button type="submit" style={S.submitBtn} disabled={submitting}
                    onMouseEnter={e => { e.target.style.background = 'rgba(212, 175, 55, 0.2)'; e.target.style.boxShadow = '0 0 30px var(--accent-gold-glow)'; }}
                    onMouseLeave={e => { e.target.style.background = S.submitBtn.background; e.target.style.boxShadow = 'none'; }}>
                    {submitting ? 'SUBMITTING...' : isEdit ? '▶ シートを更新' : '▶ キャラクターシートを投稿'}
                </button>
            </form>
        </div>
    );
}
