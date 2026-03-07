// 導入ページ — 怪異・能力・装備のイントロダクション
import Link from 'next/link';

export const metadata = {
    title: '怪異・能力・装備 — 電脳怪異譚 KAI-I//KILL',
    description: 'この世界の三つの柱を知る。怪異とは何か、討伐者が扱う二つの力、そして装備の体系。',
};

export default function IntroAnomaliesPage() {
    return (
        <div className="container">
            {/* ページヘッダー */}
            <div className="page-header">
                <div className="page-header__badge">INTRODUCTION</div>
                <h1 className="page-header__title">怪異・能力・装備</h1>
                <div className="page-header__subtitle">電脳怪異譚　KAI-I//KILL — 討伐者ハンドブック</div>
            </div>

            <div className="callout" style={{ marginBottom: 'var(--space-2xl)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
                    このページでは、この世界を構成する三つの柱——<span className="text-gold">怪異</span>・<span className="text-gold">能力</span>・<span className="text-gold">装備</span>を簡潔に紹介する。
                    詳細は<Link href="/world/" style={{ color: 'var(--accent-gold)' }}>世界観バイブル</Link>を参照。
                </p>
            </div>

            {/* ===== 怪異 ===== */}
            <section className="section">
                <div className="section__number">01 — ANOMALY</div>
                <h2 className="section__heading">
                    怪異
                    <span className="section__heading-en">KAIJIN</span>
                </h2>
            </section>

            <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <p className="section__desc" style={{ marginBottom: 'var(--space-lg)' }}>
                    噂が広まり、信じる人間が増え、集合的な信念が臨界点を超えると——それは現実に<span className="text-gold">バグ</span>として出力される。これが怪異だ。
                </p>

                <div className="two-col" style={{ marginBottom: 'var(--space-lg)' }}>
                    <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-sm)' }}>
                            CORE — 核
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
                            怪異の存在の中心。物・場所・記録媒体に宿る。<span className="text-gold">核を壊せば怪異は消える。</span>
                        </p>
                    </div>
                    <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-sm)' }}>
                            RULE — ルール
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
                            怪異が人を害するための条件。<span className="text-danger">ルールを破るほど逃げられなくなる。</span>
                        </p>
                    </div>
                </div>

                <div className="content-body" style={{ marginBottom: 'var(--space-lg)' }}>
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '90px' }}>強さ</th>
                                <th>概要</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><span className="badge badge--grade-special">特級〜一級</span></td>
                                <td>歴史ある強大な怪異。調査・解明なしでは討伐不可能。特級は封印しかできない</td>
                            </tr>
                            <tr>
                                <td><span className="badge badge--grade-2">二級〜三級</span></td>
                                <td>本格的な怪異。二級は解明必須、三級は力押しも可能だが調べた方が安全</td>
                            </tr>
                            <tr>
                                <td><span className="badge badge--muted">四級〜五級</span></td>
                                <td>日常的に湧く害獣。見つけ次第叩ける。討伐者の日常業務</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="callout">
                    <div className="callout__label">討伐の原則：</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        調査して、解明して、討伐する。この三段階が基本だ。戦闘力だけで解決できる怪異は存在しない——雑魚を除いて。
                    </p>
                </div>
            </div>

            {/* ===== 能力 ===== */}
            <section className="section">
                <div className="section__number">02 — POWERS</div>
                <h2 className="section__heading">
                    二つの力
                    <span className="section__heading-en">MAGIC & ANOMALY POWER</span>
                </h2>
            </section>

            <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <p className="section__desc" style={{ marginBottom: 'var(--space-lg)' }}>
                    討伐者が扱う力は二種類ある。どちらもリスクを伴う。
                </p>

                <div className="two-col" style={{ marginBottom: 'var(--space-lg)' }}>
                    <div style={{ background: 'var(--bg-card)', padding: 'var(--space-lg)', border: 'var(--border-subtle)' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
                            CHEAT CODE
                        </div>
                        <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-sm)' }}>魔法</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8, marginBottom: 'var(--space-md)' }}>
                            世界のソースコードへの直接介入。訓練と資格で習得する外部の力。8つの魔法言語（P、Igniscript、Lupis Surf、Ivyo、NGT、Monyx、P:、P'）が存在する。
                        </p>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-danger)', opacity: 0.9 }}>
                            RISK: 大きな魔法ほど怪異を生む
                        </div>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: 'var(--space-lg)', border: 'var(--border-subtle)' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
                            APPLICATION
                        </div>
                        <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-sm)' }}>異能</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8, marginBottom: 'var(--space-md)' }}>
                            内側から生まれる力。怪異と同じ発生原理を持ち、体験や執着から発現する。訓練では習得できない。
                        </p>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-danger)', opacity: 0.9 }}>
                            RISK: 使うたびに自分が怪異に近づく（侵食率上昇）
                        </div>
                    </div>
                </div>

                <div className="callout">
                    <div className="callout__label">魔法と異能の違い：</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        魔法は外から世界を書き換える。異能は内側から力を引き出す。魔法は怪異を生み、異能は使用者を変質させる。どちらの力も無代償ではない。
                    </p>
                </div>
            </div>

            {/* ===== 装備 ===== */}
            <section className="section">
                <div className="section__number">03 — EQUIPMENT</div>
                <h2 className="section__heading">
                    装備体系
                    <span className="section__heading-en">ARMAMENTS</span>
                </h2>
            </section>

            <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <p className="section__desc" style={{ marginBottom: 'var(--space-lg)' }}>
                    討伐者の装備は六つの分類に体系化されている。所属や資金力によって使えるものが変わる。
                </p>

                <div className="content-body" style={{ marginBottom: 'var(--space-lg)' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>分類</th>
                                <th>概要</th>
                                <th style={{ width: '80px' }}>使いやすさ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>武装型</td>
                                <td>刀・銃・杖など携行武器。最も歴史が長く誰でも扱える</td>
                                <td style={{ textAlign: 'center', color: 'var(--accent-gold)' }}>◎</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>独立型</td>
                                <td>偵察ドローンや支援機。自律行動で索敵・援護を行う</td>
                                <td style={{ textAlign: 'center', color: 'var(--accent-gold)' }}>○</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>半装身型</td>
                                <td>腕部装甲や背面ユニットなど部位強化装備。カスタム向き</td>
                                <td style={{ textAlign: 'center', color: 'var(--accent-gold)' }}>○</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>全装身型</td>
                                <td>全身を覆う高火力装備。一般市民に見られると都市伝説になる</td>
                                <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>△</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>搭乗型</td>
                                <td>バイクから特殊車両まで。機動力と輸送に特化</td>
                                <td style={{ textAlign: 'center', color: 'var(--accent-gold)' }}>○</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>戦闘用搭乗型</td>
                                <td>大型怪異討伐用の機動兵器。個人所有は法律で禁止</td>
                                <td style={{ textAlign: 'center', color: 'var(--accent-danger)' }}>✕</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="callout">
                    <div className="callout__label">メーカーについて：</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        蒼鉄機工（国家系・安定品質）、雷禽重工（独立系・高出力）、銀鎚精機（カスタムメイド）など複数の企業が装備を製造している。出自不明の闇市場品も流通している。
                    </p>
                </div>
            </div>

            {/* ===== 深掘りリンク ===== */}
            <section className="section">
                <div className="section__number">MORE — DEEP DIVE</div>
                <h2 className="section__heading">
                    もっと知る
                    <span className="section__heading-en">FURTHER READING</span>
                </h2>
            </section>

            <div className="card-grid" style={{ marginBottom: 'var(--space-3xl)' }}>
                <Link href="/world/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card">
                        <div className="card__icon">◉</div>
                        <div className="card__title-en">WORLD BIBLE</div>
                        <h3 className="card__title">世界観バイブル</h3>
                        <p className="card__desc">
                            怪異の等級体系・分類・脅威度・討伐プロセス・魔法言語・装備の詳細を網羅した世界観の全文。
                        </p>
                    </div>
                </Link>
                <Link href="/organizations/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card">
                        <div className="card__icon">⛊</div>
                        <div className="card__title-en">FACTIONS</div>
                        <h3 className="card__title">三種の討伐者</h3>
                        <p className="card__desc">
                            祓部・傭兵・無所属。それぞれの強み・制約・文化を知る。
                        </p>
                    </div>
                </Link>
                <Link href="/glossary/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card">
                        <div className="card__icon">▤</div>
                        <div className="card__title-en">GLOSSARY</div>
                        <h3 className="card__title">用語集</h3>
                        <p className="card__desc">
                            専門用語をカテゴリ別に検索。初めての人はここから。
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
