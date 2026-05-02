-- =====================================================
-- ステータスポイント機能マイグレーション
-- 5レベルごとに能力値ランクを1段階上げられるポイントを管理
-- 利用可能ポイント = floor(level/5) - status_points_used
-- =====================================================

ALTER TABLE character_sheets
  ADD COLUMN IF NOT EXISTS status_points_used INT NOT NULL DEFAULT 0;

-- 既存キャラは status_points_used = 0 でスタート
-- レベルがすでに5以上のキャラは、その時点で利用可能ポイントが存在する状態になる
