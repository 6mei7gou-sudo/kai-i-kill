// アカウントCP（カスタマイズポイント）共通サービス
// サーバーサイドAPIルートから import して使う
//
// 残高の更新は DB 関数 cp_adjust()（supabase/migration_security_hardening.sql）で
// 「条件付き UPDATE ＋ 履歴 INSERT」を1トランザクションとして行う（並行リクエストでの二重消費を防ぐ）。
// 関数が未適用の環境では、残高の比較更新（compare-and-swap）でフォールバックする。

// CP報酬定数（2026-05-02：レベル20拡張に合わせて約1.5倍に増額・難易度緩和）
export const MISSION_CP = { E: 2, D: 3, C: 5, B: 8, A: 12, S: 18 };
export const ADV_CP = { bad: 2, normal: 3, good: 5, true: 8 };
export const DISPATCH_CP = { D: 2, C: 3, B: 5, A: 8, S: 12 };
const INITIAL_CP = 10;
const CAS_RETRIES = 5;

export class CpInsufficientError extends Error {
  constructor(balance, required) {
    super(`CP不足です（残高: ${balance}CP、必要: ${required}CP）`);
    this.name = 'CpInsufficientError';
    this.balance = balance;
    this.required = required;
  }
}

/**
 * キャラ作成時の背景 × 装備分類によるCP補正
 * @returns {number} ボーナスCP（0 なら該当なし）
 */
export function calcBackgroundCpBonus(background, equipmentType) {
    if (background === '鋼の肉体' && (equipmentType === '武装型' || equipmentType === '半装身型')) return 4;
    if (background === 'ハッカー上がり' && equipmentType === '独立型') return 3;
    return 0;
}

/**
 * アカウントが存在しなければ初期残高10で作成する
 * @returns {{ user_id: string, balance: number }}
 */
export async function ensureAccount(supabase, userId) {
  const { data: existing } = await supabase
    .from('account_cp')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) return existing;

  // 新規作成（競合時は既存を返す）
  const { data: inserted, error: insertErr } = await supabase
    .from('account_cp')
    .upsert({ user_id: userId, balance: INITIAL_CP }, { onConflict: 'user_id', ignoreDuplicates: true })
    .select()
    .maybeSingle();

  if (insertErr || !inserted) {
    // upsert 競合時は再取得
    const { data: retry } = await supabase
      .from('account_cp')
      .select('*')
      .eq('user_id', userId)
      .single();
    return retry;
  }

  // 初期付与の履歴を記録
  await supabase.from('cp_transactions').insert({
    user_id: userId,
    amount: INITIAL_CP,
    balance_after: INITIAL_CP,
    source_type: 'initial',
    description: '初期CP付与',
  });

  return inserted;
}

/**
 * CP残高を取得（アカウント未作成なら自動作成）
 * @returns {number}
 */
export async function getBalance(supabase, userId) {
  const account = await ensureAccount(supabase, userId);
  return account.balance;
}

// RPC が存在しない（マイグレーション未適用）ことを示すエラーか
function isMissingRpc(error) {
  if (!error) return false;
  const code = error.code || '';
  const msg = String(error.message || '');
  return code === 'PGRST202' || code === '42883' || /could not find the function|does not exist/i.test(msg);
}

/**
 * 残高を amount だけ増減し、履歴を記録する（原子的）
 * @returns {number} 更新後の残高
 */
export async function adjustCp(supabase, userId, amount, sourceType, sourceId, description) {
  if (!Number.isInteger(amount) || amount === 0) throw new Error('CPの増減量が不正です');

  // 1) DB 関数（推奨）
  const { data: rpcBalance, error: rpcErr } = await supabase.rpc('cp_adjust', {
    p_user_id: userId,
    p_amount: amount,
    p_source_type: sourceType,
    p_source_id: sourceId || null,
    p_description: description || null,
  });

  if (!rpcErr) return rpcBalance;
  if (/CP_INSUFFICIENT/.test(String(rpcErr.message))) {
    const balance = await getBalance(supabase, userId);
    throw new CpInsufficientError(balance, -amount);
  }
  if (!isMissingRpc(rpcErr)) throw new Error(rpcErr.message || 'CP更新に失敗しました');

  // 2) フォールバック：残高の比較更新（compare-and-swap）
  for (let attempt = 0; attempt < CAS_RETRIES; attempt++) {
    const account = await ensureAccount(supabase, userId);
    const current = account.balance;
    if (current + amount < 0) throw new CpInsufficientError(current, -amount);
    const newBalance = current + amount;

    const { data: updated, error: updErr } = await supabase
      .from('account_cp')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('balance', current)
      .select('balance');

    if (updErr) throw new Error(updErr.message);
    if (!updated || updated.length === 0) continue; // 競合 → 再試行

    const { error: txErr } = await supabase.from('cp_transactions').insert({
      user_id: userId,
      amount,
      balance_after: newBalance,
      source_type: sourceType,
      source_id: sourceId || null,
      description,
    });
    if (txErr) throw new Error(txErr.message);
    return newBalance;
  }
  throw new Error('CP残高の更新が競合しました。再試行してください');
}

/**
 * CPを付与する（正の値）
 * @returns {{ balance: number, awarded: number }}
 */
export async function awardCp(supabase, userId, amount, sourceType, sourceId, description) {
  if (!(amount > 0)) throw new Error('付与CPは正の値が必要です');
  const balance = await adjustCp(supabase, userId, Math.floor(amount), sourceType, sourceId, description);
  return { balance, awarded: amount };
}

/**
 * CPを消費する（残高不足ならエラー）
 * @returns {{ balance: number, deducted: number }}
 */
export async function deductCp(supabase, userId, amount, sourceId, description, sourceType = 'gear_craft') {
  if (!(amount > 0)) throw new Error('消費CPは正の値が必要です');
  const balance = await adjustCp(supabase, userId, -Math.floor(amount), sourceType, sourceId, description);
  return { balance, deducted: amount };
}

/**
 * 特定の装備に対して実際に支払われている純CP（支払い − 返還）を台帳から求める
 * 返還額の上限に使う（未払いの装備から返還を受け取れないようにする）
 * @returns {number}
 */
export async function getNetPaidForSource(supabase, userId, sourceId) {
  const { data } = await supabase
    .from('cp_transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('source_type', 'gear_craft')
    .eq('source_id', String(sourceId));
  const net = (data || []).reduce((sum, t) => sum - (t.amount || 0), 0);
  return Math.max(0, net);
}
