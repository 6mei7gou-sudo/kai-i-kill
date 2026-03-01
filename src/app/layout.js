import './globals.css';
import Link from 'next/link';
import MobileMenuButton from './MobileMenuButton';
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

// メタデータ（SEO対応）
export const metadata = {
  title: '電脳怪異譚 KAI-I//KILL — 討伐者ハンドブック',
  description: '噂が形を持ち、現実にバグとして侵食する世界。電脳怪異譚 KAI-I//KILLの公式世界観・設定資料・怪異記録データベース。',
  keywords: ['電脳怪異譚', 'KAI-I//KILL', 'TRPG', 'PBW', '怪異', 'サイバーパンク', '和風ホラー'],
};

// サイドバーのナビゲーション構造
const navGroups = [
  {
    label: 'ページ一覧',
    items: [
      { href: '/', icon: '◉', text: '導入・世界概要' },
      { href: '/anomalies/', icon: '△', text: '怪異・能力・装備' },
      { href: '/organizations/', icon: '✕', text: '組織・人物' },
    ],
  },
  {
    label: '導入',
    items: [
      { href: '/world/', icon: '◉', text: '世界概要' },
      { href: '/timeline/', icon: '◈', text: '世界年表' },
    ],
  },
  {
    label: '怪異システム',
    items: [
      { href: '/anomalies/', icon: '△', text: '怪異とは' },
      { href: '/glossary/', icon: '▤', text: '用語集' },
    ],
  },
  {
    label: '組織・人物',
    items: [
      { href: '/organizations/haraebe/', icon: '⊙', text: '祓部詳細' },
      { href: '/organizations/mercenaries/', icon: '✕', text: '傭兵詳細' },
      { href: '/organizations/companies/', icon: '目', text: '企業詳細' },
      { href: '/organizations/unaffiliated/', icon: '◈', text: '無所属詳細' },
    ],
  },
  {
    label: '投稿ツール',
    items: [
      { href: '/create/anomaly/', icon: '▲', text: '怪異調査書を作成' },
      { href: '/create/weapon/', icon: '⚔', text: '武器・装備を投稿' },
      { href: '/create/character/', icon: '☖', text: 'キャラシート作成' },
    ],
  },
  {
    label: 'コミュニティDB',
    items: [
      { href: '/community/anomalies/', icon: '◇', text: '怪異調査書一覧' },
      { href: '/community/gear/', icon: '⊕', text: '武器・装備一覧' },
      { href: '/community/characters/', icon: '☖', text: 'キャラシート一覧' },
    ],
  },
];

export default function RootLayout({ children }) {
  return (
    <ClerkProvider appearance={{
      variables: {
        colorPrimary: '#00ffaa',
        colorBackground: '#1a1f2e',
        colorText: '#ffffff',
        colorTextSecondary: '#cccccc',
        colorInputBackground: '#252b3d',
        colorInputText: '#ffffff',
        colorNeutral: '#ffffff',
      },
      elements: {
        card: { backgroundColor: '#1a1f2e', border: '1px solid rgba(0,255,170,0.15)' },
        headerTitle: { color: '#ffffff' },
        headerSubtitle: { color: '#bbbbbb' },
        socialButtonsBlockButtonText: { color: '#ffffff' },
        formFieldLabel: { color: '#cccccc' },
        formFieldInput: { backgroundColor: '#252b3d', color: '#ffffff', borderColor: 'rgba(255,255,255,0.15)' },
        footerActionLink: { color: '#00ffaa' },
        identityPreviewEditButton: { color: '#00ffaa' },
      },
    }}>
      <html lang="ja">
        <body>
          <MobileMenuButton />

          <div className="site-layout">
            {/* 固定サイドバー */}
            <aside className="site-sidebar" id="sidebar">
              <div className="site-sidebar__header">
                <div className="site-sidebar__title-sm">電脳怪異譚</div>
                <div className="site-sidebar__title">KAI-I//KILL</div>
                <div className="site-sidebar__subtitle">討伐者ハンドブック</div>
                <div className="site-sidebar__version">VER. 1.0 — PLAYER DOC</div>
              </div>

              {/* 認証ボタン */}
              <div style={{ padding: '0 var(--space-md) var(--space-md)', borderBottom: 'var(--border-subtle)' }}>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button style={{
                      width: '100%', padding: '10px', fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--font-size-sm)', background: 'rgba(0, 255, 170, 0.1)',
                      border: '1px solid var(--accent-cyber)', color: 'var(--accent-cyber)',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}>▶ ログイン / 登録</button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: { width: 32, height: 32 },
                        },
                      }}
                    />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                      ログイン中
                    </span>
                  </div>
                </SignedIn>
              </div>

              <nav>
                {navGroups.map((group, gi) => (
                  <div key={gi} className="sidebar-nav__group">
                    <div className="sidebar-nav__group-label">{group.label}</div>
                    {group.items.map((item, ii) => (
                      <Link
                        key={ii}
                        href={item.href}
                        className="sidebar-nav__link"
                      >
                        <span className="sidebar-nav__icon">{item.icon}</span>
                        {item.text}
                      </Link>
                    ))}
                  </div>
                ))}
              </nav>
            </aside>

            {/* メインコンテンツ */}
            <main className="main-content">
              {children}

              {/* フッター */}
              <footer className="site-footer">
                <p>© 電脳怪異譚 KAI-I//KILL Project</p>
              </footer>
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
