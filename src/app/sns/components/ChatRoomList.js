'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export default function ChatRoomList({ layer }) {
  const { user, isSignedIn } = useUser();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formExpires, setFormExpires] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    const url = new URL('/api/sns/chat/rooms', window.location.origin);
    url.searchParams.set('layer', layer);

    fetch(url.toString())
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.data ?? [];
        setRooms(list);
      })
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, [layer]);

  const handleCreate = async () => {
    if (!formName.trim() || submitting || !isSignedIn) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/sns/chat/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          name: formName.trim(),
          description: formDescription.trim() || null,
          expires_at: formExpires || null,
          layer,
        }),
      });

      if (res.ok) {
        const room = await res.json();
        setRooms((prev) => [room, ...prev]);
        setFormName('');
        setFormDescription('');
        setFormExpires('');
        setShowForm(false);
      }
    } catch {
      // silent fail
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Create room */}
      {isSignedIn && (
        <div style={{ padding: 'var(--space-md) var(--space-lg)', borderBottom: 'var(--border-subtle)' }}>
          {!showForm ? (
            <button className="post-composer__submit" onClick={() => setShowForm(true)}>
              + ルーム作成
            </button>
          ) : (
            <div className="post-composer">
              <input
                type="text"
                placeholder="ルーム名"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="chat-input__field"
                style={{ marginBottom: 'var(--space-sm)' }}
              />
              <input
                type="text"
                placeholder="説明（任意）"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="chat-input__field"
                style={{ marginBottom: 'var(--space-sm)' }}
              />
              <input
                type="datetime-local"
                value={formExpires}
                onChange={(e) => setFormExpires(e.target.value)}
                className="chat-input__field"
                style={{ marginBottom: 'var(--space-sm)' }}
                title="有効期限（任意）"
              />
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <button
                  className="post-composer__submit"
                  disabled={!formName.trim() || submitting}
                  onClick={handleCreate}
                >
                  {submitting ? '作成中...' : '作成'}
                </button>
                <button
                  className="post-composer__submit"
                  onClick={() => setShowForm(false)}
                  style={{ opacity: 0.6 }}
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Room list */}
      {loading ? (
        <div className="sns-loading">LOADING...</div>
      ) : rooms.length === 0 ? (
        <div className="sns-empty">
          <div className="sns-empty__icon">💬</div>
          <div className="sns-empty__text">チャットルームがありません</div>
        </div>
      ) : (
        rooms.map((room) => (
          <a
            key={room.id}
            href={`/sns/chat/${room.id}`}
            className="chat-room-list__item"
          >
            <div>
              <div style={{ fontWeight: 700, marginBottom: 'var(--space-xs)' }}>
                {room.name}
              </div>
              {room.description && (
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  {room.description}
                </div>
              )}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {room.member_count ?? 0} 人
            </div>
          </a>
        ))
      )}
    </div>
  );
}
