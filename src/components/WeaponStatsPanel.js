// =====================================================
// 武器ステータス表示パネル
// CharacterForm（リアルタイムプレビュー）と
// CharacterDetail（読み取り専用）の両方で使用
// =====================================================
'use client';

const RISK_COLOR = {
    '低': '#88cc44',
    '中': '#ffaa00',
    '高': '#ff6644',
    '非常に高': '#ff4444',
};

const EMOTION_COLOR = {
    '怒り': '#ff4444',
    '渇望': '#ff8800',
    '焦燥': '#ffcc00',
    '恐怖': '#aa44ff',
    '哀愁': '#4488ff',
    '浄化': '#44ccaa',
};

export default function WeaponStatsPanel({ stats, weaponType, abilityRank, hasPlus, damageRange, compact }) {
    if (!stats) return null;

    const font = 'var(--font-mono)';
    const gold = 'var(--accent-gold)';
    const muted = 'var(--text-muted)';
    const secondary = 'var(--text-secondary)';
    const heading = 'var(--text-heading)';

    const modSign = stats.totalMod >= 0 ? '+' : '';
    const riskColor = RISK_COLOR[stats.riskLevel] || '#888';

    // --- compact mode（CharacterDetail用）---
    if (compact) {
        return (
            <div style={{ marginTop: 'var(--space-md)', padding: '12px 14px', background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontFamily: font, fontSize: '10px', color: muted, letterSpacing: '0.1em' }}>WEAPON STATS</span>
                    <span style={{ fontFamily: font, fontSize: '20px', fontWeight: 700, color: gold }}>{modSign}{stats.totalMod}</span>
                    <span style={{ fontFamily: font, fontSize: '10px', color: muted }}>
                        (基礎{stats.baseMod >= 0 ? '+' : ''}{stats.baseMod} / OPT{stats.optionMod >= 0 ? '+' : ''}{stats.optionMod}{stats.giftBonus > 0 ? ` / 鬼+${stats.giftBonus}` : ''})
                    </span>
                    {damageRange && (
                        <span style={{ fontFamily: font, fontSize: '11px', color: secondary }}>
                            DMG {damageRange.min}~{damageRange.max}
                        </span>
                    )}
                    <span style={{ marginLeft: 'auto', padding: '2px 8px', fontSize: '10px', fontFamily: font, fontWeight: 700, color: riskColor, border: `1px solid ${riskColor}33`, background: `${riskColor}11` }}>
                        RISK: {stats.riskLevel}
                    </span>
                </div>
                {(stats.conditions.length > 0 || stats.effects.length > 0 || stats.resonance.length > 0) && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {stats.conditions.map((c, i) => (
                            <span key={`c${i}`} style={{ padding: '2px 6px', fontSize: '10px', fontFamily: font, color: '#ffcc44', background: 'rgba(255,204,68,0.08)', border: '1px solid rgba(255,204,68,0.2)' }}>
                                {c.label}{c.value > 0 ? `+${c.value}` : ''}
                            </span>
                        ))}
                        {stats.effects.map((e, i) => (
                            <span key={`e${i}`} style={{ padding: '2px 6px', fontSize: '10px', fontFamily: font, color: '#44ccff', background: 'rgba(68,204,255,0.08)', border: '1px solid rgba(68,204,255,0.2)' }}>
                                {e.stat}+{e.value}
                            </span>
                        ))}
                        {stats.resonance.map((r, i) => (
                            <span key={`r${i}`} style={{ padding: '2px 6px', fontSize: '10px', fontFamily: font, color: EMOTION_COLOR[r.emotion] || '#aaa', background: `${EMOTION_COLOR[r.emotion] || '#aaa'}11`, border: `1px solid ${EMOTION_COLOR[r.emotion] || '#aaa'}33` }}>
                                {r.emotion}{r.value > 0 ? '+' : ''}{r.value}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // --- full mode（CharacterForm用）---
    return (
        <div style={{ marginTop: 'var(--space-lg)', padding: '16px', background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.2)' }}>
            {/* ヘッダー */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontFamily: font, fontSize: '10px', color: gold, letterSpacing: '0.15em', fontWeight: 700 }}>WEAPON STATS</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(212,175,55,0.2)' }} />
                <span style={{ padding: '2px 10px', fontSize: '10px', fontFamily: font, fontWeight: 700, color: riskColor, border: `1px solid ${riskColor}44`, background: `${riskColor}11` }}>
                    RISK: {stats.riskLevel}
                </span>
            </div>

            {/* メインステータスグリッド */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                {/* 武器修正 */}
                <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', border: 'var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ fontFamily: font, fontSize: '10px', color: muted, marginBottom: '4px' }}>武器修正</div>
                    <div style={{ fontFamily: font, fontSize: '28px', fontWeight: 700, color: gold, lineHeight: 1 }}>{modSign}{stats.totalMod}</div>
                    <div style={{ fontFamily: font, fontSize: '10px', color: muted, marginTop: '6px' }}>
                        基礎{stats.baseMod >= 0 ? '+' : ''}{stats.baseMod}
                        {stats.optionMod !== 0 && <> / OPT{stats.optionMod >= 0 ? '+' : ''}{stats.optionMod}</>}
                        {stats.giftBonus > 0 && <> / 鬼+{stats.giftBonus}</>}
                    </div>
                </div>

                {/* 予想ダメージ */}
                <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', border: 'var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ fontFamily: font, fontSize: '10px', color: muted, marginBottom: '4px' }}>予想ダメージ</div>
                    {damageRange ? (
                        <>
                            <div style={{ fontFamily: font, fontSize: '28px', fontWeight: 700, color: heading, lineHeight: 1 }}>
                                {damageRange.min}<span style={{ fontSize: '16px', color: muted }}>~</span>{damageRange.max}
                            </div>
                            <div style={{ fontFamily: font, fontSize: '10px', color: muted, marginTop: '6px' }}>
                                {damageRange.dice} + {modSign}{stats.totalMod}
                            </div>
                        </>
                    ) : (
                        <div style={{ fontFamily: font, fontSize: '14px', color: muted, marginTop: '8px' }}>—</div>
                    )}
                </div>

                {/* スロット */}
                <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', border: 'var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ fontFamily: font, fontSize: '10px', color: muted, marginBottom: '4px' }}>スロット</div>
                    <div style={{ fontFamily: font, fontSize: '28px', fontWeight: 700, color: stats.slotExceeded ? '#ff4444' : heading, lineHeight: 1 }}>
                        {stats.slotUsed}<span style={{ fontSize: '16px', color: muted }}>/{stats.slotMax}</span>
                    </div>
                    {stats.slotExceeded && (
                        <div style={{ fontFamily: font, fontSize: '10px', color: '#ff4444', marginTop: '6px' }}>違法改造</div>
                    )}
                </div>
            </div>

            {/* 条件付きボーナス */}
            {stats.conditions.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontFamily: font, fontSize: '10px', color: muted, marginBottom: '4px' }}>条件付きボーナス</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {stats.conditions.map((c, i) => (
                            <span key={i} style={{ padding: '4px 10px', fontSize: '11px', fontFamily: font, color: '#ffcc44', background: 'rgba(255,204,68,0.08)', border: '1px solid rgba(255,204,68,0.2)' }}>
                                {c.label}{c.value > 0 ? ` +${c.value}` : ''}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* 副次効果 */}
            {stats.effects.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontFamily: font, fontSize: '10px', color: muted, marginBottom: '4px' }}>副次効果</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {stats.effects.map((e, i) => (
                            <span key={i} style={{ padding: '4px 10px', fontSize: '11px', fontFamily: font, color: '#44ccff', background: 'rgba(68,204,255,0.08)', border: '1px solid rgba(68,204,255,0.2)' }}>
                                {e.stat} +{e.value}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* 共鳴効果 */}
            {stats.resonance.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontFamily: font, fontSize: '10px', color: muted, marginBottom: '4px' }}>共鳴影響</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {stats.resonance.map((r, i) => {
                            const c = EMOTION_COLOR[r.emotion] || '#aaa';
                            return (
                                <span key={i} style={{ padding: '4px 10px', fontSize: '11px', fontFamily: font, color: c, background: `${c}11`, border: `1px solid ${c}33` }}>
                                    {r.emotion} {r.value > 0 ? '+' : ''}{r.value}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 特殊効果 */}
            {stats.specialTexts.length > 0 && (
                <div>
                    <div style={{ fontFamily: font, fontSize: '10px', color: muted, marginBottom: '4px' }}>特殊効果</div>
                    {stats.specialTexts.map((txt, i) => (
                        <div key={i} style={{ fontFamily: font, fontSize: '11px', color: secondary, padding: '2px 0' }}>
                            {txt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
