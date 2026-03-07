-- =====================================================
-- News / Release 投稿テーブル
-- SupabaseダッシュボードのSQL Editorで実行
-- =====================================================

CREATE TABLE news_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- 投稿者（管理者のみ）
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'SYSTEM',

  -- 分類
  category TEXT NOT NULL DEFAULT 'news' CHECK (category IN ('news', 'release', 'event')),

  -- コンテンツ
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',

  -- 公開制御
  published BOOLEAN DEFAULT true
);

-- RLS
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published news"
  ON news_posts FOR SELECT USING (published = true);

CREATE POLICY "Admins can do anything with news"
  ON news_posts FOR ALL USING (true) WITH CHECK (true);

-- インデックス
CREATE INDEX idx_news_posts_category ON news_posts (category);
CREATE INDEX idx_news_posts_created_at ON news_posts (created_at DESC);
