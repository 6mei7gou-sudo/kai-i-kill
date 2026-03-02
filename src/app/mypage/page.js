// マイページ — ユーザーの投稿一覧
'use client';

import { useState, useEffect } from 'react';
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import Link from 'next/link';

// 共通カードスタイル
const cardStyle = {
    padding: '16px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(0,255,170,0.1)',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s',
};

// セクションヘッダー
function SectionHeader({ icon, title, count }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', marginTop: '32px' }}>
            <span style={{ fontSize: '1.2rem' }}>{icon}</span>
            <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h2>
            <span className="badge badge--cyber" style={{ marginLeft: '8px' }}>{count}</span>
        </div>
    );
}

// 投稿カード
function PostCard({ item, type, href }) {
    const icon = item.icon_url || item.thumbnail_url;
    return (
        <Link href={href} style={{ textDecoration: 'none' }}>
            <div
                style={cardStyle}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,255,170,0.4)'; e.currentTarget.style.background = 'rgba(0,255,170,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,255,170,0.1)'; e.currentTarget.style.background = 'rgba(0,0,0,0.3)'; }}
            >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {icon && (
                        <img src={icon} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(0,255,170,0.2)' }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '2px' }}>{type}</div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.character_name || item.gear_name || item.anomaly_name || '名称未設定'}
                        </div>
                        {item.summary && (
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.summary}
                            </div>
                        )}
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                        {item.visibility === '限定' ? '🔒' : '🌐'}
                    </span>
                </div>
            </div>
        </Link>
    );
}

export default function MyPage() {
    const { user, isLoaded } = useUser();
    const [characters, setCharacters] = useState([]);
    const [gear, setGear] = useState([]);
    const [anomalies, setAnomalies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded || !user) return;

        const fetchAll = async () => {
            setLoading(true);
            try {
                // 3テーブルを並列取得
                const [charRes, gearRes, anomalyRes] = await Promise.all([
                    fetch(`/api/posts?table=character_sheets&user_id=${user.id}`),
                    fetch(`/api/posts?table=gear_posts&user_id=${user.id}`),
                    fetch(`/api/posts?table=anomaly_drafts&user_id=${user.id}`),
                ]);
                const [charJson, gearJson, anomalyJson] = await Promise.all([
                    charRes.json(), gearRes.json(), anomalyRes.json(),
                ]);
                setCharacters(charJson.data || []);
                setGear(gearJson.data || []);
                setAnomalies(anomalyJson.data || []);
            } catch (err) {
                console.error('マイページ取得エラー:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [isLoaded, user]);

    return (
        <>
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
            <SignedIn>
                <div className="container">
                    <section className="section">
                        <span className="section__title">// MY PAGE</span>
                        <h1 className="section__heading">マイページ</h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>
                            あなたが投稿したキャラクター・装備・怪異の一覧です。
                        </p>
                    </section>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            読み込み中...
                        </div>
                    ) : (
                        <>
                            {/* キャラクター */}
                            <SectionHeader icon="☖" title="キャラクターシート" count={characters.length} />
                            {characters.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>まだキャラクターシートを投稿していません。 <Link href="/create/character/" style={{ color: 'var(--accent-gold)' }}>作成する →</Link></p>
                            ) : (
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    {characters.map(c => (
                                        <PostCard key={c.id} item={c} type="CHARACTER" href={`/community/characters/${c.id}/`} />
                                    ))}
                                </div>
                            )}

                            {/* 武器・装備 */}
                            <SectionHeader icon="⚔" title="武器・装備" count={gear.length} />
                            {gear.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>まだ武器・装備を投稿していません。 <Link href="/create/weapon/" style={{ color: 'var(--accent-gold)' }}>作成する →</Link></p>
                            ) : (
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    {gear.map(g => (
                                        <PostCard key={g.id} item={g} type="GEAR" href={`/community/gear/${g.id}/`} />
                                    ))}
                                </div>
                            )}

                            {/* 怪異調査書 */}
                            <SectionHeader icon="△" title="怪異調査書" count={anomalies.length} />
                            {anomalies.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>まだ怪異調査書を投稿していません。 <Link href="/create/anomaly/" style={{ color: 'var(--accent-gold)' }}>作成する →</Link></p>
                            ) : (
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    {anomalies.map(a => (
                                        <PostCard key={a.id} item={a} type="ANOMALY" href={`/community/anomalies/${a.id}/`} />
                                    ))}
                                </div>
                            )}

                            {/* 統計 */}
                            <div style={{ marginTop: '48px', padding: '20px', background: 'rgba(0,0,0,0.3)', border: 'var(--border-subtle)', display: 'flex', gap: '32px', justifyContent: 'center' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--accent-gold)' }}>{characters.length + gear.length + anomalies.length}</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>TOTAL POSTS</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--text-primary)' }}>{characters.length}</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>CHARACTERS</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--text-primary)' }}>{gear.length}</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>GEAR</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--text-primary)' }}>{anomalies.length}</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>ANOMALIES</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </SignedIn>
        </>
    );
}
