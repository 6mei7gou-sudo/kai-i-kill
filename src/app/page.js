// トップページ — プロジェクト紹介 + News/Release
import Link from 'next/link';
import NewsFeed from './NewsFeed';

export default function HomePage() {
  return (
    <div className="container">
      {/* ===== ヒーローセクション ===== */}
      <section className="hero">
        <div className="hero__hex" />
        <div className="hero__label">TRPG × VRChat — LIVING WORLD PROJECT</div>
        <div className="hero__title-sm">電 脳 怪 異 譚</div>
        <h1 className="hero__title">KAI-I//KILL</h1>
        <div className="hero__reading">カ イ イ キ ル</div>

        <p className="hero__catchcopy">
          <span className="hero__accent">噂</span>が、殺しにくる。
        </p>

        <p className="hero__tagline">
          TRPGとVRChatが交差する、拡張し続ける世界。
          <br />
          あなたが遊んだセッションが、この世界の歴史になる。
        </p>

        <div className="hero__cta-group">
          <Link href="/quickstart/" className="hero__cta">
            ▶ はじめる
          </Link>
          <Link href="/world/" className="hero__cta hero__cta--ghost">
            世界を知る
          </Link>
        </div>

        <div className="hero__scroll">▼ scroll to begin</div>
      </section>

      {/* ===== プロジェクト概要 ===== */}
      <section className="section">
        <div className="section__number">01 — PROJECT</div>
        <h2 className="section__heading">
          プロジェクト概要
          <span className="section__heading-en">ABOUT KAI-I//KILL</span>
        </h2>
      </section>

      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <p className="section__desc" style={{ marginBottom: 'var(--space-lg)' }}>
          電脳怪異譚 KAI-I//KILL は、<span className="text-gold">TRPG</span>と<span className="text-gold">VRChat</span>を軸に展開する「生きた世界」プロジェクトだ。
        </p>

        <div className="two-col" style={{ marginBottom: 'var(--space-lg)' }}>
          <div style={{ background: 'var(--bg-card)', padding: 'var(--space-lg)', border: 'var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
              TRPG
            </div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>卓で物語を紡ぐ</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
              オリジナルTRPGシステム《共鳴記録》。怪異を調査し、解明し、討伐する。判定のたびに感情が蓄積し、力と引き換えに人間性が削られていく。
            </p>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: 'var(--space-lg)', border: 'var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
              VRChat
            </div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>仮想空間で世界に立つ</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
              VRChat上に構築された世界で、キャラクターとして存在する。セッションの結果がワールドに反映され、物語が進行する。
            </p>
          </div>
        </div>

        <div className="callout" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="callout__label">世界は拡張される：</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            セッションで起きた事件は世界の歴史に刻まれる。新しい怪異が発見され、組織が動き、勢力図が書き換わる。この世界は完成しない——<span className="text-gold">プレイヤーが遊ぶたびに拡張されていく。</span>
          </p>
        </div>
      </div>

      {/* ===== 世界観ティーザー ===== */}
      <section className="section">
        <div className="section__number">02 — WORLD</div>
        <h2 className="section__heading">
          この世界について
          <span className="section__heading-en">WORLD CONCEPT</span>
        </h2>
      </section>

      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <section className="teaser">
          <p className="teaser__quote">
            話しても、<span className="teaser__em">誰も信じてくれない。</span>
            <br />
            それがこの仕事だ。
          </p>
          <p className="teaser__body">
            近未来の架空日本。魔法はインフラとして社会に組み込まれ、その裏側では集合的な噂が臨界を超えて現実にバグとして侵食する——怪異が日常的に発生している。
            あなたは討伐者だ。怪異を調査し、核とルールを解明し、討伐する。
          </p>
        </section>

        <div className="concept-grid">
          <div className="concept-card">
            <div className="concept-card__number">PHASE 01</div>
            <h3 className="concept-card__title">調査せよ</h3>
            <div className="concept-card__title-en">INVESTIGATE</div>
            <p className="concept-card__desc">
              怪異の正体を特定する。噂の出処を辿り、被害パターンを読み、核の在処を突き止めろ。
            </p>
          </div>
          <div className="concept-card">
            <div className="concept-card__number">PHASE 02</div>
            <h3 className="concept-card__title">解明せよ</h3>
            <div className="concept-card__title-en">DECODE</div>
            <p className="concept-card__desc">
              怪異のルールを暴く。ルールを破るほど逃げられなくなる。情報収集と生存のトレードオフ。
            </p>
          </div>
          <div className="concept-card">
            <div className="concept-card__number">PHASE 03</div>
            <h3 className="concept-card__title">討伐せよ</h3>
            <div className="concept-card__title-en">EXECUTE</div>
            <p className="concept-card__desc">
              核を破壊し、怪異を消滅させる。戦闘力だけで解決できる怪異は存在しない。
            </p>
          </div>
        </div>
      </div>

      {/* ===== News & Release ===== */}
      <section className="section">
        <div className="section__number">03 — NEWS & RELEASE</div>
        <h2 className="section__heading">
          お知らせ
          <span className="section__heading-en">LATEST UPDATES</span>
        </h2>
      </section>

      <NewsFeed />

      {/* ===== ナビゲーション ===== */}
      <section className="section">
        <div className="section__number">04 — NAVIGATION</div>
        <h2 className="section__heading">
          設定資料
          <span className="section__heading-en">DOCUMENTS</span>
        </h2>
      </section>

      <div className="card-grid">
        <Link href="/quickstart/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card">
            <div className="card__icon">▶</div>
            <div className="card__title-en">QUICKSTART</div>
            <h3 className="card__title">クイックスタート</h3>
            <p className="card__desc">
              キャラクター作成の手順と能力値の解説。はじめての人はここから。
            </p>
          </div>
        </Link>

        <Link href="/world/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card">
            <div className="card__icon">◉</div>
            <div className="card__title-en">WORLD BIBLE</div>
            <h3 className="card__title">世界観バイブル</h3>
            <p className="card__desc">
              怪異の定義、魔法と異能の体系、装備分類、討伐プロセス。この世界の根幹がここにある。
            </p>
          </div>
        </Link>

        <Link href="/organizations/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card">
            <div className="card__icon">⛊</div>
            <div className="card__title-en">FACTIONS</div>
            <h3 className="card__title">組織・人物</h3>
            <p className="card__desc">
              祓部・傭兵集団・無所属。三つの勢力と権力構造を解説する。
            </p>
          </div>
        </Link>

        <Link href="/glossary/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card">
            <div className="card__icon">▤</div>
            <div className="card__title-en">GLOSSARY</div>
            <h3 className="card__title">用語集</h3>
            <p className="card__desc">
              専門用語をカテゴリ別に検索・閲覧。怪異・能力・装備・組織を網羅。
            </p>
          </div>
        </Link>

        <Link href="/timeline/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card">
            <div className="card__icon">◈</div>
            <div className="card__title-en">TIMELINE</div>
            <h3 className="card__title">世界年表</h3>
            <p className="card__desc">
              鵺ヶ原事変から御神楽事変まで。この世界で起きた事件を時系列で辿る。
            </p>
          </div>
        </Link>

        <Link href="/community/anomalies/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card">
            <div className="card__icon">◇</div>
            <div className="card__title-en">COMMUNITY</div>
            <h3 className="card__title">コミュニティDB</h3>
            <p className="card__desc">
              怪異調査書・武器装備・キャラシート。プレイヤーの投稿を閲覧する。
            </p>
          </div>
        </Link>
      </div>

      {/* ===== クロージング ===== */}
      <section className="closing">
        <p className="closing__text">
          <span className="closing__em">この世界はまだすべて描かれていない。</span>
        </p>
      </section>
    </div>
  );
}
