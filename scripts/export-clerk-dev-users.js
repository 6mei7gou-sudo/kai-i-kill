// Clerk Dev環境のユーザーリストを Supabase の user_migration_map にエクスポート
//
// 使い方：
//   node scripts/export-clerk-dev-users.js sk_test_xxxxxxxxxxxxx
//
// 注意：
// - 第1引数は Clerk Dev環境の Secret Key（sk_test_... で始まる）
// - Supabase の URL と Anon Key は .env.local から自動読み込み
// - 既に同じ email がある行は更新せずスキップ（重複実行に安全）

const { createClerkClient } = require('@clerk/backend');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// .env.local 読み込み
const envPath = path.join(__dirname, '..', '.env.local');
const env = fs.readFileSync(envPath, 'utf8').split(/\r?\n/).reduce((acc, line) => {
    const eq = line.indexOf('=');
    if (eq <= 0) return acc;
    const key = line.substring(0, eq).trim();
    const val = line.substring(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !key.startsWith('#')) acc[key] = val;
    return acc;
}, {});

const devSecretKey = process.argv[2];
if (!devSecretKey || !devSecretKey.startsWith('sk_test_')) {
    console.error('使い方: node scripts/export-clerk-dev-users.js sk_test_xxxxxxxxxxxxx');
    console.error('（第1引数は Clerk Dev環境の Secret Key）');
    process.exit(1);
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const clerk = createClerkClient({ secretKey: devSecretKey });

(async () => {
    console.log('--- Clerk Dev ユーザーをエクスポート中 ---');
    let offset = 0;
    const limit = 500;
    let allUsers = [];

    // ページング対応（500件超でも対応）
    while (true) {
        const { data, totalCount } = await clerk.users.getUserList({ limit, offset });
        allUsers = allUsers.concat(data);
        console.log(`  取得 ${allUsers.length} / ${totalCount} 件`);
        if (allUsers.length >= totalCount) break;
        offset += limit;
    }

    console.log(`\nClerk から取得：${allUsers.length} 件`);

    let inserted = 0;
    let skipped = 0;
    let noEmail = 0;

    for (const user of allUsers) {
        const primaryEmail = user.primaryEmailAddressId
            ? user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress
            : user.emailAddresses[0]?.emailAddress;

        if (!primaryEmail) {
            console.warn(`  ⚠ メアドなし：${user.id}（スキップ）`);
            noEmail++;
            continue;
        }

        // upsert（emailで衝突したら何もしない＝既存を保護）
        const { error } = await supabase
            .from('user_migration_map')
            .upsert(
                { email: primaryEmail, dev_user_id: user.id },
                { onConflict: 'email', ignoreDuplicates: true }
            );

        if (error) {
            console.error(`  ✗ ${primaryEmail}：${error.message}`);
            skipped++;
        } else {
            inserted++;
        }
    }

    console.log('\n--- 結果 ---');
    console.log(`  新規/更新：${inserted} 件`);
    console.log(`  メアドなしスキップ：${noEmail} 件`);
    console.log(`  エラー：${skipped} 件`);
    console.log('\n完了。Production 環境に切り替えた後、ユーザーが初回ログイン時に自動マイグレーションが走ります。');
})();
