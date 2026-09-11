// アカウントCP API — 残高取得(GET) / 管理者によるCP調整(POST)
//
// 2026-09-11 レビュー F03 対応：クライアントが金額を指定して自分の残高を増やす経路を廃止した。
// CPの付与はサーバーが検証した完了イベント（/api/games, /api/games/dispatch）からのみ行い、
// 手動調整は管理者専用（対象ユーザーを指定）とする。
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabaseServer as supabase, ADMIN_IDS } from '@/lib/supabaseServer';
import { ensureAccount, adjustCp, CpInsufficientError } from '@/lib/cpService';

// GET: CP残高取得（アカウント未作成なら自動作成）
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const account = await ensureAccount(supabase, userId);

    // 直近の履歴も返す
    const { data: transactions } = await supabase
      .from('cp_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({
      ok: true,
      balance: account.balance,
      transactions: transactions || [],
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: CP調整（管理者専用）
// body: { target_user_id, amount（0以外の整数）, description }
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }
    if (!ADMIN_IDS.includes(userId)) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }

    const body = await request.json();
    const { target_user_id, amount, description } = body;

    if (!target_user_id || typeof target_user_id !== 'string') {
      return NextResponse.json({ error: 'target_user_id は必須です' }, { status: 400 });
    }
    if (!Number.isInteger(amount) || amount === 0) {
      return NextResponse.json({ error: 'amount は 0 以外の整数が必要です' }, { status: 400 });
    }

    const balance = await adjustCp(
      supabase, target_user_id, amount, 'admin', userId,
      description || `管理者によるCP調整（${amount > 0 ? '+' : ''}${amount}CP）`
    );

    return NextResponse.json({ ok: true, balance });
  } catch (err) {
    const status = err instanceof CpInsufficientError ? 400 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
