// Supabaseクライアント — シングルトンインスタンス
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 環境変数が未設定の場合のフォールバック
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase環境変数が未設定です。投稿機能は利用できません。');
}

export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
