-- =====================================================
-- セキュリティ強化マイグレーション（2026-09-11 セキュリティレビュー F01/F08/F10 対応）
--
-- 【適用前に必ず行うこと】
--   1. Supabase ダッシュボード → Project Settings → API から service_role キーを取得し、
--      Vercel（本番・プレビュー）の環境変数 SUPABASE_SERVICE_ROLE_KEY に設定してデプロイする。
--      ※ NEXT_PUBLIC_ を付けない。ブラウザーに出してはいけない。
--   2. デプロイ後にこのファイルを Supabase SQL Editor で実行する。
--   順序を逆にすると、APIルート（anon キー接続）の書き込みがすべて失敗する。
--
-- 【内容】
--   A. anon / authenticated ロールからの INSERT / UPDATE / DELETE を全テーブルで廃止
--      （書き込みは service role で接続する Next.js API ルートのみ）
--   B. 直接読取（ブラウザーの anon キー）は公開コンテンツのみ許可
--      - 非公開テーブル（reports / user_migration_map / account_cp / cp_transactions /
--        serial_codes / dispatch_quests / mission_results / adv_completions）は anon から読めない
--      - novels は visibility = '公開'、news_posts / official_characters は published = true のみ
--      - sns_threads は入場制限（password_mode = 'entry'）スレッドを除外
--      - sns_thread_replies は入場制限スレッドの返信を除外
--   C. CP残高の原子的更新 RPC cp_adjust()（残高更新と履歴挿入を1トランザクションで実行）
--   D. SNS の like_count / reply_count をトリガーで自動維持（アプリ側の手動更新を廃止）
-- =====================================================

-- -----------------------------------------------------
-- A. 既存の全許可ポリシーを削除
-- -----------------------------------------------------
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'anomaly_drafts','gear_posts','character_sheets','novels',
        'news_posts','official_characters','serial_codes',
        'mission_results','adv_completions','character_achievements','dispatch_quests',
        'sns_posts','sns_likes','sns_threads','sns_thread_replies',
        'sns_chat_rooms','sns_chat_messages','sns_chat_members',
        'account_cp','cp_transactions','reports','user_migration_map'
      )
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- RLS を有効化（既に有効でも安全）
ALTER TABLE anomaly_drafts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE gear_posts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_sheets      ENABLE ROW LEVEL SECURITY;
ALTER TABLE novels                ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_posts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_characters   ENABLE ROW LEVEL SECURITY;
ALTER TABLE serial_codes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_results       ENABLE ROW LEVEL SECURITY;
ALTER TABLE adv_completions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch_quests       ENABLE ROW LEVEL SECURITY;
ALTER TABLE sns_posts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE sns_likes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE sns_threads           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sns_thread_replies    ENABLE ROW LEVEL SECURITY;
ALTER TABLE sns_chat_rooms        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sns_chat_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE sns_chat_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_cp            ENABLE ROW LEVEL SECURITY;
ALTER TABLE cp_transactions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports               ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_migration_map    ENABLE ROW LEVEL SECURITY;

-- テーブル権限でも書き込みを閉じる（RLS はテーブル権限と組み合わせて評価される）
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON
  anomaly_drafts, gear_posts, character_sheets, novels,
  news_posts, official_characters, serial_codes,
  mission_results, adv_completions, character_achievements, dispatch_quests,
  sns_posts, sns_likes, sns_threads, sns_thread_replies,
  sns_chat_rooms, sns_chat_messages, sns_chat_members,
  account_cp, cp_transactions, reports, user_migration_map
FROM anon, authenticated;

-- 非公開テーブルは SELECT も閉じる
REVOKE SELECT ON
  serial_codes, mission_results, adv_completions, dispatch_quests,
  account_cp, cp_transactions, reports, user_migration_map
FROM anon, authenticated;

-- -----------------------------------------------------
-- B. 公開読取ポリシー（anon / authenticated 向け。service role は RLS をバイパスする）
-- -----------------------------------------------------
CREATE POLICY "public_read_anomaly_drafts" ON anomaly_drafts
  FOR SELECT TO anon, authenticated USING (COALESCE(visibility, '公開') = '公開');

CREATE POLICY "public_read_gear_posts" ON gear_posts
  FOR SELECT TO anon, authenticated USING (COALESCE(visibility, '公開') = '公開');

CREATE POLICY "public_read_character_sheets" ON character_sheets
  FOR SELECT TO anon, authenticated USING (COALESCE(visibility, '公開') = '公開');

CREATE POLICY "public_read_novels" ON novels
  FOR SELECT TO anon, authenticated USING (COALESCE(visibility, '公開') = '公開');

CREATE POLICY "public_read_news_posts" ON news_posts
  FOR SELECT TO anon, authenticated USING (published = true);

CREATE POLICY "public_read_official_characters" ON official_characters
  FOR SELECT TO anon, authenticated USING (published = true);

CREATE POLICY "public_read_character_achievements" ON character_achievements
  FOR SELECT TO anon, authenticated USING (true);

-- SNS：タイムライン・チャット・スレッドの Realtime 購読（postgres_changes）に SELECT 権限が必要
CREATE POLICY "public_read_sns_posts" ON sns_posts
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "public_read_sns_likes" ON sns_likes
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "public_read_sns_threads" ON sns_threads
  FOR SELECT TO anon, authenticated USING (COALESCE(password_mode, 'none') <> 'entry');

CREATE POLICY "public_read_sns_thread_replies" ON sns_thread_replies
  FOR SELECT TO anon, authenticated USING (
    EXISTS (
      SELECT 1 FROM sns_threads t
      WHERE t.id = sns_thread_replies.thread_id
        AND COALESCE(t.password_mode, 'none') <> 'entry'
    )
  );

CREATE POLICY "public_read_sns_chat_rooms" ON sns_chat_rooms
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "public_read_sns_chat_messages" ON sns_chat_messages
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "public_read_sns_chat_members" ON sns_chat_members
  FOR SELECT TO anon, authenticated USING (true);

-- -----------------------------------------------------
-- C. CP残高の原子的更新（F08）
--    残高の条件付き UPDATE と履歴 INSERT を同一トランザクションで行う。
--    残高不足のときは例外 'CP_INSUFFICIENT' を投げる。
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION cp_adjust(
  p_user_id TEXT,
  p_amount INT,
  p_source_type TEXT,
  p_source_id TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
) RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance INT;
BEGIN
  IF p_amount = 0 THEN
    RAISE EXCEPTION 'CP_INVALID_AMOUNT';
  END IF;

  -- アカウントが無ければ初期残高10で作成
  INSERT INTO account_cp (user_id, balance)
  VALUES (p_user_id, 10)
  ON CONFLICT (user_id) DO NOTHING;

  IF FOUND THEN
    INSERT INTO cp_transactions (user_id, amount, balance_after, source_type, description)
    VALUES (p_user_id, 10, 10, 'initial', '初期CP付与');
  END IF;

  UPDATE account_cp
  SET balance = balance + p_amount, updated_at = now()
  WHERE user_id = p_user_id AND balance + p_amount >= 0
  RETURNING balance INTO v_balance;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'CP_INSUFFICIENT';
  END IF;

  INSERT INTO cp_transactions (user_id, amount, balance_after, source_type, source_id, description)
  VALUES (p_user_id, p_amount, v_balance, p_source_type, p_source_id, p_description);

  RETURN v_balance;
END;
$$;

REVOKE ALL ON FUNCTION cp_adjust(TEXT, INT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;

-- -----------------------------------------------------
-- D. SNS カウンターのトリガー維持（F10）
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION sns_likes_count_trigger() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE sns_posts SET like_count = COALESCE(like_count, 0) + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE sns_posts SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sns_likes_count ON sns_likes;
CREATE TRIGGER trg_sns_likes_count
  AFTER INSERT OR DELETE ON sns_likes
  FOR EACH ROW EXECUTE FUNCTION sns_likes_count_trigger();

CREATE OR REPLACE FUNCTION sns_posts_reply_count_trigger() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
    UPDATE sns_posts SET reply_count = COALESCE(reply_count, 0) + 1 WHERE id = NEW.parent_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
    UPDATE sns_posts SET reply_count = GREATEST(COALESCE(reply_count, 0) - 1, 0) WHERE id = OLD.parent_id;
    RETURN OLD;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_sns_posts_reply_count ON sns_posts;
CREATE TRIGGER trg_sns_posts_reply_count
  AFTER INSERT OR DELETE ON sns_posts
  FOR EACH ROW EXECUTE FUNCTION sns_posts_reply_count_trigger();

CREATE OR REPLACE FUNCTION sns_thread_replies_count_trigger() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE sns_threads
    SET reply_count = COALESCE(reply_count, 0) + 1, last_replied_at = NEW.created_at
    WHERE id = NEW.thread_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE sns_threads SET reply_count = GREATEST(COALESCE(reply_count, 0) - 1, 0) WHERE id = OLD.thread_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sns_thread_replies_count ON sns_thread_replies;
CREATE TRIGGER trg_sns_thread_replies_count
  AFTER INSERT OR DELETE ON sns_thread_replies
  FOR EACH ROW EXECUTE FUNCTION sns_thread_replies_count_trigger();

-- 既存データのカウンターを再計算
UPDATE sns_posts p SET like_count = (SELECT count(*) FROM sns_likes l WHERE l.post_id = p.id);
UPDATE sns_posts p SET reply_count = (SELECT count(*) FROM sns_posts c WHERE c.parent_id = p.id);
UPDATE sns_threads t SET reply_count = (SELECT count(*) FROM sns_thread_replies r WHERE r.thread_id = t.id);

-- -----------------------------------------------------
-- E. 派遣の二重完了防止（F06）：同一派遣IDの報酬付与は1回まで
-- -----------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_cp_transactions_dispatch_reward
  ON cp_transactions (source_id) WHERE source_type = 'dispatch';

-- =====================================================
-- 第2回レビュー（2026-09-11）対応の追加分
-- =====================================================

-- -----------------------------------------------------
-- F. 既存DBの CHECK 制約を現行の許可値に更新（R2-06 / R2-08）
--    CREATE TABLE IF NOT EXISTS は既存テーブルの制約を変えないため、明示的に置き換える
-- -----------------------------------------------------
DO $$
DECLARE r RECORD;
BEGIN
  -- SNS の layer（surface / hunter / meta / rp）
  FOR r IN (
    SELECT c.conname, c.conrelid::regclass AS tbl
    FROM pg_constraint c
    WHERE c.contype = 'c'
      AND c.conrelid IN ('sns_posts'::regclass, 'sns_threads'::regclass, 'sns_chat_rooms'::regclass)
      AND pg_get_constraintdef(c.oid) LIKE '%layer%'
  ) LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', r.tbl, r.conname);
  END LOOP;

  -- 実績種別（dispatch を追加）
  FOR r IN (
    SELECT c.conname, c.conrelid::regclass AS tbl
    FROM pg_constraint c
    WHERE c.contype = 'c'
      AND c.conrelid IN ('character_achievements'::regclass, 'serial_codes'::regclass)
      AND pg_get_constraintdef(c.oid) LIKE '%achievement_type%'
  ) LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', r.tbl, r.conname);
  END LOOP;
END $$;

ALTER TABLE sns_posts      ADD CONSTRAINT sns_posts_layer_check      CHECK (layer IN ('surface', 'hunter', 'meta', 'rp'));
ALTER TABLE sns_threads    ADD CONSTRAINT sns_threads_layer_check    CHECK (layer IN ('surface', 'hunter', 'meta', 'rp'));
ALTER TABLE sns_chat_rooms ADD CONSTRAINT sns_chat_rooms_layer_check CHECK (layer IN ('surface', 'hunter', 'meta', 'rp'));

ALTER TABLE character_achievements ADD CONSTRAINT character_achievements_achievement_type_check
  CHECK (achievement_type IN ('mission', 'adv', 'special', 'levelup', 'dispatch'));
ALTER TABLE serial_codes ADD CONSTRAINT serial_codes_achievement_type_check
  CHECK (achievement_type IN ('mission', 'adv', 'special', 'levelup', 'dispatch'));

-- -----------------------------------------------------
-- G. 公開実績に残っている生シリアルコードを不透明IDへ置換（R2-05）
-- -----------------------------------------------------
UPDATE character_achievements a
SET source_id = 'serial:' || s.id::text
FROM serial_codes s
WHERE a.source_id = 'serial:' || s.code;

-- 対応するコードが既に無いものはコード文字列を残さない
UPDATE character_achievements
SET source_id = 'serial:redacted'
WHERE source_id LIKE 'serial:%'
  AND source_id NOT LIKE 'serial:redacted'
  AND NOT EXISTS (SELECT 1 FROM serial_codes s WHERE 'serial:' || s.id::text = character_achievements.source_id);

-- -----------------------------------------------------
-- H. Dev → Production のユーザーデータ移行を1トランザクションで行う（R2-01 / R2-04）
--    /api/auth/migrate-from-dev から呼ばれる。途中で失敗すれば全てロールバックされ、
--    移行済みフラグ（user_migration_map.migrated_at）も立たないので再試行できる。
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION migrate_user_data(p_old_user_id TEXT, p_new_user_id TEXT, p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_counts JSONB := '{}'::jsonb;
  v_n INT;
  v_old_balance INT;
  v_account TEXT;
BEGIN
  IF p_old_user_id IS NULL OR p_new_user_id IS NULL OR p_old_user_id = p_new_user_id THEN
    RAISE EXCEPTION 'MIGRATION_INVALID_ARGS';
  END IF;

  -- 一意制約と衝突する旧行は削除してから付け替える（新IDが既に同じキーを持つ場合）
  DELETE FROM sns_likes o USING sns_likes n
    WHERE o.user_id = p_old_user_id AND n.user_id = p_new_user_id AND o.post_id = n.post_id;
  DELETE FROM sns_chat_members o USING sns_chat_members n
    WHERE o.user_id = p_old_user_id AND n.user_id = p_new_user_id AND o.room_id = n.room_id;
  DELETE FROM adv_completions o USING adv_completions n
    WHERE o.user_id = p_old_user_id AND n.user_id = p_new_user_id
      AND o.character_id = n.character_id AND o.scenario_id = n.scenario_id;

  UPDATE anomaly_drafts          SET user_id = p_new_user_id WHERE user_id = p_old_user_id; GET DIAGNOSTICS v_n = ROW_COUNT; v_counts := v_counts || jsonb_build_object('anomaly_drafts', v_n);
  UPDATE gear_posts              SET user_id = p_new_user_id WHERE user_id = p_old_user_id; GET DIAGNOSTICS v_n = ROW_COUNT; v_counts := v_counts || jsonb_build_object('gear_posts', v_n);
  UPDATE character_sheets        SET user_id = p_new_user_id WHERE user_id = p_old_user_id; GET DIAGNOSTICS v_n = ROW_COUNT; v_counts := v_counts || jsonb_build_object('character_sheets', v_n);
  UPDATE novels                  SET user_id = p_new_user_id WHERE user_id = p_old_user_id; GET DIAGNOSTICS v_n = ROW_COUNT; v_counts := v_counts || jsonb_build_object('novels', v_n);
  UPDATE mission_results         SET user_id = p_new_user_id WHERE user_id = p_old_user_id; GET DIAGNOSTICS v_n = ROW_COUNT; v_counts := v_counts || jsonb_build_object('mission_results', v_n);
  UPDATE adv_completions         SET user_id = p_new_user_id WHERE user_id = p_old_user_id; GET DIAGNOSTICS v_n = ROW_COUNT; v_counts := v_counts || jsonb_build_object('adv_completions', v_n);
  UPDATE character_achievements  SET user_id = p_new_user_id WHERE user_id = p_old_user_id; GET DIAGNOSTICS v_n = ROW_COUNT; v_counts := v_counts || jsonb_build_object('character_achievements', v_n);
  UPDATE dispatch_quests         SET user_id = p_new_user_id WHERE user_id = p_old_user_id; GET DIAGNOSTICS v_n = ROW_COUNT; v_counts := v_counts || jsonb_build_object('dispatch_quests', v_n);
  UPDATE sns_posts               SET user_id = p_new_user_id WHERE user_id = p_old_user_id; GET DIAGNOSTICS v_n = ROW_COUNT; v_counts := v_counts || jsonb_build_object('sns_posts', v_n);
  UPDATE sns_likes               SET user_id = p_new_user_id WHERE user_id = p_old_user_id; GET DIAGNOSTICS v_n = ROW_COUNT; v_counts := v_counts || jsonb_build_object('sns_likes', v_n);
  UPDATE sns_threads             SET user_id = p_new_user_id WHERE user_id = p_old_user_id; GET DIAGNOSTICS v_n = ROW_COUNT; v_counts := v_counts || jsonb_build_object('sns_threads', v_n);
  UPDATE sns_thread_replies      SET user_id = p_new_user_id WHERE user_id = p_old_user_id; GET DIAGNOSTICS v_n = ROW_COUNT; v_counts := v_counts || jsonb_build_object('sns_thread_replies', v_n);
  UPDATE sns_chat_rooms          SET created_by = p_new_user_id WHERE created_by = p_old_user_id; GET DIAGNOSTICS v_n = ROW_COUNT; v_counts := v_counts || jsonb_build_object('sns_chat_rooms', v_n);
  UPDATE sns_chat_messages       SET user_id = p_new_user_id WHERE user_id = p_old_user_id; GET DIAGNOSTICS v_n = ROW_COUNT; v_counts := v_counts || jsonb_build_object('sns_chat_messages', v_n);
  UPDATE sns_chat_members        SET user_id = p_new_user_id WHERE user_id = p_old_user_id; GET DIAGNOSTICS v_n = ROW_COUNT; v_counts := v_counts || jsonb_build_object('sns_chat_members', v_n);
  UPDATE cp_transactions         SET user_id = p_new_user_id WHERE user_id = p_old_user_id; GET DIAGNOSTICS v_n = ROW_COUNT; v_counts := v_counts || jsonb_build_object('cp_transactions', v_n);
  UPDATE reports                 SET reporter_user_id = p_new_user_id WHERE reporter_user_id = p_old_user_id; GET DIAGNOSTICS v_n = ROW_COUNT; v_counts := v_counts || jsonb_build_object('reports', v_n);

  -- account_cp：旧残高を新IDへ引き継ぐ（新ID側の初期付与は破棄）
  SELECT balance INTO v_old_balance FROM account_cp WHERE user_id = p_old_user_id;
  IF v_old_balance IS NULL THEN
    v_account := 'no_old_record';
  ELSE
    INSERT INTO account_cp (user_id, balance, created_at, updated_at)
    VALUES (p_new_user_id, v_old_balance, now(), now())
    ON CONFLICT (user_id) DO UPDATE SET balance = EXCLUDED.balance, updated_at = now();
    DELETE FROM account_cp WHERE user_id = p_old_user_id;
    v_account := 'transferred';
  END IF;
  v_counts := v_counts || jsonb_build_object('account_cp', v_account);

  UPDATE user_migration_map
  SET migrated_at = now(), migrated_to_user_id = p_new_user_id
  WHERE email = p_email AND dev_user_id = p_old_user_id;

  RETURN v_counts;
END;
$$;

REVOKE ALL ON FUNCTION migrate_user_data(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
