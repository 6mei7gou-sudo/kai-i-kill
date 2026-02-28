// 組織ページ — HUD風デザイン v2
import fs from 'fs';
import path from 'path';
import Link from 'next/link';

function loadOrgData(key) {
    const filePath = path.join(process.cwd(), 'data', 'organizations', `${key}.json`);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return null;
}

export const metadata = {
    title: '組織・人物 — 電脳怪異譚 KAI-I//KILL',
    description: '祓部・傭兵集団・無所属。三つの勢力の詳細と権力構造。',
};

const organizations = [
    { key: 'haraebe', name: '公的機関（祓部）', en: 'HARAEBU — PUBLIC AGENCY', icon: '⊙', desc: '魔導省の内部組織として存在する国家機関の怪異対処部門。警察や自衛隊の入隊検査で素養を持つ人間が選別されて配属される。古い怪異に関する深い知識と専門的な訓練体系を持つ。' },
    { key: 'mercenaries', name: '傭兵集団', en: 'MERCENARY GROUPS', icon: '✕', desc: '個人から集団まで様々な形を取る。大企業がバックについている討伐者集団。独立系企業の高性能魔導具やプロトタイプを運用する。二つ名を持つ個人特化型の専用装備使いが存在し伝説扱いされる。' },
    { key: 'unaffiliated', name: '無所属', en: 'UNAFFILIATED', icon: '◈', desc: '国にも企業にも属さない個人または小集団。犯罪者扱いされることも多く法的な保護がない。曰く付きの特殊装備・違法改造品・出どころ不明の専用機を使う。互いの覚醒経緯を詮索しない不文律がある。' },
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
        </div>
    );
}
