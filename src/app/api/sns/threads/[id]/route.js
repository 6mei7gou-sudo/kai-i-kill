// SNSスレッド詳細API — スレッド詳細取得・返信投稿・パスワード認証
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

// GET: スレッド詳細 + 返信一覧
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const password = searchParams.get('password');

        // スレッド本体を取得
        const { data: thread, error: threadError } = await supabase
            .from('sns_threads')
            .select('*')
            .eq('id', id)
            .single();

        if (threadError) throw threadError;
        if (!thread) {
            return NextResponse.json({ error: 'スレッドが見つかりません' }, { status: 404 });
        }

        // entry モード: パスワードが一致しなければ内容を返さない
        if (thread.password_mode === 'entry' && thread.password_hash) {
            if (!password || hashPassword(password) !== thread.password_hash) {
                const { password_hash, content, ...safeThread } = thread;
                return NextResponse.json({
                    ok: true,
                    data: {
                        thread: { ...safeThread, content: null },
                        replies: [],
                        locked: true,
                        password_mode: 'entry',
                    }
                });
            }
        }

        // 返信一覧を取得（時系列順）
        const { data: replies, error: repliesError } = await supabase
            .from('sns_thread_replies')
            .select('*')
            .eq('thread_id', id)
            .order('created_at', { ascending: true });

        if (repliesError) throw repliesError;

        const { password_hash, ...safeThread } = thread;
        return NextResponse.json({
            ok: true,
            data: {
                thread: safeThread,
                replies,
                locked: false,
                password_mode: thread.password_mode || 'none',
            }
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST: スレッドに返信
export async function POST(request, { params }) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { character_id, content, display_name, display_icon, affiliation, password } = body;

        if (!content) {
            return NextResponse.json({ error: 'content は必須です' }, { status: 400 });
        }

        // スレッドの存在確認 + パスワードチェック
        const { data: thread, error: threadError } = await supabase
            .from('sns_threads')
            .select('id, password_mode, password_hash')
            .eq('id', id)
            .single();

        if (threadError) throw threadError;
        if (!thread) {
            return NextResponse.json({ error: 'スレッドが見つかりません' }, { status: 404 });
        }

        // entry または write モード: パスワードが一致しなければ書き込み拒否
        if (thread.password_mode && thread.password_mode !== 'none' && thread.password_hash) {
            if (!password || hashPassword(password) !== thread.password_hash) {
                return NextResponse.json({ error: 'パスワードが違います' }, { status: 403 });
            }
        }

        const payload = {
            thread_id: id,
            user_id: userId,
            character_id,
            content,
            display_name,
            display_icon,
            affiliation,
        };

        const { data: reply, error: insertError } = await supabase
            .from('sns_thread_replies')
            .insert([payload])
            .select()
            .single();

        if (insertError) throw insertError;

        // スレッドの reply_count をインクリメント、last_replied_at を更新
        const now = new Date().toISOString();
        const { error: updateError } = await supabase.rpc('increment_thread_reply_count', {
            thread_id_input: id,
            new_last_replied_at: now,
        });

        // RPC未作成の場合はフォールバック（手動更新）
        if (updateError) {
            const { data: currentThread } = await supabase
                .from('sns_threads')
                .select('reply_count')
                .eq('id', id)
                .single();

            if (currentThread) {
                await supabase
                    .from('sns_threads')
                    .update({
                        reply_count: (currentThread.reply_count || 0) + 1,
                        last_replied_at: now,
                    })
                    .eq('id', id);
            }
        }

        return NextResponse.json({ ok: true, data: reply });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
