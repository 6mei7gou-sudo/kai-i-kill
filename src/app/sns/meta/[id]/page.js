'use client';

import { useParams } from 'next/navigation';
import '../../sns.css';
import ThreadDetail from '../../components/ThreadDetail';

export default function MetaThreadPage() {
  const { id } = useParams();

  return (
    <div className="sns-page">
      <div className="sns-banner">
        <div>
          <div className="sns-banner__title">MirrorLine</div>
          <div className="sns-banner__subtitle">META THREAD</div>
        </div>
        <a href="/sns/meta/" style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textDecoration: 'none' }}>
          ← メタスレッド一覧
        </a>
      </div>
      <ThreadDetail threadId={id} layer="meta" backPath="/sns/meta/" backLabel="メタスレッド一覧" />
    </div>
  );
}
