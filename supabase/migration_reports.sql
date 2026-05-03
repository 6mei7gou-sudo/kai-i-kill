-- =====================================================
-- 通報（Report）テーブル
-- 2026-05-04：投稿への通報機能（最初は小説対象、将来は他投稿タイプにも拡張可能）
-- =====================================================

CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- 通報者
  reporter_user_id TEXT NOT NULL,

  -- 対象
  target_type TEXT NOT NULL CHECK (target_type IN ('novel', 'character_sheet', 'gear_post', 'anomaly_draft', 'other')),
  target_id UUID NOT NULL,

  -- 内容
  reason TEXT NOT NULL CHECK (reason IN ('inappropriate', 'copyright', 'spam', 'harassment', 'gore_excess', 'other')),
  description TEXT DEFAULT '',

  -- 対応状況
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  reviewed_at TIMESTAMPTZ DEFAULT NULL,
  reviewed_by TEXT DEFAULT NULL,
  admin_note TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_user_id);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read reports" ON reports;
DROP POLICY IF EXISTS "Anyone can insert reports" ON reports;
DROP POLICY IF EXISTS "Anyone can update reports" ON reports;

-- 注：管理者のみが扱うため、API側でユーザーIDで制御する。RLSは緩い（API経由で書き込み）
CREATE POLICY "Anyone can read reports" ON reports FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reports" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update reports" ON reports FOR UPDATE USING (true) WITH CHECK (true);
