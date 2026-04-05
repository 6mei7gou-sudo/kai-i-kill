// コミュニティDB — カテゴリ選択ハブ
import Link from 'next/link';

export const metadata = {
    title: 'コミュニティDB — 電脳怪異譚 KAI-I//KILL',
    description: '怪異調査書・武器装備・キャラクターシート。プレイヤーの投稿を閲覧する。',
};

const CATEGORIES = [
    {
        slug: 'anomalies',
        icon: '▲',
        titleEn: 'ANOMALIES',
        title: '怪異調査書',
        desc: 'コミュニティが投稿した怪異調査書（TMP）。等級・脅威度・タグで検索できる。',
    },
    {
        slug: 'gear',
        icon: '⚔',
        titleEn: 'WEAPONS & GEAR',
        title: '武器・装備',
        desc: '武器・装備データの一覧。カテゴリ・メーカーで絞り込める。',
    },
    {
        slug: 'characters',
        icon: '◆',
        titleEn: 'CHARACTERS',
        title: 'キャラクターシート',
        desc: 'プレイヤーが作成したキャラクターシートを閲覧する。',
    },
];

export default function CommunityPage() {
    return (
        <div className="container">
            <div className="page-header">
                <div className="page-header__badge">COMMUNITY DATABASE</div>
                <h1 className="page-header__title">コミュニティDB</h1>
                <div className="page-header__subtitle">プレイヤーの投稿を閲覧する</div>
            </div>

            <div style={{ display: 'grid', gap: 'var(--space-lg)', marginBottom: 'var(--space-3xl)' }}>
                {CATEGORIES.map((cat) => (
                    <Link key={cat.slug} href={`/community/${cat.slug}/`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{
                            background: 'var(--bg-card)',
                            border: 'var(--border-subtle)',
                            padding: 'var(--space-xl)',
                            display: 'flex',
                            gap: 'var(--space-lg)',
                            alignItems: 'flex-start',
                            transition: 'border-color 0.2s',
                        }}>
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--font-size-2xl)',
                                color: 'var(--accent-gold)',
                                opacity: 0.6,
                                minWidth: '40px',
                                textAlign: 'center',
                                lineHeight: 1,
                                paddingTop: '4px',
                            }}>
                                {cat.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
                                    {cat.titleEn}
                                </div>
                                <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-sm)', color: 'var(--text-heading)' }}>
                                    {cat.title}
                                </h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-md)', lineHeight: 2.0 }}>
                                    {cat.desc}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
