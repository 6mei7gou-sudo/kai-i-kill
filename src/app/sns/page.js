'use client';

import { Suspense } from 'react';
import './sns.css';
import ThreadList from './components/ThreadList';

function SNSContent() {
  return (
    <div className="sns-page">
      <div className="sns-banner">
        <div>
          <div className="sns-banner__title">MirrorLine</div>
          <div className="sns-banner__subtitle">THREADS — RP &amp; DISCUSSION</div>
        </div>
      </div>
      <ThreadList layer="surface" />
    </div>
  );
}

export default function SNSPage() {
  return (
    <Suspense fallback={<div className="sns-loading">LOADING...</div>}>
      <SNSContent />
    </Suspense>
  );
}
