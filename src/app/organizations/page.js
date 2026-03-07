// 組織ページ — 三勢力の概要と権力構造
import Link from 'next/link';

export const metadata = {
    title: '組織・人物 — 電脳怪異譚 KAI-I//KILL',
    description: '祓部・傭兵集団・無所属。三つの勢力の詳細と権力構造。',
};

const organizations = [
    { key: 'haraebe', name: '公的機関（祓部）', en: 'HARAEBU — PUBLIC AGENCY', icon: '⊙', desc: '魔導省の内部組織として存在する国家機関の怪異対処部門。素養を持つ人間が選別されて配属される。規格外の実力者には指揮系統の外に置かれる特別称号《御柱》が存在する。PL作成時の職位上限は祓士。' },
    { key: 'mercenaries', name: '傭兵集団', en: 'MERCENARY GROUPS', icon: '✕', desc: '傭兵ネットワーク《Anonymous》を通じて依頼を受ける討伐者たち。E〜Aの五段階ランクで管理され、その外側に業界が自然と認めた規格外《冠名》のSランクが存在する。PL作成時のランク上限はCランク。' },
    { key: 'unaffiliated', name: '無所属', en: 'UNAFFILIATED', icon: '◈', desc: '祓部にも《Anonymous》にも属さない者たち。装備店の主人、企業の用心棒、スラムで無免許のまま戦う生存者など多様な顔を持つ。スラムにはリトルクランと呼ばれる子供たちの寄り合いも存在する。' },
];

export default function OrganizationsPage() {
    return (
        <div className="container">
            {/* ページヘッダー */}
            <div className="page-header">
                <div className="page-header__badge">PAGE 3 / 5</div>
                <h1 className="page-header__title">組織・人物</h1>
                <div className="page-header__subtitle">電脳怪異譚　KAI-I//KILL — 討伐者ハンドブック</div>
            </div>

            {/* 三種の討伐者 */}
            <section className="section">
                <div className="section__number">08 — THREE FACTIONS</div>
                <h2 className="section__heading">
                    三種の討伐者
                    <span className="section__heading-en">FACTIONS</span>
                </h2>
            </section>

            <div className="card-grid" style={{ marginBottom: 'var(--space-3xl)' }}>
                {organizations.map((org) => (
                    <Link
                        key={org.key}
                        href={`/organizations/${org.key}/`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <div className="card">
                            <div className="card__icon">{org.icon}</div>
                            <h3 className="card__title">{org.name}</h3>
                            <div className="card__title-en">{org.en}</div>
                            <p className="card__desc">{org.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* 権力の三極構造 */}
            <section className="section">
                <h2 className="section__heading">
                    権力の三極構造
                    <span className="section__heading-en">POWER STRUCTURE</span>
                </h2>
            </section>

            <div className="content-body" style={{ marginBottom: 'var(--space-3xl)' }}>
                <table>
                    <thead>
                        <tr>
                            <th>極</th>
                            <th>構成</th>
                            <th>行動原理</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>第一極</td>
                            <td>国家・蒼鉄機工（国家系企業）</td>
                            <td>秩序の維持。怪異の存在を秘匿することで秩序が成立する</td>
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>第二極</td>
                            <td>独立系企業（雷禽重工等）・傭兵集団</td>
                            <td>利益。国家にも危険な勢力にも必要とされる立場を維持して生き残る</td>
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>第三極</td>
                            <td>正体不明の組織</td>
                            <td>既存の権力構造の外側。怪異そのものを利用する勢力が存在するという情報がある</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* PL作成制限 */}
            <section className="section">
                <h2 className="section__heading">
                    キャラクター作成制限
                    <span className="section__heading-en">PC CREATION LIMITS</span>
                </h2>
            </section>

            <div className="content-body" style={{ marginBottom: 'var(--space-2xl)' }}>
                <table>
                    <thead>
                        <tr>
                            <th>所属</th>
                            <th>作成可能な上限</th>
                            <th>それ以上</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>祓部</td>
                            <td><span className="text-gold">祓士</span>（見習祓士・初任祓士も選択可）</td>
                            <td>上級祓士以上はセッション実績で到達</td>
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>傭兵</td>
                            <td><span className="text-gold">Cランク（実戦級）</span>（E・Dも選択可）</td>
                            <td>Bランク以上はセッション実績で到達</td>
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>無所属</td>
                            <td colSpan={2}>ランク制度なし。詳細は<Link href="/organizations/unaffiliated/" style={{ color: 'var(--accent-gold)' }}>無所属詳細</Link>を参照</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="callout" style={{ marginBottom: 'var(--space-3xl)' }}>
                <div className="callout__label">規格外の存在について：</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                    祓部の《御柱》・傭兵のSランク《冠名》はいずれもPLが初期作成で選べる枠ではない。物語の果てに辿り着くか、NPCとして出会うか——そういう領域の存在だ。
                </p>
            </div>
        </div>
    );
}
