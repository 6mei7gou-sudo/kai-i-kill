// SNSスレッドAPI — スレッド一覧取得・作成
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function hashPassword(password) {
    return createHash('sha256').update(password).digest('hex');
}

// GET: スレッド一覧（ピン留め優先・最終返信順）
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const layer = searchParams.get('layer');
        const category = searchParams.get('category');
        const cursor = searchParams.get('cursor');
        const limit = parseInt(searchParams.get('limit') || '20', 10);

        let query = supabase
            .from('sns_threads')
            .select('*')
            .order('is_pinned', { ascending: false })
            .order('last_replied_at', { ascending: false })
            .limit(limit);

        if (layer) {
            query = query.eq('layer', layer);
        }
        if (category) {
            query = query.eq('category', category);
        }
        if (cursor) {
            query = query.lt('last_replied_at', cursor);
        }

        const { data, error } = await query;
        if (error) throw error;

        // password_hash をクライアントに返さない
        const safeData = data.map(({ password_hash, ...rest }) => rest);

        const nextCursor = safeData.length === limit ? safeData[safeData.length - 1].last_replied_at : null;

        return NextResponse.json({ ok: true, data: safeData, nextCursor });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST: スレッド作成
export async function POST(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
        }

        const body = await request.json();
        const {
            character_id, layer, category, title, content,
            display_name, display_icon, affiliation,
            password, password_mode
        } = body;

        if (!title || !content || !layer) {
            return NextResponse.json({ error: 'title, content, layer は必須です' }, { status: 400 });
        }

        const payload = {
            user_id: userId,
            character_id,
            layer,
            category: category || 'general',
            title,
            content,
            display_name,
            display_icon,
            affiliation,
            last_replied_at: new Date().toISOString(),
            password_mode: (password && password_mode) ? password_mode : 'none',
            password_hash: password ? hashPassword(password) : null,
        };

        const { data, error } = await supabase
            .from('sns_threads')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;

        // password_hash をクライアントに返さない
        const { password_hash, ...safeData } = data;
        return NextResponse.json({ ok: true, data: safeData });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
