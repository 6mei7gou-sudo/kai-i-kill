'use client';

import Link from 'next/link';
import './sns.css';

export default function SNSPage() {
  return (
    <div className="sns-page">
      <div className="sns-banner">
        <div>
          <div className="sns-banner__title">MirrorLine</div>
          <div className="sns-banner__subtitle">COMMUNITY HUB</div>
        </div>
      </div>

      <div style={{ padding: 'var(--space-xl) var(--space-lg)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
        <Link href="/sns/meta/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            background: 'var(--bg-card)', border: 'var(--border-subtle)',
            padding: 'var(--space-xl)', transition: 'border-color 0.2s',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: '#5588cc', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
              META THREADS
            </div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)', color: 'var(--text-heading)' }}>
              メタスレッド
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>
              プレイヤー同士の雑談・相談・質問・ルール議論など。中の人として話す場所。
            </p>
          </div>
        </Link>

        <Link href="/sns/rp/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            background: 'var(--bg-card)', border: 'var(--border-subtle)',
            padding: 'var(--space-xl)', transition: 'border-color 0.2s',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: '#cc8844', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
              RP THREADS
            </div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)', color: 'var(--text-heading)' }}>
              RPスレッド
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>
              キャラクターとして発言するロールプレイの場。任務報告・怪異考察・日常RPなど。
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
