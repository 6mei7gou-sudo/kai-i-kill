-- =====================================================
-- アカウントCP（カスタマイズポイント）マイグレーション
-- account_cp: ユーザーごとのCP残高
-- cp_transactions: CP変動の履歴（監査ログ）
-- =====================================================

-- 1. account_cp — ユーザーごとのCP残高
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

-- 2. cp_transactions — CP変動の履歴
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
