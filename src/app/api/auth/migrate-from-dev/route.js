// Clerk Dev → Production 移行API
// ログイン中のユーザーが Dev 時代に持っていたデータ（旧 user_id 紐付け）を
// 新しい Production user_id に引き継ぐ
//
// 動作：
// 1. Clerkから現在のユーザーのメアドを取得
// 2. user_migration_map から email で dev_user_id を検索
// 3. 16テーブル全てで dev_user_id を 新user_id に UPDATE
// 4. user_migration_map.migrated_at を NOW、migrated_to_user_id を新user_id に
//
// 重複実行防止：migrated_at が既に NULL でなければ何もしない（idempotent）

import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// user_id を持つ全テーブル（PRIMARY KEY のものは特別扱い）
const TABLES_WITH_USER_ID = [
    'anomaly_drafts',
    'gear_posts',
    'character_sheets',
    'mission_results',
    'adv_completions',
    'character_achievements',
    'dispatch_quests',
    'sns_posts',
    'sns_likes',
    'sns_threads',
    'sns_thread_replies',
    'sns_chat_rooms',
    'sns_chat_messages',
    'sns_chat_members',
    'cp_transactions',
];
// account_cp は user_id PRIMARY KEY なので別処理
const ACCOUNT_TABLE = 'account_cp';

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
            await supabase
                .from('user_migration_map')
                .update({ migrated_at: new Date().toISOString(), migrated_to_user_id: userId })
                .eq('email', primaryEmail);
            return NextResponse.json({ ok: true, migrated: false, reason: 'same_user_id' });
        }

        // 3. 各テーブルで user_id を更新
        const updateCounts = {};
        for (const table of TABLES_WITH_USER_ID) {
            const { data, error } = await supabase
                .from(table)
                .update({ user_id: userId })
                .eq('user_id', devUserId)
                .select('id');
            if (error) {
                console.error(`Migration error on ${table}:`, error.message);
                updateCounts[table] = `error: ${error.message}`;
            } else {
                updateCounts[table] = (data || []).length;
            }
        }

        // account_cp は PRIMARY KEY が user_id なので INSERT-or-UPDATE 方式
        try {
            const { data: oldAccount } = await supabase
                .from(ACCOUNT_TABLE)
                .select('*')
                .eq('user_id', devUserId)
                .maybeSingle();

            if (oldAccount) {
                const { data: newAccount } = await supabase
                    .from(ACCOUNT_TABLE)
                    .select('*')
                    .eq('user_id', userId)
                    .maybeSingle();

                if (newAccount) {
                    // 新ID側に既存アカウント → 旧の balance で上書き（旧優先）
                    // 新ID側で ensureAccount が作成した初期10CPは破棄し、Dev時代の残高を維持する
                    await supabase
                        .from(ACCOUNT_TABLE)
                        .update({
                            balance: oldAccount.balance,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('user_id', userId);
                    await supabase.from(ACCOUNT_TABLE).delete().eq('user_id', devUserId);
                    updateCounts[ACCOUNT_TABLE] = 'overwritten';
                } else {
                    // 新ID側にアカウントなし → 旧IDの行を新IDで作って旧IDを削除
                    await supabase
                        .from(ACCOUNT_TABLE)
                        .insert({
                            user_id: userId,
                            balance: oldAccount.balance,
                            created_at: oldAccount.created_at,
                            updated_at: new Date().toISOString(),
                        });
                    await supabase.from(ACCOUNT_TABLE).delete().eq('user_id', devUserId);
                    updateCounts[ACCOUNT_TABLE] = 'transferred';
                }
            } else {
                updateCounts[ACCOUNT_TABLE] = 'no_old_record';
            }
        } catch (err) {
            updateCounts[ACCOUNT_TABLE] = `error: ${err.message}`;
        }

        // 4. マッピング表を更新（重複実行防止）
        await supabase
            .from('user_migration_map')
            .update({
                migrated_at: new Date().toISOString(),
                migrated_to_user_id: userId,
            })
            .eq('email', primaryEmail);

        // 引き継ぎ件数の合計
        const totalRows = Object.values(updateCounts).reduce(
            (sum, v) => (typeof v === 'number' ? sum + v : sum),
            0
        );

        return NextResponse.json({
            ok: true,
            migrated: true,
            total_rows: totalRows,
            details: updateCounts,
            from_user_id: devUserId,
            to_user_id: userId,
        });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
