// SNSチャットルームAPI — ルーム一覧取得・作成
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabaseServer';

// GET: アクティブなルーム一覧
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const layer = searchParams.get('layer');

        let query = supabase
            .from('sns_chat_rooms')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (layer) {
            query = query.eq('layer', layer);
        }

        // 期限切れのルームを除外（expires_at が null または現在時刻より後）
        const now = new Date().toISOString();
        query = query.or(`expires_at.is.null,expires_at.gt.${now}`);

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json({ ok: true, data });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST: ルーム作成
export async function POST(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, layer, mission_id, max_members, expires_at, display_name, character_id } = body;

        if (!name || !layer) {
            return NextResponse.json({ error: 'name と layer は必須です' }, { status: 400 });
        }

        // 作成者の表示名（メンバー行の必須列）。未指定なら既定名
        const memberName = String(display_name || '').trim().slice(0, 100) || '名無しの討伐者';

        const payload = {
            name,
            description: description || null,
            layer,
            mission_id: mission_id || null,
            max_members: max_members || null,
            expires_at: expires_at || null,
            created_by: userId,
            is_active: true,
        };

        const { data: room, error: roomError } = await supabase
            .from('sns_chat_rooms')
            .insert([payload])
            .select()
            .single();

        if (roomError) throw roomError;

        // 作成者をメンバーとして追加（失敗したらルームを取り消す）
        const { error: memberError } = await supabase
            .from('sns_chat_members')
            .insert([{ room_id: room.id, user_id: userId, display_name: memberName, character_id: character_id || null }]);

        if (memberError) {
            await supabase.from('sns_chat_rooms').delete().eq('id', room.id);
            throw memberError;
        }

        return NextResponse.json({ ok: true, data: room });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
