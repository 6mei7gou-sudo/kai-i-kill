-- =====================================================
-- Supabase テーブル定義
-- SupabaseダッシュボードのSQL Editorで実行
-- =====================================================

-- 怪異調査書（TMP）テーブル
CREATE TABLE anomaly_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- メタ情報
  author_name TEXT NOT NULL DEFAULT '名無しの討伐者',
  visibility TEXT DEFAULT '公開' CHECK (visibility IN ('公開', '限定')),
  status TEXT DEFAULT '未確認' CHECK (status IN ('未確認', '調査中', '目撃多数', '沈静化', '再燃')),

  -- 暫定分類
  grade TEXT DEFAULT '不明',
  threat_type TEXT DEFAULT '不明',
  tags TEXT[] DEFAULT '{}',
  influence_range TEXT DEFAULT '不明',
  damage_type TEXT DEFAULT '不明',

  -- 概要
  anomaly_name TEXT NOT NULL,
  summary TEXT,
  typical_pattern TEXT,
  omen TEXT,
  worst_case TEXT,

  -- 発生源・拡散
  origin TEXT,
  spread_route TEXT,
  distorted_countermeasure BOOLEAN DEFAULT false,
  original_countermeasure TEXT,
  current_countermeasure TEXT,

  -- 核の推定
  core_type TEXT DEFAULT '不明',
  core_candidates JSONB DEFAULT '[]',
  core_behavior TEXT DEFAULT '不明',
  core_destroyable TEXT DEFAULT '不明',

  -- ルール推定
  triggers JSONB DEFAULT '[]',
  taboos JSONB DEFAULT '[]',
  loopholes TEXT,
  violation_early TEXT,
  violation_mid TEXT,
  violation_late TEXT,

  -- 観測記録
  testimonies JSONB DEFAULT '[]',
  media_urls JSONB DEFAULT '[]',

  -- 暫定対処
  avoidance TEXT,
  secondary_prevention TEXT,
  investigation_notes TEXT,

  -- 関連リンク
  related_anomalies TEXT,
  related_characters TEXT,
  related_factions TEXT,
  related_terms TEXT
);

-- 武器・装備投稿テーブル
CREATE TABLE gear_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- メタ情報
  author_name TEXT NOT NULL DEFAULT '名無しの討伐者',
  visibility TEXT DEFAULT '公開' CHECK (visibility IN ('公開', '限定')),
  image_url TEXT,
  video_url TEXT,
  usage_url TEXT,

  -- 装備カテゴリ
  gear_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('武装型', '独立型', '半装身型', '全装身型', '搭乗型', '戦闘用搭乗型')),
  body_part TEXT,
  manufacturer TEXT DEFAULT 'その他',
  affiliation_fit TEXT DEFAULT 'どれでも',

  -- 概要
  summary TEXT,
  intended_role TEXT[] DEFAULT '{}',
  strengths JSONB DEFAULT '[]',
  weaknesses JSONB DEFAULT '[]',

  -- ベース装備
  base_name TEXT,
  quality TEXT DEFAULT '標準' CHECK (quality IN ('標準', '高品質', '試作品', '特注')),
  base_cp INT DEFAULT 0,
  slot_count INT DEFAULT 0,
  aptitude_dependency TEXT DEFAULT '低',
  base_modifier TEXT,
  additional_traits TEXT,

  -- カスタム構成
  options JSONB DEFAULT '[]',
  total_cp INT DEFAULT 0,
  option_count INT DEFAULT 0,
  slot_exceeded BOOLEAN DEFAULT false,

  -- 怪異発生リスク
  risk_level TEXT DEFAULT '低' CHECK (risk_level IN ('低', '中', '高', '非常に高')),
  possible_anomalies TEXT,

  -- 共鳴・侵食
  resonance_tendency TEXT,
  resonance_trigger TEXT,
  erosion_risk TEXT DEFAULT 'なし',
  erosion_signs TEXT,

  -- VRC改変情報
  base_product_url TEXT,
  asset_urls JSONB DEFAULT '[]',
  modification_notes TEXT,
  license_notes TEXT,
  credit TEXT,
  redistributable TEXT DEFAULT '不可',

  -- 関連リンク
  related_characters TEXT,
  related_anomalies TEXT,
  related_factions TEXT,
  related_terms TEXT
);

-- RLS（Row Level Security）を有効化
-- 一旦全員読み書き可能にしておく（Auth実装時に制限）
ALTER TABLE anomaly_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gear_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read anomaly_drafts"
  ON anomaly_drafts FOR SELECT USING (true);
CREATE POLICY "Anyone can insert anomaly_drafts"
  ON anomaly_drafts FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read gear_posts"
  ON gear_posts FOR SELECT USING (true);
CREATE POLICY "Anyone can insert gear_posts"
  ON gear_posts FOR INSERT WITH CHECK (true);
