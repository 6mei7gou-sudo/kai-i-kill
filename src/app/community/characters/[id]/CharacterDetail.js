// キャラクターシート詳細 — クライアントコンポーネント
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const AFF_COLOR = { '祓部': '#4488ff', '傭兵': '#ffaa00', '無所属': '#ff6644' };
const LANG_COLORS = { 'P': '#888', 'Igniscript': '#ff4444', 'Lupis Surf': '#4488ff', 'Ivyo': '#44cc44', 'NGT': '#ffcc00', 'Monyx': '#aaa', 'P:': '#aa44ff', "P'": '#ff88cc' };
const EROSION_STAGES = [
    { max: 25, name: '正常', color: '#88cc44' },
    { max: 50, name: '変容の兆し', color: '#ffcc00' },
    { max: 75, name: '半化の影', color: '#ff8800' },
    { max: 99, name: '臨界', color: '#ff4444' },
    { max: 100, name: '怪異化', color: '#ff0000' },
];

const ATTRS = [
    { key: 'attr_shiya', name: '視野', reading: 'しや' },
    { key: 'attr_shiki', name: '識', reading: 'しき' },
    { key: 'attr_tai', name: '体', reading: 'たい' },
    { key: 'attr_jutsu', name: '術', reading: 'じゅつ' },
    { key: 'attr_kon', name: '魂', reading: 'こん' },
    { key: 'attr_en', name: '縁', reading: 'えん' },
];

const SS = {
    section: { marginBottom: 'var(--space-2xl)', padding: 'var(--space-xl)', background: 'var(--bg-card)', border: 'var(--border-subtle)' },
    sTitle: { fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)', textTransform: 'uppercase' },
    sHead: { fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-md)' },
    label: { fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '4px' },
    value: { color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8, marginBottom: 'var(--space-md)' },
};

const Field = ({ label, value }) => {
    if (!value) return null;
    return <div style={{ marginBottom: 'var(--space-md)' }}><div style={SS.label}>{label}</div><div style={SS.value}>{value}</div></div>;
};

export default function CharacterDetail({ id }) {
    const { user } = useUser();
    const [e, setE] = useState(null);
    const [loading, setLoading] = useState(true);
    const isOwner = user && e?.user_id && user.id === e.user_id;

    useEffect(() => {
        (async () => {
            const { data } = await supabase.from('character_sheets').select('*').eq('id', id).single();
            if (data) setE(data);
            setLoading(false);
        })();
    }, [id]);

    if (loading) return <div className="container" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--text-muted)' }}>読み込み中...</div>;
    if (!e) return <div className="container" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--text-muted)' }}>シートが見つかりませんでした。</div>;

    const erosion = EROSION_STAGES.find(s => e.erosion_rate <= s.max) || EROSION_STAGES[4];
    const maxAttr = Math.max(...ATTRS.map(a => e[a.key] || 0));

    return (
        <div className="container">
            {/* ヘッダー */}
            <section className="section">
                <Link href="/community/characters/" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--accent-cyber)', textDecoration: 'none' }}>← 一覧に戻る</Link>
                <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 'var(--space-xl)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {e.image_url && <img src={e.image_url} alt={e.character_name} style={{ width: 120, height: 120, objectFit: 'cover', border: `2px solid ${AFF_COLOR[e.affiliation]}44` }} />}
                    <div style={{ flex: 1 }}>
                        <span className="section__title">// CHARACTER SHEET</span>
                        <h1 className="section__heading" style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                            {e.character_name}
                            {e.title && <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 400, color: 'var(--text-muted)' }}>「{e.title}」</span>}
                        </h1>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: 'var(--space-sm)' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', padding: '4px 12px', background: AFF_COLOR[e.affiliation] + '15', border: `1px solid ${AFF_COLOR[e.affiliation]}44`, color: AFF_COLOR[e.affiliation], fontWeight: 700 }}>{e.affiliation}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', padding: '4px 12px', background: 'rgba(255,255,255,0.05)', border: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>{e.awakening}</span>
                            {e.age && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', padding: '4px 8px' }}>Age: {e.age}</span>}
                            {e.gender && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', padding: '4px 8px' }}>{e.gender}</span>}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>by {e.author_name || '名無し'} · {new Date(e.created_at).toLocaleDateString('ja-JP')}</div>
                        {isOwner && (
                            <Link href={`/create/character/${id}/`} style={{ display: 'inline-block', marginTop: 'var(--space-md)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)', padding: '6px 16px', textDecoration: 'none' }}>✏ 編集する</Link>
                        )}
                    </div>
                </div>
            </section>

            {/* 属性 */}
            <div style={SS.section}>
                <div style={SS.sTitle}>ATTRIBUTES</div>
                <h2 style={SS.sHead}>属性</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
                    {ATTRS.map(a => {
                        const val = e[a.key] || 0;
                        const pct = (val / 5) * 100;
                        return (
                            <div key={a.key} style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.2)', border: 'var(--border-subtle)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{a.name} <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>({a.reading})</span></span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-lg)', fontWeight: 700, color: val === maxAttr ? 'var(--accent-gold)' : 'var(--text-primary)' }}>{val}</span>
                                </div>
                                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${pct}%`, background: val === maxAttr ? 'var(--accent-gold)' : 'var(--accent-cyber)', transition: 'width 0.5s' }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 得意言語 */}
            {(e.primary_language || e.secondary_language) && (
                <div style={SS.section}>
                    <div style={SS.sTitle}>LANGUAGE</div>
                    <h2 style={SS.sHead}>得意言語</h2>
                    <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                        {e.primary_language && (
                            <div style={{ padding: '12px 20px', border: `2px solid ${LANG_COLORS[e.primary_language] || '#888'}`, background: `${LANG_COLORS[e.primary_language] || '#888'}15` }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>第一言語</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-lg)', fontWeight: 700, color: LANG_COLORS[e.primary_language] || '#ccc' }}>{e.primary_language}</div>
                            </div>
                        )}
                        {e.secondary_language && (
                            <div style={{ padding: '12px 20px', border: 'var(--border-subtle)', background: 'rgba(0,0,0,0.2)' }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>第二言語</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-md)', fontWeight: 700, color: LANG_COLORS[e.secondary_language] || '#ccc' }}>{e.secondary_language}</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 装備 */}
            {(e.equipment_type || e.equipment_name) && (
                <div style={SS.section}>
                    <div style={SS.sTitle}>EQUIPMENT</div>
                    <h2 style={SS.sHead}>主力装備</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
                        <Field label="種別" value={e.equipment_type} />
                        <Field label="装備名" value={e.equipment_name} />
                        <Field label="メーカー" value={e.equipment_maker} />
                    </div>
                    <Field label="詳細" value={e.equipment_detail} />
                </div>
            )}

            {/* 侵食率 */}
            <div style={SS.section}>
                <div style={SS.sTitle}>EROSION</div>
                <h2 style={SS.sHead}>侵食率</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: erosion.color }}>{e.erosion_rate}%</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: erosion.color, fontWeight: 700 }}>{erosion.name}</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', marginTop: 'var(--space-md)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${e.erosion_rate}%`, background: erosion.color, transition: 'width 0.5s' }} />
                </div>
            </div>

            {/* 因縁・バックストーリー */}
            {(e.fate || e.backstory) && (
                <div style={SS.section}>
                    <div style={SS.sTitle}>STORY</div>
                    <h2 style={SS.sHead}>因縁・バックストーリー</h2>
                    <Field label="因縁" value={e.fate} />
                    {e.backstory && <><div style={SS.label}>バックストーリー</div><div style={{ ...SS.value, whiteSpace: 'pre-wrap' }}>{e.backstory}</div></>}
                </div>
            )}

            {/* 関連リンク */}
            {(e.related_anomalies || e.related_characters || e.related_factions) && (
                <div style={SS.section}>
                    <div style={SS.sTitle}>LINKS</div>
                    <h2 style={SS.sHead}>関連リンク</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
                        <Field label="関連怪異" value={e.related_anomalies} />
                        <Field label="関連キャラ" value={e.related_characters} />
                        <Field label="関連組織" value={e.related_factions} />
                    </div>
                </div>
            )}
        </div>
    );
}
