// 投稿API — サーバーサイドでClerk認証を検証してSupabaseに書き込む
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// サーバーサイド用Supabaseクライアント（anon keyで接続、RLSは全許可設定のため）
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// POST: 新規投稿
export async function POST(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
        }

        const body = await request.json();
        const { table, data } = body;

        // テーブル名の検証
        if (!['anomaly_drafts', 'gear_posts', 'character_sheets'].includes(table)) {
            return NextResponse.json({ error: '不正なテーブル名' }, { status: 400 });
        }

        // user_idを自動セット
        const payload = { ...data, user_id: userId };

        const { data: result, error } = await supabase
            .from(table)
            .insert([payload])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ ok: true, data: result });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PATCH: 編集（自分の投稿のみ）
export async function PATCH(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
        }

        const body = await request.json();
        const { table, id, data } = body;

        if (!['anomaly_drafts', 'gear_posts', 'character_sheets'].includes(table)) {
            return NextResponse.json({ error: '不正なテーブル名' }, { status: 400 });
        }

        // 所有権チェック
        const { data: existing, error: fetchError } = await supabase
            .from(table).select('user_id').eq('id', id).single();
        if (fetchError) throw fetchError;
        if (existing.user_id !== userId) {
            return NextResponse.json({ error: '自分の投稿のみ編集できます' }, { status: 403 });
        }

        // 更新
        const { data: result, error } = await supabase
            .from(table)
            .update({ ...data, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ ok: true, data: result });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE: 削除（自分の投稿のみ）
export async function DELETE(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const table = searchParams.get('table');
        const id = searchParams.get('id');

        if (!['anomaly_drafts', 'gear_posts', 'character_sheets'].includes(table)) {
            return NextResponse.json({ error: '不正なテーブル名' }, { status: 400 });
        }

        // 所有権チェック
        const { data: existing, error: fetchError } = await supabase
            .from(table).select('user_id').eq('id', id).single();
        if (fetchError) throw fetchError;
        if (existing.user_id !== userId) {
            return NextResponse.json({ error: '自分の投稿のみ削除できます' }, { status: 403 });
        }

        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
        return NextResponse.json({ ok: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
