// 称号設定API
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// PATCH: 称号を設定
export async function PATCH(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const { character_id, active_title } = await request.json();
    if (!character_id) {
      return NextResponse.json({ error: 'キャラクターIDが必要です' }, { status: 400 });
    }

    // 所有権チェック
    const { data: char, error: charErr } = await supabase
      .from('character_sheets')
      .select('user_id')
      .eq('id', character_id)
      .single();

    if (charErr) throw charErr;
    if (char.user_id !== userId) {
      return NextResponse.json({ error: '自分のキャラクターのみ変更できます' }, { status: 403 });
    }

    // active_title が null/空文字なら解除、それ以外なら設定
    const titleValue = active_title || null;

    const { error: updateErr } = await supabase
      .from('character_sheets')
      .update({ active_title: titleValue })
      .eq('id', character_id);

    if (updateErr) throw updateErr;

    return NextResponse.json({ ok: true, active_title: titleValue });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
