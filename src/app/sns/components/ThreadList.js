'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import CharacterSelector from './CharacterSelector';

const CATEGORIES = [
  { key: 'all', label: 'すべて' },
  { key: 'general', label: '雑談' },
  { key: 'lore', label: '世界観' },
  { key: 'mission_report', label: '任務報告' },
  { key: 'anomaly_discussion', label: '怪異考察' },
  { key: 'trading', label: '取引' },
  { key: 'recruitment', label: '募集' },
];

function formatRelativeTime(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMin = Math.floor((now - then) / 60000);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h`;
  return `${Math.floor(diffHour / 24)}d`;
}

export default function ThreadList({ layer, basePath }) {
  const { user, isSignedIn } = useUser();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('general');
  const [formPassword, setFormPassword] = useState('');
  const [formPasswordMode, setFormPasswordMode] = useState('none');
  const [character, setCharacter] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    const url = new URL('/api/sns/threads', window.location.origin);
    url.searchParams.set('layer', layer);
    if (category !== 'all') {
      url.searchParams.set('category', category);
    }

    fetch(url.toString())
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.data ?? [];
        setThreads(list);
      })
      .catch(() => setThreads([]))
      .finally(() => setLoading(false));
  }, [layer, category]);

  const handleCreate = async () => {
    if (!formTitle.trim() || !formContent.trim() || !character || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/sns/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character_id: character.id,
          display_name: character.character_name,
          display_icon: character.image_url || null,
          affiliation: character.affiliation,
          title: formTitle.trim(),
          content: formContent.trim(),
          category: formCategory,
          layer,
          password: formPassword || undefined,
          password_mode: formPasswordMode !== 'none' ? formPasswordMode : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert('スレッド作成に失敗: ' + (json.error || '不明なエラー'));
        return;
      }
      if (json.data) {
        setThreads((prev) => [json.data, ...prev]);
        setFormTitle('');
        setFormContent('');
        setFormPassword('');
        setFormPasswordMode('none');
        setShowForm(false);
      }
    } catch (err) {
      alert('スレッド作成に失敗: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const pinned = threads.filter((t) => t.is_pinned);
  const regular = threads.filter((t) => !t.is_pinned);
  const sorted = [...pinned, ...regular];

  return (
    <div>
      {/* Category tabs */}
      <div className="sns-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className={`sns-tab${category === cat.key ? ' sns-tab--active' : ''}`}
            onClick={() => setCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Create thread button */}
      {isSignedIn && (
        <div style={{ padding: 'var(--space-md) var(--space-lg)', borderBottom: 'var(--border-subtle)' }}>
          {!showForm ? (
            <button className="post-composer__submit" onClick={() => setShowForm(true)}>
              + スレッド作成
            </button>
          ) : (
            <div className="post-composer">
              <CharacterSelector value={character} onChange={setCharacter} />
              <input
                type="text"
                placeholder="スレッドタイトル"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="chat-input__field"
                style={{ marginTop: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}
              />
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="chat-input__field"
                style={{ marginBottom: 'var(--space-sm)' }}
              >
                {CATEGORIES.filter((c) => c.key !== 'all').map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <textarea
                className="post-composer__textarea"
                placeholder="本文を入力..."
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
              />
              <div style={{ marginTop: 'var(--space-sm)', display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                <select
                  value={formPasswordMode}
                  onChange={(e) => setFormPasswordMode(e.target.value)}
                  className="chat-input__field"
                  style={{ flex: '0 0 auto', width: 'auto' }}
                >
                  <option value="none">パスワードなし</option>
                  <option value="entry">入場制限（閲覧も制限）</option>
                  <option value="write">書込制限（閲覧は自由）</option>
                </select>
                {formPasswordMode !== 'none' && (
                  <input
                    type="text"
                    placeholder="パスワード"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="chat-input__field"
                    style={{ flex: 1 }}
                  />
                )}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                <button
                  className="post-composer__submit"
                  disabled={!formTitle.trim() || !formContent.trim() || !character || submitting}
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

      {/* Thread list */}
      {loading ? (
        <div className="sns-loading">LOADING...</div>
      ) : sorted.length === 0 ? (
        <div className="sns-empty">
          <div className="sns-empty__icon">🧵</div>
          <div className="sns-empty__text">スレッドがありません</div>
        </div>
      ) : (
        sorted.map((thread) => (
          <a
            key={thread.id}
            href={`${basePath}${thread.id}`}
            className="thread-list__item"
          >
            <div className="thread-list__title">
              {thread.is_pinned && <span className="thread-list__pinned">📌 </span>}
              {thread.password_mode === 'entry' && <span title="入場制限">🔒 </span>}
              {thread.password_mode === 'write' && <span title="書込制限">🔐 </span>}
              {thread.title}
            </div>
            <div className="thread-list__meta">
              <span className="thread-list__category">{
                CATEGORIES.find((c) => c.key === thread.category)?.label || thread.category
              }</span>
              <span>{thread.display_name || '匿名'}</span>
              <span>{formatRelativeTime(thread.created_at)}</span>
              <span>{thread.reply_count ?? 0} 件の返信</span>
            </div>
          </a>
        ))
      )}
    </div>
  );
}
