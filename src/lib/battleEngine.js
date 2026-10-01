// =====================================================
// v5.0 討伐フェーズ《核防壁戦》エンジン
// 正本：docs/rules/rules_unified.md 第2章（判定）・第3章（共鳴）・第5章（討伐）・第7章（スタイル）・第12章（怪異）
// 技の効果は docs/rules/data/styles.json の effects を解釈する（文字列マッチはしない）。
//
// 設計：
// - 状態は JSON 直列化できるプレーンオブジェクト。公開関数は入口で複製し、新しい状態を返す（元は変更しない）。
//   内部ヘルパー（log／addResonance／applyDamageToAnomaly など）は渡された作業用コピーをその場で更新する
// - 乱数は各関数の引数 rng（0〜1 を返す関数。既定 Math.random）。テストでは固定列を渡す
// - 判定は「振る → 出目を1つ選ぶ」の2段階。chooseDie() まで state.pending に保留される
// - 失敗した判定は pushThrough()（共鳴+3で達成値4の成功に）か declinePush() で確定する
// =====================================================
import { RULES, TECHNIQUE_BY_ID, LAYER_TRAITS, RESONANCE_METERS, hpBonusAtLevel, EQUIPMENT_CLASSES, STYLE_BY_ID } from '@/data/rulesData';
import { getCharacterTechniques, normalizeStyles } from '@/lib/characterBuild';
import { getAttackAbility, calcWeaponStats } from '@/lib/weaponCalc';

export const V5_PHASE = {
  PLAYER_TURN: 'player_turn',   // メイン／サブ行動を選べる
  PENDING: 'pending',           // 出目の選択待ち
  PUSH: 'push',                 // 失敗した判定の押し通し／受け入れ待ち
  ANOMALY_TURN: 'anomaly_turn', // 怪異の手番（回避判定の保留を含む）
  VICTORY: 'victory',
  DEFEAT: 'defeat',
  RETREAT: 'retreat',
};

export const TARGET_NORMAL = 4;
export const TARGET_HARD = 5;
export const METER_MAX = RULES.resonance.max;
export const METER_KEYS = RESONANCE_METERS.map(m => m.key);
export const METER_NAME = Object.fromEntries(RESONANCE_METERS.map(m => [m.key, m.name]));
const DICE_BY_RANK = Object.fromEntries(RULES.abilities.ranks.map(r => [r.rank, r.diceCount]));
const HP_BONUS_BY_RANK = { D: 0, C: 2, B: 4, A: 6, S: 8 };
const ABILITY_KEYS = RULES.abilities.abilities.map(a => a.key);
const ABILITY_NAME = Object.fromEntries(RULES.abilities.abilities.map(a => [a.key, a.name]));
const WEAPON_MOD_CAP = RULES.equipment.weaponModCap;
const DEFENSE_MOD_CAP = RULES.equipment.defenseModCap;

/** 層特性：ID → 原稿の表（anomaly_grades.json layerTraits）の名称 */
export const TRAIT_IDS = {
  mirror: '鏡面', regen: '再生', pressure: '重圧', infect: '感染', silence: '静寂',
  obsession: '執着', collapse: '崩落', veil: '虚飾', target: '標的', resonate: '共鳴',
};
export function traitInfo(id) {
  const name = TRAIT_IDS[id];
  const row = LAYER_TRAITS.find(t => t.name === name);
  return row ? { id, name, effect: row.effect } : { id, name: id, effect: '' };
}

// ---------- ユーティリティ ----------
const clone = (s) => JSON.parse(JSON.stringify(s));
const parseMod = (v) => { const n = parseInt(String(v ?? '0').replace(/[^\d-]/g, ''), 10); return Number.isFinite(n) ? n : 0; };
const log = (state, type, message, extra = {}) => { state.log.push({ type, message, ...extra }); return state; };
export const rollD6 = (rng) => Math.floor(rng() * 6) + 1;
export const rollDice = (n, rng) => Array.from({ length: Math.max(1, n) }, () => rollD6(rng));
export const isFumbleRoll = (dice) => dice.every(d => d <= 3) && dice.some(d => d === 1);
/** 「成功する中で最も低い目」。なければ最大の目 */
export function suggestDieIndex(dice, target = TARGET_NORMAL, modifier = 0, wantMax = false) {
  if (wantMax) return dice.indexOf(Math.max(...dice));
  let best = -1;
  dice.forEach((d, i) => { if (d + modifier >= target && (best < 0 || d < dice[best])) best = i; });
  return best >= 0 ? best : dice.indexOf(Math.max(...dice));
}

/** ダメージ式（styles.json の effects.damage.formula）を評価する。達成値・武器修正・防御力・メーター値を参照できる */
export function evalFormula(formula, vars) {
  const expr = String(formula)
    .replace(/meter\((\w+)\)/g, (_, m) => String(vars.meters?.[m] ?? 0))
    .replace(/achievement/g, String(vars.achievement ?? 0))
    .replace(/weapon/g, String(vars.weapon ?? 0))
    .replace(/defense/g, String(vars.defense ?? 0));
  if (!/^[\d\s+\-*()]+$/.test(expr)) throw new Error(`不正なダメージ式: ${formula}`);
  // 乗算を先に、次に加減算（左から右）
  const tokens = expr.match(/\d+|[+\-*()]/g) || [];
  const out = []; const ops = [];
  const prec = { '+': 1, '-': 1, '*': 2 };
  const apply = () => { const b = out.pop(), a = out.pop(), op = ops.pop(); out.push(op === '+' ? a + b : op === '-' ? a - b : a * b); };
  for (const t of tokens) {
    if (/\d/.test(t)) out.push(Number(t));
    else if (t === '(') ops.push(t);
    else if (t === ')') { while (ops.length && ops[ops.length - 1] !== '(') apply(); ops.pop(); }
    else { while (ops.length && ops[ops.length - 1] !== '(' && prec[ops[ops.length - 1]] >= prec[t]) apply(); ops.push(t); }
  }
  while (ops.length) apply();
  return out[0] ?? 0;
}

// ---------- プレイヤーの構築 ----------
function cyberBonus(cybernetics) {
  const b = { hp: 0, defense: 0, attack: 0 };
  for (const c of Array.isArray(cybernetics) ? cybernetics : []) {
    const n = c?.name || '';
    if (n.includes('人工心肺')) b.hp += 3;
    if (n.includes('皮下装甲')) b.defense += 1;
    if (n.includes('全身装甲')) b.defense += 2;
    if (n.includes('義腕') && n.includes('戦闘')) b.attack += 2;
    if (n.includes('全身義体')) { b.hp += 5; b.attack += 1; }
  }
  return b;
}
function weaponModOf(character) {
  let mod = 0;
  try {
    const stats = calcWeaponStats({
      weaponType: character.weapon_type, manufacturer: character.equipment_maker || '汎用品',
      equipmentType: character.equipment_type || '武装型', subtype: character.equipment_name || '',
      options: Array.isArray(character.equipment_options) ? character.equipment_options : [], gift: character.gift,
    });
    mod = Number(stats?.totalMod) || 0;
  } catch (_) { mod = 0; }
  if (!mod) {
    const cls = EQUIPMENT_CLASSES.find(c => c.id === character.equipment_type);
    mod = cls ? parseMod(cls.weaponMod) : 1;
  }
  return Math.min(WEAPON_MOD_CAP, mod);
}
export function buildPlayer(character) {
  const ranks = {};
  ABILITY_KEYS.forEach(k => { ranks[k] = DICE_BY_RANK[character[k]] ? character[k] : 'D'; });
  const level = Math.max(1, Number(character.level) || 1);
  const cyber = cyberBonus(character.cybernetics);
  const cls = EQUIPMENT_CLASSES.find(c => c.id === character.equipment_type);
  const defense = Math.min(DEFENSE_MOD_CAP, (cls ? parseMod(cls.defenseMod) : 0)
    + ((character.equipment_options || []).includes('衝撃吸収装甲') ? 1 : 0) + cyber.defense);
  const maxHp = 10 + (HP_BONUS_BY_RANK[ranks.rank_tai] || 0) + hpBonusAtLevel(level)
    + (character.background === '鋼の肉体' ? 2 : 0) + cyber.hp;
  const techniques = getCharacterTechniques(character, { isOfficial: !!character.is_official });
  const passives = techniques.filter(t => t.timing === 'passive');
  return {
    id: character.id || null,
    name: character.character_name || character.name || '討伐者',
    level, isOfficial: !!character.is_official,
    ranks, focus: Array.isArray(character.stage_plus) ? character.stage_plus : [],
    attackKey: getAttackAbility(character.weapon_type) || 'rank_tai',
    weaponMod: weaponModOf(character) + cyber.attack,
    defense, hp: maxHp, maxHp,
    belief: Number.isFinite(Number(character.belief_points)) ? Number(character.belief_points) : 5,
    potions: 2,
    styles: normalizeStyles(character.styles),
    techniques,
    evadeDiceBonus: passives.some(t => t.effects.some(e => e.type === 'dice_bonus' && e.scope === 'evade_check')) ? 1 : 0,
    pierce: passives.some(t => t.effects.some(e => e.type === 'pierce')),
  };
}

// ---------- 怪異の構築 ----------
function buildAnomaly(mission) {
  const a = mission.anomaly || {};
  const layers = (a.layers || []).map((l, i) => ({
    id: l.id || `layer${i + 1}`, name: l.name, hp: l.hp, maxHp: l.hp, defense: l.defense ?? 1,
    trait: l.trait || null, traitDisabled: false, revealed: !!l.revealed, broken: false,
  }));
  return {
    name: a.name || mission.name, grade: a.grade || '', threatType: a.threatType || '',
    threat: a.threat ?? 4, baseThreat: a.threat ?? 4, limitRounds: a.limitRounds ?? 3,
    decodeRequired: !!a.decodeRequired,
    core: { name: a.core?.name || '核', hp: a.core?.hp ?? 12, maxHp: a.core?.hp ?? 12, defense: a.core?.defense ?? 0 },
    layers, keys: Math.min(4, a.keys?.known ?? 0), resolved: false,
    turnPolicy: a.turnPolicy || 'assault', erodeUsed: 0, skipTurn: false, threatMod: 0,
    traitsDisabled: false,
  };
}

// ---------- 初期化とラウンド ----------
export function createBattleStateV5(character, mission, rng = Math.random) {
  const player = buildPlayer(character);
  const anomaly = buildAnomaly(mission);
  let state = {
    rules: 'v5', missionId: mission.id, missionName: mission.name,
    phase: V5_PHASE.PLAYER_TURN, round: 1, maxRounds: anomaly.limitRounds,
    player, anomaly,
    resonance: Object.fromEntries(METER_KEYS.map(k => [k, 0])),
    turn: { mainUsed: false, subUsed: false, stance: false, aimed: false, extraMain: 0, modNext: 0, modRound: 0, diceBonusRound: 0 },
    battle: { decodeMod: 0, barrier: false, uses: {}, roundUses: {}, criticals: [], curse: {} },
    pending: null, push: null,
    totalDamageDealt: 0, totalDamageTaken: 0, log: [],
  };
  state = log(state, 'system', `討伐フェーズ開始 — ${anomaly.name}（${anomaly.grade}${anomaly.threatType ? '・' + anomaly.threatType : ''}）　脅威度${anomaly.threat}　制限${anomaly.limitRounds}ラウンド`);
  state = log(state, 'system', `${player.name}：HP${player.maxHp}　武器修正+${player.weaponMod}　防御修正+${player.defense}　解明鍵 ${anomaly.keys}/4${anomaly.decodeRequired && !anomaly.resolved ? '（未解明：核へのダメージは0）' : ''}`);
  for (const [k, v] of Object.entries(mission.anomaly?.openingResonance || {})) state = addResonance(state, k, v, '戦闘開始時の共鳴');
  return startRoundV5(state, rng);
}

export function startRoundV5(state, rng = Math.random) {
  let s = clone(state);
  s.phase = V5_PHASE.PLAYER_TURN;
  s.turn = { mainUsed: false, subUsed: false, stance: false, aimed: false, extraMain: 0, modNext: 0, modRound: 0, diceBonusRound: 0 };
  s.battle.roundUses = {};
  s = log(s, 'round_start', `──── ラウンド${s.round} / ${s.maxRounds} ────`, { round: s.round });
  // 層特性：再生（ラウンド開始時 +5）
  const top = topLayer(s);
  if (top && top.trait === 'regen' && traitActive(s, top) && top.hp < top.maxHp) {
    top.hp = Math.min(top.maxHp, top.hp + 5);
    s = log(s, 'anomaly', `《${top.name}》の再生——層HP+5（${top.hp}/${top.maxHp}）`);
  }
  // 層防御の一時低下（崩し斬り）は次ラウンド終了まで → ラウンド開始時に残数を減らす
  for (const l of s.anomaly.layers) {
    if (l.defenseDebuffRounds > 0) { l.defenseDebuffRounds -= 1; if (l.defenseDebuffRounds === 0) { l.defense = l.baseDefense ?? l.defense; delete l.baseDefense; } }
  }
  if (s.round === s.maxRounds) s = addResonance(s, 'haste', 1, '制限ラウンド残り1');
  if (s.battle.curse.rage) s = log(s, 'system', '怒りの臨界——このラウンドは最大火力の攻撃しか選べない（最大の出目を選ぶこと）');
  return s;
}

// ---------- 共鳴 ----------
/** 共鳴メーターを増減する（作業用コピーをその場で更新して返す） */
export function addResonance(state, meter, amount, reason = '') {
  if (!METER_KEYS.includes(meter) || !amount) return state;
  let s = state;
  const before = s.resonance[meter];
  s.resonance[meter] = Math.max(0, Math.min(METER_MAX, before + amount));
  const delta = s.resonance[meter] - before;
  if (delta !== 0) s = log(s, 'resonance', `${METER_NAME[meter]} ${delta > 0 ? '+' : ''}${delta}（${s.resonance[meter]}/${METER_MAX}）${reason ? '　' + reason : ''}`, { meter, delta });
  if (s.resonance[meter] >= METER_MAX && !s.battle.criticals.includes(meter)) s.battle.criticals.push(meter);
  return s;
}
export function meterStage(value) { return value >= 10 ? 'critical' : value >= 7 ? 3 : value >= 4 ? 2 : value >= 1 ? 1 : 0; }

// ---------- 層と核 ----------
export const topLayer = (s) => s.anomaly.layers.find(l => !l.broken) || null;
export const traitActive = (s, layer) => !!layer?.trait && !layer.traitDisabled && !s.anomaly.traitsDisabled;
export const coreAttackable = (s) => !topLayer(s);
export function layerDefense(s, layer) {
  return Math.max(0, layer.defense);
}

/** 怪異へのダメージ適用。層→（余剰は次の層へ）→核。戻り値は { state, dealt: [{target, amount}] } */
export function applyDamageToAnomaly(state, amount, opts = {}) {
  let s = state;
  const dealt = [];
  let remaining = Math.max(0, amount);
  let first = true;
  const { ignoreDefense = false, pierceCore = s.player.pierce, directCore = false, allowUnresolved = false, source = '' } = opts;
  const unresolvedBlock = s.anomaly.decodeRequired && !s.anomaly.resolved && !allowUnresolved;
  const hitCore = (dmg, label) => {
    if (dmg <= 0) return;
    if (unresolvedBlock) { s = log(s, 'system', `核へのダメージは未解明のため 0（${label}）`); return; }
    const def = ignoreDefense || opts.ignoreCoreDefense ? 0 : s.anomaly.core.defense;
    const real = Math.max(0, dmg - def);
    s.anomaly.core.hp = Math.max(0, s.anomaly.core.hp - real);
    s.totalDamageDealt += real; dealt.push({ target: 'core', amount: real });
    s = log(s, 'player_attack', `核《${s.anomaly.core.name}》に${real}ダメージ（残${s.anomaly.core.hp}/${s.anomaly.core.maxHp}）${label ? '　' + label : ''}`);
  };
  if (directCore) { hitCore(remaining, source); return finish(s, dealt);
  }
  while (remaining > 0) {
    const layer = topLayer(s);
    // 層がなければ核が対象。層を剥がした余剰は粉砕（pierce）持ちだけが核へ通す
    if (!layer) { if (first || pierceCore || opts.overflowToCore) hitCore(remaining, first ? source : (source || '貫通')); break; }
    first = false;
    const def = ignoreDefense ? 0 : layerDefense(s, layer);
    const real = Math.max(1, remaining - def);               // 層へのダメージは最低1
    const applied = Math.min(real, layer.hp);
    layer.hp -= applied; s.totalDamageDealt += applied; dealt.push({ target: layer.id, amount: applied });
    s = log(s, 'player_attack', `《${layer.name}》に${applied}ダメージ（残${layer.hp}/${layer.maxHp}）${source ? '　' + source : ''}`);
    if (layer.trait === 'infect' && traitActive(s, layer)) s = addResonance(s, 'fear', 1, '層特性：感染');
    if (layer.trait === 'mirror' && traitActive(s, layer)) {
      const back = Math.floor(applied / 2);
      if (back > 0) { s.player.hp = Math.max(0, s.player.hp - back); s.totalDamageTaken += back; s = log(s, 'anomaly', `層特性：鏡面——${back}ダメージが跳ね返る（HP${s.player.hp}/${s.player.maxHp}）`); }
    }
    remaining = real - applied;                              // 余剰は次の層へ
    if (layer.hp <= 0) {
      layer.broken = true; s.battle.layerBrokenThisAction = true;
      s = log(s, 'result', `《${layer.name}》が剥離した！`);
      if (layer.trait === 'collapse' && traitActive(s, layer)) {
        const dmg = Math.max(1, s.anomaly.threat - s.player.defense);
        s.player.hp = Math.max(0, s.player.hp - dmg); s.totalDamageTaken += dmg;
        s = log(s, 'anomaly', `層特性：崩落——${dmg}ダメージ（HP${s.player.hp}/${s.player.maxHp}）`);
      }
      if (!topLayer(s)) s = log(s, 'system', unresolvedBlock ? '核が露出した——だが未解明のままでは傷つけられない' : `核《${s.anomaly.core.name}》が露出した！`);
    } else { remaining = 0; }
  }
  return finish(s, dealt);
}
function finish(s, dealt) {
  if (s.anomaly.core.hp <= 0) { s.phase = V5_PHASE.VICTORY; s = log(s, 'result', `核《${s.anomaly.core.name}》を破壊——討伐成功！`); }
  else if (s.player.hp <= 0) { s.phase = V5_PHASE.DEFEAT; s = log(s, 'result', `${s.player.name}は倒れた——討伐失敗`); }
  return { state: s, dealt };
}

// ---------- 判定（振る） ----------
function diceCountFor(s, abilityKey, { evade = false, decode = false } = {}) {
  let n = DICE_BY_RANK[s.player.ranks[abilityKey]] || 1;
  if (s.player.focus.includes(abilityKey)) n += 1;
  n += s.turn.diceBonusRound || 0;
  if (evade) n += (s.turn.stance ? 1 : 0) + s.player.evadeDiceBonus;
  if (decode && s.battle.curse.sorrow) n -= 1;
  const top = topLayer(s);
  if (top && top.trait === 'pressure' && traitActive(s, top)) n -= 1;
  return Math.max(1, n);
}

function usesLeft(s, tech) {
  if (!tech.uses) return Infinity;
  const list = [].concat(tech.uses);
  let left = Infinity;
  for (const u of list) {
    const used = u.per === 'round' ? (s.battle.roundUses[tech.id] || 0) : (s.battle.uses[tech.id] || 0);
    left = Math.min(left, u.count - used);
  }
  return left;
}
function markUse(s, tech) {
  s.battle.uses[tech.id] = (s.battle.uses[tech.id] || 0) + 1;
  s.battle.roundUses[tech.id] = (s.battle.roundUses[tech.id] || 0) + 1;
}

/** 使える行動の一覧（UI 用） */
export function availableActions(s) {
  if (s.phase !== V5_PHASE.PLAYER_TURN) return { main: [], sub: [], techniques: [] };
  const mainOk = !s.turn.mainUsed || s.turn.extraMain > 0;
  const main = [];
  if (mainOk) {
    main.push({ id: 'attack', label: '攻撃', ability: s.player.attackKey, meter: 'rage' });
    if (!s.battle.curse.rage) {
      main.push({ id: 'magic', label: '魔法行使', ability: 'rank_jutsu', meter: 'thirst' });
      if (s.anomaly.keys < 4) main.push({ id: 'decode', label: '解明', ability: 'rank_shiki', meter: 'sorrow', target: TARGET_HARD });
      if (topLayer(s)?.trait && traitActive(s, topLayer(s))) main.push({ id: 'interfere', label: '干渉', ability: 'rank_han', meter: 'sorrow' });
      main.push({ id: 'cleanse', label: '浄化', ability: 'rank_kon', meter: 'purge', needsMeter: true });
      if (s.anomaly.keys >= 4 && !s.anomaly.resolved) main.push({ id: 'declare', label: '解明完了宣言', ability: 'rank_han', meter: 'sorrow', target: s.anomaly.decodeRequired ? TARGET_HARD : TARGET_NORMAL });
    }
  }
  const sub = [];
  if (!s.turn.subUsed) {
    if (!s.battle.curse.haste) sub.push({ id: 'stance', label: '構え（回避ダイス+1）' }, { id: 'aim', label: '照準（次の手番に狙撃）' });
    if (s.player.potions > 0 && s.player.hp < s.player.maxHp) sub.push({ id: 'potion', label: `回復薬（HP+3・残${s.player.potions}）` });
  }
  const techniques = s.player.techniques.filter(t => t.timing !== 'passive' && t.timing !== 'reaction').map(t => {
    const left = usesLeft(s, t);
    let reason = null;
    if (t.timing === 'main' && !mainOk) reason = 'メイン行動は使用済み';
    else if (t.timing === 'sub' && s.turn.subUsed) reason = 'サブ行動は使用済み';
    else if (left <= 0) reason = '使用回数上限';
    else if (t.requires?.keys && s.anomaly.keys < t.requires.keys) reason = `解明鍵${t.requires.keys}つが必要`;
    else if (t.requires?.previousSub === 'aim' && !s.turn.aimed) reason = '前の手番に「照準」が必要';
    else if (t.cost?.belief && s.player.belief < t.cost.belief) reason = '信念ポイント不足';
    else if (s.battle.curse.rage && !t.effects.some(e => e.type === 'damage')) reason = '怒りの臨界中は攻撃しか選べない';
    return { ...t, usesLeft: left === Infinity ? null : left, disabledReason: reason };
  });
  return { main, sub, techniques };
}

function meterForAbility(s, abilityKey, fallback) { return fallback; }

/** 基本行動（メイン）を開始する。判定が要る行動は pending を作る */
export function beginAction(s0, actionId, opts = {}, rng = Math.random) {
  let s = clone(s0);
  if (s.phase !== V5_PHASE.PLAYER_TURN) return { state: s0, error: 'いまは行動できない' };
  const acts = availableActions(s);
  const act = acts.main.find(a => a.id === actionId) || acts.sub.find(a => a.id === actionId);
  if (!act) return { state: s0, error: 'その行動はいま選べない' };
  // サブ行動（判定なし）
  if (actionId === 'stance') { s.turn.subUsed = true; s.turn.stance = true; return { state: log(s, 'player_sub', '構えを取った——次の回避判定にダイス+1個') }; }
  if (actionId === 'aim') { s.turn.subUsed = true; s.turn.aimed = true; return { state: log(s, 'player_sub', '照準を定めた——次の手番に「狙撃」が使える') }; }
  if (actionId === 'potion') {
    s.turn.subUsed = true; s.player.potions -= 1; s.player.hp = Math.min(s.player.maxHp, s.player.hp + 3);
    return { state: log(s, 'player_sub', `回復薬を使った——HP+3（${s.player.hp}/${s.player.maxHp}）`) };
  }
  if (actionId === 'cleanse' && !METER_KEYS.includes(opts.meter)) return { state: s0, error: '下げるメーターを選ぶ' };
  // メイン行動（判定あり）
  const pending = {
    kind: actionId, ability: act.ability, meter: act.meter, target: act.target || TARGET_NORMAL,
    modifier: Math.min(3, (s.turn.modNext || 0) + (s.turn.modRound || 0) + (actionId === 'decode' ? s.battle.decodeMod : 0)),
    meterChoice: opts.meter || null, techId: null,
  };
  s.turn.modNext = 0;
  return rollPending(s, pending, rng);
}

/** 技を開始する。判定が要る技は pending を作り、要らない技は即時解決する */
export function beginTechnique(s0, techId, opts = {}, rng = Math.random) {
  let s = clone(s0);
  if (s.phase !== V5_PHASE.PLAYER_TURN) return { state: s0, error: 'いまは行動できない' };
  const t = availableActions(s).techniques.find(x => x.id === techId);
  if (!t) return { state: s0, error: 'その技は持っていない' };
  if (t.disabledReason) return { state: s0, error: t.disabledReason };
  if (t.effects.some(e => e.type === 'resonance' && e.meter === 'choice') && !METER_KEYS.includes(opts.meter)) return { state: s0, error: '対象のメーターを選ぶ' };
  if (t.cost?.belief) { s.player.belief -= t.cost.belief; s = log(s, 'player_skill', `信念ポイント−${t.cost.belief}（残${s.player.belief}）`); }
  markUse(s, t);
  if (t.timing === 'main') { if (s.turn.extraMain > 0 && s.turn.mainUsed) s.turn.extraMain -= 1; else s.turn.mainUsed = true; }
  if (t.timing === 'sub') s.turn.subUsed = true;
  if (!t.ability) {
    // 判定なしの技：効果を即時適用
    s = log(s, 'player_skill', `技「${t.name}」`);
    s = applyEffects(s, t, { success: true, achievement: TARGET_NORMAL, special: false, meterChoice: opts.meter });
    s = applyFixedResonance(s, t, null);
    return { state: s };
  }
  const abilityKey = Array.isArray(t.ability) ? pickBestAbility(s, t.ability) : t.ability;
  const meter = t.resonance?.mode === 'roll' ? t.resonance.meter : null;
  const pending = {
    kind: 'technique', techId: t.id, ability: abilityKey, meter, target: TARGET_NORMAL,
    modifier: Math.min(3, (s.turn.modNext || 0) + (s.turn.modRound || 0) + t.effects.filter(e => e.type === 'modifier' && e.scope === 'this_check').reduce((a, e) => a + e.value, 0)),
    meterChoice: opts.meter || null,
    rollTwice: t.effects.some(e => e.type === 'roll_twice'),
  };
  s.turn.modNext = 0;
  return rollPending(s, pending, rng);
}
function pickBestAbility(s, keys) {
  return keys.reduce((best, k) => (DICE_BY_RANK[s.player.ranks[k]] + (s.player.focus.includes(k) ? 1 : 0)) > (DICE_BY_RANK[s.player.ranks[best]] + (s.player.focus.includes(best) ? 1 : 0)) ? k : best, keys[0]);
}

function rollPending(s, pending, rng) {
  const n = diceCountFor(s, pending.ability, { decode: pending.kind === 'decode' });
  let dice = rollDice(n, rng);
  let fumble = isFumbleRoll(dice);
  if (pending.rollTwice) { const d2 = rollDice(n, rng); fumble = fumble && isFumbleRoll(d2); dice = dice.concat(d2); }
  // 恐怖の臨界：次の【魂】判定は自動ファンブル
  if (pending.ability === 'rank_kon' && s.battle.curse.fear) { fumble = true; s.battle.curse.fear = false; s = log(s, 'system', '恐怖の臨界——【魂】判定が自動ファンブルになる'); }
  const label = pending.kind === 'technique' ? `技「${TECHNIQUE_BY_ID[pending.techId].name}」` : ({ attack: '攻撃', magic: '魔法行使', decode: '解明', interfere: '干渉', cleanse: '浄化', declare: '解明完了宣言' })[pending.kind];
  s = log(s, 'roll', `${label}：【${ABILITY_NAME[pending.ability]}】${dice.length}d6 → [${dice.join(', ')}]${pending.modifier ? `　修正+${pending.modifier}` : ''}　目標値${pending.target}`, { dice });
  s.pending = { ...pending, dice, fumble };
  s.phase = V5_PHASE.PENDING;
  if (fumble) return { state: resolveChosen(s, -1, rng) };
  return { state: s };
}

// ---------- 判定（出目を選ぶ） ----------
export function chooseDie(s0, index, rng = Math.random) {
  if (s0.phase !== V5_PHASE.PENDING || !s0.pending) return { state: s0, error: '選ぶ判定がない' };
  const p = s0.pending;
  if (index < 0 || index >= p.dice.length) return { state: s0, error: '出目の指定が不正' };
  if (s0.battle.curse.rage && p.kind === 'attack' && p.dice[index] !== Math.max(...p.dice)) return { state: s0, error: '怒りの臨界——最大の出目を選ばなければならない' };
  return { state: resolveChosen(clone(s0), index, rng) };
}

function resolveChosen(s, index, rng) {
  const p = s.pending;
  const die = index >= 0 ? p.dice[index] : Math.min(...p.dice);
  const special = index >= 0 && die === 6;
  const achievement = die + (p.modifier || 0);
  const success = !p.fumble && achievement >= p.target;
  s.pending = null;
  if (p.fumble) {
    s = log(s, 'result', `ファンブル！（全部3以下で1あり）`);
    s = addResonance(s, 'fear', 2, 'ファンブル');
    s = afterFailure(s, p, true);
    return consumeMain(s, p);
  }
  s = log(s, 'roll', `出目${die}を選択 → 達成値${achievement}${special ? '（スペシャル）' : ''}：${success ? '成功' : '失敗'}`);
  if (success) {
    if (p.meter) s = addResonance(s, p.meter, Math.max(0, die - 3), '判定成功');
    s = applyOutcome(s, p, { achievement, special, die });
    return consumeMain(s, p);
  }
  // 失敗：押し通しの選択へ
  s.push = { ...p, die };
  s.phase = V5_PHASE.PUSH;
  s = log(s, 'system', '失敗——押し通す（対応メーター+3で達成値4の成功）か、受け入れるかを選ぶ');
  return s;
}
function consumeMain(s, p) {
  if (p.kind === 'evade') return finishAnomalyTurn(s);
  if (p.kind === 'technique') {
    const t = TECHNIQUE_BY_ID[p.techId];
    if (t.timing === 'sub') { /* サブ行動の技：既に subUsed */ }
  } else if (s.turn.extraMain > 0 && s.turn.mainUsed) s.turn.extraMain -= 1;
  else s.turn.mainUsed = true;
  if (s.battle.layerBrokenThisAction) {
    delete s.battle.layerBrokenThisAction;
    const t = p.techId ? TECHNIQUE_BY_ID[p.techId] : null;
    if (t && t.effects.some(e => e.type === 'extra_action' && e.condition === 'layer_broken')) { s.turn.extraMain += 1; s = log(s, 'player_skill', `「${t.name}」——層を剥離させたので、続けてもう1回攻撃できる`); }
  }
  if (![V5_PHASE.VICTORY, V5_PHASE.DEFEAT].includes(s.phase)) s.phase = V5_PHASE.PLAYER_TURN;
  return s;
}
function afterFailure(s, p, fumble) {
  if (p.kind === 'evade') {
    const dmg = p.base;
    s.player.hp = Math.max(0, s.player.hp - dmg); s.totalDamageTaken += dmg;
    s = log(s, 'anomaly', `${fumble ? '回避に失敗（ファンブル）' : '回避に失敗'}——${dmg}ダメージ（HP${s.player.hp}/${s.player.maxHp}）`);
    if (dmg > 0) s = addResonance(s, 'fear', 1, 'ダメージを受けた');
    if (s.player.hp <= 0) { s.phase = V5_PHASE.DEFEAT; s = log(s, 'result', `${s.player.name}は倒れた——討伐失敗`); }
  } else if (p.kind === 'magic' && fumble) {
    s = induceAnomaly(s, 'ファンブル', rngFromState());
  } else {
    s = log(s, 'result', `${p.kind === 'technique' ? '技' : '行動'}は失敗に終わった`);
  }
  return s;
}
const rngFromState = () => Math.random;

/** 押し通し：対応メーター+3で達成値4の成功にする */
export function pushThrough(s0, rng = Math.random) {
  if (s0.phase !== V5_PHASE.PUSH || !s0.push) return { state: s0, error: '押し通せる判定がない' };
  let s = clone(s0);
  const p = s.push; s.push = null;
  const meter = p.meter || (p.kind === 'evade' ? 'fear' : 'sorrow');
  s = log(s, 'system', `押し通し！——${METER_NAME[meter]}+3 を支払い、達成値4の成功にする`);
  s = addResonance(s, meter, 3, '押し通し');
  if (p.kind === 'magic') s = induceAnomaly(s, '押し通し', rng);
  s = applyOutcome(s, p, { achievement: TARGET_NORMAL, special: false, die: 4, pushed: true });
  return { state: consumeMain(s, p) };
}
/** 失敗を受け入れる */
export function declinePush(s0) {
  if (s0.phase !== V5_PHASE.PUSH || !s0.push) return { state: s0, error: '確定する判定がない' };
  let s = clone(s0);
  const p = s.push; s.push = null;
  s = afterFailure(s, p, false);
  return { state: consumeMain(s, p) };
}

/** 未来視（リアクション）：保留中の判定を振り直す */
export function rerollPending(s0, rng = Math.random) {
  if (s0.phase !== V5_PHASE.PENDING || !s0.pending) return { state: s0, error: '振り直せる判定がない' };
  const t = s0.player.techniques.find(x => x.timing === 'reaction' && x.effects.some(e => e.type === 'reroll'));
  if (!t) return { state: s0, error: '振り直しの技を持っていない' };
  let s = clone(s0);
  if (usesLeft(s, t) <= 0) return { state: s0, error: `「${t.name}」は使用回数上限` };
  markUse(s, t);
  const n = s.pending.dice.length;
  const dice = rollDice(n, rng);
  s.pending.dice = dice; s.pending.fumble = isFumbleRoll(dice);
  s = log(s, 'player_skill', `「${t.name}」——振り直し → [${dice.join(', ')}]`, { dice });
  if (s.pending.fumble) s = resolveChosen(s, -1, rng);
  return { state: s };
}

// ---------- 判定結果の適用 ----------
function applyOutcome(s, p, r) {
  const keysBonus = Math.min(4, s.anomaly.keys);
  switch (p.kind) {
    case 'attack': {
      const top = topLayer(s);
      const def = top ? layerDefense(s, top) : s.anomaly.core.defense;
      const dmg = r.achievement + s.player.weaponMod + keysBonus - (r.special ? 0 : def) + (r.special ? 1 : 0);
      return applyDamageToAnomaly(s, Math.max(top ? 1 : 0, dmg), { ignoreDefense: true, source: r.special ? 'スペシャル：防御無視+1' : '' }).state;
    }
    case 'magic': {
      const top = topLayer(s);
      const def = top ? layerDefense(s, top) : s.anomaly.core.defense;
      const dmg = r.achievement + s.player.weaponMod + keysBonus - (r.special ? 0 : def) + (r.special ? 1 : 0);
      let s2 = applyDamageToAnomaly(s, Math.max(top ? 1 : 0, dmg), { ignoreDefense: true, source: '魔法' }).state;
      if (r.special) s2 = induceAnomaly(s2, 'スペシャル', rngFromState());
      return s2;
    }
    case 'decode': {
      s.anomaly.keys = Math.min(4, s.anomaly.keys + 1);
      s = log(s, 'result', `解明鍵を1つ得た（${s.anomaly.keys}/4）——この怪異へのダメージ+1、層特性が1つ公開される`);
      return revealOneTrait(s);
    }
    case 'interfere': {
      const top = topLayer(s);
      if (top) { top.traitDisabled = true; s = log(s, 'result', `干渉——《${top.name}》の特性「${traitInfo(top.trait).name}」を次のラウンド終了まで無効化`); }
      return s;
    }
    case 'cleanse': return addResonance(s, p.meterChoice, -2, '浄化');
    case 'declare': {
      s.anomaly.resolved = true; s.anomaly.core.defense = 0;
      s = log(s, 'result', '解明完了宣言！——核の防御力が0になり、防壁層が1つ剥離する');
      const top = topLayer(s);
      if (top) { top.hp = 0; top.broken = true; s = log(s, 'result', `《${top.name}》が剥離した！`); if (!topLayer(s)) s = log(s, 'system', `核《${s.anomaly.core.name}》が露出した！`); }
      return addResonance(s, 'purge', 2, '解明完了宣言');
    }
    case 'evade': {
      const dmg = r.special ? 0 : Math.ceil(p.base / 2);
      if (dmg > 0) { s.player.hp = Math.max(0, s.player.hp - dmg); s.totalDamageTaken += dmg; }
      s = log(s, 'anomaly', r.special ? '回避スペシャル——ダメージ無効' : `回避成功——半減して${dmg}ダメージ（HP${s.player.hp}/${s.player.maxHp}）`);
      if (dmg > 0) s = addResonance(s, 'fear', 1, 'ダメージを受けた');
      if (s.player.hp <= 0) { s.phase = V5_PHASE.DEFEAT; s = log(s, 'result', `${s.player.name}は倒れた——討伐失敗`); }
      return s;
    }
    case 'technique': {
      const t = TECHNIQUE_BY_ID[p.techId];
      s = log(s, 'player_skill', `技「${t.name}」`);
      s = applyEffects(s, t, { success: true, achievement: r.achievement, special: r.special, meterChoice: p.meterChoice });
      return applyFixedResonance(s, t, r);
    }
    default: return s;
  }
}
function revealOneTrait(s) {
  const hidden = s.anomaly.layers.find(l => l.trait && !l.revealed);
  if (hidden) { hidden.revealed = true; s = log(s, 'system', `《${hidden.name}》の特性「${traitInfo(hidden.trait).name}」が判明：${traitInfo(hidden.trait).effect}`); }
  return s;
}
function applyFixedResonance(s, t, r) {
  if (t.resonance?.mode === 'fixed' && t.resonance.meter) return addResonance(s, t.resonance.meter, t.resonance.value, `技「${t.name}」`);
  return s;
}
/** 怪異誘発判定（魔法のスペシャル・押し通し・ファンブル・大術式）：術ランクの閾値で1d6。発生したら脅威度+1 */
function induceAnomaly(s, reason, rng) {
  const rank = s.player.ranks.rank_jutsu;
  const threshold = { D: 4, C: 5, B: 6, A: 7, S: 7 }[rank] || 4;
  const d = rollD6(rng);
  s = log(s, 'system', `怪異誘発判定（${reason}）：1d6 → ${d}（${threshold <= 6 ? threshold + '以上で発生' : '術ランク' + rank + 'は発生しない'}）`);
  if (d >= threshold) { s.anomaly.threat += 1; s = log(s, 'anomaly', `魔法が怪異を生んだ——周辺に微小怪異が湧き、脅威度+1（${s.anomaly.threat}）`); }
  return s;
}

/** styles.json の effects を順に適用する */
function applyEffects(s, t, ctx) {
  const keysBonus = Math.min(4, s.anomaly.keys);
  let ignoreDefense = t.effects.some(e => e.type === 'ignore_defense');
  for (const e of t.effects) {
    switch (e.type) {
      case 'damage': {
        const top = topLayer(s);
        const toCore = e.target === 'core';
        const targetDef = toCore ? s.anomaly.core.defense : (top ? layerDefense(s, top) : s.anomaly.core.defense);
        let dmg;
        if (e.formula) {
          const vars = { achievement: ctx.achievement, weapon: s.player.weaponMod, defense: (ignoreDefense || ctx.special) ? 0 : targetDef, meters: s.resonance };
          dmg = evalFormula(e.formula, vars) + keysBonus + (ctx.special ? 1 : 0);
        } else dmg = (e.value || 0);
        const r = applyDamageToAnomaly(s, Math.max(0, dmg), {
          ignoreDefense: true, directCore: toCore, allowUnresolved: !!e.allowUnresolved,
          ignoreCoreDefense: !!e.ignoreDefense, source: `技「${t.name}」`,
        });
        s = r.state;
        if (t.effects.some(x => x.type === 'stance' && x.condition === 'on_damage') && r.dealt.length) { s.turn.stance = true; s = log(s, 'player_skill', '構えが付いた'); }
        if (t.effects.some(x => x.type === 'threat_mod' && x.condition === 'on_damage') && r.dealt.length) { const tm = t.effects.find(x => x.type === 'threat_mod'); s.anomaly.threatMod += tm.value; s = log(s, 'player_skill', `次の怪異の手番の脅威度${tm.value}`); }
        if (t.effects.some(x => x.type === 'status' && x.stat === 'defense' && x.condition === 'on_damage') && r.dealt.length) {
          const st = t.effects.find(x => x.type === 'status' && x.stat === 'defense');
          const layer = topLayer(s) || s.anomaly.layers.find(l => l.id === r.dealt[0].target);
          if (layer && !layer.broken) { layer.baseDefense = layer.baseDefense ?? layer.defense; layer.defense = Math.max(0, layer.defense + st.value); layer.defenseDebuffRounds = 2; s = log(s, 'player_skill', `《${layer.name}》の防御力${st.value}（次のラウンド終了まで）`); }
        }
        break;
      }
      case 'heal': s.player.hp = Math.min(s.player.maxHp, s.player.hp + e.value); s = log(s, 'player_skill', `HP+${e.value}（${s.player.hp}/${s.player.maxHp}）`); break;
      case 'modifier':
        if (e.scope === 'this_check') break; // 判定前に加算済み
        if (e.scope === 'decode_checks_this_scene') { s.battle.decodeMod = Math.max(s.battle.decodeMod, e.value); s = log(s, 'player_skill', `この戦闘の解明判定に+${e.value}`); }
        else if (e.duration === 'round') { s.turn.modRound += e.value; s = log(s, 'player_skill', `このラウンドの判定に+${e.value}`); }
        else { s.turn.modNext += e.value; s = log(s, 'player_skill', `次の判定に+${e.value}`); }
        break;
      case 'dice_bonus':
        if (e.scope === 'evade_check') break; // パッシブで集計済み
        s.turn.diceBonusRound += e.value; s = log(s, 'player_skill', `このラウンドの判定でダイス+${e.value}個`); break;
      case 'resonance': { const m = e.meter === 'choice' ? ctx.meterChoice : e.meter; s = addResonance(s, m, e.value, `技「${t.name}」`); break; }
      case 'resonance_set':
        if (e.timing === 'round_end') { s.battle.pendingSet = { meter: e.meter, value: e.value }; s = log(s, 'system', `ラウンド終了時に${METER_NAME[e.meter]}が${e.value}になる`); }
        else { s.resonance[e.meter] = e.value; if (e.value >= METER_MAX && !s.battle.criticals.includes(e.meter)) s.battle.criticals.push(e.meter); }
        break;
      case 'reveal': s = revealOneTrait(s); break;
      case 'key_progress': s.anomaly.keys = Math.min(4, s.anomaly.keys + e.value); s = log(s, 'result', `解明鍵を${e.value}つ得た（${s.anomaly.keys}/4）`); s = revealOneTrait(s); break;
      case 'status':
        if (e.stat === 'layer_traits') { s.anomaly.traitsDisabled = true; s = log(s, 'player_skill', 'すべての層特性を無効化した'); }
        else if (e.stat === 'incoming_damage') { s.battle.barrier = true; s = log(s, 'player_skill', '結界——次の怪異の手番のダメージを半減'); }
        else if (e.stat === 'down') { /* ソロでは気絶からの復帰対象がいない */ }
        break;
      case 'stance': if (!e.condition) s.turn.stance = true; break;
      case 'threat_mod': if (!e.condition) s.anomaly.threatMod += e.value; break;
      case 'seal_gauge': s = log(s, 'system', '封印ゲージはこのミッションでは使わない（特級専用）'); break;
      case 'flag':
        if (e.flag === 'force_anomaly_induction') s = induceAnomaly(s, `技「${t.name}」`, rngFromState());
        break;
      case 'roll_twice': case 'ignore_defense': case 'pierce': case 'extra_action': case 'reroll': break; // 判定処理側で扱う
      default: s = log(s, 'system', `技「${t.name}」の効果（${e.type}）はWeb版では演出のみ`);
    }
  }
  return s;
}

// ---------- 手番終了 → 怪異の手番 ----------
export function endPlayerTurn(s0, rng = Math.random) {
  if (s0.phase !== V5_PHASE.PLAYER_TURN) return { state: s0, error: 'いまは手番を終えられない' };
  let s = clone(s0);
  s.phase = V5_PHASE.ANOMALY_TURN;
  const a = s.anomaly;
  if (a.skipTurn) { a.skipTurn = false; s = log(s, 'anomaly', '大浄化の余波——怪異はこの手番を失った'); return { state: finishAnomalyTurn(s) }; }
  const top = topLayer(s);
  const highest = METER_KEYS.reduce((b, k) => s.resonance[k] > s.resonance[b] ? k : b, METER_KEYS[0]);
  let action = 'assault';
  if (top && top.trait === 'target' && traitActive(s, top)) action = 'pierce';
  else if (top && top.trait === 'regen' && traitActive(s, top) && top.hp <= top.maxHp / 2) action = 'regen';
  else if ((top && top.trait === 'resonate' && traitActive(s, top)) || (s.resonance[highest] >= 8 && a.erodeUsed < 2)) action = 'erode';
  else if (s.player.hp <= 3) action = 'pierce';
  if (a.turnPolicy === 'assault_only') action = 'assault';
  const threat = Math.max(1, a.threat + a.threatMod); a.threatMod = 0;
  if (action === 'erode') {
    a.erodeUsed += 1; s = log(s, 'anomaly', `怪異の手番【侵蝕】——${METER_NAME[highest]}が侵される`);
    s = addResonance(s, highest, 2, '侵蝕');
    return { state: finishAnomalyTurn(s) };
  }
  if (action === 'regen') {
    top.hp = Math.min(top.maxHp, top.hp + threat); s = log(s, 'anomaly', `怪異の手番【再生】——《${top.name}》の層HP+${threat}（${top.hp}/${top.maxHp}）`);
    return { state: finishAnomalyTurn(s) };
  }
  let base = action === 'pierce' ? threat * 2 : threat;
  base = Math.max(1, base - s.player.defense);
  if (s.battle.barrier) { base = Math.ceil(base / 2); s.battle.barrier = false; s = log(s, 'player_skill', '結界がダメージを半減する'); }
  s = log(s, 'anomaly', `怪異の手番【${action === 'pierce' ? '貫通' : '襲撃'}】——脅威度${threat}${action === 'pierce' ? '×2' : ''}−防御修正${s.player.defense} → ${base}ダメージ。【疾】で回避判定`);
  const n = diceCountFor(s, 'rank_haya', { evade: true });
  const dice = rollDice(n, rng);
  s = log(s, 'roll', `回避：【疾】${n}d6 → [${dice.join(', ')}]　目標値4（成功で半減・6で無効）`, { dice });
  s.pending = { kind: 'evade', ability: 'rank_haya', meter: 'fear', target: TARGET_NORMAL, modifier: 0, dice, fumble: isFumbleRoll(dice), base };
  s.phase = V5_PHASE.PENDING;
  if (s.pending.fumble) return { state: resolveChosen(s, -1, rng) };
  return { state: s };
}

function finishAnomalyTurn(s) {
  if ([V5_PHASE.VICTORY, V5_PHASE.DEFEAT].includes(s.phase)) return s;
  // ラウンド終了：共鳴の臨界チェック
  if (s.battle.pendingSet) { s.resonance[s.battle.pendingSet.meter] = s.battle.pendingSet.value; if (s.battle.pendingSet.value >= METER_MAX && !s.battle.criticals.includes(s.battle.pendingSet.meter)) s.battle.criticals.push(s.battle.pendingSet.meter); s = log(s, 'system', `${METER_NAME[s.battle.pendingSet.meter]}が${s.battle.pendingSet.value}になった`); delete s.battle.pendingSet; }
  s.battle.curse = {};
  for (const m of s.battle.criticals) s = applyCritical(s, m);
  s.battle.criticals = [];
  for (const l of s.anomaly.layers) l.traitDisabled = false;
  if (s.phase === V5_PHASE.DEFEAT) return s;
  s.round += 1;
  if (s.round > s.maxRounds) {
    s.phase = V5_PHASE.RETREAT;
    s = log(s, 'result', `制限ラウンド超過——怪異は姿を消し、一時的に退いた。核HP${s.anomaly.core.hp}は持ち越し`);
    s = addResonance(s, 'sorrow', 1, '撤退');
    return s;
  }
  return startRoundV5(s, Math.random);
}
function applyCritical(s, meter) {
  s = log(s, 'critical', `【臨界】${METER_NAME[meter]}が10に達した`, { meter });
  switch (meter) {
    case 'fear': s.battle.curse.fear = true; s = log(s, 'critical', '代償：次の【魂】判定が自動ファンブルになる'); break;
    case 'rage': s.battle.curse.rage = true; s = log(s, 'critical', '代償：次の1ラウンド、最大火力の攻撃しか選べない'); break;
    case 'sorrow': s.battle.curse.sorrow = true; s.player.belief = Math.max(0, s.player.belief - 1); s = log(s, 'critical', `代償：信念−1（残${s.player.belief}）、次の解明判定はダイス−1個`); break;
    case 'haste': s.battle.curse.haste = true; s = log(s, 'critical', '代償：次のラウンドは構え・照準を取れない（行動が先に読まれる）'); break;
    case 'thirst': s.battle.curse.thirst = true; s = log(s, 'critical', '代償：次の魔法／異能の共鳴が倍になる'); break;
    case 'purge': {
      s = log(s, 'critical', '大浄化！——全メーター−3、怪異は次の手番を失う');
      METER_KEYS.forEach(k => { if (k !== 'purge') s.resonance[k] = Math.max(0, s.resonance[k] - 3); });
      s.anomaly.skipTurn = true; break;
    }
    default: break;
  }
  s.resonance[meter] = 0;
  return s;
}

// ---------- 結果 ----------
export function getBattleResultV5(state) {
  const result = state.phase === V5_PHASE.VICTORY ? '勝利' : state.phase === V5_PHASE.DEFEAT ? '敗北' : '撤退';
  return {
    result, roundsTaken: Math.min(state.round, state.maxRounds),
    totalDamageDealt: state.totalDamageDealt, totalDamageTaken: state.totalDamageTaken,
    remainingHp: state.player.hp, resonanceSnapshot: { ...state.resonance }, battleLog: state.log,
  };
}
export const isFinishedV5 = (state) => [V5_PHASE.VICTORY, V5_PHASE.DEFEAT, V5_PHASE.RETREAT].includes(state.phase);
export const styleName = (id) => STYLE_BY_ID[id]?.name || id;
