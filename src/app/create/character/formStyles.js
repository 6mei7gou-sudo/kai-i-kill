// キャラクターシートフォーム共通スタイル・小物コンポーネント
'use client';

import { S } from '@/components/FormFields';
import { RANK_COLOR } from '@/data/characterBuildData';

export const cardStyle = (selected, accent = 'var(--accent-gold)') => ({
    padding: '14px', textAlign: 'left', cursor: 'pointer',
    border: selected ? `1px solid ${accent}` : 'var(--border-subtle)',
    background: selected ? 'rgba(212, 175, 55, 0.08)' : 'rgba(0,0,0,0.2)',
    color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
    transition: 'all 0.2s',
});

export const cardTitle = (selected, accent = 'var(--accent-gold)') => ({
    fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--font-size-sm)',
    marginBottom: '4px', color: selected ? accent : 'var(--text-primary)',
});

export const cardDesc = { fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.6 };

export const chipStyle = (selected, accent = 'var(--accent-gold)') => ({
    padding: '8px 14px', cursor: 'pointer', transition: 'all 0.2s',
    border: selected ? `1px solid ${accent}` : 'var(--border-subtle)',
    background: selected ? 'rgba(212, 175, 55, 0.12)' : 'rgba(0,0,0,0.3)',
    color: selected ? accent : 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)', fontSize: '12px',
});

export const infoBox = { marginTop: 'var(--space-sm)', padding: '12px', background: 'rgba(0,0,0,0.3)', border: 'var(--border-subtle)' };
export const gridCards = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' };
export const sectionNote = { color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-lg)', lineHeight: 1.7 };
export const mono = { fontFamily: 'var(--font-mono)' };

export const rankBadgeStyle = (rank, { upgraded = false, plus = false, size = 'md' } = {}) => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: size === 'sm' ? '32px' : '40px', height: size === 'sm' ? '28px' : '36px', padding: '0 6px',
    fontFamily: 'var(--font-mono)', fontSize: size === 'sm' ? 'var(--font-size-md)' : 'var(--font-size-lg)', fontWeight: 700,
    background: upgraded ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.04)',
    border: upgraded ? '1px solid var(--accent-gold-border)' : plus ? '1px solid rgba(100,200,255,0.3)' : 'var(--border-subtle)',
    color: RANK_COLOR[rank] || 'var(--text-muted)',
});

export const SOURCE_COLOR = { '背景': 'var(--accent-gold)', '配属': '#44aaff', '覚醒': '#aa44ff', '段階': '#64c8ff', '成長': '#44cc88', '公式': '#c0d0e0' };

/** 昇格の出どころチップ */
export function SourceChip({ source }) {
    const color = SOURCE_COLOR[source.type] || 'var(--text-muted)';
    return (
        <span style={{
            display: 'inline-block', padding: '1px 6px', fontSize: '10px', fontFamily: 'var(--font-mono)',
            color, border: `1px solid ${color}55`, background: `${color}12`, whiteSpace: 'nowrap',
        }}>
            {source.type}:{source.label}→{source.to}
        </span>
    );
}

/**
 * セクション枠。ステップ番号・タイトル・「この選択で決まること」・入力状況を揃えて表示する
 */
export function FormSection({ id, no, en, title, effect, status, children, required = false, accent = 'var(--accent-gold)' }) {
    return (
        <div id={id} style={{ ...S.section, scrollMarginTop: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                    <div style={{ ...S.sectionTitle, color: accent }}>{no != null ? `STEP ${no} — ` : ''}{en}</div>
                    <h2 style={{ ...S.sectionHeading, marginBottom: effect ? 'var(--space-xs)' : 'var(--space-lg)' }}>
                        {title}{required && <span style={{ color: 'var(--accent-danger)', marginLeft: '6px', fontSize: 'var(--font-size-sm)' }}>*</span>}
                    </h2>
                </div>
                {status && <StatusPill status={status} />}
            </div>
            {effect && <p style={sectionNote}>{effect}</p>}
            {children}
        </div>
    );
}

/** 入力状況ピル：{ done: boolean, label?: string } */
export function StatusPill({ status }) {
    const done = !!status.done;
    const color = done ? '#44cc88' : status.warn ? 'var(--accent-danger)' : 'var(--text-muted)';
    return (
        <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '3px 10px', whiteSpace: 'nowrap',
            color, border: `1px solid ${color}55`, background: `${color}10`,
        }}>
            {done ? '✓ ' : '○ '}{status.label || (done ? '入力済み' : '未選択')}
        </span>
    );
}

/** 小見出し（セクション内のサブステップ） */
export function SubHead({ children, color = 'var(--accent-gold)' }) {
    return (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color, fontWeight: 700, marginBottom: '8px', letterSpacing: '0.05em' }}>
            {children}
        </div>
    );
}

/** 注意・補足の帯 */
export function Notice({ children, tone = 'muted' }) {
    const palette = {
        muted:  { color: 'var(--text-muted)', border: 'rgba(255,255,255,0.08)', bg: 'rgba(0,0,0,0.2)' },
        gold:   { color: 'var(--accent-gold)', border: 'rgba(212,175,55,0.25)', bg: 'rgba(212,175,55,0.06)' },
        warn:   { color: '#ffaa00', border: 'rgba(255,170,0,0.3)', bg: 'rgba(255,170,0,0.1)' },
        danger: { color: '#ff6666', border: 'rgba(255,77,77,0.25)', bg: 'rgba(255,77,77,0.08)' },
        green:  { color: '#44cc88', border: 'rgba(68,204,136,0.25)', bg: 'rgba(68,204,136,0.06)' },
    }[tone];
    return (
        <div style={{ padding: '8px 12px', marginBottom: 'var(--space-md)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', lineHeight: 1.7, color: palette.color, border: `1px solid ${palette.border}`, background: palette.bg }}>
            {children}
        </div>
    );
}
