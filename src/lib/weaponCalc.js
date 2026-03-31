// =====================================================
// 武器ステータス計算ユーティリティ v2.0
// 武器種×企業マトリクス方式対応
// =====================================================

import { getWeaponSpec, WEAPON_TYPE_STATS, findOption } from '@/data/weaponData';

// ── mod 文字列パーサー（カスタムオプション用） ──

export function parseMod(modStr) {
    const result = { base: 0, conditions: [], effects: [], text: '' };
    if (!modStr || typeof modStr !== 'string') return result;

    const s = modStr.trim();

    // 先頭の数値を抽出
    const leadMatch = s.match(/^([+＋±−\-]?\d+)/);
    if (leadMatch) {
        const raw = leadMatch[1].replace('＋', '+').replace('−', '-');
        result.base = raw.startsWith('±') ? 0 : parseInt(raw, 10) || 0;
    }

    // 括弧内の条件
    const parenMatch = s.match(/[（(](.+?)[）)]/);
    if (parenMatch) {
        const inner = parenMatch[1];
        const condValMatch = inner.match(/(.+?)[+＋](\d+)/);
        if (condValMatch) {
            result.conditions.push({ label: condValMatch[1], value: parseInt(condValMatch[2], 10) });
        } else {
            result.conditions.push({ label: inner, value: 0 });
        }
    }

    // 範囲表記
    const rangeMatch = s.match(/[+＋](\d+)[〜~][+＋](\d+)/);
    if (rangeMatch) {
        result.base = parseInt(rangeMatch[1], 10);
        result.conditions.push({ label: '最大', value: parseInt(rangeMatch[2], 10) });
    }

    // ・区切りの複合効果
    const statPattern = /([A-Za-z\u3000-\u9FFF]+)[+＋](\d+)/g;
    let match;
    const withoutParen = s.replace(/[（(].+?[）)]/g, '');
    const parts = withoutParen.split('・');
    if (parts.length > 1 || (parts.length === 1 && !leadMatch && (match = statPattern.exec(s)))) {
        statPattern.lastIndex = 0;
        while ((match = statPattern.exec(s)) !== null) {
            const stat = match[1];
            const val = parseInt(match[2], 10);
            if (match.index === 0 && leadMatch) continue;
            result.effects.push({ stat, value: val });
        }
    }

    if (!leadMatch && !parenMatch && !rangeMatch && result.effects.length === 0) {
        result.text = s;
    }

    return result;
}

// ── 共鳴効果パーサー ──

export function parseResonance(resStr) {
    if (!resStr || resStr === 'なし') return [];
    const results = [];
    const parts = resStr.split(/[・,]/);
    for (const part of parts) {
        const m = part.trim().match(/(.+?)([+＋−\-])(\d+)/);
        if (m) {
            const sign = (m[2] === '−' || m[2] === '-') ? -1 : 1;
            results.push({ emotion: m[1], value: sign * parseInt(m[3], 10) });
        }
    }
    return results;
}

// ── リスクレベル ──

const RISK_ORDER = { '低': 0, '中': 1, '高': 2, '非常に高': 3 };
const RISK_LABELS = ['低', '中', '高', '非常に高'];

function maxRisk(risks) {
    let max = 0;
    for (const r of risks) {
        const v = RISK_ORDER[r] ?? 0;
        if (v > max) max = v;
    }
    return RISK_LABELS[max];
}

// ── 武器型 → 攻撃能力値 ──

export function getAttackAbility(weaponType) {
    const wt = WEAPON_TYPE_STATS[weaponType];
    return wt ? wt.ability : 'rank_tai';
}

// ── 予想ダメージ計算 ──

const RANK_EXPECTED = { D: 3.50, C: 4.47, B: 5.09, A: 5.49, S: 5.49 };
const RANK_DICE_LABEL = { D: '1d6', C: '2d6', B: '3d6', A: '4d6', S: '4d6+特典' };

export function calcExpectedDamage(rank, totalMod, hasPlus) {
    if (!rank) return null;
    const plusBonus = hasPlus ? 1 : 0;
    const sBonus = rank === 'S' ? 2 : 0;
    const minDmg = 1 + totalMod + plusBonus + sBonus;
    const maxDmg = 3 + totalMod + plusBonus + sBonus;
    const expected = RANK_EXPECTED[rank] || 3.5;
    const avgDmg = Math.max(0, (expected - 3) + totalMod + plusBonus + sBonus);

    return {
        min: Math.max(0, minDmg),
        max: Math.max(0, maxDmg),
        avg: Math.round(avgDmg * 10) / 10,
        dice: RANK_DICE_LABEL[rank] || '1d6',
        rank,
    };
}

// ── メイン集約関数 ──

/**
 * 武器種×企業×装備分類×サブタイプ＋オプション＋ギフトから全ステータスを集約
 */
export function calcWeaponStats({ weaponType, manufacturer, equipmentType, subtype, options = [], gift }) {
    if (!weaponType) return null;

    const spec = getWeaponSpec(weaponType, manufacturer, equipmentType, subtype);
    if (!spec) return null;

    // オプションの集約
    let optionModTotal = 0;
    const allConditions = [];
    const allEffects = [];
    const allResonance = [];
    const risks = [];
    let optionsCp = 0;
    const specialTexts = [...spec.notes];
    const optionDetails = [];

    for (const optName of options) {
        const opt = findOption(optName);
        if (!opt) continue;

        const optMod = parseMod(opt.mod);
        optionModTotal += optMod.base;
        optionsCp += opt.cp;
        allConditions.push(...optMod.conditions);
        allEffects.push(...optMod.effects);
        if (optMod.text) specialTexts.push(`${opt.name}: ${optMod.text}`);
        risks.push(opt.risk);

        const res = parseResonance(opt.resonance);
        allResonance.push(...res);

        optionDetails.push({
            name: opt.name,
            cp: opt.cp,
            mod: optMod.base,
            risk: opt.risk,
        });
    }

    // ギフト「装備の鬼」ボーナス
    const giftBonus = (gift === '装備の鬼' && (equipmentType === '武装型' || equipmentType === '半装身型')) ? 1 : 0;

    const baseMod = spec.mod;
    const totalMod = baseMod + optionModTotal + giftBonus;

    // 共鳴集約
    const resonanceMap = {};
    for (const r of allResonance) {
        resonanceMap[r.emotion] = (resonanceMap[r.emotion] || 0) + r.value;
    }
    const resonanceSummary = Object.entries(resonanceMap)
        .filter(([, v]) => v !== 0)
        .map(([emotion, value]) => ({ emotion, value }));

    // 副次効果集約
    const effectsMap = {};
    for (const e of allEffects) {
        effectsMap[e.stat] = (effectsMap[e.stat] || 0) + e.value;
    }
    const effectsSummary = Object.entries(effectsMap)
        .filter(([, v]) => v !== 0)
        .map(([stat, value]) => ({ stat, value }));

    // リスクレベル
    const riskLevel = risks.length > 0 ? maxRisk(risks) : '低';
    const slotUsed = options.length;
    const slotMax = spec.slot;
    const slotExceeded = slotUsed > slotMax;
    const finalRisk = slotExceeded ? '非常に高' : riskLevel;

    return {
        // 基礎情報
        weaponType,
        subtype: subtype || '',
        manufacturer: manufacturer || '汎用品',
        equipmentType: equipmentType || '武装型',
        reach: spec.reach || '',
        baseCp: spec.cp,
        slotMax,
        slotUsed,
        slotExceeded,

        // 修正値
        baseMod,
        optionMod: optionModTotal,
        giftBonus,
        totalMod,

        // 条件付きボーナス
        conditions: allConditions,

        // 副次効果
        effects: effectsSummary,

        // CP
        totalCp: spec.cp + optionsCp,
        optionsCp,

        // リスク
        riskLevel: finalRisk,

        // 共鳴
        resonance: resonanceSummary,

        // オプション詳細
        optionDetails,

        // 特殊効果テキスト
        specialTexts,
    };
}
