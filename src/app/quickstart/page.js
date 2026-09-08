// クイックスタート — Webゲーム向けガイド
// 「この世界」→「RPシートを作る」→「ゲームデータの読み方・作り方」→「Webゲームの遊び方」→「成長」
// 背景・配属・ギフト等の表は src/data/characterBuildData.js から生成する（作成フォームと同じ定義）。
// TRPG卓向けの判定手順・戦闘ルールは扱わない（それらは docs/rules/ のルールブックの領分）。
import Link from 'next/link';
import {
    ABILITIES, RANKS, RANK_COLOR,
    AFFILIATIONS, AFFILIATION_INFO, BACKGROUNDS, ASSIGNMENTS, AWAKENINGS, GIFTS, LANGUAGES,
    GAME_DATA_STEPS, RP_SHEET_STEPS, SKILL_SLOTS_BY_LEVEL, STAGE_PLUS_MAX, BASE_CP_BUDGET,
    abilityName, assignmentLabel,
} from '@/data/characterBuildData';
import { computeRanks } from '@/lib/characterBuild';
import { getBackgroundSkill } from '@/data/skillData';
import { COMBAT_STYLE_NAMES, COMBAT_STYLE_STATS, EQUIPMENT_FORM_NAMES, EQUIPMENT_FORM_STATS, ORIGIN_NAMES, ORIGIN_TIER } from '@/data/weaponData';
import { MISSION_CP, ADV_CP, DISPATCH_CP } from '@/lib/cpService';

export const metadata = {
    title: 'クイックスタート — 電脳怪異譚 KAI-I//KILL',
    description: '最低限の世界設定、RPシートの作り方、ゲームデータ（七つの能力値・ランク・スキル・装備）の読み方と作り方、Webゲーム（討伐シミュレーション・怪異譚アドベンチャー・派遣クエスト）の遊び方。',
};

// ===== 世界設定の最小セット（正本：docs/player/world_bible.md。秘匿情報は含めない） =====
const WORLD_BASICS = [
    { title: '舞台は近未来の架空日本', body: '地名も地図も現実とは違うが、文化と民俗は日本のもの。表層はサイバーパンクな情報社会で、魔法はガスや電気と同じインフラとして資格制度と安全基準のもとに使われている。' },
    { title: '怪異は「噂が実体化したバグ」', body: '噂・言説・信念が臨界を超えると、現実にバグとして出力される。それが怪異。信じる人間が増えるほど強くなる。オカルトの噂話は怪異の燃料だ。' },
    { title: '怪異の存在は秘匿されている', body: '一般人にも怪異は見えるし触れる。ただし話しても誰も信じない。幻覚と笑われ、ストレスと処理され、SNSでは創作扱いになる。' },
    { title: '怪異は必ず「核」と「ルール」を持つ', body: '核は物・場所・記録媒体に宿り、壊せば怪異は消える。ルールは人を害する条件で、破るほど捕捉される。だから討伐者は「調べて、暴いて、討つ」。' },
    { title: '討伐は免許制', body: '魔導省が管轄し、実務は祓部が担う。素養検査と講習を経て免許を取れば討伐者。無免許の討伐は犯罪だ。日常業務の大半は五級怪異の駆除で、三級以上は祓部の管理案件になる。' },
    { title: '討伐者は三種類', body: '祓部（魔導省の公的機関。訓練と装備は最高だが縛りも多い）、傭兵（《Anonymous》に登録したライセンス持ち。本業は問わない）、無所属（免許を取れない事情を抱え、組織に「属せない」者）。企業所属のPCは作れない。' },
    { title: '魔法はチートコード、異能はアプリ', body: '魔法は素養と訓練で覚え、世界のソースコードに介入する。再現性は高いが、大きな魔法ほど怪異を生む。異能は執着や体験から内側に生まれ、使うほど使用者が怪異に近づく。PCが持てるのは魔法だけ。' },
    { title: '装備は魔導具', body: '手持ちの武装型から搭乗型まで形態はさまざま。国家系の蒼鉄機工（安全重視・祓部標準）と独立系の雷禽重工（高出力・傭兵向け）が二大メーカーで、鴉羽技研の違法改造品や銀鎚精機の専用機も流通している。' },
    { title: '素養は3〜4割に眠っているが、開花するのは一握り', body: '生まれつき（先天）、強烈な体験（ショック）、人体実験（実験）、核や特殊素材への長期接触（接触）。覚醒の経緯が討伐者の過去を決める。' },
    { title: '五つの管区', body: '東の灰嶺市（かいれいし）は最大都市圏で怪異最多。中の千隼市（ちはやし）に魔導省本庁と祓部中央本部。西の錆ヶ浜（さびがはま）は傭兵の街。北は禁足地が密集する山岳、南は孤立した島々。' },
];

// ===== サンプルキャラ（ランクの決まり方の例） =====
const SAMPLE = {
    character_name: '黒崎 蓮',
    affiliation: '傭兵', sub_affiliation: '突撃型',
    background: '鋼の肉体', awakening: '先天覚醒型', weapon_type: '斬撃型',
    stage_plus: ['rank_tai', 'rank_shiya'],
};
const SAMPLE_RANKS = computeRanks(SAMPLE, { innateChoice: 'rank_jutsu' });

// ===== Webゲームでの能力値の使われどころ（正本：src/lib/gameEngine.js・docs/specs/game_engine_spec.md） =====
const ABILITY_IN_GAME = {
    rank_tai:   'HPの土台。ランクが高いほど耐えられる（D+0 / C+2 / B+4 / A+6 / S+8）',
    rank_haya:  'ミッションの行動順（イニシアチブ）。先に動けるかどうか',
    rank_shiki: 'ミッションの通常攻撃。護衛と核を殴る判定はこれ',
    rank_han:   'アドベンチャーで「判断力が要る選択肢」を解放する',
    rank_shiya: 'アドベンチャーで「気配に気づく選択肢」を解放する',
    rank_jutsu: 'ミッションの魔法攻撃。通常攻撃より当てやすいが渇望が溜まる',
    rank_kon:   'スキルの多くが魂で判定される。精神系の選択肢の解放にも',
};

// 覚醒パターン・背景がWebゲームに与える影響（正本：src/lib/characterBuild.js・src/lib/gameEngine.js）
const AWAKENING_IN_GAME = {
    '先天覚醒型': '術または魂がCでスタート（背景とは別枠）',
    'ショック覚醒型': '信念ポイント+1（回復に使える回数が増える）',
    '実験覚醒型': '数値への影響なし。覚醒スキルが解放される',
    '接触覚醒型': '数値への影響なし。覚醒スキルが解放される',
};
const BACKGROUND_IN_GAME = {
    '鋼の肉体': 'HP+2、初回攻撃+1。武装型・半装身型ならCP予算+4',
    'ハッカー上がり': '独立型ならCP予算+3',
};

// レベルアップに必要なCP（正本：src/app/api/games/levelup/route.js。プレイヤーキャラの上限はLv5）
const LEVELUP_CP = [[1, 2, 100], [2, 3, 150], [3, 4, 250], [4, 5, 400]];
const PL_MAX_LEVEL = 5;

// ===== 小物 =====
const th = (w) => (w ? { width: w } : undefined);
const nameCell = { fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' };
const monoGold = { fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)' };
const cardBox = { background: 'var(--bg-card)', padding: 'var(--space-lg)', border: 'var(--border-subtle)', marginBottom: 'var(--space-md)' };
const stepLabel = { fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' };
const stepDesc = { color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8, marginBottom: 'var(--space-md)' };

function SectionHead({ no, title, en }) {
    return (
        <section className="section">
            <div className="section__number">{no} — {en}</div>
            <h2 className="section__heading">{title}<span className="section__heading-en">{en}</span></h2>
        </section>
    );
}

function StepCard({ no, en, title, children, desc }) {
    return (
        <div style={cardBox}>
            <div style={stepLabel}>STEP {no} — {en}</div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>{title}</h3>
            {desc && <p style={stepDesc}>{desc}</p>}
            {children}
        </div>
    );
}

function Table({ head, rows, widths = [] }) {
    return (
        <div className="content-body" style={{ marginBottom: 'var(--space-md)' }}>
            <table>
                <thead><tr>{head.map((h, i) => <th key={i} style={th(widths[i])}>{h}</th>)}</tr></thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={i}>{r.map((c, j) => <td key={j} style={j === 0 ? nameCell : undefined}>{c}</td>)}</tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function Callout({ label, children, danger }) {
    return (
        <div className="callout" style={{ marginBottom: 'var(--space-lg)', ...(danger ? { borderColor: 'var(--accent-danger)' } : {}) }}>
            {label && <div className="callout__label" style={danger ? { color: 'var(--accent-danger)' } : undefined}>{label}</div>}
            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>{children}</div>
        </div>
    );
}

function GameCard({ href, en, title, tagline, children }) {
    return (
        <div style={{ ...cardBox, borderLeft: '3px solid var(--accent-gold)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap', marginBottom: 'var(--space-xs)' }}>
                <div>
                    <div style={stepLabel}>{en}</div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', margin: 0 }}>{title}</h3>
                </div>
                <Link href={href} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', textDecoration: 'none' }}>→ 遊ぶ</Link>
            </div>
            <p style={stepDesc}>{tagline}</p>
            {children}
        </div>
    );
}

const slotTable = [1, 2, 3, 4, 5].map(lv => [`Lv${lv}`, `${SKILL_SLOTS_BY_LEVEL[lv]}`, lv % 5 === 0 ? '+1' : '—']);
const gameSteps = GAME_DATA_STEPS.filter(s => s.key !== 'cybernetics');

export default function QuickstartPage() {
    return (
        <div className="container">
            {/* ページヘッダー */}
            <div className="page-header">
                <div className="page-header__badge">QUICKSTART GUIDE</div>
                <h1 className="page-header__title">クイックスタート</h1>
                <div className="page-header__subtitle">電脳怪異譚　KAI-I//KILL — Webゲーム・ハンドブック</div>
            </div>

            <Callout>
                はじめてこのサイトで遊ぶ人向けのガイド。
                <strong style={{ color: 'var(--text-primary)' }}>RPシート</strong>（名前・立場・見た目・来歴）を作ればSNSと投稿に参加できる。
                <strong style={{ color: 'var(--text-primary)' }}>ゲームデータ</strong>を付ければ、討伐シミュレーション・怪異譚アドベンチャー・派遣クエストで遊べる。
                所要時間は前者が5分、後者が15分。
            </Callout>

            {/* ===== 00 この世界 ===== */}
            <SectionHead no="00" title="最低限これだけ知っておけばいい" en="THIS WORLD" />
            <div style={{ marginBottom: 'var(--space-3xl)' }}>
                <p className="section__desc" style={{ marginBottom: 'var(--space-lg)' }}>
                    世界観バイブルを読まなくてもキャラクターは作れる。遊び始める前に押さえておくのは、この{WORLD_BASICS.length}項目だけでいい。
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '8px', marginBottom: 'var(--space-lg)' }}>
                    {WORLD_BASICS.map((w, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', padding: '12px 14px', background: 'var(--bg-card)', border: 'var(--border-subtle)', borderLeft: '3px solid var(--accent-gold)' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--accent-gold)', lineHeight: 1.2 }}>{String(i + 1).padStart(2, '0')}</div>
                            <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-heading)', marginBottom: '4px' }}>{w.title}</div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{w.body}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <Callout>
                    <strong style={{ color: 'var(--text-primary)' }}>あなたは、その怪異と向き合う討伐者の一人だ。</strong>英雄でも超人でもない。
                    もっと知りたくなったら <Link href="/world/" style={{ color: 'var(--accent-gold)' }}>世界観バイブル</Link>、地名や固有名詞は <Link href="/glossary/" style={{ color: 'var(--accent-gold)' }}>用語集</Link>、怪異の等級は <Link href="/anomalies/about/" style={{ color: 'var(--accent-gold)' }}>怪異・能力・装備</Link> へ。
                </Callout>
            </div>

            {/* ===== 2つの遊び方 ===== */}
            <SectionHead no="START" title="2つの遊び方" en="TWO WAYS TO PLAY" />
            <div className="card-grid" style={{ marginBottom: 'var(--space-3xl)' }}>
                <Link href="/create/character/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card">
                        <div className="card__icon">☖</div>
                        <div className="card__title-en">RP SHEET — 5 MIN</div>
                        <h3 className="card__title">RPシートだけで遊ぶ</h3>
                        <p className="card__desc">キャラ名と所属、外見・性格・口調、来歴。戦闘数値は一切なし。SNS〈MIRRORLINE〉・投稿・ロールプレイ中心の遊び方。<span className="text-gold">→ 01章</span></p>
                    </div>
                </Link>
                <Link href="/create/character/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card">
                        <div className="card__icon">✦</div>
                        <div className="card__title-en">GAME DATA — 15 MIN</div>
                        <h3 className="card__title">ゲームデータを付けてWebゲームで遊ぶ</h3>
                        <p className="card__desc">背景・配属・戦闘流派を選ぶだけで七つの能力値が決まる。そのキャラで討伐に出撃し、CPを稼いで成長させる。<span className="text-gold">→ 02〜05章</span></p>
                    </div>
                </Link>
                <Link href="/quickstart/character-guide/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card">
                        <div className="card__icon">△</div>
                        <div className="card__title-en">GUIDELINE — READ FIRST</div>
                        <h3 className="card__title">作る前に確認する</h3>
                        <p className="card__desc">作れるキャラクター・作れないキャラクター、動機の型。PCは怪異と戦う討伐者の一人であり、英雄でも超人でもない。<span className="text-gold">→ 製作ガイドライン</span></p>
                    </div>
                </Link>
            </div>

            {/* ===== 01 RPシート ===== */}
            <SectionHead no="01" title="RPシートを作る" en="RP SHEET" />
            <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <p className="section__desc" style={{ marginBottom: 'var(--space-lg)' }}>
                    RPシートは「そのキャラクターが誰で、どう振る舞うか」だけを書く簡易シート。
                    <span className="text-gold">キャラ名があれば投稿できる。</span>ほかの項目は思いついた順に埋めればいい。
                </p>
                {RP_SHEET_STEPS.map(s => (
                    <div key={s.no} style={{ ...cardBox, display: 'grid', gridTemplateColumns: '44px 1fr', gap: 'var(--space-md)', alignItems: 'start', padding: 'var(--space-md) var(--space-lg)' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--accent-gold)', lineHeight: 1 }}>{s.no}</div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                <h3 style={{ fontSize: 'var(--font-size-md)', margin: 0 }}>{s.title}</h3>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>{s.en}</span>
                            </div>
                            <p style={{ ...stepDesc, marginBottom: 0 }}>{s.desc}</p>
                        </div>
                    </div>
                ))}
                <Callout label="書き方のコツ：">
                    <p><span className="text-gold">1. 動機を1つ</span> — 喪失・使命・贖罪・知的欲求・生存・復讐・保護・自分への恐怖。なぜ怪異と戦うのかが1行あれば動ける</p>
                    <p><span className="text-gold">2. 弱点を1つ</span> — 何かが欠けていて、仲間が必要な理由がある</p>
                    <p><span className="text-gold">3. 目を引く特徴を1つ</span> — 外見でも口癖でもいい。全員が覚えられる記号</p>
                    <p style={{ marginTop: 'var(--space-sm)' }}>作れるキャラクター・作れないキャラクターは <Link href="/quickstart/character-guide/" style={{ color: 'var(--accent-gold)' }}>キャラクター製作ガイドライン</Link> を確認すること。</p>
                </Callout>
                <Table head={['所属', '立ち位置', '配属の系統']} rows={AFFILIATIONS.map(a => [a, AFFILIATION_INFO[a].tagline, `${assignmentLabel(a)}：${ASSIGNMENTS[a].map(x => x.id).join('・')}`])} />
                <Table head={['覚醒パターン', '討伐者になった経緯', 'ゲームデータへの影響']} rows={AWAKENINGS.map(a => [a.id, a.desc, AWAKENING_IN_GAME[a.id]])} />
            </div>

            {/* ===== 02 ゲームデータの読み方 ===== */}
            <SectionHead no="02" title="ゲームデータの読み方" en="HOW TO READ" />
            <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <p className="section__desc" style={{ marginBottom: 'var(--space-lg)' }}>
                    ゲームデータの中心は<span className="text-gold">七つの能力値</span>と、それぞれの<span className="text-gold">ランク（D〜S）</span>。
                    ランクが高いほどWebゲームでの判定に成功しやすく、解放される選択肢が増える。細かい計算はサイトが自動でやるので、覚えるのは「どの能力値が何に効くか」と「ランクがどう決まるか」だけでいい。
                </p>

                {/* 2-1 能力値 */}
                <StepCard no="2-1" en="SEVEN STATS" title="七つの能力値とWebゲームでの役割" desc="全てランクDからスタートし、背景・配属・覚醒パターンで引き上げる。ランクは D → C → B → A → S の5段階。">
                    <Table head={['能力値', '読み', 'イメージ', 'Webゲームでの使われどころ']} widths={['70px', '80px']}
                        rows={ABILITIES.map(a => [
                            <span key="n" style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: 'var(--font-size-lg)' }}>{a.name}</span>,
                            a.reading,
                            a.desc,
                            ABILITY_IN_GAME[a.key],
                        ])} />
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>ランク：</span>
                        {RANKS.map((r, i) => (
                            <span key={r} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--font-size-md)', color: RANK_COLOR[r], padding: '2px 10px', border: `1px solid ${RANK_COLOR[r]}55`, background: `${RANK_COLOR[r]}12` }}>{r}</span>
                                {i < RANKS.length - 1 && <span style={{ color: 'var(--text-muted)' }}>→</span>}
                            </span>
                        ))}
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginLeft: '6px' }}>右ほど強い。作成時の上限はB、Aから先は成長で到達する</span>
                    </div>
                </StepCard>

                {/* 2-2 ランクの決まり方 */}
                <StepCard no="2-2" en="HOW RANKS ARE SET" title="ランクの決まり方" desc="能力値のランクは自分で数字を振り分けるのではなく、3つの選択から自動的に決まる。作成フォームでは選ぶたびに「どこから昇格したか」が表示される。">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', marginBottom: 'var(--space-lg)' }}>
                        {[
                            { t: '全能力値 D', c: 'var(--text-muted)', d: '7つすべてがランクDから始まる' },
                            { t: '背景 → 2つがC', c: 'var(--accent-gold)', d: '出自に応じて2つの能力値がCに昇格' },
                            { t: '配属 → 1つがB', c: '#44aaff', d: '所属内の役割に応じて1つがBに昇格' },
                            { t: '先天覚醒 → 術か魂がC', c: '#aa44ff', d: '先天覚醒型だけ。背景とは別枠' },
                            { t: `+段階 → ${STAGE_PLUS_MAX}つ`, c: '#64c8ff', d: '好きな能力値に+段階（判定に+1）' },
                        ].map((b, i) => (
                            <div key={i} style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${b.c}55`, borderLeft: `3px solid ${b.c}` }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', fontWeight: 700, color: b.c, marginBottom: '4px' }}>{i > 0 ? `${i}. ` : ''}{b.t}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{b.d}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ ...stepLabel, marginBottom: 'var(--space-sm)' }}>例：{SAMPLE.character_name} — 背景「{SAMPLE.background}」× {SAMPLE.affiliation}「{SAMPLE.sub_affiliation}」× {SAMPLE.awakening}（術）× +段階（体・察）</div>
                    <div className="content-body" style={{ marginBottom: 'var(--space-md)' }}>
                        <table>
                            <thead>
                                <tr>{ABILITIES.map(a => <th key={a.key} style={{ textAlign: 'center' }}>{a.name}</th>)}</tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {ABILITIES.map(a => {
                                        const r = SAMPLE_RANKS[a.key];
                                        return (
                                            <td key={a.key} style={{ textAlign: 'center', verticalAlign: 'top' }}>
                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xl)', fontWeight: 700, color: RANK_COLOR[r.rank] }}>{r.display}</div>
                                                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                                                    {r.sources.length > 0 ? r.sources.map(s => `${s.type}:${s.label}`).join(' / ') : '—'}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <Callout label="読み方：">
                        体は背景でC、配属でB、+段階でB+。ミッションではHPが厚く、先手も取りやすい前衛型になる。識はDのままなので通常攻撃は当たりにくく、術がCなので魔法攻撃のほうが安定する。数字の並びがそのまま「どう戦うか」になる。
                    </Callout>
                </StepCard>
            </div>

            {/* ===== 03 ゲームデータを作る ===== */}
            <SectionHead no="03" title="ゲームデータを作る" en="STEP BY STEP" />
            <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <p className="section__desc" style={{ marginBottom: 'var(--space-lg)' }}>
                    作成フォームの「ゲームデータを付ける」をオンにすると、以下のステップが順に並ぶ。
                    必須は<span className="text-gold">{gameSteps.filter(s => s.required).map(s => `${s.title}`).join('・')}</span>の3つ。残りは任意で、あとから編集で足せる。
                </p>
                <Table head={['STEP', '項目', 'この選択で決まること']} widths={['70px', '140px']}
                    rows={gameSteps.map(s => [<span key="n" style={monoGold}>{s.no}{s.required ? ' *' : ''}</span>, s.title, s.key === 'languages' ? '得意と苦手を同じ数だけ選ぶ（0〜3個ずつ）。RPシートに表示される' : s.effect])} />

                <StepCard no={1} en="BACKGROUND" title="背景を選ぶ" desc="2つの能力値がCに昇格し、背景スキルを自動取得する。ミッションでは背景ごとのボーナス（例：鋼の肉体はHP+2・初回攻撃+1）も自動で乗る。">
                    <Table head={['背景', 'C昇格', '背景スキル（自動取得）', 'ミッションでのボーナス']}
                        rows={BACKGROUNDS.map(b => {
                            const sk = getBackgroundSkill(b.id);
                            return [b.id, <span key="u" style={{ whiteSpace: 'nowrap' }}>{b.upgrades.map(abilityName).join('・')}</span>, sk ? `《${sk.id}》${sk.effect}` : '—', BACKGROUND_IN_GAME[b.id] || '—'];
                        })} />
                </StepCard>

                <StepCard no={2} en="ASSIGNMENT" title="配属を選ぶ" desc="所属の中での役割。1つの能力値がBに昇格し、配属スキルが解放される。所属はRPシートで選んだものがそのまま使われる（祓部→配属班／傭兵→専門／無所属→流儀）。">
                    {AFFILIATIONS.map(aff => (
                        <div key={aff} style={{ marginBottom: 'var(--space-md)' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: '#44aaff', letterSpacing: '0.05em', marginBottom: 'var(--space-xs)' }}>
                                {aff} {AFFILIATION_INFO[aff].en} — {assignmentLabel(aff)}
                            </div>
                            <Table head={[assignmentLabel(aff), 'B昇格', '概要']} widths={['130px', '80px']}
                                rows={ASSIGNMENTS[aff].map(a => [a.id, <span key="u" style={{ whiteSpace: 'nowrap' }}>{abilityName(a.upgrade)}→B</span>, a.desc])} />
                        </div>
                    ))}
                </StepCard>

                <StepCard no={3} en="ABILITIES" title="能力値を確認し、+段階を2つ付ける" desc={`ここまでの選択で決まったランクを確認し、好きな能力値${STAGE_PLUS_MAX}つに+段階を付ける（同じ能力値に2つは不可）。+段階はランクを上げないが、その能力値の判定に+1される。先天覚醒型はここで術か魂を選ぶ。`}>
                    <Callout label="信念ポイント：">
                        ミッション中に回復に使う手持ちのリソース。初期値5（ショック覚醒型は6）。1回の出撃で回復に使えるのは2回まで。
                    </Callout>
                </StepCard>

                <StepCard no={4} en="SKILLS" title="スキルを選ぶ" desc="共通・所属・配属・覚醒・武器技能の5軸のうち、自分の選択で解放された軸から選ぶ。背景スキルは自動取得済みなのでスロット不要。ミッションではメインスキルは1回、サブスキルは2回まで使え、パッシブは常時効く。">
                    <div className="two-col" style={{ marginBottom: 'var(--space-md)' }}>
                        <div>
                            <div style={stepLabel}>スキルスロット（Lv1〜{PL_MAX_LEVEL}）</div>
                            <Table head={['レベル', 'スロット', 'ステータスポイント']} widths={['80px', '90px']} rows={slotTable} />
                        </div>
                        <Callout label="スキルの種類：">
                            <span style={{ color: '#ff8844' }}>メイン</span>（自分のターンに使用・1回）・
                            <span style={{ color: '#44aaff' }}>サブ</span>（自分のターンに追加で使用・2回）・
                            <span style={{ color: '#aa44ff' }}>リアクション</span>（敵の攻撃に反応）・
                            <span style={{ color: '#44cc88' }}>パッシブ</span>（常時発動）の4種類。
                            スキルにはレベル要件があり、レベルアップで枠と選択肢が増える。取り直したくなったら詳細ページの「スキルをリセット」から。
                        </Callout>
                    </div>
                </StepCard>

                <StepCard no={5} en="GIFT" title="初期ギフトを1つ選ぶ" desc="特定の場面で効く切り札。Webゲームで現在数値に反映されるのは「装備の鬼」（武装型・半装身型の武器修正+1）。ほかはロールプレイとアドベンチャーの演出に使う。">
                    <Table head={['ギフト', '効果']} widths={['140px']} rows={GIFTS.map(g => [g.id, g.desc])} />
                </StepCard>

                <StepCard no={6} en="LANGUAGES" title="得意・苦手な魔法言語を選ぶ" desc="得意と苦手を同じ数だけ選ぶ（0〜3個ずつ）。P言語は全員が使える。全言語を得意にはできない。現在はRPシート・プロフィールの要素で、Webゲームの数値には反映されない。">
                    <Table head={['言語', '色', '得意分野']} widths={['120px', '60px']}
                        rows={LANGUAGES.map(l => [<span key="n" style={{ color: l.hex, fontWeight: 700 }}>{l.id}</span>, l.color, l.desc])} />
                </StepCard>

                <StepCard no={7} en="ARMAMENT" title="装備を組む" desc={`戦闘流派→ベース武器→形態→出自の順に選ぶと、武器修正とミッションでの想定ダメージが自動で決まる。新規作成時は選んだ装備が自動で装備投稿され、キャラに紐づく。予算はLv1で${BASE_CP_BUDGET}CP（背景「鋼の肉体」「ハッカー上がり」は装備形態によって加算）。`}>
                    <div style={stepLabel}>7-1　戦闘流派 — どう戦う？</div>
                    <Table head={['戦闘流派', '得意分野', '武器修正', '代表的な武器']}
                        rows={COMBAT_STYLE_NAMES.map(n => { const c = COMBAT_STYLE_STATS[n]; return [n, c.desc, `+${c.mod}`, c.weapons]; })} />
                    <div style={stepLabel}>7-3　装備形態 — どう装備する？</div>
                    <Table head={['形態', '概要', '基本CP', 'スロット']}
                        rows={EQUIPMENT_FORM_NAMES.map(n => { const f = EQUIPMENT_FORM_STATS[n]; return [n, f.desc, `${f.cpBase}`, `${f.baseSlot}`]; })} />
                    <div style={stepLabel}>7-4　出自 — どこの製品？</div>
                    <Table head={['出自', '概要', '補正', '向いている所属']}
                        rows={ORIGIN_NAMES.map(n => { const o = ORIGIN_TIER[n]; return [n, o.desc, [o.modBonus > 0 ? `修正+${o.modBonus}` : null, o.slotBonus > 0 ? `スロット+${o.slotBonus}` : null, `CP×${o.cpMul}`].filter(Boolean).join(' / '), o.fit]; })} />
                    <Callout>7-2 のベース武器（刀・槍・ライフル…）と 7-6 のカスタムオプションは、フォーム上で流派・形態を選ぶと候補が出る。選ぶたびに武器修正・想定ダメージ・残りCPが再計算される。あとから <Link href="/create/weapon/" style={{ color: 'var(--accent-gold)' }}>装備投稿</Link> で作った装備を連携させることもできる。</Callout>
                </StepCard>
            </div>

            {/* ===== 04 Webゲームの遊び方 ===== */}
            <SectionHead no="04" title="Webゲームの遊び方" en="WEB GAME" />
            <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <p className="section__desc" style={{ marginBottom: 'var(--space-lg)' }}>
                    ゲームデータ付きのキャラクターを投稿したら <Link href="/games/" style={{ color: 'var(--accent-gold)' }}>WEB GAME</Link> へ。
                    どのモードも判定はサイトが自動で処理する。プレイヤーがやるのは「どのキャラで、どこへ行き、何を選ぶか」だけだ。
                </p>

                <GameCard href="/games/mission/" en="SIMULATION" title="怪異討伐シミュレーション" tagline="依頼掲示板からミッションを選び、自分のキャラクターで出撃するターン制戦闘。護衛を全滅させると核が露出し、核のHPを0にすれば討伐成功。何度でも再挑戦できる。">
                    <Table head={['自分のターンにできること', '使う能力値', 'ひとこと']} widths={['200px', '110px']}
                        rows={[
                            ['攻撃', '識', '護衛か、露出した核を殴る。武器修正が乗る'],
                            ['魔法攻撃', '術', '攻撃より当てやすいが、共鳴の渇望が溜まる'],
                            ['スキル', 'スキルごと', 'メイン1回・サブ2回まで。効果はスキル表のとおり'],
                            ['回避', '—', 'このラウンドの被ダメージを半減する構え。攻撃はできない'],
                            ['回復', '—', '信念ポイントを1つ使ってHP回復。出撃ごとに2回まで'],
                        ]} />
                    <Callout label="覚えておくこと：">
                        <p>難易度はE〜S。<span className="text-gold">Eの「迷い家の影」が初心者向け</span>で、まずはここから。</p>
                        <p>ラウンド上限を超えると撤退扱い。HPが0になると敗北。どちらも失うものはないので、装備やスキルを変えて再挑戦すればいい。</p>
                        <p>報酬はCP（難易度別：{Object.entries(MISSION_CP).map(([k, v]) => `${k}=${v}`).join(' / ')}）と実績。実績は詳細ページで称号として表示できる。</p>
                    </Callout>
                </GameCard>

                <GameCard href="/games/adv/" en="ADVENTURE" title="怪異譚アドベンチャー" tagline="選択肢で分岐するテキストアドベンチャー。能力値のランクが条件を満たしていると選べる選択肢が増え、途中の判定は自動で振られる。結末はBAD／NORMAL／GOOD／TRUEの4種類。">
                    <Callout label="覚えておくこと：">
                        <p><span className="text-gold">1キャラ×1シナリオにつき1回限り。</span>別のキャラクターなら同じシナリオに挑める。</p>
                        <p>鍵付きの選択肢には「判B以上」「察C以上」のような条件が書かれている。判・察・魂・識を伸ばしたキャラほど物語の奥に進みやすい。</p>
                        <p>報酬はエンディング別のCP（{Object.entries(ADV_CP).map(([k, v]) => `${k.toUpperCase()}=${v}`).join(' / ')}）と実績。</p>
                    </Callout>
                </GameCard>

                <GameCard href="/games/dispatch/" en="DISPATCH" title="派遣クエスト" tagline="キャラクターを任務に送り出し、1〜12時間の実時間が経つと結果が出る放置型コンテンツ。派遣中のキャラはミッションに出られない。">
                    <Callout label="覚えておくこと：">
                        <p>成功率はキャラの<span className="text-gold">最も高い能力値ランク</span>と任務の推奨ランクで決まる。推奨以上なら90%、1段下なら60%、それ以下は30%。</p>
                        <p>成功すると実績と推奨ランク別のCP（{Object.entries(DISPATCH_CP).map(([k, v]) => `${k}=${v}`).join(' / ')}）。失敗しても失うものはない。</p>
                    </Callout>
                </GameCard>

                <GameCard href="/games/mission/" en="CO-OP" title="協力クエスト" tagline="自分のキャラクター3人でパーティを組んで高難度ミッションに挑む。行動順は疾ランクの高い順。敵のヘイトを誰が引き受けるかで戦況が変わる。">
                    <Callout>前衛（体・識）、魔法役（術）、支援役（魂・判）と役割を分けたパーティが安定する。ソロで勝てないミッションはこちらで。</Callout>
                </GameCard>

                <GameCard href="/sns/" en="MIRRORLINE" title="二重構造SNS〈MIRRORLINE〉" tagline="一般人の日常と、討伐者だけが見る裏の世界。キャラクターとして投稿し、PBWスレッドで物語を紡ぐ。RPシートだけのキャラクターでも参加できる。">
                    <Callout>ミッションの結果やアドベンチャーの結末を、キャラクターの言葉でここに書くと、世界に足跡が残る。</Callout>
                </GameCard>
            </div>

            {/* ===== 05 成長 ===== */}
            <SectionHead no="05" title="キャラクターを育てる" en="GROWTH" />
            <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <p className="section__desc" style={{ marginBottom: 'var(--space-lg)' }}>
                    成長の通貨は<span className="text-gold">CP（カスタマイズポイント）</span>。アカウント共通の残高で、ミッション・アドベンチャー・派遣の報酬として貯まり、装備の製作とレベルアップに使う。
                </p>
                <div className="two-col" style={{ marginBottom: 'var(--space-lg)' }}>
                    <div>
                        <div style={stepLabel}>レベルアップに必要なCP</div>
                        <Table head={['レベル', '必要CP']} widths={['120px']}
                            rows={LEVELUP_CP.map(([from, to, cp]) => [`Lv${from} → Lv${to}`, `${cp}`])} />
                        <p style={{ ...stepDesc, marginBottom: 0 }}>プレイヤーキャラクターの上限はLv{PL_MAX_LEVEL}。レベルアップはキャラクター詳細ページから行う。シリアルコードで上げることもできる。</p>
                    </div>
                    <div>
                        <div style={stepLabel}>レベルが上がると</div>
                        <Callout>
                            <p><span className="text-gold">スキルスロット</span>が増える（Lv3で2つ、Lv6で3つ。3レベルごとに+1）</p>
                            <p><span className="text-gold">ステータスポイント</span>を5レベルごとに1つ獲得。詳細ページの「↑」で能力値を1ランク上げられる（元には戻せない）</p>
                            <p><span className="text-gold">装備CP予算</span>が広がり、高位のカスタムオプションに手が届く</p>
                        </Callout>
                    </div>
                </div>
                <Callout label="CPの入りと出：">
                    <p>入り：初期付与10CP／キャラ作成時の背景ボーナス／ミッション・アドベンチャー・派遣の報酬</p>
                    <p>出：装備の製作（装備の合計CP）／レベルアップ。残高はマイページで確認できる</p>
                </Callout>
            </div>

            {/* ===== リンク ===== */}
            <SectionHead no="MORE" title="もっと知る" en="FURTHER READING" />
            <div className="card-grid" style={{ marginBottom: 'var(--space-3xl)' }}>
                <Link href="/create/character/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card">
                        <div className="card__icon">✦</div>
                        <div className="card__title-en">CREATE</div>
                        <h3 className="card__title">キャラクター作成</h3>
                        <p className="card__desc">このガイドの手順をそのまま実行。まずRPシート、必要ならゲームデータを追加。</p>
                    </div>
                </Link>
                <Link href="/games/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card">
                        <div className="card__icon">⚔</div>
                        <div className="card__title-en">WEB GAME</div>
                        <h3 className="card__title">出撃する</h3>
                        <p className="card__desc">討伐シミュレーション・怪異譚アドベンチャー・派遣クエスト・協力クエスト。</p>
                    </div>
                </Link>
                <Link href="/quickstart/character-guide/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card">
                        <div className="card__icon">☖</div>
                        <div className="card__title-en">GUIDELINE</div>
                        <h3 className="card__title">キャラクター製作ガイドライン</h3>
                        <p className="card__desc">作れるキャラクター・作れないキャラクター、動機の型、稀人・実験体の扱い。</p>
                    </div>
                </Link>
                <Link href="/world/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card">
                        <div className="card__icon">◉</div>
                        <div className="card__title-en">WORLD BIBLE</div>
                        <h3 className="card__title">世界観バイブル</h3>
                        <p className="card__desc">世界の成り立ち・魔法インフラ・怪異のメカニズムの全文。</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
