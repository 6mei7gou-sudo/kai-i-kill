// SNSボット投稿API — 管理者のみがボット投稿を作成可能
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ADMIN_IDS = (process.env.NEXT_PUBLIC_ADMIN_USER_IDS || '').split(',').filter(Boolean);

// POST: ボット投稿作成（管理者のみ）
export async function POST(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
        }

        if (!ADMIN_IDS.includes(userId)) {
            return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
        }

        const body = await request.json();
        const {
            bot_id, layer, post_type, content,
            display_name, display_icon, affiliation, hashtags
        } = body;

        if (!content || !layer || !bot_id) {
            return NextResponse.json({ error: 'bot_id, content, layer は必須です' }, { status: 400 });
        }

        const payload = {
            user_id: userId,
            bot_id,
            layer,
            post_type: post_type || 'normal',
            content,
            display_name,
            display_icon,
            affiliation,
            hashtags: hashtags || [],
            is_bot: true,
        };

        const { data, error } = await supabase
            .from('sns_posts')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ ok: true, data });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
