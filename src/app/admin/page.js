// 管理者用ダッシュボード — 全投稿の閲覧・編集・削除
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import Link from 'next/link';

// 管理者のClerk user_id（環境変数 or ハードコード）
// .env.local に NEXT_PUBLIC_ADMIN_USER_IDS=user_xxx,user_yyy で複数人設定可
const ADMIN_IDS = (process.env.NEXT_PUBLIC_ADMIN_USER_IDS || '').split(',').filter(Boolean);

// タブ定義
const TABS = [
    { key: 'character_sheets', label: 'キャラクター', icon: '☖', nameField: 'character_name', editPath: '/create/character', detailPath: '/community/characters' },
    { key: 'gear_posts', label: '武器・装備', icon: '⚔', nameField: 'gear_name', editPath: '/create/weapon', detailPath: '/community/gear' },
    { key: 'anomaly_drafts', label: '怪異調査書', icon: '△', nameField: 'anomaly_name', editPath: '/create/anomaly', detailPath: '/community/anomalies' },
];

export default function AdminPage() {
    const { user, isLoaded } = useUser();
    const [activeTab, setActiveTab] = useState('character_sheets');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const isAdmin = isLoaded && user && ADMIN_IDS.includes(user.id);
    const tab = TABS.find(t => t.key === activeTab);

    // データ取得
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/posts?table=${activeTab}`);
            const json = await res.json();
            setItems(json.data || []);
        } catch (err) {
            console.error('取得エラー:', err);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        if (isAdmin) fetchData();
    }, [isAdmin, fetchData]);

    // 削除処理
    const handleDelete = async (id) => {
        if (!confirm('本当に削除しますか？この操作は取り消せません。')) return;
        try {
            const res = await fetch(`/api/posts?table=${activeTab}&id=${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            setItems(prev => prev.filter(item => item.id !== id));
            setDeleteTarget(null);
        } catch (err) {
            alert('削除に失敗: ' + err.message);
        }
    };

    // 未ログイン
    if (!isLoaded) return null;

    return (
        <>
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
            <SignedIn>
                <div className="container">
                    {!isAdmin ? (
                        // 権限なし
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
                                    全ユーザーの投稿を閲覧・編集・削除できます。
                                </p>
                            </section>

                            {/* タブ切り替え */}
                            <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
                                {TABS.map(t => (
                                    <button
                                        key={t.key}
                                        onClick={() => setActiveTab(t.key)}
                                        style={{
                                            padding: '10px 20px',
                                            background: activeTab === t.key ? 'rgba(0,255,170,0.15)' : 'rgba(0,0,0,0.3)',
                                            border: activeTab === t.key ? '1px solid rgba(0,255,170,0.4)' : '1px solid rgba(255,255,255,0.05)',
                                            color: activeTab === t.key ? 'var(--accent-gold)' : 'var(--text-muted)',
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: 'var(--font-size-sm)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {t.icon} {t.label}
                                    </button>
                                ))}
                            </div>

                            {/* 件数 */}
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                {loading ? '読み込み中...' : `${items.length} 件`}
                            </div>

                            {/* 一覧テーブル */}
                            {!loading && (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid rgba(0,255,170,0.2)' }}>
                                                <th style={thStyle}>アイコン</th>
                                                <th style={thStyle}>名前</th>
                                                <th style={thStyle}>投稿者</th>
                                                <th style={thStyle}>公開</th>
                                                <th style={thStyle}>作成日</th>
                                                <th style={thStyle}>操作</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map(item => (
                                                <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
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
                                                        <span style={{ color: item.visibility === '限定' ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                                                            {item.visibility === '限定' ? '🔒限定' : '🌐公開'}
                                                        </span>
                                                    </td>
                                                    <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>
                                                        {item.created_at ? new Date(item.created_at).toLocaleDateString('ja-JP') : '—'}
                                                    </td>
                                                    <td style={tdStyle}>
                                                        <div style={{ display: 'flex', gap: '6px' }}>
                                                            <Link href={`${tab.editPath}/${item.id}/`} style={actionBtn}>編集</Link>
                                                            <button onClick={() => handleDelete(item.id)} style={{ ...actionBtn, color: 'var(--accent-danger)', borderColor: 'rgba(255,77,77,0.3)' }}>削除</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {!loading && items.length === 0 && (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0', fontStyle: 'italic' }}>投稿がありません</p>
                            )}
                        </>
                    )}
                </div>
            </SignedIn>
        </>
    );
}

// スタイル定数
const thStyle = { textAlign: 'left', padding: '8px 12px', color: 'var(--accent-gold)', fontWeight: 700, whiteSpace: 'nowrap' };
const tdStyle = { padding: '8px 12px', whiteSpace: 'nowrap', color: 'var(--text-primary)' };
const actionBtn = { padding: '4px 10px', background: 'transparent', border: '1px solid rgba(0,255,170,0.2)', color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)', fontSize: '10px', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' };
