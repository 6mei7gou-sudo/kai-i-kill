'use client';

import Link from 'next/link';

const gameCards = [
  {
    title: 'SIMULATION',
    subtitle: '怪異討伐シミュレーション',
    description: '依頼掲示板からミッションを選び、自分のキャラクターで出撃。護衛を排除し、核を破壊せよ。',
    href: '/games/mission/',
    icon: '⚔',
    features: ['ターン制戦闘', '護衛→核の攻略順', '難易度E〜S', '何度でも再挑戦可'],
  },
  {
    title: 'ADVENTURE',
    subtitle: '怪異譚アドベンチャー',
    description: '選択肢で分岐するテキストアドベンチャー。キャラの能力で開放される選択肢が変わる。',
    href: '/games/adv/',
    icon: '◈',
    features: ['選択肢分岐', 'ダイス判定あり', 'マルチエンディング', '1キャラ1回限り'],
  },
];

export default function GamesHubPage() {
  return (
    <div>
      <div className="page-header">
        <span className="page-header__badge">SYSTEM</span>
        <h1 className="page-header__title">WEB GAME</h1>
        <p className="page-header__lead">怪異と戦え。物語を紡げ。</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-xl)', padding: 'var(--space-xl) 0' }}>
        {gameCards.map(card => (
          <Link key={card.title} href={card.href} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card" style={{ height: '100%', cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                <span style={{ fontSize: '2rem' }}>{card.icon}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xl)', color: 'var(--accent-gold)', fontWeight: 700 }}>
                    {card.title}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    {card.subtitle}
                  </div>
                </div>
              </div>

              <p style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-lg)', lineHeight: 1.8 }}>
                {card.description}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                {card.features.map(f => (
                  <span key={f} className="badge--gold" style={{ fontSize: 'var(--font-size-xs)' }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="callout" style={{ marginTop: 'var(--space-xl)' }}>
        <strong>遊ぶにはキャラクターシートが必要です。</strong><br />
        まだ作っていない場合は、<Link href="/create/character/" style={{ color: 'var(--accent-gold)' }}>キャラシート作成</Link>から登録してください。
      </div>
    </div>
  );
}
