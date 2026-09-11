// サーバー専用 Supabase クライアント
// APIルート（src/app/api/**）からのみ import すること。クライアントコンポーネントでは使わない。
//
// - SUPABASE_SERVICE_ROLE_KEY が設定されていれば service role で接続する（RLSをバイパス）。
//   認可はAPIルート側の auth() ＋所有権チェックで行う。
// - 未設定の場合は anon キーにフォールバックする（RLS強化マイグレーション適用前の互換動作）。
//   supabase/migration_security_hardening.sql を適用した後は anon では書き込みできないため、
//   本番では必ず SUPABASE_SERVICE_ROLE_KEY を設定すること（手順は docs/CONTEXT.md）。
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!serviceRoleKey && process.env.NODE_ENV === 'production') {
    console.warn('[supabaseServer] SUPABASE_SERVICE_ROLE_KEY が未設定です。anon キーで接続します（RLS強化後は書き込みが失敗します）。');
}

export const supabaseServer = createClient(supabaseUrl, serviceRoleKey || anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
});

/** 管理者ユーザーIDの一覧（環境変数 NEXT_PUBLIC_ADMIN_USER_IDS、カンマ区切り） */
export const ADMIN_IDS = (process.env.NEXT_PUBLIC_ADMIN_USER_IDS || '').split(',').filter(Boolean);

export function isAdmin(userId) {
    return !!userId && ADMIN_IDS.includes(userId);
}
