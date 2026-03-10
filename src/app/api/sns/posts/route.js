// SNS投稿API — タイムライン取得・投稿作成・削除
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET: タイムライン取得（カーソルページネーション）
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const layer = searchParams.get('layer');
        const cursor = searchParams.get('cursor');
        const limit = parseInt(searchParams.get('limit') || '20', 10);
        const parentId = searchParams.get('parent_id');

        let query = supabase
            .from('sns_posts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (layer) {
            query = query.eq('layer', layer);
        }
        if (cursor) {
            query = query.lt('created_at', cursor);
        }
        if (parentId) {
            query = query.eq('parent_id', parentId);
        } else {
            // トップレベル投稿のみ（リプライ除外）
            query = query.is('parent_id', null);
        }

        const { data, error } = await query;
        if (error) throw error;

        const nextCursor = data.length === limit ? data[data.length - 1].created_at : null;

        return NextResponse.json({ ok: true, data, nextCursor });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST: 新規投稿作成
export async function POST(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
        }

        const body = await request.json();
        const {
            character_id, layer, post_type, content,
            parent_id, display_name, display_icon,
            affiliation, hashtags
        } = body;

        if (!content || !layer) {
            return NextResponse.json({ error: 'content と layer は必須です' }, { status: 400 });
        }

        const payload = {
            user_id: userId,
            character_id,
            layer,
            post_type: post_type || 'normal',
            content,
            parent_id: parent_id || null,
            display_name,
            display_icon,
            affiliation,
            hashtags: hashtags || [],
        };

        const { data, error } = await supabase
            .from('sns_posts')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;

        // リプライの場合、親投稿の reply_count をインクリメント
        if (parent_id) {
            const { error: updateError } = await supabase.rpc('increment', {
                table_name: 'sns_posts',
                column_name: 'reply_count',
                row_id: parent_id,
            }).catch(() => null);

            // rpc が無い場合のフォールバック
            if (updateError) {
                await supabase
                    .from('sns_posts')
                    .update({ reply_count: supabase.raw('reply_count + 1') })
                    .eq('id', parent_id);
            }
        }

        return NextResponse.json({ ok: true, data });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE: 投稿削除（自分の投稿のみ）
export async function DELETE(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'id は必須です' }, { status: 400 });
        }

        // 所有権チェック
        const { data: existing, error: fetchError } = await supabase
            .from('sns_posts')
            .select('user_id, parent_id')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;
        if (existing.user_id !== userId) {
            return NextResponse.json({ error: '自分の投稿のみ削除できます' }, { status: 403 });
        }

        const { error } = await supabase.from('sns_posts').delete().eq('id', id);
        if (error) throw error;

        // リプライだった場合、親投稿の reply_count をデクリメント
        if (existing.parent_id) {
            await supabase.rpc('decrement', {
                table_name: 'sns_posts',
                column_name: 'reply_count',
                row_id: existing.parent_id,
            }).catch(async () => {
                await supabase
                    .from('sns_posts')
                    .update({ reply_count: supabase.raw('GREATEST(reply_count - 1, 0)') })
                    .eq('id', existing.parent_id);
            });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
