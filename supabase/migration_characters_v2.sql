-- =====================================================
-- キャラクターシート v2 マイグレーション
-- 新ルールブック（7能力値ランク制 + 背景 + クラス + 得意/苦手言語）対応
-- Supabase SQL Editorで実行してください
-- =====================================================

-- ■ 旧カラムの削除（属性値・言語）
ALTER TABLE character_sheets DROP COLUMN IF EXISTS attr_shiya;
ALTER TABLE character_sheets DROP COLUMN IF EXISTS attr_shiki;
ALTER TABLE character_sheets DROP COLUMN IF EXISTS attr_tai;
ALTER TABLE character_sheets DROP COLUMN IF EXISTS attr_jutsu;
ALTER TABLE character_sheets DROP COLUMN IF EXISTS attr_kon;
ALTER TABLE character_sheets DROP COLUMN IF EXISTS attr_en;
ALTER TABLE character_sheets DROP COLUMN IF EXISTS primary_language;
ALTER TABLE character_sheets DROP COLUMN IF EXISTS secondary_language;

-- ■ 新カラム追加：7能力値ランク（D,C,B,A,S）
ALTER TABLE character_sheets ADD COLUMN rank_tai TEXT NOT NULL DEFAULT 'D' CHECK (rank_tai IN ('D','C','B','A','S'));
ALTER TABLE character_sheets ADD COLUMN rank_haya TEXT NOT NULL DEFAULT 'D' CHECK (rank_haya IN ('D','C','B','A','S'));
ALTER TABLE character_sheets ADD COLUMN rank_shiki TEXT NOT NULL DEFAULT 'D' CHECK (rank_shiki IN ('D','C','B','A','S'));
ALTER TABLE character_sheets ADD COLUMN rank_han TEXT NOT NULL DEFAULT 'D' CHECK (rank_han IN ('D','C','B','A','S'));
ALTER TABLE character_sheets ADD COLUMN rank_shiya TEXT NOT NULL DEFAULT 'D' CHECK (rank_shiya IN ('D','C','B','A','S'));
ALTER TABLE character_sheets ADD COLUMN rank_jutsu TEXT NOT NULL DEFAULT 'D' CHECK (rank_jutsu IN ('D','C','B','A','S'));
ALTER TABLE character_sheets ADD COLUMN rank_kon TEXT NOT NULL DEFAULT 'D' CHECK (rank_kon IN ('D','C','B','A','S'));

-- ■ 新カラム追加：背景・クラス
ALTER TABLE character_sheets ADD COLUMN background TEXT CHECK (background IN ('祓部','個人傭兵','所属傭兵','特異点','野良犬'));
ALTER TABLE character_sheets ADD COLUMN class TEXT CHECK (class IN ('祓士','機甲士','魂使い','解明師','情報屋'));

-- ■ 新カラム追加：得意/苦手言語（配列型）
ALTER TABLE character_sheets ADD COLUMN proficient_languages TEXT[] DEFAULT '{}';
ALTER TABLE character_sheets ADD COLUMN weak_languages TEXT[] DEFAULT '{}';

-- ■ 新カラム追加：信念ポイント
ALTER TABLE character_sheets ADD COLUMN belief_points INT DEFAULT 5 CHECK (belief_points BETWEEN 0 AND 10);

-- ■ 新カラム追加：初期侵食率メモ（背景・覚醒由来の加算を記録）
ALTER TABLE character_sheets ADD COLUMN erosion_note TEXT;
