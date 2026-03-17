'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import CharacterSelector from './CharacterSelector';

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatRoom({ roomId, layer }) {
  const { user, isSignedIn } = useUser();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [character, setCharacter] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const channelRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages
  useEffect(() => {
    setLoading(true);
    const url = new URL('/api/sns/chat/messages', window.location.origin);
    url.searchParams.set('room_id', roomId);

    fetch(url.toString())
      .then((res) => res.json())
      .then((data) => {
        if (data.room) setRoom(data.room);
        const msgs = Array.isArray(data) ? data : data.messages ?? data.data ?? [];
        setMessages(msgs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [roomId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Realtime subscription
  useEffect(() => {
    if (!supabase || !roomId) return;

    channelRef.current = supabase
      .channel(`chat_messages_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sns_chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.new) {
            setMessages((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [roomId]);

  const handleSend = async () => {
    if (!input.trim() || !character || sending || !isSignedIn) return;

    setSending(true);
    try {
      const res = await fetch('/api/sns/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: roomId,
          user_id: user.id,
          character_id: character.id,
          character_name: character.character_name,
          character_image_url: character.image_url,
          content: input.trim(),
        }),
      });

      const msgJson = await res.json();
      if (res.ok && msgJson.data) {
        setMessages((prev) => [...prev, msgJson.data]);
        setInput('');
      }
    } catch {
      // silent fail
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return <div className="sns-loading">LOADING...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Room header */}
      {room && (
        <div style={{
          padding: 'var(--space-md) var(--space-lg)',
          borderBottom: 'var(--border-subtle)',
          background: 'var(--bg-card)',
        }}>
          <div style={{ fontWeight: 700 }}>{room.name}</div>
          {room.description && (
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-xs)' }}>
              {room.description}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="chat-room__messages">
        {messages.length === 0 ? (
          <div className="sns-empty">
            <div className="sns-empty__text">メッセージがありません</div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="chat-message">
              <div className="chat-message__avatar">
                {msg.character_image_url ? (
                  <img src={msg.character_image_url} alt={msg.character_name} />
                ) : (
                  '👤'
                )}
              </div>
              <div className="chat-message__body">
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-sm)' }}>
                  <span className="chat-message__name">{msg.character_name || '匿名'}</span>
                  <span className="chat-message__time">{formatTime(msg.created_at)}</span>
                </div>
                <div className="chat-message__text">{msg.content}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {isSignedIn && (
        <div className="chat-input">
          <CharacterSelector value={character} onChange={setCharacter} />
          <input
            type="text"
            className="chat-input__field"
            placeholder="メッセージを入力..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="chat-input__send"
            onClick={handleSend}
            disabled={!input.trim() || !character || sending}
          >
            送信
          </button>
        </div>
      )}
    </div>
  );
}
