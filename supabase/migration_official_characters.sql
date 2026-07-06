-- =====================================================
-- 公式キャラクター紹介テーブル
-- SupabaseダッシュボードのSQL Editorで実行
-- 管理者が公式キャラページ（/official-characters/）の掲載内容を
-- 自由に登録・編集する。character_sheets の is_official とは独立。
-- 認可は news_posts と同様に API 層（ADMIN_IDS）で行う。
-- =====================================================

CREATE TABLE official_characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- 掲載内容
  name TEXT NOT NULL,                 -- キャラクター名
  title TEXT DEFAULT '',              -- 肩書・二つ名（任意）
  description TEXT NOT NULL DEFAULT '', -- 紹介文（改行可）
  image_url TEXT DEFAULT '',          -- 紹介画像URL

  -- 表示制御
  display_order INTEGER DEFAULT 0,    -- 並び順（小さいほど先頭）
  published BOOLEAN DEFAULT true      -- 公開フラグ
);

-- RLS
ALTER TABLE official_characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published official characters"
  ON official_characters FOR SELECT USING (published = true);

CREATE POLICY "Admins can do anything with official characters"
  ON official_characters FOR ALL USING (true) WITH CHECK (true);

-- インデックス
CREATE INDEX idx_official_characters_order
  ON official_characters (display_order ASC, created_at DESC);
