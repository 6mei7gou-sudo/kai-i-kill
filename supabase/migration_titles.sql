-- =====================================================
-- 称号システム マイグレーション
-- キャラクターの称号設定 + シリアルコード引換
-- Supabase SQL Editorで実行してください
-- =====================================================

-- キャラクターシートに称号カラム追加
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS active_title TEXT;

-- シリアルコードテーブル
CREATE TABLE serial_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  code TEXT NOT NULL UNIQUE,
  achievement_id TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_type TEXT NOT NULL DEFAULT 'special' CHECK (achievement_type IN ('mission','adv','special')),
  max_uses INT DEFAULT 1,
  current_uses INT DEFAULT 0,
  expires_at TIMESTAMPTZ
);

ALTER TABLE serial_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read serial_codes" ON serial_codes FOR SELECT USING (true);
CREATE POLICY "Authenticated can update serial_codes" ON serial_codes FOR UPDATE USING (true) WITH CHECK (true);

-- サンプルコード（テスト用）
INSERT INTO serial_codes (code, achievement_id, achievement_name, achievement_type, max_uses)
VALUES
  ('KAIII-FIRST-2026', 'title_pioneer', '先駆者', 'special', 100),
  ('KAIII-BETA-TEST', 'title_beta_tester', 'βテスター', 'special', 50);
