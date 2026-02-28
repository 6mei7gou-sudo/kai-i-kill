// 世界観ページ — World Bible（プレイヤー版）をセクション別に表示
import fs from 'fs';
import path from 'path';

function loadWorldBible() {
    const filePath = path.join(process.cwd(), 'data', 'world_bible.json');
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return [];
}

export const metadata = {
    title: '世界観 — 電脳怪異譚 KAI-I//KILL',
    description: '近未来の架空日本、怪異の定義、魔法と異能の体系、装備分類、討伐プロセスなど世界観バイブルの全文を公開。',
};

export default function WorldPage() {
    const sections = loadWorldBible();

    return (
        <div className="container">
            <section className="section">
                <span className="section__title">// World Bible</span>
                <h1 className="section__heading">世界観バイブル</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)', maxWidth: '800px' }}>
                    討伐者が知るべき世界の基本情報をまとめた資料です。秘匿レベルの情報は含まれません。
                </p>
            </section>

            {/* サイドナビ + コンテンツ */}
            <div className="world-layout">
                {/* サイドナビゲーション */}
                <nav className="world-sidebar">
                    {sections.map((section, i) => (
                        <a
                            key={i}
                            href={`#section-${i}`}
                            className="world-sidebar__link"
                        >
                            {section.title}
                        </a>
                    ))}
                </nav>

                {/* コンテンツ本文 */}
                <div className="content-body" style={{ flex: 1 }}>
                    {sections.map((section, i) => (
                        <article key={i} id={`section-${i}`} style={{ marginBottom: 'var(--space-3xl)' }}>
                            <h2>{section.title}</h2>
                            {section.body.split('\n\n').map((paragraph, j) => {
                                if (paragraph.includes('\t') || paragraph.match(/^.+\n.+\n/m)) {
                                    return <p key={j} style={{ whiteSpace: 'pre-wrap' }}>{paragraph}</p>;
                                }
                                return <p key={j}>{paragraph}</p>;
                            })}
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
}

