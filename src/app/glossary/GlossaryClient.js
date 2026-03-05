// 用語集ページ — クライアントコンポーネント（検索・フィルター）
'use client';

import { useState, useMemo } from 'react';

export default function GlossaryClient({ data }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('すべて');

    // カテゴリ一覧を抽出
    const categories = useMemo(() => {
        const cats = new Set(data.map(entry => entry.category).filter(Boolean));
        return ['すべて', ...Array.from(cats)];
    }, [data]);

    // フィルタリング
    const filteredEntries = useMemo(() => {
        return data.filter(entry => {
            const matchesSearch = searchQuery === '' ||
                entry.name.includes(searchQuery) ||
                entry.description.includes(searchQuery) ||
                entry.related.some(r => r.includes(searchQuery));

            const matchesCategory = activeCategory === 'すべて' || entry.category === activeCategory;

            return matchesSearch && matchesCategory;
        });
    }, [data, searchQuery, activeCategory]);

    return (
        <div className="container">
            {/* ページヘッダー */}
            <div className="page-header">
                <div className="page-header__badge">GLOSSARY — TERMINOLOGY DATABASE</div>
                <h1 className="page-header__title">用語集</h1>
                <div className="page-header__subtitle">
                    電脳怪異譚　KAI-I//KILL — 討伐者ハンドブック
                    <span className="badge badge--gold" style={{ marginLeft: '12px' }}>
                        {data.length}件
                    </span>
                </div>
            </div>

            {/* 検索フィールド */}
            <div className="glossary-search">
                <span className="glossary-search__icon">⌕</span>
                <input
                    type="text"
                    className="glossary-search__input"
                    placeholder="用語を検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* カテゴリフィルター */}
            <div className="glossary-filters">
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`glossary-filter-btn ${activeCategory === cat ? 'glossary-filter-btn--active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* 検索結果件数 */}
            <p style={{
                color: 'var(--text-muted)',
                fontSize: 'var(--font-size-sm)',
                marginBottom: 'var(--space-lg)',
                fontFamily: 'var(--font-mono)'
            }}>
                {filteredEntries.length} / {data.length} 件表示
            </p>

            {/* 用語一覧 */}
            <div>
                {filteredEntries.map((entry, i) => (
                    <div key={i} className="glossary-entry">
                        <h3 className="glossary-entry__name">
                            {entry.name}
                            {entry.importance && (
                                <span style={{
                                    marginLeft: '8px',
                                    color: entry.importance === '★' ? 'var(--accent-gold)' : 'var(--accent-danger)',
                                    fontSize: '0.9em'
                                }}>
                                    {entry.importance}
                                </span>
                            )}
                        </h3>
                        <div className="glossary-entry__meta">
                            {entry.category && (
                                <span className="badge badge--gold">{entry.category}</span>
                            )}
                            {entry.date && (
                                <span className="badge badge--muted">{entry.date}</span>
                            )}
                            {entry.related.length > 0 && entry.related.map((rel, j) => (
                                <span key={j} style={{
                                    color: 'var(--accent-gold)',
                                    cursor: 'pointer',
                                    fontSize: 'var(--font-size-xs)',
                                    transition: 'color var(--transition-fast)',
                                }}
                                    onClick={() => setSearchQuery(rel)}>
                                    {rel}
                                </span>
                            ))}
                        </div>
                        <p className="glossary-entry__desc">{entry.description}</p>
                    </div>
                ))}

                {filteredEntries.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: 'var(--space-3xl)',
                        color: 'var(--text-muted)'
                    }}>
                        該当する用語が見つかりませんでした。
                    </div>
                )}
            </div>
        </div>
    );
}
