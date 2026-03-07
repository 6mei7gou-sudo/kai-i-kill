-- =====================================================
-- Webゲーム機能 テーブル定義
-- mission_results / adv_completions / character_achievements
-- =====================================================

-- ミッション戦績
CREATE TABLE mission_results (
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
CREATE POLICY "Anyone can read mission_results"
  ON mission_results FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert mission_results"
  ON mission_results FOR INSERT WITH CHECK (true);

-- ADVクリア記録
CREATE TABLE adv_completions (
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
CREATE POLICY "Anyone can read adv_completions"
  ON adv_completions FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert adv_completions"
  ON adv_completions FOR INSERT WITH CHECK (true);

-- キャラクター実績
CREATE TABLE character_achievements (
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
CREATE POLICY "Anyone can read character_achievements"
  ON character_achievements FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert character_achievements"
  ON character_achievements FOR INSERT WITH CHECK (true);
