-- v8: ソーシャルリンク（X / VRChat / 自由URL）追加
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS social_x TEXT DEFAULT '';
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS social_vrc TEXT DEFAULT '';
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS social_url TEXT DEFAULT '';
