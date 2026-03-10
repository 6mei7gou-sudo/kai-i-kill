'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import PostCard from './PostCard';

const PAGE_SIZE = 20;

export default function Timeline({ layer }) {
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [newPosts, setNewPosts] = useState([]);
  const channelRef = useRef(null);

  const fetchPosts = useCallback(
    async (afterCursor) => {
      const url = new URL('/api/sns/posts', window.location.origin);
      url.searchParams.set('layer', layer);
      url.searchParams.set('limit', String(PAGE_SIZE));
      if (afterCursor) {
        url.searchParams.set('cursor', afterCursor);
      }

      const res = await fetch(url.toString());
      if (!res.ok) return { data: [], nextCursor: null };
      const json = await res.json();
      const data = Array.isArray(json) ? json : json.data ?? [];
      const nextCursor = json.next_cursor ?? (data.length < PAGE_SIZE ? null : data[data.length - 1]?.id);
      return { data, nextCursor };
    },
    [layer]
  );

  // Initial load
  useEffect(() => {
    setLoading(true);
    setPosts([]);
    setCursor(null);
    setHasMore(true);
    setNewPosts([]);

    fetchPosts(null).then(({ data, nextCursor }) => {
      setPosts(data);
      setCursor(nextCursor);
      setHasMore(!!nextCursor && data.length === PAGE_SIZE);
      setLoading(false);
    });
  }, [layer, fetchPosts]);

  // Realtime subscription
  useEffect(() => {
    if (!supabase) return;

    channelRef.current = supabase
      .channel(`sns_posts_${layer}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sns_posts',
          filter: `layer=eq.${layer}`,
        },
        (payload) => {
          const newPost = payload.new;
          if (newPost && !newPost.parent_id) {
            setNewPosts((prev) => [newPost, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [layer]);

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const { data, nextCursor } = await fetchPosts(cursor);
    setPosts((prev) => [...prev, ...data]);
    setCursor(nextCursor);
    setHasMore(!!nextCursor && data.length === PAGE_SIZE);
    setLoadingMore(false);
  };

  const showNewPosts = () => {
    setPosts((prev) => [...newPosts, ...prev]);
    setNewPosts([]);
  };

  const handleDelete = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  if (loading) {
    return <div className="sns-loading">LOADING...</div>;
  }

  return (
    <div>
      {newPosts.length > 0 && (
        <div className="sns-new-posts-banner" onClick={showNewPosts}>
          <span className="sns-new-posts-banner__text">
            {newPosts.length}件の新着
          </span>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="sns-empty">
          <div className="sns-empty__icon">📭</div>
          <div className="sns-empty__text">投稿がありません</div>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            layer={layer}
            currentUserId={user?.id}
            onReply={() => {}}
            onDelete={handleDelete}
          />
        ))
      )}

      {hasMore && (
        <div style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
          <button
            className="post-composer__submit"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'LOADING...' : 'もっと読む'}
          </button>
        </div>
      )}
    </div>
  );
}
