// 画像ダウンロードページ — ロゴ・エンブレム・サムネイルなどをカテゴリ別に配布
import downloads from '@/data/downloads.json';

export const metadata = {
    title: '画像ダウンロード — 電脳怪異譚 KAI-I//KILL',
    description: 'ロゴ・企業エンブレム・サムネイル・勢力エンブレムなどの公式画像配布ページ。',
};

const totalCount = downloads.reduce((sum, c) => sum + c.items.length, 0);

export default function DownloadsPage() {
    return (
        <div className="container">
            <div className="page-header">
                <div className="page-header__badge">DOWNLOADS</div>
                <h1 className="page-header__title">画像ダウンロード</h1>
                <div className="page-header__subtitle">
                    公式素材：ロゴ・企業エンブレム・サムネイル・勢力エンブレム
                </div>
            </div>

            <div className="callout" style={{ marginBottom: 'var(--space-xl)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8, margin: 0 }}>
                    画像はクリックでダウンロードできます。
                    利用にあたっては <a href="/guidelines/" style={{ color: 'var(--accent-gold)' }}>二次創作・イベント参加ガイドライン</a> をご確認ください。
                </p>
            </div>

            {totalCount === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-2xl) 0', fontStyle: 'italic' }}>
                    画像は順次追加されます。準備中です。
                </p>
            ) : (
                downloads.map((cat) => (
                    <section key={cat.category} style={{ marginBottom: 'var(--space-2xl)' }}>
                        <div style={{
                            display: 'flex', alignItems: 'baseline', gap: 'var(--space-md)',
                            paddingBottom: 'var(--space-sm)',
                            borderBottom: '1px solid rgba(212,175,55,0.2)',
                            marginBottom: 'var(--space-lg)',
                        }}>
                            <h2 style={{
                                fontSize: 'var(--font-size-xl)', color: 'var(--text-primary)', margin: 0,
                                fontWeight: 700,
                            }}>
                                {cat.category}
                            </h2>
                            <span style={{
                                fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)',
                                color: 'var(--accent-gold)', letterSpacing: '0.1em',
                            }}>
                                {cat.categoryEn}
                            </span>
                            <span style={{
                                marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '11px',
                                color: 'var(--text-muted)',
                            }}>
                                {cat.items.length} 件
                            </span>
                        </div>

                        {cat.description && (
                            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-lg)' }}>
                                {cat.description}
                            </p>
                        )}

                        {cat.items.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 'var(--font-size-sm)' }}>
                                このカテゴリの画像は準備中です。
                            </p>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                gap: 'var(--space-lg)',
                            }}>
                                {cat.items.map((item) => (
                                    <DownloadCard key={item.file} item={item} />
                                ))}
                            </div>
                        )}
                    </section>
                ))
            )}
        </div>
    );
}

function DownloadCard({ item }) {
    const url = `/downloads/${item.file}`;
    return (
        <div style={{
            background: 'var(--bg-card)', border: 'var(--border-subtle)',
            display: 'flex', flexDirection: 'column',
        }}>
            <div style={{
                width: '100%', aspectRatio: '1 / 1',
                background: 'rgba(0,0,0,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
            }}>
                <img
                    src={url}
                    alt={item.name}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
            </div>
            <div style={{ padding: 'var(--space-md)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                    {item.name}
                </div>
                {item.size && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                        {item.size}
                    </div>
                )}
                {item.license && (
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 'var(--space-xs)' }}>
                        {item.license}
                    </div>
                )}
                <a
                    href={url}
                    download={item.file}
                    style={{
                        marginTop: 'auto',
                        display: 'inline-block', textAlign: 'center',
                        padding: '8px 12px',
                        background: 'rgba(212,175,55,0.1)',
                        border: '1px solid var(--accent-gold-border)',
                        color: 'var(--accent-gold)',
                        fontFamily: 'var(--font-mono)', fontSize: '11px',
                        textDecoration: 'none', cursor: 'pointer',
                    }}
                >
                    ▼ ダウンロード
                </a>
            </div>
        </div>
    );
}
