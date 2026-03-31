// =====================================================
// 武器ステータス計算ユーティリティ
// CharacterForm / CharacterDetail の両方で使用
// =====================================================

import { findWeapon, findOption } from '@/data/weaponData';

// ── mod 文字列パーサー ──

/**
 * mod 文字列を解析して構造化データにする
 * '+2'            → { base: 2, conditions: [], effects: [], text: '' }
 * '±0'            → { base: 0, ... }
 * '+3（専用+4）'  → { base: 3, conditions: [{ label: '専用', value: 4 }], ... }
 * 'SPD+1・回避+1' → { base: 0, effects: [{ stat: 'SPD', value: 1 }, { stat: '回避', value: 1 }], ... }
 * '護衛特性無効化' → { base: 0, text: '護衛特性無効化', ... }
 */
export function parseMod(modStr) {
    const result = { base: 0, conditions: [], effects: [], text: '' };
    if (!modStr || typeof modStr !== 'string') return result;

    const s = modStr.trim();

    // 先頭の数値を抽出: +N, -N, ±0, −N
    const leadMatch = s.match(/^([+＋±−\-]?\d+)/);
    if (leadMatch) {
        const raw = leadMatch[1].replace('＋', '+').replace('−', '-');
        result.base = raw.startsWith('±') ? 0 : parseInt(raw, 10) || 0;
    }

    // 括弧内の条件: （...）or (...)
    const parenMatch = s.match(/[（(](.+?)[）)]/);
    if (parenMatch) {
        const inner = parenMatch[1];
        // "専用+4", "素養B以上", "2回攻撃", "vs怪異" etc.
        const condValMatch = inner.match(/(.+?)[+＋](\d+)/);
        if (condValMatch) {
            result.conditions.push({ label: condValMatch[1], value: parseInt(condValMatch[2], 10) });
        } else {
            result.conditions.push({ label: inner, value: 0 });
        }
    }

    // 範囲表記: +3〜+4
    const rangeMatch = s.match(/[+＋](\d+)[〜~][+＋](\d+)/);
    if (rangeMatch) {
        result.base = parseInt(rangeMatch[1], 10);
        result.conditions.push({ label: '最大', value: parseInt(rangeMatch[2], 10) });
    }

    // ・区切りの複合効果: SPD+1・回避+1, 機動力+2（攻撃+1）
    const statPattern = /([A-Za-z\u3000-\u9FFF]+)[+＋](\d+)/g;
    let match;
    // 先頭が数値のみの場合はスキップ（既にbaseで処理済み）
    const withoutParen = s.replace(/[（(].+?[）)]/g, '');
    const parts = withoutParen.split('・');
    if (parts.length > 1 || (parts.length === 1 && !leadMatch && (match = statPattern.exec(s)))) {
        // リセットして再走査
        statPattern.lastIndex = 0;
        while ((match = statPattern.exec(s)) !== null) {
            const stat = match[1];
            const val = parseInt(match[2], 10);
            // 先頭の純数値modは除外（baseとして処理済み）
            if (match.index === 0 && leadMatch) continue;
            result.effects.push({ stat, value: val });
        }
    }

    // どのパターンにも一致しなかった場合はテキストとして保持
    if (!leadMatch && !parenMatch && !rangeMatch && result.effects.length === 0) {
        result.text = s;
    }

    return result;
}

// ── 共鳴効果パーサー ──

/**
 * '渇望+1' や '焦燥+1・渇望+1' や 'なし' をパース
 */
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

// ── 武器型 → 攻撃能力値 マッピング ──

const WEAPON_TYPE_ABILITY = {
    '斬撃型': 'rank_tai',
    '打撃型': 'rank_tai',
    '体術型': 'rank_tai',
    '射撃型': 'rank_haya',
    '魔導型': 'rank_jutsu',
};

export function getAttackAbility(weaponType) {
    return WEAPON_TYPE_ABILITY[weaponType] || 'rank_tai';
}

// ── 予想ダメージ計算 ──

// E[max(N, d6)] の事前計算値
// D=1d6: 3.50, C=2d6best: 4.47, B=3d6best: 5.09, A=4d6best: 5.49
const RANK_EXPECTED = {
    D: 3.50,
    C: 4.47,
    B: 5.09,
    A: 5.49,
    S: 5.49,
};
const RANK_DICE_LABEL = {
    D: '1d6', C: '2d6', B: '3d6', A: '4d6', S: '4d6+特典',
};

/**
 * 予想ダメージレンジを計算
 * ルール: ダメージ = (達成値 - 3) + 武器修正  （達成値4で成功=ダメージ1, 5で2, 6で3+SP）
 * 簡易表示: min（成功時最低）〜 max（SP時最大）
 */
export function calcExpectedDamage(rank, totalMod, hasPlus) {
    if (!rank) return null;
    const plusBonus = hasPlus ? 1 : 0;
    const sBonus = rank === 'S' ? 2 : 0;
    // 成功時: 達成値4 → ダメージ1 + mod
    const minDmg = 1 + totalMod + plusBonus + sBonus;
    // スペシャル時: 達成値6 → ダメージ3 + mod + SP特典(防御0扱い)
    const maxDmg = 3 + totalMod + plusBonus + sBonus;
    // 期待値ベース
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
 * 武器の全ステータスを集約計算
 */
export function calcWeaponStats({ weaponName, equipmentType, options = [], gift, weaponType }) {
    const weapon = findWeapon(weaponName);
    if (!weapon) return null;

    // 基礎武器のmod解析
    const weaponMod = parseMod(weapon.mod);
    const weaponNote = weapon.note || '';

    // オプションの集約
    let optionModTotal = 0;
    const allConditions = [...weaponMod.conditions];
    const allEffects = [...weaponMod.effects];
    const allResonance = [];
    const risks = [];
    let optionsCp = 0;
    const specialTexts = [];
    const optionDetails = [];

    if (weaponMod.text) specialTexts.push(weaponMod.text);
    if (weaponNote) specialTexts.push(weaponNote);

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

    // 合計
    const baseMod = weaponMod.base;
    const totalMod = baseMod + optionModTotal + giftBonus;

    // 共鳴効果の集約（同名の感情を合算）
    const resonanceMap = {};
    for (const r of allResonance) {
        resonanceMap[r.emotion] = (resonanceMap[r.emotion] || 0) + r.value;
    }
    const resonanceSummary = Object.entries(resonanceMap)
        .filter(([, v]) => v !== 0)
        .map(([emotion, value]) => ({ emotion, value }));

    // 副次効果の集約
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
    const slotMax = weapon.slot || 2;
    const slotExceeded = slotUsed > slotMax;
    const finalRisk = slotExceeded ? '非常に高' : riskLevel;

    return {
        // 基礎情報
        weaponName: weapon.name,
        weaponMaker: weapon.maker,
        baseCp: weapon.cp,
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

        // 副次効果（SPD, 防御, 機動力 etc.）
        effects: effectsSummary,

        // CP
        totalCp: weapon.cp + optionsCp,
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
