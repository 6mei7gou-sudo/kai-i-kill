// 怪異記録ページ — HUD風デザイン v2
import fs from 'fs';
import path from 'path';

export const metadata = {
    title: '怪異・能力・装備 — 電脳怪異譚 KAI-I//KILL',
    description: '怪異の等級体系、分類、無力化方法、討伐プロセスなど怪異に関する公開情報データベース。',
};

const grades = [
    { grade: '特級', desc: '現状の手段では消滅が極めて困難。信念密度が桁外れに高い', example: '禁足地の核レベル。封印・管理が限界', css: 'badge--grade-special' },
    { grade: '一級', desc: '信念密度が非常に高い。長い歴史を持つ強力な怪異', example: '古い都市伝説型の強力な怪異', css: 'badge--grade-1' },
    { grade: '二級', desc: '信念密度が高い。記録のある古い怪異の大半', example: '文献に記録が残る怪異', css: 'badge--grade-2' },
    { grade: '三級', desc: '信念密度が中程度。拡散が進んだ新しい怪異など', example: 'SNSで広まった都市伝説が実体化', css: 'badge--grade-3' },
    { grade: '四級', desc: '信念密度が低い。発生したばかりの新しい怪異', example: '局所的な噂から生まれた怪異', css: 'badge--muted' },
    { grade: '五級', desc: 'ほぼ存在を認識できないレベル', example: '魔法事故由来の微小怪異', css: 'badge--muted' },
];

const threatTypes = [
    { type: '甲種', desc: '無差別に人を害する。積極的な殺傷意図を持つ', color: 'var(--accent-danger)' },
    { type: '乙種', desc: '条件付きで害する。ルールを破った者を狙う', color: 'var(--accent-gold)' },
    { type: '丙種', desc: '基本的に害さないが刺激すると害する', color: 'var(--text-secondary)' },
    { type: '丁種', desc: '人を害さない。共存可能または信仰対象に近い', color: 'var(--accent-blue)' },
];

export default function AnomaliesPage() {
    return (
        <div className="container">
            {/* ページヘッダー */}
            <div className="page-header">
                <div className="page-header__badge">PAGE 2 / 5</div>
                <h1 className="page-header__title">怪異・能力・装備</h1>
                <div className="page-header__subtitle">電脳怪異譚　KAI-I//KILL — 討伐者ハンドブック</div>
            </div>

            {/* 怪異について */}
            <section className="section">
                <div className="section__number">03 — KAIJIN SYSTEM</div>
                <h2 className="section__heading">
                    怪異について
                    <span className="section__heading-en">KAIJIN</span>
                </h2>
                <p className="section__desc">
                    怪異とは、集合的な噂・言説・信念が臨界点を超えた時に現実へと侵食する存在の総称だ。専門家はこれを<span className="text-gold">バグ</span>と呼ぶ。全ての怪異は<span className="text-gold">核</span>と<span className="text-gold">ルール</span>を持つ。
                </p>
            </section>

            {/* 核とルール — 2カラム */}
            <div className="two-col" style={{ marginBottom: 'var(--space-2xl)' }}>
                <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-sm)' }}>
                        CORE — 核
                    </div>
                    <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-sm)' }}>核とは何か</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
                        怪異の存在の中心であり消滅条件の鍵だ。基本的には<span className="text-gold">物に宿る。</span>特定の場所・道具・建造物・記録媒体などが核になる。稀に死体や生きた人間に宿る場合があり、対処の難度と倫理的複雑さが跳ね上がる。
                    </p>
                </div>
                <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-sm)' }}>
                        RULE — ルール
                    </div>
                    <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-sm)' }}>ルールとは何か</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
                        怪異が人間を害するための条件だ。<span className="text-danger">ルールを破れば破るほど怪異から逃げられなくなる。</span>ルールは怪異が人を捕捉・追跡するトリガーでもある。
                    </p>
                </div>
            </div>

            {/* 等級体系 */}
            <section className="section">
                <div className="section__number">04 — GRADE SYSTEM</div>
                <h2 className="section__heading">
                    存在強度等級
                    <span className="section__heading-en">EXISTENCE GRADE</span>
                </h2>
                <p className="section__desc" style={{ marginBottom: 'var(--space-lg)' }}>
                    信念密度と永続性で決まる。等級が高いほど強く、低いほど弱い。
                </p>

                <div className="content-body">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>等級</th>
                                <th>特徴</th>
                                <th>例</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grades.map((g, i) => (
                                <tr key={i}>
                                    <td><span className={`badge ${g.css}`}>{g.grade}</span></td>
                                    <td style={{ color: 'var(--text-primary)' }}>{g.desc}</td>
                                    <td>{g.example}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* 脅威度種別 */}
            <section className="section">
                <div className="section__number">05 — THREAT TYPE</div>
                <h2 className="section__heading">
                    脅威度種別
                    <span className="section__heading-en">THREAT CLASSIFICATION</span>
                </h2>
                <p className="section__desc" style={{ marginBottom: 'var(--space-lg)' }}>
                    害意の有無と条件で決まる。存在強度とは独立した軸。
                </p>

                <div className="content-body">
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
            </section>

            {/* 討伐プロセス */}
            <section className="section">
                <div className="section__number">06 — ELIMINATION PROCESS</div>
                <h2 className="section__heading">
                    討伐の三段階
                    <span className="section__heading-en">THREE PHASES</span>
                </h2>
            </section>

            <div className="callout" style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="callout__label">重要：</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                    戦闘力だけで解決できる怪異は存在しない。解明なしの討伐は自殺行為だ。
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.04)', border: 'var(--border-subtle)', marginBottom: 'var(--space-3xl)' }}>
                {[
                    { phase: 'PHASE 1', title: '調査プロセス', desc: '怪異の存在を確認し正体と性質を特定する。核の所在、被害パターン、発生源の噂を調べ上げる。' },
                    { phase: 'PHASE 2', title: '解明プロセス', desc: '怪異のルールを特定し弱点につながる法則を見つける。このプロセスそのものが命がけ。ルールを破れば逃げられなくなる。' },
                    { phase: 'PHASE 3', title: '討伐プロセス', desc: '調査と解明で得た情報を元に怪異を無力化する。核を破壊または無効化する方法は怪異によって異なる。' },
                ].map((phase, i) => (
                    <div key={i} style={{ background: 'var(--bg-card)', padding: 'var(--space-lg) var(--space-xl)', display: 'flex', gap: 'var(--space-lg)', alignItems: 'flex-start' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', minWidth: '80px', paddingTop: '4px' }}>
                            {phase.phase}
                        </div>
                        <div>
                            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-xs)' }}>{phase.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>{phase.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
