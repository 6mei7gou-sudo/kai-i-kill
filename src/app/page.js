// トップページ — HUD風デザイン
import fs from 'fs';
import path from 'path';
import Link from 'next/link';

function loadData(filename) {
  const filePath = path.join(process.cwd(), 'data', filename);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return null;
}

export default function HomePage() {
  const worldBible = loadData('world_bible.json');
  const overview = worldBible?.[0]?.body || '';

  return (
    <div className="container">
      {/* ヒーローセクション */}
      <section className="hero">
        <div className="hero__hex" />
        <div className="hero__label">PLAYER HANDBOOK — AUTHORIZED DOCUMENT</div>
        <div className="hero__title-sm">電 脳 怪 異 譚</div>
        <h1 className="hero__title">KAI-I//KILL</h1>
        <div className="hero__reading">カ イ イ キ ル</div>
        <div className="hero__sub">討伐者ハンドブック</div>
        <p className="hero__desc">
          {overview.split('\n\n')[0]}
        </p>
        <div className="hero__scroll">▼ scroll to begin</div>
      </section>

      {/* 世界概要セクション */}
      <section className="section">
        <div className="section__number">01 — WORLD OVERVIEW</div>
        <h2 className="section__heading">
          この世界について
          <span className="section__heading-en">WORLD</span>
        </h2>
      </section>

      {/* 表の世界 / 裏の世界 */}
      <div className="two-col" style={{ marginBottom: 'var(--space-2xl)' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-sm)' }}>
            SURFACE
          </div>
          <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-sm)' }}>高度情報社会</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
            魔法が資格制度と安全基準を持つインフラとして機能する近未来。SNSと都市伝説が怪異の燃料になる時代だ。
          </p>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-sm)' }}>
            UNDERSIDE
          </div>
          <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-sm)' }}>怪異の侵食</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
            噂や言説が質量を持ち、現実にバグとして侵食する怪異が日常的に発生している。一般市民には秘匿されている。
          </p>
        </div>
      </div>

      {/* パラドックス */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-sm)' }}>
          PARADOX
        </div>
        <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-sm)' }}>見えるが信じられない</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
          怪異は一般人にも見える。干渉もできる。問題は「話しても誰も信じてくれない」ことだ。
        </p>
      </div>

      {/* 警告ボックス */}
      <div className="callout--danger callout" style={{ marginBottom: 'var(--space-3xl)' }}>
        <div className="callout__label" style={{ color: 'var(--accent-danger)' }}>秘匿と認知：</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          怪異の存在は秘匿されているが、見えないということとは別だ。知識・訓練・装備の差が討伐者と一般人を分ける。無知が人を殺す。
        </p>
      </div>

      {/* ナビゲーションカード */}
      <section className="section">
        <div className="section__number">02 — NAVIGATION</div>
        <h2 className="section__heading">
          設定資料
          <span className="section__heading-en">DOCUMENTS</span>
        </h2>
      </section>

      <div className="card-grid">
        <Link href="/world/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card">
            <div className="card__icon">◉</div>
            <div className="card__title-en">WORLD BIBLE</div>
            <h3 className="card__title">世界観バイブル</h3>
            <p className="card__desc">
              怪異の定義、魔法と異能の体系、装備分類、討伐プロセスなど、この世界の根幹を解説する。
            </p>
          </div>
        </Link>

        <Link href="/glossary/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card">
            <div className="card__icon">▤</div>
            <div className="card__title-en">GLOSSARY</div>
            <h3 className="card__title">用語集</h3>
            <p className="card__desc">
              52件の用語をカテゴリ別に検索・閲覧できる。怪異・能力・装備・組織の全てを網羅。
            </p>
          </div>
        </Link>

        <Link href="/timeline/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card">
            <div className="card__icon">◈</div>
            <div className="card__title-en">TIMELINE</div>
            <h3 className="card__title">世界年表</h3>
            <p className="card__desc">
              鵺ヶ原事変から御神楽事変まで、この世界で起きた事件の記録を時系列で辿る。
            </p>
          </div>
        </Link>

        <Link href="/organizations/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card">
            <div className="card__icon">⛊</div>
            <div className="card__title-en">FACTIONS</div>
            <h3 className="card__title">三種の討伐者</h3>
            <p className="card__desc">
              祓部・傭兵集団・無所属。三つの勢力の詳細と権力構造を解説する。
            </p>
          </div>
        </Link>

        <Link href="/anomalies/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card">
            <div className="card__icon">△</div>
            <div className="card__title-en">ANOMALY DATABASE</div>
            <h3 className="card__title">怪異記録</h3>
            <p className="card__desc">
              等級体系・分類・無力化方法など、怪異に関する公開情報データベース。
            </p>
          </div>
        </Link>

        <div className="card" style={{ opacity: 0.4, borderStyle: 'dashed' }}>
          <div className="card__icon">≡</div>
          <div className="card__title-en">COMING SOON</div>
          <h3 className="card__title">資料・参照</h3>
          <p className="card__desc">
            追加の設定資料と参照ドキュメントを順次公開予定。
          </p>
        </div>
      </div>
    </div>
  );
}
