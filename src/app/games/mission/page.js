'use client';

import Link from 'next/link';
import { missions } from '@/data/missions';

const difficultyColor = {
  E: 'var(--grade-5)',
  D: 'var(--grade-4)',
  C: 'var(--grade-3)',
  B: 'var(--grade-2)',
  A: 'var(--grade-1)',
  S: 'var(--grade-special)',
};

export default function MissionBoardPage() {
  return (
    <div>
      <div className="page-header">
        <span className="page-header__badge">MISSION</span>
        <h1 className="page-header__title">依頼掲示板</h1>
        <p className="page-header__lead">討伐依頼を選択し、出撃せよ。</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', padding: 'var(--space-xl) 0' }}>
        {missions.map(mission => (
          <Link key={mission.id} href={`/games/mission/${mission.id}/`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-lg)', color: 'var(--text-heading)', fontWeight: 700 }}>
                    {mission.name}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-xs)' }}>
                    依頼元: {mission.client}
                  </div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 900,
                  color: difficultyColor[mission.difficulty] || 'var(--text-primary)',
                  border: `2px solid ${difficultyColor[mission.difficulty] || 'var(--text-muted)'}`,
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  {mission.difficulty}
                </div>
              </div>

              <p style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-md)', lineHeight: 1.8 }}>
                {mission.description}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                  {mission.tags.map(t => (
                    <span key={t} style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--text-muted)',
                      background: 'rgba(255,255,255,0.04)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                    }}>
                      {t}
                    </span>
                  ))}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--accent-gold)' }}>
                  護衛{mission.battle.guardians.length}体 / 核HP{mission.battle.core.hp} / {mission.battle.max_rounds}R制限
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
