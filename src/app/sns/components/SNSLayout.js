'use client';

import TrendingSidebar from './TrendingSidebar';

const NAV_ITEMS = [
  { key: 'timeline', icon: '📡', label: 'タイムライン' },
  { key: 'threads', icon: '🧵', label: 'スレッド' },
  { key: 'chat', icon: '💬', label: 'チャット' },
];

export default function SNSLayout({ children, layer, activeTab, onTabChange }) {
  const isHunter = layer === 'hunter';

  return (
    <div className={`sns-page${isHunter ? ' hunter-mode' : ''}`}>
      {/* Banner */}
      <div className="sns-banner">
        <div>
          <div className="sns-banner__title">
            {isHunter ? 'HUNTER//NET' : 'MirrorLine'}
          </div>
          <div className="sns-banner__subtitle">
            {isHunter ? 'SECURE CHANNEL — AUTHORIZED PERSONNEL ONLY' : '電脳空間ソーシャルネットワーク'}
          </div>
        </div>
      </div>

      {/* Hunter sub-banner */}
      <div className="hunter-banner">
        <span className="hunter-banner__text">
          HUNTER//NET — ENCRYPTED CONNECTION ESTABLISHED
        </span>
      </div>

      {/* 3-column layout */}
      <div className="sns-layout">
        {/* Left: Navigation */}
        <nav className="sns-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`sns-nav__item${activeTab === item.key ? ' sns-nav__item--active' : ''}`}
              onClick={() => onTabChange?.(item.key)}
            >
              <span className="sns-nav__icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Center: Content */}
        <main className="sns-main">{children}</main>

        {/* Right: Sidebar */}
        <aside className="sns-sidebar">
          <TrendingSidebar layer={layer} />
        </aside>
      </div>
    </div>
  );
}
