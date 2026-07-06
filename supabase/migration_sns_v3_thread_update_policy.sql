-- migration_sns_v3_thread_update_policy.sql
-- sns_threads に UPDATE ポリシーを追加
-- SupabaseダッシュボードのSQL Editorで実行
--
-- 背景: v1 では SELECT / INSERT ポリシーのみ定義されており、
-- スレッドタイトル編集（PATCH）だけでなく、既存の reply_count / last_replied_at の
-- 更新も RLS に阻まれてサイレント失敗していた。
-- 認可（本人・管理者チェック）は既存方針どおり API 層で行う。

DROP POLICY IF EXISTS "sns_threads_update" ON sns_threads;
CREATE POLICY "sns_threads_update" ON sns_threads FOR UPDATE USING (true);
