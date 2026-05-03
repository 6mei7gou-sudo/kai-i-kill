// 小説投稿フォーム
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { S, FormInput, FormTextArea, FormSelect } from '@/components/FormFields';

const INITIAL = {
    author_name: '',
    visibility: '公開',
    title: '',
    summary: '',
    body: '',
    thumbnail_url: '',
    featured_characters: [],
    featured_anomalies: [],
    warnings: [],
};

const WARNING_OPTIONS = [
    'R-15', 'R-18', '性的描写あり', '残酷描写あり', '流血表現あり',
    '精神的描写注意', '死亡描写あり', 'パロディ要素', 'クロスオーバー',
];

export default function NovelForm({ editId = null, initialData = null }) {
    const { user } = useUser();
    const router = useRouter();
    const [form, setForm] = useState(INITIAL);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [allCharacters, setAllCharacters] = useState([]);
    const [allAnomalies, setAllAnomalies] = useState([]);
    const [charSearch, setCharSearch] = useState('');
    const [anomSearch, setAnomSearch] = useState('');
    const isEdit = !!editId;

    // 初期データ反映
    useEffect(() => {
        if (initialData) {
            setForm(prev => ({
                ...prev,
                ...initialData,
                featured_characters: initialData.featured_characters || [],
                featured_anomalies: initialData.featured_anomalies || [],
                warnings: initialData.warnings || [],
            }));
        }
    }, [initialData]);

    // ユーザー名を author_name にデフォルトセット
    useEffect(() => {
        if (!user || isEdit) return;
        setForm(prev => ({
            ...prev,
            author_name: prev.author_name || `@${user.username || user.firstName || 'user'}`,
        }));
    }, [user, isEdit]);

    // キャラ・怪異の一覧を取得
    useEffect(() => {
        fetch('/api/posts?table=character_sheets')
            .then(r => r.json())
            .then(json => setAllCharacters(json.data || []))
            .catch(() => {});
        fetch('/api/posts?table=anomaly_drafts')
            .then(r => r.json())
            .then(json => setAllAnomalies(json.data || []))
            .catch(() => {});
    }, []);

    const set = useCallback((key, val) => setForm(prev => ({ ...prev, [key]: val })), []);

    const toggleCharacter = (char) => {
        setForm(prev => {
            const list = prev.featured_characters || [];
            const exists = list.find(c => c.id === char.id);
            if (exists) {
                return { ...prev, featured_characters: list.filter(c => c.id !== char.id) };
            }
            return {
                ...prev,
                featured_characters: [...list, {
                    id: char.id,
                    name: char.character_name,
                    affiliation: char.affiliation,
                    icon_url: char.icon_url || char.thumbnail_url || '',
                }],
            };
        });
    };

    const toggleAnomaly = (anom) => {
        setForm(prev => {
            const list = prev.featured_anomalies || [];
            const exists = list.find(a => a.id === anom.id);
            if (exists) {
                return { ...prev, featured_anomalies: list.filter(a => a.id !== anom.id) };
            }
            return {
                ...prev,
                featured_anomalies: [...list, {
                    id: anom.id,
                    name: anom.anomaly_name,
                    grade: anom.grade,
                    icon_url: anom.icon_url || anom.thumbnail_url || '',
                }],
            };
        });
    };

    const toggleWarning = (w) => {
        setForm(prev => {
            const list = prev.warnings || [];
            if (list.includes(w)) return { ...prev, warnings: list.filter(x => x !== w) };
            return { ...prev, warnings: [...list, w] };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) { setResult({ ok: false, msg: 'タイトルは必須です' }); return; }
        if (!form.body.trim()) { setResult({ ok: false, msg: '本文は必須です' }); return; }

        setSubmitting(true);
        setResult(null);
        try {
            const payload = { ...form };
            delete payload.id;
            delete payload.created_at;
            delete payload.updated_at;
            delete payload.user_id;
            delete payload.approved_status;
            delete payload.approved_at;
            delete payload.approved_by;
            delete payload.is_official;

            const method = isEdit ? 'PATCH' : 'POST';
            const body = isEdit
                ? { table: 'novels', id: editId, data: payload }
                : { table: 'novels', data: payload };

            const res = await fetch('/api/posts', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);

            setResult({ ok: true, msg: isEdit ? '小説を更新しました' : '小説を投稿しました' });
            if (!isEdit) {
                setForm(INITIAL);
                if (json.data?.id) {
                    setTimeout(() => router.push(`/community/novels/${json.data.id}/`), 800);
                }
            }
        } catch (err) {
            setResult({ ok: false, msg: err.message });
        }
        setSubmitting(false);
    };

    // 検索フィルタ
    const filteredChars = allCharacters
        .filter(c => !charSearch || (c.character_name || '').toLowerCase().includes(charSearch.toLowerCase()))
        .slice(0, 30);
    const filteredAnoms = allAnomalies
        .filter(a => !anomSearch || (a.anomaly_name || '').toLowerCase().includes(anomSearch.toLowerCase()))
        .slice(0, 30);

    const wordCount = (form.body || '').length;
    const bodyMinutes = Math.ceil(wordCount / 600); // 1分あたり600文字目安

    return (
        <div className="container">
            <div className="page-header">
                <div className="page-header__badge">{isEdit ? 'EDIT NOVEL' : 'POST NOVEL'}</div>
                <h1 className="page-header__title">{isEdit ? '小説を編集' : '小説を投稿'}</h1>
                <div className="page-header__subtitle">本編 + 登場キャラ・怪異の紐付け</div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* セクション1：メタ */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 1 — META</div>
                    <h2 style={S.sectionHeading}>メタ情報</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
                        <FormInput label="投稿者名" value={form.author_name} onChange={v => set('author_name', v)} placeholder="@username" />
                        <FormSelect label="公開設定" value={form.visibility} onChange={v => set('visibility', v)} options={['公開', '非公開']} />
                        <FormInput label="サムネイルURL（任意）" value={form.thumbnail_url} onChange={v => set('thumbnail_url', v)} placeholder="https://..." />
                    </div>
                </div>

                {/* セクション2：基本 */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 2 — TITLE</div>
                    <h2 style={S.sectionHeading}>タイトルと概要</h2>
                    <FormInput label="タイトル *" value={form.title} onChange={v => set('title', v)} placeholder="作品タイトル" required />
                    <FormTextArea label="概要（任意）" value={form.summary} onChange={v => set('summary', v)} placeholder="作品の短い説明（一覧で表示されます）" />
                </div>

                {/* セクション3：本文 */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 3 — BODY</div>
                    <h2 style={S.sectionHeading}>本文</h2>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)', fontFamily: 'var(--font-mono)' }}>
                        {wordCount.toLocaleString()} 文字 / 約 {bodyMinutes} 分（600文字/分目安）
                    </p>
                    <textarea
                        value={form.body}
                        onChange={e => set('body', e.target.value)}
                        placeholder="本文を入力してください。改行も反映されます。"
                        style={{ ...S.textarea, minHeight: '480px', lineHeight: 1.8 }}
                        required
                    />
                </div>

                {/* セクション4：注意タグ */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 4 — WARNINGS</div>
                    <h2 style={S.sectionHeading}>注意タグ（任意）</h2>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 'var(--space-md)', fontFamily: 'var(--font-mono)' }}>
                        該当する内容にチェックを入れてください。閲覧者の判断材料になります。
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {WARNING_OPTIONS.map(w => {
                            const on = (form.warnings || []).includes(w);
                            return (
                                <button key={w} type="button"
                                    onClick={() => toggleWarning(w)}
                                    style={{
                                        padding: '6px 12px', fontSize: '11px', fontFamily: 'var(--font-mono)', cursor: 'pointer',
                                        background: on ? 'rgba(255,170,0,0.15)' : 'transparent',
                                        border: on ? '1px solid rgba(255,170,0,0.4)' : '1px solid rgba(255,255,255,0.06)',
                                        color: on ? '#ffaa00' : 'var(--text-muted)',
                                    }}
                                >
                                    {w}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* セクション5：登場キャラ */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 5 — FEATURED CHARACTERS</div>
                    <h2 style={S.sectionHeading}>登場キャラクター</h2>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 'var(--space-md)', fontFamily: 'var(--font-mono)' }}>
                        本作に登場するキャラクターを選択してください。投稿者問わず全キャラから選べます。
                    </p>

                    {/* 選択済み */}
                    {(form.featured_characters || []).length > 0 && (
                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '6px' }}>
                                選択済み {form.featured_characters.length} 件：
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {form.featured_characters.map(c => (
                                    <span key={c.id} style={{ padding: '4px 12px', background: 'rgba(0,255,170,0.15)', border: '1px solid rgba(0,255,170,0.4)', color: '#00ffaa', fontFamily: 'var(--font-mono)', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                        {c.icon_url && <img src={c.icon_url} alt="" style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} />}
                                        {c.name}
                                        <button type="button" onClick={() => toggleCharacter({ id: c.id })} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: 0, fontSize: '12px' }}>×</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 検索＋一覧 */}
                    <input
                        type="text"
                        placeholder="キャラ名で検索..."
                        value={charSearch}
                        onChange={e => setCharSearch(e.target.value)}
                        style={{ ...S.input, marginBottom: 'var(--space-sm)' }}
                    />
                    <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '4px' }}>
                        {filteredChars.map(c => {
                            const selected = (form.featured_characters || []).some(x => x.id === c.id);
                            return (
                                <button key={c.id} type="button"
                                    onClick={() => toggleCharacter(c)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '6px 10px', cursor: 'pointer', textAlign: 'left',
                                        background: selected ? 'rgba(0,255,170,0.1)' : 'rgba(0,0,0,0.2)',
                                        border: selected ? '1px solid rgba(0,255,170,0.4)' : 'var(--border-subtle)',
                                        color: 'var(--text-primary)', fontSize: '12px',
                                    }}
                                >
                                    {(c.icon_url || c.thumbnail_url) && <img src={c.icon_url || c.thumbnail_url} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />}
                                    <span style={{ flex: 1 }}>{c.character_name || '名称未設定'}</span>
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{c.affiliation}</span>
                                </button>
                            );
                        })}
                        {filteredChars.length === 0 && (
                            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '12px' }}>該当するキャラがありません</p>
                        )}
                    </div>
                </div>

                {/* セクション6：登場怪異 */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 6 — FEATURED ANOMALIES</div>
                    <h2 style={S.sectionHeading}>登場した怪異</h2>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 'var(--space-md)', fontFamily: 'var(--font-mono)' }}>
                        本作に登場する怪異を選択してください。
                    </p>

                    {(form.featured_anomalies || []).length > 0 && (
                        <div style={{ marginBottom: 'var(--space-md)' }}>
                            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '6px' }}>
                                選択済み {form.featured_anomalies.length} 件：
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {form.featured_anomalies.map(a => (
                                    <span key={a.id} style={{ padding: '4px 12px', background: 'rgba(255,77,77,0.12)', border: '1px solid rgba(255,77,77,0.4)', color: '#ff8888', fontFamily: 'var(--font-mono)', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                        {a.icon_url && <img src={a.icon_url} alt="" style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} />}
                                        {a.name}
                                        <button type="button" onClick={() => toggleAnomaly({ id: a.id })} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: 0, fontSize: '12px' }}>×</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <input
                        type="text"
                        placeholder="怪異名で検索..."
                        value={anomSearch}
                        onChange={e => setAnomSearch(e.target.value)}
                        style={{ ...S.input, marginBottom: 'var(--space-sm)' }}
                    />
                    <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '4px' }}>
                        {filteredAnoms.map(a => {
                            const selected = (form.featured_anomalies || []).some(x => x.id === a.id);
                            return (
                                <button key={a.id} type="button"
                                    onClick={() => toggleAnomaly(a)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '6px 10px', cursor: 'pointer', textAlign: 'left',
                                        background: selected ? 'rgba(255,77,77,0.1)' : 'rgba(0,0,0,0.2)',
                                        border: selected ? '1px solid rgba(255,77,77,0.4)' : 'var(--border-subtle)',
                                        color: 'var(--text-primary)', fontSize: '12px',
                                    }}
                                >
                                    {(a.icon_url || a.thumbnail_url) && <img src={a.icon_url || a.thumbnail_url} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />}
                                    <span style={{ flex: 1 }}>{a.anomaly_name || '名称未設定'}</span>
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{a.grade}</span>
                                </button>
                            );
                        })}
                        {filteredAnoms.length === 0 && (
                            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '12px' }}>該当する怪異がありません</p>
                        )}
                    </div>
                </div>

                {result && (
                    <div className="callout" style={{ marginBottom: 'var(--space-xl)', borderColor: result.ok ? 'var(--accent-cyber)' : 'var(--accent-danger)' }}>
                        <div className="callout__label" style={{ color: result.ok ? 'var(--accent-cyber)' : 'var(--accent-danger)' }}>{result.ok ? '完了' : 'エラー'}</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{result.msg}</p>
                    </div>
                )}

                <button type="submit" style={S.submitBtn} disabled={submitting}>
                    {submitting ? 'SUBMITTING...' : isEdit ? '▶ 小説を更新' : '▶ 小説を投稿'}
                </button>
            </form>
        </div>
    );
}
