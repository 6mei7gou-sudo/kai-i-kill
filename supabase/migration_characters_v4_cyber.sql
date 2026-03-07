-- =====================================================
-- キャラクターシート v4 マイグレーション
-- サイバネティクス関連カラム追加
-- Supabase SQL Editorで実行してください
-- =====================================================

-- 改造等級（none / I / II / III）
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS cyber_grade TEXT DEFAULT 'none' CHECK (cyber_grade IN ('none','I','II','III'));

-- サイバネティクス装備リスト（JSONB配列: [{name, part}, ...]）
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS cybernetics JSONB DEFAULT '[]';
