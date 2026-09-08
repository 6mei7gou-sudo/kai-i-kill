// クイックスタート — 「RPシートだけで遊ぶ」→「ゲームデータを付ける」の二段構成（v4.0対応）
// 背景・配属・覚醒・ギフト等の表は src/data/characterBuildData.js から生成する（フォームと同じ定義）
import Link from 'next/link';
import {
    ABILITIES, RANKS, RANK_DICE, RANK_LABEL, RANK_COLOR,
    AFFILIATIONS, AFFILIATION_INFO, BACKGROUNDS, ASSIGNMENTS, AWAKENINGS, GIFTS, LANGUAGES,
    GAME_DATA_STEPS, RP_SHEET_STEPS, SKILL_SLOTS_BY_LEVEL, STAGE_PLUS_MAX, BASE_CP_BUDGET, BASE_BELIEF_POINTS,
    CYBER_GRADE_MIN_LEVEL, abilityName, assignmentLabel,
} from '@/data/characterBuildData';
import { computeRanks } from '@/lib/characterBuild';
import { getBackgroundSkill, COMMON_SKILLS, FACTION_SKILLS, ASSIGNMENT_SKILLS, AWAKENING_SKILLS, BACKGROUND_SKILLS, WEAPON_SKILLS } from '@/data/skillData';
import { COMBAT_STYLE_NAMES, COMBAT_STYLE_STATS, EQUIPMENT_FORM_NAMES, EQUIPMENT_FORM_STATS, ORIGIN_NAMES, ORIGIN_TIER } from '@/data/weaponData';
import { CYBER_GRADES } from '@/data/cyberneticsData';

export const metadata = {
    title: 'クイックスタート — 電脳怪異譚 KAI-I//KILL',
    description: 'RPシートだけで遊ぶ方法と、ゲームデータ（七つの能力値・ランク・スキル・装備）の読み方・作り方。ダイスシステム・共鳴記録・怪異・戦闘の基本。',
};

// ===== サンプルキャラ（ルールブック 9-1 の例） =====
const SAMPLE = {
    character_name: '黒崎 蓮',
    affiliation: '傭兵', sub_affiliation: '突撃型',
    background: '鋼の肉体', awakening: '先天覚醒型', weapon_type: '斬撃型',
    stage_plus: ['rank_tai', 'rank_shiya'],
};
const SAMPLE_RANKS = computeRanks(SAMPLE, { innateChoice: 'rank_jutsu' });

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

const skillCount = (obj) => Object.values(obj).reduce((s, arr) => s + (Array.isArray(arr) ? arr.length : 1), 0);
const slotTable = [1, 3, 6, 9, 12, 15, 18].map(lv => [`Lv${lv}`, `${SKILL_SLOTS_BY_LEVEL[lv]}`]);

export default function QuickstartPage() {
    return (
        <div className="container">
            {/* ページヘッダー */}
            <div className="page-header">
                <div className="page-header__badge">QUICKSTART GUIDE</div>
                <h1 className="page-header__title">クイックスタート</h1>
                <div className="page-header__subtitle">電脳怪異譚　KAI-I//KILL — 討伐者ハンドブック</div>
            </div>

            <Callout>
                はじめてキャラクターを作る人向けのガイド。遊び方は2段階ある。
                <strong style={{ color: 'var(--text-primary)' }}>まずRPシート</strong>（名前・立場・見た目・来歴）を作れば、SNSやセッションのロールプレイに参加できる。
                判定を伴うセッションに出るときに<strong style={{ color: 'var(--text-primary)' }}>ゲームデータ</strong>を付け足す。詳細なルールはGMが持つルールブックを参照。
            </Callout>

            {/* 2つの遊び方 */}
            <div className="card-grid" style={{ marginBottom: 'var(--space-3xl)' }}>
                <Link href="/create/character/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card">
                        <div className="card__icon">☖</div>
                        <div className="card__title-en">RP SHEET — 5 MIN</div>
                        <h3 className="card__title">RPシートだけで遊ぶ</h3>
                        <p className="card__desc">キャラ名と所属、外見・性格・口調、来歴。戦闘数値は一切なし。SNS・投稿・ロールプレイ中心の遊び方。<span className="text-gold">→ 01章</span></p>
                    </div>
                </Link>
                <Link href="/create/character/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card">
                        <div className="card__icon">✦</div>
                        <div className="card__title-en">GAME DATA — 15 MIN</div>
                        <h3 className="card__title">ゲームデータを付ける</h3>
                        <p className="card__desc">背景・配属・戦闘流派を選ぶだけで七つの能力値が決まる。スキル・ギフト・装備を足してセッションへ。<span className="text-gold">→ 02〜03章</span></p>
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
                    <p><span className="text-gold">3. 目を引く特徴を1つ</span> — 外見でも口癖でもいい。卓の全員が覚えられる記号</p>
                    <p style={{ marginTop: 'var(--space-sm)' }}>作れるキャラクター・作れないキャラクターは <Link href="/quickstart/character-guide/" style={{ color: 'var(--accent-gold)' }}>キャラクター製作ガイドライン</Link> を確認すること。</p>
                </Callout>
                <Table head={['所属', '立ち位置', '強み', '制約']} rows={AFFILIATIONS.map(a => [a, AFFILIATION_INFO[a].tagline, AFFILIATION_INFO[a].bonus, AFFILIATION_INFO[a].constraint])} />
                <Table head={['覚醒パターン', '討伐者になった経緯', 'ゲームデータへの影響']} rows={AWAKENINGS.map(a => [a.id, a.desc, a.effect])} />
            </div>

            {/* ===== 02 ゲームデータの読み方 ===== */}
            <SectionHead no="02" title="ゲームデータの読み方" en="HOW TO READ" />
            <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <p className="section__desc" style={{ marginBottom: 'var(--space-lg)' }}>
                    ゲームデータの中心は<span className="text-gold">七つの能力値</span>と、それぞれの<span className="text-gold">ランク（D〜S）</span>。ランクは振れるダイスの数を決める。
                    作り方に入る前に、この3つ（ダイス・能力値・ランクの決まり方）だけ押さえておけばいい。
                </p>

                {/* 2-1 ダイス */}
                <StepCard no="2-1" en="DICE" title="ランクとダイス" desc="能力値のランクに応じて振れるダイスの数が変わる。高ランクほど選択肢が増え、判定が安定する。各ランクにはさらに段階（−/無印/+）があり、+段階では判定に+1修正がつく。">
                    <Table head={['ランク', 'ダイス数', 'イメージ']} widths={['80px', '110px']}
                        rows={RANKS.map(r => [
                            <span key="b" className={`badge ${r === 'D' ? 'badge--muted' : r === 'A' || r === 'S' ? 'badge--grade-special' : 'badge--grade-2'}`}>{r}</span>,
                            <span key="d" style={monoGold}>{RANK_DICE[r]}</span>,
                            RANK_LABEL[r],
                        ])} />
                    <Callout label="判定の読み方：">
                        ダイスを振ったら1個を<span className="text-gold">「達成値ダイス」</span>、別の1個を<span className="text-gold">「共鳴ダイス」</span>として選ぶ。達成値4以上で成功。出目6はスペシャル（自動成功＋追加効果）、<span className="text-gold">振ったダイスすべてが1でファンブル</span>（修正に関係なく自動失敗＋恐怖+1）。Dランクは1個振りのため1/6で事故が発生し、ランクが上がるほど激減する。
                    </Callout>
                </StepCard>

                {/* 2-2 能力値 */}
                <StepCard no="2-2" en="SEVEN STATS" title="七つの能力値" desc="キャラクターの基礎を決める七つの数値。全てランクDからスタートし、背景・配属・覚醒パターンで引き上げる。">
                    <Table head={['能力値', '読み', '何に使うか']} widths={['70px', '90px']}
                        rows={ABILITIES.map(a => [
                            <span key="n" style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: 'var(--font-size-lg)' }}>{a.name}</span>,
                            a.reading,
                            a.use,
                        ])} />
                </StepCard>

                {/* 2-3 ランクの決まり方 */}
                <StepCard no="2-3" en="HOW RANKS ARE SET" title="ランクの決まり方" desc="能力値のランクは自分で数字を振り分けるのではなく、3つの選択から自動的に決まる。作成フォームでは選ぶたびに「どこから昇格したか」が表示される。">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', marginBottom: 'var(--space-lg)' }}>
                        {[
                            { t: '全能力値 D', c: 'var(--text-muted)', d: '7つすべてがランクDから始まる' },
                            { t: '背景 → 2つがC', c: 'var(--accent-gold)', d: '出自に応じて2つの能力値がCに昇格' },
                            { t: '配属 → 1つがB', c: '#44aaff', d: '所属内の役割に応じて1つがBに昇格' },
                            { t: '先天覚醒 → 術か魂がC', c: '#aa44ff', d: '先天覚醒型だけ。背景とは別枠' },
                            { t: `+段階 → ${STAGE_PLUS_MAX}つ`, c: '#64c8ff', d: '好きな能力値に+段階（判定+1）' },
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
                                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>{r.dice}{r.plus ? ' +1' : ''}</div>
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
                        体は背景でC、配属でB、+段階でB+（3d6、判定+1）。「突撃屋の中でも最も硬い男」。察はDのまま+段階だけ乗ってD+（1d6、判定+1）。「戦場で磨いた嗅覚」。数字の並びがそのままキャラクターの語りになる。
                    </Callout>
                </StepCard>
            </div>

            {/* ===== 03 ゲームデータを作る ===== */}
            <SectionHead no="03" title="ゲームデータを作る" en="STEP BY STEP" />
            <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <p className="section__desc" style={{ marginBottom: 'var(--space-lg)' }}>
                    作成フォームの「ゲームデータを付ける」をオンにすると、以下の {GAME_DATA_STEPS.length} ステップが順に並ぶ。
                    必須は<span className="text-gold">{GAME_DATA_STEPS.filter(s => s.required).map(s => `STEP ${s.no} ${s.title}`).join('・')}</span>の3つ。残りは任意で、あとから編集で足せる。
                </p>
                <Table head={['STEP', '項目', 'この選択で決まること']} widths={['70px', '140px']}
                    rows={GAME_DATA_STEPS.map(s => [<span key="n" style={monoGold}>{s.no}{s.required ? ' *' : ''}</span>, s.title, s.effect])} />

                {/* STEP 1 背景 */}
                <StepCard no={1} en="BACKGROUND" title="背景を選ぶ" desc={GAME_DATA_STEPS[0].effect}>
                    <Table head={['背景', 'C昇格', '初期効果', '背景スキル（自動取得）']}
                        rows={BACKGROUNDS.map(b => {
                            const sk = getBackgroundSkill(b.id);
                            return [b.id, <span key="u" style={{ whiteSpace: 'nowrap' }}>{b.upgrades.map(abilityName).join('・')}</span>, b.desc, sk ? `《${sk.id}》${sk.effect}` : '—'];
                        })} />
                </StepCard>

                {/* STEP 2 配属 */}
                <StepCard no={2} en="ASSIGNMENT" title="配属を選ぶ" desc={`${GAME_DATA_STEPS[1].effect}。所属はRPシートで選んだものがそのまま使われる（祓部→配属班／傭兵→専門／無所属→流儀）。`}>
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

                {/* STEP 3 能力値の確認 */}
                <StepCard no={3} en="ABILITIES" title="能力値を確認し、+段階を2つ付ける" desc={GAME_DATA_STEPS[2].effect}>
                    <Callout label="段階の仕組み：">
                        各ランクに <span className="text-gold">−（マイナス）/ 無印 / +（プラス）</span> の3段階がある。例えばC+は「Cランクのダイス2d6＋判定に+1」。
                        作成時は好きな能力値{STAGE_PLUS_MAX}つに+段階を付与できる（同じ能力値に2つは不可）。段階はランク昇格とは別枠の微調整で、−段階は負傷や呪い等で後天的にしか発生しない。
                    </Callout>
                    <Callout label="信念ポイント：">
                        判定の振り直しやシーンへの介入に使う消費リソース。初期値{BASE_BELIEF_POINTS}点（ショック覚醒型は+1）。
                    </Callout>
                </StepCard>

                {/* STEP 4 スキル */}
                <StepCard no={4} en="SKILLS" title="スキルを選ぶ" desc="6つの軸（共通・所属・配属・覚醒・背景・武器技能）のうち、自分の選択で解放された軸から選ぶ。背景スキルはSTEP 1で自動取得済みなのでスロット不要。">
                    <Table head={['軸', '解放条件', 'スキル数', '傾向']}
                        rows={[
                            [<span key="a" style={{ color: '#888' }}>共通</span>, 'なし（誰でも選択可）', `${COMMON_SKILLS.length}`, '汎用・基本行動の強化'],
                            [<span key="a" style={{ color: '#d4af37' }}>所属</span>, '対応する所属を選択', `各${FACTION_SKILLS['祓部'].length}（計${skillCount(FACTION_SKILLS)}）`, '所属の特権・リソース活用'],
                            [<span key="a" style={{ color: '#44aaff' }}>配属</span>, '対応する配属を選択', `各${ASSIGNMENT_SKILLS['古怪班'].length}（計${skillCount(ASSIGNMENT_SKILLS)}）`, '役割特化・専門技術'],
                            [<span key="a" style={{ color: '#aa44ff' }}>覚醒</span>, '対応する覚醒パターン', `各${AWAKENING_SKILLS['先天覚醒型'].length}（計${skillCount(AWAKENING_SKILLS)}）`, '覚醒に由来する特殊能力'],
                            [<span key="a" style={{ color: '#cc8844' }}>背景</span>, '自動取得（枠不要）', `各1（計${Object.keys(BACKGROUND_SKILLS).length}）`, '出自に応じたパッシブ効果'],
                            [<span key="a" style={{ color: '#ff6644' }}>武器技能</span>, '対応する戦闘流派を選択', `各${WEAPON_SKILLS['斬撃型'].length}（計${skillCount(WEAPON_SKILLS)}）`, '戦闘スタイル・武器連携'],
                        ]} />
                    <div className="two-col" style={{ marginBottom: 'var(--space-md)' }}>
                        <div>
                            <div style={stepLabel}>スロット数（Webシート）</div>
                            <Table head={['レベル', 'スロット']} widths={['80px']} rows={slotTable} />
                        </div>
                        <Callout label="スキルの種類：">
                            <span style={{ color: '#ff8844' }}>メイン</span>（自分のターンに使用）・
                            <span style={{ color: '#44aaff' }}>サブ</span>（条件を満たした時に割込）・
                            <span style={{ color: '#aa44ff' }}>リアクション</span>（相手のターンに対応）・
                            <span style={{ color: '#44cc88' }}>パッシブ</span>（常時発動）の4種類。
                            スキルにはレベル要件があり、レベルアップで枠と選択肢が増える。オフラインの卓ではGMの指示に従うこと。
                        </Callout>
                    </div>
                </StepCard>

                {/* STEP 5 ギフト */}
                <StepCard no={5} en="GIFT" title="初期ギフトを1つ選ぶ" desc={GAME_DATA_STEPS[4].effect}>
                    <Table head={['ギフト', '効果']} widths={['140px']} rows={GIFTS.map(g => [g.id, g.desc])} />
                </StepCard>

                {/* STEP 6 魔法言語 */}
                <StepCard no={6} en="LANGUAGES" title="得意・苦手な魔法言語を選ぶ" desc={`${GAME_DATA_STEPS[5].effect}。P言語は全員が使える。全言語を得意にはできない。`}>
                    <Table head={['言語', '色', '得意分野']} widths={['120px', '60px']}
                        rows={LANGUAGES.map(l => [<span key="n" style={{ color: l.hex, fontWeight: 700 }}>{l.id}</span>, l.color, l.desc])} />
                </StepCard>

                {/* STEP 7 装備 */}
                <StepCard no={7} en="ARMAMENT" title="装備を組む" desc={`${GAME_DATA_STEPS[6].effect}。予算はLv1で${BASE_CP_BUDGET}CP（背景「鋼の肉体」「ハッカー上がり」は装備形態によって加算）。所属によって使える装備のグレードが変わる。`}>
                    <div style={stepLabel}>7-1　戦闘流派（武器型）— どう戦う？</div>
                    <Table head={['戦闘流派', '得意分野', '武器修正', '攻撃に使う能力値', '代表的な武器']}
                        rows={COMBAT_STYLE_NAMES.map(n => { const c = COMBAT_STYLE_STATS[n]; return [n, c.desc, `+${c.mod}`, abilityName(c.ability), c.weapons]; })} />
                    <div style={stepLabel}>7-3　装備形態 — どう装備する？</div>
                    <Table head={['形態', '概要', '基本CP', 'スロット']}
                        rows={EQUIPMENT_FORM_NAMES.map(n => { const f = EQUIPMENT_FORM_STATS[n]; return [n, f.desc, `${f.cpBase}`, `${f.baseSlot}`]; })} />
                    <div style={stepLabel}>7-4　出自 — どこの製品？</div>
                    <Table head={['出自', '概要', '補正', '向いている所属']}
                        rows={ORIGIN_NAMES.map(n => { const o = ORIGIN_TIER[n]; return [n, o.desc, [o.modBonus > 0 ? `修正+${o.modBonus}` : null, o.slotBonus > 0 ? `スロット+${o.slotBonus}` : null, `CP×${o.cpMul}`].filter(Boolean).join(' / '), o.fit]; })} />
                    <Callout>7-2 のベース武器（刀・槍・ライフル…）と 7-6 のカスタムオプションは、フォーム上で流派・形態を選ぶと候補が出る。選ぶたびに武器修正・想定ダメージ・残りCPが再計算される。</Callout>
                </StepCard>

                {/* STEP 8 サイバネ */}
                <StepCard no={8} en="CYBERNETICS" title="サイバネティクス（任意）" desc={GAME_DATA_STEPS[7].effect}>
                    <Table head={['等級', 'CP上限', '必要レベル']} widths={['200px', '90px']}
                        rows={CYBER_GRADES.filter(g => g.id !== 'none').map(g => [g.label, `${g.cpLimit}`, `Lv${CYBER_GRADE_MIN_LEVEL[g.id]}以上`])} />
                    <Callout danger label="注意：">一度施術すると取り外せない。等級Ⅲでの開始は不可（キャラクター製作ガイドライン参照）。</Callout>
                </StepCard>
            </div>

            {/* ===== 04 セッションの流れ ===== */}
            <SectionHead no="04" title="セッションの流れ" en="INVESTIGATE → REVEAL → HUNT" />
            <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <p className="section__desc" style={{ marginBottom: 'var(--space-lg)' }}>
                    二級以上の怪異を倒すには、<span className="text-gold">調べて、暴いて、討つ</span>の三段階を踏む。
                </p>
                <div style={{ ...cardBox, fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', lineHeight: 2.2, textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
                    <div style={{ color: 'var(--accent-cyber)', fontWeight: 700 }}>[第一段階] 調査プロセス — 四つの解明鍵の収集</div>
                    <div style={{ color: 'var(--text-muted)' }}>↓</div>
                    <div style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>[第二段階] 解明プロセス — 解明完了宣言</div>
                    <div style={{ color: 'var(--text-muted)' }}>↓</div>
                    <div style={{ color: 'var(--accent-danger)', fontWeight: 700 }}>[第三段階] 討伐プロセス —《核護衛戦》</div>
                </div>

                <StepCard no="4-1" en="INVESTIGATION" title="調査 — 四つの解明鍵">
                    <Table head={['解明鍵', '内容', '判定']}
                        rows={[
                            [<span key="k" style={{ color: 'var(--accent-gold)' }}>①怪異の正体</span>, '古い/新しい怪異か、元になった噂の内容、発生時期', '識・察'],
                            [<span key="k" style={{ color: 'var(--accent-gold)' }}>②核の所在</span>, '核が宿っている物・場所・人間', '察・識'],
                            [<span key="k" style={{ color: 'var(--accent-gold)' }}>③被害パターン</span>, 'ルールの構造、誰が狙われるか、条件', '判・識'],
                            [<span key="k" style={{ color: 'var(--accent-gold)' }}>④ルールの全容</span>, '怪異のルールと弱点・例外条件', '判'],
                        ]} />
                </StepCard>

                <StepCard no="4-2" en="REVELATION" title="解明完了宣言">
                    <Table head={['達成鍵数', '効果']} widths={['140px']}
                        rows={[
                            [<span key="k" style={{ color: 'var(--accent-gold)' }}>4鍵全て</span>, '核の防御力半減・浄化+1・制限ラウンド+1延長権・護衛特性1つ無効化'],
                            [<span key="k" style={{ color: '#ffaa00' }}>3鍵</span>, '核の防御力−1（通常戦闘開始）'],
                            [<span key="k" style={{ color: 'var(--accent-danger)' }}>2鍵以下で強行</span>, '全判定−1・護衛の防御力+2・核の防御力変化なし'],
                        ]} />
                    <Callout danger label="準備不足のペナルティ：">
                        二級以上の怪異に対して解明完了宣言なしで挑むと、<strong style={{ color: 'var(--accent-danger)' }}>核へのダメージが0として扱われる</strong>。護衛を倒しても核は再生し、制限ラウンドに追い詰められる。
                    </Callout>
                </StepCard>

                <StepCard no="4-3" en="CORE-GUARDIAN BATTLE" title="討伐 —《核護衛戦》" desc="二級以上の怪異の核は護衛（ガーディアン）に守られている。護衛を排除して初めて核への道が開く。">
                    <div style={{ ...cardBox, fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', lineHeight: 2.0, textAlign: 'center' }}>
                        <div style={{ color: 'var(--accent-danger)', fontWeight: 700 }}>【核（コア）】HP ██████████</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>↑ 護衛が1体でも残っていれば核は攻撃不可</div>
                        <div style={{ color: '#ffaa00', fontWeight: 700 }}>【護衛1】HP ████　【護衛2】HP ████　【護衛3】HP ████</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>↕ PCたちが対峙する</div>
                        <div style={{ color: 'var(--accent-cyber)', fontWeight: 700 }}>【討伐者チーム】</div>
                    </div>
                    <Callout label="ラウンド進行：">
                        <p><span className="text-gold">1. ラウンド開始</span> — 護衛の再生・状態異常の回復判定</p>
                        <p><span className="text-gold">2. イニシアチブ</span> — 疾ランク順で行動順を決定（同値ならPCが先）</p>
                        <p><span className="text-gold">3. ターン処理</span> — メイン行動×1 + サブ行動×1 + リアクション×1（ターン外）</p>
                        <p><span className="text-gold">4. ラウンド終了</span> — 核HP確認・制限ラウンドカウント・共鳴臨界チェック</p>
                    </Callout>
                    <div className="content-body" style={{ marginBottom: 'var(--space-md)' }}>
                        <table>
                            <thead><tr><th>種別</th><th>行動</th><th>能力値</th><th>効果</th></tr></thead>
                            <tbody>
                                <tr><td rowSpan={5} style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>メイン</td><td>攻撃</td><td>体/疾</td><td>護衛・核への物理ダメージ</td></tr>
                                <tr><td>魔法行使</td><td>術</td><td>魔法による攻撃・支援</td></tr>
                                <tr><td>解明</td><td>識/察</td><td>戦闘中に解明鍵を進める</td></tr>
                                <tr><td>干渉</td><td>判</td><td>護衛の特性を1R無効化</td></tr>
                                <tr><td>浄化</td><td>魂</td><td>共鳴メーター1種を−2</td></tr>
                                <tr><td rowSpan={4} style={{ fontWeight: 700, color: 'var(--accent-cyber)' }}>サブ</td><td>移動</td><td>—</td><td>射程・位置の調整</td></tr>
                                <tr><td>アイテム</td><td>—</td><td>回復アイテム等の使用</td></tr>
                                <tr><td>情報確認</td><td>—</td><td>護衛1体のHPを確認</td></tr>
                                <tr><td>構え変更</td><td>—</td><td>次のリアクションに+1</td></tr>
                                <tr><td rowSpan={3} style={{ fontWeight: 700, color: '#ff6644' }}>リアクション</td><td>回避</td><td>疾</td><td>成功でダメージ無効</td></tr>
                                <tr><td>援護</td><td>体</td><td>味方のダメージを肩代わり（半減）</td></tr>
                                <tr><td>カウンター</td><td>体/疾</td><td>回避成功時に反撃</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <Callout label="ダメージ計算：">
                        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)', fontSize: 'var(--font-size-md)' }}>ダメージ = 達成値 + 武器修正 − 対象の防御力</p>
                        <p style={{ marginTop: 'var(--space-sm)' }}>達成値4で成功（1+武器修正）、5で（2+武器修正）、6でスペシャル（3+武器修正、防御力0扱い）</p>
                    </Callout>
                </StepCard>
            </div>

            {/* ===== 05 共鳴記録 ===== */}
            <SectionHead no="05" title="《共鳴記録》" en="EMOTION RESONANCE" />
            <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <p className="section__desc" style={{ marginBottom: 'var(--space-lg)' }}>
                    共鳴盤は<span className="text-gold">卓全体で共有する</span>感情の記録盤。判定のたびに感情が蓄積し、共鳴が深まればギフトが解放されるが、10点に達すると代償が来る。<span className="text-gold">浄化だけは臨界が恩恵になる。</span>
                </p>
                <Callout label="共鳴ダイスの決め方：">
                    2個以上のダイスを振った判定では、達成値ダイスに選ばなかったダイスから1個を選び、その<span className="text-gold">出目に対応する感情メーター</span>に1点置く。Dランクは1個振りのため共鳴ダイスを生まない（力なき者は怪異と共鳴すらできない）。
                </Callout>
                <div className="content-body" style={{ marginBottom: 'var(--space-lg)' }}>
                    <table>
                        <thead><tr><th>出目</th><th>感情</th><th>ダイス以外で上昇する場面（イベント加算 +2）</th><th>臨界（10点）の代償</th></tr></thead>
                        <tbody>
                            {[
                                ['1', '恐怖', '#8b2020', '逃走・防御に失敗した時、怪異のルールを破った時、ファンブル時', '次の魂判定が自動ファンブル'],
                                ['2', '焦燥', '#cc8800', '制限ラウンド残り1で行動した時、手がかりを失った時', '次の行動宣言を先に公開（奇襲不可）'],
                                ['3', '哀愁', '#4488cc', '解明鍵を入手した時、NPCとの別れの場面', '次の調査判定すべて−1。信念1消費'],
                                ['4', '怒り', '#cc4400', '攻撃スペシャル時、仲間が傷ついた直後の行動', '1ラウンド強制：最も近い敵への最大火力攻撃のみ'],
                                ['5', '渇望', '#8844aa', '特殊素材・禁忌の力を使用した時', '次の特殊行動のコストが倍増'],
                                ['6', '浄化', '#44aa88', '解明完了宣言成功時、信念を全消費した時', <span key="p" style={{ color: 'var(--accent-gold)' }}>代償なし。大浄化ギフト発動</span>],
                            ].map(([n, emo, color, up, cost]) => (
                                <tr key={n}>
                                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, textAlign: 'center' }}>{n}</td>
                                    <td style={{ fontWeight: 700, color }}>{emo}</td>
                                    <td>{up}</td>
                                    <td>{cost}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="two-col" style={{ marginBottom: 'var(--space-lg)' }}>
                    <div style={cardBox}>
                        <div style={stepLabel}>AWAKENING GIFTS</div>
                        <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>覚醒ギフト（全PC共用）</h3>
                        <p style={{ ...stepDesc, marginBottom: 0 }}>
                            共鳴メーターが<span className="text-gold">1〜3点で初級</span>、<span className="text-gold">4〜6点で中級</span>、<span className="text-gold">7〜9点で上級</span>のギフトが解放され、<span className="text-gold">どのPCでも使用できる</span>。使用コストは「そのメーターを+1する」こと — 力を使うほど感情は昂ぶり、臨界へ近づく。
                        </p>
                    </div>
                    <div style={cardBox}>
                        <div style={{ ...stepLabel, color: 'var(--accent-danger)' }}>CRITICAL</div>
                        <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>臨界</h3>
                        <p style={{ ...stepDesc, marginBottom: 0 }}>
                            10点に達すると代償が発動し、メーターは0にリセットされる。代償の対象は臨界の1点を置いた（または発生させた）PC。<span className="text-gold">浄化だけは代償ではなく大浄化（味方全体への恩恵）が発動する。</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* ===== 06 怪異 ===== */}
            <SectionHead no="06" title="怪異システム" en="ANOMALY MECHANICS" />
            <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <p className="section__desc" style={{ marginBottom: 'var(--space-lg)' }}>
                    怪異とは、集合的な噂・信念が臨界点を超えた時に現実へと侵食する<span className="text-gold">バグ</span>だ。全ての怪異は<strong style={{ color: 'var(--text-primary)' }}>核（コア）</strong>と<strong style={{ color: 'var(--text-primary)' }}>ルール</strong>を持つ。
                </p>
                <div className="two-col" style={{ marginBottom: 'var(--space-lg)' }}>
                    <div style={cardBox}>
                        <div style={{ ...stepLabel, color: 'var(--accent-danger)' }}>CORE</div>
                        <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>核（コア）</h3>
                        <p style={{ ...stepDesc, marginBottom: 0 }}>怪異の存在の中心。物・場所・記録媒体に宿る。稀に人間に宿る。<span className="text-gold">破壊で怪異は消滅する。</span></p>
                    </div>
                    <div style={cardBox}>
                        <div style={{ ...stepLabel, color: 'var(--accent-cyber)' }}>RULE</div>
                        <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>ルール</h3>
                        <p style={{ ...stepDesc, marginBottom: 0 }}>怪異が人を害する条件と行動原則。<span className="text-gold">ルールを破るほど怪異に捕捉される。</span>解明でルールを暴くことが討伐の鍵。</p>
                    </div>
                </div>
                <div className="content-body" style={{ marginBottom: 'var(--space-lg)' }}>
                    <table>
                        <thead><tr><th>等級</th><th>位置づけ</th><th>解明</th><th>概要</th></tr></thead>
                        <tbody>
                            <tr><td style={{ fontWeight: 700, color: '#88cc44' }}>五級・四級</td><td>雑魚</td><td>不要</td><td>日常的に湧く害獣。見つけ次第叩ける</td></tr>
                            <tr><td style={{ fontWeight: 700, color: '#ffaa00' }}>三級</td><td>中ボス</td><td>任意（推奨）</td><td>力押しも可能だが、調べてから挑んだ方が確実に生き残れる</td></tr>
                            <tr><td style={{ fontWeight: 700, color: '#ff6644' }}>二級</td><td>ボス</td><td style={{ color: 'var(--accent-danger)', fontWeight: 700 }}>必須</td><td>解明なしでは核にダメージが通らない</td></tr>
                            <tr><td style={{ fontWeight: 700, color: '#ff4444' }}>一級</td><td>大ボス</td><td style={{ color: 'var(--accent-danger)', fontWeight: 700 }}>必須</td><td>解明完了なしでの核への攻撃は完全に無効</td></tr>
                            <tr><td style={{ fontWeight: 700, color: '#aa44ff' }}>特級</td><td>災害</td><td style={{ color: 'var(--accent-danger)', fontWeight: 700 }}>必須</td><td>討伐不可能。封印による管理封印を目指す</td></tr>
                        </tbody>
                    </table>
                </div>
                <Link href="/anomalies/about/" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--accent-gold)', textDecoration: 'none' }}>
                    → 怪異の分類・等級・討伐プロセスを詳しく見る
                </Link>
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
                <Link href="/quickstart/character-guide/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card">
                        <div className="card__icon">☖</div>
                        <div className="card__title-en">GUIDELINE</div>
                        <h3 className="card__title">キャラクター製作ガイドライン</h3>
                        <p className="card__desc">作れるキャラクター・作れないキャラクター、動機の型、稀人・実験体の扱い。</p>
                    </div>
                </Link>
                <Link href="/organizations/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card">
                        <div className="card__icon">✕</div>
                        <div className="card__title-en">FACTIONS</div>
                        <h3 className="card__title">組織・人物</h3>
                        <p className="card__desc">祓部・傭兵・無所属の詳細。配属の背景設定・キャラクター例を収録。</p>
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
