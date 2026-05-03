-- =====================================================
-- 怪異調査書 二次創作ガイドラインカラム追加
-- 2026-05-04：怪異作者の二次創作ポリシーを記録するJSONBカラム
-- =====================================================

ALTER TABLE anomaly_drafts
  ADD COLUMN IF NOT EXISTS fanart_policy JSONB DEFAULT NULL;
