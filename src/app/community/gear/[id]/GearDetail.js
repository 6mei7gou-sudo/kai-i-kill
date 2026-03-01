// 武器・装備 個別閲覧 — クライアントコンポーネント
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const CAT_COLOR = { '武装型': '#4488ff', '独立型': '#88cc44', '半装身型': '#ffaa00', '全装身型': '#ff4444', '搭乗型': '#8844ff', '戦闘用搭乗型': '#ff44aa' };
const RISK_COLOR = { '低': '#88cc44', '中': '#ffaa00', '高': '#ff6644', '非常に高': '#ff4444' };

const S = {
    section: { marginBottom: 'var(--space-2xl)', padding: 'var(--space-xl)', background: 'var(--bg-card)', border: 'var(--border-subtle)' },
    sectionTitle: { fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)', textTransform: 'uppercase' },
    sectionHeading: { fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-md)' },
    label: { fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '4px' },
    value: { color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8, marginBottom: 'var(--space-md)' },
    badge: (color) => ({ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', fontWeight: 700, color, padding: '4px 12px', border: `1px solid ${color}44`, background: `${color}15`, marginRight: '8px' }),
    row: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-md)' },
};

const Field = ({ label, value }) => {
    if (!value && value !== 0) return null;
    return <div style={{ marginBottom: 'var(--space-md)' }}><div style={S.label}>{label}</div><div style={S.value}>{value}</div></div>;
};

export default function GearDetail({ id }) {
    const [entry, setEntry] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase.from('gear_posts').select('*').eq('id', id).single();
            if (!error && data) setEntry(data);
            setLoading(false);
        })();
    }, [id]);

    if (loading) return <div className="container" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--text-muted)' }}>読み込み中...</div>;
    if (!entry) return <div className="container" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--text-muted)' }}>装備データが見つかりませんでした。</div>;

    const options = typeof entry.options === 'string' ? JSON.parse(entry.options || '[]') : (entry.options || []);
    const strengths = typeof entry.strengths === 'string' ? JSON.parse(entry.strengths || '[]') : (entry.strengths || []);
    const weaknesses = typeof entry.weaknesses === 'string' ? JSON.parse(entry.weaknesses || '[]') : (entry.weaknesses || []);
    const assetUrls = typeof entry.asset_urls === 'string' ? JSON.parse(entry.asset_urls || '[]') : (entry.asset_urls || []);

    return (
        <div className="container">
            {/* ヘッダー */}
            <section className="section">
                <Link href="/community/gear/" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--accent-cyber)', textDecoration: 'none' }}>← 一覧に戻る</Link>
                <div style={{ marginTop: 'var(--space-lg)' }}>
                    <span className="section__title">// GEAR — EQUIPMENT DATA</span>
                    <h1 className="section__heading">{entry.gear_name}</h1>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
                        <span style={S.badge(CAT_COLOR[entry.category] || '#888')}>{entry.category}</span>
                        <span style={S.badge(RISK_COLOR[entry.risk_level] || '#888')}>リスク: {entry.risk_level}</span>
                        <span style={S.badge('#888')}>{entry.manufacturer}</span>
                        {entry.affiliation_fit && entry.affiliation_fit !== 'どれでも' && <span className="badge badge--kai">{entry.affiliation_fit}</span>}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                        by {entry.author_name || '名無し'} · {new Date(entry.created_at).toLocaleDateString('ja-JP')}
                    </div>
                </div>
            </section>

            {/* 概要 */}
            <div style={S.section}>
                <div style={S.sectionTitle}>OVERVIEW</div>
                <h2 style={S.sectionHeading}>概要</h2>
                <Field label="一行要約" value={entry.summary} />
                {entry.intended_role?.length > 0 && (
                    <div style={{ marginBottom: 'var(--space-md)' }}>
                        <div style={S.label}>想定役割</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {entry.intended_role.map(r => <span key={r} className="badge badge--cyber">{r}</span>)}
                        </div>
                    </div>
                )}
                {strengths.length > 0 && <div style={{ marginBottom: 'var(--space-md)' }}><div style={S.label}>強み</div>{strengths.map((s, i) => <div key={i} style={{ color: 'var(--accent-cyber)', fontSize: 'var(--font-size-sm)', padding: '4px 0' }}>+ {s}</div>)}</div>}
                {weaknesses.length > 0 && <div style={{ marginBottom: 'var(--space-md)' }}><div style={S.label}>弱点</div>{weaknesses.map((w, i) => <div key={i} style={{ color: 'var(--accent-danger)', fontSize: 'var(--font-size-sm)', padding: '4px 0' }}>− {w}</div>)}</div>}
            </div>

            {/* ベース装備 */}
            <div style={S.section}>
                <div style={S.sectionTitle}>BASE EQUIPMENT</div>
                <h2 style={S.sectionHeading}>ベース装備</h2>
                <div style={S.row}>
                    <Field label="ベース名" value={entry.base_name} />
                    <Field label="品質" value={entry.quality} />
                    <Field label="装備CP" value={entry.base_cp} />
                    <Field label="スロット数" value={entry.slot_count} />
                    <Field label="素養依存" value={entry.aptitude_dependency} />
                </div>
                <Field label="基礎修正" value={entry.base_modifier} />
                <Field label="追加特性" value={entry.additional_traits} />
            </div>

            {/* オプション */}
            {options.length > 0 && (
                <div style={S.section}>
                    <div style={S.sectionTitle}>OPTIONS</div>
                    <h2 style={S.sectionHeading}>カスタム構成</h2>
                    <div className="content-body">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th><th>オプション名</th><th>区分</th><th>CP</th><th>リスク</th><th>共鳴</th><th>備考</th>
                                </tr>
                            </thead>
                            <tbody>
                                {options.map((o, i) => (
                                    <tr key={i}>
                                        <td>{i + 1}</td>
                                        <td style={{ color: 'var(--text-primary)' }}>{o.name}</td>
                                        <td>{o.type}</td>
                                        <td style={{ fontFamily: 'var(--font-mono)' }}>{o.cp}</td>
                                        <td style={{ color: RISK_COLOR[o.risk] || '#888' }}>{o.risk}</td>
                                        <td>{o.resonance || '—'}</td>
                                        <td>{o.note || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ marginTop: 'var(--space-md)', padding: '12px', background: 'rgba(0,0,0,0.3)', border: 'var(--border-subtle)', display: 'flex', gap: 'var(--space-xl)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                        <span>合計CP: <strong style={{ color: 'var(--text-primary)' }}>{entry.total_cp}</strong></span>
                        <span>搭載数: <strong style={{ color: 'var(--text-primary)' }}>{entry.option_count}</strong></span>
                        {entry.slot_exceeded && <span style={{ color: 'var(--accent-danger)' }}>⚠ スロット超過（違法改造）</span>}
                    </div>
                </div>
            )}

            {/* 共鳴・侵食 */}
            {(entry.resonance_tendency || entry.erosion_risk !== 'なし') && (
                <div style={S.section}>
                    <div style={S.sectionTitle}>RESONANCE</div>
                    <h2 style={S.sectionHeading}>共鳴・侵食</h2>
                    <div style={S.row}>
                        <Field label="共鳴傾向" value={entry.resonance_tendency} />
                        <Field label="侵食リスク" value={entry.erosion_risk} />
                    </div>
                    <Field label="共鳴のトリガー" value={entry.resonance_trigger} />
                    <Field label="侵食の兆候" value={entry.erosion_signs} />
                    <Field label="起きうる変調" value={entry.possible_anomalies} />
                </div>
            )}

            {/* VRC改変情報 */}
            {(entry.base_product_url || assetUrls.length > 0) && (
                <div style={S.section}>
                    <div style={S.sectionTitle}>VRC ASSETS</div>
                    <h2 style={S.sectionHeading}>VRC改変情報</h2>
                    {entry.base_product_url && <div style={{ marginBottom: 'var(--space-md)' }}><div style={S.label}>ベース商品</div><a href={entry.base_product_url} target="_blank" rel="noopener" style={{ color: 'var(--accent-cyber)', fontSize: 'var(--font-size-sm)' }}>{entry.base_product_url}</a></div>}
                    {assetUrls.length > 0 && <div style={{ marginBottom: 'var(--space-md)' }}><div style={S.label}>使用アセット</div>{assetUrls.map((u, i) => <div key={i}><a href={u} target="_blank" rel="noopener" style={{ color: 'var(--accent-cyber)', fontSize: 'var(--font-size-sm)' }}>{u}</a></div>)}</div>}
                    <Field label="改変メモ" value={entry.modification_notes} />
                    <Field label="ライセンス" value={entry.license_notes} />
                    <Field label="クレジット" value={entry.credit} />
                </div>
            )}

            {/* 関連リンク */}
            {(entry.related_characters || entry.related_anomalies || entry.related_factions || entry.related_terms) && (
                <div style={S.section}>
                    <div style={S.sectionTitle}>LINKS</div>
                    <h2 style={S.sectionHeading}>関連リンク</h2>
                    <div style={S.row}>
                        <Field label="関連キャラ" value={entry.related_characters} />
                        <Field label="関連怪異" value={entry.related_anomalies} />
                        <Field label="関連組織" value={entry.related_factions} />
                        <Field label="関連用語" value={entry.related_terms} />
                    </div>
                </div>
            )}
        </div>
    );
}
