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
    const [missionResults, setMissionResults] = useState([]);
    const [advCompletions, setAdvCompletions] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded || !user) return;

        const fetchAll = async () => {
            setLoading(true);
            try {
                // 投稿データ取得
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

                // ゲーム戦績取得（テーブル未作成でもエラーにしない）
                try {
                    const [missionRes, advRes, achRes] = await Promise.all([
                        fetch(`/api/games?table=mission_results&user_id=${user.id}`),
                        fetch(`/api/games?table=adv_completions&user_id=${user.id}`),
                        fetch(`/api/games?table=character_achievements&user_id=${user.id}`),
                    ]);
                    const [missionJson, advJson, achJson] = await Promise.all([
                        missionRes.json(), advRes.json(), achRes.json(),
                    ]);
                    setMissionResults(missionJson.data || []);
                    setAdvCompletions(advJson.data || []);
                    setAchievements(achJson.data || []);
                } catch (_) { /* ゲームテーブル未作成時は無視 */ }
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

                            {/* ミッション戦績 */}
                            <SectionHeader icon="⚔" title="ミッション戦績" count={missionResults.length} />
                            {missionResults.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>まだミッションに挑戦していません。 <Link href="/games/mission/" style={{ color: 'var(--accent-gold)' }}>依頼掲示板 →</Link></p>
                            ) : (
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    {missionResults.slice(0, 10).map(m => {
                                        const resultColor = m.result === '勝利' ? 'var(--accent-gold)' : m.result === '敗北' ? 'var(--accent-danger)' : 'var(--text-muted)';
                                        return (
                                            <div key={m.id} style={{ ...cardStyle, cursor: 'default' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginRight: '8px' }}>{m.difficulty}</span>
                                                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.mission_name}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{m.rounds_taken}R</span>
                                                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: resultColor }}>{m.result}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* ADVクリア記録 */}
                            <SectionHeader icon="◈" title="怪異譚クリア記録" count={advCompletions.length} />
                            {advCompletions.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>まだ怪異譚をクリアしていません。 <Link href="/games/adv/" style={{ color: 'var(--accent-gold)' }}>シナリオ一覧 →</Link></p>
                            ) : (
                                <div style={{ display: 'grid', gap: '8px' }}>
                                    {advCompletions.map(a => {
                                        const typeColor = a.ending_type === 'true' ? 'var(--accent-gold)' : a.ending_type === 'good' ? 'var(--accent-blue)' : a.ending_type === 'bad' ? 'var(--accent-danger)' : 'var(--text-secondary)';
                                        return (
                                            <div key={a.id} style={{ ...cardStyle, cursor: 'default' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{a.scenario_name}</span>
                                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: typeColor }}>{a.ending_name} ({a.ending_type.toUpperCase()})</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* 実績 */}
                            {achievements.length > 0 && (
                                <>
                                    <SectionHeader icon="★" title="実績" count={achievements.length} />
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {achievements.map(a => (
                                            <span key={a.id} className="badge--gold" style={{ fontSize: 'var(--font-size-xs)' }}>{a.achievement_name}</span>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* 統計 */}
                            <div style={{ marginTop: '48px', padding: '20px', background: 'rgba(0,0,0,0.3)', border: 'var(--border-subtle)', display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--accent-gold)' }}>{characters.length + gear.length + anomalies.length}</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>TOTAL POSTS</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--text-primary)' }}>{characters.length}</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>CHARACTERS</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--text-primary)' }}>{missionResults.filter(m => m.result === '勝利').length}</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>VICTORIES</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--text-primary)' }}>{advCompletions.length}</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>ADV CLEARED</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--text-primary)' }}>{achievements.length}</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>ACHIEVEMENTS</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </SignedIn>
        </>
    );
}
