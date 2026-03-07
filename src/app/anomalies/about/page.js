// 怪異とは — 怪異システム詳細ページ
import Link from 'next/link';

export const metadata = {
    title: '怪異とは — 電脳怪異譚 KAI-I//KILL',
    description: '怪異の定義・発生原理・核とルール・等級体系・脅威度種別・討伐プロセスの詳細解説。',
};

const grades = [
    { grade: '特級', role: '災害', desc: '現状の手段では消滅が極めて困難。封印・管理が限界', process: '封印のみ（必須）', css: 'badge--grade-special' },
    { grade: '一級', role: '大ボス', desc: '信念密度が非常に高い。長い歴史を持つ強力な怪異', process: '全三段階（必須）', css: 'badge--grade-1' },
    { grade: '二級', role: 'ボス', desc: '記録のある古い怪異の大半。解明なしでは核にダメージを与えられない', process: '全三段階（必須）', css: 'badge--grade-2' },
    { grade: '三級', role: '中ボス', desc: '化け物じみた強さ。力押しも可能だが、プロセスを踏めば弱体化させられる', process: '直接戦闘可（プロセス推奨）', css: 'badge--grade-3' },
    { grade: '四級', role: '雑魚', desc: '発生したばかりの新しい怪異。魔法や物理で直接倒せる', process: '直接戦闘で討伐可能', css: 'badge--muted' },
    { grade: '五級', role: '雑魚', desc: '魔法事故由来の微小怪異。自然消滅することも多い', process: '直接戦闘で討伐可能', css: 'badge--muted' },
];

const threatTypes = [
    { type: '甲種', desc: '無差別に人を害する。接触した全員が標的', color: 'var(--accent-danger)' },
    { type: '乙種', desc: '条件付きで害する。ルールを破った者を狙う', color: 'var(--accent-gold)' },
    { type: '丙種', desc: '基本的に害さないが刺激すると害する', color: 'var(--text-secondary)' },
    { type: '丁種', desc: '人を害さない。共存可能または信仰対象に近い', color: 'var(--accent-blue)' },
];

export default function AnomalyAboutPage() {
    return (
        <div className="container">
            {/* ページヘッダー */}
            <div className="page-header">
                <div className="page-header__badge">ANOMALY SYSTEM</div>
                <h1 className="page-header__title">怪異とは</h1>
                <div className="page-header__subtitle">電脳怪異譚　KAI-I//KILL — 討伐者ハンドブック</div>
            </div>

            {/* ===== 定義と発生原理 ===== */}
            <section className="section">
                <div className="section__number">01 — DEFINITION</div>
                <h2 className="section__heading">
                    定義と発生原理
                    <span className="section__heading-en">WHAT IS KAIJIN</span>
                </h2>
                <p className="section__desc">
                    怪異とは、集合的な噂・言説・信念が臨界点を超えた時に現実へと侵食する存在だ。専門家はこれを<span className="text-gold">バグ</span>と呼ぶ。情報が形を持ち、物理世界に干渉する現象の総称だ。
                </p>
            </section>

            <div className="content-body" style={{ marginBottom: 'var(--space-xl)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8, marginBottom: 'var(--space-md)' }}>
                    噂が広まり、信じる人間が増え、集合的な信念の密度が閾値を超えると現実にバグとして出力される。拡散速度と信じる人間の数が怪異の規模と強度に影響する。オカルトがフィクションとして消費され怪談として語られることも噂の拡散に寄与する。この世界においてオカルトコンテンツは怪異の燃料だ。
                </p>
            </div>

            <div className="callout" style={{ marginBottom: 'var(--space-2xl)' }}>
                <div className="callout__label">一般人との関係：</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                    怪異は一般人にも見える。干渉もできる。体験は鮮明に残る。しかし話しても誰も信じてくれない。友人には幻覚と笑われ、医者にはストレスと処理される。討伐者と一般人の差は能力ではなく知識・訓練・装備の差だ。
                </p>
            </div>

            {/* ===== 核とルール ===== */}
            <section className="section">
                <div className="section__number">02 — CORE & RULE</div>
                <h2 className="section__heading">
                    核とルール
                    <span className="section__heading-en">CORE & RULE</span>
                </h2>
            </section>

            <div className="two-col" style={{ marginBottom: 'var(--space-2xl)' }}>
                <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-sm)' }}>
                        CORE — 核
                    </div>
                    <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-sm)' }}>核とは何か</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
                        怪異の存在の中心であり消滅条件の鍵だ。基本的には<span className="text-gold">物に宿る。</span>特定の場所・道具・建造物・記録媒体などが核になる。稀に死体や生きた人間に宿る場合があり、対処の難度と倫理的複雑さが跳ね上がる。核を無効化・破壊することが怪異消滅の最短経路だが、どこに何が核なのかは調査と解明を経て初めて分かる。
                    </p>
                </div>
                <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-sm)' }}>
                        RULE — ルール
                    </div>
                    <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-sm)' }}>ルールとは何か</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
                        怪異が人間を害するための条件だ。怪異はこのルールに従ってしか人間を害せない。<span className="text-danger">ルールを破れば破るほど怪異から逃げられなくなる。</span>ルールは怪異が人を捕捉・追跡するトリガーでもある。強い怪異ほどルールが複雑で厳密になる傾向がある。
                    </p>
                </div>
            </div>

            {/* ===== 怪異の分類 ===== */}
            <section className="section">
                <div className="section__number">03 — CLASSIFICATION</div>
                <h2 className="section__heading">
                    怪異の分類
                    <span className="section__heading-en">CLASSIFICATION</span>
                </h2>
            </section>

            {/* 古い怪異 vs 新しい怪異 */}
            <div className="two-col" style={{ marginBottom: 'var(--space-xl)' }}>
                <div style={{ background: 'var(--bg-card)', padding: 'var(--space-lg)', border: 'var(--border-subtle)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
                        OLD TYPE
                    </div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>古い怪異</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
                        長い歴史の中で語り継がれ積み上げられた怪異。民俗学・文献・口承によって対処法が存在する場合が多い。強さは桁違いだが知識があれば攻略の糸口がある。
                    </p>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: 'var(--space-lg)', border: 'var(--border-subtle)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
                        NEW TYPE
                    </div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>新しい怪異</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
                        現代の情報社会で生まれた怪異。SNS・都市伝説・ネットロアが発生源。強さは低めだが初見殺しと未知数が最大のリスク。データベースに記録がなく対処法が存在しない。
                    </p>
                </div>
            </div>

            {/* 永続性による分類 */}
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-md)', borderLeft: '4px solid var(--accent-gold)', paddingLeft: 'var(--space-md)' }}>
                永続性による分類
            </h3>
            <div className="content-body" style={{ marginBottom: 'var(--space-xl)' }}>
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '120px' }}>分類</th>
                            <th>特徴</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>一時型</td>
                            <td>核が破壊されると消滅する標準的な怪異</td>
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>循環型</td>
                            <td>核を破壊しても噂が続く限り再出現する。討伐は根絶ではなく制圧だ</td>
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>定着型</td>
                            <td>特定の土地そのものに根を張った怪異。破壊困難な場合は封鎖・放置される</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* ===== 等級体系 ===== */}
            <section className="section">
                <div className="section__number">04 — GRADE SYSTEM</div>
                <h2 className="section__heading">
                    存在強度等級
                    <span className="section__heading-en">EXISTENCE GRADE</span>
                </h2>
                <p className="section__desc" style={{ marginBottom: 'var(--space-lg)' }}>
                    信念密度と永続性で決まる。等級が高いほど強く、低いほど弱い。
                </p>
            </section>

            <div className="content-body" style={{ marginBottom: 'var(--space-xl)' }}>
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '80px' }}>等級</th>
                            <th style={{ width: '80px' }}>位置づけ</th>
                            <th>特徴</th>
                            <th>討伐プロセス</th>
                        </tr>
                    </thead>
                    <tbody>
                        {grades.map((g, i) => (
                            <tr key={i}>
                                <td><span className={`badge ${g.css}`}>{g.grade}</span></td>
                                <td style={{ fontWeight: 700, color: 'var(--text-heading)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>{g.role}</td>
                                <td style={{ color: 'var(--text-primary)' }}>{g.desc}</td>
                                <td style={{ fontSize: 'var(--font-size-sm)' }}>{g.process}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ===== 脅威度種別 ===== */}
            <section className="section">
                <div className="section__number">05 — THREAT TYPE</div>
                <h2 className="section__heading">
                    脅威度種別
                    <span className="section__heading-en">THREAT CLASSIFICATION</span>
                </h2>
                <p className="section__desc" style={{ marginBottom: 'var(--space-lg)' }}>
                    害意の有無と条件で決まる。存在強度とは独立した軸。強いが安全な怪異（一級丁種）、弱いが危険な怪異（五級甲種）が存在する。
                </p>
            </section>

            <div className="content-body" style={{ marginBottom: 'var(--space-xl)' }}>
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '80px' }}>種別</th>
                            <th>行動特性</th>
                        </tr>
                    </thead>
                    <tbody>
                        {threatTypes.map((t, i) => (
                            <tr key={i}>
                                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: t.color }}>{t.type}</td>
                                <td>{t.desc}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ===== 改造個体と別個体 ===== */}
            <section className="section">
                <div className="section__number">06 — MUTATION</div>
                <h2 className="section__heading">
                    改造個体と別個体
                    <span className="section__heading-en">MODIFIED & SEPARATE</span>
                </h2>
            </section>

            <div className="two-col" style={{ marginBottom: 'var(--space-xl)' }}>
                <div style={{ background: 'var(--bg-card)', padding: 'var(--space-lg)', border: 'var(--border-subtle)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
                        MODIFIED — ルール変質50%未満
                    </div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>改造個体</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
                        元の知識がある程度通用するが、決定的にルールが食い違う瞬間がある。途中まで既知の怪異と完全に一致して、ある一点で裏切られる。
                    </p>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: 'var(--space-lg)', border: 'var(--border-subtle)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-danger)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
                        SEPARATE — ルール変質50%以上
                    </div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>別個体</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
                        新しい核と新しいルールを持つ完全に別の怪異。元の知識はほぼ役に立たない。それまでの解明作業が全て無効になる。
                    </p>
                </div>
            </div>

            {/* ===== 討伐の三段階 ===== */}
            <section className="section">
                <div className="section__number">07 — ELIMINATION PROCESS</div>
                <h2 className="section__heading">
                    討伐の三段階
                    <span className="section__heading-en">THREE PHASES</span>
                </h2>
            </section>

            <div className="callout" style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="callout__label">等級別の原則：</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                    五級・四級は雑魚だ。見つけ次第叩ける。三級は中ボス——力押しも可能だが、調べてから挑んだ方が確実に生き残れる。二級以上は調べなければ勝てない。
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.04)', border: 'var(--border-subtle)', marginBottom: 'var(--space-xl)' }}>
                {[
                    { phase: 'PHASE 1', title: '調査プロセス', desc: '怪異の存在を確認し正体と性質を特定する。核の所在、被害パターン、発生源の噂を調べ上げる。聞き込み・物的証拠の収集・データベース照会・文献調査・SNS追跡・現地直接観察が手段となる。', note: '二級以上は必須 / 三級は任意' },
                    { phase: 'PHASE 2', title: '解明プロセス', desc: '怪異のルールを特定し弱点につながる法則を見つける。このプロセスそのものが命がけだ。ルールを破れば逃げられなくなる。情報収集と生存のトレードオフが常に発生する。', note: '二級以上は必須 / 三級は任意' },
                    { phase: 'PHASE 3', title: '討伐プロセス', desc: '調査と解明で得た情報を元に怪異を無力化する。核を破壊または無効化する方法は怪異によって異なる。二級以上の怪異は戦闘力だけでは解決できない。', note: '全等級共通' },
                ].map((phase, i) => (
                    <div key={i} style={{ background: 'var(--bg-card)', padding: 'var(--space-lg) var(--space-xl)', display: 'flex', gap: 'var(--space-lg)', alignItems: 'flex-start' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', minWidth: '80px', paddingTop: '4px' }}>
                            {phase.phase}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-xs)' }}>{phase.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>{phase.desc}</p>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', marginTop: 'var(--space-xs)', opacity: 0.8 }}>{phase.note}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ===== 怪異と神 ===== */}
            <div className="callout" style={{ marginBottom: 'var(--space-2xl)' }}>
                <div className="callout__label">怪異と神について：</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                    「恐れられているか信仰されているかの違いだけだ。」——討伐者の間ではそう語られている。真偽は不明だ。ただし神社の御神体が怪異化したという記録が残っていることは事実だ。
                </p>
            </div>

            {/* ===== 関連ページ ===== */}
            <section className="section">
                <div className="section__number">RELATED</div>
                <h2 className="section__heading">
                    関連ページ
                    <span className="section__heading-en">SEE ALSO</span>
                </h2>
            </section>

            <div className="card-grid" style={{ marginBottom: 'var(--space-3xl)' }}>
                <Link href="/world/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card">
                        <div className="card__icon">◉</div>
                        <div className="card__title-en">WORLD BIBLE</div>
                        <h3 className="card__title">世界観バイブル</h3>
                        <p className="card__desc">怪異・能力・装備・組織を含む世界観の全文。</p>
                    </div>
                </Link>
                <Link href="/glossary/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card">
                        <div className="card__icon">▤</div>
                        <div className="card__title-en">GLOSSARY</div>
                        <h3 className="card__title">用語集</h3>
                        <p className="card__desc">怪異関連の専門用語をカテゴリ別に検索。</p>
                    </div>
                </Link>
                <Link href="/community/anomalies/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card">
                        <div className="card__icon">◇</div>
                        <div className="card__title-en">COMMUNITY</div>
                        <h3 className="card__title">怪異調査書一覧</h3>
                        <p className="card__desc">プレイヤーが投稿した怪異調査書を閲覧する。</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
