// 小説一覧クライアントコンポーネント
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function NovelList() {
    const [novels, setNovels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        (async () => {
            const { data } = await supabase
                .from('novels')
                .select('*')
                .eq('visibility', '公開')
                .order('created_at', { ascending: false });
            setNovels(data || []);
            setLoading(false);
        })();
    }, []);

    const filtered = novels.filter(n => {
        if (!search) return true;
        const q = search.toLowerCase();
        return [n.title, n.summary, n.author_name].some(v => (v || '').toLowerCase().includes(q));
    });

    if (loading) {
        return <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-2xl) 0' }}>読み込み中...</p>;
    }

    return (
        <>
            <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-lg)', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="タイトル・概要・投稿者で検索..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        flex: '1 1 300px', padding: '8px 14px',
                        background: 'var(--bg-card)', border: 'var(--border-subtle)',
                        color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '13px',
                    }}
                />
                <Link href="/create/novel/" style={{
                    padding: '8px 18px',
                    background: 'rgba(212,175,55,0.15)', border: '1px solid var(--accent-gold-border)',
                    color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)', fontSize: '12px',
                    textDecoration: 'none',
                }}>
                    ▶ 小説を投稿
                </Link>
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                    {filtered.length} / {novels.length} 件
                </span>
            </div>

            {filtered.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-2xl) 0', fontStyle: 'italic' }}>
                    {novels.length === 0 ? 'まだ投稿がありません。' : '該当する小説がありません。'}
                </p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-lg)' }}>
                    {filtered.map(n => (
                        <Link key={n.id} href={`/community/novels/${n.id}/`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div style={{
                                background: 'var(--bg-card)', border: 'var(--border-subtle)',
                                padding: 'var(--space-lg)', height: '100%',
                                display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)',
                                transition: 'border-color 0.2s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-gold-border)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                            >
                                {n.thumbnail_url && (
                                    <img src={n.thumbnail_url} alt="" style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', marginBottom: '4px' }} />
                                )}
                                {n.is_official && (
                                    <span style={{ alignSelf: 'flex-start', padding: '2px 8px', fontSize: '10px', fontWeight: 700, background: 'rgba(192,208,224,0.15)', border: '1px solid rgba(192,208,224,0.4)', color: '#c0d0e0', fontFamily: 'var(--font-mono)' }}>
                                        ★ OFFICIAL
                                    </span>
                                )}
                                <h3 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-heading)', margin: 0 }}>{n.title}</h3>
                                {n.summary && (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {n.summary}
                                    </p>
                                )}
                                <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                                    <span>{n.author_name}</span>
                                    <span>· {(n.body || '').length.toLocaleString()}字</span>
                                    {(n.featured_characters || []).length > 0 && <span>· キャラ {n.featured_characters.length}</span>}
                                    {(n.featured_anomalies || []).length > 0 && <span>· 怪異 {n.featured_anomalies.length}</span>}
                                </div>
                                {(n.warnings || []).length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                        {n.warnings.slice(0, 3).map(w => (
                                            <span key={w} style={{ fontSize: '10px', padding: '1px 6px', background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.3)', color: '#ffaa00' }}>{w}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </>
    );
}
