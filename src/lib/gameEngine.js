// 戦闘ステートマシン — KAI-I//KILL シミュレーション型ゲームエンジン

import { rollDicePool, resolveCheck, calculateDamage, calculateHP, rollInitiative } from './dice';

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

// 敵AIの行動選択
function selectEnemyAction(enemy, state) {
  switch (enemy.ai) {
    case 'aggressive':
      return { type: 'attack', target: 'player' };
    case 'defensive':
      return state.enemies.filter(e => e.hp > 0).length <= 1
        ? { type: 'attack', target: 'player' }
        : { type: 'defend' };
    case 'support':
      // 護衛が核を守る行動
      return { type: 'guard', target: 'core' };
    default:
      return { type: 'attack', target: 'player' };
  }
}

// 初期状態を生成
export function createBattleState(character, mission) {
  const playerHP = calculateHP(character.rank_tai);

  const enemies = mission.battle.guardians.map(g => ({
    ...g,
    maxHp: g.hp,
    alive: true,
  }));

  const core = {
    ...mission.battle.core,
    maxHp: mission.battle.core.hp,
    exposed: false, // 護衛が全滅するまで核は露出しない
  };

  return {
    phase: PHASE.INIT,
    round: 1,
    maxRounds: mission.battle.max_rounds,
    player: {
      name: character.character_name,
      hp: playerHP,
      maxHp: playerHP,
      rank_tai: character.rank_tai,
      rank_haya: character.rank_haya,
      rank_shiki: character.rank_shiki,
      rank_han: character.rank_han,
      rank_shiya: character.rank_shiya,
      rank_jutsu: character.rank_jutsu,
      rank_kon: character.rank_kon,
      class: character.class,
      equipment_type: character.equipment_type,
    },
    enemies,
    core,
    log: [],
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    resonance: {
      fear: 0, rage: 0, sorrow: 0, haste: 0, thirst: 0, purge: 0,
    },
  };
}

// ラウンド開始（イニシアチブ判定）
export function startRound(state) {
  const playerInit = rollInitiative(state.player.rank_haya);
  const log = {
    type: 'round_start',
    round: state.round,
    playerInitiative: playerInit,
    message: `ラウンド${state.round}開始 — イニシアチブ: ${playerInit}`,
  };

  // 核の露出チェック
  const aliveGuardians = state.enemies.filter(e => e.hp > 0);
  const exposed = aliveGuardians.length === 0;

  return {
    ...state,
    phase: PHASE.PLAYER_TURN,
    core: { ...state.core, exposed },
    log: [...state.log, log],
  };
}

// プレイヤー行動（攻撃）
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

  // 攻撃判定（識ランク使用）
  const check = resolveCheck(state.player.rank_shiki, 0, target.defense + 3);
  let damage = 0;
  let message = '';

  if (check.isFumble) {
    message = `ファンブル！ ${state.player.name}の攻撃は大きく外れた`;
    // ファンブル時、感情共鳴: 焦燥+1
    state = addResonance(state, 'haste', 1);
  } else if (check.success) {
    damage = calculateDamage(check.maxDie, 0, target.defense);
    message = check.isSpecial
      ? `スペシャル！ ${state.player.name}の攻撃が${target.name}に${damage}ダメージ！`
      : `${state.player.name}の攻撃が${target.name}に${damage}ダメージ`;
    if (check.isSpecial) {
      damage = Math.floor(damage * 1.5);
      state = addResonance(state, 'purge', 1);
    }
  } else {
    message = `${state.player.name}の攻撃は${target.name}に避けられた`;
  }

  // ダメージ適用
  let newState = { ...state };
  if (damage > 0) {
    if (isCore) {
      const newCoreHp = Math.max(state.core.hp - damage, 0);
      newState = {
        ...newState,
        core: { ...state.core, hp: newCoreHp },
        totalDamageDealt: state.totalDamageDealt + damage,
      };
    } else {
      const newEnemies = state.enemies.map(e =>
        e.id === targetId ? { ...e, hp: Math.max(e.hp - damage, 0) } : e
      );
      newState = {
        ...newState,
        enemies: newEnemies,
        totalDamageDealt: state.totalDamageDealt + damage,
      };
    }
  }

  const log = {
    type: 'player_attack',
    target: target.name,
    check,
    damage,
    message,
  };

  newState = {
    ...newState,
    phase: PHASE.ENEMY_TURN,
    log: [...newState.log, log],
  };

  // 勝利チェック
  if (isCore && newState.core.hp <= 0) {
    newState = { ...newState, phase: PHASE.VICTORY };
    newState.log = [...newState.log, { type: 'result', message: '核を破壊した！ 討伐成功！' }];
  }

  return { state: newState, result: { success: check.success, damage, check, message } };
}

// プレイヤー魔法攻撃
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

  // 魔法判定（術ランク使用）
  const check = resolveCheck(state.player.rank_jutsu, 0, target.defense + 2);
  let damage = 0;
  let message = '';

  if (check.isFumble) {
    message = `ファンブル！ 魔法が暴走した`;
    const selfDamage = 1;
    state = {
      ...state,
      player: { ...state.player, hp: Math.max(state.player.hp - selfDamage, 0) },
      totalDamageTaken: state.totalDamageTaken + selfDamage,
    };
    state = addResonance(state, 'fear', 1);
  } else if (check.success) {
    damage = calculateDamage(check.maxDie, 1, target.defense);
    if (check.isSpecial) {
      damage = Math.floor(damage * 1.5);
      state = addResonance(state, 'purge', 1);
    }
    message = check.isSpecial
      ? `スペシャル！ 魔法が${target.name}に${damage}ダメージ！`
      : `魔法が${target.name}に${damage}ダメージ`;
  } else {
    message = `魔法は${target.name}に効かなかった`;
  }

  let newState = { ...state };
  if (damage > 0) {
    if (isCore) {
      newState = {
        ...newState,
        core: { ...state.core, hp: Math.max(state.core.hp - damage, 0) },
        totalDamageDealt: state.totalDamageDealt + damage,
      };
    } else {
      const newEnemies = state.enemies.map(e =>
        e.id === targetId ? { ...e, hp: Math.max(e.hp - damage, 0) } : e
      );
      newState = { ...newState, enemies: newEnemies, totalDamageDealt: state.totalDamageDealt + damage };
    }
  }

  const log = { type: 'player_magic', target: target.name, check, damage, message };
  newState = { ...newState, phase: PHASE.ENEMY_TURN, log: [...newState.log, log] };

  if (isCore && newState.core.hp <= 0) {
    newState = { ...newState, phase: PHASE.VICTORY };
    newState.log = [...newState.log, { type: 'result', message: '核を破壊した！ 討伐成功！' }];
  }

  return { state: newState, result: { success: check.success, damage, check, message } };
}

// プレイヤー回避（次の敵攻撃を回避判定+2）
export function playerEvade(state) {
  const log = {
    type: 'player_evade',
    message: `${state.player.name}は回避態勢をとった（次の攻撃: 回避+2）`,
  };
  return {
    state: {
      ...state,
      phase: PHASE.ENEMY_TURN,
      log: [...state.log, log],
      _evadeBonus: 2,
    },
  };
}

// 敵ターン処理（全敵が行動）
export function processEnemyTurn(state) {
  let newState = { ...state };
  const evadeBonus = state._evadeBonus || 0;

  for (const enemy of newState.enemies) {
    if (enemy.hp <= 0) continue;

    const action = selectEnemyAction(enemy, newState);

    if (action.type === 'attack') {
      // 敵の攻撃
      const attackRoll = Math.max(...[Math.floor(Math.random() * 6) + 1]) + enemy.attack;
      const playerDefenseRoll = resolveCheck(newState.player.rank_haya, evadeBonus, attackRoll);

      if (playerDefenseRoll.success) {
        const log = { type: 'enemy_attack_miss', enemy: enemy.name, message: `${enemy.name}の攻撃を回避した` };
        newState = { ...newState, log: [...newState.log, log] };
      } else {
        const damage = Math.max(enemy.attack - Math.floor(evadeBonus / 2), 1);
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
      }
    } else if (action.type === 'defend') {
      const log = { type: 'enemy_defend', enemy: enemy.name, message: `${enemy.name}は防御態勢をとった` };
      newState = { ...newState, log: [...newState.log, log] };
    } else if (action.type === 'guard') {
      const log = { type: 'enemy_guard', enemy: enemy.name, message: `${enemy.name}は核を守っている` };
      newState = { ...newState, log: [...newState.log, log] };
    }
  }

  // 回避ボーナスリセット
  delete newState._evadeBonus;

  // 敗北チェック
  if (newState.player.hp <= 0) {
    newState = { ...newState, phase: PHASE.DEFEAT };
    newState.log = [...newState.log, { type: 'result', message: 'HPが0になった…… 討伐失敗' }];
    return newState;
  }

  // ラウンド終了
  newState = { ...newState, phase: PHASE.ROUND_END };
  return newState;
}

// ラウンド終了 → 次ラウンドへ or タイムアウト
export function endRound(state) {
  const nextRound = state.round + 1;

  if (nextRound > state.maxRounds) {
    return {
      ...state,
      phase: PHASE.TIMEOUT,
      log: [...state.log, { type: 'result', message: `ラウンド${state.maxRounds}超過 — 時間切れで撤退` }],
    };
  }

  return {
    ...state,
    round: nextRound,
    phase: PHASE.INIT,
  };
}

// 感情共鳴を加算
function addResonance(state, emotion, amount) {
  return {
    ...state,
    resonance: {
      ...state.resonance,
      [emotion]: (state.resonance[emotion] || 0) + amount,
    },
  };
}

// 戦闘結果サマリ生成
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
