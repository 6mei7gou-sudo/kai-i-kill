// 派遣クエスト API — 開始(POST)・状況確認(GET)・完了処理(PATCH)
//
// 2026-09-11 レビュー F06 対応：
// - クエスト内容（名称・所要時間・推奨ランク・報酬）はサーバーのデータ定義から決める
// - 完了はサーバー時刻で判定し、成功判定・報酬計算もサーバーで行う
// - 「未完了 → 完了」への更新は条件付きで1回だけ成立させ、二重の報酬付与を防ぐ
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabaseServer';
import { awardCp, DISPATCH_CP } from '@/lib/cpService';
import { calcDispatchSuccessRate, isDispatchDue } from '@/lib/dispatchCalc';
import { getDispatchById } from '@/data/dispatches';

// GET: 派遣状況取得（自分の派遣のみ）
export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active'); // 'true' で進行中のみ

    let query = supabase
      .from('dispatch_quests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

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
    const { character_id, quest_id } = body;

    if (!character_id || !quest_id) {
      return NextResponse.json({ error: '必須パラメータが不足しています' }, { status: 400 });
    }

    const quest = getDispatchById(quest_id);
    if (!quest) {
      return NextResponse.json({ error: '存在しない派遣クエストです' }, { status: 400 });
    }

    // キャラクターの所有権チェック
    const { data: char, error: charErr } = await supabase
      .from('character_sheets')
      .select('id, user_id')
      .eq('id', character_id)
      .maybeSingle();
    if (charErr) throw charErr;
    if (!char || char.user_id !== userId) {
      return NextResponse.json({ error: '自分のキャラクターのみ派遣できます' }, { status: 403 });
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
        quest_id: quest.id,
        quest_name: quest.name,
        duration_hours: quest.duration_hours,
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: 派遣完了処理（サーバーが完了時刻・成否・報酬を判定）
export async function PATCH(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { dispatch_id } = body;

    if (!dispatch_id) {
      return NextResponse.json({ error: '必須パラメータが不足しています' }, { status: 400 });
    }

    // 派遣レコードの取得（自分のもののみ）
    const { data: dispatch, error: fetchErr } = await supabase
      .from('dispatch_quests')
      .select('*')
      .eq('id', dispatch_id)
      .eq('user_id', userId)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!dispatch) {
      return NextResponse.json({ error: '派遣が見つかりません' }, { status: 404 });
    }
    if (dispatch.completed_at) {
      return NextResponse.json({ error: 'この派遣は既に完了しています' }, { status: 409 });
    }

    const startedAt = dispatch.started_at || dispatch.created_at;
    if (!isDispatchDue(startedAt, dispatch.duration_hours)) {
      return NextResponse.json({ error: '派遣はまだ完了していません' }, { status: 400 });
    }

    const quest = getDispatchById(dispatch.quest_id);
    const rank = quest?.recommended_rank || 'D';

    // 成功判定（サーバー側）
    const { data: char } = await supabase
      .from('character_sheets')
      .select('rank_tai, rank_haya, rank_shiki, rank_han, rank_shiya, rank_jutsu, rank_kon')
      .eq('id', dispatch.character_id)
      .maybeSingle();
    const rate = calcDispatchSuccessRate(char || {}, rank);
    const success = Math.random() * 100 < rate;
    const result = success ? '成功' : '失敗';
    const rewards = success && quest ? (quest.rewards || null) : null;

    // 未完了 → 完了 への更新を1回だけ成立させる
    const { data: updatedRows, error } = await supabase
      .from('dispatch_quests')
      .update({
        completed_at: new Date().toISOString(),
        result,
        rewards,
      })
      .eq('id', dispatch_id)
      .eq('user_id', userId)
      .is('completed_at', null)
      .select();

    if (error) throw error;
    const data = updatedRows?.[0];
    if (!data) {
      return NextResponse.json({ error: 'この派遣は既に完了しています' }, { status: 409 });
    }

    // 成功時に実績を保存（クエスト定義の実績のみ）。DBエラーは握りつぶさず応答に含める
    const achievementErrors = [];
    if (success && Array.isArray(rewards?.achievements)) {
      for (const ach of rewards.achievements) {
        const { error: achErr } = await supabase
          .from('character_achievements')
          .upsert({
            user_id: userId,
            character_id: data.character_id,
            achievement_id: ach.id,
            achievement_name: ach.name,
            achievement_type: ach.type || 'dispatch',
            source_id: data.quest_id,
          }, { onConflict: 'character_id,achievement_id' });
        if (achErr) {
          console.error('派遣実績の保存に失敗:', ach.id, achErr.message);
          achievementErrors.push({ id: ach.id, message: achErr.message });
        }
      }
    }

    // 成功時にCP報酬を付与（同一派遣IDへの付与は台帳の一意制約でも二重化を防ぐ）
    let cpAwarded = 0;
    if (success) {
      try {
        const cp = DISPATCH_CP[rank] || 0;
        if (cp > 0) {
          await awardCp(supabase, userId, cp, 'dispatch', data.id, `派遣「${data.quest_name}」(${rank}) 成功`);
          cpAwarded = cp;
        }
      } catch (_) { /* CP付与失敗は派遣結果に影響させない */ }
    }

    return NextResponse.json({ ok: true, data, cpAwarded, successRate: rate, achievementErrors });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
