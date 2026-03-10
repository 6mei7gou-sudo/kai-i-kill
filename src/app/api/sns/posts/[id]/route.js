// SNS個別投稿API — 投稿詳細取得・編集
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET: 個別投稿 + リプライ一覧
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        // 投稿本体を取得
        const { data: post, error: postError } = await supabase
            .from('sns_posts')
            .select('*')
            .eq('id', id)
            .single();

        if (postError) throw postError;
        if (!post) {
            return NextResponse.json({ error: '投稿が見つかりません' }, { status: 404 });
        }

        // リプライを取得（時系列順）
        const { data: replies, error: repliesError } = await supabase
            .from('sns_posts')
            .select('*')
            .eq('parent_id', id)
            .order('created_at', { ascending: true });

        if (repliesError) throw repliesError;

        return NextResponse.json({ ok: true, data: { post, replies } });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PATCH: 投稿内容を編集（自分の投稿のみ）
export async function PATCH(request, { params }) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { content } = body;

        if (!content) {
            return NextResponse.json({ error: 'content は必須です' }, { status: 400 });
        }

        // 所有権チェック
        const { data: existing, error: fetchError } = await supabase
            .from('sns_posts')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;
        if (existing.user_id !== userId) {
            return NextResponse.json({ error: '自分の投稿のみ編集できます' }, { status: 403 });
        }

        const { data, error } = await supabase
            .from('sns_posts')
            .update({ content, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ ok: true, data });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
