-- migration_sns_v2_thread_password.sql
-- スレッドパスワード機能：入場制限(entry) / 書込制限(write)

ALTER TABLE sns_threads ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE sns_threads ADD COLUMN IF NOT EXISTS password_mode TEXT DEFAULT 'none';

-- CHECK制約
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT conname FROM pg_constraint WHERE conrelid = 'sns_threads'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) LIKE '%password_mode%') LOOP
    EXECUTE 'ALTER TABLE sns_threads DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE sns_threads ADD CONSTRAINT sns_threads_password_mode_check
CHECK (password_mode IS NULL OR password_mode IN ('none', 'entry', 'write'));
