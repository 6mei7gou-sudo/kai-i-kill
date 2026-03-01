// トップページ — コピーライティング重視のランディング
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container">
      {/* ===== ヒーローセクション ===== */}
      <section className="hero">
        <div className="hero__hex" />
        <div className="hero__label">PLAYER HANDBOOK — AUTHORIZED DOCUMENT</div>
        <div className="hero__title-sm">電 脳 怪 異 譚</div>
        <h1 className="hero__title">KAI-I//KILL</h1>
        <div className="hero__reading">カ イ イ キ ル</div>

        <p className="hero__catchcopy">
          <span className="hero__accent">噂</span>が、殺しにくる。
        </p>

        <p className="hero__tagline">
          集合的な噂や言説が臨界点を超えたとき、それは現実にバグとして侵食する。
          <br />
          見える。干渉もできる。けれど話しても、誰も信じてくれない。
          <br />
          あなたはその怪異と向き合う討伐者だ。
        </p>

        <div className="hero__cta-group">
          <Link href="/world/" className="hero__cta">
            ▶ 世界に踏み込む
          </Link>
          <Link href="/glossary/" className="hero__cta hero__cta--ghost">
            用語集を見る
          </Link>
        </div>

        <div className="hero__scroll">▼ scroll to begin</div>
      </section>

      {/* ===== コンセプト：討伐の3プロセス ===== */}
      <section className="section">
        <div className="section__number">01 — CONCEPT</div>
        <h2 className="section__heading">
          討伐のプロセス
          <span className="section__heading-en">HOW TO KILL</span>
        </h2>
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

      {/* ===== ティーザー：世界観の断片 ===== */}
      <section className="teaser">
        <p className="teaser__quote">
          話しても、<span className="teaser__em">誰も信じてくれない。</span>
          <br />
          それがこの仕事だ。
        </p>
        <p className="teaser__body">
          怪異は一般人にも見える。干渉もできる。体験は鮮明に残る。
          けれど友人には幻覚と笑われ、医者にはストレスと処理される。
          SNSに書けば創作扱い。知識と訓練と装備の差だけが、討伐者を討伐者たらしめる。
        </p>
      </section>

      {/* ===== ナビゲーション：コンテンツへの導線 ===== */}
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
              怪異の定義、魔法と異能の体系、装備分類、討伐プロセス。この世界の根幹がここにある。
            </p>
          </div>
        </Link>

        <Link href="/glossary/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card">
            <div className="card__icon">▤</div>
            <div className="card__title-en">GLOSSARY</div>
            <h3 className="card__title">用語集</h3>
            <p className="card__desc">
              52件の用語をカテゴリ別に検索・閲覧。怪異・能力・装備・組織を網羅したデータベース。
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

        <Link href="/organizations/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card">
            <div className="card__icon">⛊</div>
            <div className="card__title-en">FACTIONS</div>
            <h3 className="card__title">三種の討伐者</h3>
            <p className="card__desc">
              祓部・傭兵集団・無所属。三つの勢力と権力構造を解説する。
            </p>
          </div>
        </Link>

        <Link href="/anomalies/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card">
            <div className="card__icon">△</div>
            <div className="card__title-en">ANOMALY DATABASE</div>
            <h3 className="card__title">怪異記録</h3>
            <p className="card__desc">
              等級体系・分類・無力化方法。怪異に関する公開情報のデータベース。
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
          <span className="closing__em">このバイブルに書かれていないことが、この世界にはまだある。</span>
        </p>
      </section>
    </div>
  );
}
