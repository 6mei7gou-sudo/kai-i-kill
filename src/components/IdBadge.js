'use client';

import { useState } from 'react';

// ID表示＋コピーボタン（武器・怪異・キャラ共通）
export default function IdBadge({ id, label = 'ID', created_at, updated_at }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // フォールバック
      const ta = document.createElement('textarea');
      ta.value = id;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{
      padding: 'var(--space-md) var(--space-lg)',
      background: 'rgba(0,0,0,0.25)',
      border: 'var(--border-subtle)',
      marginBottom: 'var(--space-xl)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)',
          color: 'var(--accent-gold)', fontWeight: 700, letterSpacing: '0.05em',
        }}>
          {label}
        </span>
        <code style={{
          fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)',
          color: 'var(--text-primary)', background: 'rgba(255,255,255,0.04)',
          padding: '2px 8px', borderRadius: 'var(--radius-sm)',
          border: 'var(--border-subtle)', userSelect: 'all',
        }}>
          {id}
        </code>
        <button
          onClick={handleCopy}
          style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            padding: '2px 10px',
            background: copied ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.04)',
            border: copied ? '1px solid var(--accent-gold-border)' : 'var(--border-subtle)',
            color: copied ? 'var(--accent-gold)' : 'var(--text-muted)',
            cursor: 'pointer', borderRadius: 'var(--radius-sm)',
            transition: 'all 0.2s',
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
        {created_at && `作成: ${new Date(created_at).toLocaleDateString('ja-JP')}`}
        {updated_at && ` · 更新: ${new Date(updated_at).toLocaleDateString('ja-JP')}`}
      </div>
    </div>
  );
}
