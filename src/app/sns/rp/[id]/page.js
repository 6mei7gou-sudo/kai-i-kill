'use client';

import { useParams } from 'next/navigation';
import '../../sns.css';
import ThreadDetail from '../../components/ThreadDetail';

export default function RPThreadPage() {
  const { id } = useParams();

  return (
    <div className="sns-page">
      <div className="sns-banner">
        <div>
          <div className="sns-banner__title">MirrorLine</div>
          <div className="sns-banner__subtitle">RP THREAD</div>
        </div>
        <a href="/sns/rp/" style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textDecoration: 'none' }}>
          ← RPスレッド一覧
        </a>
      </div>
      <ThreadDetail threadId={id} layer="rp" backPath="/sns/rp/" backLabel="RPスレッド一覧" />
    </div>
  );
}
