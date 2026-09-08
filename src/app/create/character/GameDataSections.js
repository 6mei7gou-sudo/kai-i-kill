// ゲームデータ（ステータス・戦闘用データ）のセクション群
// STEP 1 背景 → 2 配属 → 3 能力値の確認 → 4 スキル → 5 ギフト → 6 魔法言語 → 7 装備 → 8 サイバネティクス
// ステータスの構造（7能力値・ランク・背景C/配属B/覚醒C/+段階）は v4.0 のまま。
// 見せ方だけを「選ぶ → 何が決まるかが即座に見える」に揃えている。
'use client';

import { useMemo, useCallback } from 'react';
import { S, FormSelect, FormInput, FormTextArea } from '@/components/FormFields';
import WeaponStatsPanel from '@/components/WeaponStatsPanel';
import {
    ABILITIES, RANKS, BACKGROUNDS, ASSIGNMENTS, GIFTS, LANGUAGES, LANGUAGE_MAX,
    INNATE_AWAKENING, INNATE_CHOICES, STAGE_PLUS_MAX, MAX_LEVEL, CYBER_GRADE_MIN_LEVEL,
    GAME_DATA_STEPS, abilityName, assignmentLabel,
} from '@/data/characterBuildData';
import { calcBeliefPoints, calcCpBudget, getSkillSlots } from '@/lib/characterBuild';
import {
    COMBAT_STYLE_NAMES, COMBAT_STYLE_STATS, STYLE_TO_OLD, OLD_TO_STYLE, BASE_WEAPONS,
    EQUIPMENT_FORM_NAMES, EQUIPMENT_FORM_STATS, FORM_TO_OLD, OLD_TO_FORM, FORM_OPTIONS,
    ORIGIN_NAMES, ORIGIN_TIER, CUSTOM_OPTIONS, findOption, getWeaponSpec,
} from '@/data/weaponData';
import { calcWeaponStats, calcExpectedDamage, getAttackAbility } from '@/lib/weaponCalc';
import { CYBER_GRADES, CYBERNETICS, findCybernetic } from '@/data/cyberneticsData';
import { getAvailableSkills, getBackgroundSkill, getSkillTypeColor, getAxisColor } from '@/data/skillData';
import { cardStyle, cardTitle, cardDesc, chipStyle, gridCards, infoBox, rankBadgeStyle, FormSection, SubHead, Notice, SourceChip } from './formStyles';

const STEP = Object.fromEntries(GAME_DATA_STEPS.map(s => [s.key, s]));

/** 装備で使用中のCP（連携装備があればその値、なければ流派×出自×形態＋オプションから算出） */
export function calcUsedCp(form, myGear = []) {
    const optionsCp = (form.equipment_options || []).reduce((s, n) => { const o = findOption(n); return s + (o ? o.cp : 0); }, 0);
    const linkedGear = form.linked_gear_id ? myGear.find(g => g.id === form.linked_gear_id) : null;
    if (linkedGear && linkedGear.total_cp != null) return { usedCp: Number(linkedGear.total_cp), source: linkedGear.gear_name };
    if (!form.weapon_type) return { usedCp: 0, source: '' };
    const spec = getWeaponSpec(form.weapon_type, form.equipment_maker || '汎用品', form.equipment_type, form.equipment_name);
    let usedCp = spec ? spec.cp : 0;
    let source = spec ? `${OLD_TO_STYLE[form.weapon_type] || form.weapon_type}×${form.equipment_maker || '汎用品'}` : '';
    usedCp += optionsCp;
    if (optionsCp > 0) source += ` +OPT${optionsCp}CP`;
    return { usedCp, source };
}

export default function GameDataSections({ form, set, setForm, isOfficial, innateChoice, setInnateChoice, ranks, myGear }) {
    const stepStatus = (done, label) => ({ done, label });

    // --- トグル系 ---
    const toggleStagePlus = useCallback((abilityKey) => {
        setForm(prev => {
            const current = [...(prev.stage_plus || [])];
            if (current.includes(abilityKey)) return { ...prev, stage_plus: current.filter(k => k !== abilityKey) };
            if (!isOfficial && current.length >= STAGE_PLUS_MAX) return prev;
            return { ...prev, stage_plus: [...current, abilityKey] };
        });
    }, [isOfficial, setForm]);

    const toggleSkill = useCallback((skillId) => {
        setForm(prev => {
            const current = Array.isArray(prev.skills) ? [...prev.skills] : [];
            if (current.includes(skillId)) return { ...prev, skills: current.filter(s => s !== skillId) };
            if (!isOfficial && current.length >= getSkillSlots(prev.level)) return prev;
            return { ...prev, skills: [...current, skillId] };
        });
    }, [isOfficial, setForm]);

    const toggleLanguage = useCallback((type, langId) => {
        setForm(prev => {
            const key = type === 'proficient' ? 'proficient_languages' : 'weak_languages';
            const otherKey = type === 'proficient' ? 'weak_languages' : 'proficient_languages';
            const current = [...(prev[key] || [])];
            const other = prev[otherKey] || [];
            if (current.includes(langId)) return { ...prev, [key]: current.filter(l => l !== langId) };
            if (!isOfficial && (current.length >= LANGUAGE_MAX || other.includes(langId))) return prev;
            return { ...prev, [key]: [...current, langId] };
        });
    }, [isOfficial, setForm]);

    // --- 派生値 ---
    const availableSkills = useMemo(() => getAvailableSkills({
        affiliation: form.affiliation, assignment: form.sub_affiliation, awakening: form.awakening, weaponType: form.weapon_type,
    }), [form.affiliation, form.sub_affiliation, form.awakening, form.weapon_type]);
    const bgSkill = useMemo(() => getBackgroundSkill(form.background), [form.background]);
    const skillSlots = getSkillSlots(form.level);

    const weaponStats = useMemo(() => {
        if (!form.weapon_type) return null;
        return calcWeaponStats({
            weaponType: form.weapon_type, manufacturer: form.equipment_maker || '汎用品', equipmentType: form.equipment_type,
            subtype: form.equipment_name || '', options: form.equipment_options, gift: form.gift,
        });
    }, [form.weapon_type, form.equipment_maker, form.equipment_type, form.equipment_name, form.equipment_options, form.gift]);
    const attackAbilityKey = useMemo(() => getAttackAbility(form.weapon_type), [form.weapon_type]);
    const damageRange = useMemo(() => {
        if (!weaponStats || !attackAbilityKey) return null;
        return calcExpectedDamage(ranks[attackAbilityKey].rank, weaponStats.totalMod, ranks[attackAbilityKey].plus);
    }, [weaponStats, attackAbilityKey, ranks]);

    const { usedCp, source: cpSource } = calcUsedCp(form, myGear);
    const cpBudget = calcCpBudget(form.background, form.equipment_type);
    const profLen = (form.proficient_languages || []).length;
    const weakLen = (form.weak_languages || []).length;
    const assignments = ASSIGNMENTS[form.affiliation] || [];

    return (
        <>
            {/* ====== 公式キャラ用レベル設定 ====== */}
            {isOfficial && (
                <FormSection id="gd-level" en="LEVEL（公式キャラ専用）" title="レベル設定" accent="#c0d0e0">
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {Array.from({ length: MAX_LEVEL }, (_, i) => i + 1).map(lv => (
                            <button key={lv} type="button" onClick={() => set('level', lv)}
                                style={{
                                    padding: '6px 14px', fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                                    background: form.level === lv ? 'rgba(192,208,224,0.2)' : 'transparent',
                                    border: form.level === lv ? '1px solid rgba(192,208,224,0.4)' : '1px solid rgba(255,255,255,0.08)',
                                    color: form.level === lv ? '#c0d0e0' : 'var(--text-muted)',
                                }}>Lv.{lv}</button>
                        ))}
                    </div>
                </FormSection>
            )}

            {/* ====== STEP 1: 背景 ====== */}
            <FormSection id="gd-background" no={1} en={STEP.background.en} title={STEP.background.title} effect={STEP.background.effect} required
                status={stepStatus(!!form.background, form.background || '未選択')}>
                <div style={gridCards}>
                    {BACKGROUNDS.map(bg => {
                        const selected = form.background === bg.id;
                        const skill = getBackgroundSkill(bg.id);
                        return (
                            <button key={bg.id} type="button" onClick={() => set('background', selected ? '' : bg.id)} style={cardStyle(selected)}>
                                <div style={cardTitle(selected)}>{bg.id}</div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
                                    {bg.upgrades.map(abilityName).join('・')} → C
                                </div>
                                <div style={cardDesc}>{bg.desc}</div>
                                {skill && <div style={{ marginTop: '6px', fontSize: '10px', color: '#44cc88', fontFamily: 'var(--font-mono)' }}>自動スキル：{skill.id}（{skill.effect}）</div>}
                            </button>
                        );
                    })}
                </div>
            </FormSection>

            {/* ====== STEP 2: 配属 ====== */}
            <FormSection id="gd-assignment" no={2} en={STEP.assignment.en} title={`${assignmentLabel(form.affiliation)}（${form.affiliation}）`} effect={STEP.assignment.effect} required
                status={stepStatus(!!form.sub_affiliation, form.sub_affiliation || '未選択')}>
                <Notice tone="muted">所属は RPシート STEP 1 の「名前と立場」で変更できる。所属を変えると{assignmentLabel(form.affiliation)}は選び直しになる。</Notice>
                <div style={gridCards}>
                    {assignments.map(asn => {
                        const selected = form.sub_affiliation === asn.id;
                        return (
                            <button key={asn.id} type="button" onClick={() => set('sub_affiliation', selected ? '' : asn.id)} style={cardStyle(selected, '#44aaff')}>
                                <div style={cardTitle(selected, '#44aaff')}>{asn.id}</div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: '#44aaff', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>{abilityName(asn.upgrade)} → B</div>
                                <div style={cardDesc}>{asn.desc}</div>
                            </button>
                        );
                    })}
                </div>
            </FormSection>

            {/* ====== STEP 3: 能力値の確認 ====== */}
            <FormSection id="gd-abilities" no={3} en={STEP.abilities.en} title={STEP.abilities.title} effect={STEP.abilities.effect}
                status={stepStatus((form.stage_plus || []).length > 0, `+段階 ${(form.stage_plus || []).length}/${STAGE_PLUS_MAX}`)}>
                {form.awakening === INNATE_AWAKENING && (
                    <div style={{ ...infoBox, marginTop: 0, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: '#aa44ff' }}>先天覚醒型 — C昇格する能力値：</span>
                        {INNATE_CHOICES.map(key => (
                            <button key={key} type="button" onClick={() => setInnateChoice(key)}
                                style={{
                                    padding: '6px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700, cursor: 'pointer',
                                    background: innateChoice === key ? 'rgba(170,68,255,0.15)' : 'rgba(0,0,0,0.3)',
                                    border: innateChoice === key ? '1px solid rgba(170,68,255,0.4)' : 'var(--border-subtle)',
                                    color: innateChoice === key ? '#aa44ff' : 'var(--text-muted)',
                                }}>
                                {abilityName(key)}
                            </button>
                        ))}
                    </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
                    {ABILITIES.map(ability => {
                        const r = ranks[ability.key];
                        const upgraded = r.rank !== 'D';
                        const hidden = (form.hidden_abilities || []).includes(ability.key);
                        return (
                            <div key={ability.key} style={{ padding: '14px', background: 'rgba(0,0,0,0.2)', border: upgraded ? '1px solid var(--accent-gold-border)' : r.plus ? '1px solid rgba(100,200,255,0.2)' : 'var(--border-subtle)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <div>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-md)', fontWeight: 700 }}>{ability.name}</span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginLeft: '8px' }}>({ability.reading})</span>
                                    </div>
                                    <span style={rankBadgeStyle(r.rank, { upgraded, plus: r.plus })}>{r.display}</span>
                                </div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>{ability.desc}</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>ダイス：{r.dice}{r.plus ? '（達成値+1）' : ''}</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '6px', minHeight: '18px' }}>
                                    {r.sources.length > 0
                                        ? r.sources.map((s, i) => <SourceChip key={i} source={s} />)
                                        : <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>昇格なし（初期値D）</span>}
                                </div>
                                {isOfficial && (
                                    <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                                        {RANKS.map(rk => (
                                            <button key={rk} type="button" onClick={() => set(ability.key, rk)}
                                                style={{
                                                    padding: '3px 8px', fontFamily: 'var(--font-mono)', fontSize: '10px', cursor: 'pointer',
                                                    background: form[ability.key] === rk ? 'rgba(192,208,224,0.2)' : 'transparent',
                                                    border: form[ability.key] === rk ? '1px solid rgba(192,208,224,0.4)' : '1px solid rgba(255,255,255,0.08)',
                                                    color: form[ability.key] === rk ? '#c0d0e0' : 'var(--text-muted)',
                                                }}>{rk}</button>
                                        ))}
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                                    <button type="button" onClick={() => toggleStagePlus(ability.key)}
                                        style={{
                                            padding: '3px 10px', fontFamily: 'var(--font-mono)', fontSize: '10px', cursor: 'pointer',
                                            background: r.plus ? 'rgba(100,200,255,0.12)' : 'transparent',
                                            border: r.plus ? '1px solid rgba(100,200,255,0.3)' : '1px dashed rgba(255,255,255,0.15)',
                                            color: r.plus ? '#64c8ff' : 'var(--text-muted)',
                                        }}>
                                        {r.plus ? '＋段階 ✓' : '＋段階'}
                                    </button>
                                    {isOfficial && (
                                        <button type="button" onClick={() => setForm(prev => {
                                            const cur = [...(prev.hidden_abilities || [])];
                                            return { ...prev, hidden_abilities: hidden ? cur.filter(k => k !== ability.key) : [...cur, ability.key] };
                                        })}
                                            style={{
                                                padding: '3px 10px', fontFamily: 'var(--font-mono)', fontSize: '10px', cursor: 'pointer',
                                                background: hidden ? 'rgba(255,77,77,0.12)' : 'transparent',
                                                border: hidden ? '1px solid rgba(255,77,77,0.3)' : '1px dashed rgba(255,255,255,0.15)',
                                                color: hidden ? '#ff4d4d' : 'var(--text-muted)',
                                            }}>
                                            {hidden ? '非公開 ✓' : '非公開'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginTop: 'var(--space-md)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: (form.stage_plus || []).length <= STAGE_PLUS_MAX ? 'var(--text-muted)' : 'var(--accent-danger)' }}>
                        +段階：{(form.stage_plus || []).length} / {STAGE_PLUS_MAX}（判定に+1。ランクは上がらない）
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)' }}>
                        信念ポイント：{calcBeliefPoints(form.awakening)}{form.awakening === 'ショック覚醒型' ? '（ショック覚醒型 +1）' : ''}
                    </span>
                </div>
            </FormSection>

            {/* ====== STEP 4: スキル ====== */}
            <FormSection id="gd-skills" no={4} en={STEP.skills.en} title={STEP.skills.title} effect={STEP.skills.effect}
                status={stepStatus((form.skills || []).length > 0, `${(form.skills || []).length} / ${skillSlots} スロット`)}>
                {bgSkill && (
                    <div style={{ padding: '12px', background: 'rgba(68,204,136,0.06)', border: '1px solid rgba(68,204,136,0.2)', marginBottom: 'var(--space-lg)' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#44cc88', marginBottom: '4px' }}>自動取得（背景：{form.background}）— スロット不要</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-heading)' }}>{bgSkill.id}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>{bgSkill.effect}</div>
                    </div>
                )}
                {!form.sub_affiliation || !form.weapon_type ? (
                    <Notice tone="gold">配属（STEP 2）と戦闘流派（STEP 7）を選ぶと、それぞれの軸のスキルがここに追加される。</Notice>
                ) : null}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: (form.skills || []).length <= skillSlots ? 'var(--accent-gold)' : 'var(--accent-danger)', marginBottom: 'var(--space-md)' }}>
                    Lv{form.level}：スロット {(form.skills || []).length} / {skillSlots}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
                    {availableSkills.filter(s => s.level <= form.level).map(skill => {
                        const selected = (form.skills || []).includes(skill.id);
                        const axisColor = getAxisColor(skill.axis);
                        const typeColor = getSkillTypeColor(skill.type);
                        return (
                            <button key={skill.id} type="button" onClick={() => toggleSkill(skill.id)}
                                style={{ ...cardStyle(selected), borderColor: selected ? axisColor : undefined, background: selected ? `${axisColor}12` : 'rgba(0,0,0,0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--font-size-sm)', color: selected ? axisColor : 'var(--text-primary)' }}>{skill.id}</span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '1px 6px', border: `1px solid ${typeColor}40`, color: typeColor }}>{skill.type}</span>
                                </div>
                                <div style={{ fontSize: '10px', color: axisColor, marginBottom: '2px', fontFamily: 'var(--font-mono)' }}>[{skill.axis}] {skill.attr}判定 Lv{skill.level}</div>
                                <div style={cardDesc}>{skill.effect}</div>
                            </button>
                        );
                    })}
                </div>
                {availableSkills.filter(s => s.level > form.level).length > 0 && (
                    <details style={{ marginTop: 'var(--space-lg)' }}>
                        <summary style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            Lv{form.level + 1}以降で取得可能なスキル（{availableSkills.filter(s => s.level > form.level).length}種）
                        </summary>
                        <div style={{ ...gridCards, marginTop: 'var(--space-sm)' }}>
                            {availableSkills.filter(s => s.level > form.level).map(skill => (
                                <div key={skill.id} style={{ padding: '10px', background: 'rgba(0,0,0,0.15)', border: 'var(--border-subtle)', opacity: 0.6 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--font-size-xs)' }}>{skill.id}</span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: getSkillTypeColor(skill.type) }}>{skill.type}</span>
                                    </div>
                                    <div style={{ fontSize: '10px', color: getAxisColor(skill.axis), fontFamily: 'var(--font-mono)' }}>[{skill.axis}] {skill.attr}判定 Lv{skill.level}</div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{skill.effect}</div>
                                </div>
                            ))}
                        </div>
                    </details>
                )}
            </FormSection>

            {/* ====== STEP 5: ギフト ====== */}
            <FormSection id="gd-gift" no={5} en={STEP.gift.en} title={STEP.gift.title} effect={STEP.gift.effect}
                status={stepStatus(!!form.gift, form.gift || '未選択')}>
                <div style={gridCards}>
                    {GIFTS.map(gift => {
                        const selected = form.gift === gift.id;
                        return (
                            <button key={gift.id} type="button" onClick={() => set('gift', selected ? '' : gift.id)} style={cardStyle(selected)}>
                                <div style={cardTitle(selected)}>{gift.id}</div>
                                <div style={cardDesc}>{gift.desc}</div>
                            </button>
                        );
                    })}
                </div>
            </FormSection>

            {/* ====== STEP 6: 魔法言語 ====== */}
            <FormSection id="gd-languages" no={6} en={STEP.languages.en} title={STEP.languages.title} effect={STEP.languages.effect}
                status={{ done: profLen === weakLen && profLen > 0, warn: profLen !== weakLen, label: profLen === weakLen ? `得意${profLen} / 苦手${weakLen}` : `数を揃える（得意${profLen} / 苦手${weakLen}）` }}>
                <SubHead>得意言語（術判定+1）</SubHead>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: 'var(--space-xl)' }}>
                    {LANGUAGES.map(lang => {
                        const selected = (form.proficient_languages || []).includes(lang.id);
                        const inWeak = (form.weak_languages || []).includes(lang.id);
                        return (
                            <button key={lang.id} type="button" onClick={() => toggleLanguage('proficient', lang.id)} disabled={inWeak}
                                style={{
                                    padding: '10px 12px', textAlign: 'left', cursor: inWeak ? 'not-allowed' : 'pointer',
                                    border: selected ? `2px solid ${lang.hex}` : 'var(--border-subtle)',
                                    background: selected ? `${lang.hex}15` : inWeak ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.2)',
                                    color: selected ? lang.hex : inWeak ? 'var(--text-muted)' : 'var(--text-secondary)',
                                    opacity: inWeak ? 0.4 : 1, fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', transition: 'all 0.2s',
                                }}>
                                <div style={{ fontWeight: 700 }}>{lang.id} <span style={{ fontWeight: 400, fontSize: 'var(--font-size-xs)', color: lang.hex }}>({lang.color})</span></div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{lang.desc}</div>
                            </button>
                        );
                    })}
                </div>
                <SubHead color="var(--accent-danger)">苦手言語（術判定-1）</SubHead>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                    {LANGUAGES.map(lang => {
                        const selected = (form.weak_languages || []).includes(lang.id);
                        const inProf = (form.proficient_languages || []).includes(lang.id);
                        return (
                            <button key={lang.id} type="button" onClick={() => toggleLanguage('weak', lang.id)} disabled={inProf}
                                style={{
                                    padding: '10px 12px', textAlign: 'left', cursor: inProf ? 'not-allowed' : 'pointer',
                                    border: selected ? '2px solid var(--accent-danger)' : 'var(--border-subtle)',
                                    background: selected ? 'rgba(230, 57, 70, 0.1)' : inProf ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.2)',
                                    color: selected ? 'var(--accent-danger)' : inProf ? 'var(--text-muted)' : 'var(--text-secondary)',
                                    opacity: inProf ? 0.4 : 1, fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', transition: 'all 0.2s',
                                }}>
                                <div style={{ fontWeight: 700 }}>{lang.id}</div>
                            </button>
                        );
                    })}
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 'var(--space-md)' }}>P言語は全員使用可能。得意と苦手の数が合わないと投稿できない。</p>
            </FormSection>

            {/* ====== STEP 7: 装備 ====== */}
            <FormSection id="gd-armament" no={7} en={STEP.armament.en} title={STEP.armament.title} effect={STEP.armament.effect} required
                status={stepStatus(!!form.weapon_type, form.weapon_type ? `${OLD_TO_STYLE[form.weapon_type] || form.weapon_type}${form.equipment_name ? '・' + form.equipment_name : ''}` : '戦闘流派が必要')}>

                {/* 7-1 戦闘流派 */}
                <div style={{ marginBottom: 'var(--space-lg)' }}>
                    <SubHead>7-1　戦闘流派 — どう戦う？（必須）</SubHead>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                        {COMBAT_STYLE_NAMES.map(name => {
                            const cs = COMBAT_STYLE_STATS[name];
                            const storeId = STYLE_TO_OLD[name];
                            const selected = form.weapon_type === storeId;
                            return (
                                <button key={name} type="button"
                                    onClick={() => { set('weapon_type', selected ? '' : storeId); set('equipment_name', ''); }}
                                    style={cardStyle(selected, '#ff6644')}>
                                    <div style={cardTitle(selected, '#ff6644')}>{name}</div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: '#ff6644', marginBottom: '2px' }}>{cs.desc}・修正+{cs.mod}・{abilityName(cs.ability)}で攻撃</div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{cs.weapons}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 7-2 ベース武器 */}
                {form.weapon_type && (() => {
                    const styleName = OLD_TO_STYLE[form.weapon_type] || form.weapon_type;
                    const weapons = BASE_WEAPONS[styleName] || [];
                    if (weapons.length === 0) return null;
                    const sel = weapons.find(s => s.id === form.equipment_name);
                    return (
                        <div style={{ marginBottom: 'var(--space-lg)' }}>
                            <SubHead>7-2　ベース武器 — 何を持つ？</SubHead>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {weapons.map(sub => {
                                    const selected = form.equipment_name === sub.id;
                                    return (
                                        <button key={sub.id} type="button" onClick={() => set('equipment_name', selected ? '' : sub.id)} style={chipStyle(selected)}
                                            title={`修正${sub.modAdj > 0 ? '+' : ''}${sub.modAdj !== 0 ? sub.modAdj : '±0'} / ${sub.reach || '—'} — ${sub.note}`}>
                                            <span style={{ fontWeight: 700 }}>{sub.id}</span>
                                            {sub.modAdj !== 0 && <span style={{ marginLeft: '4px', fontSize: '10px', color: sub.modAdj > 0 ? '#44cc88' : '#ff8844' }}>{sub.modAdj > 0 ? '+' : ''}{sub.modAdj}</span>}
                                            {sub.reach && <span style={{ marginLeft: '4px', fontSize: '9px', color: '#88aacc', opacity: 0.8 }}>{sub.reach}</span>}
                                        </button>
                                    );
                                })}
                            </div>
                            {sel && <div style={{ marginTop: '6px', padding: '6px 10px', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>{sel.note}</div>}
                        </div>
                    );
                })()}

                {/* 7-3 装備形態 */}
                <div style={{ marginBottom: 'var(--space-lg)' }}>
                    <SubHead>7-3　装備形態 — どう装備する？</SubHead>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
                        {EQUIPMENT_FORM_NAMES.map(formName => {
                            const storeVal = FORM_TO_OLD[formName];
                            const selected = form.equipment_type === storeVal;
                            const ef = EQUIPMENT_FORM_STATS[formName];
                            return (
                                <button key={formName} type="button" onClick={() => set('equipment_type', storeVal)} style={cardStyle(selected, '#44ccff')}>
                                    <div style={cardTitle(selected, '#44ccff')}>{formName}</div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{ef.desc}</div>
                                    <div style={{ fontSize: '10px', color: '#44ccff', marginTop: '2px' }}>CP:{ef.cpBase} / スロット:{ef.baseSlot}</div>
                                </button>
                            );
                        })}
                    </div>
                    {(() => {
                        const formKey = OLD_TO_FORM[form.equipment_type] || form.equipment_type;
                        const formSubs = FORM_OPTIONS[formKey] || [];
                        if (formSubs.length === 0) return null;
                        return (
                            <div style={{ marginTop: '8px' }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px' }}>形態オプション</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {formSubs.map(sub => {
                                        const selected = form.equipment_name === sub.id;
                                        return (
                                            <button key={sub.id} type="button" onClick={() => set('equipment_name', selected ? '' : sub.id)} style={chipStyle(selected, '#44ccff')}
                                                title={`修正${sub.modAdj > 0 ? '+' : ''}${sub.modAdj !== 0 ? sub.modAdj : '±0'} / ${sub.reach || '—'} — ${sub.note}`}>
                                                <span style={{ fontWeight: 700 }}>{sub.id}</span>
                                                {sub.modAdj !== 0 && <span style={{ marginLeft: '4px', fontSize: '10px', color: sub.modAdj > 0 ? '#44cc88' : '#ff8844' }}>{sub.modAdj > 0 ? '+' : ''}{sub.modAdj}</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* 7-4 出自 */}
                <div style={{ marginBottom: 'var(--space-lg)' }}>
                    <SubHead>7-4　出自 — どこの？</SubHead>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
                        {ORIGIN_NAMES.map(name => {
                            const selected = form.equipment_maker === name;
                            const ot = ORIGIN_TIER[name];
                            return (
                                <button key={name} type="button" onClick={() => set('equipment_maker', selected ? '' : name)} style={cardStyle(selected, '#bb88ff')}>
                                    <div style={cardTitle(selected, '#bb88ff')}>{name}</div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>{ot.desc}</div>
                                    <div style={{ fontSize: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {ot.modBonus > 0 && <span style={{ color: 'var(--accent-gold)' }}>修正+{ot.modBonus}</span>}
                                        {ot.slotBonus > 0 && <span style={{ color: '#44ccff' }}>スロット+{ot.slotBonus}</span>}
                                        <span style={{ color: ot.cpMul > 1 ? '#ff8844' : 'var(--text-muted)' }}>CP×{ot.cpMul}</span>
                                        <span style={{ color: '#88aacc' }}>{ot.fit}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 7-5 固有名・詳細 */}
                <SubHead>7-5　固有名と詳細（任意）</SubHead>
                <FormInput label="固有名" value={form.custom_equipment_name || ''} onChange={v => set('custom_equipment_name', v)} placeholder="例：蒼鉄制式太刀、雷禽カスタムライフル、自作の魔導杖…" />
                <FormTextArea label="装備の詳細・カスタム" value={form.equipment_detail} onChange={v => set('equipment_detail', v)} placeholder="改造内容、特殊機能、入手経緯など" />

                {/* 7-6 カスタムオプション */}
                <div style={{ marginTop: 'var(--space-md)', padding: '16px', background: 'rgba(0,0,0,0.15)', border: 'var(--border-subtle)' }}>
                    <SubHead>7-6　カスタムオプション（任意）</SubHead>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>装備に搭載するオプション。汎用は全装備共通、専用は装備形態に対応。CPは予算から消費する。</p>
                    {Object.entries(CUSTOM_OPTIONS).map(([catName, opts]) => {
                        const isExclusive = catName.endsWith('専用');
                        if (isExclusive && catName.replace('専用', '') !== form.equipment_type) return null;
                        return (
                            <div key={catName} style={{ marginBottom: '12px' }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '4px' }}>{catName}</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {opts.map(opt => {
                                        const selected = form.equipment_options.includes(opt.name);
                                        return (
                                            <button key={opt.name} type="button"
                                                onClick={() => set('equipment_options', selected ? form.equipment_options.filter(n => n !== opt.name) : [...form.equipment_options, opt.name])}
                                                style={{ ...chipStyle(selected), padding: '6px 10px', fontSize: '11px' }}
                                                title={`${opt.cp}CP / 修正:${opt.mod} / 共鳴:${opt.resonance} / リスク:${opt.risk}`}>
                                                {opt.name}<span style={{ marginLeft: '4px', fontSize: '10px', opacity: 0.7 }}>{opt.cp}CP</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                    {form.equipment_options.length > 0 && (
                        <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(212, 175, 55, 0.06)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>選択中のオプション</div>
                            {form.equipment_options.map(name => {
                                const o = findOption(name);
                                return o ? (
                                    <div key={name} style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', padding: '2px 0' }}>
                                        {o.name} — {o.cp}CP / 修正:{o.mod} / 共鳴:{o.resonance} / リスク:{o.risk}
                                    </div>
                                ) : null;
                            })}
                        </div>
                    )}
                </div>

                {/* 武器ステータス */}
                {weaponStats && (
                    <WeaponStatsPanel stats={weaponStats} weaponType={form.weapon_type}
                        abilityRank={attackAbilityKey ? ranks[attackAbilityKey].rank : 'D'}
                        hasPlus={attackAbilityKey ? ranks[attackAbilityKey].plus : false}
                        damageRange={damageRange} />
                )}

                {/* 投稿済み装備の紐づけ */}
                <div style={{ marginTop: 'var(--space-lg)', padding: '16px', background: 'rgba(212, 175, 55, 0.04)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                    <SubHead>投稿済み装備を連携（任意）</SubHead>
                    {myGear.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {myGear.map(g => {
                                const isLinked = form.linked_gear_id === g.id;
                                return (
                                    <div key={g.id} onClick={() => set('linked_gear_id', isLinked ? '' : g.id)}
                                        style={{
                                            padding: '10px 14px', cursor: 'pointer', transition: 'all 0.2s',
                                            background: isLinked ? 'rgba(212, 175, 55, 0.12)' : 'rgba(0,0,0,0.3)',
                                            border: isLinked ? '2px solid var(--accent-gold)' : 'var(--border-subtle)',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        }}>
                                        <div>
                                            <span style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: 'var(--font-size-sm)' }}>{g.gear_name}</span>
                                            <span style={{ marginLeft: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{g.category || ''} {g.manufacturer ? `/ ${g.manufacturer}` : ''}</span>
                                        </div>
                                        {isLinked && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', fontWeight: 700 }}>連携中</span>}
                                    </div>
                                );
                            })}
                            {form.linked_gear_id && (
                                <button type="button" onClick={() => set('linked_gear_id', '')}
                                    style={{ padding: '6px 12px', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', background: 'transparent', border: '1px solid rgba(255,77,77,0.3)', color: '#ff6666', cursor: 'pointer', alignSelf: 'flex-start' }}>
                                    連携を解除
                                </button>
                            )}
                        </div>
                    ) : (
                        <div style={{ padding: '12px', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '8px' }}>まだ装備を投稿していない。新規作成時は上の選択から装備が自動投稿される。</p>
                            <a href="/create/weapon/" target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '6px 16px', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', fontWeight: 700, background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--accent-gold-border)', color: 'var(--accent-gold)', textDecoration: 'none' }}>
                                装備を別途投稿する
                            </a>
                        </div>
                    )}
                </div>

                {/* CP予算 */}
                {(() => {
                    const remaining = cpBudget - usedCp;
                    const pct = cpBudget > 0 ? Math.min(100, Math.max(0, (usedCp / cpBudget) * 100)) : 0;
                    const barColor = remaining < 0 ? 'var(--accent-danger)' : remaining <= 2 ? '#ffaa00' : 'var(--accent-gold)';
                    return (
                        <div style={{ marginTop: 'var(--space-sm)', padding: '12px', background: 'rgba(0,0,0,0.2)', border: 'var(--border-subtle)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: usedCp > 0 ? '8px' : 0 }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                                    装備CP予算{cpBudget > 10 && <span style={{ color: 'var(--accent-gold)', marginLeft: '4px' }}>(基本10 +背景{cpBudget - 10})</span>}
                                </span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--accent-gold)' }}>{cpBudget}CP</span>
                            </div>
                            {usedCp > 0 && (
                                <>
                                    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, marginBottom: '6px' }}>
                                        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 3, transition: 'width 0.3s' }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{cpSource}: {usedCp}CP</span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', fontWeight: 700, color: barColor }}>
                                            {remaining >= 0 ? `残り ${remaining}CP` : `${Math.abs(remaining)}CP 超過`}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })()}
            </FormSection>

            {/* ====== STEP 8: サイバネティクス ====== */}
            <FormSection id="gd-cybernetics" no={8} en={STEP.cybernetics.en} title={STEP.cybernetics.title} effect={STEP.cybernetics.effect}
                status={stepStatus(form.cyber_grade && form.cyber_grade !== 'none', form.cyber_grade && form.cyber_grade !== 'none' ? `等級${form.cyber_grade}` : 'なし（素体）')}>
                <Notice tone="danger">一度施術すると取り外せない。慎重に選択すること。</Notice>
                <FormSelect label="改造等級" value={form.cyber_grade} onChange={v => set('cyber_grade', v)} options={CYBER_GRADES.map(g => g.id)} />
                {['II', 'III'].map(g => form.cyber_grade === g && form.level < CYBER_GRADE_MIN_LEVEL[g] && (
                    <Notice key={g} tone="warn">等級{g === 'II' ? 'Ⅱ' : 'Ⅲ'}にはレベル{CYBER_GRADE_MIN_LEVEL[g]}以上が必要（現在 Lv.{form.level}）</Notice>
                ))}
                {form.cyber_grade !== 'none' && (() => {
                    const grade = CYBER_GRADES.find(g => g.id === form.cyber_grade);
                    const gradeOrder = ['I', 'II', 'III'];
                    const availList = gradeOrder.slice(0, gradeOrder.indexOf(form.cyber_grade) + 1).flatMap(g => CYBERNETICS[g] || []);
                    const usedCP = form.cybernetics.reduce((sum, c) => { const found = findCybernetic(c.name); return sum + (found ? found.cp : 0); }, 0);
                    return (
                        <>
                            <div style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.3)', border: 'var(--border-subtle)', marginBottom: 'var(--space-md)', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{grade.label}</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', fontWeight: 700, color: usedCP > grade.cpLimit ? 'var(--accent-danger)' : 'var(--accent-gold)' }}>{usedCP} / {grade.cpLimit} CP</span>
                            </div>
                            {form.cybernetics.map((slot, i) => (
                                <div key={i} style={{ marginBottom: 'var(--space-sm)', padding: '10px', background: 'rgba(0,0,0,0.2)', border: 'var(--border-subtle)' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-gold)', marginBottom: '6px' }}>スロット {i + 1}</div>
                                    <select value={slot.name}
                                        onChange={e => {
                                            const name = e.target.value;
                                            const arr = [...form.cybernetics];
                                            const found = findCybernetic(name);
                                            arr[i] = { name, part: found ? found.part : '' };
                                            set('cybernetics', arr);
                                        }}
                                        style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: 'var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }}>
                                        <option value="">— 選択なし —</option>
                                        {availList.map(c => <option key={c.name} value={c.name}>{c.name}（{c.cp}CP / {c.part} / {c.maker}）</option>)}
                                    </select>
                                    {slot.name && (() => {
                                        const c = findCybernetic(slot.name);
                                        return c ? <div style={{ marginTop: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>効果: {c.effect} · 共鳴: {c.resonance}</div> : null;
                                    })()}
                                </div>
                            ))}
                        </>
                    );
                })()}
            </FormSection>
        </>
    );
}
