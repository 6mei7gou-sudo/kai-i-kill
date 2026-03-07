'use client';

import Link from 'next/link';
import { scenarios } from '@/data/scenarios';

const endingTypeLabel = { true: 'TRUE', good: 'GOOD', normal: 'NORMAL', bad: 'BAD' };

export default function AdvListPage() {
  return (
    <div>
      <div className="page-header">
        <span className="page-header__badge">ADVENTURE</span>
        <h1 className="page-header__title">怪異譚一覧</h1>
        <p className="page-header__lead">選択と判定で紡ぐ物語。一度きりの怪異譚。</p>
      </div>

      <div className="callout" style={{ marginBottom: 'var(--space-xl)' }}>
        <strong>1キャラ×1シナリオにつき1回限り。</strong>
        クリアしたシナリオには同じキャラクターで再挑戦できません。別のキャラクターなら挑戦可能です。
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        {scenarios.map(s => (
          <Link key={s.id} href={`/games/adv/${s.id}/`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-lg)', color: 'var(--text-heading)', fontWeight: 700 }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-xs)' }}>
                    推定プレイ時間: {s.estimated_time}
                  </div>
                </div>
                <span className="badge--gold" style={{ fontSize: 'var(--font-size-xs)' }}>
                  難易度 {s.difficulty}
                </span>
              </div>

              <p style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-md)', lineHeight: 1.8 }}>
                {s.description}
              </p>

              <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                {s.tags.map(t => (
                  <span key={t} style={{
                    fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)',
                    padding: '2px 8px', borderRadius: 'var(--radius-sm)',
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
