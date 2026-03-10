'use client';

import { useParams } from 'next/navigation';
import '../../sns.css';
import ThreadDetail from '../../components/ThreadDetail';

export default function ThreadPage() {
  const { id } = useParams();

  return (
    <div className="sns-page">
      <div className="sns-banner">
        <div>
          <div className="sns-banner__title">MirrorLine</div>
          <div className="sns-banner__subtitle">THREAD DETAIL</div>
        </div>
        <a href="/sns/" style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textDecoration: 'none' }}>
          ← スレッド一覧
        </a>
      </div>
      <ThreadDetail threadId={id} layer="surface" />
    </div>
  );
}
