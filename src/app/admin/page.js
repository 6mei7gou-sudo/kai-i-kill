// 管理者用ダッシュボード — 全投稿の閲覧・編集・削除・公認承認 + News投稿
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import Link from 'next/link';

// 管理者ID
const ADMIN_IDS = (process.env.NEXT_PUBLIC_ADMIN_USER_IDS || '').split(',').filter(Boolean);

// タブ定義
const TABS = [
    { key: 'news', label: 'News', icon: '◆', isNews: true },
    { key: 'character_sheets', label: 'キャラクター', icon: '☖', nameField: 'character_name', editPath: '/create/character', detailPath: '/community/characters' },
    { key: 'gear_posts', label: '武器・装備', icon: '⚔', nameField: 'gear_name', editPath: '/create/weapon', detailPath: '/community/gear' },
    { key: 'anomaly_drafts', label: '怪異調査書', icon: '△', nameField: 'anomaly_name', editPath: '/create/anomaly', detailPath: '/community/anomalies' },
];

const STATUS_BADGE = {
    pending: { label: '申請中', bg: 'rgba(255,170,0,0.15)', border: 'rgba(255,170,0,0.4)', color: '#ffaa00' },
    approved: { label: '公認', bg: 'rgba(0,255,170,0.15)', border: 'rgba(0,255,170,0.4)', color: '#00ffaa' },
    rejected: { label: '却下', bg: 'rgba(255,77,77,0.15)', border: 'rgba(255,77,77,0.4)', color: '#ff4d4d' },
};

// フィルタタブ
const FILTERS = ['all', 'pending', 'approved', 'rejected'];
const FILTER_LABEL = { all: '全件', pending: '申請中', approved: '公認済', rejected: '却下' };

export default function AdminPage() {
    const { user, isLoaded } = useUser();
    const [activeTab, setActiveTab] = useState('character_sheets');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');

    const isAdmin = isLoaded && user && ADMIN_IDS.includes(user.id);
    const tab = TABS.find(t => t.key === activeTab);

    // News投稿フォーム
    const [newsTitle, setNewsTitle] = useState('');
    const [newsBody, setNewsBody] = useState('');
    const [newsCategory, setNewsCategory] = useState('news');
    const [newsSubmitting, setNewsSubmitting] = useState(false);
    const [newsPosts, setNewsPosts] = useState([]);

    // データ取得
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === 'news') {
                const res = await fetch('/api/news?limit=50');
                const json = await res.json();
                setNewsPosts(json.data || []);
                setItems([]);
            } else {
                const res = await fetch(`/api/posts?table=${activeTab}`);
                const json = await res.json();
                setItems(json.data || []);
            }
        } catch (err) {
            console.error('取得エラー:', err);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        if (isAdmin) fetchData();
    }, [isAdmin, fetchData]);

    // News投稿
    const handleNewsSubmit = async () => {
        if (!newsTitle.trim()) return alert('タイトルを入力してください');
        setNewsSubmitting(true);
        try {
            const res = await fetch('/api/news', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newsTitle,
                    body: newsBody,
                    category: newsCategory,
                    author_name: user?.firstName || user?.username || 'ADMIN',
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            setNewsTitle('');
            setNewsBody('');
            setNewsCategory('news');
            fetchData();
        } catch (err) {
            alert('投稿に失敗: ' + err.message);
        } finally {
            setNewsSubmitting(false);
        }
    };

    // News削除
    const handleNewsDelete = async (id) => {
        if (!confirm('この投稿を削除しますか？')) return;
        try {
            const res = await fetch(`/api/news?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('削除失敗');
            setNewsPosts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    // 承認ステータス変更
    const handleApprove = async (id, newStatus) => {
        try {
            const res = await fetch('/api/approve', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table: activeTab, id, status: newStatus }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            // ローカルの状態を更新
            setItems(prev => prev.map(item =>
                item.id === id ? { ...item, approved_status: newStatus, approved_at: json.data?.approved_at } : item
            ));
        } catch (err) {
            alert('ステータス変更に失敗: ' + err.message);
        }
    };

    // 削除処理
    const handleDelete = async (id) => {
        if (!confirm('本当に削除しますか？この操作は取り消せません。')) return;
        try {
            const res = await fetch(`/api/posts?table=${activeTab}&id=${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            setItems(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            alert('削除に失敗: ' + err.message);
        }
    };

    // フィルタリング
    const filtered = filter === 'all' ? items : items.filter(i => (i.approved_status || 'pending') === filter);

    if (!isLoaded) return null;

    return (
        <>
            <SignedOut><RedirectToSignIn /></SignedOut>
            <SignedIn>
                <div className="container">
                    {!isAdmin ? (
                        <section className="section">
                            <h1 className="section__heading" style={{ color: 'var(--accent-danger)' }}>ACCESS DENIED</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>このページへのアクセス権がありません。</p>
                        </section>
                    ) : (
                        <>
                            <section className="section">
                                <span className="section__title">// ADMIN DASHBOARD</span>
                                <h1 className="section__heading">管理者ダッシュボード</h1>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>
                                    全ユーザーの投稿を閲覧・編集・削除・公認承認できます。
                                </p>
                            </section>

                            {/* タブ */}
                            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                                {TABS.map(t => (
                                    <button key={t.key} onClick={() => { setActiveTab(t.key); setFilter('all'); }}
                                        style={{
                                            padding: '10px 20px', cursor: 'pointer', transition: 'all 0.2s',
                                            background: activeTab === t.key ? 'rgba(0,255,170,0.15)' : 'rgba(0,0,0,0.3)',
                                            border: activeTab === t.key ? '1px solid rgba(0,255,170,0.4)' : '1px solid rgba(255,255,255,0.05)',
                                            color: activeTab === t.key ? 'var(--accent-gold)' : 'var(--text-muted)',
                                            fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)',
                                        }}
                                    >{t.icon} {t.label}</button>
                                ))}
                            </div>

                            {/* フィルタ */}
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>FILTER:</span>
                                {FILTERS.map(f => (
                                    <button key={f} onClick={() => setFilter(f)}
                                        style={{
                                            padding: '4px 12px', cursor: 'pointer',
                                            background: filter === f ? 'rgba(0,255,170,0.1)' : 'transparent',
                                            border: filter === f ? '1px solid rgba(0,255,170,0.3)' : '1px solid rgba(255,255,255,0.05)',
                                            color: filter === f ? 'var(--text-primary)' : 'var(--text-muted)',
                                            fontFamily: 'var(--font-mono)', fontSize: '11px',
                                        }}
                                    >{FILTER_LABEL[f]}</button>
                                ))}
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                                    {loading ? '読み込み中...' : `${filtered.length} / ${items.length} 件`}
                                </span>
                            </div>

                            {/* === News管理パネル === */}
                            {activeTab === 'news' && !loading && (
                                <div style={{ marginBottom: 'var(--space-xl)' }}>
                                    {/* 投稿フォーム */}
                                    <div style={{ background: 'var(--bg-card)', border: 'var(--border-subtle)', padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                                        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--accent-gold)', marginBottom: 'var(--space-md)' }}>
                                            NEW POST
                                        </h3>
                                        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                                            {['news', 'release', 'event'].map(c => (
                                                <button key={c} onClick={() => setNewsCategory(c)}
                                                    style={{
                                                        padding: '4px 12px', cursor: 'pointer',
                                                        fontFamily: 'var(--font-mono)', fontSize: '11px',
                                                        background: newsCategory === c ? 'rgba(212,175,55,0.15)' : 'transparent',
                                                        border: newsCategory === c ? '1px solid rgba(212,175,55,0.4)' : '1px solid rgba(255,255,255,0.05)',
                                                        color: newsCategory === c ? 'var(--accent-gold)' : 'var(--text-muted)',
                                                    }}
                                                >{c.toUpperCase()}</button>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="タイトル"
                                            value={newsTitle}
                                            onChange={e => setNewsTitle(e.target.value)}
                                            style={{
                                                width: '100%', padding: '10px', marginBottom: 'var(--space-sm)',
                                                background: 'var(--bg-primary)', border: '1px solid rgba(255,255,255,0.1)',
                                                color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)',
                                            }}
                                        />
                                        <textarea
                                            placeholder="本文（省略可）"
                                            value={newsBody}
                                            onChange={e => setNewsBody(e.target.value)}
                                            rows={4}
                                            style={{
                                                width: '100%', padding: '10px', marginBottom: 'var(--space-sm)',
                                                background: 'var(--bg-primary)', border: '1px solid rgba(255,255,255,0.1)',
                                                color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)',
                                                resize: 'vertical',
                                            }}
                                        />
                                        <button
                                            onClick={handleNewsSubmit}
                                            disabled={newsSubmitting}
                                            style={{
                                                padding: '10px 24px', cursor: 'pointer',
                                                background: 'rgba(212,175,55,0.15)', border: '1px solid var(--accent-gold)',
                                                color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)',
                                                opacity: newsSubmitting ? 0.5 : 1,
                                            }}
                                        >
                                            {newsSubmitting ? '投稿中...' : '▶ 投稿する'}
                                        </button>
                                    </div>

                                    {/* 投稿一覧 */}
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>
                                        {newsPosts.length} 件の投稿
                                    </div>
                                    {newsPosts.map(post => (
                                        <div key={post.id} style={{
                                            display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                                            padding: 'var(--space-sm) var(--space-md)',
                                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                                        }}>
                                            <span style={{
                                                padding: '2px 8px', fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700,
                                                background: post.category === 'release' ? 'rgba(0,255,170,0.1)' : post.category === 'event' ? 'rgba(139,92,246,0.1)' : 'rgba(212,175,55,0.1)',
                                                border: `1px solid ${post.category === 'release' ? 'rgba(0,255,170,0.3)' : post.category === 'event' ? 'rgba(139,92,246,0.3)' : 'rgba(212,175,55,0.3)'}`,
                                                color: post.category === 'release' ? '#00ffaa' : post.category === 'event' ? '#8b5cf6' : '#d4af37',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {post.category.toUpperCase()}
                                            </span>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                                {new Date(post.created_at).toLocaleDateString('ja-JP')}
                                            </span>
                                            <span style={{ flex: 1, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                                                {post.title}
                                            </span>
                                            <button onClick={() => handleNewsDelete(post.id)}
                                                style={{ ...actionBtn, color: '#ff4d4d', borderColor: 'rgba(255,77,77,0.3)' }}>削除</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* テーブル（既存の投稿管理） */}
                            {activeTab !== 'news' && !loading && (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid rgba(0,255,170,0.2)' }}>
                                                <th style={thStyle}></th>
                                                <th style={thStyle}>名前</th>
                                                <th style={thStyle}>投稿者</th>
                                                <th style={thStyle}>ステータス</th>
                                                <th style={thStyle}>日付</th>
                                                <th style={thStyle}>操作</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.map(item => {
                                                const st = STATUS_BADGE[item.approved_status || 'pending'];
                                                return (
                                                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,170,0.02)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <td style={tdStyle}>
                                                            {(item.icon_url || item.thumbnail_url) ? (
                                                                <img src={item.icon_url || item.thumbnail_url} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                                                            ) : (
                                                                <span style={{ width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,255,170,0.1)', borderRadius: '50%', fontSize: '14px' }}>{tab.icon}</span>
                                                            )}
                                                        </td>
                                                        <td style={tdStyle}>
                                                            <Link href={`${tab.detailPath}/${item.id}/`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                                                                {item[tab.nameField] || '名称未設定'}
                                                            </Link>
                                                        </td>
                                                        <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{item.author_name || '—'}</td>
                                                        <td style={tdStyle}>
                                                            <span style={{ padding: '3px 10px', fontSize: '10px', fontWeight: 700, background: st.bg, border: `1px solid ${st.border}`, color: st.color }}>
                                                                {st.label}
                                                            </span>
                                                        </td>
                                                        <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>
                                                            {item.created_at ? new Date(item.created_at).toLocaleDateString('ja-JP') : '—'}
                                                        </td>
                                                        <td style={tdStyle}>
                                                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                                {/* 承認ボタン */}
                                                                {(item.approved_status || 'pending') !== 'approved' && (
                                                                    <button onClick={() => handleApprove(item.id, 'approved')}
                                                                        style={{ ...actionBtn, color: '#00ffaa', borderColor: 'rgba(0,255,170,0.3)' }}>✓ 公認</button>
                                                                )}
                                                                {(item.approved_status || 'pending') !== 'rejected' && (item.approved_status || 'pending') !== 'pending' && (
                                                                    <button onClick={() => handleApprove(item.id, 'pending')}
                                                                        style={{ ...actionBtn, color: '#ffaa00', borderColor: 'rgba(255,170,0,0.3)' }}>↩ 差戻</button>
                                                                )}
                                                                {(item.approved_status || 'pending') !== 'rejected' && (
                                                                    <button onClick={() => handleApprove(item.id, 'rejected')}
                                                                        style={{ ...actionBtn, color: '#ff4d4d', borderColor: 'rgba(255,77,77,0.3)' }}>✕ 却下</button>
                                                                )}
                                                                <Link href={`${tab.editPath}/${item.id}/`} style={actionBtn}>編集</Link>
                                                                <button onClick={() => handleDelete(item.id)} style={{ ...actionBtn, color: '#ff4d4d', borderColor: 'rgba(255,77,77,0.3)' }}>削除</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab !== 'news' && !loading && filtered.length === 0 && (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0', fontStyle: 'italic' }}>該当する投稿がありません</p>
                            )}
                        </>
                    )}
                </div>
            </SignedIn>
        </>
    );
}

const thStyle = { textAlign: 'left', padding: '8px 12px', color: 'var(--accent-gold)', fontWeight: 700, whiteSpace: 'nowrap' };
const tdStyle = { padding: '8px 12px', whiteSpace: 'nowrap', color: 'var(--text-primary)' };
const actionBtn = { padding: '3px 8px', background: 'transparent', border: '1px solid rgba(0,255,170,0.2)', color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)', fontSize: '10px', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' };
