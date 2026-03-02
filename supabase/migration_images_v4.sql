-- =====================================================
-- マイグレーション v4: 画像システム拡張
-- サムネイル・アイコン・画像3枚対応
-- 対象: character_sheets, gear_posts, anomaly_drafts
-- =====================================================

-- character_sheets: サムネ + アイコン + 画像3枚
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS thumbnail_url TEXT DEFAULT '';
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS icon_url TEXT DEFAULT '';
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '["","",""]'::jsonb;

-- gear_posts: サムネ + アイコン + 画像3枚
ALTER TABLE gear_posts ADD COLUMN IF NOT EXISTS thumbnail_url TEXT DEFAULT '';
ALTER TABLE gear_posts ADD COLUMN IF NOT EXISTS icon_url TEXT DEFAULT '';
ALTER TABLE gear_posts ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '["","",""]'::jsonb;

-- anomaly_drafts: サムネ + アイコンのみ（画像3枚は不要）
ALTER TABLE anomaly_drafts ADD COLUMN IF NOT EXISTS thumbnail_url TEXT DEFAULT '';
ALTER TABLE anomaly_drafts ADD COLUMN IF NOT EXISTS icon_url TEXT DEFAULT '';
