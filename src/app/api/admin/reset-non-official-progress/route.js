// 管理者専用：リセットイベントAPI
// ① 非公式キャラのレベルを 1 にリセット＋レベルアップCP履歴を削除
// ② 全ユーザーのCP残高を一律 50CP に再配布（差分を cp_transactions に記録）
// ③ 全キャラクターに「未開の開拓者」称号を配布
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ADMIN_IDS = (process.env.NEXT_PUBLIC_ADMIN_USER_IDS || '').split(',').filter(Boolean);

const FLAT_CP = 50;
const PIONEER_TITLE = {
    achievement_id: 'title_frontier_pioneer',
    achievement_name: '未開の開拓者',
    achievement_type: 'special',
};

export async function POST() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
        }
        if (!ADMIN_IDS.includes(userId)) {
            return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
        }

        // ── ① 非公式キャラのレベル＆CP履歴リセット ──
        const { data: leveled, error: fetchErr } = await supabase
            .from('character_sheets')
            .select('id, is_official')
            .gt('level', 1);
        if (fetchErr) throw fetchErr;

        const targetIds = (leveled || []).filter(c => !c.is_official).map(c => c.id);

        let resetCharCount = 0;
        let deletedHistoryCount = 0;
        if (targetIds.length > 0) {
            const { data: deleted, error: delErr } = await supabase
                .from('cp_transactions')
                .delete()
                .in('source_id', targetIds)
                .like('description', '%レベルアップ%')
                .select('id');
            if (delErr) throw delErr;
            deletedHistoryCount = (deleted || []).length;

            const { data: updated, error: updErr } = await supabase
                .from('character_sheets')
                .update({ level: 1, updated_at: new Date().toISOString() })
                .in('id', targetIds)
                .select('id');
            if (updErr) throw updErr;
            resetCharCount = (updated || []).length;
        }

        // ── ② 全ユーザーのCPを 50 に再配布 ──
        const { data: accounts, error: accErr } = await supabase
            .from('account_cp')
            .select('user_id, balance');
        if (accErr) throw accErr;

        const nowIso = new Date().toISOString();
        let cpAdjustedCount = 0;
        for (const acc of (accounts || [])) {
            const diff = FLAT_CP - (acc.balance ?? 0);
            const { error: updErr } = await supabase
                .from('account_cp')
                .update({ balance: FLAT_CP, updated_at: nowIso })
                .eq('user_id', acc.user_id);
            if (updErr) throw updErr;

            await supabase.from('cp_transactions').insert({
                user_id: acc.user_id,
                amount: diff,
                balance_after: FLAT_CP,
                source_type: 'admin',
                description: 'リセットイベント：全員一律 50CP に再配布',
            });
            cpAdjustedCount++;
        }

        // ── ③ 全キャラに「未開の開拓者」称号を配布 ──
        const { data: allChars, error: charErr } = await supabase
            .from('character_sheets')
            .select('id, user_id');
        if (charErr) throw charErr;

        let titleAwardedCount = 0;
        if ((allChars || []).length > 0) {
            const rows = allChars
                .filter(c => c.user_id)
                .map(c => ({
                    user_id: c.user_id,
                    character_id: c.id,
                    ...PIONEER_TITLE,
                }));
            const { data: inserted, error: insErr } = await supabase
                .from('character_achievements')
                .upsert(rows, { onConflict: 'character_id,achievement_id', ignoreDuplicates: true })
                .select('id');
            if (insErr) throw insErr;
            titleAwardedCount = (inserted || []).length;
        }

        return NextResponse.json({
            ok: true,
            resetCharCount,
            deletedHistoryCount,
            cpAdjustedCount,
            titleAwardedCount,
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
