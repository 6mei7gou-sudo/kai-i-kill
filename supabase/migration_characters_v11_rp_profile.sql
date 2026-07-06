-- migration_characters_v11_rp_profile.sql
-- RP用キャラクターシート向けプロフィール項目（外見・性格・口調）を追加
-- SupabaseダッシュボードのSQL Editorで実行
-- ⚠️ このSQLは、キャラ作成フォームの新項目（外見・性格・口調）を含むコードを
--    デプロイする前に必ず実行すること（未実行だとキャラ投稿・編集が失敗する）

ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS appearance TEXT DEFAULT '';
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS personality TEXT DEFAULT '';
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS speech_style TEXT DEFAULT '';
