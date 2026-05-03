// 小説詳細クライアントコンポーネント
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

const REPORT_REASONS = [
    { value: 'inappropriate', label: '不適切な内容（公序良俗違反など）' },
    { value: 'copyright', label: '著作権・知的財産権の侵害' },
    { value: 'harassment', label: '誹謗中傷・特定個人への攻撃' },
    { value: 'gore_excess', label: '注意タグなしの過度なグロ・性的表現' },
    { value: 'spam', label: 'スパム・無関係な内容' },
    { value: 'other', label: 'その他' },
];

export default function NovelDetail({ id }) {
    const { user } = useUser();
    const [entry, setEntry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reportOpen, setReportOpen] = useState(false);
    const [reportReason, setReportReason] = useState('inappropriate');
    const [reportDesc, setReportDesc] = useState('');
    const [reportSubmitting, setReportSubmitting] = useState(false);
    const [reportMsg, setReportMsg] = useState(null);

    const handleReport = async () => {
        if (!user) {
            setReportMsg({ ok: false, text: 'ログインが必要です' });
            return;
        }
        setReportSubmitting(true);
        setReportMsg(null);
        try {
            const res = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    target_type: 'novel',
                    target_id: id,
                    reason: reportReason,
                    description: reportDesc.trim(),
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            setReportMsg({ ok: true, text: '通報を受け付けました。確認次第対応します。' });
            setReportDesc('');
            setTimeout(() => {
                setReportOpen(false);
                setReportMsg(null);
            }, 2500);
        } catch (err) {
            setReportMsg({ ok: false, text: err.message || '通信エラー' });
        }
        setReportSubmitting(false);
    };

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

            {/* 通報ボタン（小説オーナー以外＆ログインユーザー） */}
            {user && !isOwner && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-lg)' }}>
                    <button
                        onClick={() => setReportOpen(true)}
                        style={{
                            padding: '6px 14px',
                            background: 'transparent',
                            border: '1px solid rgba(255,77,77,0.3)',
                            color: 'rgba(255,120,120,0.8)',
                            fontFamily: 'var(--font-mono)', fontSize: '11px',
                            cursor: 'pointer',
                        }}
                        title="この作品を通報する"
                    >
                        ⚠ この作品を通報
                    </button>
                </div>
            )}

            {/* 通報モーダル */}
            {reportOpen && (
                <div
                    onClick={() => !reportSubmitting && setReportOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 9000, padding: 'var(--space-lg)',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid rgba(255,77,77,0.4)',
                            padding: 'var(--space-xl)',
                            maxWidth: '520px', width: '100%',
                            maxHeight: '90vh', overflowY: 'auto',
                        }}
                    >
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#ff8888', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
                            REPORT
                        </div>
                        <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-md)' }}>
                            この作品を通報
                        </h2>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 'var(--space-md)', lineHeight: 1.6 }}>
                            通報内容は管理者のみが確認します。虚偽の通報や悪用は禁止です。<br />
                            対象：<strong style={{ color: 'var(--text-primary)' }}>{entry.title}</strong>
                        </p>

                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                通報理由 *
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {REPORT_REASONS.map(r => (
                                    <label key={r.value} style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '6px 10px', cursor: 'pointer',
                                        background: reportReason === r.value ? 'rgba(255,77,77,0.08)' : 'transparent',
                                        border: reportReason === r.value ? '1px solid rgba(255,77,77,0.4)' : 'var(--border-subtle)',
                                    }}>
                                        <input
                                            type="radio"
                                            name="report-reason"
                                            value={r.value}
                                            checked={reportReason === r.value}
                                            onChange={e => setReportReason(e.target.value)}
                                        />
                                        <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{r.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                詳細（任意）
                            </label>
                            <textarea
                                value={reportDesc}
                                onChange={e => setReportDesc(e.target.value)}
                                placeholder="具体的な箇所や状況を記入してください。"
                                style={{
                                    width: '100%', minHeight: '100px', padding: '10px',
                                    background: 'var(--bg-elevated)', border: 'var(--border-subtle)',
                                    color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '13px',
                                    outline: 'none', resize: 'vertical',
                                }}
                                maxLength={1000}
                            />
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right', marginTop: '2px' }}>
                                {reportDesc.length} / 1000
                            </div>
                        </div>

                        {reportMsg && (
                            <div style={{
                                padding: '10px 14px', marginBottom: 'var(--space-md)',
                                background: reportMsg.ok ? 'rgba(0,255,170,0.1)' : 'rgba(255,77,77,0.1)',
                                border: reportMsg.ok ? '1px solid rgba(0,255,170,0.4)' : '1px solid rgba(255,77,77,0.4)',
                                color: reportMsg.ok ? '#00ffaa' : '#ff8888',
                                fontFamily: 'var(--font-mono)', fontSize: '12px',
                            }}>
                                {reportMsg.text}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => setReportOpen(false)}
                                disabled={reportSubmitting}
                                style={{
                                    padding: '8px 16px', cursor: 'pointer',
                                    background: 'transparent', border: 'var(--border-subtle)',
                                    color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px',
                                }}
                            >
                                キャンセル
                            </button>
                            <button
                                type="button"
                                onClick={handleReport}
                                disabled={reportSubmitting}
                                style={{
                                    padding: '8px 16px', cursor: reportSubmitting ? 'wait' : 'pointer',
                                    background: 'rgba(255,77,77,0.15)', border: '1px solid rgba(255,77,77,0.4)',
                                    color: '#ff8888', fontFamily: 'var(--font-mono)', fontSize: '12px',
                                    opacity: reportSubmitting ? 0.5 : 1,
                                }}
                            >
                                {reportSubmitting ? '送信中…' : '▶ 通報を送信'}
                            </button>
                        </div>
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
