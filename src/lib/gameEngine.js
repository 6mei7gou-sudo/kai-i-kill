// 戦闘ステートマシン — KAI-I//KILL シミュレーション型ゲームエンジン v3
// 装備・クラス・背景・サイバネティクス・スキル・武器詳細ステータスを反映

import { rollDicePool, resolveCheck, calculateDamage, calculateHP, rollInitiative, RANK_TO_HP_BONUS } from './dice';
import { getWeaponSpec } from '@/data/weaponData';
import { calcWeaponStats, getAttackAbility } from './weaponCalc';
import { getAvailableSkills, getBackgroundSkill } from '@/data/skillData';

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

// 装備種別 → 武器修正（フォールバック用。新システムでは getWeaponSpec を優先）
const EQUIPMENT_MOD = {
  '武装型': 1,
  '独立型': 1,
  '半装身型': 2,
  '全装身型': 3,
  '搭乗型': 2,
  '戦闘用搭乗型': 5,
};

// 武器種×企業から実際の武器修正を取得
function getActualWeaponMod(character) {
  if (character.weapon_type) {
    const spec = getWeaponSpec(character.weapon_type, character.equipment_maker || '汎用品', character.equipment_type || '武装型', character.equipment_name || '');
    if (spec) return spec.mod;
  }
  return EQUIPMENT_MOD[character.equipment_type] || 0;
}

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

  // 武器詳細ステータス読み込み
  const weaponDetails = loadWeaponDetails(character);

  // 武器修正: 詳細計算 > フォールバック
  const baseWeaponMod = weaponDetails ? weaponDetails.totalMod : getActualWeaponMod(character);
  const weaponMod = baseWeaponMod
    + (bgBonus.weaponModBonus || 0)
    + (cyberBonus.attackMod || 0);

  // HP計算: 基本 + 背景 + サイバネティクス
  const baseHP = calculateHP(character.rank_tai);
  const totalHP = baseHP + (bgBonus.hpBonus || 0) + (cyberBonus.hpBonus || 0);

  // ラウンド制限: 解明師は+1
  const maxRounds = mission.battle.max_rounds + (classBonus.extraRounds || 0);

  // 信念ポイント（回復用）
  const beliefPoints = character.belief_points || 5;

  // スキル読み込み
  const skills = loadBattleSkills(character);

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
  if (weaponDetails) {
    bonusLog.push(`武器: ${weaponDetails.weaponType}（${weaponDetails.manufacturer}）+${weaponDetails.totalMod}`);
    if (weaponDetails.conditions.length > 0) {
      bonusLog.push(`条件ボーナス: ${weaponDetails.conditions.map(c => `${c.label}+${c.value}`).join(', ')}`);
    }
    if (weaponDetails.resonance.length > 0) {
      bonusLog.push(`武器共鳴: ${weaponDetails.resonance.map(r => `${r.emotion}${r.value > 0 ? '+' : ''}${r.value}`).join(', ')}`);
    }
  } else if (weaponMod > 0) {
    bonusLog.push(`装備修正: +${weaponMod}`);
  }
  if (classBonus.label) bonusLog.push(classBonus.label);
  if (bgBonus.label) bonusLog.push(bgBonus.label);
  if (cyberBonus.label.length > 0) bonusLog.push(`サイバネ: ${cyberBonus.label.join(', ')}`);
  const activeSkills = skills.filter(s => s.type !== 'パッシブ');
  const passiveSkills = skills.filter(s => s.type === 'パッシブ');
  if (passiveSkills.length > 0) bonusLog.push(`パッシブ: ${passiveSkills.map(s => s.id).join(', ')}`);
  if (activeSkills.length > 0) bonusLog.push(`スキル: ${activeSkills.map(s => s.id).join(', ')}`);

  let player = {
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
    _weaponType: character.weapon_type,
    weaponMod,
    weaponDetails,
    classBonus,
    bgBonus,
    cyberBonus,
    beliefPoints,
    maxHealUses: 2,
    healUsesLeft: 2,
    defense: cyberBonus.defenseMod || 0,
    firstAttackDone: false,
    skills,
    skillUses: {},
  };

  // パッシブスキル適用
  player = applyPassiveSkills(player, null);

  return {
    phase: PHASE.INIT,
    round: 1,
    maxRounds,
    player,
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

  // スキルバフ（一時的な判定ボーナス）
  if (state.player._skillBuff) {
    attackMod += state.player._skillBuff;
  }

  // 鋼の肉体: 初回攻撃+1
  if (!state.player.firstAttackDone && state.player.bgBonus.firstAttackMod) {
    attackMod += state.player.bgBonus.firstAttackMod;
  }

  // パッシブ: 1ラウンド目攻撃ボーナス
  if (state.round === 1 && state.player._round1AttackBonus) {
    attackMod += state.player._round1AttackBonus;
  }

  // パッシブ: HP50%以下で攻撃+1（傭兵の矜持）
  if (state.player._lowHpAttackBonus && state.player.hp <= state.player.maxHp * 0.5) {
    attackMod += state.player._lowHpAttackBonus;
  }

  // 祓士: 核攻撃+2
  if (isCore && state.player.classBonus.coreAttackMod) {
    attackMod += state.player.classBonus.coreAttackMod;
  }

  // 機甲士: 護衛ダメージ+2
  const guardianDmgBonus = (!isCore && state.player.classBonus.guardianDamageMod) || 0;

  // パッシブ: 怒り4以上で攻撃+1
  const rageDmgBonus = (state.player._rageAttackBonus && state.resonance.rage >= 4) ? 1 : 0;

  // 学者肌: 核防御1無視
  const defIgnore = isCore ? (state.player.bgBonus.coreDefIgnore || 0) : 0;
  const effectiveDefense = Math.max((target.defense || 0) - defIgnore, 0);

  // 武器詳細の条件付きボーナス（例: 核攻撃時+N）
  let condBonus = 0;
  if (state.player.weaponDetails?.conditions) {
    for (const cond of state.player.weaponDetails.conditions) {
      if (isCore && (cond.label.includes('核') || cond.label.includes('コア'))) {
        condBonus += cond.value;
      }
    }
  }

  // 武器型に応じた判定属性を使用（斬撃型/打撃型→体、射撃型→疾、魔導型→術、体術型→体）
  const attackRankKey = getAttackRankKey(state.player);
  const attackRank = state.player[attackRankKey] || 'D';

  // 負傷ペナルティ（HP50%以下で判定-1）
  const woundPenalty = state.player.hp <= Math.floor(state.player.maxHp / 2) ? -1 : 0;

  const check = resolveCheck(attackRank, attackMod + condBonus + woundPenalty, effectiveDefense + 4);
  let damage = 0;
  let message = '';

  if (check.isFumble) {
    message = `ファンブル！ ${state.player.name}の攻撃は大きく外れた`;
    state = addResonance(state, 'haste', 1);
  } else if (check.success) {
    damage = calculateDamage(check.maxDie, guardianDmgBonus + rageDmgBonus, effectiveDefense);
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
    player: { ...state.player, firstAttackDone: true, _skillBuff: 0, _skillDefense: 0 },
  };

  if (damage > 0) {
    newState = applyDamageToTarget(newState, targetId, isCore, damage);

    // パッシブ: 護衛撃破時、余剰ダメージが核に伝播
    if (!isCore && newState.player._overflowToCore) {
      const enemy = newState.enemies.find(e => e.id === targetId);
      if (enemy && enemy.hp <= 0) {
        const overflow = Math.abs(enemy.hp);
        if (overflow > 0 && newState.core.exposed === false) {
          // 撃破後に核が露出するか確認
          const aliveAfter = newState.enemies.filter(e => e.hp > 0);
          if (aliveAfter.length === 0) {
            newState = { ...newState, core: { ...newState.core, exposed: true, hp: Math.max(newState.core.hp - overflow, 0) } };
            newState.totalDamageDealt += overflow;
            message += `（余剰${overflow}が核に伝播！）`;
          }
        }
      }
    }
  }

  // 武器の共鳴効果を適用
  if (damage > 0 && newState.player.weaponDetails?.resonance?.length > 0) {
    for (const res of newState.player.weaponDetails.resonance) {
      const emoKey = { '怒り': 'rage', '恐怖': 'fear', '渇望': 'thirst', '哀愁': 'sorrow', '焦燥': 'haste', '浄化': 'purge' }[res.emotion];
      if (emoKey) newState = addResonance(newState, emoKey, res.value);
    }
  }

  const log = { type: 'player_attack', target: target.name, check, damage, message };
  newState = { ...newState, phase: PHASE.ENEMY_TURN, log: [...newState.log, log] };

  if (newState.core.hp <= 0 && newState.phase !== PHASE.VICTORY) {
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

  // 負傷ペナルティ
  const woundPenalty = state.player.hp <= Math.floor(state.player.maxHp / 2) ? -1 : 0;

  const check = resolveCheck(state.player.rank_jutsu, magicMod + woundPenalty, effectiveDefense + 3);
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

  if (newState.core.hp <= 0 && newState.phase !== PHASE.VICTORY) {
    newState = { ...newState, phase: PHASE.VICTORY };
    newState.log = [...newState.log, { type: 'result', message: '核を破壊した！ 討伐成功！' }];
  }

  return { state: newState, result: { success: check.success, damage, check, message } };
}

// ===== プレイヤー回避 =====
export function playerEvade(state) {
  const evadeBonus = 2 + (state.player.bgBonus.evadeMod || 0) + (state.player.cyberBonus.evadeBonus || 0) + (state.player._skillBuff || 0);
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
        // ダメージ = 敵攻撃力 - プレイヤー防御（サイバネ + スキル）
        const skillDef = newState.player._skillDefense || 0;
        // パッシブ: HP50%以下で防御+1
        const lowHpDef = (newState.player._lowHpDefenseBonus && newState.player.hp <= newState.player.maxHp * 0.5) ? 1 : 0;
        const rawDamage = Math.max(enemy.attack + 1 - playerDef - skillDef - lowHpDef, 1);
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
      // 防御態勢: この敵の防御力を一時的に+2
      enemy._defending = true;
      const log = { type: 'enemy_defend', enemy: enemy.name, message: `${enemy.name}は防御態勢をとった（防御+2）` };
      newState = { ...newState, log: [...newState.log, log] };
    } else if (action.type === 'guard') {
      // 核守護: この敵が生存中は核へのダメージを2軽減
      enemy._guarding = true;
      const log = { type: 'enemy_guard', enemy: enemy.name, message: `${enemy.name}は核を守っている（核ダメージ-2）` };
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

// ===== プレイヤースキル使用 =====
export function playerSkill(state, skillId, targetId) {
  const skill = state.player.skills?.find(s => s.id === skillId);
  if (!skill) return { state, result: { success: false, message: 'スキルが見つからない' } };

  // 使用回数チェック
  const uses = state.player.skillUses || {};
  const maxUses = skill.type === 'メイン' ? 1 : (skill.maxUses || 2);
  if ((uses[skillId] || 0) >= maxUses) {
    return { state, result: { success: false, message: `${skill.id}は使用回数上限に達した` } };
  }

  let newState = { ...state };
  let damage = 0;
  let message = '';
  let success = true;
  const rankKey = `rank_${ATTR_TO_RANK[skill.attr] || 'shiki'}`;
  const rank = newState.player[rankKey] || 'D';

  // 負傷ペナルティ（HP50%以下で-1）— resolveCheckの修正値に反映
  const woundPenalty = newState.player.hp <= Math.floor(newState.player.maxHp / 2) ? -1 : 0;

  // --- スキル効果の解決 ---
  const effect = skill.effect || '';

  // スキルが攻撃系かどうかを判定（テキストパースではなくスキルIDと効果の総合判断）
  const isAttackSkill = (
    effect.includes('ダメージ+') || effect.includes('ダメージ2倍') ||
    effect.includes('防御力を無視') || effect.includes('防御無視') ||
    effect.includes('武器修正2倍') ||
    effect.includes('達成値を採用') || effect.includes('達成値+') ||
    effect.match(/\d+回攻撃/) || effect.includes('同時攻撃') ||
    effect.includes('に攻撃') || effect.includes('魔法攻撃') ||
    effect.includes('全体に') || effect.includes('反撃') ||
    effect.includes('核に直接')
  );

  // HP条件チェック（攻撃スキル共通）
  if (isAttackSkill) {
    if (effect.includes('HP50%以下') && newState.player.hp > newState.player.maxHp * 0.5) {
      return { state, result: { success: false, message: 'HP50%以上のため使用できない' } };
    }
    if (effect.includes('HP4以下') && newState.player.hp > 4) {
      return { state, result: { success: false, message: 'HP4以下でないと使用できない' } };
    }
  }

  // 信念消費チェック（先に処理）
  if (effect.includes('信念') && effect.includes('消費')) {
    if (newState.player.beliefPoints <= 0) {
      return { state, result: { success: false, message: '信念ポイントが足りない' } };
    }
    newState = { ...newState, player: { ...newState.player, beliefPoints: newState.player.beliefPoints - 1 } };
  }

  // ===== 攻撃系スキル =====
  if (isAttackSkill) {
    // ボーナスダメージを計算
    let bonusDmg = 0;
    const dmgMatch = effect.match(/ダメージ[+＋](\d+)/);
    if (dmgMatch) bonusDmg = parseInt(dmgMatch[1], 10);

    // 武器修正2倍（全力打撃等）
    const doubleWeaponMod = effect.includes('武器修正2倍');
    const effectiveWeaponMod = (doubleWeaponMod
      ? newState.player.weaponMod * 2
      : newState.player.weaponMod) + woundPenalty;

    // 防御無視
    const ignoreDefense = effect.includes('防御無視') || effect.includes('防御力を無視');

    // ダメージ倍率
    const doubleDamage = effect.includes('2倍') || effect.includes('ダメージ2倍');

    // 複数回攻撃（連斬、連撃、制圧射撃等）
    const multiMatch = effect.match(/(\d+)回攻撃/);
    const isMultiHit = multiMatch || effect.includes('達成値を採用');
    const hitCount = multiMatch ? parseInt(multiMatch[1], 10) : (effect.includes('達成値を採用') ? 2 : 1);

    // 全体攻撃（広域術式、一騎当千等）
    const isAoe = effect.includes('全体') || effect.includes('護衛全体') || effect.includes('2体に同時攻撃');

    // 核直接ダメージ（真名暴露等）
    if (effect.includes('核に直接')) {
      const directDmg = dmgMatch ? parseInt(dmgMatch[1], 10) : 5;
      if (newState.core.exposed) {
        newState = applyDamageToTarget(newState, 'core', true, directDmg);
        message = `${skill.id}！ 核に直接${directDmg}ダメージ`;
        damage = directDmg;
      } else {
        message = `${skill.id} — 核が露出していないため効果なし`;
        success = false;
      }
    }
    // 全体攻撃
    else if (isAoe) {
      const penaltyMatch = effect.match(/各?ダメージ[-−](\d+)/);
      const aoePenalty = penaltyMatch ? parseInt(penaltyMatch[1], 10) : 0;
      let totalDmg = 0;
      const targets = newState.enemies.filter(e => e.hp > 0);
      if (targets.length === 0) {
        message = `${skill.id} — 対象がいない`;
        success = false;
      } else {
        const msgs = [];
        for (const t of targets) {
          const check = resolveCheck(rank, effectiveWeaponMod, (t.defense || 0) + 4);
          if (check.success) {
            let dmg = ignoreDefense
              ? check.maxDie + effectiveWeaponMod + bonusDmg - aoePenalty
              : calculateDamage(check.maxDie, effectiveWeaponMod + bonusDmg - aoePenalty, t.defense || 0);
            if (doubleDamage) dmg *= 2;
            if (check.isSpecial) dmg = Math.floor(dmg * 1.5);
            dmg = Math.max(dmg, 0);
            newState = applyDamageToTarget(newState, t.id, false, dmg);
            totalDmg += dmg;
            msgs.push(`${t.name}に${dmg}`);
          } else {
            msgs.push(`${t.name}は回避`);
          }
        }
        damage = totalDmg;
        message = `${skill.id}！ ${msgs.join('、')}`;
      }
    }
    // 複数回攻撃（連斬: 2回判定→高い方採用、連撃: 2回攻撃で各-1）
    else if (isMultiHit && hitCount >= 2) {
      let target;
      let isCore = false;
      if (targetId === 'core' && newState.core.exposed) { target = newState.core; isCore = true; }
      else { target = newState.enemies.find(e => e.id === targetId && e.hp > 0); }
      if (!target) return { state, result: { success: false, message: '対象が見つからない' } };

      if (effect.includes('達成値を採用') || effect.includes('高い方')) {
        // 2回振って高い方を採用（連斬）
        const check1 = resolveCheck(rank, effectiveWeaponMod, (target.defense || 0) + 4);
        const check2 = resolveCheck(rank, effectiveWeaponMod, (target.defense || 0) + 4);
        const best = (check1.total >= check2.total) ? check1 : check2;
        if (best.isFumble) {
          message = `ファンブル！ ${skill.id}は失敗した`;
          success = false;
        } else if (best.success) {
          damage = ignoreDefense
            ? best.maxDie + effectiveWeaponMod + bonusDmg
            : calculateDamage(best.maxDie, effectiveWeaponMod + bonusDmg, target.defense || 0);
          if (doubleDamage) damage *= 2;
          if (best.isSpecial) damage = Math.floor(damage * 1.5);
          newState = applyDamageToTarget(newState, targetId, isCore, damage);
          message = `${skill.id}！ 2回判定の最良値で${target.name}に${damage}ダメージ`;
          if (best.isSpecial) message = `スペシャル！ ` + message;
        } else {
          message = `${skill.id}は${target.name}に避けられた`;
          success = false;
        }
      } else {
        // 各攻撃が独立（連撃、二丁拳銃等）
        const penaltyMatch = effect.match(/各?ダメージ[-−](\d+)/);
        const hitPenalty = penaltyMatch ? parseInt(penaltyMatch[1], 10) : 0;
        const useWeaponMod = !effect.includes('武器修正なし');
        let totalDmg = 0;
        const msgs = [];
        for (let i = 0; i < hitCount; i++) {
          const mod = useWeaponMod ? effectiveWeaponMod : 0;
          const check = resolveCheck(rank, mod, (target.defense || 0) + 4);
          if (check.success) {
            let dmg = calculateDamage(check.maxDie, mod + bonusDmg - hitPenalty, target.defense || 0);
            dmg = Math.max(dmg, 0);
            if (check.isSpecial) dmg = Math.floor(dmg * 1.5);
            totalDmg += dmg;
            msgs.push(`${dmg}`);
          } else {
            msgs.push('回避');
          }
        }
        if (totalDmg > 0) newState = applyDamageToTarget(newState, targetId, isCore, totalDmg);
        damage = totalDmg;
        message = `${skill.id}！ ${hitCount}回攻撃 [${msgs.join(' / ')}] → ${target.name}に計${totalDmg}ダメージ`;
      }
    }
    // 単体攻撃（基本）
    else {
      let target;
      let isCore = false;
      if (targetId === 'core' && newState.core.exposed) { target = newState.core; isCore = true; }
      else { target = newState.enemies.find(e => e.id === targetId && e.hp > 0); }
      if (!target) return { state, result: { success: false, message: '対象が見つからない' } };

      const check = resolveCheck(rank, effectiveWeaponMod, (target.defense || 0) + 4);
      if (check.isFumble) {
        message = `ファンブル！ ${skill.id}は失敗した`;
        success = false;
      } else if (check.success) {
        damage = ignoreDefense
          ? check.maxDie + effectiveWeaponMod + bonusDmg
          : calculateDamage(check.maxDie, effectiveWeaponMod + bonusDmg, target.defense || 0);
        if (doubleDamage) damage *= 2;
        if (check.isSpecial) damage = Math.floor(damage * 1.5);
        newState = applyDamageToTarget(newState, targetId, isCore, damage);
        message = `${skill.id}！ ${target.name}に${damage}ダメージ`;
        if (check.isSpecial) message = `スペシャル！ ` + message;
      } else {
        message = `${skill.id}は${target.name}に避けられた`;
        success = false;
      }
    }

    // 反動ダメージ
    if (effect.includes('反動')) {
      const recoilMatch = effect.match(/反動(\d+)/);
      const recoil = recoilMatch ? parseInt(recoilMatch[1], 10) : 2;
      newState = { ...newState, player: { ...newState.player, hp: Math.max(newState.player.hp - recoil, 0) } };
      message += `（反動${recoil}）`;
    }

    // 追加効果: 対象の防御力低下
    if (success && (effect.includes('防御力-') || effect.includes('防御力を次ラウンド'))) {
      const debuffMatch = effect.match(/防御力.*?[-−](\d+)/);
      const debuff = debuffMatch ? parseInt(debuffMatch[1], 10) : 1;
      const tgt = newState.enemies.find(e => e.id === targetId);
      if (tgt) {
        tgt.defense = Math.max((tgt.defense || 0) - debuff, 0);
        message += `（防御力-${debuff}）`;
      }
    }

    // 追加効果: 行動遅延
    if (success && effect.includes('遅延')) {
      message += '（行動遅延付与）';
    }

    if (newState.core.hp <= 0 && newState.phase !== PHASE.VICTORY) {
      newState = { ...newState, phase: PHASE.VICTORY };
      newState.log = [...newState.log, { type: 'result', message: '核を破壊した！ 討伐成功！' }];
    }
  }
  // ===== 回復系スキル =====
  else if (effect.includes('HP') && effect.includes('回復')) {
    const healMatch = effect.match(/HP.*?(\d+)回復/);
    const healAmt = healMatch ? parseInt(healMatch[1], 10) : 2;
    const newHp = Math.min(newState.player.hp + healAmt, newState.player.maxHp);
    message = `${skill.id}でHP${newHp - newState.player.hp}回復`;
    newState = { ...newState, player: { ...newState.player, hp: newHp } };
  }
  // ===== バフ系スキル（判定+N、行使+N） =====
  else if (effect.includes('判定+') || effect.includes('行使+')) {
    const buffMatch = effect.match(/[+＋](\d+)/);
    const buffVal = buffMatch ? parseInt(buffMatch[1], 10) : 1;
    newState = { ...newState, player: { ...newState.player, _skillBuff: (newState.player._skillBuff || 0) + buffVal } };
    message = `${skill.id} — 次の判定+${buffVal}`;
  }
  // ===== 防御系スキル（受けるダメージ-N） =====
  else if (effect.includes('受けるダメージ') || (effect.includes('ダメージ') && effect.includes('軽減'))) {
    const defMatch = effect.match(/[-−](\d+)/);
    const defVal = defMatch ? parseInt(defMatch[1], 10) : 2;
    newState = { ...newState, player: { ...newState.player, _skillDefense: (newState.player._skillDefense || 0) + defVal } };
    message = `${skill.id} — 次の被ダメージ-${defVal}`;
  }
  // ===== 回避系スキル =====
  else if (effect.includes('回避+') || effect.includes('リアクション判定+')) {
    const evMatch = effect.match(/[+＋](\d+)/);
    const evVal = evMatch ? parseInt(evMatch[1], 10) : 2;
    newState = { ...newState, player: { ...newState.player, _skillBuff: (newState.player._skillBuff || 0) + evVal } };
    message = `${skill.id} — リアクション+${evVal}`;
  }
  // ===== デバフ系（対象の防御力低下） =====
  else if (effect.includes('防御力') && effect.includes('-')) {
    const debuffMatch = effect.match(/[-−](\d+)/);
    const debuff = debuffMatch ? parseInt(debuffMatch[1], 10) : 2;
    const tgt = newState.enemies.find(e => e.id === targetId && e.hp > 0);
    if (tgt) {
      tgt.defense = Math.max((tgt.defense || 0) - debuff, 0);
      message = `${skill.id} — ${tgt.name}の防御力-${debuff}`;
    } else {
      message = `${skill.id} — 対象が見つからない`;
      success = false;
    }
  }
  // ===== 共鳴メーター操作 =====
  else if (effect.includes('共鳴メーター') || effect.includes('浄化')) {
    const resMatch = effect.match(/[-−](\d+)/);
    const resVal = resMatch ? parseInt(resMatch[1], 10) : 2;
    const maxEmo = Object.entries(newState.resonance)
      .filter(([k]) => k !== 'purge')
      .sort((a, b) => b[1] - a[1])[0];
    if (maxEmo && maxEmo[1] > 0) {
      newState = addResonance(newState, maxEmo[0], -resVal);
      message = `${skill.id} — ${maxEmo[0]}を${resVal}軽減`;
    } else {
      message = `${skill.id} — 共鳴メーターに変化なし`;
    }
  }
  // ===== 護衛特性開示 =====
  else if (effect.includes('特性') && (effect.includes('開示') || effect.includes('把握') || effect.includes('自動開示'))) {
    message = `${skill.id} — 護衛の特性を開示した`;
  }
  // ===== 核の防御力ゼロ化（情報遮断等） =====
  else if (effect.includes('核') && effect.includes('防御力=0')) {
    newState = { ...newState, core: { ...newState.core, defense: 0 } };
    message = `${skill.id} — 核の防御力を0にした`;
  }
  // ===== 味方全員バフ（情報共有、組織命令等） =====
  else if (effect.includes('味方全員') && effect.includes('判定+')) {
    const buffMatch = effect.match(/[+＋](\d+)/);
    const buffVal = buffMatch ? parseInt(buffMatch[1], 10) : 1;
    newState = { ...newState, player: { ...newState.player, _skillBuff: (newState.player._skillBuff || 0) + buffVal } };
    message = `${skill.id} — 次ラウンドの判定+${buffVal}`;
  }
  // ===== その他の汎用効果 =====
  else {
    message = `${skill.id}を使用した — ${effect}`;
  }

  // 共鳴コスト処理（渇望+N）
  if (effect.includes('渇望+')) {
    const thirstMatch = effect.match(/渇望[+＋](\d+)/);
    const thirst = thirstMatch ? parseInt(thirstMatch[1], 10) : 1;
    newState = addResonance(newState, 'thirst', thirst);
    if (thirst > 0) message += `（渇望+${thirst}）`;
  }

  // 使用回数を記録
  const newUses = { ...(newState.player.skillUses || {}), [skillId]: ((newState.player.skillUses || {})[skillId] || 0) + 1 };
  newState = {
    ...newState,
    player: { ...newState.player, skillUses: newUses },
    phase: PHASE.ENEMY_TURN,
    log: [...newState.log, { type: 'player_skill', skill: skill.id, message }],
  };

  // フォールバック勝利判定：どのスキル分岐を通っても core HP が 0 以下になっていれば勝利
  if (newState.core.hp <= 0 && newState.phase !== PHASE.VICTORY) {
    newState = { ...newState, phase: PHASE.VICTORY };
    newState.log = [...newState.log, { type: 'result', message: '核を破壊した！ 討伐成功！' }];
  }

  return { state: newState, result: { success, damage, message } };
}

// 属性名 → ランクキーのマッピング
const ATTR_TO_RANK = {
  '体': 'tai', '疾': 'haya', '識': 'shiki', '判': 'han', '察': 'shiya', '術': 'jutsu', '魂': 'kon',
};

// 武器型から通常攻撃の判定ランクキーを取得
function getAttackRankKey(player) {
  if (player.weaponDetails?.ability) {
    return player.weaponDetails.ability;  // 例: 'rank_tai'
  }
  // weaponDetailsがない場合、getAttackAbilityでフォールバック
  const weaponType = player._weaponType || '';
  const ability = getAttackAbility(weaponType);
  return ability || 'rank_tai';
}

// パッシブスキル効果をプレイヤーステートに適用
function applyPassiveSkills(player, state) {
  let p = { ...player };
  const passives = (p.skills || []).filter(s => s.type === 'パッシブ');

  for (const skill of passives) {
    const eff = skill.effect || '';
    // 攻撃判定+1系
    if (eff.includes('攻撃判定+1') && eff.includes('1ラウンド目')) {
      p._round1AttackBonus = 1;
    }
    // HP50%以下で攻撃+1（傭兵の矜持）
    if (eff.includes('HP50%以下') && eff.includes('攻撃判定+1')) {
      p._lowHpAttackBonus = 1;
    }
    // HP50%以下で防御+1（独立生存術）
    if (eff.includes('HP50%以下') && eff.includes('防御修正+1')) {
      p._lowHpDefenseBonus = 1;
    }
    // 護衛HP常時把握（観察眼）
    if (eff.includes('HP') && eff.includes('常に把握')) {
      p._canSeeEnemyHp = true;
    }
    // 怒りメーター4以上で攻撃+1
    if (eff.includes('怒りメーター') && eff.includes('ダメージ+1')) {
      p._rageAttackBonus = 1;
    }
    // 護衛撃破時余剰ダメージ核伝播
    if (eff.includes('余剰ダメージ') && eff.includes('核')) {
      p._overflowToCore = true;
    }
    // 怪異誘発改善
    if (eff.includes('怪異誘発') && eff.includes('改善')) {
      p._reducedAnomalyRisk = true;
    }
  }

  return p;
}

// 所属→デフォルト配属の推定（配属が空の場合のフォールバック）
const DEFAULT_ASSIGNMENT = {
  '祓部': '機動班',
  '傭兵': '突撃型',
  '無所属': '野良討伐者',
};

// スキル一覧を取得してバトル用に変換
function loadBattleSkills(character) {
  const assignment = character.sub_affiliation || character.assignment
    || DEFAULT_ASSIGNMENT[character.affiliation] || '';
  const skills = getAvailableSkills({
    affiliation: character.affiliation,
    assignment,
    awakening: character.awakening,
    weaponType: character.weapon_skill_type || character.weapon_type,
  });

  const bgSkill = getBackgroundSkill(character.background);
  if (bgSkill) {
    skills.push({ ...bgSkill, axis: '背景', level: 0 });
  }

  // 使用回数上限を設定
  return skills.map(s => ({
    ...s,
    maxUses: s.type === 'メイン' ? 1 : (s.type === 'サブ' ? 2 : 99),
  }));
}

// 武器詳細ステータスを取得
function loadWeaponDetails(character) {
  try {
    const stats = calcWeaponStats({
      weaponType: character.weapon_type,
      manufacturer: character.equipment_maker || '汎用品',
      equipmentType: character.equipment_type || '武装型',
      subtype: character.equipment_name || '',
      options: Array.isArray(character.weapon_options) ? character.weapon_options : [],
      gift: character.gift,
    });
    return stats;
  } catch (e) {
    return null;
  }
}

// ===== ユーティリティ =====

function applyDamageToTarget(state, targetId, isCore, damage) {
  if (isCore) {
    // 核守護中の護衛がいればダメージ-2
    const guardCount = (state.enemies || []).filter(e => e.hp > 0 && e._guarding).length;
    const guardReduction = guardCount * 2;
    const effectiveDmg = Math.max(damage - guardReduction, 0);
    return {
      ...state,
      core: { ...state.core, hp: Math.max(state.core.hp - effectiveDmg, 0) },
      totalDamageDealt: state.totalDamageDealt + effectiveDmg,
    };
  }
  // 防御態勢の敵はダメージ-2（防御態勢は消費される）
  const target = state.enemies.find(e => e.id === targetId);
  const defBonus = (target && target._defending) ? 2 : 0;
  const effectiveDmg = Math.max(damage - defBonus, 0);
  return {
    ...state,
    enemies: state.enemies.map(e =>
      e.id === targetId ? { ...e, hp: Math.max(e.hp - effectiveDmg, 0), _defending: false } : e
    ),
    totalDamageDealt: state.totalDamageDealt + effectiveDmg,
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

// ===== 協力戦闘（Coop）用関数 =====

// 複数キャラの初期状態を生成
export function createCoopBattleState(characters, mission) {
  // 各キャラのステータスを計算
  const players = characters.map((character, idx) => {
    const classBonus = getClassBonus(character.class);
    const bgBonus = getBackgroundBonus(character.background);
    const cyberBonus = getCyberBonus(character.cybernetics);
    const weaponMod = getActualWeaponMod(character)
      + (bgBonus.weaponModBonus || 0)
      + (cyberBonus.attackMod || 0);

    const baseHP = calculateHP(character.rank_tai);
    const totalHP = baseHP + (bgBonus.hpBonus || 0) + (cyberBonus.hpBonus || 0);
    const beliefPoints = character.belief_points || 5;

    // スキル読み込み（Coop対応）
    const skills = loadBattleSkills(character);

    let playerObj = {
      id: character.id || `player_${idx}`,
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
      _weaponType: character.weapon_type,
      weaponMod,
      classBonus,
      bgBonus,
      cyberBonus,
      beliefPoints,
      maxHealUses: 2,
      healUsesLeft: 2,
      defense: cyberBonus.defenseMod || 0,
      firstAttackDone: false,
      alive: true,
      hate: 0,
      skills,
      skillUses: {},
    };

    // パッシブスキル適用
    playerObj = applyPassiveSkills(playerObj, null);

    return playerObj;
  });

  // イニシアチブ順にソート（疾ランクが高い順）
  const RANK_VAL = { D: 0, C: 1, B: 2, A: 3, S: 4 };
  players.sort((a, b) => (RANK_VAL[b.rank_haya] || 0) - (RANK_VAL[a.rank_haya] || 0));

  const maxRoundsBonus = players.reduce((bonus, p) => {
    return bonus + (p.classBonus.extraRounds || 0);
  }, 0);
  const maxRounds = mission.battle.max_rounds + Math.min(maxRoundsBonus, 1);

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

  return {
    phase: PHASE.INIT,
    mode: 'coop',
    round: 1,
    maxRounds,
    players,
    activePlayerIndex: 0,
    enemies,
    core,
    log: [{ type: 'system', message: `協力戦闘 — ${players.length}人パーティ` }],
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    resonance: {
      fear: 0, rage: 0, sorrow: 0, haste: 0, thirst: 0, purge: 0,
    },
  };
}

// 協力戦闘: ラウンド開始
export function startCoopRound(state) {
  const logs = [{
    type: 'round_start',
    round: state.round,
    message: `──── ラウンド${state.round} / ${state.maxRounds} ────`,
  }];

  if (state.round === state.maxRounds) {
    logs.push({ type: 'system', message: '⚠ 最終ラウンド — 焦燥+1' });
  }

  const aliveGuardians = state.enemies.filter(e => e.hp > 0);
  const exposed = aliveGuardians.length === 0;

  // 最初の生存プレイヤーのターン
  const firstAlive = state.players.findIndex(p => p.alive);

  let newState = {
    ...state,
    phase: PHASE.PLAYER_TURN,
    activePlayerIndex: firstAlive >= 0 ? firstAlive : 0,
    core: { ...state.core, exposed },
    log: [...state.log, ...logs],
  };

  if (state.round === state.maxRounds) {
    newState = addResonance(newState, 'haste', 1);
  }

  return newState;
}

// 協力戦闘: プレイヤー攻撃
export function coopPlayerAttack(state, targetId) {
  const player = state.players[state.activePlayerIndex];
  if (!player || !player.alive) return { state, result: { success: false, message: '行動不能' } };

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

  let attackMod = player.weaponMod;
  if (!player.firstAttackDone && player.bgBonus.firstAttackMod) {
    attackMod += player.bgBonus.firstAttackMod;
  }
  if (isCore && player.classBonus.coreAttackMod) {
    attackMod += player.classBonus.coreAttackMod;
  }

  const guardianDmgBonus = (!isCore && player.classBonus.guardianDamageMod) || 0;
  const defIgnore = isCore ? (player.bgBonus.coreDefIgnore || 0) : 0;
  const effectiveDefense = Math.max((target.defense || 0) - defIgnore, 0);

  const check = resolveCheck(player.rank_shiki, attackMod, effectiveDefense + 4);
  let damage = 0;
  let message = '';

  if (check.isFumble) {
    message = `ファンブル！ ${player.name}の攻撃は大きく外れた`;
    state = addResonance(state, 'haste', 1);
  } else if (check.success) {
    damage = calculateDamage(check.maxDie, guardianDmgBonus, effectiveDefense);
    if (check.isSpecial) {
      damage = Math.floor(damage * 1.5);
      state = addResonance(state, 'purge', 1);
      message = `スペシャル！ ${player.name}の攻撃が${target.name}に${damage}ダメージ！`;
    } else {
      message = `${player.name}の攻撃が${target.name}に${damage}ダメージ`;
    }
    state = addResonance(state, 'rage', 1);
  } else {
    message = `${player.name}の攻撃は${target.name}に避けられた`;
  }

  // プレイヤー更新
  let newPlayers = state.players.map((p, i) =>
    i === state.activePlayerIndex ? { ...p, firstAttackDone: true, hate: p.hate + (damage > 0 ? 2 : 0) } : p
  );

  let newState = { ...state, players: newPlayers };

  if (damage > 0) {
    newState = applyDamageToTarget(newState, targetId, isCore, damage);
  }

  const log = { type: 'player_attack', player: player.name, target: target.name, check, damage, message };
  newState = { ...newState, log: [...newState.log, log] };

  if (newState.core.hp <= 0 && newState.phase !== PHASE.VICTORY) {
    newState = { ...newState, phase: PHASE.VICTORY };
    newState.log = [...newState.log, { type: 'result', message: '核を破壊した！ 協力討伐成功！' }];
    return { state: newState, result: { success: check.success, damage, check, message } };
  }

  // 次のプレイヤーへ
  newState = advanceCoopTurn(newState);
  return { state: newState, result: { success: check.success, damage, check, message } };
}

// 協力戦闘: プレイヤー魔法攻撃
export function coopPlayerMagic(state, targetId) {
  const player = state.players[state.activePlayerIndex];
  if (!player || !player.alive) return { state, result: { success: false, message: '行動不能' } };

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
  if (isCore && player.classBonus.coreAttackMod) {
    magicMod += player.classBonus.coreAttackMod;
  }

  const defIgnore = isCore ? (player.bgBonus.coreDefIgnore || 0) : 0;
  const effectiveDefense = Math.max((target.defense || 0) - defIgnore, 0);

  const check = resolveCheck(player.rank_jutsu, magicMod, effectiveDefense + 3);
  let damage = 0;
  let message = '';

  if (check.isFumble) {
    message = `ファンブル！ ${player.name}の魔法が暴走 — 自傷2`;
    const selfDmg = 2;
    state = {
      ...state,
      players: state.players.map((p, i) =>
        i === state.activePlayerIndex ? { ...p, hp: Math.max(p.hp - selfDmg, 0), alive: Math.max(p.hp - selfDmg, 0) > 0 } : p
      ),
      totalDamageTaken: state.totalDamageTaken + selfDmg,
    };
    state = addResonance(state, 'fear', 1);
  } else if (check.success) {
    damage = calculateDamage(check.maxDie, 1, effectiveDefense);
    const mult = player.classBonus.magicMultiplier || 1;
    damage = Math.floor(damage * mult);
    if (check.isSpecial) {
      damage = Math.floor(damage * 1.5);
      state = addResonance(state, 'purge', 1);
      message = `スペシャル！ ${player.name}の魔法が${target.name}に${damage}ダメージ！`;
    } else {
      message = `${player.name}の魔法が${target.name}に${damage}ダメージ`;
    }
    state = addResonance(state, 'thirst', 1);
  } else {
    message = `${player.name}の魔法は${target.name}に効かなかった`;
  }

  let newPlayers = state.players.map((p, i) =>
    i === state.activePlayerIndex ? { ...p, hate: p.hate + (damage > 0 ? 1 : 0) } : p
  );

  let newState = { ...state, players: newPlayers };
  if (damage > 0) {
    newState = applyDamageToTarget(newState, targetId, isCore, damage);
  }

  const log = { type: 'player_magic', player: player.name, target: target.name, check, damage, message };
  newState = { ...newState, log: [...newState.log, log] };

  if (newState.core.hp <= 0 && newState.phase !== PHASE.VICTORY) {
    newState = { ...newState, phase: PHASE.VICTORY };
    newState.log = [...newState.log, { type: 'result', message: '核を破壊した！ 協力討伐成功！' }];
    return { state: newState, result: { success: check.success, damage, check, message } };
  }

  newState = advanceCoopTurn(newState);
  return { state: newState, result: { success: check.success, damage, check, message } };
}

// 協力戦闘: プレイヤー回避
export function coopPlayerEvade(state) {
  const player = state.players[state.activePlayerIndex];
  if (!player || !player.alive) return { state };

  const evadeBonus = 2 + (player.bgBonus.evadeMod || 0) + (player.cyberBonus.evadeBonus || 0);
  const log = {
    type: 'player_evade',
    message: `${player.name}は回避態勢をとった（回避+${evadeBonus}）`,
  };

  let newPlayers = state.players.map((p, i) =>
    i === state.activePlayerIndex ? { ...p, _evadeBonus: evadeBonus } : p
  );

  let newState = { ...state, players: newPlayers, log: [...state.log, log] };
  newState = advanceCoopTurn(newState);
  return { state: newState };
}

// 協力戦闘: プレイヤー回復
export function coopPlayerHeal(state) {
  const player = state.players[state.activePlayerIndex];
  if (!player || !player.alive) return { state, result: { success: false, message: '行動不能' } };

  if (player.beliefPoints <= 0) {
    return { state, result: { success: false, message: '信念ポイントが足りない' } };
  }
  if (player.healUsesLeft <= 0) {
    return { state, result: { success: false, message: '回復回数の上限に達した' } };
  }

  const healAmount = 3 + (player.bgBonus.healBonus || 0);
  const newHp = Math.min(player.hp + healAmount, player.maxHp);
  const actualHeal = newHp - player.hp;

  const log = {
    type: 'player_heal',
    message: `${player.name}が信念を燃やしてHP${actualHeal}回復`,
  };

  let newPlayers = state.players.map((p, i) =>
    i === state.activePlayerIndex ? {
      ...p,
      hp: newHp,
      beliefPoints: p.beliefPoints - 1,
      healUsesLeft: p.healUsesLeft - 1,
    } : p
  );

  let newState = { ...state, players: newPlayers, log: [...state.log, log] };
  newState = advanceCoopTurn(newState);
  return { state: newState, result: { success: true, message: log.message } };
}

// 協力戦闘: 敵ターン処理
export function processCoopEnemyTurn(state) {
  let newState = { ...state };

  for (const enemy of newState.enemies) {
    if (enemy.hp <= 0) continue;

    const action = selectEnemyAction(enemy, newState);

    if (action.type === 'attack') {
      // ヘイト制でターゲット選択（ヘイト高い＋ランダム）
      const alivePlayers = newState.players.filter(p => p.alive);
      if (alivePlayers.length === 0) break;

      let target;
      const useHate = Math.random() < 0.6;
      if (useHate) {
        target = alivePlayers.reduce((max, p) => p.hate > max.hate ? p : max, alivePlayers[0]);
      } else {
        target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
      }

      const targetIdx = newState.players.findIndex(p => p.id === target.id);
      const evadeBonus = target._evadeBonus || 0;
      const playerDef = target.defense || 0;

      const enemyDice = enemy.attack >= 4 ? 2 : 1;
      const rolls = [];
      for (let i = 0; i < enemyDice; i++) rolls.push(Math.floor(Math.random() * 6) + 1);
      const attackRoll = Math.max(...rolls) + enemy.attack;

      const defenseRoll = resolveCheck(target.rank_haya, evadeBonus, attackRoll);

      if (defenseRoll.success) {
        const log = { type: 'enemy_attack_miss', enemy: enemy.name, message: `${target.name}が${enemy.name}の攻撃を回避した` };
        newState = { ...newState, log: [...newState.log, log] };
      } else {
        const rawDamage = Math.max(enemy.attack + 1 - playerDef, 1);
        const damage = evadeBonus > 0 ? Math.max(Math.ceil(rawDamage / 2), 1) : rawDamage;
        const newHp = Math.max(target.hp - damage, 0);

        const log = {
          type: 'enemy_attack_hit',
          enemy: enemy.name,
          damage,
          message: `${enemy.name}の攻撃が${target.name}に命中！ ${damage}ダメージ`,
        };

        let newPlayers = newState.players.map((p, i) =>
          i === targetIdx ? { ...p, hp: newHp, alive: newHp > 0 } : p
        );

        newState = {
          ...newState,
          players: newPlayers,
          totalDamageTaken: newState.totalDamageTaken + damage,
          log: [...newState.log, log],
        };

        if (newHp <= 0) {
          newState.log = [...newState.log, { type: 'system', message: `${target.name}が戦闘不能になった！` }];
        } else if (newHp <= target.maxHp * 0.3) {
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

  // 回避ボーナスをリセット
  let newPlayers = newState.players.map(p => {
    const { _evadeBonus, ...rest } = p;
    return rest;
  });
  newState = { ...newState, players: newPlayers };

  // 全滅チェック
  const allDead = newState.players.every(p => !p.alive);
  if (allDead) {
    newState = { ...newState, phase: PHASE.DEFEAT };
    newState.log = [...newState.log, { type: 'result', message: '全員が戦闘不能…… 討伐失敗' }];
    return newState;
  }

  newState = { ...newState, phase: PHASE.ROUND_END };
  return newState;
}

// 協力戦闘: ターン送り
function advanceCoopTurn(state) {
  // 次の生存プレイヤーを探す
  let nextIdx = state.activePlayerIndex + 1;
  while (nextIdx < state.players.length && !state.players[nextIdx].alive) {
    nextIdx++;
  }

  if (nextIdx >= state.players.length) {
    // 全プレイヤーが行動完了 → 敵ターン
    return { ...state, phase: PHASE.ENEMY_TURN, activePlayerIndex: 0 };
  }

  return { ...state, activePlayerIndex: nextIdx };
}

// 協力戦闘: ラウンド終了
export function endCoopRound(state) {
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

export { PHASE };
