-- migration_gear_v2_weapon_type.sql
-- gear_postsに武器種・サブタイプカラムを追加

ALTER TABLE gear_posts ADD COLUMN IF NOT EXISTS weapon_type TEXT;
ALTER TABLE gear_posts ADD COLUMN IF NOT EXISTS weapon_subtype TEXT;
