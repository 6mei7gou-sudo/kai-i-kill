// SNSいいねAPI — いいねのトグル操作
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// POST: いいねトグル（いいね済みなら解除、未いいねなら追加）
export async function POST(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
        }

        const body = await request.json();
        const { post_id, user_id } = body;

        if (!post_id || !user_id) {
            return NextResponse.json({ error: 'post_id と user_id は必須です' }, { status: 400 });
        }

        // 既存のいいねを確認
        const { data: existingLike, error: checkError } = await supabase
            .from('sns_likes')
            .select('id')
            .eq('post_id', post_id)
            .eq('user_id', user_id)
            .maybeSingle();

        if (checkError) throw checkError;

        let liked;

        if (existingLike) {
            // いいね解除
            const { error: deleteError } = await supabase
                .from('sns_likes')
                .delete()
                .eq('id', existingLike.id);

            if (deleteError) throw deleteError;

            // like_count をデクリメント
            const { error: updateError } = await supabase
                .from('sns_posts')
                .update({ like_count: supabase.raw('GREATEST(like_count - 1, 0)') })
                .eq('id', post_id);

            if (updateError) throw updateError;
            liked = false;
        } else {
            // いいね追加
            const { error: insertError } = await supabase
                .from('sns_likes')
                .insert([{ post_id, user_id }]);

            if (insertError) throw insertError;

            // like_count をインクリメント
            const { error: updateError } = await supabase
                .from('sns_posts')
                .update({ like_count: supabase.raw('like_count + 1') })
                .eq('id', post_id);

            if (updateError) throw updateError;
            liked = true;
        }

        return NextResponse.json({ ok: true, liked });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
