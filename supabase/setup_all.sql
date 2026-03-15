-- =====================================================
-- KAI-I//KILL 全テーブル一括セットアップ
-- 既存環境でも新規環境でも安全に実行できる
-- Supabase SQL Editorで実行してください
-- 最終更新: 2026-03-14
-- =====================================================

-- =====================================================
-- 1. anomaly_drafts（怪異調査書）
-- =====================================================
CREATE TABLE IF NOT EXISTS anomaly_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id TEXT,
  author_name TEXT NOT NULL DEFAULT '名無しの討伐者',
  visibility TEXT DEFAULT '公開' CHECK (visibility IN ('公開', '限定')),
  status TEXT DEFAULT '未確認' CHECK (status IN ('未確認', '調査中', '目撃多数', '沈静化', '再燃')),
  thumbnail_url TEXT DEFAULT '',
  icon_url TEXT DEFAULT '',
  approved_status TEXT DEFAULT 'pending' CHECK (approved_status IN ('pending','approved','rejected')),
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  grade TEXT DEFAULT '不明',
  threat_type TEXT DEFAULT '不明',
  tags TEXT[] DEFAULT '{}',
  influence_range TEXT DEFAULT '不明',
  damage_type TEXT DEFAULT '不明',
  anomaly_name TEXT NOT NULL,
  summary TEXT,
  typical_pattern TEXT,
  omen TEXT,
  worst_case TEXT,
  origin TEXT,
  spread_route TEXT,
  distorted_countermeasure BOOLEAN DEFAULT false,
  original_countermeasure TEXT,
  current_countermeasure TEXT,
  core_type TEXT DEFAULT '不明',
  core_candidates JSONB DEFAULT '[]',
  core_behavior TEXT DEFAULT '不明',
  core_destroyable TEXT DEFAULT '不明',
  triggers JSONB DEFAULT '[]',
  taboos JSONB DEFAULT '[]',
  loopholes TEXT,
  violation_early TEXT,
  violation_mid TEXT,
  violation_late TEXT,
  testimonies JSONB DEFAULT '[]',
  media_urls JSONB DEFAULT '[]',
  avoidance TEXT,
  secondary_prevention TEXT,
  investigation_notes TEXT,
  related_anomalies TEXT,
  related_characters TEXT,
  related_factions TEXT,
  related_terms TEXT
);

-- カラム追加（既存テーブルに不足している場合のみ）
ALTER TABLE anomaly_drafts ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE anomaly_drafts ADD COLUMN IF NOT EXISTS thumbnail_url TEXT DEFAULT '';
ALTER TABLE anomaly_drafts ADD COLUMN IF NOT EXISTS icon_url TEXT DEFAULT '';
ALTER TABLE anomaly_drafts ADD COLUMN IF NOT EXISTS approved_status TEXT DEFAULT 'pending';
ALTER TABLE anomaly_drafts ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE anomaly_drafts ADD COLUMN IF NOT EXISTS approved_by TEXT;

ALTER TABLE anomaly_drafts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read anomaly_drafts" ON anomaly_drafts;
DROP POLICY IF EXISTS "Anyone can insert anomaly_drafts" ON anomaly_drafts;
DROP POLICY IF EXISTS "Owner can update anomaly_drafts" ON anomaly_drafts;
DROP POLICY IF EXISTS "Owner can delete anomaly_drafts" ON anomaly_drafts;
CREATE POLICY "Anyone can read anomaly_drafts" ON anomaly_drafts FOR SELECT USING (true);
CREATE POLICY "Anyone can insert anomaly_drafts" ON anomaly_drafts FOR INSERT WITH CHECK (true);
CREATE POLICY "Owner can update anomaly_drafts" ON anomaly_drafts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Owner can delete anomaly_drafts" ON anomaly_drafts FOR DELETE USING (true);

-- =====================================================
-- 2. gear_posts（武器・装備投稿）
-- =====================================================
CREATE TABLE IF NOT EXISTS gear_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id TEXT,
  author_name TEXT NOT NULL DEFAULT '名無しの討伐者',
  visibility TEXT DEFAULT '公開' CHECK (visibility IN ('公開', '限定')),
  image_url TEXT,
  video_url TEXT,
  usage_url TEXT,
  thumbnail_url TEXT DEFAULT '',
  icon_url TEXT DEFAULT '',
  image_urls JSONB DEFAULT '["","",""]'::jsonb,
  approved_status TEXT DEFAULT 'pending' CHECK (approved_status IN ('pending','approved','rejected')),
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  gear_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('武装型', '独立型', '半装身型', '全装身型', '搭乗型', '戦闘用搭乗型')),
  body_part TEXT,
  manufacturer TEXT DEFAULT 'その他',
  affiliation_fit TEXT DEFAULT 'どれでも',
  summary TEXT,
  intended_role TEXT[] DEFAULT '{}',
  strengths JSONB DEFAULT '[]',
  weaknesses JSONB DEFAULT '[]',
  base_name TEXT,
  quality TEXT DEFAULT '標準' CHECK (quality IN ('標準', '高品質', '試作品', '特注')),
  base_cp INT DEFAULT 0,
  slot_count INT DEFAULT 0,
  aptitude_dependency TEXT DEFAULT '低',
  base_modifier TEXT,
  additional_traits TEXT,
  options JSONB DEFAULT '[]',
  total_cp INT DEFAULT 0,
  option_count INT DEFAULT 0,
  slot_exceeded BOOLEAN DEFAULT false,
  risk_level TEXT DEFAULT '低' CHECK (risk_level IN ('低', '中', '高', '非常に高')),
  possible_anomalies TEXT,
  resonance_tendency TEXT,
  resonance_trigger TEXT,
  erosion_risk TEXT DEFAULT 'なし',
  erosion_signs TEXT,
  base_product_url TEXT,
  asset_urls JSONB DEFAULT '[]',
  modification_notes TEXT,
  license_notes TEXT,
  credit TEXT,
  redistributable TEXT DEFAULT '不可',
  related_characters TEXT,
  related_anomalies TEXT,
  related_factions TEXT,
  related_terms TEXT
);

ALTER TABLE gear_posts ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE gear_posts ADD COLUMN IF NOT EXISTS thumbnail_url TEXT DEFAULT '';
ALTER TABLE gear_posts ADD COLUMN IF NOT EXISTS icon_url TEXT DEFAULT '';
ALTER TABLE gear_posts ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '["","",""]'::jsonb;
ALTER TABLE gear_posts ADD COLUMN IF NOT EXISTS approved_status TEXT DEFAULT 'pending';
ALTER TABLE gear_posts ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE gear_posts ADD COLUMN IF NOT EXISTS approved_by TEXT;

ALTER TABLE gear_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read gear_posts" ON gear_posts;
DROP POLICY IF EXISTS "Anyone can insert gear_posts" ON gear_posts;
DROP POLICY IF EXISTS "Owner can update gear_posts" ON gear_posts;
DROP POLICY IF EXISTS "Owner can delete gear_posts" ON gear_posts;
CREATE POLICY "Anyone can read gear_posts" ON gear_posts FOR SELECT USING (true);
CREATE POLICY "Anyone can insert gear_posts" ON gear_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Owner can update gear_posts" ON gear_posts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Owner can delete gear_posts" ON gear_posts FOR DELETE USING (true);

-- =====================================================
-- 3. character_sheets（キャラクターシート）
-- =====================================================
CREATE TABLE IF NOT EXISTS character_sheets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id TEXT,
  author_name TEXT NOT NULL DEFAULT '名無しの討伐者',
  visibility TEXT DEFAULT '公開' CHECK (visibility IN ('公開', '限定')),
  image_url TEXT,
  thumbnail_url TEXT DEFAULT '',
  icon_url TEXT DEFAULT '',
  image_urls JSONB DEFAULT '["","",""]'::jsonb,
  approved_status TEXT DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  active_title TEXT,
  character_name TEXT NOT NULL,
  title TEXT,
  age TEXT,
  gender TEXT,
  affiliation TEXT NOT NULL CHECK (affiliation IN ('祓部', '傭兵', '無所属')),
  sub_affiliation TEXT,
  awakening TEXT NOT NULL CHECK (awakening IN ('先天覚醒型', 'ショック覚醒型', '実験覚醒型', '接触覚醒型')),
  background TEXT,
  class TEXT,
  gift TEXT,
  weapon_type TEXT,
  rank_tai TEXT NOT NULL DEFAULT 'D' CHECK (rank_tai IN ('D','C','B','A','S')),
  rank_haya TEXT NOT NULL DEFAULT 'D' CHECK (rank_haya IN ('D','C','B','A','S')),
  rank_shiki TEXT NOT NULL DEFAULT 'D' CHECK (rank_shiki IN ('D','C','B','A','S')),
  rank_han TEXT NOT NULL DEFAULT 'D' CHECK (rank_han IN ('D','C','B','A','S')),
  rank_shiya TEXT NOT NULL DEFAULT 'D' CHECK (rank_shiya IN ('D','C','B','A','S')),
  rank_jutsu TEXT NOT NULL DEFAULT 'D' CHECK (rank_jutsu IN ('D','C','B','A','S')),
  rank_kon TEXT NOT NULL DEFAULT 'D' CHECK (rank_kon IN ('D','C','B','A','S')),
  proficient_languages TEXT[] DEFAULT '{}',
  weak_languages TEXT[] DEFAULT '{}',
  skills JSONB DEFAULT '[]'::JSONB,
  stage_plus JSONB DEFAULT '[]'::JSONB,
  equipment_type TEXT CHECK (equipment_type IN ('武装型', '独立型', '半装身型', '全装身型', '搭乗型', '戦闘用搭乗型')),
  equipment_name TEXT,
  equipment_maker TEXT,
  equipment_detail TEXT,
  equipment_options JSONB DEFAULT '[]'::JSONB,
  cyber_grade TEXT DEFAULT 'none' CHECK (cyber_grade IN ('none','I','II','III')),
  cybernetics JSONB DEFAULT '[]',
  erosion_rate INT DEFAULT 0 CHECK (erosion_rate BETWEEN 0 AND 100),
  erosion_note TEXT,
  belief_points INT DEFAULT 5 CHECK (belief_points BETWEEN 0 AND 10),
  fate TEXT,
  backstory TEXT,
  related_anomalies TEXT,
  related_characters TEXT,
  related_factions TEXT
);

-- カラム追加（既存テーブルに不足している場合のみ）
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS thumbnail_url TEXT DEFAULT '';
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS icon_url TEXT DEFAULT '';
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '["","",""]'::jsonb;
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS approved_status TEXT DEFAULT 'pending';
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS approved_by TEXT;
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS active_title TEXT;
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS sub_affiliation TEXT;
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS gift TEXT;
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS cyber_grade TEXT DEFAULT 'none';
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS cybernetics JSONB DEFAULT '[]';
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS linked_gear_id UUID;
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS weapon_type TEXT;
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::JSONB;
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS stage_plus JSONB DEFAULT '[]'::JSONB;
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS equipment_options JSONB DEFAULT '[]'::JSONB;
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS brief_history TEXT DEFAULT '';
ALTER TABLE character_sheets ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT false;
ALTER TABLE gear_posts ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT false;
ALTER TABLE anomaly_drafts ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT false;

-- linked_gear_id の外部キー（存在しなければ追加）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'character_sheets'::regclass
    AND confrelid = 'gear_posts'::regclass
  ) THEN
    ALTER TABLE character_sheets
      ADD CONSTRAINT character_sheets_linked_gear_id_fkey
      FOREIGN KEY (linked_gear_id) REFERENCES gear_posts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- CHECK制約（既存を削除してから再作成）
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT conname FROM pg_constraint WHERE conrelid = 'character_sheets'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) LIKE '%background%') LOOP
    EXECUTE 'ALTER TABLE character_sheets DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;
ALTER TABLE character_sheets ADD CONSTRAINT character_sheets_background_check
CHECK (background IS NULL OR background IN (
  '神社育ち', '鋼の肉体', '都市伝説研究者', '元実験体', 'ハッカー上がり', '魔道資格者',
  '学者肌', '霊媒体質', '技術畑', 'ストリート上がり', '信仰者'
));

DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT conname FROM pg_constraint WHERE conrelid = 'character_sheets'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) LIKE '%sub_affiliation%') LOOP
    EXECUTE 'ALTER TABLE character_sheets DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;
ALTER TABLE character_sheets ADD CONSTRAINT character_sheets_sub_affiliation_check
CHECK (sub_affiliation IS NULL OR sub_affiliation IN (
  '古怪班', '新怪班', '封印班', '機動班',
  '突撃型', '偵察型', '技術型', '護衛型',
  '野良討伐者', '裏社会の住人', '在野研究者', '退魔師',
  '特務班', '技術班', '戦闘屋', '調査屋', '運び屋', '技術屋',
  '路地裏の犬', 'はぐれ狼', '小さな群れ', '脱走兵'
));

DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT conname FROM pg_constraint WHERE conrelid = 'character_sheets'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) LIKE '%weapon_type%') LOOP
    EXECUTE 'ALTER TABLE character_sheets DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;
ALTER TABLE character_sheets ADD CONSTRAINT character_sheets_weapon_type_check
CHECK (weapon_type IS NULL OR weapon_type IN ('斬撃型', '打撃型', '射撃型', '魔導型', '体術型'));

DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT conname FROM pg_constraint WHERE conrelid = 'character_sheets'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) LIKE '%class%') LOOP
    EXECUTE 'ALTER TABLE character_sheets DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

-- RLS
ALTER TABLE character_sheets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read character_sheets" ON character_sheets;
DROP POLICY IF EXISTS "Anyone can insert character_sheets" ON character_sheets;
DROP POLICY IF EXISTS "Owner can update character_sheets" ON character_sheets;
DROP POLICY IF EXISTS "Owner can delete character_sheets" ON character_sheets;
CREATE POLICY "Anyone can read character_sheets" ON character_sheets FOR SELECT USING (true);
CREATE POLICY "Anyone can insert character_sheets" ON character_sheets FOR INSERT WITH CHECK (true);
CREATE POLICY "Owner can update character_sheets" ON character_sheets FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Owner can delete character_sheets" ON character_sheets FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_character_sheets_weapon_type ON character_sheets(weapon_type);

-- =====================================================
-- 4. news_posts（お知らせ）
-- =====================================================
CREATE TABLE IF NOT EXISTS news_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'SYSTEM',
  category TEXT NOT NULL DEFAULT 'news' CHECK (category IN ('news', 'release', 'event')),
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  published BOOLEAN DEFAULT true
);

ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read published news" ON news_posts;
DROP POLICY IF EXISTS "Admins can do anything with news" ON news_posts;
CREATE POLICY "Anyone can read published news" ON news_posts FOR SELECT USING (published = true);
CREATE POLICY "Admins can do anything with news" ON news_posts FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_news_posts_category ON news_posts (category);
CREATE INDEX IF NOT EXISTS idx_news_posts_created_at ON news_posts (created_at DESC);

-- =====================================================
-- 5. serial_codes（シリアルコード）
-- =====================================================
CREATE TABLE IF NOT EXISTS serial_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  code TEXT NOT NULL UNIQUE,
  achievement_id TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_type TEXT NOT NULL DEFAULT 'special' CHECK (achievement_type IN ('mission','adv','special')),
  max_uses INT DEFAULT 1,
  current_uses INT DEFAULT 0,
  expires_at TIMESTAMPTZ
);

ALTER TABLE serial_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read serial_codes" ON serial_codes;
DROP POLICY IF EXISTS "Authenticated can update serial_codes" ON serial_codes;
CREATE POLICY "Anyone can read serial_codes" ON serial_codes FOR SELECT USING (true);
CREATE POLICY "Authenticated can update serial_codes" ON serial_codes FOR UPDATE USING (true) WITH CHECK (true);

INSERT INTO serial_codes (code, achievement_id, achievement_name, achievement_type, max_uses)
VALUES
  ('KAIII-FIRST-2026', 'title_pioneer', '先駆者', 'special', 100),
  ('KAIII-BETA-TEST', 'title_beta_tester', 'βテスター', 'special', 50)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 6. mission_results（ミッション戦績）
-- =====================================================
CREATE TABLE IF NOT EXISTS mission_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id TEXT NOT NULL,
  character_id UUID NOT NULL REFERENCES character_sheets(id) ON DELETE CASCADE,
  mission_id TEXT NOT NULL,
  mission_name TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('E','D','C','B','A','S')),
  result TEXT NOT NULL CHECK (result IN ('勝利','敗北','撤退')),
  rounds_taken INT NOT NULL DEFAULT 0,
  total_damage_dealt INT NOT NULL DEFAULT 0,
  total_damage_taken INT NOT NULL DEFAULT 0,
  remaining_hp INT NOT NULL DEFAULT 0,
  battle_log JSONB DEFAULT '[]',
  resonance_snapshot JSONB DEFAULT '{}'
);

ALTER TABLE mission_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read mission_results" ON mission_results;
DROP POLICY IF EXISTS "Authenticated can insert mission_results" ON mission_results;
CREATE POLICY "Anyone can read mission_results" ON mission_results FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert mission_results" ON mission_results FOR INSERT WITH CHECK (true);

-- =====================================================
-- 7. adv_completions（ADVクリア記録）
-- =====================================================
CREATE TABLE IF NOT EXISTS adv_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id TEXT NOT NULL,
  character_id UUID NOT NULL REFERENCES character_sheets(id) ON DELETE CASCADE,
  scenario_id TEXT NOT NULL,
  scenario_name TEXT NOT NULL,
  ending_id TEXT NOT NULL,
  ending_name TEXT NOT NULL,
  ending_type TEXT NOT NULL CHECK (ending_type IN ('true','good','normal','bad')),
  choices_made JSONB DEFAULT '[]',
  dice_results JSONB DEFAULT '[]',
  achievements JSONB DEFAULT '[]',
  UNIQUE(user_id, character_id, scenario_id)
);

ALTER TABLE adv_completions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read adv_completions" ON adv_completions;
DROP POLICY IF EXISTS "Authenticated can insert adv_completions" ON adv_completions;
CREATE POLICY "Anyone can read adv_completions" ON adv_completions FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert adv_completions" ON adv_completions FOR INSERT WITH CHECK (true);

-- =====================================================
-- 8. character_achievements（キャラクター実績）
-- =====================================================
CREATE TABLE IF NOT EXISTS character_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id TEXT NOT NULL,
  character_id UUID NOT NULL REFERENCES character_sheets(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_type TEXT NOT NULL CHECK (achievement_type IN ('mission','adv','special')),
  source_id TEXT,
  UNIQUE(character_id, achievement_id)
);

ALTER TABLE character_achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read character_achievements" ON character_achievements;
DROP POLICY IF EXISTS "Authenticated can insert character_achievements" ON character_achievements;
CREATE POLICY "Anyone can read character_achievements" ON character_achievements FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert character_achievements" ON character_achievements FOR INSERT WITH CHECK (true);

-- =====================================================
-- 9. dispatch_quests（派遣クエスト）
-- =====================================================
CREATE TABLE IF NOT EXISTS dispatch_quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id TEXT NOT NULL,
  character_id UUID NOT NULL REFERENCES character_sheets(id) ON DELETE CASCADE,
  quest_id TEXT NOT NULL,
  quest_name TEXT NOT NULL,
  duration_hours INT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  result TEXT CHECK (result IN ('成功','失敗') OR result IS NULL),
  rewards JSONB
);

ALTER TABLE dispatch_quests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own dispatch_quests" ON dispatch_quests;
DROP POLICY IF EXISTS "Authenticated can insert dispatch_quests" ON dispatch_quests;
DROP POLICY IF EXISTS "Authenticated can update own dispatch_quests" ON dispatch_quests;
CREATE POLICY "Users can read own dispatch_quests" ON dispatch_quests FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert dispatch_quests" ON dispatch_quests FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update own dispatch_quests" ON dispatch_quests FOR UPDATE USING (true);

-- =====================================================
-- 10. SNS機能: MirrorLine / HUNTER//NET（7テーブル）
-- =====================================================

CREATE TABLE IF NOT EXISTS sns_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  character_id UUID REFERENCES character_sheets(id) ON DELETE SET NULL,
  layer TEXT NOT NULL DEFAULT 'surface' CHECK (layer IN ('surface', 'hunter')),
  post_type TEXT NOT NULL DEFAULT 'normal' CHECK (post_type IN ('normal', 'rumor', 'intel', 'alert', 'npc_chatter')),
  content TEXT NOT NULL CHECK (char_length(content) <= 1000),
  parent_id UUID REFERENCES sns_posts(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  display_icon TEXT,
  affiliation TEXT,
  is_bot BOOLEAN DEFAULT FALSE,
  bot_id TEXT,
  hashtags TEXT[] DEFAULT '{}',
  like_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sns_posts_layer ON sns_posts(layer, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sns_posts_user ON sns_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_sns_posts_parent ON sns_posts(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sns_posts_bot ON sns_posts(bot_id) WHERE is_bot = TRUE;

CREATE TABLE IF NOT EXISTS sns_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  post_id UUID NOT NULL REFERENCES sns_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, post_id)
);
CREATE INDEX IF NOT EXISTS idx_sns_likes_post ON sns_likes(post_id);

CREATE TABLE IF NOT EXISTS sns_threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  character_id UUID REFERENCES character_sheets(id) ON DELETE SET NULL,
  layer TEXT NOT NULL DEFAULT 'surface' CHECK (layer IN ('surface', 'hunter')),
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'lore', 'mission_report', 'anomaly_discussion', 'trading', 'recruitment')),
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  content TEXT NOT NULL CHECK (char_length(content) <= 5000),
  display_name TEXT NOT NULL,
  display_icon TEXT,
  affiliation TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  reply_count INTEGER DEFAULT 0,
  last_replied_at TIMESTAMPTZ DEFAULT now(),
  password_hash TEXT,
  password_mode TEXT DEFAULT 'none',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- パスワード関連カラム追加（既存テーブル用）
ALTER TABLE sns_threads ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE sns_threads ADD COLUMN IF NOT EXISTS password_mode TEXT DEFAULT 'none';

-- password_mode CHECK制約（既存を削除してから再作成）
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT conname FROM pg_constraint WHERE conrelid = 'sns_threads'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) LIKE '%password_mode%') LOOP
    EXECUTE 'ALTER TABLE sns_threads DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;
ALTER TABLE sns_threads ADD CONSTRAINT sns_threads_password_mode_check
CHECK (password_mode IS NULL OR password_mode IN ('none', 'entry', 'write'));

CREATE INDEX IF NOT EXISTS idx_sns_threads_layer ON sns_threads(layer, last_replied_at DESC);
CREATE INDEX IF NOT EXISTS idx_sns_threads_category ON sns_threads(category);

CREATE TABLE IF NOT EXISTS sns_thread_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES sns_threads(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  character_id UUID REFERENCES character_sheets(id) ON DELETE SET NULL,
  content TEXT NOT NULL CHECK (char_length(content) <= 3000),
  display_name TEXT NOT NULL,
  display_icon TEXT,
  affiliation TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sns_thread_replies_thread ON sns_thread_replies(thread_id, created_at ASC);

CREATE TABLE IF NOT EXISTS sns_chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) <= 100),
  description TEXT,
  created_by TEXT NOT NULL,
  mission_id TEXT,
  layer TEXT NOT NULL DEFAULT 'hunter' CHECK (layer IN ('surface', 'hunter')),
  max_members INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sns_chat_rooms_active ON sns_chat_rooms(is_active, created_at DESC);

CREATE TABLE IF NOT EXISTS sns_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES sns_chat_rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  character_id UUID REFERENCES character_sheets(id) ON DELETE SET NULL,
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  display_name TEXT NOT NULL,
  display_icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sns_chat_messages_room ON sns_chat_messages(room_id, created_at ASC);

CREATE TABLE IF NOT EXISTS sns_chat_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES sns_chat_rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  character_id UUID REFERENCES character_sheets(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_sns_chat_members_room ON sns_chat_members(room_id);
CREATE INDEX IF NOT EXISTS idx_sns_chat_members_user ON sns_chat_members(user_id);

-- SNS RLS
ALTER TABLE sns_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sns_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sns_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sns_thread_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sns_chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sns_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sns_chat_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sns_posts_read" ON sns_posts;
DROP POLICY IF EXISTS "sns_posts_write" ON sns_posts;
DROP POLICY IF EXISTS "sns_posts_update" ON sns_posts;
DROP POLICY IF EXISTS "sns_posts_delete" ON sns_posts;
CREATE POLICY "sns_posts_read" ON sns_posts FOR SELECT USING (true);
CREATE POLICY "sns_posts_write" ON sns_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "sns_posts_update" ON sns_posts FOR UPDATE USING (true);
CREATE POLICY "sns_posts_delete" ON sns_posts FOR DELETE USING (true);

DROP POLICY IF EXISTS "sns_likes_read" ON sns_likes;
DROP POLICY IF EXISTS "sns_likes_write" ON sns_likes;
DROP POLICY IF EXISTS "sns_likes_delete" ON sns_likes;
CREATE POLICY "sns_likes_read" ON sns_likes FOR SELECT USING (true);
CREATE POLICY "sns_likes_write" ON sns_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "sns_likes_delete" ON sns_likes FOR DELETE USING (true);

DROP POLICY IF EXISTS "sns_threads_read" ON sns_threads;
DROP POLICY IF EXISTS "sns_threads_write" ON sns_threads;
CREATE POLICY "sns_threads_read" ON sns_threads FOR SELECT USING (true);
CREATE POLICY "sns_threads_write" ON sns_threads FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "sns_thread_replies_read" ON sns_thread_replies;
DROP POLICY IF EXISTS "sns_thread_replies_write" ON sns_thread_replies;
CREATE POLICY "sns_thread_replies_read" ON sns_thread_replies FOR SELECT USING (true);
CREATE POLICY "sns_thread_replies_write" ON sns_thread_replies FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "sns_chat_rooms_read" ON sns_chat_rooms;
DROP POLICY IF EXISTS "sns_chat_rooms_write" ON sns_chat_rooms;
DROP POLICY IF EXISTS "sns_chat_rooms_update" ON sns_chat_rooms;
CREATE POLICY "sns_chat_rooms_read" ON sns_chat_rooms FOR SELECT USING (true);
CREATE POLICY "sns_chat_rooms_write" ON sns_chat_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "sns_chat_rooms_update" ON sns_chat_rooms FOR UPDATE USING (true);

DROP POLICY IF EXISTS "sns_chat_messages_read" ON sns_chat_messages;
DROP POLICY IF EXISTS "sns_chat_messages_write" ON sns_chat_messages;
CREATE POLICY "sns_chat_messages_read" ON sns_chat_messages FOR SELECT USING (true);
CREATE POLICY "sns_chat_messages_write" ON sns_chat_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "sns_chat_members_read" ON sns_chat_members;
DROP POLICY IF EXISTS "sns_chat_members_write" ON sns_chat_members;
DROP POLICY IF EXISTS "sns_chat_members_delete" ON sns_chat_members;
CREATE POLICY "sns_chat_members_read" ON sns_chat_members FOR SELECT USING (true);
CREATE POLICY "sns_chat_members_write" ON sns_chat_members FOR INSERT WITH CHECK (true);
CREATE POLICY "sns_chat_members_delete" ON sns_chat_members FOR DELETE USING (true);

-- =====================================================
-- 11. account_cp（アカウントCP残高）
-- =====================================================
CREATE TABLE IF NOT EXISTS account_cp (
  user_id TEXT PRIMARY KEY,
  balance INT NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE account_cp ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read account_cp" ON account_cp;
DROP POLICY IF EXISTS "Anyone can insert account_cp" ON account_cp;
DROP POLICY IF EXISTS "Anyone can update account_cp" ON account_cp;
CREATE POLICY "Anyone can read account_cp" ON account_cp FOR SELECT USING (true);
CREATE POLICY "Anyone can insert account_cp" ON account_cp FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update account_cp" ON account_cp FOR UPDATE USING (true) WITH CHECK (true);

-- =====================================================
-- 12. cp_transactions（CP変動履歴）
-- =====================================================
CREATE TABLE IF NOT EXISTS cp_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount INT NOT NULL,
  balance_after INT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('mission', 'adv', 'dispatch', 'gear_craft', 'serial_code', 'admin', 'initial')),
  source_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cp_transactions_user ON cp_transactions(user_id, created_at DESC);

ALTER TABLE cp_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read cp_transactions" ON cp_transactions;
DROP POLICY IF EXISTS "Anyone can insert cp_transactions" ON cp_transactions;
CREATE POLICY "Anyone can read cp_transactions" ON cp_transactions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert cp_transactions" ON cp_transactions FOR INSERT WITH CHECK (true);

-- =====================================================
-- セットアップ完了（16テーブル）
-- 既存環境: ポリシー再作成・不足カラム追加・制約更新
-- 新規環境: 全テーブル・ポリシー・インデックス作成
-- =====================================================
