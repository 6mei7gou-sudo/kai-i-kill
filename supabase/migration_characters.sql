-- =====================================================
-- キャラクターシート テーブル定義
-- Supabase SQL Editorで実行してください
-- =====================================================

CREATE TABLE character_sheets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id TEXT,

  -- メタ情報
  author_name TEXT NOT NULL DEFAULT '名無しの討伐者',
  visibility TEXT DEFAULT '公開' CHECK (visibility IN ('公開', '限定')),
  image_url TEXT,

  -- 基本情報
  character_name TEXT NOT NULL,
  title TEXT,
  age TEXT,
  gender TEXT,
  affiliation TEXT NOT NULL CHECK (affiliation IN ('祓部', '傭兵', '無所属')),
  awakening TEXT NOT NULL CHECK (awakening IN ('先天覚醒型', 'ショック覚醒型', '実験覚醒型', '接触覚醒型')),

  -- 6属性（各1〜5、合計18）
  attr_shiya INT NOT NULL DEFAULT 3 CHECK (attr_shiya BETWEEN 1 AND 5),
  attr_shiki INT NOT NULL DEFAULT 3 CHECK (attr_shiki BETWEEN 1 AND 5),
  attr_tai INT NOT NULL DEFAULT 3 CHECK (attr_tai BETWEEN 1 AND 5),
  attr_jutsu INT NOT NULL DEFAULT 3 CHECK (attr_jutsu BETWEEN 1 AND 5),
  attr_kon INT NOT NULL DEFAULT 3 CHECK (attr_kon BETWEEN 1 AND 5),
  attr_en INT NOT NULL DEFAULT 3 CHECK (attr_en BETWEEN 1 AND 5),

  -- 得意言語（魔法言語）
  primary_language TEXT,
  secondary_language TEXT,

  -- 装備
  equipment_type TEXT CHECK (equipment_type IN ('武装型', '独立型', '半装身型', '全装身型', '搭乗型', '戦闘用搭乗型')),
  equipment_name TEXT,
  equipment_maker TEXT,
  equipment_detail TEXT,

  -- 侵食率
  erosion_rate INT DEFAULT 0 CHECK (erosion_rate BETWEEN 0 AND 100),

  -- 因縁・バックストーリー
  fate TEXT,
  backstory TEXT,

  -- 関連リンク
  related_anomalies TEXT,
  related_characters TEXT,
  related_factions TEXT
);

-- RLS
ALTER TABLE character_sheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read character_sheets"
  ON character_sheets FOR SELECT USING (true);
CREATE POLICY "Anyone can insert character_sheets"
  ON character_sheets FOR INSERT WITH CHECK (true);
CREATE POLICY "Owner can update character_sheets"
  ON character_sheets FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Owner can delete character_sheets"
  ON character_sheets FOR DELETE USING (true);
