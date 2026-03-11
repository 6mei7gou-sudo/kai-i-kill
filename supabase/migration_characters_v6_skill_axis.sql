-- migration_characters_v6_skill_axis.sql
-- v4.0対応：クラス廃止 → 6軸スキル（所属/配属/覚醒/背景/武器型）
-- 実行前にバックアップ推奨

-- 1. 武器型カラムを追加
ALTER TABLE character_sheets
ADD COLUMN IF NOT EXISTS weapon_type TEXT
CHECK (weapon_type IN ('斬撃型', '打撃型', '射撃型', '魔導型', '体術型'));

-- 2. スキル選択（JSONB配列：選択したスキル名の配列）
ALTER TABLE character_sheets
ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::JSONB;

-- 3. 段階調整（JSONB配列：+段階を付与した能力値キーの配列、最大2つ）
ALTER TABLE character_sheets
ADD COLUMN IF NOT EXISTS stage_plus JSONB DEFAULT '[]'::JSONB;

-- 4. classカラムのCHECK制約を緩和（旧データ互換のためNULL許可、制約削除）
-- PostgreSQLでは名前付きCHECK制約を削除する必要がある
-- 制約名が不明な場合はこのクエリで確認：
-- SELECT conname FROM pg_constraint WHERE conrelid = 'character_sheets'::regclass AND contype = 'c';
-- 安全のため、DO ブロックで存在する場合のみ削除
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT conname FROM pg_constraint
        WHERE conrelid = 'character_sheets'::regclass
        AND contype = 'c'
        AND pg_get_constraintdef(oid) LIKE '%class%'
    ) LOOP
        EXECUTE 'ALTER TABLE character_sheets DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- 5. backgroundカラムのCHECK制約を更新
-- 旧制約を削除
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT conname FROM pg_constraint
        WHERE conrelid = 'character_sheets'::regclass
        AND contype = 'c'
        AND pg_get_constraintdef(oid) LIKE '%background%'
    ) LOOP
        EXECUTE 'ALTER TABLE character_sheets DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- 新しい背景の制約（旧値もNULLも許容して後方互換）
ALTER TABLE character_sheets
ADD CONSTRAINT character_sheets_background_v6_check
CHECK (background IS NULL OR background IN (
    -- v4.0 新背景
    '神社育ち', '鋼の肉体', '都市伝説研究者', '元実験体', 'ハッカー上がり', '魔道資格者',
    -- v3.0 旧背景（既存データ互換）
    '鋼の肉体', '学者肌', '霊媒体質', '技術畑', 'ストリート上がり', '信仰者'
));

-- 6. sub_affiliationのCHECK制約を更新（あれば削除して新規追加）
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT conname FROM pg_constraint
        WHERE conrelid = 'character_sheets'::regclass
        AND contype = 'c'
        AND pg_get_constraintdef(oid) LIKE '%sub_affiliation%'
    ) LOOP
        EXECUTE 'ALTER TABLE character_sheets DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- 新旧両方の配属値を許容
ALTER TABLE character_sheets
ADD CONSTRAINT character_sheets_sub_affiliation_v6_check
CHECK (sub_affiliation IS NULL OR sub_affiliation IN (
    -- v4.0 祓部配属班
    '古怪班', '新怪班', '封印班', '機動班',
    -- v4.0 傭兵専門
    '突撃型', '偵察型', '技術型',
    -- v4.0 無所属流儀
    '野良討伐者', '裏社会の住人', '在野研究者',
    -- v3.0 旧値（既存データ互換）
    '特務班', '技術班', '戦闘屋', '調査屋', '運び屋', '技術屋',
    '路地裏の犬', 'はぐれ狼', '小さな群れ', '脱走兵'
));

-- 7. インデックス
CREATE INDEX IF NOT EXISTS idx_character_sheets_weapon_type ON character_sheets(weapon_type);
