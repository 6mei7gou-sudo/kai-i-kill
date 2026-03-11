'use client';

import { Suspense } from 'react';
import '../sns.css';
import ThreadList from '../components/ThreadList';

function RPContent() {
  return (
    <div className="sns-page">
      <div className="sns-banner">
        <div>
          <div className="sns-banner__title">MirrorLine</div>
          <div className="sns-banner__subtitle">RP THREADS — ロールプレイ</div>
        </div>
        <a href="/sns/" style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textDecoration: 'none' }}>
          ← SNSトップ
        </a>
      </div>
      <ThreadList layer="rp" basePath="/sns/rp/" />
    </div>
  );
}

export default function RPThreadsPage() {
  return (
    <Suspense fallback={<div className="sns-loading">LOADING...</div>}>
      <RPContent />
    </Suspense>
  );
}
