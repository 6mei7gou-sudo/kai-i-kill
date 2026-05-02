// キャラクター製作ガイドライン — OK/NG例・禁止事項・非推奨・動機の型
import Link from 'next/link';

export const metadata = {
    title: 'キャラクター製作ガイドライン — 電脳怪異譚 KAI-I//KILL',
    description: '作れるキャラクター・作れないキャラクターの一覧。禁止事項と非推奨事項、動機の設定方法。',
};

// テーブル行コンポーネント
function Row({ cells, head = false }) {
    const Tag = head ? 'th' : 'td';
    return (
        <tr>
            {cells.map((cell, i) => (
                <Tag key={i} style={i === 0 && !head ? { fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' } : undefined}>
                    {cell}
                </Tag>
            ))}
        </tr>
    );
}

export default function CharacterGuidePage() {
    return (
        <div className="container">
            {/* ページヘッダー */}
            <div className="page-header">
                <div className="page-header__badge">CHARACTER GUIDELINE</div>
                <h1 className="page-header__title">キャラクター製作ガイドライン</h1>
                <div className="page-header__subtitle">電脳怪異譚　KAI-I//KILL — PCとして作れるもの・作れないもの</div>
            </div>

            <div className="callout" style={{ marginBottom: 'var(--space-2xl)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
                    キャラクターを作り始める前に確認すること。
                    KAI-I//KILLのPCは<strong style={{ color: 'var(--text-primary)' }}>怪異と戦う討伐者の一人</strong>である。英雄でも超人でもない。
                </p>
            </div>

            {/* ===== 作れるキャラクター ===== */}
            <section className="section">
                <div className="section__number">01 — OK EXAMPLES</div>
                <h2 className="section__heading">
                    作れるキャラクター
                    <span className="section__heading-en">GOOD TO GO</span>
                </h2>
            </section>

            <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <div className="content-body" style={{ marginBottom: 'var(--space-lg)' }}>
                    <table>
                        <thead>
                            <Row head cells={['方向性', '例', 'ポイント']} />
                        </thead>
                        <tbody>
                            <Row cells={['正規の若手討伐者', '祓部の祓士。訓練を終えたばかり', '組織の歯車として動きながら、現場で成長する']} />
                            <Row cells={['企業に雇われた傭兵', '雷禽重工の装備を使う突撃型', '契約と実績の世界。二つ名はこれから勝ち取る']} />
                            <Row cells={['フリーの傭兵', '《Anonymous》Dランク。まだ名前もない', '仕事を選びながら実力を積む段階']} />
                            <Row cells={['本業が別にある傭兵', '普段はバーテンダー。ライセンスだけ持っている', '日常と討伐の二重生活。依頼が来たら動く']} />
                            <Row cells={['組織に属せない無所属', '底澱のスラムで育った路地裏の犬', 'ライセンスを取れない事情がある。何も持たないが生き延びてきた']} />
                            <Row cells={['元祓部の脱走兵', '組織に幻滅して抜けた。追われている', '過去の知識と追跡のリスクを天秤にかける']} />
                            <Row cells={['独学の退魔師', '神社の血筋だが祓部には入らなかった', '古い知識はあるが、組織の後ろ盾はない']} />
                            <Row cells={['怪異の被害者から討伐者へ', '家族を怪異に殺され、復讐を誓った', '強い動機があるが、未熟さと向き合う']} />
                            <Row cells={['過去に囚われた討伐者', '実験施設から逃げ出してきた', '力はあるが制御が不安定。自分自身への恐怖を抱えている']} />
                            <Row cells={['調査専門の知識型', '民俗学者くずれ。戦えないが怪異を解き明かす', '解明フェーズで輝く。戦闘は仲間に任せる']} />
                            <Row cells={['サイバネティクス改造済み', '片腕が義肢。蒼鉄機工の正規品', '改造の恩恵と拒絶反応の代償がある']} />
                        </tbody>
                    </table>
                </div>

                <div className="callout">
                    <div className="callout__label">いいPCの4条件：</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
                        <p><span className="text-gold">1. 成長の余地がある</span> — 最初から完成していない。セッションを通じて強くなる</p>
                        <p><span className="text-gold">2. 弱点がある</span> — 何かが欠けている。仲間が必要な理由がある</p>
                        <p><span className="text-gold">3. 動機がある</span> — なぜ怪異と戦うのか、理由が1つ以上ある</p>
                        <p><span className="text-gold">4. 世界に足がついている</span> — この社会の中で生きている実感がある</p>
                    </div>
                </div>
            </div>

            {/* ===== 禁止事項 ===== */}
            <section className="section">
                <div className="section__number">02 — PROHIBITED</div>
                <h2 className="section__heading">
                    禁止事項
                    <span className="section__heading-en">CANNOT CREATE</span>
                </h2>
            </section>

            <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <p className="section__desc" style={{ marginBottom: 'var(--space-lg)' }}>
                    以下のキャラクターはPCとして<strong style={{ color: 'var(--accent-danger)' }}>作成できない</strong>。
                </p>

                <div className="content-body" style={{ marginBottom: 'var(--space-lg)' }}>
                    <table>
                        <thead>
                            <Row head cells={['#', 'NG', '理由']} />
                        </thead>
                        <tbody>
                            {[
                                ['1', '大祓主・祓主・禊士', 'PC開始ランクは祓士が上限。指揮官クラスはNPC専用'],
                                ['2', '上級祓士で開始', '通常の祓士より1段上。PCの開始ランクではない'],
                                ['3', '《Anonymous》Aランク以上', '業界最高峰〜伝説級。到達する「かもしれない」目標であって、出発点ではない'],
                                ['4', '御柱（みはしら）', '大祓主直轄の伝説的存在。NPC専用'],
                                ['5', '怪異そのもの・完全に変質した存在', 'PCは「人間側」である。怪異側に落ちたら物語は終わる。NPCとしてならあり得る'],
                                ['6', '特級怪異を複数回単独撃破した経歴', 'ゲーム内で最も危険な存在。初期PCがそんな経歴を持つのは不自然'],
                                ['7', '元禊士の脱走兵', '「元禊士」の知識と人脈がゲームバランスを壊す'],
                                ['8', '全装身型・戦闘用搭乗型で開始', '一般の討伐者には持ちえない'],
                                ['9', 'サイバネティクス等級Ⅲで開始', '全身改造は代償が重い。物語の末に辿り着くもの'],
                                ['10', '他PCの記憶を操作できる設定', '記憶操作はNPC権限。PCが持つとPvPの原因になる'],
                                ['11', '企業所属のキャラクター', 'PCの所属は祓部・傭兵・無所属の3つのみ。蒼鉄機工・雷禽重工等の企業社員としてのPCは作成不可。企業の装備を使う傭兵や、企業と契約関係にある討伐者は可'],
                                ['12', '異能を持ったキャラクター', '異能は使うほど使用者が怪異側に変質していく力。PCは「人間側」であり、開始時から異能を保有するのは方針外。NPCの設定要素として扱う'],
                            ].map(([n, ng, reason]) => (
                                <tr key={n}>
                                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-danger)', fontWeight: 700, whiteSpace: 'nowrap' }}>{n}</td>
                                    <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{ng}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{reason}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ===== 非推奨 ===== */}
            <section className="section">
                <div className="section__number">03 — NOT RECOMMENDED</div>
                <h2 className="section__heading">
                    非推奨
                    <span className="section__heading-en">BETTER AVOID</span>
                </h2>
            </section>

            <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <p className="section__desc" style={{ marginBottom: 'var(--space-lg)' }}>
                    禁止ではないが、<strong style={{ color: 'var(--accent-gold)' }}>避けたほうがいい</strong>もの。右列の改善案を参考に。
                </p>

                <div className="content-body" style={{ marginBottom: 'var(--space-lg)' }}>
                    <table>
                        <thead>
                            <Row head cells={['非推奨', '理由', 'こうすると良くなる']} />
                        </thead>
                        <tbody>
                            {[
                                ['「最強」を自称する設定', '成長の余地がない。他PCを見下す構造になりやすい', '「強くなりたい」「まだ足りない」という動機にする'],
                                ['孤高すぎて仲間と絡めない', 'TRPGはチームで遊ぶもの', '一匹狼でも「組まざるを得ない理由」を1つ用意する'],
                                ['過去が重すぎて動けない', 'トラウマは良い設定だが、行動不能になると卓が止まる', '「傷はあるが、それでも前に出る」にする'],
                                ['現実の特定組織・事件の直接的パロディ', '世界観の没入を妨げる', 'KAI-I//KILLの固有設定に沿って翻案すること'],
                                ['怪異と友好的な関係を最初から持っている', '怪異は集合的な噂が実体化したもの。友好関係は極めて稀', '「理解・共感」として表現する。友好ではなく複雑な感情'],
                                ['魔法言語をすべて得意にする', 'ルール上、得意と苦手は同数。全得意は不可', '得意2〜3 + 苦手2〜3 が一般的'],
                                ['所属と矛盾する行動指針', '祓部なのに組織を無視する、傭兵なのに契約を守らない等', '「葛藤」は良いが「最初から破綻」はNG'],
                            ].map(([ng, reason, fix], i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{ng}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{reason}</td>
                                    <td style={{ color: 'var(--accent-gold)' }}>{fix}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ===== 動機の型 ===== */}
            <section className="section">
                <div className="section__number">04 — MOTIVATION</div>
                <h2 className="section__heading">
                    なぜ戦うのか
                    <span className="section__heading-en">CHARACTER MOTIVATION</span>
                </h2>
            </section>

            <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <p className="section__desc" style={{ marginBottom: 'var(--space-lg)' }}>
                    PCは全員、怪異と戦う理由を持っている。以下のうち<span className="text-gold">1つ以上</span>を設定に含めること。
                </p>

                <div className="content-body" style={{ marginBottom: 'var(--space-lg)' }}>
                    <table>
                        <thead>
                            <Row head cells={['動機の型', '例']} />
                        </thead>
                        <tbody>
                            <Row cells={['喪失', '家族・友人・恩師を怪異に奪われた']} />
                            <Row cells={['使命', '組織から任務を受けている。職務として']} />
                            <Row cells={['贖罪', '過去に怪異を生む原因を作ってしまった']} />
                            <Row cells={['知的欲求', '怪異の謎を解き明かしたい']} />
                            <Row cells={['生存', '怪異に追われている。戦わなければ死ぬ']} />
                            <Row cells={['復讐', '特定の怪異、または怪異を利用した者への報復']} />
                            <Row cells={['保護', '守りたい人・場所がある']} />
                            <Row cells={['自分自身への恐怖', '自分の中にある力が怪異に近い。制御するために戦う']} />
                        </tbody>
                    </table>
                </div>

                <div className="callout" style={{ borderColor: 'var(--accent-danger)' }}>
                    <div className="callout__label" style={{ color: 'var(--accent-danger)' }}>NGな動機：</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
                        <p><strong style={{ color: 'var(--accent-danger)' }}>「特にない」「なんとなく」</strong> — 物語に参加する理由がなくなる</p>
                        <p><strong style={{ color: 'var(--accent-danger)' }}>「世界を救う」</strong> — スケールが大きすぎる。PCは一人の討伐者</p>
                    </div>
                </div>
            </div>

            {/* ===== リンク ===== */}
            <div className="card-grid" style={{ marginBottom: 'var(--space-3xl)' }}>
                <Link href="/quickstart/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card">
                        <div className="card__icon">▶</div>
                        <div className="card__title-en">QUICKSTART</div>
                        <h3 className="card__title">クイックスタート</h3>
                        <p className="card__desc">
                            ダイスシステム・能力値・作成手順の全体像。
                        </p>
                    </div>
                </Link>
                <Link href="/create/character/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card">
                        <div className="card__icon">✦</div>
                        <div className="card__title-en">CREATE</div>
                        <h3 className="card__title">キャラクター作成</h3>
                        <p className="card__desc">
                            フォームに入力するだけでキャラシートが完成する。
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
