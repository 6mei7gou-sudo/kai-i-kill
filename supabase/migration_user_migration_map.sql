-- =====================================================
-- Clerk Dev → Production ユーザー移行マッピングテーブル
-- 2026-05-04：本番環境移行に伴うユーザーデータ引き継ぎ
-- ユーザーが Production で初回ログイン時、メールアドレスをキーに
-- 旧 user_id（Dev時代）から新 user_id（Production）へ全テーブルのデータを移行する
-- =====================================================

CREATE TABLE IF NOT EXISTS user_migration_map (
  email TEXT PRIMARY KEY,
  dev_user_id TEXT NOT NULL,
  migrated_at TIMESTAMPTZ DEFAULT NULL,
  migrated_to_user_id TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_migration_map_dev_user_id ON user_migration_map(dev_user_id);

ALTER TABLE user_migration_map ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read user_migration_map" ON user_migration_map;
DROP POLICY IF EXISTS "Anyone can insert user_migration_map" ON user_migration_map;
DROP POLICY IF EXISTS "Anyone can update user_migration_map" ON user_migration_map;

CREATE POLICY "Anyone can read user_migration_map" ON user_migration_map FOR SELECT USING (true);
CREATE POLICY "Anyone can insert user_migration_map" ON user_migration_map FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update user_migration_map" ON user_migration_map FOR UPDATE USING (true) WITH CHECK (true);
