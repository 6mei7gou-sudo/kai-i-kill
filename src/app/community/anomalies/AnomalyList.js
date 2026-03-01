// 怪異調査書一覧 — クライアントコンポーネント
'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// 等級の色
const GRADE_COLOR = {
    '特級': '#ff4444', '一級': '#ffaa00', '二級': '#4488ff',
    '三級': '#cccccc', '四級': '#888888', '五級': '#666666', '不明': '#555555',
};
const THREAT_COLOR = {
    '甲種': '#ff4444', '乙種': '#ffaa00', '丙種': '#999999', '丁種': '#4488ff', '不明': '#555555',
};

export default function AnomalyList() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [gradeFilter, setGradeFilter] = useState('すべて');
    const [threatFilter, setThreatFilter] = useState('すべて');

    // データ取得
    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('anomaly_drafts')
                .select('*')
                .eq('visibility', '公開')
                .order('created_at', { ascending: false });
            if (!error && data) setEntries(data);
            setLoading(false);
        })();
    }, []);

    // フィルタリング
    const filtered = useMemo(() => {
        return entries.filter(e => {
            const matchSearch = !search ||
                e.anomaly_name?.includes(search) ||
                e.summary?.includes(search) ||
                e.author_name?.includes(search);
            const matchGrade = gradeFilter === 'すべて' || e.grade === gradeFilter;
            const matchThreat = threatFilter === 'すべて' || e.threat_type === threatFilter;
            return matchSearch && matchGrade && matchThreat;
        });
    }, [entries, search, gradeFilter, threatFilter]);

    const S = {
        filterBar: {
            display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap',
            marginBottom: 'var(--space-xl)', alignItems: 'center',
        },
        searchInput: {
            flex: 1, minWidth: '200px', background: 'var(--bg-elevated)',
            border: 'var(--border-subtle)', color: 'var(--text-primary)',
            padding: '10px 14px', fontSize: 'var(--font-size-base)', fontFamily: 'inherit',
        },
        select: {
            background: 'var(--bg-elevated)', border: 'var(--border-subtle)',
            color: 'var(--text-primary)', padding: '10px 14px',
            fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-mono)', cursor: 'pointer',
        },
        card: {
            background: 'var(--bg-card)', border: 'var(--border-subtle)',
            padding: 'var(--space-lg)', marginBottom: 'var(--space-md)',
            transition: 'border-color 0.2s ease, background 0.2s ease',
            cursor: 'pointer',
        },
        cardHeader: {
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            marginBottom: 'var(--space-sm)', gap: 'var(--space-md)',
        },
        cardName: { fontSize: 'var(--font-size-lg)', fontWeight: 700 },
        cardMeta: {
            display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap',
            marginBottom: 'var(--space-sm)',
        },
        badge: (color) => ({
            fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)',
            fontWeight: 700, color, padding: '2px 8px',
            border: `1px solid ${color}33`, background: `${color}11`,
        }),
        desc: {
            color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)',
            lineHeight: 1.7, overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
        },
        footer: {
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 'var(--space-md)', fontSize: 'var(--font-size-xs)',
            color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
        },
    };

    return (
        <div className="container">
            <section className="section">
                <span className="section__title">// COMMUNITY — ANOMALY DATABASE</span>
                <h1 className="section__heading">怪異調査書一覧</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
                    コミュニティが投稿した怪異調査書（TMP）を閲覧できます。
                    <span className="badge badge--cyber" style={{ marginLeft: '8px' }}>
                        {entries.length}件
                    </span>
                </p>
                <Link href="/create/anomaly/" style={{
                    display: 'inline-block', fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--font-size-sm)', color: 'var(--accent-cyber)',
                    border: '1px solid var(--accent-cyber)', padding: '8px 20px',
                    textDecoration: 'none', transition: 'all 0.2s',
                }}>▲ 新しい調査書を作成</Link>
            </section>

            {/* フィルターバー */}
            <div style={S.filterBar}>
                <input style={S.searchInput} placeholder="怪異名・投稿者で検索..."
                    value={search} onChange={e => setSearch(e.target.value)} />
                <select style={S.select} value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}>
                    {['すべて', '特級', '一級', '二級', '三級', '四級', '五級', '不明'].map(o =>
                        <option key={o} value={o}>{o === 'すべて' ? '等級: すべて' : o}</option>)}
                </select>
                <select style={S.select} value={threatFilter} onChange={e => setThreatFilter(e.target.value)}>
                    {['すべて', '甲種', '乙種', '丙種', '丁種', '不明'].map(o =>
                        <option key={o} value={o}>{o === 'すべて' ? '脅威度: すべて' : o}</option>)}
                </select>
            </div>

            {/* 件数表示 */}
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }}>
                {filtered.length} / {entries.length} 件表示
            </p>

            {/* ローディング */}
            {loading && (
                <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--text-muted)' }}>
                    データを読み込み中...
                </div>
            )}

            {/* カード一覧 */}
            {!loading && filtered.map(entry => (
                <Link key={entry.id} href={`/community/anomalies/${entry.id}/`}
                    style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                    <div style={S.card}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,255,170,0.3)'; e.currentTarget.style.background = 'rgba(0,255,170,0.03)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.background = 'var(--bg-card)'; }}>
                        <div style={S.cardHeader}>
                            <h3 style={S.cardName}>{entry.anomaly_name || '（無題）'}</h3>
                            <span style={{
                                fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)',
                                color: 'var(--text-muted)', whiteSpace: 'nowrap',
                            }}>{entry.status}</span>
                        </div>
                        <div style={S.cardMeta}>
                            <span style={S.badge(GRADE_COLOR[entry.grade] || '#555')}>{entry.grade}</span>
                            <span style={S.badge(THREAT_COLOR[entry.threat_type] || '#555')}>{entry.threat_type}</span>
                            {entry.tags?.map(t => (
                                <span key={t} className="badge badge--cyber">#{t}</span>
                            ))}
                        </div>
                        {entry.summary && <p style={S.desc}>{entry.summary}</p>}
                        <div style={S.footer}>
                            <span>by {entry.author_name || '名無し'}</span>
                            <span>{new Date(entry.created_at).toLocaleDateString('ja-JP')}</span>
                        </div>
                    </div>
                </Link>
            ))}

            {/* 空状態 */}
            {!loading && filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--text-muted)' }}>
                    {entries.length === 0
                        ? '投稿された怪異調査書はまだありません。最初の投稿者になりましょう！'
                        : '条件に一致する調査書が見つかりませんでした。'}
                </div>
            )}
        </div>
    );
}
