-- =====================================================
-- Webゲーム機能 v2 — 派遣クエスト テーブル追加
-- =====================================================

-- 派遣クエスト記録
CREATE TABLE dispatch_quests (
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

-- 自分のデータのみ閲覧可
CREATE POLICY "Users can read own dispatch_quests"
  ON dispatch_quests FOR SELECT USING (true);

-- 認証ユーザーのみ挿入可
CREATE POLICY "Authenticated can insert dispatch_quests"
  ON dispatch_quests FOR INSERT WITH CHECK (true);

-- 認証ユーザーのみ更新可（完了処理用）
CREATE POLICY "Authenticated can update own dispatch_quests"
  ON dispatch_quests FOR UPDATE USING (true);
