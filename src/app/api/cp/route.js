// アカウントCP API — 残高取得(GET) / CP増減(POST)
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ensureAccount, awardCp, deductCp } from '@/lib/cpService';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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

// POST: CP増減
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, source_type, source_id, description } = body;

    if (typeof amount !== 'number' || amount === 0) {
      return NextResponse.json({ error: 'amount は 0 以外の数値が必要です' }, { status: 400 });
    }

    const validTypes = ['mission', 'adv', 'dispatch', 'gear_craft', 'serial_code', 'admin', 'initial'];
    if (!validTypes.includes(source_type)) {
      return NextResponse.json({ error: '不正な source_type です' }, { status: 400 });
    }

    let result;
    if (amount > 0) {
      result = await awardCp(supabase, userId, amount, source_type, source_id, description);
    } else {
      result = await deductCp(supabase, userId, Math.abs(amount), source_id, description);
    }

    return NextResponse.json({ ok: true, balance: result.balance });
  } catch (err) {
    const status = err.message.includes('CP不足') ? 400 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
