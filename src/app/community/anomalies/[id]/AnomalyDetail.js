// 怪異調査書 個別閲覧 — クライアントコンポーネント
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const GRADE_COLOR = {
    '特級': '#ff4444', '一級': '#ffaa00', '二級': '#4488ff',
    '三級': '#cccccc', '四級': '#888888', '五級': '#666666', '不明': '#555555',
};
const THREAT_COLOR = {
    '甲種': '#ff4444', '乙種': '#ffaa00', '丙種': '#999999', '丁種': '#4488ff', '不明': '#555555',
};

const S = {
    section: { marginBottom: 'var(--space-2xl)', padding: 'var(--space-xl)', background: 'var(--bg-card)', border: 'var(--border-subtle)' },
    sectionTitle: { fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)', textTransform: 'uppercase' },
    sectionHeading: { fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-md)' },
    label: { fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '4px' },
    value: { color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8, marginBottom: 'var(--space-md)' },
    badge: (color) => ({ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', fontWeight: 700, color, padding: '4px 12px', border: `1px solid ${color}44`, background: `${color}15`, marginRight: '8px' }),
    row: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' },
    listItem: { color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
};

// テキスト表示ブロック
const Field = ({ label, value }) => {
    if (!value) return null;
    return (
        <div style={{ marginBottom: 'var(--space-md)' }}>
            <div style={S.label}>{label}</div>
            <div style={S.value}>{value}</div>
        </div>
    );
};

// JSON配列をリスト表示
const ListField = ({ label, items }) => {
    const parsed = typeof items === 'string' ? JSON.parse(items || '[]') : (items || []);
    if (!parsed.length) return null;
    return (
        <div style={{ marginBottom: 'var(--space-md)' }}>
            <div style={S.label}>{label}</div>
            {parsed.map((item, i) => (
                <div key={i} style={S.listItem}>— {item}</div>
            ))}
        </div>
    );
};

export default function AnomalyDetail({ id }) {
    const { user } = useUser();
    const [entry, setEntry] = useState(null);
    const [loading, setLoading] = useState(true);

    const isOwner = user && entry?.user_id && user.id === entry.user_id;
    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from('anomaly_drafts')
                .select('*')
                .eq('id', id)
                .single();
            if (!error && data) setEntry(data);
            setLoading(false);
        })();
    }, [id]);

    if (loading) return <div className="container" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--text-muted)' }}>読み込み中...</div>;
    if (!entry) return <div className="container" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--text-muted)' }}>調査書が見つかりませんでした。</div>;

    return (
        <div className="container">
            {/* ヘッダー */}
            <section className="section">
                <Link href="/community/anomalies/" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--accent-cyber)', textDecoration: 'none' }}>
                    ← 一覧に戻る
                </Link>
                <div style={{ marginTop: 'var(--space-lg)' }}>
                    <span className="section__title">// TMP — ANOMALY INVESTIGATION REPORT</span>
                    <h1 className="section__heading">{entry.anomaly_name}</h1>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
                        <span style={S.badge(GRADE_COLOR[entry.grade])}>{entry.grade}</span>
                        <span style={S.badge(THREAT_COLOR[entry.threat_type])}>{entry.threat_type}</span>
                        <span style={S.badge('#888')}>{entry.status}</span>
                        {entry.tags?.map(t => <span key={t} className="badge badge--cyber">#{t}</span>)}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                        by {entry.author_name || '名無し'} · {new Date(entry.created_at).toLocaleDateString('ja-JP')}
                    </div>
                    {isOwner && (
                        <Link href={`/create/anomaly/${id}/`} style={{
                            display: 'inline-block', marginTop: 'var(--space-md)',
                            fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)',
                            color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)',
                            padding: '6px 16px', textDecoration: 'none',
                        }}>✏ 編集する</Link>
                    )}
                </div>

                <div className="callout" style={{ marginTop: 'var(--space-lg)' }}>
                    <div className="callout__label">注意：</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        本書は未公認の調査書（TMP）です。誤情報を含む可能性があります。
                    </p>
                </div>
            </section>

            {/* 概要 */}
            <div style={S.section}>
                <div style={S.sectionTitle}>OVERVIEW</div>
                <h2 style={S.sectionHeading}>概要</h2>
                <Field label="一行要約" value={entry.summary} />
                <Field label="典型パターン" value={entry.typical_pattern} />
                <div style={S.row}>
                    <Field label="前兆" value={entry.omen} />
                    <Field label="最悪ケース" value={entry.worst_case} />
                </div>
            </div>

            {/* 分類 */}
            <div style={S.section}>
                <div style={S.sectionTitle}>CLASSIFICATION</div>
                <h2 style={S.sectionHeading}>暫定分類</h2>
                <div style={S.row}>
                    <Field label="影響範囲" value={entry.influence_range} />
                    <Field label="被害性質" value={entry.damage_type} />
                </div>
            </div>

            {/* 発生源・拡散 */}
            {(entry.origin || entry.spread_route) && (
                <div style={S.section}>
                    <div style={S.sectionTitle}>ORIGIN</div>
                    <h2 style={S.sectionHeading}>発生源・拡散</h2>
                    <Field label="元ネタ（噂の種）" value={entry.origin} />
                    <Field label="拡散経路" value={entry.spread_route} />
                    {entry.distorted_countermeasure && (
                        <div style={S.row}>
                            <Field label="本来の対策（推定）" value={entry.original_countermeasure} />
                            <Field label="現在流通している対策" value={entry.current_countermeasure} />
                        </div>
                    )}
                </div>
            )}

            {/* 核の推定 */}
            <div style={S.section}>
                <div style={S.sectionTitle}>CORE</div>
                <h2 style={S.sectionHeading}>核（Core）の推定</h2>
                <div style={S.row}>
                    <Field label="種別" value={entry.core_type} />
                    <Field label="挙動" value={entry.core_behavior} />
                    <Field label="破壊可否" value={entry.core_destroyable} />
                </div>
                <ListField label="核の候補" items={entry.core_candidates} />
            </div>

            {/* ルール推定 */}
            <div style={S.section}>
                <div style={S.sectionTitle}>RULES</div>
                <h2 style={S.sectionHeading}>ルール（Rule）の推定</h2>
                <ListField label="発動条件（トリガー候補）" items={entry.triggers} />
                <ListField label="禁忌（やってはいけない候補）" items={entry.taboos} />
                <Field label="例外・抜け道" value={entry.loopholes} />
                {(entry.violation_early || entry.violation_mid || entry.violation_late) && (
                    <>
                        <div style={S.label}>違反時の症状（段階）</div>
                        <div style={S.row}>
                            <Field label="初期" value={entry.violation_early} />
                            <Field label="中期" value={entry.violation_mid} />
                            <Field label="末期" value={entry.violation_late} />
                        </div>
                    </>
                )}
            </div>

            {/* 観測記録 */}
            <div style={S.section}>
                <div style={S.sectionTitle}>OBSERVATIONS</div>
                <h2 style={S.sectionHeading}>観測記録</h2>
                <ListField label="目撃証言" items={entry.testimonies} />
                <ListField label="記録媒体" items={entry.media_urls} />
            </div>

            {/* 暫定対処 */}
            {(entry.avoidance || entry.secondary_prevention || entry.investigation_notes) && (
                <div style={S.section}>
                    <div style={S.sectionTitle}>COUNTERMEASURES</div>
                    <h2 style={S.sectionHeading}>暫定対処</h2>
                    <Field label="その場の回避" value={entry.avoidance} />
                    <Field label="二次被害防止" value={entry.secondary_prevention} />
                    <Field label="追加調査メモ" value={entry.investigation_notes} />
                </div>
            )}

            {/* 関連リンク */}
            {(entry.related_anomalies || entry.related_characters || entry.related_factions || entry.related_terms) && (
                <div style={S.section}>
                    <div style={S.sectionTitle}>LINKS</div>
                    <h2 style={S.sectionHeading}>関連リンク</h2>
                    <div style={S.row}>
                        <Field label="関連怪異" value={entry.related_anomalies} />
                        <Field label="関連キャラ" value={entry.related_characters} />
                        <Field label="関連組織" value={entry.related_factions} />
                        <Field label="関連用語" value={entry.related_terms} />
                    </div>
                </div>
            )}
        </div>
    );
}
