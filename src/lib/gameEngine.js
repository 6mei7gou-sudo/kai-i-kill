// 戦闘ステートマシン — KAI-I//KILL シミュレーション型ゲームエンジン v2
// 装備・クラス・背景・サイバネティクス・回復・状態異常を反映

import { rollDicePool, resolveCheck, calculateDamage, calculateHP, rollInitiative, RANK_TO_HP_BONUS } from './dice';

// 戦闘フェーズ
const PHASE = {
  INIT: 'init',
  PLAYER_TURN: 'player_turn',
  ENEMY_TURN: 'enemy_turn',
  ROUND_END: 'round_end',
  VICTORY: 'victory',
  DEFEAT: 'defeat',
  TIMEOUT: 'timeout',
};

// ===== 装備・クラス・背景のボーナス計算 =====

// 装備種別 → 武器修正
const EQUIPMENT_MOD = {
  '武装型': 1,
  '独立型': 1,
  '半装身型': 2,
  '全装身型': 3,
  '搭乗型': 2,
  '戦闘用搭乗型': 5,
};

// クラスボーナスを計算
function getClassBonus(className) {
  switch (className) {
    case '祓士':    return { coreAttackMod: 2, label: '祓士: 核攻撃+2' };
    case '機甲士':  return { guardianDamageMod: 2, label: '機甲士: 護衛ダメージ+2' };
    case '魂使い':  return { magicMultiplier: 1.5, label: '魂使い: 魔法ダメージ×1.5' };
    case '解明師':  return { extraRounds: 1, label: '解明師: ラウンド+1' };
    case '情報屋':  return { firstStrike: true, label: '情報屋: 初回確定先攻' };
    default:        return {};
  }
}

// 背景ボーナスを計算
function getBackgroundBonus(bg) {
  switch (bg) {
    case '鋼の肉体':       return { hpBonus: 2, firstAttackMod: 1, label: '鋼の肉体: HP+2, 初回攻撃+1' };
    case '学者肌':         return { coreDefIgnore: 1, label: '学者肌: 核防御1無視' };
    case '霊媒体質':       return { resonanceBonus: true, label: '霊媒体質: 共鳴効果拡大' };
    case '技術畑':         return { weaponModBonus: 1, label: '技術畑: 装備修正+1' };
    case 'ストリート上がり': return { evadeMod: 1, label: 'ストリート: 回避+1' };
    case '信仰者':         return { healBonus: 1, label: '信仰者: 回復+1' };
    default:               return {};
  }
}

// サイバネティクスのボーナスを解析
function getCyberBonus(cybernetics) {
  if (!Array.isArray(cybernetics)) return {};
  const bonus = { hpBonus: 0, defenseMod: 0, attackMod: 0, label: [] };
  for (const c of cybernetics) {
    if (!c.name) continue;
    // 主なサイバネティクスの効果を解析
    if (c.name.includes('人工心肺'))      { bonus.hpBonus += 3; bonus.label.push('HP+3'); }
    if (c.name.includes('皮下装甲'))      { bonus.defenseMod += 1; bonus.label.push('防御+1'); }
    if (c.name.includes('全身装甲'))      { bonus.defenseMod += 2; bonus.label.push('防御+2'); }
    if (c.name.includes('義腕') && c.name.includes('戦闘')) { bonus.attackMod += 2; bonus.label.push('攻撃+2'); }
    if (c.name.includes('義腕') && c.name.includes('精密')) { bonus.attackMod += 1; bonus.label.push('命中+1'); }
    if (c.name.includes('神経加速'))      { bonus.initBonus = 1; bonus.label.push('先手+1'); }
    if (c.name.includes('跳躍ブースター')) { bonus.evadeBonus = 1; bonus.label.push('回避+1'); }
    if (c.name.includes('全身義体'))      { bonus.hpBonus += 5; bonus.attackMod += 1; bonus.label.push('HP+5,攻撃+1'); }
    if (c.name.includes('四肢全交換'))    { bonus.attackMod += 3; bonus.label.push('攻撃+3'); }
  }
  return bonus;
}

// 敵AIの行動選択
function selectEnemyAction(enemy, state) {
  // HPが低い敵はより攻撃的に
  const desperate = enemy.hp <= enemy.maxHp * 0.3;
  switch (enemy.ai) {
    case 'aggressive':
      return { type: 'attack', target: 'player' };
    case 'defensive':
      if (desperate || state.enemies.filter(e => e.hp > 0).length <= 1) {
        return { type: 'attack', target: 'player' };
      }
      return { type: 'defend' };
    case 'support':
      return { type: 'guard', target: 'core' };
    default:
      return { type: 'attack', target: 'player' };
  }
}

// ===== 初期状態を生成 =====
export function createBattleState(character, mission) {
  const classBonus = getClassBonus(character.class);
  const bgBonus = getBackgroundBonus(character.background);
  const cyberBonus = getCyberBonus(character.cybernetics);
  const weaponMod = (EQUIPMENT_MOD[character.equipment_type] || 0)
    + (bgBonus.weaponModBonus || 0)
    + (cyberBonus.attackMod || 0);

  // HP計算: 基本 + 背景 + サイバネティクス
  const baseHP = calculateHP(character.rank_tai);
  const totalHP = baseHP + (bgBonus.hpBonus || 0) + (cyberBonus.hpBonus || 0);

  // ラウンド制限: 解明師は+1
  const maxRounds = mission.battle.max_rounds + (classBonus.extraRounds || 0);

  // 信念ポイント（回復用）
  const beliefPoints = character.belief_points || 5;

  const enemies = mission.battle.guardians.map(g => ({
    ...g,
    maxHp: g.hp,
    alive: true,
  }));

  const core = {
    ...mission.battle.core,
    maxHp: mission.battle.core.hp,
    exposed: false,
  };

  // ボーナスログ生成
  const bonusLog = [];
  if (weaponMod > 0) bonusLog.push(`装備修正: +${weaponMod}`);
  if (classBonus.label) bonusLog.push(classBonus.label);
  if (bgBonus.label) bonusLog.push(bgBonus.label);
  if (cyberBonus.label.length > 0) bonusLog.push(`サイバネ: ${cyberBonus.label.join(', ')}`);

  return {
    phase: PHASE.INIT,
    round: 1,
    maxRounds,
    player: {
      name: character.character_name,
      hp: totalHP,
      maxHp: totalHP,
      rank_tai: character.rank_tai,
      rank_haya: character.rank_haya,
      rank_shiki: character.rank_shiki,
      rank_han: character.rank_han,
      rank_shiya: character.rank_shiya,
      rank_jutsu: character.rank_jutsu,
      rank_kon: character.rank_kon,
      class: character.class,
      background: character.background,
      equipment_type: character.equipment_type,
      weaponMod,
      classBonus,
      bgBonus,
      cyberBonus,
      beliefPoints,
      maxHealUses: 2,
      healUsesLeft: 2,
      defense: cyberBonus.defenseMod || 0,
      firstAttackDone: false,
    },
    enemies,
    core,
    log: bonusLog.length > 0
      ? [{ type: 'system', message: `戦闘ボーナス: ${bonusLog.join(' / ')}` }]
      : [],
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    resonance: {
      fear: 0, rage: 0, sorrow: 0, haste: 0, thirst: 0, purge: 0,
    },
  };
}

// ===== ラウンド開始 =====
export function startRound(state) {
  const playerInit = rollInitiative(state.player.rank_haya);
  const logs = [{
    type: 'round_start',
    round: state.round,
    playerInitiative: playerInit,
    message: `──── ラウンド${state.round} / ${state.maxRounds} ────`,
  }];

  // 最終ラウンド警告 → 焦燥+1
  if (state.round === state.maxRounds) {
    logs.push({ type: 'system', message: '⚠ 最終ラウンド — 焦燥+1' });
  }

  const aliveGuardians = state.enemies.filter(e => e.hp > 0);
  const exposed = aliveGuardians.length === 0;

  let newState = {
    ...state,
    phase: PHASE.PLAYER_TURN,
    core: { ...state.core, exposed },
    log: [...state.log, ...logs],
  };

  if (state.round === state.maxRounds) {
    newState = addResonance(newState, 'haste', 1);
  }

  return newState;
}

// ===== プレイヤー攻撃 =====
export function playerAttack(state, targetId) {
  let target;
  let isCore = false;

  if (targetId === 'core' && state.core.exposed) {
    target = state.core;
    isCore = true;
  } else {
    target = state.enemies.find(e => e.id === targetId && e.hp > 0);
  }

  if (!target) {
    return { state, result: { success: false, message: '対象が見つからない' } };
  }

  // 修正値計算
  let attackMod = state.player.weaponMod;

  // 鋼の肉体: 初回攻撃+1
  if (!state.player.firstAttackDone && state.player.bgBonus.firstAttackMod) {
    attackMod += state.player.bgBonus.firstAttackMod;
  }

  // 祓士: 核攻撃+2
  if (isCore && state.player.classBonus.coreAttackMod) {
    attackMod += state.player.classBonus.coreAttackMod;
  }

  // 機甲士: 護衛ダメージ+2
  const guardianDmgBonus = (!isCore && state.player.classBonus.guardianDamageMod) || 0;

  // 学者肌: 核防御1無視
  const defIgnore = isCore ? (state.player.bgBonus.coreDefIgnore || 0) : 0;
  const effectiveDefense = Math.max((target.defense || 0) - defIgnore, 0);

  const check = resolveCheck(state.player.rank_shiki, attackMod, effectiveDefense + 4);
  let damage = 0;
  let message = '';

  if (check.isFumble) {
    message = `ファンブル！ ${state.player.name}の攻撃は大きく外れた`;
    state = addResonance(state, 'haste', 1);
  } else if (check.success) {
    damage = calculateDamage(check.maxDie, guardianDmgBonus, effectiveDefense);
    if (check.isSpecial) {
      damage = Math.floor(damage * 1.5);
      state = addResonance(state, 'purge', 1);
      message = `スペシャル！ ${state.player.name}の攻撃が${target.name}に${damage}ダメージ！`;
    } else {
      message = `${state.player.name}の攻撃が${target.name}に${damage}ダメージ`;
    }
    state = addResonance(state, 'rage', 1);
  } else {
    message = `${state.player.name}の攻撃は${target.name}に避けられた`;
  }

  let newState = {
    ...state,
    player: { ...state.player, firstAttackDone: true },
  };

  if (damage > 0) {
    newState = applyDamageToTarget(newState, targetId, isCore, damage);
  }

  const log = { type: 'player_attack', target: target.name, check, damage, message };
  newState = { ...newState, phase: PHASE.ENEMY_TURN, log: [...newState.log, log] };

  if (isCore && newState.core.hp <= 0) {
    newState = { ...newState, phase: PHASE.VICTORY };
    newState.log = [...newState.log, { type: 'result', message: '核を破壊した！ 討伐成功！' }];
  }

  return { state: newState, result: { success: check.success, damage, check, message } };
}

// ===== プレイヤー魔法攻撃 =====
export function playerMagic(state, targetId) {
  let target;
  let isCore = false;

  if (targetId === 'core' && state.core.exposed) {
    target = state.core;
    isCore = true;
  } else {
    target = state.enemies.find(e => e.id === targetId && e.hp > 0);
  }

  if (!target) {
    return { state, result: { success: false, message: '対象が見つからない' } };
  }

  let magicMod = 0;
  if (isCore && state.player.classBonus.coreAttackMod) {
    magicMod += state.player.classBonus.coreAttackMod;
  }

  const defIgnore = isCore ? (state.player.bgBonus.coreDefIgnore || 0) : 0;
  const effectiveDefense = Math.max((target.defense || 0) - defIgnore, 0);

  const check = resolveCheck(state.player.rank_jutsu, magicMod, effectiveDefense + 3);
  let damage = 0;
  let message = '';

  if (check.isFumble) {
    message = `ファンブル！ 魔法が暴走した — 自傷2ダメージ`;
    const selfDmg = 2;
    state = {
      ...state,
      player: { ...state.player, hp: Math.max(state.player.hp - selfDmg, 0) },
      totalDamageTaken: state.totalDamageTaken + selfDmg,
    };
    state = addResonance(state, 'fear', 1);
  } else if (check.success) {
    damage = calculateDamage(check.maxDie, 1, effectiveDefense);
    // 魂使い: 魔法ダメージ倍率
    const mult = state.player.classBonus.magicMultiplier || 1;
    damage = Math.floor(damage * mult);
    if (check.isSpecial) {
      damage = Math.floor(damage * 1.5);
      state = addResonance(state, 'purge', 1);
      message = `スペシャル！ 魔法が${target.name}に${damage}ダメージ！`;
    } else {
      message = `魔法が${target.name}に${damage}ダメージ`;
    }
    state = addResonance(state, 'thirst', 1);
  } else {
    message = `魔法は${target.name}に効かなかった`;
  }

  let newState = { ...state };
  if (damage > 0) {
    newState = applyDamageToTarget(newState, targetId, isCore, damage);
  }

  const log = { type: 'player_magic', target: target.name, check, damage, message };
  newState = { ...newState, phase: PHASE.ENEMY_TURN, log: [...newState.log, log] };

  if (isCore && newState.core.hp <= 0) {
    newState = { ...newState, phase: PHASE.VICTORY };
    newState.log = [...newState.log, { type: 'result', message: '核を破壊した！ 討伐成功！' }];
  }

  return { state: newState, result: { success: check.success, damage, check, message } };
}

// ===== プレイヤー回避 =====
export function playerEvade(state) {
  const evadeBonus = 2 + (state.player.bgBonus.evadeMod || 0) + (state.player.cyberBonus.evadeBonus || 0);
  const log = {
    type: 'player_evade',
    message: `${state.player.name}は回避態勢をとった（回避+${evadeBonus}）`,
  };
  return {
    state: {
      ...state,
      phase: PHASE.ENEMY_TURN,
      log: [...state.log, log],
      _evadeBonus: evadeBonus,
    },
  };
}

// ===== プレイヤー回復（信念消費） =====
export function playerHeal(state) {
  if (state.player.beliefPoints <= 0) {
    return { state, result: { success: false, message: '信念ポイントが足りない' } };
  }
  if (state.player.healUsesLeft <= 0) {
    return { state, result: { success: false, message: '回復回数の上限に達した' } };
  }

  const healAmount = 3 + (state.player.bgBonus.healBonus || 0);
  const newHp = Math.min(state.player.hp + healAmount, state.player.maxHp);
  const actualHeal = newHp - state.player.hp;

  const log = {
    type: 'player_heal',
    message: `信念を燃やしてHP${actualHeal}回復（残信念: ${state.player.beliefPoints - 1}）`,
  };

  const newState = {
    ...state,
    phase: PHASE.ENEMY_TURN,
    player: {
      ...state.player,
      hp: newHp,
      beliefPoints: state.player.beliefPoints - 1,
      healUsesLeft: state.player.healUsesLeft - 1,
    },
    log: [...state.log, log],
  };

  return { state: newState, result: { success: true, message: log.message } };
}

// ===== 敵ターン処理 =====
export function processEnemyTurn(state) {
  let newState = { ...state };
  const evadeBonus = state._evadeBonus || 0;
  const playerDef = newState.player.defense || 0;

  for (const enemy of newState.enemies) {
    if (enemy.hp <= 0) continue;

    const action = selectEnemyAction(enemy, newState);

    if (action.type === 'attack') {
      // 敵は1〜2個のダイスを振る（強敵は2d6）
      const enemyDice = enemy.attack >= 4 ? 2 : 1;
      const rolls = [];
      for (let i = 0; i < enemyDice; i++) rolls.push(Math.floor(Math.random() * 6) + 1);
      const attackRoll = Math.max(...rolls) + enemy.attack;

      const playerDefenseRoll = resolveCheck(newState.player.rank_haya, evadeBonus, attackRoll);

      if (playerDefenseRoll.success) {
        const log = { type: 'enemy_attack_miss', enemy: enemy.name, message: `${enemy.name}の攻撃を回避した` };
        newState = { ...newState, log: [...newState.log, log] };
      } else {
        // ダメージ = 敵攻撃力 - プレイヤー防御（サイバネ）
        const rawDamage = Math.max(enemy.attack + 1 - playerDef, 1);
        // 回避専念時はダメージ半減
        const damage = evadeBonus > 0 ? Math.max(Math.ceil(rawDamage / 2), 1) : rawDamage;
        const newHp = Math.max(newState.player.hp - damage, 0);
        const log = {
          type: 'enemy_attack_hit',
          enemy: enemy.name,
          damage,
          message: `${enemy.name}の攻撃！ ${damage}ダメージを受けた`,
        };
        newState = {
          ...newState,
          player: { ...newState.player, hp: newHp },
          totalDamageTaken: newState.totalDamageTaken + damage,
          log: [...newState.log, log],
        };

        // 被ダメ時の感情共鳴
        if (newHp <= newState.player.maxHp * 0.3) {
          newState = addResonance(newState, 'fear', 1);
        }
        newState = addResonance(newState, 'rage', 1);

        // 負傷チェック
        if (newHp > 0 && newHp <= Math.floor(newState.player.maxHp / 2) && !newState._woundLogged) {
          newState.log = [...newState.log, { type: 'system', message: `⚠ 負傷状態 — 全判定-1` }];
          newState._woundLogged = true;
        }
      }
    } else if (action.type === 'defend') {
      const log = { type: 'enemy_defend', enemy: enemy.name, message: `${enemy.name}は防御態勢をとった` };
      newState = { ...newState, log: [...newState.log, log] };
    } else if (action.type === 'guard') {
      const log = { type: 'enemy_guard', enemy: enemy.name, message: `${enemy.name}は核を守っている` };
      newState = { ...newState, log: [...newState.log, log] };
    }
  }

  delete newState._evadeBonus;

  if (newState.player.hp <= 0) {
    newState = { ...newState, phase: PHASE.DEFEAT };
    newState.log = [...newState.log, { type: 'result', message: 'HPが0になった…… 討伐失敗' }];
    return newState;
  }

  newState = { ...newState, phase: PHASE.ROUND_END };
  return newState;
}

// ===== ラウンド終了 =====
export function endRound(state) {
  const nextRound = state.round + 1;

  if (nextRound > state.maxRounds) {
    return {
      ...state,
      phase: PHASE.TIMEOUT,
      log: [...state.log, { type: 'result', message: `ラウンド${state.maxRounds}超過 — 時間切れで撤退` }],
    };
  }

  return { ...state, round: nextRound, phase: PHASE.INIT };
}

// ===== ユーティリティ =====

function applyDamageToTarget(state, targetId, isCore, damage) {
  if (isCore) {
    return {
      ...state,
      core: { ...state.core, hp: Math.max(state.core.hp - damage, 0) },
      totalDamageDealt: state.totalDamageDealt + damage,
    };
  }
  return {
    ...state,
    enemies: state.enemies.map(e =>
      e.id === targetId ? { ...e, hp: Math.max(e.hp - damage, 0) } : e
    ),
    totalDamageDealt: state.totalDamageDealt + damage,
  };
}

function addResonance(state, emotion, amount) {
  return {
    ...state,
    resonance: {
      ...state.resonance,
      [emotion]: (state.resonance[emotion] || 0) + amount,
    },
  };
}

// 戦闘結果サマリ
export function getBattleResult(state) {
  let result;
  if (state.phase === PHASE.VICTORY) result = '勝利';
  else if (state.phase === PHASE.DEFEAT) result = '敗北';
  else result = '撤退';

  return {
    result,
    roundsTaken: state.round,
    totalDamageDealt: state.totalDamageDealt,
    totalDamageTaken: state.totalDamageTaken,
    remainingHp: state.player.hp,
    resonanceSnapshot: { ...state.resonance },
    battleLog: state.log,
  };
}

export { PHASE };
