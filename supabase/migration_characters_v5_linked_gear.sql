-- =====================================================
-- キャラクターシート v5 — 武器連携カラム追加
-- =====================================================

-- 投稿済み武器（gear_posts）とのリンク
ALTER TABLE character_sheets
  ADD COLUMN IF NOT EXISTS linked_gear_id UUID REFERENCES gear_posts(id) ON DELETE SET NULL;
