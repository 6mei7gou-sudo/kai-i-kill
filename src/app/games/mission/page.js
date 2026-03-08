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

function MissionCard({ mission }) {
  const isCoop = mission.type === 'coop';
  return (
    <Link href={`/games/mission/${mission.id}/`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="card" style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-lg)', color: 'var(--text-heading)', fontWeight: 700 }}>
                {mission.name}
              </span>
              {isCoop && (
                <span className="badge--gold" style={{ fontSize: 'var(--font-size-xs)' }}>
                  {mission.party_size}人協力
                </span>
              )}
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
  );
}

export default function MissionBoardPage() {
  const soloMissions = missions.filter(m => m.type !== 'coop');
  const coopMissions = missions.filter(m => m.type === 'coop');

  return (
    <div>
      <div className="page-header">
        <span className="page-header__badge">MISSION</span>
        <h1 className="page-header__title">依頼掲示板</h1>
        <p className="page-header__lead">討伐依頼を選択し、出撃せよ。</p>
      </div>

      {/* ソロミッション */}
      <div className="section">
        <h2 className="section__title">ソロミッション</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {soloMissions.map(mission => (
            <MissionCard key={mission.id} mission={mission} />
          ))}
        </div>
      </div>

      {/* 協力ミッション */}
      {coopMissions.length > 0 && (
        <div className="section" style={{ marginTop: 'var(--space-2xl)' }}>
          <h2 className="section__title">協力ミッション</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-lg)' }}>
            複数キャラでパーティを編成して挑む高難度ミッション。
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {coopMissions.map(mission => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
