'use client';

import { useState } from 'react';
import BotPostBadge from './BotPostBadge';

const POST_TYPE_LABELS = {
  rumor: '噂',
  intel: 'INTEL',
  alert: 'ALERT',
  npc_chatter: 'NPC',
};

function formatRelativeTime(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return `${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d`;
}

function renderContent(text) {
  const parts = text.split(/(#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('#') && part.length > 1) {
      return (
        <span key={i} className="post-card__hashtag">
          {part}
        </span>
      );
    }
    return part;
  });
}

export default function PostCard({ post, layer, currentUserId, onReply, onDelete }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [liking, setLiking] = useState(false);

  const isAdmin = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(',').includes(currentUserId);
  const canDelete = currentUserId === post.user_id || isAdmin;

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      const res = await fetch('/api/sns/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: post.id,
          user_id: currentUserId,
        }),
      });
      if (res.ok) {
        setLiked(!liked);
        setLikeCount((c) => (liked ? c - 1 : c + 1));
      }
    } catch {
      // silent fail
    } finally {
      setLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    try {
      await fetch(`/api/sns/posts?id=${post.id}`, { method: 'DELETE' });
      onDelete?.(post.id);
    } catch {
      // silent fail
    }
  };

  return (
    <div className={`post-card${post.parent_id ? ' post-card--reply' : ''}`}>
      <div className="post-card__header">
        <div className="post-card__avatar">
          {post.character_image_url ? (
            <img src={post.character_image_url} alt={post.character_name} />
          ) : (
            '👤'
          )}
        </div>

        <div className="post-card__meta">
          <span className="post-card__name">
            {post.character_name || '匿名'}
            {post.is_bot && <BotPostBadge />}
            {post.post_type && post.post_type !== 'normal' && (
              <span className={`post-type-badge post-type-badge--${post.post_type}`}>
                {POST_TYPE_LABELS[post.post_type] || post.post_type}
              </span>
            )}
          </span>
          {post.character_affiliation && (
            <span className="post-card__affiliation">{post.character_affiliation}</span>
          )}
        </div>

        <span className="post-card__time">{formatRelativeTime(post.created_at)}</span>
      </div>

      <div className="post-card__content">{renderContent(post.content || '')}</div>

      <div className="post-card__actions">
        <button
          className={`post-card__action${liked ? ' post-card__action--liked' : ''}`}
          onClick={handleLike}
        >
          {liked ? '♥' : '♡'} {likeCount > 0 && likeCount}
        </button>

        <button className="post-card__action" onClick={() => onReply?.(post)}>
          💬 {(post.reply_count || 0) > 0 && post.reply_count}
        </button>

        {canDelete && (
          <button className="post-card__action" onClick={handleDelete}>
            🗑
          </button>
        )}
      </div>
    </div>
  );
}
