// アカウントCP（カスタマイズポイント）共通サービス
// サーバーサイドAPIルートから import して使う

// CP報酬定数（2026-05-02：レベル20拡張に合わせて約1.5倍に増額・難易度緩和）
export const MISSION_CP = { E: 2, D: 3, C: 5, B: 8, A: 12, S: 18 };
export const ADV_CP = { bad: 2, normal: 3, good: 5, true: 8 };
export const DISPATCH_CP = { D: 2, C: 3, B: 5, A: 8, S: 12 };
const INITIAL_CP = 10;

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
    .single();

  if (insertErr) {
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

/**
 * CPを付与する（正の値）
 * @returns {{ balance: number, awarded: number }}
 */
export async function awardCp(supabase, userId, amount, sourceType, sourceId, description) {
  if (amount <= 0) throw new Error('付与CPは正の値が必要です');

  const account = await ensureAccount(supabase, userId);
  const newBalance = account.balance + amount;

  await supabase
    .from('account_cp')
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  await supabase.from('cp_transactions').insert({
    user_id: userId,
    amount,
    balance_after: newBalance,
    source_type: sourceType,
    source_id: sourceId || null,
    description,
  });

  return { balance: newBalance, awarded: amount };
}

/**
 * CPを消費する（残高不足ならエラー）
 * @returns {{ balance: number, deducted: number }}
 */
export async function deductCp(supabase, userId, amount, sourceId, description) {
  if (amount <= 0) throw new Error('消費CPは正の値が必要です');

  const account = await ensureAccount(supabase, userId);
  if (account.balance < amount) {
    throw new Error(`CP不足です（残高: ${account.balance}CP、必要: ${amount}CP）`);
  }

  const newBalance = account.balance - amount;

  await supabase
    .from('account_cp')
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  await supabase.from('cp_transactions').insert({
    user_id: userId,
    amount: -amount,
    balance_after: newBalance,
    source_type: 'gear_craft',
    source_id: sourceId || null,
    description,
  });

  return { balance: newBalance, deducted: amount };
}
