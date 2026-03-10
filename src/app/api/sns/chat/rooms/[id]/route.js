// SNSチャットルーム詳細API — ルーム詳細取得・閉鎖
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ADMIN_IDS = (process.env.NEXT_PUBLIC_ADMIN_USER_IDS || '').split(',').filter(Boolean);

// GET: ルーム詳細 + メンバー一覧
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        // ルーム本体を取得
        const { data: room, error: roomError } = await supabase
            .from('sns_chat_rooms')
            .select('*')
            .eq('id', id)
            .single();

        if (roomError) throw roomError;
        if (!room) {
            return NextResponse.json({ error: 'ルームが見つかりません' }, { status: 404 });
        }

        // メンバー一覧を取得
        const { data: members, error: membersError } = await supabase
            .from('sns_chat_members')
            .select('*')
            .eq('room_id', id);

        if (membersError) throw membersError;

        return NextResponse.json({ ok: true, data: { room, members } });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE: ルーム閉鎖（作成者または管理者のみ）
export async function DELETE(request, { params }) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
        }

        const { id } = await params;

        // ルームの存在確認と作成者チェック
        const { data: room, error: fetchError } = await supabase
            .from('sns_chat_rooms')
            .select('created_by')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;
        if (!room) {
            return NextResponse.json({ error: 'ルームが見つかりません' }, { status: 404 });
        }

        if (room.created_by !== userId && !ADMIN_IDS.includes(userId)) {
            return NextResponse.json({ error: '作成者または管理者のみ閉鎖できます' }, { status: 403 });
        }

        // is_active を false に設定（論理削除）
        const { error: updateError } = await supabase
            .from('sns_chat_rooms')
            .update({ is_active: false })
            .eq('id', id);

        if (updateError) throw updateError;

        return NextResponse.json({ ok: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
