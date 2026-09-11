// 派遣クエストの成功率計算（サーバー・クライアント共用）
// 成功判定そのものはサーバー（/api/games/dispatch PATCH）で行う。クライアントは表示用に使う。

export const RANK_ORDER = ['D', 'C', 'B', 'A', 'S'];
const RANK_FIELDS = ['rank_tai', 'rank_haya', 'rank_shiki', 'rank_han', 'rank_shiya', 'rank_jutsu', 'rank_kon'];

/**
 * キャラの最高属性ランクと推奨ランクの差から成功率（%）を返す
 * @param {object} character character_sheets 相当（rank_* を参照）
 * @param {string} recommendedRank 'D'〜'S'
 */
export function calcDispatchSuccessRate(character, recommendedRank) {
  const bestRank = RANK_FIELDS.reduce((best, attr) => {
    const r = character?.[attr] || 'D';
    return RANK_ORDER.indexOf(r) > RANK_ORDER.indexOf(best) ? r : best;
  }, 'D');

  const bestIdx = RANK_ORDER.indexOf(bestRank);
  const reqIdx = RANK_ORDER.indexOf(recommendedRank);
  const diff = bestIdx - reqIdx;

  if (diff >= 0) return 90;
  if (diff === -1) return 60;
  return 30;
}

/** 派遣の完了予定時刻（ミリ秒） */
export function dispatchEndsAt(startedAt, durationHours) {
  return new Date(startedAt).getTime() + Number(durationHours || 0) * 60 * 60 * 1000;
}

/** 派遣が完了時刻に達しているか */
export function isDispatchDue(startedAt, durationHours, now = Date.now()) {
  return dispatchEndsAt(startedAt, durationHours) <= now;
}
