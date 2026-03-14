// 派遣クエスト API — 開始(POST)・状況確認(GET)・完了処理(PATCH)
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { awardCp, DISPATCH_CP } from '@/lib/cpService';
import dispatchQuests from '@/data/dispatches/dispatch_quests.json';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET: 派遣状況取得
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const active = searchParams.get('active'); // 'true' で進行中のみ

    let query = supabase
      .from('dispatch_quests')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) query = query.eq('user_id', userId);
    if (active === 'true') query = query.is('completed_at', null);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: 派遣開始
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { character_id, quest_id, quest_name, duration_hours } = body;

    if (!character_id || !quest_id || !quest_name || !duration_hours) {
      return NextResponse.json({ error: '必須パラメータが不足しています' }, { status: 400 });
    }

    // 既にこのキャラが派遣中かチェック
    const { data: active } = await supabase
      .from('dispatch_quests')
      .select('id')
      .eq('user_id', userId)
      .eq('character_id', character_id)
      .is('completed_at', null)
      .maybeSingle();

    if (active) {
      return NextResponse.json(
        { error: 'このキャラクターは既に派遣中です' },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from('dispatch_quests')
      .insert([{
        user_id: userId,
        character_id,
        quest_id,
        quest_name,
        duration_hours,
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: 派遣完了処理
export async function PATCH(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { dispatch_id, result, rewards } = body;

    if (!dispatch_id || !result) {
      return NextResponse.json({ error: '必須パラメータが不足しています' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('dispatch_quests')
      .update({
        completed_at: new Date().toISOString(),
        result,
        rewards,
      })
      .eq('id', dispatch_id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // 成功時に実績を保存
    if (result === '成功' && rewards?.achievements) {
      for (const ach of rewards.achievements) {
        await supabase
          .from('character_achievements')
          .upsert({
            user_id: userId,
            character_id: data.character_id,
            achievement_id: ach.id,
            achievement_name: ach.name,
            achievement_type: ach.type || 'dispatch',
            source_id: data.quest_id,
          }, { onConflict: 'character_id,achievement_id' });
      }
    }

    // 成功時にCP報酬を付与
    let cpAwarded = 0;
    if (result === '成功') {
      try {
        const quest = dispatchQuests.find(q => q.id === data.quest_id);
        const rank = quest?.recommended_rank;
        const cp = rank ? (DISPATCH_CP[rank] || 0) : 0;
        if (cp > 0) {
          await awardCp(supabase, userId, cp, 'dispatch', data.id, `派遣「${data.quest_name}」(${rank}) 成功`);
          cpAwarded = cp;
        }
      } catch (_) { /* CP付与失敗は派遣結果に影響させない */ }
    }

    return NextResponse.json({ ok: true, data, cpAwarded });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
