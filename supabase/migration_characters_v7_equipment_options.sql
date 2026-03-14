-- migration_characters_v7_equipment_options.sql
-- カスタムオプション選択機能対応：equipment_options カラム追加
-- 実行前にバックアップ推奨

-- equipment_options: 選択したカスタムオプションの配列（JSONB）
ALTER TABLE character_sheets
ADD COLUMN IF NOT EXISTS equipment_options JSONB DEFAULT '[]'::JSONB;
