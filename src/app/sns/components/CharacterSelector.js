'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';

export default function CharacterSelector({ value, onChange }) {
  const { user, isSignedIn } = useUser();
  const [characters, setCharacters] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!isSignedIn || !user?.id) return;

    setLoading(true);
    fetch(`/api/posts?table=character_sheets&user_id=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.data ?? [];
        setCharacters(list);
        if (!value && list.length > 0) {
          const first = list[0];
          onChange({
            id: first.id,
            character_name: first.character_name,
            display_name: first.character_name,
            affiliation: first.affiliation,
            image_url: first.image_url,
          });
        }
      })
      .catch(() => setCharacters([]))
      .finally(() => setLoading(false));
  }, [isSignedIn, user?.id]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isSignedIn) return null;

  const handleSelect = (char) => {
    onChange({
      ...value,
      id: char.id,
      character_name: char.character_name,
      display_name: value?.display_name || char.character_name,
      affiliation: char.affiliation,
      image_url: char.image_url,
    });
    setOpen(false);
  };

  const handleDisplayNameChange = (e) => {
    onChange({
      ...value,
      display_name: e.target.value,
    });
  };

  return (
    <div className="char-selector" ref={ref}>
      <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
        <button
          type="button"
          className="char-selector__button"
          onClick={() => setOpen(!open)}
          style={{ flex: '0 0 auto' }}
        >
          {loading
            ? '読込中...'
            : value
              ? `${value.character_name}${value.affiliation ? ` / ${value.affiliation}` : ''}`
              : 'キャラクター選択'}
        </button>
        {value && (
          <input
            type="text"
            value={value.display_name || ''}
            onChange={handleDisplayNameChange}
            placeholder="表示名"
            className="chat-input__field"
            style={{ flex: 1, minWidth: 0 }}
          />
        )}
      </div>

      {open && (
        <div className="char-selector__dropdown">
          {characters.length === 0 ? (
            <div className="char-selector__option" style={{ cursor: 'default', color: 'var(--text-muted)' }}>
              キャラクターが見つかりません
            </div>
          ) : (
            characters.map((char) => (
              <button
                key={char.id}
                type="button"
                className={`char-selector__option${value?.id === char.id ? ' char-selector__option--selected' : ''}`}
                onClick={() => handleSelect(char)}
              >
                <span>{char.character_name}</span>
                {char.affiliation && (
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    {char.affiliation}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
