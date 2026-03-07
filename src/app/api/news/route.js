// News API — 管理者のみ投稿・編集・削除可能、閲覧は全員可
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ADMIN_IDS = (process.env.NEXT_PUBLIC_ADMIN_USER_IDS || '').split(',').filter(Boolean);

// GET: ニュース一覧取得
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') || '20', 10);

        let query = supabase
            .from('news_posts')
            .select('*')
            .eq('published', true)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (category) query = query.eq('category', category);

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json({ data });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST: ニュース投稿（管理者のみ）
export async function POST(request) {
    try {
        const { userId } = await auth();
        if (!userId || !ADMIN_IDS.includes(userId)) {
            return NextResponse.json({ error: '権限がありません' }, { status: 403 });
        }

        const body = await request.json();
        const { title, body: content, category, author_name } = body;

        if (!title) {
            return NextResponse.json({ error: 'タイトルは必須です' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('news_posts')
            .insert({
                title,
                body: content || '',
                category: category || 'news',
                author_id: userId,
                author_name: author_name || 'SYSTEM',
                published: true,
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ data }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE: ニュース削除（管理者のみ）
export async function DELETE(request) {
    try {
        const { userId } = await auth();
        if (!userId || !ADMIN_IDS.includes(userId)) {
            return NextResponse.json({ error: '権限がありません' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'IDが必要です' }, { status: 400 });

        const { error } = await supabase.from('news_posts').delete().eq('id', id);
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
