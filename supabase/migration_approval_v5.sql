-- =====================================================
-- マイグレーション v5: 公認ステータスシステム
-- character_sheets, gear_posts, anomaly_drafts に
-- approved_status カラムを追加
-- =====================================================

-- character_sheets: 公認ステータス
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS approved_status TEXT DEFAULT 'pending' CHECK (approved_status IN ('pending','approved','rejected'));
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS approved_by TEXT;

-- gear_posts: 公認ステータス
ALTER TABLE gear_posts ADD COLUMN IF NOT EXISTS approved_status TEXT DEFAULT 'pending' CHECK (approved_status IN ('pending','approved','rejected'));
ALTER TABLE gear_posts ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE gear_posts ADD COLUMN IF NOT EXISTS approved_by TEXT;

-- anomaly_drafts: 公認ステータス（TMP→KAI昇格用）
ALTER TABLE anomaly_drafts ADD COLUMN IF NOT EXISTS approved_status TEXT DEFAULT 'pending' CHECK (approved_status IN ('pending','approved','rejected'));
ALTER TABLE anomaly_drafts ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE anomaly_drafts ADD COLUMN IF NOT EXISTS approved_by TEXT;
