// ステータス概要パネル — ゲームデータ入力中に常時表示し、
// 「いまの選択で能力値がどう決まっているか」を一目で見せる
'use client';

import { ABILITIES, STAGE_PLUS_MAX } from '@/data/characterBuildData';
import { calcBeliefPoints, calcCpBudget, getSkillSlots } from '@/lib/characterBuild';
import { rankBadgeStyle, SourceChip } from './formStyles';

export default function StatusSummary({ form, ranks, status, usedCp = 0, onJump, compact = false }) {
    const stagePlusCount = (form.stage_plus || []).length;
    const skillSlots = getSkillSlots(form.level);
    const skillCount = (form.skills || []).length;
    const belief = calcBeliefPoints(form.awakening);
    const cpBudget = calcCpBudget(form.background, form.equipment_type);
    const cpRemaining = cpBudget - usedCp;

    return (
        <aside style={{ padding: '14px', background: 'rgba(0,0,0,0.35)', border: '1px solid var(--accent-gold-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.15em', color: 'var(--accent-gold)' }}>STATUS SUMMARY</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: status.complete ? '#44cc88' : 'var(--text-muted)' }}>
                    {status.complete ? '✓ ゲームデータ完成' : `未選択：${status.missing.join('・')}`}
                </div>
            </div>

            {/* 七つの能力値 */}
            <div style={{ display: 'grid', gridTemplateColumns: compact ? 'repeat(7, 1fr)' : '1fr', gap: compact ? '4px' : '6px' }}>
                {ABILITIES.map(a => {
                    const r = ranks[a.key];
                    const upgraded = r.rank !== 'D';
                    const sources = r.sources.filter(s => s.type !== '段階');
                    return compact ? (
                        <div key={a.key} style={{ textAlign: 'center', padding: '6px 2px', background: 'rgba(255,255,255,0.02)', border: upgraded ? '1px solid var(--accent-gold-border)' : 'var(--border-subtle)' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>{a.name}</div>
                            <div style={{ ...rankBadgeStyle(r.rank, { upgraded, plus: r.plus, size: 'sm' }), minWidth: 0, width: '100%', height: '26px', fontSize: '13px' }}>{r.display}</div>
                        </div>
                    ) : (
                        <div key={a.key} style={{ display: 'grid', gridTemplateColumns: '28px 40px 1fr', alignItems: 'center', gap: '8px', padding: '4px 6px', background: upgraded ? 'rgba(212,175,55,0.05)' : 'transparent', borderLeft: upgraded ? '2px solid var(--accent-gold)' : '2px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--font-size-md)' }}>{a.name}</div>
                            <span style={rankBadgeStyle(r.rank, { upgraded, plus: r.plus, size: 'sm' })}>{r.display}</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', alignItems: 'center' }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginRight: '2px' }}>{r.dice}{r.plus ? ' +1' : ''}</span>
                                {sources.map((s, i) => <SourceChip key={i} source={s} />)}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* リソース行 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '6px', marginTop: '10px' }}>
                <Stat label="+段階" value={`${stagePlusCount}/${STAGE_PLUS_MAX}`} warn={stagePlusCount > STAGE_PLUS_MAX} onClick={onJump && (() => onJump('abilities'))} />
                <Stat label="スキル" value={`${skillCount}/${skillSlots}`} warn={skillCount > skillSlots} onClick={onJump && (() => onJump('skills'))} />
                <Stat label="信念" value={belief} />
                <Stat label="装備CP 使用/予算" value={usedCp > 0 ? `${usedCp}/${cpBudget}` : `0/${cpBudget}`} warn={cpRemaining < 0} onClick={onJump && (() => onJump('armament'))} />
            </div>

            {!compact && (
                <div style={{ marginTop: '10px', fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    全能力値はDから始まり、<span style={{ color: 'var(--accent-gold)' }}>背景</span>で2つがC、<span style={{ color: '#44aaff' }}>配属</span>で1つがB、<span style={{ color: '#aa44ff' }}>先天覚醒</span>で術か魂がCになる。<span style={{ color: '#64c8ff' }}>+段階</span>は判定に+1。
                </div>
            )}
        </aside>
    );
}

function Stat({ label, value, warn, onClick }) {
    const Tag = onClick ? 'button' : 'div';
    return (
        <Tag type={onClick ? 'button' : undefined} onClick={onClick} style={{
            padding: '6px 8px', background: 'rgba(255,255,255,0.03)', border: warn ? '1px solid var(--accent-danger-border)' : 'var(--border-subtle)',
            textAlign: 'left', cursor: onClick ? 'pointer' : 'default', color: 'inherit', fontFamily: 'inherit',
        }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-md)', fontWeight: 700, color: warn ? 'var(--accent-danger)' : 'var(--accent-gold)' }}>{value}</div>
        </Tag>
    );
}
