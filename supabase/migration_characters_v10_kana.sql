-- migration_characters_v10_kana.sql
-- キャラクター名のフリガナカラムを追加

ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS character_name_kana TEXT DEFAULT '';
