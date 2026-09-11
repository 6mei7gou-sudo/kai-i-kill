// シリアルコード引換API
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabaseServer';

// POST: シリアルコード引換
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const { code, character_id } = await request.json();
    if (!code || !character_id) {
      return NextResponse.json({ error: 'コードとキャラクターIDが必要です' }, { status: 400 });
    }

    // コードを検索
    const { data: serial, error: findErr } = await supabase
      .from('serial_codes')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .maybeSingle();

    if (findErr) throw findErr;
    if (!serial) {
      return NextResponse.json({ error: '無効なコードです' }, { status: 404 });
    }

    // 使用回数チェック
    if (serial.current_uses >= serial.max_uses) {
      return NextResponse.json({ error: 'このコードは使用上限に達しています' }, { status: 410 });
    }

    // 有効期限チェック
    if (serial.expires_at && new Date(serial.expires_at) < new Date()) {
      return NextResponse.json({ error: 'このコードは期限切れです' }, { status: 410 });
    }

    // キャラクターの所有権チェック
    const { data: char, error: charErr } = await supabase
      .from('character_sheets')
      .select('user_id')
      .eq('id', character_id)
      .single();

    if (charErr) throw charErr;
    if (char.user_id !== userId) {
      return NextResponse.json({ error: '自分のキャラクターのみ指定できます' }, { status: 403 });
    }

    // 既にこの称号を持っているかチェック
    const { data: existing } = await supabase
      .from('character_achievements')
      .select('id')
      .eq('character_id', character_id)
      .eq('achievement_id', serial.achievement_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'この称号は既に獲得済みです' }, { status: 409 });
    }

    // 使用回数を先に加算（読み取った回数と一致する場合のみ。同時使用で上限超過させない）
    const { data: usedRows, error: useErr } = await supabase
      .from('serial_codes')
      .update({ current_uses: serial.current_uses + 1 })
      .eq('id', serial.id)
      .eq('current_uses', serial.current_uses)
      .select('id');
    if (useErr) throw useErr;
    if (!usedRows || usedRows.length === 0) {
      return NextResponse.json({ error: 'コードの使用が競合しました。もう一度お試しください' }, { status: 409 });
    }

    // 称号を付与
    const { error: insertErr } = await supabase
      .from('character_achievements')
      .insert({
        user_id: userId,
        character_id,
        achievement_id: serial.achievement_id,
        achievement_name: serial.achievement_name,
        achievement_type: serial.achievement_type,
        source_id: `serial:${serial.code}`,
      });

    if (insertErr) {
      // 付与に失敗したら使用回数を戻す
      await supabase.from('serial_codes').update({ current_uses: serial.current_uses }).eq('id', serial.id);
      if (insertErr.code === '23505') {
        return NextResponse.json({ error: 'この称号は既に獲得済みです' }, { status: 409 });
      }
      throw insertErr;
    }

    return NextResponse.json({
      ok: true,
      achievement: { id: serial.achievement_id, name: serial.achievement_name },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
