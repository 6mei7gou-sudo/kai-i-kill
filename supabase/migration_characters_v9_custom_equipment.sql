-- migration_characters_v9_custom_equipment.sql
-- 自由記述装備名カラムを追加

ALTER TABLE character_sheets
ADD COLUMN IF NOT EXISTS custom_equipment_name TEXT;
