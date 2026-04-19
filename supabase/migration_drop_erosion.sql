-- ============================================================
-- 侵食（erosion）関連カラム削除マイグレーション【下書き・未適用】
-- 作成日：2026-04-19
-- ============================================================
--
-- 【目的】
-- 侵食率（erosion）の機能を Webサイト・キャラシUI・プレイヤー向け資料から
-- 全削除する方針（2026-04-19 確定）に伴い、Supabase側の関連カラムも整理する。
-- UI からはすでに参照しなくなっているが、DB カラムは残ったまま。
-- 将来「やはり物理的に消そう」と決めた段階でこのファイルを適用する。
--
-- 【適用前の必須確認】
-- 1. 既存の character_sheets / gear_posts レコードに侵食関連の値が残っていないか
--    （残っていれば、適用すると不可逆に失われる）
-- 2. UI / Backend の全コードから erosion_* カラムへの参照が消えているか
--    （参照が残っていると適用後にエラーが出る）
-- 3. バックアップが取られているか
--
-- 【適用方法】
-- Supabase Console の SQL Editor で本ファイルを貼り付けて実行、
-- または supabase CLI でマイグレーションとして適用する。
--
-- 【未適用】2026-04-19 時点では適用していない。下書きとして保管。
-- ============================================================

-- 1. character_sheets テーブルから侵食率カラムを削除
ALTER TABLE character_sheets DROP COLUMN IF EXISTS erosion_rate;
ALTER TABLE character_sheets DROP COLUMN IF EXISTS erosion_note;

-- 2. gear_posts テーブルから侵食リスク／侵食の兆候カラムを削除
ALTER TABLE gear_posts DROP COLUMN IF EXISTS erosion_risk;
ALTER TABLE gear_posts DROP COLUMN IF EXISTS erosion_signs;

-- ============================================================
-- 適用後にやること（参考）
-- ============================================================
-- ・supabase/setup_all.sql から該当カラム定義を削除（新規環境用）
-- ・supabase/schema.sql から gear_posts の erosion_* を削除
-- ・supabase/migration_characters.sql は既存マイグレーション履歴として残す
-- ・タスクログ（tasks/todo.md）に適用日を記録
