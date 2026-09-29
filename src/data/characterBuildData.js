// =====================================================
// キャラクター作成 共有データモジュール
// 正本：docs/rules/data/*.json（v5.0）。ここでは Web 表示向けの形（key・色・補足文）に整えるだけで、
// 選択肢や数値のリテラルは持たない。CharacterForm（作成フォーム）・CharacterDetail（詳細）・
// /quickstart/（ガイド）が同じ定義を参照する。
// ※ スキル枠（SKILL_SLOTS_BY_LEVEL）は v4.0 の名残で、スタイル段位（STYLE_GRADES_BY_LEVEL）へ移行中。
// =====================================================
import { RULES, STYLE_GRADES_BY_LEVEL, MAX_LEVEL as RULES_MAX_LEVEL } from './rulesData';

const { abilities: A, characterOptions: C, equipment: EQ, levelTable: LV } = RULES;

// ── ランクとダイス ──
export const RANKS = A.ranks.map(r => r.rank);
export const RANK_VALUE = Object.fromEntries(A.ranks.map((r, i) => [r.rank, i]));
export const RANK_DICE = Object.fromEntries(A.ranks.map(r => [r.rank, r.dice]));
export const RANK_LABEL = Object.fromEntries(A.ranks.map(r => [r.rank, r.label]));
export const RANK_COLOR = { S: '#ff4444', A: '#ffcc00', B: '#d4af37', C: '#88aacc', D: '#8a8a9a' };

// ── 七つの能力値 ──（use はフォーム用の補足文。正本の「主な用途」は desc に入る）
const ABILITY_USE_HINT = {
    rank_tai: '近接攻撃、耐久判定、重装備の運用、援護',
    rank_haya: '回避、先制、逃走、射撃の命中',
    rank_shiki: '調査、データベース検索、ハッキング、魔法言語の読解',
    rank_han: '解明判定、怪異のルール推測、NPC交渉、状況分析',
    rank_shiya: '気配の察知、罠の発見、嘘の看破、周囲の異変',
    rank_jutsu: '魔法言語による詠唱、魔導具の起動、魔法的な干渉',
    rank_kon: '恐怖への抵抗、浄化、封印処理',
};
export const ABILITIES = A.abilities.map(a => ({ key: a.key, name: a.name, reading: a.reading, desc: a.use, use: ABILITY_USE_HINT[a.key] || a.use }));
export const ABILITY_BY_KEY = Object.fromEntries(ABILITIES.map(a => [a.key, a]));
export const abilityName = (key) => ABILITY_BY_KEY[key]?.name || key;

// ── 所属 ──
export const AFFILIATIONS = C.affiliations.map(a => a.id);
export const AFFILIATION_INFO = Object.fromEntries(C.affiliations.map(a => [a.id, { en: a.en, assignmentLabel: a.assignmentLabel, bonus: a.bonus, constraint: a.constraint, tagline: a.tagline }]));

// ── 背景（6種）— 2能力値がC昇格 ──
export const BACKGROUNDS = C.backgrounds.map(b => ({ id: b.id, upgrades: b.upgradeKeys, desc: b.effect }));
export const BACKGROUND_BY_ID = Object.fromEntries(BACKGROUNDS.map(b => [b.id, b]));

// ── 配属（所属に連動）— 1能力値がB昇格 ──
export const ASSIGNMENTS = Object.fromEntries(AFFILIATIONS.map(aff => [aff, C.assignments.filter(x => x.affiliation === aff).map(x => ({ id: x.id, upgrade: x.upgradeKey, desc: x.desc }))]));
export const findAssignment = (affiliation, id) => (ASSIGNMENTS[affiliation] || []).find(a => a.id === id) || null;
export const assignmentLabel = (affiliation) => AFFILIATION_INFO[affiliation]?.assignmentLabel || '配属';

// ── 覚醒パターン ──
export const AWAKENINGS = C.awakenings.map(a => ({ id: a.id, desc: a.desc, effect: a.bonus }));
export const AWAKENING_IDS = AWAKENINGS.map(a => a.id);
export const INNATE_AWAKENING = C.innateAwakening.id;
export const INNATE_CHOICES = C.innateAwakening.choices;
export const DEFAULT_INNATE_CHOICE = C.innateAwakening.default;

// ── 初期ギフト ──
export const GIFTS = RULES.gifts.initial.map(g => ({ id: g.id, desc: g.effect }));

// ── 魔法言語 ──（P は基礎言語で得意／苦手の選択対象外。hex は表示色）
const LANGUAGE_HEX = { Igniscript: '#ff4444', 'Lupis Surf': '#4488ff', Ivyo: '#44cc44', NGT: '#ffcc00', Monyx: '#aaaaaa', 'P:': '#aa44ff', "P'": '#ff88cc' };
export const LANGUAGES = C.languages.filter(l => l.id !== 'P').map(l => ({ id: l.id, color: l.color, desc: l.texture, hex: LANGUAGE_HEX[l.id] || '#aaaaaa' }));
export const LANGUAGE_MAX = C.languageMax;

// ── 各種初期値・上限 ──
export const STAGE_PLUS_MAX = C.focus.initial;   // 専心（旧 +段階）を付与できる能力値の数
export const BASE_BELIEF_POINTS = LV.beliefCap[0].cap;   // 信念ポイント初期値
export const BASE_CP_BUDGET = LV.levels[0].cp;          // Lv1 装備CP予算
export const MAX_LEVEL = RULES_MAX_LEVEL;

// v4.0 のレベル別スキルスロット数（3レベルに1個のペース）。スタイル移行が終わるまで残す
export const SKILL_SLOTS_BY_LEVEL = [0, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7];
// v5.0 のレベル別「使える技の数」（主／副／第三スタイルの段位合計）
export { STYLE_GRADES_BY_LEVEL };

// サイバネティクス等級の必要レベル
export const CYBER_GRADE_MIN_LEVEL = Object.fromEntries(EQ.cybernetics.grades.map(g => [g.grade, g.unlockLv]));

// ── ステップ定義（フォームとクイックスタートで共有する見出し） ──
// 「この選択で決まること」を1行で説明する
export const GAME_DATA_STEPS = [
    { no: 1, key: 'background',  title: '背景',           en: 'BACKGROUND',  effect: '2つの能力値が D→C に昇格し、背景スキルを自動取得する', required: true },
    { no: 2, key: 'assignment',  title: '配属',           en: 'ASSIGNMENT',  effect: '所属の中での役割。1つの能力値が →B に昇格し、配属スキルが解放される', required: true },
    { no: 3, key: 'abilities',   title: '能力値の確認',   en: 'ABILITIES',   effect: 'ここまでの選択で決まったランクを確認し、+段階を2つ選ぶ。先天覚醒型は術か魂を選ぶ' },
    { no: 4, key: 'styles',      title: 'スタイル',       en: 'STYLES',      effect: '戦い方。主スタイルを1つ選ぶ（副はLv3、第三はLv13で解禁）。段位はレベルで上がり、使える技が増える', required: true },
    { no: 5, key: 'gift',        title: '初期ギフト',     en: 'GIFT',        effect: '1つ選ぶ。特定の場面で使える切り札' },
    { no: 6, key: 'languages',   title: '魔法言語',       en: 'LANGUAGES',   effect: '得意（術判定+1）と苦手（-1）を同じ数だけ選ぶ（0〜3個ずつ）' },
    { no: 7, key: 'armament',    title: '装備',           en: 'ARMAMENT',    effect: '戦闘流派→ベース武器→形態→出自の順に選ぶと武器スペックが自動で決まる', required: true },
    { no: 8, key: 'cybernetics', title: 'サイバネティクス', en: 'CYBERNETICS', effect: '任意。等級が上がるほど強力だが、一度施術すると外せない' },
];

// ── RPシートの項目定義（フォームとクイックスタートで共有） ──
export const RP_SHEET_STEPS = [
    { no: 1, title: '名前と立場',       en: 'IDENTITY', desc: 'キャラ名・二つ名・年齢・性別と、所属（祓部／傭兵／無所属）、討伐者になった経緯（覚醒パターン）。所属は世界の中での立ち位置を決める' },
    { no: 2, title: '見た目・性格・口調', en: 'PROFILE',  desc: '外見の特徴、気質、一人称と話し方。セッションで他のプレイヤーが最初に見る情報' },
    { no: 3, title: '来歴と因縁',       en: 'STORY',    desc: '250字の簡略来歴と、なぜ怪異と戦うのか。動機が1つあればキャラクターは動き出す' },
    { no: 4, title: '二次創作ガイドライン', en: 'FANART', desc: 'ファンアートで許可する表現。あとから変えられる' },
    { no: 5, title: '出力して共有',     en: 'EXPORT',   desc: 'RPシート・名刺カード・IDカードをPNGで保存、またはテキストをコピーしてDiscord等に貼る' },
];
