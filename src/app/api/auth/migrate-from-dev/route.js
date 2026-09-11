// Clerk Dev → Production 移行API
// ログイン中のユーザーが Dev 時代に持っていたデータ（旧 user_id 紐付け）を
// 新しい Production user_id に引き継ぐ
//
// 動作：
// 1. Clerkから現在のユーザーのメアドを取得
// 2. user_migration_map から email で dev_user_id を検索
// 3. DB関数 migrate_user_data()（supabase/migration_security_hardening.sql）で
//    全テーブルの所有者列・CP残高・移行済みフラグを1トランザクションで更新
//    （関数未適用の環境では、各クエリのエラーを検査しながら順次更新し、
//      1つでも失敗したら移行済みフラグを立てずに終了する＝再試行可能）
//
// 重複実行防止：migrated_at が既に NULL でなければ何もしない（idempotent）
// 2026-09-11 第2回レビュー R2-01 / R2-04 対応

import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabaseServer';

// テーブル → 所有者列 の対応表
export const OWNER_COLUMNS = {
    anomaly_drafts: 'user_id',
    gear_posts: 'user_id',
    character_sheets: 'user_id',
    novels: 'user_id',
    mission_results: 'user_id',
    adv_completions: 'user_id',
    character_achievements: 'user_id',
    dispatch_quests: 'user_id',
    sns_posts: 'user_id',
    sns_likes: 'user_id',
    sns_threads: 'user_id',
    sns_thread_replies: 'user_id',
    sns_chat_rooms: 'created_by',
    sns_chat_messages: 'user_id',
    sns_chat_members: 'user_id',
    cp_transactions: 'user_id',
    reports: 'reporter_user_id',
};

// 新IDが既に同じキーを持つ場合、旧行を削除してから付け替える（一意制約との衝突回避）
const UNIQUE_KEYS = {
    sns_likes: ['post_id'],
    sns_chat_members: ['room_id'],
    adv_completions: ['character_id', 'scenario_id'],
};

// account_cp は user_id PRIMARY KEY なので別処理
const ACCOUNT_TABLE = 'account_cp';

function isMissingRpc(error) {
    if (!error) return false;
    const code = error.code || '';
    const msg = String(error.message || '');
    return code === 'PGRST202' || code === '42883' || /could not find the function|does not exist/i.test(msg);
}

/** 一意制約と衝突する旧行を削除する */
async function removeConflictingRows(table, column, oldId, newId) {
    const keys = UNIQUE_KEYS[table];
    if (!keys) return null;
    const { data: newRows, error: e1 } = await supabase.from(table).select(keys.join(', ')).eq(column, newId);
    if (e1) return e1;
    for (const nr of newRows || []) {
        let q = supabase.from(table).delete().eq(column, oldId);
        for (const k of keys) q = q.eq(k, nr[k]);
        const { error } = await q;
        if (error) return error;
    }
    return null;
}

/** RPC 未適用環境向けの順次移行。失敗したら { error } を返し、呼び出し側は移行済みにしない */
async function migrateSequentially(oldId, newId, email) {
    const counts = {};

    for (const [table, column] of Object.entries(OWNER_COLUMNS)) {
        const conflictErr = await removeConflictingRows(table, column, oldId, newId);
        if (conflictErr) return { error: `${table}: ${conflictErr.message}`, counts };

        const { data, error } = await supabase
            .from(table)
            .update({ [column]: newId })
            .eq(column, oldId)
            .select('id');
        if (error) return { error: `${table}: ${error.message}`, counts };
        counts[table] = (data || []).length;
    }

    // account_cp：新ID側の行を確定してから旧行を削除する（確定できなければ旧行は残す）
    const { data: oldAccount, error: oldErr } = await supabase
        .from(ACCOUNT_TABLE).select('*').eq('user_id', oldId).maybeSingle();
    if (oldErr) return { error: `${ACCOUNT_TABLE}: ${oldErr.message}`, counts };

    if (!oldAccount) {
        counts[ACCOUNT_TABLE] = 'no_old_record';
    } else {
        const { data: upserted, error: upErr } = await supabase
            .from(ACCOUNT_TABLE)
            .upsert({ user_id: newId, balance: oldAccount.balance, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
            .select('user_id, balance');
        if (upErr) return { error: `${ACCOUNT_TABLE}: ${upErr.message}`, counts };
        const confirmed = (upserted || []).find(r => r.user_id === newId && r.balance === oldAccount.balance);
        if (!confirmed) {
            // 返却が無い実装向けに再確認
            const { data: check, error: chkErr } = await supabase
                .from(ACCOUNT_TABLE).select('balance').eq('user_id', newId).maybeSingle();
            if (chkErr || !check || check.balance !== oldAccount.balance) {
                return { error: `${ACCOUNT_TABLE}: 新IDの残高を確定できませんでした`, counts };
            }
        }
        const { error: delErr } = await supabase.from(ACCOUNT_TABLE).delete().eq('user_id', oldId);
        if (delErr) return { error: `${ACCOUNT_TABLE}: ${delErr.message}`, counts };
        counts[ACCOUNT_TABLE] = 'transferred';
    }

    // 全て成功した場合のみ移行済みにする
    const { error: mapErr } = await supabase
        .from('user_migration_map')
        .update({ migrated_at: new Date().toISOString(), migrated_to_user_id: newId })
        .eq('email', email)
        .eq('dev_user_id', oldId);
    if (mapErr) return { error: `user_migration_map: ${mapErr.message}`, counts };

    return { counts };
}

export async function POST() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
        }

        // 1. Clerk から現在のユーザーのメアドを取得
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const primaryEmail = user.primaryEmailAddressId
            ? user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress
            : user.emailAddresses[0]?.emailAddress;

        if (!primaryEmail) {
            return NextResponse.json({ ok: true, migrated: false, reason: 'no_email' });
        }

        // 2. マッピング表を email で検索
        const { data: mapping, error: mapErr } = await supabase
            .from('user_migration_map')
            .select('*')
            .eq('email', primaryEmail)
            .maybeSingle();

        if (mapErr) throw mapErr;
        if (!mapping) {
            return NextResponse.json({ ok: true, migrated: false, reason: 'no_mapping' });
        }
        if (mapping.migrated_at) {
            return NextResponse.json({
                ok: true,
                migrated: false,
                reason: 'already_migrated',
                migrated_at: mapping.migrated_at,
            });
        }

        const devUserId = mapping.dev_user_id;
        if (devUserId === userId) {
            // 同じ user_id（移行不要）
            const { error } = await supabase
                .from('user_migration_map')
                .update({ migrated_at: new Date().toISOString(), migrated_to_user_id: userId })
                .eq('email', primaryEmail);
            if (error) throw error;
            return NextResponse.json({ ok: true, migrated: false, reason: 'same_user_id' });
        }

        // 3. DB関数で一括移行（1トランザクション）
        let counts = null;
        const { data: rpcCounts, error: rpcErr } = await supabase.rpc('migrate_user_data', {
            p_old_user_id: devUserId,
            p_new_user_id: userId,
            p_email: primaryEmail,
        });

        if (!rpcErr) {
            counts = rpcCounts || {};
        } else if (isMissingRpc(rpcErr)) {
            // フォールバック：順次移行（失敗時は移行済みにしない）
            const result = await migrateSequentially(devUserId, userId, primaryEmail);
            if (result.error) {
                console.error('Migration failed (sequential):', result.error, result.counts);
                return NextResponse.json({
                    ok: false,
                    migrated: false,
                    reason: 'failed',
                    error: `移行に失敗しました（${result.error}）。再度お試しください`,
                    details: result.counts,
                }, { status: 500 });
            }
            counts = result.counts;
        } else {
            console.error('Migration failed (rpc):', rpcErr.message);
            return NextResponse.json({
                ok: false,
                migrated: false,
                reason: 'failed',
                error: `移行に失敗しました（${rpcErr.message}）。再度お試しください`,
            }, { status: 500 });
        }

        // 引き継ぎ件数の合計
        const totalRows = Object.values(counts).reduce(
            (sum, v) => (typeof v === 'number' ? sum + v : sum),
            0
        );

        return NextResponse.json({
            ok: true,
            migrated: true,
            total_rows: totalRows,
            details: counts,
            from_user_id: devUserId,
            to_user_id: userId,
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
