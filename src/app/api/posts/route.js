// 投稿API — サーバーサイドでClerk認証を検証してSupabaseに書き込む
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { awardCp, deductCp, calcBackgroundCpBonus } from '@/lib/cpService';

// サーバーサイド用Supabaseクライアント（anon keyで接続、RLSは全許可設定のため）
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 管理者IDリスト
const ADMIN_IDS = (process.env.NEXT_PUBLIC_ADMIN_USER_IDS || '').split(',').filter(Boolean);

// GET: 投稿一覧取得（tableとuser_idでフィルタ可）
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const table = searchParams.get('table');
        const userId = searchParams.get('user_id');

        if (!['anomaly_drafts', 'gear_posts', 'character_sheets'].includes(table)) {
            return NextResponse.json({ error: '不正なテーブル名' }, { status: 400 });
        }

        let query = supabase.from(table).select('*').order('created_at', { ascending: false });
        if (userId) query = query.eq('user_id', userId);

        const { data, error } = await query;
        if (error) throw error;
        return NextResponse.json({ ok: true, data });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

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

        // キャラ作成時：背景×装備分類のCP補正をアカウントに付与
        let cpAwarded = 0;
        if (table === 'character_sheets') {
            try {
                const bonus = calcBackgroundCpBonus(data.background, data.equipment_type);
                if (bonus > 0) {
                    await awardCp(supabase, userId, bonus, 'initial', result.id,
                        `キャラ「${data.character_name}」作成ボーナス（背景「${data.background}」+${bonus}CP）`);
                    cpAwarded = bonus;
                }
            } catch (_) { /* CP付与失敗はキャラ作成に影響させない */ }
        }

        // 武器投稿時：CPをアカウントから消費（管理者は免除）
        let cpDeducted = 0;
        if (table === 'gear_posts' && result.total_cp > 0 && !ADMIN_IDS.includes(userId)) {
            try {
                await deductCp(supabase, userId, result.total_cp, result.id,
                    `装備「${result.gear_name}」の製作（${result.total_cp}CP）`);
                cpDeducted = result.total_cp;
            } catch (_) { /* CP不足でも投稿自体は通す */ }
        }

        return NextResponse.json({ ok: true, data: result, cpAwarded, cpDeducted });
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

        // 所有権チェック（gear_postsの場合はtotal_cpも取得して差分計算に使う）
        const selectCols = table === 'gear_posts' ? 'user_id, total_cp' : 'user_id';
        const { data: existing, error: fetchError } = await supabase
            .from(table).select(selectCols).eq('id', id).single();
        if (fetchError) throw fetchError;
        if (existing.user_id !== userId && !ADMIN_IDS.includes(userId)) {
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

        // 武器編集時：CPの差分を消費/返還（管理者は免除）
        let cpDelta = 0;
        if (table === 'gear_posts' && typeof result.total_cp === 'number' && !ADMIN_IDS.includes(userId)) {
            const oldCp = existing.total_cp || 0;
            const diff = result.total_cp - oldCp;
            if (diff !== 0) {
                try {
                    if (diff > 0) {
                        await deductCp(supabase, userId, diff, id,
                            `装備「${result.gear_name}」の改修（+${diff}CP）`);
                    } else {
                        await awardCp(supabase, userId, Math.abs(diff), 'gear_craft', id,
                            `装備「${result.gear_name}」の改修による返還（${Math.abs(diff)}CP）`);
                    }
                    cpDelta = diff;
                } catch (_) { /* CP処理失敗は更新に影響させない */ }
            }
        }

        return NextResponse.json({ ok: true, data: result, cpDelta });
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
        if (existing.user_id !== userId && !ADMIN_IDS.includes(userId)) {
            return NextResponse.json({ error: '自分の投稿のみ削除できます' }, { status: 403 });
        }

        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
        return NextResponse.json({ ok: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
