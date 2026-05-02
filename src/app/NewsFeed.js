// News & Release フィード — トップページ用クライアントコンポーネント
// DB投稿 + 静的サイトニュースを統合表示
'use client';

import { useState, useEffect } from 'react';
import { SITE_NEWS } from '@/data/siteNews';

const CATEGORY_STYLE = {
    news: { label: 'NEWS', color: '#d4af37', bg: 'rgba(212,175,55,0.1)', border: 'rgba(212,175,55,0.3)' },
    release: { label: 'RELEASE', color: '#00ffaa', bg: 'rgba(0,255,170,0.1)', border: 'rgba(0,255,170,0.3)' },
    event: { label: 'EVENT', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)' },
};

// 静的ニュースをDB形式に変換
function toPostFormat(item, idx) {
    return {
        id: `site_${idx}`,
        title: item.title,
        body: item.body || '',
        category: item.category || 'news',
        created_at: item.date + 'T00:00:00Z',
    };
}

export default function NewsFeed() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetch('/api/news?limit=20')
            .then(res => res.json())
            .then(json => {
                const dbPosts = json.data || [];
                const sitePosts = SITE_NEWS.map(toPostFormat);
                // 統合して日付降順ソート
                const all = [...dbPosts, ...sitePosts].sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
                setPosts(all);
            })
            .catch(() => setPosts(SITE_NEWS.map(toPostFormat)))
            .finally(() => setLoading(false));
    }, []);

    const filtered = filter === 'all' ? posts : posts.filter(p => p.category === filter);

    return (
        <div style={{ marginBottom: 'var(--space-3xl)', maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }}>
            {/* フィルタタブ */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-lg)' }}>
                {['all', 'news', 'release', 'event'].map(key => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        style={{
                            padding: '6px 16px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--font-size-xs)',
                            background: filter === key ? 'rgba(212,175,55,0.1)' : 'transparent',
                            border: filter === key ? '1px solid rgba(212,175,55,0.3)' : '1px solid rgba(255,255,255,0.05)',
                            color: filter === key ? 'var(--accent-gold)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            letterSpacing: '0.05em',
                        }}
                    >
                        {key === 'all' ? 'ALL' : CATEGORY_STYLE[key]?.label || key.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* 投稿一覧 */}
            {loading ? (
                <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>読み込み中...</p>
            ) : filtered.length === 0 ? (
                <div style={{
                    padding: 'var(--space-xl)',
                    border: 'var(--border-subtle)',
                    background: 'var(--bg-card)',
                    textAlign: 'center',
                }}>
                    <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }}>
                        まだ投稿がありません
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'flex', flexDirection: 'column', gap: '2px',
                    maxHeight: '480px', overflowY: 'auto',
                    border: 'var(--border-subtle)',
                    paddingRight: '4px',
                }}>
                    {filtered.map(post => {
                        const cat = CATEGORY_STYLE[post.category] || CATEGORY_STYLE.news;
                        const date = new Date(post.created_at).toLocaleDateString('ja-JP', {
                            year: 'numeric', month: '2-digit', day: '2-digit',
                        });
                        return (
                            <div
                                key={post.id}
                                style={{
                                    padding: 'var(--space-md) var(--space-lg)',
                                    background: 'var(--bg-card)',
                                    borderLeft: `3px solid ${cat.color}`,
                                    transition: 'background 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
                                    <span style={{
                                        padding: '2px 8px',
                                        fontSize: '10px',
                                        fontFamily: 'var(--font-mono)',
                                        fontWeight: 700,
                                        letterSpacing: '0.08em',
                                        background: cat.bg,
                                        border: `1px solid ${cat.border}`,
                                        color: cat.color,
                                    }}>
                                        {cat.label}
                                    </span>
                                    <span style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 'var(--font-size-xs)',
                                        color: 'var(--text-muted)',
                                    }}>
                                        {date}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--text-heading)', marginBottom: post.body ? 'var(--space-xs)' : 0 }}>
                                    {post.title}
                                </h3>
                                {post.body && (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                                        {post.body}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
