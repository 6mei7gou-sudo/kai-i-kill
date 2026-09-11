// ゲーム結果保存・取得API
//
// 2026-09-11 レビュー F03 対応：
// - 結果の保存は自分のキャラクターに限る
// - ミッション／シナリオはサーバーのデータ定義に実在するものだけを受け付け、
//   難易度・名称・エンディング種別・実績はクライアントの申告ではなく定義から決める
// - CP報酬は定義上の難易度／エンディング種別から計算する
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabaseServer';
import { awardCp, MISSION_CP, ADV_CP } from '@/lib/cpService';
import { getMissionById } from '@/data/missions';
import { getScenarioById } from '@/data/scenarios';

const VALID_TABLES = ['mission_results', 'adv_completions', 'character_achievements'];
const WRITABLE_TABLES = ['mission_results', 'adv_completions'];
const MISSION_RESULTS = ['勝利', '敗北', '撤退'];

function toInt(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

function toJsonArray(v) {
  return Array.isArray(v) ? v : [];
}

/** シナリオ定義からエンディングノードを探す */
function findEndingNode(scenario, endingId) {
  const nodes = scenario?.nodes || {};
  return Object.values(nodes).find(n => n && n.type === 'ending' && n.ending_id === endingId) || null;
}

// GET: 戦績取得（自分の記録のみ）
export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');
    const characterId = searchParams.get('character_id');

    if (!VALID_TABLES.includes(table)) {
      return NextResponse.json({ error: '不正なテーブル名' }, { status: 400 });
    }

    let query = supabase.from(table).select('*').eq('user_id', userId).order('created_at', { ascending: false });
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

    if (!WRITABLE_TABLES.includes(table)) {
      return NextResponse.json({ error: '不正なテーブル名' }, { status: 400 });
    }
    if (!data || typeof data !== 'object' || !data.character_id) {
      return NextResponse.json({ error: 'character_id は必須です' }, { status: 400 });
    }

    // キャラクターの所有権チェック
    const { data: char, error: charErr } = await supabase
      .from('character_sheets')
      .select('id, user_id')
      .eq('id', data.character_id)
      .maybeSingle();
    if (charErr) throw charErr;
    if (!char || char.user_id !== userId) {
      return NextResponse.json({ error: '自分のキャラクターの結果のみ保存できます' }, { status: 403 });
    }

    let payload;
    let achievements = [];
    let cpToAward = 0;
    let cpDescription = '';

    if (table === 'mission_results') {
      const mission = getMissionById(data.mission_id);
      if (!mission) {
        return NextResponse.json({ error: '存在しないミッションです' }, { status: 400 });
      }
      if (!MISSION_RESULTS.includes(data.result)) {
        return NextResponse.json({ error: '不正な結果です' }, { status: 400 });
      }
      payload = {
        user_id: userId,
        character_id: data.character_id,
        mission_id: mission.id,
        mission_name: mission.name,
        difficulty: mission.difficulty,
        result: data.result,
        rounds_taken: toInt(data.rounds_taken),
        total_damage_dealt: toInt(data.total_damage_dealt),
        total_damage_taken: toInt(data.total_damage_taken),
        remaining_hp: toInt(data.remaining_hp),
        battle_log: toJsonArray(data.battle_log),
        resonance_snapshot: (data.resonance_snapshot && typeof data.resonance_snapshot === 'object') ? data.resonance_snapshot : {},
      };
      if (data.result === '勝利') {
        achievements = (mission.achievements || []).map(a => ({ ...a, type: a.type || 'mission' }));
        cpToAward = MISSION_CP[mission.difficulty] || 0;
        cpDescription = `ミッション「${mission.name}」(${mission.difficulty}) 勝利`;
      }
    } else {
      const scenario = getScenarioById(data.scenario_id);
      if (!scenario) {
        return NextResponse.json({ error: '存在しないシナリオです' }, { status: 400 });
      }
      const ending = findEndingNode(scenario, data.ending_id);
      if (!ending) {
        return NextResponse.json({ error: '存在しないエンディングです' }, { status: 400 });
      }

      // ADV完了の重複チェック
      const { data: existing } = await supabase
        .from('adv_completions')
        .select('id')
        .eq('user_id', userId)
        .eq('character_id', data.character_id)
        .eq('scenario_id', scenario.id)
        .maybeSingle();
      if (existing) {
        return NextResponse.json(
          { error: 'このキャラクターは既にこのシナリオをクリア済みです' },
          { status: 409 }
        );
      }

      payload = {
        user_id: userId,
        character_id: data.character_id,
        scenario_id: scenario.id,
        scenario_name: scenario.name,
        ending_id: ending.ending_id,
        ending_name: ending.ending_name,
        ending_type: ending.ending_type,
        choices_made: toJsonArray(data.choices_made),
        dice_results: toJsonArray(data.dice_results),
        achievements: toJsonArray(ending.achievements),
      };
      achievements = (ending.achievements || []).map(a => ({ ...a, type: a.type || 'adv' }));
      cpToAward = ADV_CP[ending.ending_type] || 0;
      cpDescription = `怪異譚「${scenario.name}」クリア (${ending.ending_type})`;
    }

    const { data: result, error } = await supabase
      .from(table)
      .insert([payload])
      .select()
      .single();

    if (error) {
      // 一意制約違反（同時送信の重複）
      if (error.code === '23505') {
        return NextResponse.json({ error: 'この結果は既に保存されています' }, { status: 409 });
      }
      throw error;
    }

    // 実績を保存（定義に含まれるもののみ）
    for (const ach of achievements) {
      await supabase
        .from('character_achievements')
        .upsert({
          user_id: userId,
          character_id: data.character_id,
          achievement_id: ach.id,
          achievement_name: ach.name,
          achievement_type: ach.type,
          source_id: payload.mission_id || payload.scenario_id || null,
        }, { onConflict: 'character_id,achievement_id' });
    }

    // CP報酬の付与
    let cpAwarded = 0;
    if (cpToAward > 0) {
      try {
        await awardCp(supabase, userId, cpToAward, table === 'mission_results' ? 'mission' : 'adv', result.id, cpDescription);
        cpAwarded = cpToAward;
      } catch (_) { /* CP付与失敗はゲーム結果保存に影響させない */ }
    }

    return NextResponse.json({ ok: true, data: result, cpAwarded });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
