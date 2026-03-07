// ゲーム結果保存・取得API
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const VALID_TABLES = ['mission_results', 'adv_completions', 'character_achievements'];

// GET: 戦績取得
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');
    const userId = searchParams.get('user_id');
    const characterId = searchParams.get('character_id');

    if (!VALID_TABLES.includes(table)) {
      return NextResponse.json({ error: '不正なテーブル名' }, { status: 400 });
    }

    let query = supabase.from(table).select('*').order('created_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    if (characterId) query = query.eq('character_id', characterId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: 結果保存
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { table, data } = body;

    if (!VALID_TABLES.includes(table)) {
      return NextResponse.json({ error: '不正なテーブル名' }, { status: 400 });
    }

    const payload = { ...data, user_id: userId };

    // ADV完了の重複チェック
    if (table === 'adv_completions') {
      const { data: existing } = await supabase
        .from('adv_completions')
        .select('id')
        .eq('user_id', userId)
        .eq('character_id', data.character_id)
        .eq('scenario_id', data.scenario_id)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { error: 'このキャラクターは既にこのシナリオをクリア済みです' },
          { status: 409 }
        );
      }
    }

    const { data: result, error } = await supabase
      .from(table)
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    // 実績があれば保存
    if (data.achievements && Array.isArray(data.achievements)) {
      for (const ach of data.achievements) {
        await supabase
          .from('character_achievements')
          .upsert({
            user_id: userId,
            character_id: data.character_id,
            achievement_id: ach.id,
            achievement_name: ach.name,
            achievement_type: ach.type || 'mission',
            source_id: data.mission_id || data.scenario_id || null,
          }, { onConflict: 'character_id,achievement_id' });
      }
    }

    return NextResponse.json({ ok: true, data: result });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
