-- =====================================================
-- 小説投稿テーブル
-- 2026-05-04：コミュニティDBの小説投稿機能
-- =====================================================

CREATE TABLE IF NOT EXISTS novels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  user_id TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT '匿名',

  -- コンテンツ
  title TEXT NOT NULL,
  summary TEXT DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  thumbnail_url TEXT DEFAULT '',

  -- 登場要素（JSONB配列：[{ id, name, type:'character'|'anomaly' }, ...]）
  featured_characters JSONB DEFAULT '[]'::JSONB,
  featured_anomalies JSONB DEFAULT '[]'::JSONB,

  -- メタ
  visibility TEXT DEFAULT '公開' CHECK (visibility IN ('公開', '非公開')),
  warnings JSONB DEFAULT '[]'::JSONB,

  -- 承認制御
  approved_status TEXT DEFAULT 'pending' CHECK (approved_status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMPTZ DEFAULT NULL,
  approved_by TEXT DEFAULT NULL,
  is_official BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_novels_user_id ON novels(user_id);
CREATE INDEX IF NOT EXISTS idx_novels_created_at ON novels(created_at DESC);

ALTER TABLE novels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read novels" ON novels;
DROP POLICY IF EXISTS "Anyone can insert novels" ON novels;
DROP POLICY IF EXISTS "Anyone can update novels" ON novels;
DROP POLICY IF EXISTS "Anyone can delete novels" ON novels;

CREATE POLICY "Anyone can read novels" ON novels FOR SELECT USING (true);
CREATE POLICY "Anyone can insert novels" ON novels FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update novels" ON novels FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete novels" ON novels FOR DELETE USING (true);
