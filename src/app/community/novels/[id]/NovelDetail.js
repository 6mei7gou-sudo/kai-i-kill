// 小説詳細クライアントコンポーネント
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

export default function NovelDetail({ id }) {
    const { user } = useUser();
    const [entry, setEntry] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const { data } = await supabase.from('novels').select('*').eq('id', id).single();
            setEntry(data || null);
            setLoading(false);
        })();
    }, [id]);

    if (loading) {
        return <div className="container" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--text-muted)' }}>読み込み中...</div>;
    }
    if (!entry) {
        return <div className="container" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--text-muted)' }}>小説が見つかりませんでした。</div>;
    }

    const isOwner = user && entry.user_id && user.id === entry.user_id;
    const wordCount = (entry.body || '').length;
    const minutes = Math.ceil(wordCount / 600);
    const featuredChars = entry.featured_characters || [];
    const featuredAnoms = entry.featured_anomalies || [];

    return (
        <div className="container">
            <Link href="/community/novels/" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--accent-cyber)', textDecoration: 'none' }}>← 一覧に戻る</Link>

            {/* ヘッダー */}
            <div style={{ marginTop: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
                {entry.thumbnail_url && (
                    <img src={entry.thumbnail_url} alt="" style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', marginBottom: 'var(--space-md)' }} />
                )}
                {entry.is_official && (
                    <span style={{ display: 'inline-block', marginBottom: '8px', padding: '4px 12px', fontSize: '11px', fontWeight: 700, background: 'rgba(192,208,224,0.15)', border: '1px solid rgba(192,208,224,0.4)', color: '#c0d0e0', fontFamily: 'var(--font-mono)' }}>
                        ★ OFFICIAL
                    </span>
                )}
                <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-sm)' }}>{entry.title}</h1>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span>by {entry.author_name}</span>
                    <span>· {wordCount.toLocaleString()}字 / 約{minutes}分</span>
                    <span>· {new Date(entry.created_at).toLocaleDateString('ja-JP')}</span>
                </div>
                {(entry.warnings || []).length > 0 && (
                    <div style={{ marginTop: 'var(--space-md)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {entry.warnings.map(w => (
                            <span key={w} style={{ padding: '4px 10px', fontSize: '11px', fontFamily: 'var(--font-mono)', background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.3)', color: '#ffaa00' }}>
                                ⚠ {w}
                            </span>
                        ))}
                    </div>
                )}
                {entry.summary && (
                    <p style={{ marginTop: 'var(--space-md)', color: 'var(--text-secondary)', fontSize: 'var(--font-size-md)', lineHeight: 1.7, padding: 'var(--space-md)', background: 'var(--bg-card)', borderLeft: '3px solid var(--accent-gold)' }}>
                        {entry.summary}
                    </p>
                )}
                {isOwner && (
                    <div style={{ marginTop: 'var(--space-md)' }}>
                        <Link href={`/create/novel/${entry.id}/`} style={{
                            padding: '6px 14px',
                            background: 'rgba(212,175,55,0.15)', border: '1px solid var(--accent-gold-border)',
                            color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)', fontSize: '12px',
                            textDecoration: 'none',
                        }}>
                            ▶ 編集
                        </Link>
                    </div>
                )}
            </div>

            {/* 本文 */}
            <div style={{
                background: 'var(--bg-card)', border: 'var(--border-subtle)',
                padding: 'var(--space-2xl)', marginBottom: 'var(--space-2xl)',
                whiteSpace: 'pre-wrap', lineHeight: 1.9, fontSize: 'var(--font-size-md)',
                color: 'var(--text-primary)',
            }}>
                {entry.body}
            </div>

            {/* 登場キャラ */}
            {featuredChars.length > 0 && (
                <div style={{ background: 'var(--bg-card)', border: 'var(--border-subtle)', padding: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
                        FEATURED CHARACTERS
                    </div>
                    <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-md)' }}>登場キャラクター</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-sm)' }}>
                        {featuredChars.map(c => (
                            <Link key={c.id} href={`/community/characters/${c.id}/`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '8px 12px', background: 'rgba(0,0,0,0.2)',
                                    border: 'var(--border-subtle)',
                                    transition: 'border-color 0.2s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,255,170,0.4)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                                >
                                    {c.icon_url ? (
                                        <img src={c.icon_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: 36, height: 36, background: 'rgba(0,255,170,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>☖</div>
                                    )}
                                    <div style={{ flex: 1, fontSize: '13px', color: 'var(--text-primary)' }}>
                                        <div style={{ fontWeight: 700 }}>{c.name}</div>
                                        {c.affiliation && <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{c.affiliation}</div>}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* 登場怪異 */}
            {featuredAnoms.length > 0 && (
                <div style={{ background: 'var(--bg-card)', border: 'var(--border-subtle)', padding: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
                        FEATURED ANOMALIES
                    </div>
                    <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-md)' }}>登場した怪異</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-sm)' }}>
                        {featuredAnoms.map(a => (
                            <Link key={a.id} href={`/community/anomalies/${a.id}/`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '8px 12px', background: 'rgba(0,0,0,0.2)',
                                    border: 'var(--border-subtle)',
                                    transition: 'border-color 0.2s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,77,77,0.4)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                                >
                                    {a.icon_url ? (
                                        <img src={a.icon_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: 36, height: 36, background: 'rgba(255,77,77,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>△</div>
                                    )}
                                    <div style={{ flex: 1, fontSize: '13px', color: 'var(--text-primary)' }}>
                                        <div style={{ fontWeight: 700 }}>{a.name}</div>
                                        {a.grade && <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{a.grade}</div>}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
