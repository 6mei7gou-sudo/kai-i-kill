// トップページ — 初心者向けルート案内 + 世界観 + News
import Link from 'next/link';
import NewsFeed from './NewsFeed';

export default function HomePage() {
  return (
    <div className="container">
      {/* ===== ヒーロー ===== */}
      <section className="hero">
        <div className="hero__hex" />
        <div className="hero__label">TRPG × Web Game × VRChat × Community</div>
        <div className="hero__title-sm">電 脳 怪 異 譚</div>
        <h1 className="hero__title">KAI-I//KILL</h1>
        <div className="hero__reading">カ イ イ キ ル</div>

        <p className="hero__catchcopy">
          <span className="hero__accent">噂</span>が、殺しにくる。
        </p>

        <p className="hero__tagline">
          近未来の架空日本。集合的な噂が現実を侵食する世界で、あなたは討伐者になる。
        </p>

        <div className="hero__cta-group">
          <Link href="/quickstart/" className="hero__cta">
            ▶ はじめる
          </Link>
        </div>

        <div className="hero__scroll">▼ scroll to begin</div>
      </section>

      {/* ===== はじめての方へ — 3ルート案内 ===== */}
      <section className="section">
        <div className="section__number">01 — START HERE</div>
        <h2 className="section__heading">
          はじめての方へ
          <span className="section__heading-en">CHOOSE YOUR PATH</span>
        </h2>
      </section>

      <p className="section__desc" style={{ marginBottom: 'var(--space-xl)' }}>
        何をしたいかで、最初に読むページが変わります。
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-3xl)' }}>
        <Link href="/quickstart/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            background: 'var(--bg-card)', padding: 'var(--space-xl)', border: 'var(--border-subtle)',
            borderTop: '3px solid var(--accent-gold)', transition: 'border-color 0.2s',
            minHeight: '200px', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-2xl)', color: 'var(--accent-gold)', marginBottom: 'var(--space-sm)' }}>
              ▶
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.15em', marginBottom: 'var(--space-xs)' }}>
              FOR TRPG PLAYERS
            </div>
            <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-md)' }}>RPで遊びたい</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-md)', lineHeight: 2.0, flex: 1 }}>
              キャラクターの作り方、ダイスの振り方、戦闘の流れを順番に解説します。はじめてTRPGに触れる人でも大丈夫。
            </p>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-md)' }}>
              → クイックスタート
            </div>
          </div>
        </Link>

        <Link href="/games/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            background: 'var(--bg-card)', padding: 'var(--space-xl)', border: 'var(--border-subtle)',
            borderTop: '3px solid var(--accent-cyber)', transition: 'border-color 0.2s',
            minHeight: '200px', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-2xl)', color: 'var(--accent-cyber)', marginBottom: 'var(--space-sm)' }}>
              ⚔
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-cyber)', letterSpacing: '0.15em', marginBottom: 'var(--space-xs)' }}>
              FOR WEB GAME PLAYERS
            </div>
            <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-md)' }}>Webゲームで遊びたい</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-md)', lineHeight: 2.0, flex: 1 }}>
              ブラウザだけで怪異討伐ミッション、テキストアドベンチャー、派遣クエストが楽しめます。一人でもすぐに始められます。
            </p>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-md)' }}>
              → ゲームハブ
            </div>
          </div>
        </Link>

        <Link href="/world/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            background: 'var(--bg-card)', padding: 'var(--space-xl)', border: 'var(--border-subtle)',
            borderTop: '3px solid #9a9a9a', transition: 'border-color 0.2s',
            minHeight: '200px', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-2xl)', color: '#9a9a9a', marginBottom: 'var(--space-sm)' }}>
              ◉
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: '#9a9a9a', letterSpacing: '0.15em', marginBottom: 'var(--space-xs)' }}>
              FOR WORLD READERS
            </div>
            <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-md)' }}>世界観を読みたい</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-md)', lineHeight: 2.0, flex: 1 }}>
              怪異とは何か、魔法はどう使われるのか、この世界の歴史と組織を知りたい人はここから。
            </p>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-md)' }}>
              → 世界観バイブル
            </div>
          </div>
        </Link>
      </div>

      {/* ===== 世界観ティーザー ===== */}
      <section className="section">
        <div className="section__number">02 — WORLD</div>
        <h2 className="section__heading">
          この世界について
          <span className="section__heading-en">WORLD CONCEPT</span>
        </h2>
      </section>

      <div style={{ marginBottom: 'var(--space-3xl)' }}>
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

      {/* ===== もっと知る ===== */}
      <section className="section">
        <div className="section__number">04 — EXPLORE</div>
        <h2 className="section__heading">
          もっと知る
          <span className="section__heading-en">DOCUMENTS & TOOLS</span>
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
              怪異の定義、魔法の体系、装備分類、討伐プロセス。この世界の根幹がここにある。
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

        <Link href="/community/" style={{ textDecoration: 'none', color: 'inherit' }}>
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
