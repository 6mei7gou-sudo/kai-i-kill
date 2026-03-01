// キャラクターシート一覧 — クライアントコンポーネント
'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const AFF_COLOR = { '祓部': '#4488ff', '傭兵': '#ffaa00', '無所属': '#ff6644' };
const AFF_ICON = { '祓部': '⊙', '傭兵': '⚔', '無所属': '◈' };

export default function CharacterList() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterAff, setFilterAff] = useState('すべて');

    useEffect(() => {
        (async () => {
            const { data } = await supabase.from('character_sheets').select('*').order('created_at', { ascending: false });
            setEntries(data || []);
            setLoading(false);
        })();
    }, []);

    const filtered = useMemo(() => entries.filter(e => {
        if (filterAff !== 'すべて' && e.affiliation !== filterAff) return false;
        if (search) {
            const q = search.toLowerCase();
            return (e.character_name || '').toLowerCase().includes(q)
                || (e.author_name || '').toLowerCase().includes(q)
                || (e.title || '').toLowerCase().includes(q);
        }
        return true;
    }), [entries, search, filterAff]);

    if (loading) return <div className="container" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--text-muted)' }}>データを読み込み中...</div>;

    return (
        <div className="container">
            <section className="section">
                <span className="section__title">// COMMUNITY — CHARACTER DATABASE</span>
                <h1 className="section__heading">キャラクターシート一覧</h1>
                <p style={{ color: 'var(--text-secondary)' }}>コミュニティが投稿したキャラクターシートを閲覧できます。 <strong style={{ color: 'var(--accent-gold)' }}>{entries.length}件</strong></p>
                <Link href="/create/character/" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--accent-cyber)', textDecoration: 'none' }}>▲ 新しいシートを作成</Link>
            </section>

            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="キャラ名・投稿者で検索..."
                    style={{ flex: 1, minWidth: '200px', padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', background: 'var(--bg-card)', color: 'var(--text-primary)', border: 'var(--border-subtle)' }} />
                <select value={filterAff} onChange={e => setFilterAff(e.target.value)}
                    style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', background: 'var(--bg-card)', color: 'var(--text-primary)', border: 'var(--border-subtle)' }}>
                    <option value="すべて">所属：すべて</option>
                    <option value="祓部">祓部</option>
                    <option value="傭兵">傭兵</option>
                    <option value="無所属">無所属</option>
                </select>
            </div>

            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }}>{filtered.length} / {entries.length} 件表示</p>

            <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
                {filtered.map(e => (
                    <Link key={e.id} href={`/community/characters/${e.id}/`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ padding: 'var(--space-lg)', background: 'var(--bg-card)', border: 'var(--border-subtle)', transition: 'border-color 0.2s, transform 0.2s', cursor: 'pointer' }}
                            onMouseEnter={ev => { ev.currentTarget.style.borderColor = AFF_COLOR[e.affiliation] + '88'; ev.currentTarget.style.transform = 'translateX(4px)'; }}
                            onMouseLeave={ev => { ev.currentTarget.style.borderColor = ''; ev.currentTarget.style.transform = 'none'; }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                                <div>
                                    <h3 style={{ fontSize: 'var(--font-size-lg)', margin: 0 }}>
                                        <span style={{ color: AFF_COLOR[e.affiliation], marginRight: '8px' }}>{AFF_ICON[e.affiliation]}</span>
                                        {e.character_name}
                                        {e.title && <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginLeft: '12px', fontWeight: 400 }}>「{e.title}」</span>}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', padding: '2px 8px', background: AFF_COLOR[e.affiliation] + '15', border: `1px solid ${AFF_COLOR[e.affiliation]}44`, color: AFF_COLOR[e.affiliation] }}>{e.affiliation}</span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', padding: '2px 8px', background: 'rgba(255,255,255,0.05)', border: 'var(--border-subtle)', color: 'var(--text-muted)' }}>{e.awakening}</span>
                                        {e.primary_language && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', padding: '2px 8px', background: 'rgba(255,255,255,0.05)', border: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>{e.primary_language}</span>}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>by {e.author_name || '名無し'}</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{new Date(e.created_at).toLocaleDateString('ja-JP')}</div>
                                </div>
                            </div>
                            {e.fate && <p style={{ marginTop: '10px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{e.fate.slice(0, 100)}{e.fate.length > 100 ? '...' : ''}</p>}
                        </div>
                    </Link>
                ))}
                {filtered.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-3xl)' }}>該当するキャラクターが見つかりませんでした。</p>}
            </div>
        </div>
    );
}
