'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import CharacterSelector from './CharacterSelector';

const MAX_CHARS = 1000;

const HIDDEN_COMMANDS = ['/hunt', '//KILL', 'HUNTER//ACCESS'];

const PLACEHOLDER = {
  surface: 'いまどうしてる？',
  hunter: 'INTEL REPORT...',
};

export default function PostComposer({ layer, parentId, onPost, onHunterCommand }) {
  const { user, isSignedIn } = useUser();
  const [content, setContent] = useState('');
  const [character, setCharacter] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const charCount = content.length;
  const isOver = charCount > MAX_CHARS;
  const canSubmit = content.trim().length > 0 && !isOver && character && !submitting;

  const handleContentChange = (e) => {
    const val = e.target.value;
    setContent(val);

    if (onHunterCommand) {
      const trimmed = val.trim();
      if (HIDDEN_COMMANDS.some((cmd) => trimmed === cmd)) {
        onHunterCommand();
      }
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || !isSignedIn) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/sns/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          character_id: character.id,
          display_name: character.display_name || character.character_name,
          display_icon: character.image_url || null,
          affiliation: character.affiliation,
          content: content.trim(),
          layer,
          parent_id: parentId || null,
        }),
      });

      const postJson = await res.json();
      if (!res.ok) {
        alert('投稿に失敗: ' + (postJson.error || '不明なエラー'));
        return;
      }
      if (postJson.data) {
        setContent('');
        onPost?.(postJson.data);
      }
    } catch (err) {
      alert('投稿に失敗: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isSignedIn) return null;

  return (
    <div className="post-composer">
      <div className="post-composer__header">
        <div className="post-composer__avatar">
          {character?.image_url ? (
            <img src={character.image_url} alt={character.character_name} />
          ) : (
            '👤'
          )}
        </div>
        <CharacterSelector value={character} onChange={setCharacter} />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-muted)',
            letterSpacing: '0.05em',
          }}
        >
          {layer === 'hunter' ? 'HUNTER//NET' : 'MirrorLine'}
        </span>
      </div>

      <textarea
        className="post-composer__textarea"
        placeholder={PLACEHOLDER[layer] || PLACEHOLDER.surface}
        value={content}
        onChange={handleContentChange}
        maxLength={MAX_CHARS + 100}
      />

      <div className="post-composer__footer">
        <span className={`post-composer__char-count${isOver ? ' post-composer__char-count--over' : ''}`}>
          {charCount} / {MAX_CHARS}
        </span>
        <button
          className="post-composer__submit"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {submitting ? '送信中...' : parentId ? '返信' : '投稿'}
        </button>
      </div>
    </div>
  );
}
