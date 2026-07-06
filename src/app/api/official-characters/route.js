// 公式キャラクターAPI — 管理者のみ登録・編集・削除可能、公開分の閲覧は全員可
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ADMIN_IDS = (process.env.NEXT_PUBLIC_ADMIN_USER_IDS || '').split(',').filter(Boolean);

// GET: 公式キャラ一覧取得（?all=1 は管理者のみ・非公開も含む）
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const all = searchParams.get('all');

        let query = supabase
            .from('official_characters')
            .select('*')
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (all) {
            const { userId } = await auth();
            if (!userId) {
                return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
            }
            if (!ADMIN_IDS.includes(userId)) {
                return NextResponse.json({ error: '権限がありません' }, { status: 403 });
            }
        } else {
            query = query.eq('published', true);
        }

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json({ data });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST: 公式キャラ登録（管理者のみ）
export async function POST(request) {
    try {
        const { userId } = await auth();
        if (!userId || !ADMIN_IDS.includes(userId)) {
            return NextResponse.json({ error: '権限がありません' }, { status: 403 });
        }

        const body = await request.json();
        const name = (body.name || '').trim();

        if (!name) {
            return NextResponse.json({ error: '名前は必須です' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('official_characters')
            .insert({
                name,
                title: body.title || '',
                description: body.description || '',
                image_url: body.image_url || '',
                display_order: Number(body.display_order) || 0,
                published: body.published !== false,
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ data }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PATCH: 公式キャラ更新（管理者のみ）
export async function PATCH(request) {
    try {
        const { userId } = await auth();
        if (!userId || !ADMIN_IDS.includes(userId)) {
            return NextResponse.json({ error: '権限がありません' }, { status: 403 });
        }

        const body = await request.json();
        const { id } = body;
        if (!id) return NextResponse.json({ error: 'IDが必要です' }, { status: 400 });

        const updates = { updated_at: new Date().toISOString() };
        if (body.name !== undefined) {
            const name = (body.name || '').trim();
            if (!name) return NextResponse.json({ error: '名前は必須です' }, { status: 400 });
            updates.name = name;
        }
        if (body.title !== undefined) updates.title = body.title;
        if (body.description !== undefined) updates.description = body.description;
        if (body.image_url !== undefined) updates.image_url = body.image_url;
        if (body.display_order !== undefined) updates.display_order = Number(body.display_order) || 0;
        if (body.published !== undefined) updates.published = !!body.published;

        const { data, error } = await supabase
            .from('official_characters')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ data });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE: 公式キャラ削除（管理者のみ）
export async function DELETE(request) {
    try {
        const { userId } = await auth();
        if (!userId || !ADMIN_IDS.includes(userId)) {
            return NextResponse.json({ error: '権限がありません' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'IDが必要です' }, { status: 400 });

        const { error } = await supabase.from('official_characters').delete().eq('id', id);
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
