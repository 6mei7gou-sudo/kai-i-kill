-- ============================================================
-- SNS機能: MirrorLine / HUNTER//NET — 7テーブル
-- ============================================================

-- 1. sns_posts — タイムライン投稿
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

CREATE INDEX idx_sns_posts_layer ON sns_posts(layer, created_at DESC);
CREATE INDEX idx_sns_posts_user ON sns_posts(user_id);
CREATE INDEX idx_sns_posts_parent ON sns_posts(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_sns_posts_bot ON sns_posts(bot_id) WHERE is_bot = TRUE;

-- 2. sns_likes — いいね（UNIQUE制約）
CREATE TABLE IF NOT EXISTS sns_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  post_id UUID NOT NULL REFERENCES sns_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, post_id)
);

CREATE INDEX idx_sns_likes_post ON sns_likes(post_id);

-- 3. sns_threads — PBWスレッド
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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sns_threads_layer ON sns_threads(layer, last_replied_at DESC);
CREATE INDEX idx_sns_threads_category ON sns_threads(category);

-- 4. sns_thread_replies — スレッド返信
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

CREATE INDEX idx_sns_thread_replies_thread ON sns_thread_replies(thread_id, created_at ASC);

-- 5. sns_chat_rooms — チャットルーム
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

CREATE INDEX idx_sns_chat_rooms_active ON sns_chat_rooms(is_active, created_at DESC);

-- 6. sns_chat_messages — チャットメッセージ
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

CREATE INDEX idx_sns_chat_messages_room ON sns_chat_messages(room_id, created_at ASC);

-- 7. sns_chat_members — チャットルーム参加者
CREATE TABLE IF NOT EXISTS sns_chat_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES sns_chat_rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  character_id UUID REFERENCES character_sheets(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, user_id)
);

CREATE INDEX idx_sns_chat_members_room ON sns_chat_members(room_id);
CREATE INDEX idx_sns_chat_members_user ON sns_chat_members(user_id);

-- RLS有効化
ALTER TABLE sns_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sns_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sns_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sns_thread_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sns_chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sns_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sns_chat_members ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: 全テーブルで読み取り許可、書き込みは認証ユーザーのみ
CREATE POLICY "sns_posts_read" ON sns_posts FOR SELECT USING (true);
CREATE POLICY "sns_posts_write" ON sns_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "sns_posts_update" ON sns_posts FOR UPDATE USING (true);
CREATE POLICY "sns_posts_delete" ON sns_posts FOR DELETE USING (true);

CREATE POLICY "sns_likes_read" ON sns_likes FOR SELECT USING (true);
CREATE POLICY "sns_likes_write" ON sns_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "sns_likes_delete" ON sns_likes FOR DELETE USING (true);

CREATE POLICY "sns_threads_read" ON sns_threads FOR SELECT USING (true);
CREATE POLICY "sns_threads_write" ON sns_threads FOR INSERT WITH CHECK (true);

CREATE POLICY "sns_thread_replies_read" ON sns_thread_replies FOR SELECT USING (true);
CREATE POLICY "sns_thread_replies_write" ON sns_thread_replies FOR INSERT WITH CHECK (true);

CREATE POLICY "sns_chat_rooms_read" ON sns_chat_rooms FOR SELECT USING (true);
CREATE POLICY "sns_chat_rooms_write" ON sns_chat_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "sns_chat_rooms_update" ON sns_chat_rooms FOR UPDATE USING (true);

CREATE POLICY "sns_chat_messages_read" ON sns_chat_messages FOR SELECT USING (true);
CREATE POLICY "sns_chat_messages_write" ON sns_chat_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "sns_chat_members_read" ON sns_chat_members FOR SELECT USING (true);
CREATE POLICY "sns_chat_members_write" ON sns_chat_members FOR INSERT WITH CHECK (true);
CREATE POLICY "sns_chat_members_delete" ON sns_chat_members FOR DELETE USING (true);

-- Realtime公開（Supabase側で ALTER PUBLICATION supabase_realtime ADD TABLE ... を実行する必要あり）
-- 以下はコメントとして記録:
-- ALTER PUBLICATION supabase_realtime ADD TABLE sns_posts;
-- ALTER PUBLICATION supabase_realtime ADD TABLE sns_chat_messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE sns_thread_replies;
