// SNSいいねAPI — いいねのトグル操作
//
// 2026-09-11 レビュー F09 / F10 対応：
// - 実行者は認証済み userId のみ（リクエスト本文の user_id は使わない）
// - like_count の増減は DB トリガー（supabase/migration_security_hardening.sql）が行う
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabaseServer';

// POST: いいねトグル（いいね済みなら解除、未いいねなら追加）
export async function POST(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
        }

        const body = await request.json();
        const { post_id } = body;

        if (!post_id) {
            return NextResponse.json({ error: 'post_id は必須です' }, { status: 400 });
        }

        // 既存のいいねを確認（本人分のみ）
        const { data: existingLike, error: checkError } = await supabase
            .from('sns_likes')
            .select('id')
            .eq('post_id', post_id)
            .eq('user_id', userId)
            .maybeSingle();

        if (checkError) throw checkError;

        let liked;

        if (existingLike) {
            // いいね解除（本人の行のみ）
            const { error: deleteError } = await supabase
                .from('sns_likes')
                .delete()
                .eq('id', existingLike.id)
                .eq('user_id', userId);

            if (deleteError) throw deleteError;
            liked = false;
        } else {
            // いいね追加
            const { error: insertError } = await supabase
                .from('sns_likes')
                .insert([{ post_id, user_id: userId }]);

            // 一意制約違反（同時送信）は「いいね済み」として扱う
            if (insertError && insertError.code !== '23505') throw insertError;
            liked = true;
        }

        // 最新の件数を返す（トリガーで更新済み）
        const { data: post } = await supabase
            .from('sns_posts')
            .select('like_count')
            .eq('id', post_id)
            .maybeSingle();

        return NextResponse.json({ ok: true, liked, like_count: post?.like_count ?? null });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
