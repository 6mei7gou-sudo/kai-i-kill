// キャラクターシート投稿フォーム — v4.0 6軸スキルシステム対応
'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { S, FormSelect, FormInput, FormTextArea } from '@/components/FormFields';
import ImageUploader from '@/components/ImageUploader';
import '@/components/ImageUploader.css';
import { MANUFACTURER_NAMES, BASE_WEAPONS_BY_CATEGORY, CUSTOM_OPTIONS, findWeapon, findOption } from '@/data/weaponData';
import { CYBER_GRADES, CYBERNETICS, findCybernetic } from '@/data/cyberneticsData';
import { getAvailableSkills, getBackgroundSkill, getSkillTypeColor, getAxisColor } from '@/data/skillData';

// ===== 定数定義 =====

const RANKS = ['D', 'C', 'B', 'A', 'S'];
const RANK_DICE = { D: '1d6', C: '2d6', B: '3d6', A: '4d6', S: '4d6+特典' };

const ABILITIES = [
    { key: 'rank_tai', name: '体', reading: 'たい', desc: '格闘・突破・物理耐久' },
    { key: 'rank_haya', name: '疾', reading: 'はや', desc: '先手・回避・追跡' },
    { key: 'rank_shiki', name: '識', reading: 'しき', desc: '調査・知識・文献・解明' },
    { key: 'rank_han', name: '判', reading: 'はん', desc: '解明宣言・看破・戦術判断' },
    { key: 'rank_shiya', name: '察', reading: 'さつ', desc: '怪異感知・観察・証言聴取' },
    { key: 'rank_jutsu', name: '術', reading: 'じゅつ', desc: '魔法行使・魔導具操作' },
    { key: 'rank_kon', name: '魂', reading: 'こん', desc: '信念維持・精神防御' },
];

// 背景（6種）— 2能力値がC昇格 + 背景スキル自動取得
const BACKGROUNDS = [
    { id: '神社育ち', upgrades: ['rank_shiya', 'rank_kon'], desc: '禁足地のデータベースへのアクセス権。古い怪異の解明鍵①の難易度-1' },
    { id: '鋼の肉体', upgrades: ['rank_tai', 'rank_haya'], desc: '武装型・半装身型装備のCP+4。護衛への初回攻撃に+1修正' },
    { id: '都市伝説研究者', upgrades: ['rank_shiki', 'rank_han'], desc: '調査スペシャル時に解明鍵追加入手の可能性' },
    { id: '元実験体', upgrades: ['rank_kon'], desc: '魂C昇格。渇望の覚醒ギフトを1段階低コストで使用可能' },
    { id: 'ハッカー上がり', upgrades: ['rank_shiki', 'rank_haya'], desc: 'NGT魔法判定+1。独立型装備のCP+3' },
    { id: '魔道資格者', upgrades: ['rank_jutsu', 'rank_shiki'], desc: '選択した魔法言語の+1修正が2状況に拡張。怪異誘発の確率が1ランク改善' },
];

// 配属（所属に連動）— 1能力値がB昇格 + 配属スキル解放
const ASSIGNMENTS = {
    '祓部': [
        { id: '古怪班', upgrade: 'rank_shiki', desc: '古い怪異の調査・解明特化。伝承・禁足地の知識' },
        { id: '新怪班', upgrade: 'rank_shiya', desc: '現代型怪異の追跡・分析。SNS・デジタルメディア' },
        { id: '封印班', upgrade: 'rank_kon', desc: '禁足地の管理と特級怪異の封印。浄化の専門家' },
        { id: '機動班', upgrade: 'rank_tai', desc: '前線投入の実働部隊。直轄即応隊・広域機動班' },
    ],
    '傭兵': [
        { id: '突撃型', upgrade: 'rank_tai', desc: '火力と耐久の前衛。傭兵の花形' },
        { id: '偵察型', upgrade: 'rank_shiya', desc: '情報収集と戦場分析。目と耳の専門家' },
        { id: '技術型', upgrade: 'rank_jutsu', desc: '装備改造と魔法技術。後方支援' },
        { id: '護衛型', upgrade: 'rank_han', desc: '要人護衛と脅威評価。交渉と戦術判断の専門家' },
    ],
    '無所属': [
        { id: '野良討伐者', upgrade: 'rank_tai', desc: '組織に頼らず腕一本で戦う。生存特化' },
        { id: '裏社会の住人', upgrade: 'rank_han', desc: '情報網と人脈で勝負。交渉と策略' },
        { id: '在野研究者', upgrade: 'rank_shiki', desc: '独自に怪異を研究する学者肌' },
        { id: '退魔師', upgrade: 'rank_kon', desc: '独学で祓いの術を身につけた一匹狼' },
    ],
};

// 覚醒パターン
const AWAKENINGS = [
    { id: '先天覚醒型', desc: '生まれつき素養を持ち訓練で開花', effect: '術または魂がCでスタート（背景とは別枠）' },
    { id: 'ショック覚醒型', desc: '怪異に関わる強烈な体験が引き金', effect: '恨み/喪失に対する判定+1。初期信念+1' },
    { id: '実験覚醒型', desc: '人体実験で強制覚醒', effect: '察判定+1（怪異への過敏さ）' },
    { id: '接触覚醒型', desc: '怪異の核や特殊素材への長期接触', effect: '察判定に常時+1（怪異の気配への鋭敏さ）' },
];

// 武器型
const WEAPON_TYPES = [
    { id: '斬撃型', desc: '切れ味と手数', weapons: '刀・剣・斧・薙刀' },
    { id: '打撃型', desc: '一撃の破壊力', weapons: '槌・棍棒・鈍器' },
    { id: '射撃型', desc: '距離と精度', weapons: '銃器・弓・投擲武器' },
    { id: '魔導型', desc: '魔法との連携', weapons: '杖・魔導書・符術具' },
    { id: '体術型', desc: '素手の技巧', weapons: '格闘・武道・肉体強化' },
];

const AFFILIATIONS = ['祓部', '傭兵', '無所属'];
const EQUIPMENT_TYPES = ['武装型', '独立型', '半装身型', '搭乗型'];

const AFFILIATION_INFO = {
    '祓部': { bonus: '識の調査+2（3回/セッション）＋援軍要請1回', constraint: '任務命令への服従が義務。装備・行動に法的制限' },
    '傭兵': { bonus: '装備1ランクUP、二つ名+1（常時）', constraint: '収益がないと活動困難。バック企業の方針に縛られる' },
    '無所属': { bonus: '察+1常時、裏ルート（1回/セッション）', constraint: '法的保護なし。全組織から警戒。補給ルート不安定' },
};

// ギフト
const GIFTS = [
    { id: '鍵の直感', desc: '調査フェイズで1日1回、解明鍵のヒントをGMに求められる' },
    { id: '生還の意地', desc: 'HP0時、魂判定成功で1HP残して生存（1シナリオ1回）' },
    { id: '装備の鬼', desc: '武装型・半装身型装備の武器修正+1' },
    { id: 'ネットワーク', desc: '各都市に情報源NPC1人。1シナリオ1回情報提供' },
    { id: '怪異の残響', desc: '怪異の気配を感知。1シナリオ1回、護衛の特性を質問可' },
    { id: '魔法師の直感', desc: '術判定スペシャル時、怪異誘発判定を免除（1シナリオ2回）' },
];

// 魔法言語
const LANGUAGES = [
    { id: 'Igniscript', color: '赤', desc: '燃やす・爆発・熱変容', hex: '#ff4444' },
    { id: 'Lupis Surf', color: '青', desc: '流す・包む・圧力', hex: '#4488ff' },
    { id: 'Ivyo', color: '緑', desc: '育てる・自然サイクル', hex: '#44cc44' },
    { id: 'NGT', color: '黄', desc: '加速・電気的処理・情報解析', hex: '#ffcc00' },
    { id: 'Monyx', color: '無色', desc: '最小術式・汎用転用', hex: '#aaaaaa' },
    { id: 'P:', color: '紫', desc: '弱体化・妨害・封印（P派生）', hex: '#aa44ff' },
    { id: "P'", color: '桃', desc: '回復・強化・修復（P派生）', hex: '#ff88cc' },
];

// 初期値
const INITIAL = {
    author_name: '', visibility: '公開', thumbnail_url: '', icon_url: '', image_urls: ['', '', ''],
    character_name: '', title: '', age: '', gender: '',
    affiliation: '祓部', sub_affiliation: '', awakening: '先天覚醒型',
    background: '', weapon_type: '', gift: '',
    rank_tai: 'D', rank_haya: 'D', rank_shiki: 'D', rank_han: 'D',
    rank_shiya: 'D', rank_jutsu: 'D', rank_kon: 'D',
    stage_plus: [],
    skills: [],
    proficient_languages: [], weak_languages: [],
    equipment_type: '武装型', equipment_name: '', equipment_maker: '', equipment_detail: '', equipment_options: [],
    belief_points: 5,
    fate: '', backstory: '', brief_history: '',
    related_anomalies: '', related_characters: '', related_factions: '',
    cyber_grade: 'none',
    cybernetics: [{ name: '', part: '' }, { name: '', part: '' }, { name: '', part: '' }],
};

// 先天覚醒型の追加C昇格選択肢
const INNATE_CHOICES = ['rank_jutsu', 'rank_kon'];

// ===== コンポーネント =====

export default function CharacterForm({ editId = null, initialData = null }) {
    const { user } = useUser();
    const router = useRouter();
    const isEdit = !!editId;

    const [form, setForm] = useState(INITIAL);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [myGear, setMyGear] = useState([]);
    const [innateChoice, setInnateChoice] = useState('rank_jutsu');

    useEffect(() => {
        if (initialData) {
            setForm(prev => ({
                ...prev,
                ...initialData,
                skills: initialData.skills || [],
                stage_plus: initialData.stage_plus || [],
            }));
        }
    }, [initialData]);

    useEffect(() => {
        if (user && !form.author_name && !isEdit) {
            setForm(prev => ({ ...prev, author_name: `@${user.username || user.firstName || 'user'}` }));
        }
    }, [user, isEdit]);

    useEffect(() => {
        if (!user) return;
        fetch(`/api/posts?table=gear_posts&user_id=${user.id}`)
            .then(r => r.json())
            .then(res => { if (res.ok) setMyGear(res.data || []); })
            .catch(() => {});
    }, [user]);

    const set = useCallback((key, val) => setForm(prev => ({ ...prev, [key]: val })), []);

    // --- 選択状態 ---
    const selectedBg = BACKGROUNDS.find(b => b.id === form.background);
    const selectedAssignment = (ASSIGNMENTS[form.affiliation] || []).find(a => a.id === form.sub_affiliation);

    // --- ランク計算（背景→C、配属→B、覚醒→C） ---
    const getEffectiveRank = useCallback((abilityKey) => {
        let rank = 'D';
        // 背景によるC昇格
        if (selectedBg && selectedBg.upgrades.includes(abilityKey)) {
            rank = 'C';
        }
        // 先天覚醒型：術or魂がC（背景とは別枠）
        if (form.awakening === '先天覚醒型' && abilityKey === innateChoice) {
            if (RANKS.indexOf(rank) < RANKS.indexOf('C')) rank = 'C';
        }
        // 配属によるB昇格
        if (selectedAssignment && selectedAssignment.upgrade === abilityKey) {
            rank = 'B';
        }
        return rank;
    }, [form.awakening, innateChoice, selectedBg, selectedAssignment]);

    // --- 段階表示 ---
    const getStageDisplay = useCallback((abilityKey) => {
        const rank = getEffectiveRank(abilityKey);
        const hasPlus = (form.stage_plus || []).includes(abilityKey);
        if (hasPlus && rank !== 'S') return `${rank}+`;
        return rank;
    }, [getEffectiveRank, form.stage_plus]);

    // --- 信念ポイント ---
    const calcBeliefPoints = useCallback(() => {
        let pts = 5;
        if (form.awakening === 'ショック覚醒型') pts += 1;
        return pts;
    }, [form.awakening]);

    // --- 得意/苦手言語トグル ---
    const toggleLanguage = useCallback((type, langId) => {
        setForm(prev => {
            const key = type === 'proficient' ? 'proficient_languages' : 'weak_languages';
            const otherKey = type === 'proficient' ? 'weak_languages' : 'proficient_languages';
            const current = [...(prev[key] || [])];
            const other = prev[otherKey] || [];
            if (current.includes(langId)) return { ...prev, [key]: current.filter(l => l !== langId) };
            if (current.length >= 3 || other.includes(langId)) return prev;
            return { ...prev, [key]: [...current, langId] };
        });
    }, []);

    // --- 段階トグル ---
    const toggleStagePlus = useCallback((abilityKey) => {
        setForm(prev => {
            const current = [...(prev.stage_plus || [])];
            if (current.includes(abilityKey)) {
                return { ...prev, stage_plus: current.filter(k => k !== abilityKey) };
            }
            if (current.length >= 2) return prev;
            return { ...prev, stage_plus: [...current, abilityKey] };
        });
    }, []);

    // --- スキルトグル ---
    const toggleSkill = useCallback((skillId) => {
        setForm(prev => {
            const current = [...(prev.skills || [])];
            if (current.includes(skillId)) {
                return { ...prev, skills: current.filter(s => s !== skillId) };
            }
            if (current.length >= 2) return prev;
            return { ...prev, skills: [...current, skillId] };
        });
    }, []);

    // --- 取得可能スキル一覧 ---
    const availableSkills = useMemo(() => getAvailableSkills({
        affiliation: form.affiliation,
        assignment: form.sub_affiliation,
        awakening: form.awakening,
        weaponType: form.weapon_type,
    }), [form.affiliation, form.sub_affiliation, form.awakening, form.weapon_type]);

    const bgSkill = useMemo(() => getBackgroundSkill(form.background), [form.background]);

    // --- 投稿処理 ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.character_name.trim()) { setResult({ ok: false, msg: 'キャラ名は必須です' }); return; }
        if (!form.background) { setResult({ ok: false, msg: '背景を選択してください' }); return; }
        if (!form.sub_affiliation) { setResult({ ok: false, msg: '配属を選択してください' }); return; }
        if (!form.weapon_type) { setResult({ ok: false, msg: '武器型を選択してください' }); return; }

        const profLen = (form.proficient_languages || []).length;
        const weakLen = (form.weak_languages || []).length;
        if (profLen !== weakLen) { setResult({ ok: false, msg: `得意言語と苦手言語の数を揃えてください（得意${profLen} / 苦手${weakLen}）` }); return; }

        setSubmitting(true); setResult(null);
        try {
            const payload = { ...form };
            // 計算済みランクを反映
            ABILITIES.forEach(a => { payload[a.key] = getEffectiveRank(a.key); });
            payload.belief_points = calcBeliefPoints();
            // class列は空文字（後方互換）
            payload.class = null;
            if (!payload.linked_gear_id) payload.linked_gear_id = null;
            delete payload.id; delete payload.created_at; delete payload.updated_at; delete payload.user_id; delete payload.image_url;

            const method = isEdit ? 'PATCH' : 'POST';
            const body = isEdit
                ? { table: 'character_sheets', id: editId, data: payload }
                : { table: 'character_sheets', data: payload };

            const res = await fetch('/api/posts', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);

            // 新規作成時、装備が選択されていたら自動で武器投稿
            if (!isEdit && form.equipment_name && !form.linked_gear_id) {
                try {
                    const isCustom = form.equipment_name === '_custom';
                    const baseWeapon = isCustom ? null : findWeapon(form.equipment_name);
                    const actualBaseName = isCustom ? (form.custom_equipment_name || '自由装備') : form.equipment_name;
                    const optionsData = form.equipment_options.map(name => {
                        const o = findOption(name);
                        return o ? { name: o.name, cp: o.cp, resonance: o.resonance, risk: o.risk } : { name, cp: 0, resonance: '', risk: '低' };
                    });
                    const baseCp = baseWeapon ? baseWeapon.cp : 0;
                    const totalCp = baseCp + optionsData.reduce((s, o) => s + o.cp, 0);
                    const gearPayload = {
                        gear_name: `【${form.character_name}】の武器`,
                        category: form.equipment_type,
                        manufacturer: form.equipment_maker || (baseWeapon ? baseWeapon.maker : ''),
                        base_name: actualBaseName,
                        base_cp: baseCp,
                        slot_count: baseWeapon ? baseWeapon.slot : 0,
                        options: optionsData,
                        option_count: optionsData.length,
                        total_cp: totalCp,
                        risk_level: optionsData.some(o => o.risk === '高') ? '高' : optionsData.some(o => o.risk === '中') ? '中' : '低',
                        summary: form.equipment_detail || '',
                        visibility: form.visibility || '公開',
                    };
                    const gearRes = await fetch('/api/posts', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ table: 'gear_posts', data: gearPayload }),
                    });
                    const gearJson = await gearRes.json();
                    // 作成した武器をキャラクターに紐づけ
                    if (gearRes.ok && gearJson.data?.id && json.data?.id) {
                        await fetch('/api/posts', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                table: 'character_sheets',
                                id: json.data.id,
                                data: { linked_gear_id: gearJson.data.id },
                            }),
                        });
                    }
                } catch (gearErr) {
                    console.warn('武器自動投稿に失敗:', gearErr);
                }
            }

            setResult({ ok: true, msg: isEdit ? 'シートを更新しました！' : 'キャラクターシートを投稿しました！装備も自動投稿されました。' });
            if (!isEdit) setForm(INITIAL);
            setTimeout(() => router.push(`/community/characters/${json.data?.id || editId}/`), 1500);
        } catch (err) {
            setResult({ ok: false, msg: `${isEdit ? '更新' : '投稿'}に失敗: ${err.message}` });
        } finally { setSubmitting(false); }
    };

    // --- スタイル ---
    const cardStyle = (selected) => ({
        padding: '14px', textAlign: 'left', cursor: 'pointer',
        border: selected ? '1px solid var(--accent-gold-border)' : 'var(--border-subtle)',
        background: selected ? 'rgba(212, 175, 55, 0.08)' : 'rgba(0,0,0,0.2)',
        color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
        transition: 'all 0.2s',
    });
    const cardTitle = (selected) => ({
        fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--font-size-sm)',
        marginBottom: '4px', color: selected ? 'var(--accent-gold)' : 'var(--text-primary)',
    });
    const cardDesc = { fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.6 };
    const rankBadgeStyle = (rank, isUpgraded = false, hasPlus = false) => ({
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        minWidth: '40px', height: '36px', padding: '0 6px',
        fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-lg)', fontWeight: 700,
        background: isUpgraded ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.04)',
        border: isUpgraded ? '1px solid var(--accent-gold-border)' : hasPlus ? '1px solid rgba(100,200,255,0.3)' : 'var(--border-subtle)',
        color: rank === 'S' ? '#ff4444' : rank === 'A' ? '#ffcc00' : rank === 'B' ? 'var(--accent-gold)' : rank === 'C' ? '#88aacc' : 'var(--text-muted)',
    });
    const infoBox = { marginTop: 'var(--space-sm)', padding: '12px', background: 'rgba(0,0,0,0.3)', border: 'var(--border-subtle)' };
    const gridCards = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' };
    const sectionNote = { color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-lg)', fontStyle: 'italic' };

    return (
        <div className="container">
            <section className="section">
                <span className="section__title">// {isEdit ? 'EDIT' : 'CREATE'} — CHARACTER SHEET v4</span>
                <h1 className="section__heading">{isEdit ? 'キャラクターシートを編集' : 'キャラクターシートを作成'}</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
                    {isEdit ? 'シートの内容を修正できます。' : '討伐者のキャラクターシートを作成してコミュニティに共有しましょう。'}
                </p>
            </section>

            <form onSubmit={handleSubmit}>
                {/* ====== SEC 0: メタ ====== */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 0 — META</div>
                    <h2 style={S.sectionHeading}>メタ情報</h2>
                    <div style={S.row}>
                        <FormInput label="投稿者名" value={form.author_name} onChange={v => set('author_name', v)} placeholder="@ユーザー名" />
                        <FormSelect label="公開範囲" value={form.visibility} onChange={v => set('visibility', v)} options={['公開', '限定']} />
                    </div>
                    <div style={S.row}>
                        <ImageUploader label="サムネイル" value={form.thumbnail_url} onChange={v => set('thumbnail_url', v)} folder="characters" hint="推奨 3:4（600×800px）— 資格証・詳細ページのメイン画像" />
                        <ImageUploader label="アイコン" value={form.icon_url} onChange={v => set('icon_url', v)} folder="characters" compact hint="推奨 1:1（200×200px）— 一覧カード・SNS投稿の丸アイコン" />
                    </div>
                    <div style={S.row}>
                        {form.image_urls.map((url, i) => (
                            <ImageUploader key={i} label={`画像${i + 1}`} value={url} onChange={v => { const a = [...form.image_urls]; a[i] = v; set('image_urls', a); }} folder="characters" hint="推奨 16:9（例: 1200×675px）" />
                        ))}
                    </div>
                </div>

                {/* ====== SEC 1: 基本情報 ====== */}
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
                    </div>
                </div>

                {/* ====== SEC 2: 背景 ====== */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 2 — BACKGROUND</div>
                    <h2 style={S.sectionHeading}>背景 *</h2>
                    <p style={sectionNote}>背景を選ぶと2つの能力値がCに昇格し、背景スキルが自動で付きます。</p>
                    <div style={gridCards}>
                        {BACKGROUNDS.map(bg => {
                            const selected = form.background === bg.id;
                            const upgradeNames = bg.upgrades.map(k => ABILITIES.find(a => a.key === k)?.name).join('・');
                            const skill = getBackgroundSkill(bg.id);
                            return (
                                <button key={bg.id} type="button" onClick={() => set('background', selected ? '' : bg.id)} style={cardStyle(selected)}>
                                    <div style={cardTitle(selected)}>{bg.id}</div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', marginBottom: '4px' }}>
                                        {upgradeNames || '魂'} → C昇格
                                    </div>
                                    <div style={cardDesc}>{bg.desc}</div>
                                    {skill && (
                                        <div style={{ marginTop: '6px', fontSize: '10px', color: '#44cc88', fontFamily: 'var(--font-mono)' }}>
                                            自動スキル: {skill.id}（{skill.effect}）
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ====== SEC 3: 所属＋配属 ====== */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 3 — FACTION &amp; ASSIGNMENT</div>
                    <h2 style={S.sectionHeading}>所属・配属 *</h2>

                    {/* 所属選択 */}
                    <div style={{ marginBottom: 'var(--space-xl)' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', marginBottom: 'var(--space-sm)' }}>所属</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {AFFILIATIONS.map(aff => (
                                <button key={aff} type="button"
                                    onClick={() => { set('affiliation', aff); set('sub_affiliation', ''); }}
                                    style={{
                                        ...cardStyle(form.affiliation === aff),
                                        flex: '1', minWidth: '140px', textAlign: 'center',
                                    }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--font-size-md)', color: form.affiliation === aff ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                                        {aff}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div style={infoBox}>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', marginBottom: '4px' }}>▸ {AFFILIATION_INFO[form.affiliation].bonus}</div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>▹ {AFFILIATION_INFO[form.affiliation].constraint}</div>
                        </div>
                    </div>

                    {/* 配属選択 */}
                    <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', marginBottom: 'var(--space-sm)' }}>
                            {form.affiliation === '祓部' ? '配属班' : form.affiliation === '傭兵' ? '専門' : '流儀'} *
                        </div>
                        <div style={gridCards}>
                            {(ASSIGNMENTS[form.affiliation] || []).map(asn => {
                                const selected = form.sub_affiliation === asn.id;
                                const upgradeName = ABILITIES.find(a => a.key === asn.upgrade)?.name;
                                return (
                                    <button key={asn.id} type="button" onClick={() => set('sub_affiliation', selected ? '' : asn.id)} style={cardStyle(selected)}>
                                        <div style={cardTitle(selected)}>{asn.id}</div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: '#44aaff', marginBottom: '4px' }}>
                                            {upgradeName} → B昇格
                                        </div>
                                        <div style={cardDesc}>{asn.desc}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ====== SEC 4: 覚醒パターン ====== */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 4 — AWAKENING</div>
                    <h2 style={S.sectionHeading}>覚醒パターン *</h2>
                    <p style={sectionNote}>討伐者として覚醒した経緯。覚醒スキルが解放されます。</p>
                    <div style={gridCards}>
                        {AWAKENINGS.map(awk => {
                            const selected = form.awakening === awk.id;
                            return (
                                <button key={awk.id} type="button" onClick={() => set('awakening', awk.id)} style={cardStyle(selected)}>
                                    <div style={cardTitle(selected)}>{awk.id}</div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: '#aa44ff', marginBottom: '4px' }}>{awk.effect}</div>
                                    <div style={cardDesc}>{awk.desc}</div>
                                </button>
                            );
                        })}
                    </div>
                    {/* 先天覚醒型：術or魂の選択 */}
                    {form.awakening === '先天覚醒型' && (
                        <div style={{ ...infoBox, display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)' }}>C昇格する能力値:</span>
                            {INNATE_CHOICES.map(key => {
                                const ab = ABILITIES.find(a => a.key === key);
                                return (
                                    <button key={key} type="button" onClick={() => setInnateChoice(key)}
                                        style={{
                                            padding: '6px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700,
                                            background: innateChoice === key ? 'rgba(170,68,255,0.15)' : 'rgba(0,0,0,0.3)',
                                            border: innateChoice === key ? '1px solid rgba(170,68,255,0.4)' : 'var(--border-subtle)',
                                            color: innateChoice === key ? '#aa44ff' : 'var(--text-muted)', cursor: 'pointer',
                                        }}>
                                        {ab?.name}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ====== SEC 5: 武器型 ====== */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 5 — WEAPON TYPE</div>
                    <h2 style={S.sectionHeading}>武器型 *</h2>
                    <p style={sectionNote}>所属・配属・覚醒とは独立。どの組み合わせでも自由に選択できます。</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                        {WEAPON_TYPES.map(wt => {
                            const selected = form.weapon_type === wt.id;
                            return (
                                <button key={wt.id} type="button" onClick={() => set('weapon_type', selected ? '' : wt.id)} style={cardStyle(selected)}>
                                    <div style={{ ...cardTitle(selected), color: selected ? '#ff6644' : 'var(--text-primary)' }}>{wt.id}</div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: '#ff6644', marginBottom: '2px' }}>{wt.desc}</div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{wt.weapons}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ====== SEC 6: 能力値＋段階調整 ====== */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 6 — ABILITIES</div>
                    <h2 style={S.sectionHeading}>能力値ランク</h2>
                    <p style={sectionNote}>
                        全能力値はDスタート。背景・配属・覚醒で自動昇格。さらに2つの能力値に＋段階を付与できます。
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
                        {ABILITIES.map(ability => {
                            const effectiveRank = getEffectiveRank(ability.key);
                            const isUpgraded = effectiveRank !== 'D';
                            const hasPlus = (form.stage_plus || []).includes(ability.key);
                            const stageDisplay = getStageDisplay(ability.key);
                            const upgradeSource = [];
                            if (selectedBg && selectedBg.upgrades.includes(ability.key)) upgradeSource.push(`背景:${selectedBg.id}`);
                            if (form.awakening === '先天覚醒型' && ability.key === innateChoice) upgradeSource.push('覚醒:先天型');
                            if (selectedAssignment && selectedAssignment.upgrade === ability.key) upgradeSource.push(`配属:${selectedAssignment.id}`);
                            if (hasPlus) upgradeSource.push('+段階');
                            return (
                                <div key={ability.key} style={{ padding: '14px', background: 'rgba(0,0,0,0.2)', border: isUpgraded ? '1px solid var(--accent-gold-border)' : hasPlus ? '1px solid rgba(100,200,255,0.2)' : 'var(--border-subtle)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <div>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-md)', fontWeight: 700 }}>{ability.name}</span>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginLeft: '8px' }}>({ability.reading})</span>
                                        </div>
                                        <span style={rankBadgeStyle(effectiveRank, isUpgraded, hasPlus)}>{stageDisplay}</span>
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>{ability.desc}</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                                        ダイス: {RANK_DICE[effectiveRank]}{hasPlus ? '（達成値+1）' : ''}
                                    </div>
                                    {upgradeSource.length > 0 && (
                                        <div style={{ fontSize: '10px', color: 'var(--accent-gold)', marginTop: '4px' }}>
                                            ▲ {upgradeSource.join(' / ')}
                                        </div>
                                    )}
                                    {/* 段階トグル */}
                                    <button type="button" onClick={() => toggleStagePlus(ability.key)}
                                        style={{
                                            marginTop: '8px', padding: '3px 10px',
                                            fontFamily: 'var(--font-mono)', fontSize: '10px',
                                            background: hasPlus ? 'rgba(100,200,255,0.12)' : 'transparent',
                                            border: hasPlus ? '1px solid rgba(100,200,255,0.3)' : '1px dashed rgba(255,255,255,0.15)',
                                            color: hasPlus ? '#64c8ff' : 'var(--text-muted)',
                                            cursor: 'pointer',
                                        }}>
                                        {hasPlus ? '＋段階 ✓' : '＋段階'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: (form.stage_plus || []).length <= 2 ? 'var(--text-muted)' : 'var(--accent-danger)', marginTop: 'var(--space-sm)' }}>
                        +段階: {(form.stage_plus || []).length} / 2
                    </div>

                    {/* 信念ポイント */}
                    <div style={{ ...infoBox, marginTop: 'var(--space-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', marginBottom: '4px' }}>信念ポイント (BELIEF)</div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>判定を振り直す、シーンに介入するなどの消費リソース</div>
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--accent-gold)' }}>{calcBeliefPoints()}</span>
                    </div>
                </div>

                {/* ====== SEC 7: スキル選択 ====== */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 7 — SKILLS</div>
                    <h2 style={S.sectionHeading}>スキル選択</h2>
                    <p style={sectionNote}>
                        Lv1では2スロット。解放された軸のスキルから選択してください。背景スキルはスロット不要で自動取得されます。
                    </p>

                    {/* 背景スキル（自動取得） */}
                    {bgSkill && (
                        <div style={{ padding: '12px', background: 'rgba(68,204,136,0.06)', border: '1px solid rgba(68,204,136,0.2)', marginBottom: 'var(--space-lg)' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#44cc88', marginBottom: '4px' }}>自動取得（背景: {form.background}）</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-heading)' }}>{bgSkill.id}</div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>{bgSkill.effect}</div>
                        </div>
                    )}

                    {/* スロット残り */}
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: (form.skills || []).length <= 2 ? 'var(--accent-gold)' : 'var(--accent-danger)', marginBottom: 'var(--space-md)' }}>
                        スロット: {(form.skills || []).length} / 2
                    </div>

                    {/* スキル一覧 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
                        {availableSkills.filter(s => s.level <= 1).map(skill => {
                            const selected = (form.skills || []).includes(skill.id);
                            const axisColor = getAxisColor(skill.axis);
                            const typeColor = getSkillTypeColor(skill.type);
                            return (
                                <button key={skill.id} type="button" onClick={() => toggleSkill(skill.id)}
                                    style={{
                                        ...cardStyle(selected),
                                        borderColor: selected ? axisColor : undefined,
                                        background: selected ? `${axisColor}12` : 'rgba(0,0,0,0.2)',
                                    }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--font-size-sm)', color: selected ? axisColor : 'var(--text-primary)' }}>
                                            {skill.id}
                                        </span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '1px 6px', border: `1px solid ${typeColor}40`, color: typeColor }}>
                                            {skill.type}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '10px', color: axisColor, marginBottom: '2px', fontFamily: 'var(--font-mono)' }}>
                                        [{skill.axis}] {skill.attr}判定 Lv{skill.level}
                                    </div>
                                    <div style={cardDesc}>{skill.effect}</div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Lv2以上のスキルは参考表示 */}
                    {availableSkills.filter(s => s.level > 1).length > 0 && (
                        <details style={{ marginTop: 'var(--space-lg)' }}>
                            <summary style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                Lv2以降で取得可能なスキル（{availableSkills.filter(s => s.level > 1).length}種）
                            </summary>
                            <div style={{ ...gridCards, marginTop: 'var(--space-sm)' }}>
                                {availableSkills.filter(s => s.level > 1).map(skill => (
                                    <div key={skill.id} style={{ padding: '10px', background: 'rgba(0,0,0,0.15)', border: 'var(--border-subtle)', opacity: 0.6 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--font-size-xs)' }}>{skill.id}</span>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: getSkillTypeColor(skill.type) }}>{skill.type}</span>
                                        </div>
                                        <div style={{ fontSize: '10px', color: getAxisColor(skill.axis), fontFamily: 'var(--font-mono)' }}>
                                            [{skill.axis}] {skill.attr}判定 Lv{skill.level}
                                        </div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{skill.effect}</div>
                                    </div>
                                ))}
                            </div>
                        </details>
                    )}
                </div>

                {/* ====== SEC 8: ギフト ====== */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 8 — GIFT</div>
                    <h2 style={S.sectionHeading}>初期ギフト</h2>
                    <p style={sectionNote}>キャラクター作成時に1つ選択。覚醒段階は不要。</p>
                    <div style={gridCards}>
                        {GIFTS.map(gift => {
                            const selected = form.gift === gift.id;
                            return (
                                <button key={gift.id} type="button" onClick={() => set('gift', selected ? '' : gift.id)} style={cardStyle(selected)}>
                                    <div style={cardTitle(selected)}>{gift.id}</div>
                                    <div style={cardDesc}>{gift.desc}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ====== SEC 9: 魔法言語 ====== */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 9 — LANGUAGE</div>
                    <h2 style={S.sectionHeading}>得意言語・苦手言語</h2>
                    <p style={sectionNote}>得意と苦手は同じ数だけ選んでください（0〜3個ずつ）。P言語は全員使用可能。</p>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: (form.proficient_languages || []).length === (form.weak_languages || []).length ? 'var(--accent-gold)' : 'var(--accent-danger)', marginBottom: 'var(--space-lg)' }}>
                        得意: {(form.proficient_languages || []).length} / 苦手: {(form.weak_languages || []).length}
                        {(form.proficient_languages || []).length === (form.weak_languages || []).length ? ' ✓' : ' — 数を揃えてください'}
                    </div>

                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', marginBottom: 'var(--space-sm)' }}>得意言語（術判定+1）</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: 'var(--space-xl)' }}>
                        {LANGUAGES.map(lang => {
                            const selected = (form.proficient_languages || []).includes(lang.id);
                            const inWeak = (form.weak_languages || []).includes(lang.id);
                            return (
                                <button key={lang.id} type="button" onClick={() => toggleLanguage('proficient', lang.id)} disabled={inWeak}
                                    style={{
                                        padding: '10px 12px', textAlign: 'left', cursor: inWeak ? 'not-allowed' : 'pointer',
                                        border: selected ? `2px solid ${lang.hex}` : 'var(--border-subtle)',
                                        background: selected ? `${lang.hex}15` : inWeak ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.2)',
                                        color: selected ? lang.hex : inWeak ? 'var(--text-muted)' : 'var(--text-secondary)',
                                        opacity: inWeak ? 0.4 : 1, fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', transition: 'all 0.2s',
                                    }}>
                                    <div style={{ fontWeight: 700 }}>{lang.id} <span style={{ fontWeight: 400, fontSize: 'var(--font-size-xs)', color: lang.hex }}>({lang.color})</span></div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{lang.desc}</div>
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-danger)', marginBottom: 'var(--space-sm)' }}>苦手言語（術判定-1）</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                        {LANGUAGES.map(lang => {
                            const selected = (form.weak_languages || []).includes(lang.id);
                            const inProf = (form.proficient_languages || []).includes(lang.id);
                            return (
                                <button key={lang.id} type="button" onClick={() => toggleLanguage('weak', lang.id)} disabled={inProf}
                                    style={{
                                        padding: '10px 12px', textAlign: 'left', cursor: inProf ? 'not-allowed' : 'pointer',
                                        border: selected ? '2px solid var(--accent-danger)' : 'var(--border-subtle)',
                                        background: selected ? 'rgba(230, 57, 70, 0.1)' : inProf ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.2)',
                                        color: selected ? 'var(--accent-danger)' : inProf ? 'var(--text-muted)' : 'var(--text-secondary)',
                                        opacity: inProf ? 0.4 : 1, fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', transition: 'all 0.2s',
                                    }}>
                                    <div style={{ fontWeight: 700 }}>{lang.id}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ====== SEC 10: 装備 ====== */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 10 — EQUIPMENT</div>
                    <h2 style={S.sectionHeading}>主力装備</h2>
                    <div style={S.row}>
                        <FormSelect label="装備種別" value={form.equipment_type} onChange={v => { set('equipment_type', v); set('equipment_name', ''); }} options={EQUIPMENT_TYPES} />
                        <FormSelect label="メーカー" value={form.equipment_maker} onChange={v => set('equipment_maker', v)} options={MANUFACTURER_NAMES} />
                    </div>
                    <div style={S.fieldGroup}>
                        <label style={S.label}>装備名</label>
                        <select
                            value={form.equipment_name}
                            onChange={e => {
                                const name = e.target.value;
                                set('equipment_name', name);
                                const w = findWeapon(name);
                                if (w) set('equipment_maker', w.maker);
                            }}
                            style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.3)', border: 'var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }}
                        >
                            <option value="">— 装備を選択 —</option>
                            {(BASE_WEAPONS_BY_CATEGORY[form.equipment_type] || []).map(w => (
                                <option key={w.name} value={w.name}>{w.name}（{w.cp}CP / {w.maker}）</option>
                            ))}
                            <option value="_custom">自由入力…</option>
                        </select>
                    </div>
                    {form.equipment_name === '_custom' && (
                        <FormInput label="装備名（自由入力）" value={form.custom_equipment_name || ''} onChange={v => set('custom_equipment_name', v)} placeholder="装備名" />
                    )}
                    <FormTextArea label="装備の詳細・カスタム（任意）" value={form.equipment_detail} onChange={v => set('equipment_detail', v)} placeholder="改造内容、特殊機能、入手経緯など" />

                    {/* カスタムオプション選択 */}
                    <div style={{ marginTop: 'var(--space-lg)', padding: '16px', background: 'rgba(0,0,0,0.15)', border: 'var(--border-subtle)' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--accent-gold)', fontWeight: 700, marginBottom: '12px' }}>
                            カスタムオプション（任意）
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                            装備に搭載するカスタムオプションを選択。汎用は全装備共通、専用は装備種別に対応。
                        </p>
                        {Object.entries(CUSTOM_OPTIONS).map(([catName, opts]) => {
                            const isExclusive = catName.endsWith('専用');
                            const matchType = catName.replace('専用', '');
                            if (isExclusive && matchType !== form.equipment_type) return null;
                            return (
                                <div key={catName} style={{ marginBottom: '12px' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '4px' }}>
                                        {catName}
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {opts.map(opt => {
                                            const selected = form.equipment_options.includes(opt.name);
                                            return (
                                                <button key={opt.name} type="button"
                                                    onClick={() => {
                                                        if (selected) {
                                                            set('equipment_options', form.equipment_options.filter(n => n !== opt.name));
                                                        } else {
                                                            set('equipment_options', [...form.equipment_options, opt.name]);
                                                        }
                                                    }}
                                                    style={{
                                                        padding: '6px 10px', cursor: 'pointer', transition: 'all 0.2s',
                                                        border: selected ? '1px solid var(--accent-gold-border)' : 'var(--border-subtle)',
                                                        background: selected ? 'rgba(212, 175, 55, 0.12)' : 'rgba(0,0,0,0.3)',
                                                        color: selected ? 'var(--accent-gold)' : 'var(--text-secondary)',
                                                        fontFamily: 'var(--font-mono)', fontSize: '11px',
                                                    }}
                                                    title={`${opt.cp}CP / 修正:${opt.mod} / 共鳴:${opt.resonance} / リスク:${opt.risk}`}
                                                >
                                                    {opt.name}
                                                    <span style={{ marginLeft: '4px', fontSize: '10px', opacity: 0.7 }}>{opt.cp}CP</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                        {form.equipment_options.length > 0 && (
                            <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(212, 175, 55, 0.06)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>選択中のオプション</div>
                                {form.equipment_options.map(name => {
                                    const o = findOption(name);
                                    return o ? (
                                        <div key={name} style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', padding: '2px 0' }}>
                                            {o.name} — {o.cp}CP / 修正:{o.mod} / 共鳴:{o.resonance} / リスク:{o.risk}
                                        </div>
                                    ) : null;
                                })}
                                <div style={{ marginTop: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>
                                    オプション合計: {form.equipment_options.reduce((s, n) => { const o = findOption(n); return s + (o ? o.cp : 0); }, 0)}CP
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 投稿済み装備の紐づけ */}
                    <div style={{ marginTop: 'var(--space-lg)', padding: '16px', background: 'rgba(212, 175, 55, 0.04)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--accent-gold)', fontWeight: 700, marginBottom: '12px' }}>
                            投稿済み装備を連携
                        </div>
                        {myGear.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {myGear.map(g => {
                                    const isLinked = form.linked_gear_id === g.id;
                                    return (
                                        <div key={g.id} onClick={() => set('linked_gear_id', isLinked ? '' : g.id)}
                                            style={{
                                                padding: '10px 14px', cursor: 'pointer', transition: 'all 0.2s',
                                                background: isLinked ? 'rgba(212, 175, 55, 0.12)' : 'rgba(0,0,0,0.3)',
                                                border: isLinked ? '2px solid var(--accent-gold)' : 'var(--border-subtle)',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            }}>
                                            <div>
                                                <span style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: 'var(--font-size-sm)' }}>{g.gear_name}</span>
                                                <span style={{ marginLeft: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                                                    {g.category || ''} {g.manufacturer ? `/ ${g.manufacturer}` : ''}
                                                </span>
                                            </div>
                                            {isLinked && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', fontWeight: 700 }}>連携中</span>}
                                        </div>
                                    );
                                })}
                                {form.linked_gear_id && (
                                    <button type="button" onClick={() => set('linked_gear_id', '')}
                                        style={{ padding: '6px 12px', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', background: 'transparent', border: '1px solid rgba(255,77,77,0.3)', color: '#ff6666', cursor: 'pointer', alignSelf: 'flex-start' }}>
                                        連携を解除
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div style={{ padding: '16px', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
                                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '12px' }}>まだ装備を投稿していません</p>
                                <a href="/create/weapon/" target="_blank" style={{ display: 'inline-block', padding: '8px 20px', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', fontWeight: 700, background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--accent-gold-border)', color: 'var(--accent-gold)', textDecoration: 'none' }}>
                                    装備を新規投稿する
                                </a>
                            </div>
                        )}
                    </div>

                    {/* CP予算 */}
                    {(() => {
                        let cpBudget = 10;
                        if (form.background === '鋼の肉体' && (form.equipment_type === '武装型' || form.equipment_type === '半装身型')) cpBudget += 4;
                        if (form.background === 'ハッカー上がり' && form.equipment_type === '独立型') cpBudget += 3;

                        let usedCp = 0;
                        let cpSource = '';
                        const optionsCp = form.equipment_options.reduce((s, n) => { const o = findOption(n); return s + (o ? o.cp : 0); }, 0);
                        const linkedGear = form.linked_gear_id ? myGear.find(g => g.id === form.linked_gear_id) : null;
                        if (linkedGear && linkedGear.total_cp != null) {
                            usedCp = Number(linkedGear.total_cp);
                            cpSource = linkedGear.gear_name;
                        } else {
                            const selectedWeapon = form.equipment_name && form.equipment_name !== '_custom' ? findWeapon(form.equipment_name) : null;
                            if (selectedWeapon) { usedCp = Number(selectedWeapon.cp || 0); cpSource = selectedWeapon.name; }
                            usedCp += optionsCp;
                            if (optionsCp > 0) cpSource += ` +オプション${optionsCp}CP`;
                        }

                        const remaining = cpBudget - usedCp;
                        const pct = cpBudget > 0 ? Math.min(100, Math.max(0, (usedCp / cpBudget) * 100)) : 0;
                        const barColor = remaining < 0 ? 'var(--accent-danger)' : remaining <= 2 ? '#ffaa00' : 'var(--accent-gold)';

                        return (
                            <div style={{ marginTop: 'var(--space-sm)', padding: '12px', background: 'rgba(0,0,0,0.2)', border: 'var(--border-subtle)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: usedCp > 0 ? '8px' : 0 }}>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                                        装備CP予算
                                        {cpBudget > 10 && <span style={{ color: 'var(--accent-gold)', marginLeft: '4px' }}>(基本10 +背景{cpBudget - 10})</span>}
                                    </span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--accent-gold)' }}>{cpBudget}CP</span>
                                </div>
                                {usedCp > 0 && (
                                    <>
                                        <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, marginBottom: '6px' }}>
                                            <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 3, transition: 'width 0.3s' }} />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{cpSource}: {usedCp}CP</span>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', fontWeight: 700, color: barColor }}>
                                                {remaining >= 0 ? `残り ${remaining}CP` : `${Math.abs(remaining)}CP 超過`}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })()}
                </div>

                {/* ====== SEC 11: サイバネティクス ====== */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 11 — CYBERNETICS</div>
                    <h2 style={S.sectionHeading}>サイバネティクス（身体改造）</h2>
                    <p style={sectionNote}>任意。身体の一部を魔導機関で置換・増強する処置。等級が上がるほど強力だがリスクが増す。</p>
                    <div style={{ padding: '8px 12px', marginBottom: 'var(--space-md)', background: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.2)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: '#ff6666' }}>
                        一度施術すると取り外せません。慎重に選択してください。
                    </div>
                    <FormSelect label="改造等級" value={form.cyber_grade} onChange={v => set('cyber_grade', v)} options={CYBER_GRADES.map(g => g.id)} />
                    {form.cyber_grade !== 'none' && (() => {
                        const grade = CYBER_GRADES.find(g => g.id === form.cyber_grade);
                        const availList = [];
                        const gradeOrder = ['I', 'II', 'III'];
                        const gradeIdx = gradeOrder.indexOf(form.cyber_grade);
                        for (let i = 0; i <= gradeIdx; i++) {
                            (CYBERNETICS[gradeOrder[i]] || []).forEach(c => availList.push(c));
                        }
                        const usedCP = form.cybernetics.reduce((sum, c) => {
                            const found = findCybernetic(c.name);
                            return sum + (found ? found.cp : 0);
                        }, 0);
                        return (
                            <>
                                <div style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.3)', border: 'var(--border-subtle)', marginBottom: 'var(--space-md)', display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{grade.label}</span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', fontWeight: 700, color: usedCP > grade.cpLimit ? 'var(--accent-danger)' : 'var(--accent-gold)' }}>
                                        {usedCP} / {grade.cpLimit} CP
                                    </span>
                                </div>
                                {form.cybernetics.map((slot, i) => (
                                    <div key={i} style={{ marginBottom: 'var(--space-sm)', padding: '10px', background: 'rgba(0,0,0,0.2)', border: 'var(--border-subtle)' }}>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-gold)', marginBottom: '6px' }}>スロット {i + 1}</div>
                                        <select value={slot.name}
                                            onChange={e => {
                                                const name = e.target.value;
                                                const arr = [...form.cybernetics];
                                                const found = findCybernetic(name);
                                                arr[i] = { name, part: found ? found.part : '' };
                                                set('cybernetics', arr);
                                            }}
                                            style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: 'var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }}>
                                            <option value="">— 選択なし —</option>
                                            {availList.map(c => <option key={c.name} value={c.name}>{c.name}（{c.cp}CP / {c.part} / {c.maker}）</option>)}
                                        </select>
                                        {slot.name && (() => {
                                            const c = findCybernetic(slot.name);
                                            if (!c) return null;
                                            return <div style={{ marginTop: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>効果: {c.effect} · 共鳴: {c.resonance}</div>;
                                        })()}
                                    </div>
                                ))}
                            </>
                        );
                    })()}
                </div>

                {/* ====== SEC 12: 因縁・バックストーリー ====== */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 12 — STORY</div>
                    <h2 style={S.sectionHeading}>因縁・バックストーリー</h2>
                    <div style={S.fieldGroup}>
                        <label style={S.label}>簡略来歴（250文字以内） — 資格証の画像に表示されます</label>
                        <textarea
                            value={form.brief_history}
                            onChange={e => { if (e.target.value.length <= 250) set('brief_history', e.target.value); }}
                            maxLength={250}
                            placeholder="例：灰嶺市底澱出身。幼少期に怪異に家族を奪われ、独学で祓いの術を身につけた。祓部への入隊を拒み、裏社会の情報網を頼りに単独で怪異を追い続けている。「あの日の借りは、必ず返す」——それだけが、この街で生き延びる理由。"
                            style={{ width: '100%', minHeight: '80px', padding: '10px 12px', background: 'var(--bg-elevated)', border: 'var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', resize: 'vertical' }}
                        />
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: form.brief_history.length >= 230 ? '#ffaa00' : 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>
                            {form.brief_history.length} / 250
                        </div>
                    </div>
                    <FormTextArea label="因縁" value={form.fate} onChange={v => set('fate', v)} placeholder="何を失ったか、何を追っているか。この世界で戦い続ける理由。" />
                    <FormTextArea label="バックストーリー（任意）" value={form.backstory} onChange={v => set('backstory', v)} placeholder="キャラクターの過去、人間関係、転機となった出来事..." />
                </div>

                {/* ====== SEC 13: 関連リンク ====== */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 13 — LINKS</div>
                    <h2 style={S.sectionHeading}>関連リンク</h2>
                    <div style={S.row}>
                        <FormInput label="関連怪異" value={form.related_anomalies} onChange={v => set('related_anomalies', v)} placeholder="TMP-??? / KAI-####" />
                        <FormInput label="関連キャラ" value={form.related_characters} onChange={v => set('related_characters', v)} placeholder="CHAR-???" />
                        <FormInput label="関連組織" value={form.related_factions} onChange={v => set('related_factions', v)} placeholder="FAC-???" />
                    </div>
                </div>

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
                    {submitting ? 'SUBMITTING...' : isEdit ? '▶ シートを更新' : '▶ キャラクターシートを投稿'}
                </button>
            </form>
        </div>
    );
}
