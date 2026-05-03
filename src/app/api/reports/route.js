// 通報API
// POST: 通報を作成（ログイン必須）
// GET:  通報一覧取得（管理者のみ）
// PATCH: 通報のステータス変更（管理者のみ）

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ADMIN_IDS = (process.env.NEXT_PUBLIC_ADMIN_USER_IDS || '').split(',').filter(Boolean);

const VALID_TARGET_TYPES = ['novel', 'character_sheet', 'gear_post', 'anomaly_draft', 'other'];
const VALID_REASONS = ['inappropriate', 'copyright', 'spam', 'harassment', 'gore_excess', 'other'];
const VALID_STATUSES = ['pending', 'reviewed', 'dismissed', 'actioned'];

// POST: 通報作成
export async function POST(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
        }

        const body = await request.json();
        const { target_type, target_id, reason, description } = body;

        if (!VALID_TARGET_TYPES.includes(target_type)) {
            return NextResponse.json({ error: '不正な対象タイプ' }, { status: 400 });
        }
        if (!target_id) {
            return NextResponse.json({ error: '対象IDが必要です' }, { status: 400 });
        }
        if (!VALID_REASONS.includes(reason)) {
            return NextResponse.json({ error: '不正な理由' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('reports')
            .insert({
                reporter_user_id: userId,
                target_type,
                target_id,
                reason,
                description: description || '',
                status: 'pending',
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ ok: true, data });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// GET: 通報一覧（管理者のみ）
export async function GET(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
        }
        if (!ADMIN_IDS.includes(userId)) {
            return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const targetType = searchParams.get('target_type');

        let query = supabase
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (status) query = query.eq('status', status);
        if (targetType) query = query.eq('target_type', targetType);

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json({ ok: true, data });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PATCH: ステータス変更（管理者のみ）
export async function PATCH(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
        }
        if (!ADMIN_IDS.includes(userId)) {
            return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
        }

        const body = await request.json();
        const { id, status, admin_note } = body;

        if (!id) {
            return NextResponse.json({ error: 'IDが必要です' }, { status: 400 });
        }
        if (status && !VALID_STATUSES.includes(status)) {
            return NextResponse.json({ error: '不正なステータス' }, { status: 400 });
        }

        const update = {
            reviewed_at: new Date().toISOString(),
            reviewed_by: userId,
        };
        if (status) update.status = status;
        if (typeof admin_note === 'string') update.admin_note = admin_note;

        const { data, error } = await supabase
            .from('reports')
            .update(update)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ ok: true, data });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
