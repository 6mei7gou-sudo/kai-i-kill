// 怪異調査書 個別閲覧 — クライアントコンポーネント
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import IdBadge from '@/components/IdBadge';

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

                <IdBadge id={id} label="ANOMALY ID" created_at={entry.created_at} updated_at={entry.updated_at} />

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

            {/* 二次創作ガイドライン */}
            {entry.fanart_policy && (
                <div style={S.section}>
                    <div style={S.sectionTitle}>FANART POLICY</div>
                    <h2 style={S.sectionHeading}>二次創作ガイドライン</h2>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
                        この怪異の二次創作（イラスト・小説・派生設定・配信使用など）における作者の意向です。
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '6px' }}>
                        {[
                            // メディア種別
                            { key: 'novel', label: '小説' },
                            { key: 'illustration', label: 'イラスト' },
                            { key: 'figure', label: '立体物（フィギュア・3Dモデル）' },
                            { key: 'video', label: '動画' },
                            // 改変・派生
                            { key: 'visual_change', label: '見た目の自由改変' },
                            { key: 'personification', label: '擬人化' },
                            { key: 'sexual_personification', label: '性的擬人化' },
                            { key: 'setting_change', label: '核・ルール設定の改変' },
                            { key: 'derivative', label: '派生怪異の創作' },
                            // 描写
                            { key: 'comedy', label: 'コメディ・ギャグ化' },
                            { key: 'vs_others', label: '他怪異との対決描写' },
                            { key: 'with_characters', label: 'PCキャラとの絡み' },
                            { key: 'victim_depiction', label: '被害者の描写' },
                            { key: 'defeat_depiction', label: '討伐される描写' },
                            // R系・パロディ
                            { key: 'gore', label: 'グロ表現（流血・損壊）' },
                            { key: 'parody', label: 'パロディ' },
                            { key: 'r18', label: 'R18（性的描写）' },
                            { key: 'r18g', label: 'R18G（残酷描写）' },
                            // 使用範囲
                            { key: 'scenario_use', label: '自作シナリオでの使用' },
                            { key: 'streaming', label: '配信での紹介' },
                        ].map(item => {
                            const val = entry.fanart_policy[item.key] || 'ok';
                            const styleByVal = {
                                ok: { bg: 'rgba(0,255,170,0.15)', border: 'rgba(0,255,170,0.4)', color: '#00ffaa', label: 'OK' },
                                ask: { bg: 'rgba(255,170,0,0.15)', border: 'rgba(255,170,0,0.4)', color: '#ffaa00', label: '要相談' },
                                ng: { bg: 'rgba(255,77,77,0.15)', border: 'rgba(255,77,77,0.4)', color: '#ff4d4d', label: 'NG' },
                            }[val] || { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)', label: '—' };
                            return (
                                <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', background: 'rgba(0,0,0,0.2)', border: 'var(--border-subtle)' }}>
                                    <span style={{ flex: 1, fontSize: '12px', color: 'var(--text-primary)' }}>{item.label}</span>
                                    <span style={{
                                        padding: '2px 10px', fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700,
                                        background: styleByVal.bg, border: `1px solid ${styleByVal.border}`, color: styleByVal.color,
                                    }}>
                                        {styleByVal.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    {entry.fanart_policy.note && (
                        <div style={{ marginTop: 'var(--space-md)' }}>
                            <Field label="作者からの備考" value={entry.fanart_policy.note} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
