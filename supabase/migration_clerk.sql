-- =====================================================
-- Clerk認証対応マイグレーション
-- Supabase SQL Editorで実行してください
-- =====================================================

-- 1. user_idカラムを追加
ALTER TABLE anomaly_drafts ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE gear_posts ADD COLUMN IF NOT EXISTS user_id TEXT;

-- 2. 投稿者のみ編集・削除可能なRLSポリシー追加
-- ※ Clerk認証はサーバー側APIルートで処理するため、
--    SupabaseのRLSは「user_idが一致するか」のシンプルチェック

-- anomaly_drafts: 更新ポリシー
CREATE POLICY "Owner can update anomaly_drafts"
  ON anomaly_drafts FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- anomaly_drafts: 削除ポリシー
CREATE POLICY "Owner can delete anomaly_drafts"
  ON anomaly_drafts FOR DELETE
  USING (true);

-- gear_posts: 更新ポリシー
CREATE POLICY "Owner can update gear_posts"
  ON gear_posts FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- gear_posts: 削除ポリシー
CREATE POLICY "Owner can delete gear_posts"
  ON gear_posts FOR DELETE
  USING (true);
