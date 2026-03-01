// 武器・装備一覧 — クライアントコンポーネント
'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const CAT_COLOR = {
    '武装型': '#4488ff', '独立型': '#88cc44', '半装身型': '#ffaa00',
    '全装身型': '#ff4444', '搭乗型': '#8844ff', '戦闘用搭乗型': '#ff44aa',
};
const RISK_COLOR = { '低': '#88cc44', '中': '#ffaa00', '高': '#ff6644', '非常に高': '#ff4444' };

export default function GearList() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('すべて');

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('gear_posts')
                .select('*')
                .eq('visibility', '公開')
                .order('created_at', { ascending: false });
            if (!error && data) setEntries(data);
            setLoading(false);
        })();
    }, []);

    const filtered = useMemo(() => {
        return entries.filter(e => {
            const matchSearch = !search ||
                e.gear_name?.includes(search) ||
                e.summary?.includes(search) ||
                e.author_name?.includes(search) ||
                e.manufacturer?.includes(search);
            const matchCat = catFilter === 'すべて' || e.category === catFilter;
            return matchSearch && matchCat;
        });
    }, [entries, search, catFilter]);

    const S = {
        filterBar: { display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', marginBottom: 'var(--space-xl)', alignItems: 'center' },
        searchInput: { flex: 1, minWidth: '200px', background: 'var(--bg-elevated)', border: 'var(--border-subtle)', color: 'var(--text-primary)', padding: '10px 14px', fontSize: 'var(--font-size-base)', fontFamily: 'inherit' },
        select: { background: 'var(--bg-elevated)', border: 'var(--border-subtle)', color: 'var(--text-primary)', padding: '10px 14px', fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-mono)', cursor: 'pointer' },
        card: { background: 'var(--bg-card)', border: 'var(--border-subtle)', padding: 'var(--space-lg)', marginBottom: 'var(--space-md)', transition: 'border-color 0.2s ease, background 0.2s ease', cursor: 'pointer' },
        badge: (color) => ({ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', fontWeight: 700, color, padding: '2px 8px', border: `1px solid ${color}33`, background: `${color}11` }),
    };

    return (
        <div className="container">
            <section className="section">
                <span className="section__title">// COMMUNITY — GEAR DATABASE</span>
                <h1 className="section__heading">武器・装備一覧</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
                    コミュニティが投稿した武器・装備データを閲覧できます。
                    <span className="badge badge--cyber" style={{ marginLeft: '8px' }}>{entries.length}件</span>
                </p>
                <Link href="/create/weapon/" style={{ display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--accent-cyber)', border: '1px solid var(--accent-cyber)', padding: '8px 20px', textDecoration: 'none' }}>
                    ⚔ 新しい装備を投稿
                </Link>
            </section>

            <div style={S.filterBar}>
                <input style={S.searchInput} placeholder="武器名・投稿者・メーカーで検索..."
                    value={search} onChange={e => setSearch(e.target.value)} />
                <select style={S.select} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                    {['すべて', '武装型', '独立型', '半装身型', '全装身型', '搭乗型', '戦闘用搭乗型'].map(o =>
                        <option key={o} value={o}>{o === 'すべて' ? 'カテゴリ: すべて' : o}</option>)}
                </select>
            </div>

            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }}>
                {filtered.length} / {entries.length} 件表示
            </p>

            {loading && <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--text-muted)' }}>データを読み込み中...</div>}

            {!loading && filtered.map(entry => (
                <Link key={entry.id} href={`/community/gear/${entry.id}/`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                    <div style={S.card}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,255,170,0.3)'; e.currentTarget.style.background = 'rgba(0,255,170,0.03)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.background = 'var(--bg-card)'; }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
                            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>{entry.gear_name || '（無題）'}</h3>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{entry.manufacturer}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 'var(--space-sm)' }}>
                            <span style={S.badge(CAT_COLOR[entry.category] || '#888')}>{entry.category}</span>
                            <span style={S.badge(RISK_COLOR[entry.risk_level] || '#888')}>リスク: {entry.risk_level}</span>
                            {entry.affiliation_fit && entry.affiliation_fit !== 'どれでも' && (
                                <span className="badge badge--kai">{entry.affiliation_fit}</span>
                            )}
                        </div>
                        {entry.summary && <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.7, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{entry.summary}</p>}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-md)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            <span>by {entry.author_name || '名無し'}</span>
                            <span>{new Date(entry.created_at).toLocaleDateString('ja-JP')}</span>
                        </div>
                    </div>
                </Link>
            ))}

            {!loading && filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--text-muted)' }}>
                    {entries.length === 0 ? '投稿された装備はまだありません。最初の投稿者になりましょう！' : '条件に一致する装備が見つかりませんでした。'}
                </div>
            )}
        </div>
    );
}
