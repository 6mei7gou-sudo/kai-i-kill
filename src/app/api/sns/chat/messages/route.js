// SNSチャットメッセージAPI — メッセージ取得・送信
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET: ルーム内メッセージ取得（カーソルページネーション）
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get('room_id');
        const cursor = searchParams.get('cursor');
        const limit = parseInt(searchParams.get('limit') || '50', 10);

        if (!roomId) {
            return NextResponse.json({ error: 'room_id は必須です' }, { status: 400 });
        }

        let query = supabase
            .from('sns_chat_messages')
            .select('*')
            .eq('room_id', roomId)
            .order('created_at', { ascending: true })
            .limit(limit);

        if (cursor) {
            query = query.gt('created_at', cursor);
        }

        const { data, error } = await query;
        if (error) throw error;

        const nextCursor = data.length === limit ? data[data.length - 1].created_at : null;

        return NextResponse.json({ ok: true, data, nextCursor });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST: メッセージ送信
export async function POST(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
        }

        const body = await request.json();
        const { room_id, character_id, content, display_name, display_icon } = body;

        if (!room_id || !content) {
            return NextResponse.json({ error: 'room_id と content は必須です' }, { status: 400 });
        }

        // ルームがアクティブか確認
        const { data: room, error: roomError } = await supabase
            .from('sns_chat_rooms')
            .select('is_active')
            .eq('id', room_id)
            .single();

        if (roomError) throw roomError;
        if (!room || !room.is_active) {
            return NextResponse.json({ error: 'このルームは閉鎖されています' }, { status: 403 });
        }

        // ユーザーがルームのメンバーか確認
        const { data: membership, error: memberError } = await supabase
            .from('sns_chat_members')
            .select('id')
            .eq('room_id', room_id)
            .eq('user_id', userId)
            .maybeSingle();

        if (memberError) throw memberError;
        if (!membership) {
            return NextResponse.json({ error: 'このルームのメンバーではありません' }, { status: 403 });
        }

        const payload = {
            room_id,
            user_id: userId,
            character_id: character_id || null,
            content,
            display_name,
            display_icon,
        };

        const { data, error } = await supabase
            .from('sns_chat_messages')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ ok: true, data });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
