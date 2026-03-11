'use client';

import { Suspense } from 'react';
import '../sns.css';
import ThreadList from '../components/ThreadList';

function MetaContent() {
  return (
    <div className="sns-page">
      <div className="sns-banner">
        <div>
          <div className="sns-banner__title">MirrorLine</div>
          <div className="sns-banner__subtitle">META THREADS — プレイヤー交流</div>
        </div>
        <a href="/sns/" style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textDecoration: 'none' }}>
          ← SNSトップ
        </a>
      </div>
      <ThreadList layer="meta" basePath="/sns/meta/" />
    </div>
  );
}

export default function MetaThreadsPage() {
  return (
    <Suspense fallback={<div className="sns-loading">LOADING...</div>}>
      <MetaContent />
    </Suspense>
  );
}
