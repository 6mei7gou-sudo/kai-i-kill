'use client';

// 公式キャラクター一覧 — 管理者が /admin の「公式キャラ」タブで登録した内容を表示
// テーブル未作成・取得失敗時は空状態にフォールバックしてクラッシュしない

import { useState, useEffect } from 'react';

export default function OfficialCharactersList() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/official-characters');
                const json = await res.json();
                if (res.ok && Array.isArray(json.data)) {
                    setEntries(json.data);
                }
            } catch (_) {
                // 取得失敗時は空状態表示に任せる
            }
            setLoading(false);
        })();
    }, []);

    return (
        <div className="container">
            {/* ページヘッダー */}
            <div className="page-header">
                <div className="page-header__badge">OFFICIAL CHARACTERS</div>
                <h1 className="page-header__title">公式キャラクター</h1>
                <div className="page-header__subtitle">電脳怪異譚　KAI-I//KILL — 討伐者ハンドブック</div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    LOADING...
                </div>
            ) : entries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--text-muted)' }}>
                    公式キャラクターは準備中です。
                </div>
            ) : (
                <div className="card-grid" style={{ marginBottom: 'var(--space-3xl)' }}>
                    {entries.map((c) => (
                        <div key={c.id} className="card">
                            {c.image_url ? (
                                <div style={{ width: '100%', aspectRatio: '4 / 3', overflow: 'hidden', marginBottom: 'var(--space-md)', border: 'var(--border-subtle)', background: 'rgba(0,0,0,0.3)' }}>
                                    <img
                                        src={c.image_url}
                                        alt={c.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                                    />
                                </div>
                            ) : (
                                <div className="card__icon">★</div>
                            )}
                            <h3 className="card__title">{c.name}</h3>
                            {c.title && <div className="card__title-en" style={{ color: 'var(--accent-gold)' }}>{c.title}</div>}
                            {c.description && (
                                <p className="card__desc" style={{ whiteSpace: 'pre-wrap' }}>{c.description}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
