// 管理者用ダッシュボード — 全投稿の閲覧・編集・削除・公認承認 + News投稿
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser, Show, RedirectToSignIn } from '@clerk/nextjs';
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

    const [userProfiles, setUserProfiles] = useState({});
    const [userFilter, setUserFilter] = useState('');
    const [searchText, setSearchText] = useState('');

    const isAdmin = isLoaded && user && ADMIN_IDS.includes(user.id);
    const tab = TABS.find(t => t.key === activeTab);

    // News投稿フォーム
    const [newsTitle, setNewsTitle] = useState('');
    const [newsBody, setNewsBody] = useState('');
    const [newsCategory, setNewsCategory] = useState('news');
    const [newsSubmitting, setNewsSubmitting] = useState(false);
    const [newsPosts, setNewsPosts] = useState([]);

    // 危険ゾーン：リセットイベント
    const [resetting, setResetting] = useState(false);
    const [resetResult, setResetResult] = useState(null);

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
                const url = userFilter
                    ? `/api/posts?table=${activeTab}&user_id=${encodeURIComponent(userFilter)}`
                    : `/api/posts?table=${activeTab}`;
                const res = await fetch(url);
                const json = await res.json();
                setItems(json.data || []);
            }
        } catch (err) {
            console.error('取得エラー:', err);
        } finally {
            setLoading(false);
        }
    }, [activeTab, userFilter]);

    useEffect(() => {
        if (isAdmin) fetchData();
    }, [isAdmin, fetchData]);

    // Clerkユーザープロフィールを一括取得
    useEffect(() => {
        if (!isAdmin || items.length === 0) return;
        const newIds = [...new Set(items.map(i => i.user_id).filter(Boolean))]
            .filter(id => !userProfiles[id]);
        if (newIds.length === 0) return;
        fetch(`/api/admin/users?ids=${newIds.join(',')}`)
            .then(res => res.json())
            .then(json => {
                if (json.ok && json.users) {
                    setUserProfiles(prev => ({ ...prev, ...json.users }));
                }
            })
            .catch(() => {});
    }, [isAdmin, items]);

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

    // 公式フラグ切り替え
    const handleOfficialToggle = async (id, current) => {
        try {
            const res = await fetch('/api/approve', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table: activeTab, id, is_official: !current }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            setItems(prev => prev.map(item =>
                item.id === id ? { ...item, is_official: !current } : item
            ));
        } catch (err) {
            alert('公式フラグ変更に失敗: ' + err.message);
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

    // 危険ゾーン：非公式キャラのレベル＋CP履歴リセット、全員CP没収＋50CP再配布、未開の開拓者称号配布
    const handleResetEvent = async () => {
        const ok = confirm(
            '【取り消し不可】次の操作を一括で実行します：\n\n' +
            '・非公式キャラ全件のレベルを 1 に戻す\n' +
            '・対象キャラのレベルアップCP履歴を削除\n' +
            '・全ユーザーのCP残高を 50 に再配布（差分は履歴に記録）\n' +
            '・全キャラに「未開の開拓者」称号を配布\n\n' +
            '本当に続行しますか？'
        );
        if (!ok) return;
        const typed = prompt('確認のため、以下を一字違わず入力してください：\nリセットする');
        if (typed !== 'リセットする') {
            if (typed !== null) alert('入力が一致しません。中止しました。');
            return;
        }
        setResetting(true);
        setResetResult(null);
        try {
            const res = await fetch('/api/admin/reset-non-official-progress', { method: 'POST' });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'リセットに失敗しました');
            setResetResult(json);
            fetchData();
        } catch (err) {
            alert('リセットに失敗: ' + err.message);
        } finally {
            setResetting(false);
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

    // フィルタリング（ステータス + テキスト検索）
    const filtered = useMemo(() => {
        return items.filter(item => {
            if (filter !== 'all' && (item.approved_status || 'pending') !== filter) return false;
            if (searchText) {
                const q = searchText.toLowerCase();
                const profile = userProfiles[item.user_id];
                const searchable = [
                    item.author_name,
                    item.user_id,
                    item[tab?.nameField],
                    profile?.username,
                    profile?.firstName,
                    profile?.lastName,
                    profile?.email,
                ].filter(Boolean).join(' ').toLowerCase();
                if (!searchable.includes(q)) return false;
            }
            return true;
        });
    }, [items, filter, searchText, userProfiles, tab]);

    if (!isLoaded) return null;

    return (
        <>
            <Show when="signed-out"><RedirectToSignIn /></Show>
            <Show when="signed-in">
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
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
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

                            {/* 検索バー＋アカウントフィルタ */}
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <input
                                    type="text"
                                    placeholder="検索（投稿者名・アカウント名・ID...）"
                                    value={searchText}
                                    onChange={e => setSearchText(e.target.value)}
                                    style={{
                                        flex: '1 1 200px', padding: '6px 12px',
                                        background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '12px',
                                    }}
                                />
                                {userFilter && (() => {
                                    const p = userProfiles[userFilter];
                                    const displayName = p?.deleted ? '削除済み' : (p?.username || p?.firstName || userFilter.slice(0, 12) + '...');
                                    return (
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                            padding: '4px 10px',
                                            background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)',
                                            fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#b794f6',
                                        }}>
                                            {p?.imageUrl && <img src={p.imageUrl} alt="" style={{ width: '16px', height: '16px', borderRadius: '50%' }} />}
                                            ACCOUNT: {displayName}
                                            <button onClick={() => setUserFilter('')}
                                                style={{
                                                    background: 'none', border: 'none', color: '#ff4d4d',
                                                    cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '0 2px',
                                                }}>x</button>
                                        </span>
                                    );
                                })()}
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
                                                <th style={thStyle}>アカウント</th>
                                                <th style={thStyle}>公式</th>
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
                                                        <td style={{ ...tdStyle, fontSize: '10px' }}>
                                                            {item.user_id ? (() => {
                                                                const p = userProfiles[item.user_id];
                                                                const name = p?.deleted ? '削除済み' : (p?.username || p?.firstName || null);
                                                                const tooltip = p?.email
                                                                    ? `${item.user_id}\n${p.email}${p.lastSignInAt ? '\n最終ログイン: ' + new Date(p.lastSignInAt).toLocaleDateString('ja-JP') : ''}`
                                                                    : item.user_id;
                                                                return (
                                                                    <button
                                                                        title={tooltip}
                                                                        onClick={() => setUserFilter(item.user_id)}
                                                                        style={{
                                                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                                            padding: '2px 6px', cursor: 'pointer',
                                                                            background: userFilter === item.user_id ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
                                                                            border: userFilter === item.user_id ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.06)',
                                                                            color: p?.deleted ? 'var(--text-muted)' : 'var(--text-primary)',
                                                                            fontFamily: 'var(--font-mono)', fontSize: '10px',
                                                                        }}
                                                                    >
                                                                        {p?.imageUrl && <img src={p.imageUrl} alt="" style={{ width: '14px', height: '14px', borderRadius: '50%' }} />}
                                                                        {name || (item.user_id.length > 14 ? item.user_id.slice(0, 14) + '...' : item.user_id)}
                                                                    </button>
                                                                );
                                                            })() : '—'}
                                                        </td>
                                                        <td style={tdStyle}>
                                                            <button
                                                                onClick={() => handleOfficialToggle(item.id, !!item.is_official)}
                                                                style={{
                                                                    padding: '3px 10px', fontSize: '10px', fontWeight: 700, cursor: 'pointer',
                                                                    background: item.is_official ? 'rgba(192,208,224,0.15)' : 'transparent',
                                                                    border: item.is_official ? '1px solid rgba(192,208,224,0.4)' : '1px solid rgba(255,255,255,0.05)',
                                                                    color: item.is_official ? '#c0d0e0' : 'var(--text-muted)',
                                                                    fontFamily: 'var(--font-mono)',
                                                                }}
                                                            >
                                                                {item.is_official ? '★ 公式' : '— 一般'}
                                                            </button>
                                                        </td>
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

                            {/* === 危険ゾーン（キャラクタータブ専用） === */}
                            {activeTab === 'character_sheets' && (
                                <div style={{
                                    marginTop: 'var(--space-xl)', padding: 'var(--space-lg)',
                                    background: 'rgba(255,77,77,0.05)',
                                    border: '1px solid rgba(255,77,77,0.4)',
                                }}>
                                    <h3 style={{
                                        color: '#ff4d4d', fontFamily: 'var(--font-mono)',
                                        fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-sm)',
                                        letterSpacing: '0.1em',
                                    }}>
                                        ⚠ DANGER ZONE — リセットイベント
                                    </h3>
                                    <ul style={{
                                        color: 'var(--text-secondary)', fontSize: '12px',
                                        marginBottom: 'var(--space-md)', paddingLeft: '20px', lineHeight: 1.7,
                                    }}>
                                        <li>非公式キャラ全件のレベルを <strong>1</strong> に戻す</li>
                                        <li>対象キャラのレベルアップCP履歴を削除</li>
                                        <li>全ユーザーのCP残高を <strong>一律 50CP</strong> に再配布（CP没収＋再配布）</li>
                                        <li>全キャラに称号 <strong>「未開の開拓者」</strong> を配布</li>
                                    </ul>
                                    <p style={{
                                        color: '#ff4d4d', fontSize: '11px', fontFamily: 'var(--font-mono)',
                                        marginBottom: 'var(--space-md)',
                                    }}>
                                        ※ この操作は<strong>取り消せません</strong>。CPは返金されません。
                                    </p>
                                    <button
                                        onClick={handleResetEvent}
                                        disabled={resetting}
                                        style={{
                                            padding: '10px 24px', cursor: resetting ? 'wait' : 'pointer',
                                            background: 'rgba(255,77,77,0.15)', border: '1px solid #ff4d4d',
                                            color: '#ff4d4d', fontFamily: 'var(--font-mono)',
                                            fontSize: 'var(--font-size-sm)', fontWeight: 700,
                                            opacity: resetting ? 0.6 : 1,
                                        }}
                                    >
                                        {resetting ? '実行中…' : '▶ リセットイベントを実行'}
                                    </button>
                                    {resetResult && (
                                        <div style={{
                                            marginTop: 'var(--space-md)', padding: 'var(--space-md)',
                                            background: 'rgba(0,255,170,0.05)',
                                            border: '1px solid rgba(0,255,170,0.3)',
                                            fontFamily: 'var(--font-mono)', fontSize: '11px',
                                            color: 'var(--text-primary)', lineHeight: 1.7,
                                        }}>
                                            ✓ 完了しました：<br />
                                            ・レベルを 1 に戻したキャラ：<strong>{resetResult.resetCharCount}</strong> 件<br />
                                            ・削除したCP履歴：<strong>{resetResult.deletedHistoryCount}</strong> 件<br />
                                            ・CPを 50 に再配布したアカウント：<strong>{resetResult.cpAdjustedCount}</strong> 件<br />
                                            ・称号「未開の開拓者」を新規配布したキャラ：<strong>{resetResult.titleAwardedCount}</strong> 件
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Show>
        </>
    );
}

const thStyle = { textAlign: 'left', padding: '8px 12px', color: 'var(--accent-gold)', fontWeight: 700, whiteSpace: 'nowrap' };
const tdStyle = { padding: '8px 12px', whiteSpace: 'nowrap', color: 'var(--text-primary)' };
const actionBtn = { padding: '3px 8px', background: 'transparent', border: '1px solid rgba(0,255,170,0.2)', color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)', fontSize: '10px', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' };
