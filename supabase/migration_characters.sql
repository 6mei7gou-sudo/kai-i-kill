-- =====================================================
-- キャラクターシート テーブル定義（新ルールブック対応）
-- 7能力値ランクD-S / 背景6種 / クラス5種 / サブカテゴリ
-- 得意・苦手言語 / 信念ポイント / 初期ギフト
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
  sub_affiliation TEXT,
  awakening TEXT NOT NULL CHECK (awakening IN ('先天覚醒型', 'ショック覚醒型', '実験覚醒型', '接触覚醒型')),

  -- 背景・クラス・ギフト
  background TEXT CHECK (background IN ('鋼の肉体','学者肌','霊媒体質','技術畑','ストリート上がり','信仰者')),
  class TEXT CHECK (class IN ('祓士','機甲士','魂使い','解明師','情報屋')),
  gift TEXT,

  -- 7能力値ランク（D,C,B,A,S）
  rank_tai TEXT NOT NULL DEFAULT 'D' CHECK (rank_tai IN ('D','C','B','A','S')),
  rank_haya TEXT NOT NULL DEFAULT 'D' CHECK (rank_haya IN ('D','C','B','A','S')),
  rank_shiki TEXT NOT NULL DEFAULT 'D' CHECK (rank_shiki IN ('D','C','B','A','S')),
  rank_han TEXT NOT NULL DEFAULT 'D' CHECK (rank_han IN ('D','C','B','A','S')),
  rank_shiya TEXT NOT NULL DEFAULT 'D' CHECK (rank_shiya IN ('D','C','B','A','S')),
  rank_jutsu TEXT NOT NULL DEFAULT 'D' CHECK (rank_jutsu IN ('D','C','B','A','S')),
  rank_kon TEXT NOT NULL DEFAULT 'D' CHECK (rank_kon IN ('D','C','B','A','S')),

  -- 得意/苦手言語（配列型）
  proficient_languages TEXT[] DEFAULT '{}',
  weak_languages TEXT[] DEFAULT '{}',

  -- 装備
  equipment_type TEXT CHECK (equipment_type IN ('武装型', '独立型', '半装身型', '全装身型', '搭乗型', '戦闘用搭乗型')),
  equipment_name TEXT,
  equipment_maker TEXT,
  equipment_detail TEXT,

  -- 侵食率・信念
  erosion_rate INT DEFAULT 0 CHECK (erosion_rate BETWEEN 0 AND 100),
  erosion_note TEXT,
  belief_points INT DEFAULT 5 CHECK (belief_points BETWEEN 0 AND 10),

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
