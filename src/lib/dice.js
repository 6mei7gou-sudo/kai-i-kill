// ダイスロール共通ロジック — KAI-I//KILL TRPGダイスプールシステム

// ランク → ダイス数マッピング
const RANK_TO_DICE = {
  D: 1,
  C: 2,
  B: 3,
  A: 4,
  S: 4, // S = 4d6 + ボーナス
};

// ランク → HPボーナス
const RANK_TO_HP_BONUS = {
  D: 0,
  C: 2,
  B: 4,
  A: 6,
  S: 8,
};

// ランク順序（比較用）
const RANK_ORDER = { D: 0, C: 1, B: 2, A: 3, S: 4 };

// 1d6を振る
function rollD6() {
  return Math.floor(Math.random() * 6) + 1;
}

// ダイスプールを振る（ランク指定）
export function rollDicePool(rank) {
  const count = RANK_TO_DICE[rank] || 1;
  const dice = [];
  for (let i = 0; i < count; i++) {
    dice.push(rollD6());
  }
  return dice;
}

// 判定（ランク、修正値、難易度）
export function resolveCheck(rank, modifier = 0, difficulty = 4) {
  const dice = rollDicePool(rank);
  const bonus = rank === 'S' ? 2 : 0;
  const maxDie = Math.max(...dice) + bonus + modifier;

  const isSpecial = dice.filter(d => d === 6).length >= 2;
  const isFumble = dice.every(d => d === 1);

  let success;
  if (isFumble) {
    success = false;
  } else if (isSpecial) {
    success = true;
  } else {
    success = maxDie >= difficulty;
  }

  return {
    dice,
    bonus,
    modifier,
    maxDie,
    difficulty,
    success,
    isSpecial,
    isFumble,
  };
}

// ダメージ計算
export function calculateDamage(achievementValue, weaponMod = 0, defense = 0) {
  const raw = achievementValue + weaponMod - defense;
  return Math.max(raw, 0);
}

// HP計算（基本HP = 10 + 体ランクボーナス）
export function calculateHP(rankTai) {
  return 10 + (RANK_TO_HP_BONUS[rankTai] || 0);
}

// ランク比較（rankA >= rankB なら true）
export function isRankAtLeast(rankA, rankB) {
  return (RANK_ORDER[rankA] || 0) >= (RANK_ORDER[rankB] || 0);
}

// イニシアチブ判定（疾ランクでダイスを振り、最大値で比較）
export function rollInitiative(rankHaya) {
  const dice = rollDicePool(rankHaya);
  const bonus = rankHaya === 'S' ? 2 : 0;
  return Math.max(...dice) + bonus;
}

export { RANK_TO_DICE, RANK_TO_HP_BONUS, RANK_ORDER };
