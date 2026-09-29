// =====================================================
// ルールデータの正本（docs/rules/data/*.json）を Web 実装向けに読み込む入口。
// ルールの数値・選択肢・技・ギフト・等級・レベル表はここ経由で参照し、
// 各モジュールにリテラルを持たない（CLAUDE.md 編集の鉄則7）。
// =====================================================
import abilities from '../../docs/rules/data/abilities.json';
import resonance from '../../docs/rules/data/resonance.json';
import anomalyGrades from '../../docs/rules/data/anomaly_grades.json';
import characterOptions from '../../docs/rules/data/character_options.json';
import styles from '../../docs/rules/data/styles.json';
import gifts from '../../docs/rules/data/gifts.json';
import equipment from '../../docs/rules/data/equipment.json';
import levelTable from '../../docs/rules/data/level_table.json';

export const RULES = { abilities, resonance, anomalyGrades, characterOptions, styles, gifts, equipment, levelTable };

// ── スタイルと技 ──
export const STYLES = styles.styles;
export const STYLE_BY_ID = Object.fromEntries(STYLES.map(s => [s.id, s]));
export const TECHNIQUES = styles.techniques;
export const TECHNIQUE_BY_ID = Object.fromEntries(TECHNIQUES.map(t => [t.id, t]));
export const STYLE_GRADE_UNLOCK = styles.gradeUnlock;
export const STYLE_SLOTS = ['main', 'sub', 'third'];
export const STYLE_SLOT_LABEL = { main: '主', sub: '副', third: '第三' };
export const GRADE_LABEL = { 1: 'I', 2: 'II', 3: 'III' };
export const TIMING_LABEL = { main: 'メイン', sub: 'サブ', passive: 'パッシブ', reaction: 'リアクション' };

/** レベル別のスタイル段位 { main, sub, third }（0 = 未解禁）。「極」は main の grade 3 に kiwami フラグ */
export function styleGradesAtLevel(level) {
    const lv = Number(level) || 1;
    const out = { main: 0, sub: 0, third: 0, kiwami: false };
    for (const u of STYLE_GRADE_UNLOCK) {
        if (u.lv > lv) continue;
        if (u.grade === '極') out.kiwami = true;
        else out[u.slot] = Math.max(out[u.slot], u.grade);
    }
    return out;
}
/** Lv0〜MAX の「使える技の合計数」（旧 SKILL_SLOTS_BY_LEVEL の後継） */
export const STYLE_GRADES_BY_LEVEL = Array.from({ length: levelTable.maxLevel + 1 }, (_, lv) => {
    const g = styleGradesAtLevel(lv || 1);
    return lv === 0 ? 0 : g.main + g.sub + g.third;
});
/** スタイルIDと段位から技を引く */
export function techniquesOf(styleId, maxGrade) {
    return TECHNIQUES.filter(t => t.style === styleId && t.grade <= (maxGrade ?? 3)).sort((a, b) => a.grade - b.grade);
}

// ── 共鳴 ──
export const RESONANCE_METERS = resonance.meters;
export const RESONANCE_MAX = resonance.max;
export const RESONANCE_STAGES = resonance.stages;

// ── ギフト ──
export const INITIAL_GIFTS = gifts.initial;
export const AWAKENING_GIFTS = gifts.awakening;

// ── 怪異 ──
export const ANOMALY_GRADES = anomalyGrades.grades;
export const LAYER_TRAITS = anomalyGrades.layerTraits;

// ── レベル ──
export const LEVELS = levelTable.levels;
export const MAX_LEVEL = levelTable.maxLevel;
export const BELIEF_CAP = levelTable.beliefCap;
export function hpBonusAtLevel(level) {
    const lv = Math.min(Math.max(Number(level) || 1, 1), MAX_LEVEL);
    return LEVELS[lv - 1].hpBonus;
}
export function cpBudgetAtLevel(level) {
    const lv = Math.min(Math.max(Number(level) || 1, 1), MAX_LEVEL);
    return LEVELS[lv - 1].cp;
}

// ── 装備 ──
export const EQUIPMENT_CLASSES = equipment.classes;
export const EQUIPMENT_OPTIONS = equipment.options;
export const MAKERS = equipment.makers;
export const CYBERNETICS = equipment.cybernetics;
