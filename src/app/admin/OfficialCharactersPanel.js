'use client';

// 管理画面「公式キャラ」タブ — 公式キャラページ掲載内容の登録・編集・削除
// /admin ページから自己完結パネルとして呼び出される（取得・状態は自前で持つ）

import { useState, useEffect, useCallback } from 'react';
import ImageUploader from '@/components/ImageUploader';
import '@/components/ImageUploader.css';

const EMPTY_FORM = { name: '', title: '', description: '', image_url: '', display_order: 0, published: true };

const inputStyle = {
    width: '100%', padding: '10px', marginBottom: 'var(--space-sm)',
    background: 'var(--bg-primary)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)',
};

const smallBtn = {
    padding: '4px 12px', cursor: 'pointer', background: 'transparent',
    border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)', fontSize: '11px',
};

export default function OfficialCharactersPanel() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const fetchEntries = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const res = await fetch('/api/official-characters?all=1');
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || '取得に失敗しました');
            setEntries(json.data || []);
        } catch (err) {
            setLoadError(`一覧の取得に失敗しました（${err.message}）。テーブル未作成の場合は supabase/migration_official_characters.sql を実行してください。`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchEntries(); }, [fetchEntries]);

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            alert('名前を入力してください');
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch('/api/official-characters', {
                method: editingId ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingId ? { id: editingId, ...form } : form),
            });
            const json = await res.json();
            if (!res.ok) {
                alert((editingId ? '更新' : '登録') + 'に失敗: ' + (json.error || '不明なエラー'));
                return;
            }
            setForm(EMPTY_FORM);
            setEditingId(null);
            fetchEntries();
        } catch (err) {
            alert('通信エラー: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (entry) => {
        setEditingId(entry.id);
        setForm({
            name: entry.name || '',
            title: entry.title || '',
            description: entry.description || '',
            image_url: entry.image_url || '',
            display_order: entry.display_order || 0,
            published: entry.published !== false,
        });
    };

    const handleDelete = async (id) => {
        if (!confirm('この公式キャラ紹介を削除しますか？')) return;
        try {
            const res = await fetch(`/api/official-characters?id=${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (!res.ok) {
                alert('削除に失敗: ' + (json.error || '不明なエラー'));
                return;
            }
            if (editingId === id) { setEditingId(null); setForm(EMPTY_FORM); }
            fetchEntries();
        } catch (err) {
            alert('通信エラー: ' + err.message);
        }
    };

    return (
        <div style={{ marginBottom: 'var(--space-xl)' }}>
            {/* 登録・編集フォーム */}
            <div style={{ background: 'var(--bg-card)', border: 'var(--border-subtle)', padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--accent-gold)', marginBottom: 'var(--space-md)' }}>
                    {editingId ? 'EDIT OFFICIAL CHARACTER' : 'NEW OFFICIAL CHARACTER'}
                </h3>
                <input
                    type="text"
                    placeholder="名前（必須）"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    style={inputStyle}
                />
                <input
                    type="text"
                    placeholder="肩書・二つ名（省略可）"
                    value={form.title}
                    onChange={e => set('title', e.target.value)}
                    style={inputStyle}
                />
                <textarea
                    placeholder="紹介文（公式キャラページに表示されます）"
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    rows={5}
                    style={{ ...inputStyle, resize: 'vertical' }}
                />
                <ImageUploader
                    label="紹介画像"
                    value={form.image_url}
                    onChange={v => set('image_url', v)}
                    folder="official"
                    hint="推奨 4:3（例: 800×600px）— 公式キャラページのカード画像"
                />
                <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', margin: 'var(--space-sm) 0' }}>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        並び順
                        <input
                            type="number"
                            value={form.display_order}
                            onChange={e => set('display_order', e.target.value)}
                            style={{ ...inputStyle, width: '80px', marginBottom: 0 }}
                        />
                    </label>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={form.published}
                            onChange={e => set('published', e.target.checked)}
                        />
                        公開する
                    </label>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        style={{
                            padding: '10px 24px', cursor: 'pointer',
                            background: 'rgba(212,175,55,0.15)', border: '1px solid var(--accent-gold)',
                            color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)',
                            opacity: submitting ? 0.5 : 1,
                        }}
                    >
                        {submitting ? '送信中...' : editingId ? '▶ 更新する' : '▶ 登録する'}
                    </button>
                    {editingId && (
                        <button
                            onClick={() => { setEditingId(null); setForm(EMPTY_FORM); }}
                            disabled={submitting}
                            style={{ ...smallBtn, padding: '10px 16px' }}
                        >
                            キャンセル
                        </button>
                    )}
                </div>
            </div>

            {/* 一覧 */}
            {loadError ? (
                <div style={{ padding: 'var(--space-md)', border: '1px solid rgba(255,77,77,0.3)', background: 'rgba(255,77,77,0.05)', color: '#ff8888', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                    {loadError}
                </div>
            ) : (
                <>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>
                        {loading ? '読み込み中...' : `${entries.length} 件の登録`}
                    </div>
                    {entries.map(entry => (
                        <div key={entry.id} style={{
                            display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                            padding: 'var(--space-sm) var(--space-md)',
                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                        }}>
                            <span style={{
                                padding: '2px 8px', fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, whiteSpace: 'nowrap',
                                background: entry.published ? 'rgba(0,255,170,0.1)' : 'rgba(255,255,255,0.05)',
                                border: `1px solid ${entry.published ? 'rgba(0,255,170,0.3)' : 'rgba(255,255,255,0.15)'}`,
                                color: entry.published ? '#00ffaa' : 'var(--text-muted)',
                            }}>
                                {entry.published ? '公開' : '非公開'}
                            </span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                #{entry.display_order}
                            </span>
                            {entry.image_url && (
                                <img src={entry.image_url} alt="" style={{ width: '32px', height: '24px', objectFit: 'cover' }} />
                            )}
                            <span style={{ flex: 1, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                                {entry.name}
                                {entry.title && <span style={{ color: 'var(--text-muted)', fontSize: '11px', marginLeft: '8px' }}>{entry.title}</span>}
                            </span>
                            <button onClick={() => handleEdit(entry)} style={smallBtn}>編集</button>
                            <button onClick={() => handleDelete(entry.id)}
                                style={{ ...smallBtn, color: '#ff4d4d', borderColor: 'rgba(255,77,77,0.3)' }}>削除</button>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}
