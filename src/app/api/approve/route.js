// 公認承認API — 管理者のみがステータスを変更可能
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ADMIN_IDS = (process.env.NEXT_PUBLIC_ADMIN_USER_IDS || '').split(',').filter(Boolean);

// PATCH: 承認ステータスを変更
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
        const { table, id, status: newStatus } = body;

        if (!['anomaly_drafts', 'gear_posts', 'character_sheets'].includes(table)) {
            return NextResponse.json({ error: '不正なテーブル名' }, { status: 400 });
        }
        if (!['pending', 'approved', 'rejected'].includes(newStatus)) {
            return NextResponse.json({ error: '不正なステータス' }, { status: 400 });
        }

        const updateData = {
            approved_status: newStatus,
            approved_at: newStatus !== 'pending' ? new Date().toISOString() : null,
            approved_by: newStatus !== 'pending' ? userId : null,
        };

        const { data, error } = await supabase
            .from(table)
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ ok: true, data });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
