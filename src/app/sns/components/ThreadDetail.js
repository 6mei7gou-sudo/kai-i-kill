'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import CharacterSelector from './CharacterSelector';

const CATEGORY_LABELS = {
  general: '雑談',
  lore: '世界観',
  mission_report: '任務報告',
  anomaly_discussion: '怪異考察',
  trading: '取引',
  recruitment: '募集',
};

function formatRelativeTime(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMin = Math.floor((now - then) / 60000);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h`;
  return `${Math.floor(diffHour / 24)}d`;
}

export default function ThreadDetail({ threadId, layer, backPath, backLabel }) {
  const { user, isSignedIn } = useUser();
  const [thread, setThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [character, setCharacter] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const channelRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/sns/threads/${threadId}`)
      .then((res) => res.json())
      .then((data) => {
        const d = data.data || data;
        setThread(d.thread || d);
        setReplies(d.replies || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [threadId]);

  // Realtime subscription for new replies
  useEffect(() => {
    if (!supabase || !threadId) return;

    channelRef.current = supabase
      .channel(`thread_replies_${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sns_thread_replies',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          if (payload.new) {
            setReplies((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [threadId]);

  const handleReply = async () => {
    if (!replyContent.trim() || !character || submitting || !isSignedIn) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/sns/threads/${threadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character_id: character.id,
          display_name: character.character_name,
          display_icon: character.image_url || null,
          affiliation: character.affiliation,
          content: replyContent.trim(),
        }),
      });

      if (res.ok) {
        const reply = await res.json();
        setReplies((prev) => [...prev, reply]);
        setReplyContent('');
      }
    } catch {
      // silent fail
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="sns-loading">LOADING...</div>;
  }

  if (!thread) {
    return (
      <div className="sns-empty">
        <div className="sns-empty__icon">❌</div>
        <div className="sns-empty__text">スレッドが見つかりません</div>
      </div>
    );
  }

  return (
    <div>
      {/* Thread header */}
      <div className="thread-detail__header">
        <div className="thread-detail__title">{thread.title}</div>
        <div className="thread-list__meta">
          {thread.category && (
            <span className="thread-list__category">
              {CATEGORY_LABELS[thread.category] || thread.category}
            </span>
          )}
          <span>{thread.display_name || '匿名'}</span>
          {thread.affiliation && (
            <span style={{ color: 'var(--text-muted)' }}>{thread.affiliation}</span>
          )}
          <span>{formatRelativeTime(thread.created_at)}</span>
        </div>
      </div>

      {/* Thread body */}
      <div className="thread-detail__body">{thread.content}</div>

      {/* Replies */}
      {replies.length === 0 ? (
        <div className="sns-empty">
          <div className="sns-empty__text">まだ返信はありません</div>
        </div>
      ) : (
        replies.map((reply) => (
          <div key={reply.id} className="thread-reply">
            <div className="thread-reply__header">
              <div className="post-card__avatar" style={{ width: 28, height: 28 }}>
                {reply.display_icon ? (
                  <img src={reply.display_icon} alt={reply.display_name} />
                ) : (
                  '👤'
                )}
              </div>
              <span className="post-card__name" style={{ fontSize: 'var(--font-size-xs)' }}>
                {reply.display_name || '匿名'}
              </span>
              {reply.affiliation && (
                <span className="post-card__affiliation">{reply.affiliation}</span>
              )}
              <span className="post-card__time">{formatRelativeTime(reply.created_at)}</span>
            </div>
            <div className="thread-reply__content">{reply.content}</div>
          </div>
        ))
      )}

      {/* Reply form */}
      {isSignedIn && (
        <div style={{ padding: 'var(--space-lg)', borderTop: 'var(--border-subtle)' }}>
          <CharacterSelector value={character} onChange={setCharacter} />
          <textarea
            className="post-composer__textarea"
            placeholder="返信を入力..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            style={{ marginTop: 'var(--space-sm)' }}
          />
          <div style={{ marginTop: 'var(--space-sm)', textAlign: 'right' }}>
            <button
              className="post-composer__submit"
              disabled={!replyContent.trim() || !character || submitting}
              onClick={handleReply}
            >
              {submitting ? '送信中...' : '返信'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
