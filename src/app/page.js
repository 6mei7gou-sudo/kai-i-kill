// トップページ — プロジェクト紹介 + News/Release
import Link from 'next/link';
import NewsFeed from './NewsFeed';

export default function HomePage() {
  return (
    <div className="container">
      {/* ===== ヒーローセクション ===== */}
      <section className="hero">
        <div className="hero__hex" />
        <div className="hero__label">TRPG × VRChat × Web Game × Community — LIVING WORLD PROJECT</div>
        <div className="hero__title-sm">電 脳 怪 異 譚</div>
        <h1 className="hero__title">KAI-I//KILL</h1>
        <div className="hero__reading">カ イ イ キ ル</div>

        <p className="hero__catchcopy">
          <span className="hero__accent">噂</span>が、殺しにくる。
        </p>

        <p className="hero__tagline">
          TRPG、VRChat、Webゲーム、コミュニティ投稿——四つの入口が一つの世界に繋がる。
          <br />
          あなたがどこから参加しても、この世界の歴史になる。
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

      {/* ===== News & Release ===== */}
      <section className="section">
        <div className="section__number">01 — NEWS & RELEASE</div>
        <h2 className="section__heading">
          お知らせ
          <span className="section__heading-en">LATEST UPDATES</span>
        </h2>
      </section>

      <NewsFeed />

      {/* ===== プロジェクト概要 ===== */}
      <section className="section">
        <div className="section__number">02 — PROJECT</div>
        <h2 className="section__heading">
          プロジェクト概要
          <span className="section__heading-en">ABOUT KAI-I//KILL</span>
        </h2>
      </section>

      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <p className="section__desc" style={{ marginBottom: 'var(--space-lg)' }}>
          電脳怪異譚 KAI-I//KILL は、四つのメディアが一つの世界を共有する「生きた世界」プロジェクトだ。
        </p>

        {/* 四つの柱 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          <div style={{ background: 'var(--bg-card)', padding: 'var(--space-lg)', border: 'var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
              TRPG
            </div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>卓で物語を紡ぐ</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
              オリジナルシステム《共鳴記録》。GMとプレイヤーがリアルタイムで怪異に挑む。判定のたびに感情が蓄積し、力と引き換えに人間性が削られていく。
            </p>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: 'var(--space-lg)', border: 'var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
              WEB GAME
            </div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>非同期で世界に参加する</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
              Web上でキャラクターの行動を投稿し、物語に参加する。TRPGセッションに参加できない時間帯でも、あなたのキャラクターは世界の中で生きている。
            </p>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: 'var(--space-lg)', border: 'var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
              VRChat
            </div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>仮想空間で世界に立つ</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
              VRChat上に構築された世界で、キャラクターとして存在する。公式キャラクターによるグリーティングやイベントを定期開催予定。参加者には<span className="text-gold">限定称号</span>が付与され、キャラクターシートに刻まれる。
            </p>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: 'var(--space-lg)', border: 'var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
              COMMUNITY DB
            </div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>世界を記録し、共有する</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
              怪異調査書・装備・キャラクターシートをプレイヤーが投稿する。投稿された怪異が公認されれば、それは世界の一部になる。
            </p>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: 'var(--space-lg)', border: 'var(--border-subtle)', borderTop: '3px solid var(--accent-gold)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
              VR GREETING
            </div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>公式キャラに会いに行く</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
              祓部の隊員、傭兵のエージェント、裏社会の情報屋——ワールドに公式キャラクター登場の可能性。話しかければ世界の裏話が聞けるかも。
            </p>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: 'var(--space-lg)', border: 'var(--border-subtle)', borderTop: '3px solid #aa44ff' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: '#aa44ff', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
              VR EVENT & TITLE
            </div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>イベントで称号を得る</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
              定期VRイベントに参加すると<span className="text-gold">限定称号</span>を獲得できる。称号はキャラクターシートに刻まれ、Webサイト上にも表示される——あなたがそこにいた証。
            </p>
          </div>
        </div>

        {/* リソースシステム */}
        <div style={{ background: 'var(--bg-card)', padding: 'var(--space-lg)', border: '1px solid var(--accent-gold-border)', marginBottom: 'var(--space-lg)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-sm)' }}>
            RESOURCE SYSTEM — ACCOUNT ECONOMY
          </div>
          <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-md)' }}>ゲームリソースで世界を動かす</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8, marginBottom: 'var(--space-md)' }}>
            Webゲームで稼いだリソース（通貨）は<span className="text-gold">アカウントごとに蓄積</span>される。武器の投稿、装備の改造、TRPGで作った武器の展示——すべてにゲームリソースが絡む。遊ぶほどできることが増えていく。
          </p>
          <div className="content-body" style={{ marginBottom: 'var(--space-md)' }}>
            <table>
              <thead>
                <tr>
                  <th>操作</th>
                  <th>コスト</th>
                  <th>説明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>キャラクター作成</td>
                  <td style={{ color: 'var(--accent-gold)', whiteSpace: 'nowrap' }}>無料</td>
                  <td>作成時に武器を<span className="text-gold">1つ無料で登録</span>できる</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>武器の追加投稿</td>
                  <td style={{ whiteSpace: 'nowrap' }}>リソース必要</td>
                  <td>2本目以降の武器登録にはゲームリソースを消費する</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>装備の改造</td>
                  <td style={{ whiteSpace: 'nowrap' }}>リソース必要</td>
                  <td>素材＋改造費用をゲームリソースで支払う</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>TRPG武器の展示</td>
                  <td style={{ whiteSpace: 'nowrap' }}>リソース必要</td>
                  <td>TRPGセッションで作った武器をWeb上に公開・展示する</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div style={{ borderLeft: '2px solid var(--accent-gold)', paddingLeft: 'var(--space-md)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-xs)' }}>
                TRPG → Web
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
                セッションで得た装備・実績・怪異情報はWebに同期。TRPGで作った武器の展示にはリソースが必要。
              </p>
            </div>
            <div style={{ borderLeft: '2px solid var(--accent-gold)', paddingLeft: 'var(--space-md)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-xs)' }}>
                Web → TRPG
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
                Webで購入・改造した装備や調査で得た経験をTRPGセッションに持ち込める。
              </p>
            </div>
          </div>
        </div>

        {/* 称号・シナリオ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          <div style={{ background: 'var(--bg-card)', padding: 'var(--space-lg)', border: 'var(--border-subtle)', borderLeft: '3px solid var(--accent-gold)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
              WEB EXCLUSIVE TITLE
            </div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>Web限定称号</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
              Webゲームの特定条件を達成すると<span className="text-gold">Web限定の称号</span>を獲得できる。依頼達成数、討伐実績、コミュニティ貢献——遊び方の数だけ称号がある。
            </p>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: 'var(--space-lg)', border: 'var(--border-subtle)', borderLeft: '3px solid #cc4444' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: '#cc4444', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
              OFFICIAL SCENARIO TITLE
            </div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>公式シナリオ限定称号</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
              公式シナリオをクリアした者だけが手に入れる<span style={{ color: '#cc4444' }}>特別な称号</span>。物語の核心に触れた証として、キャラクターシートに永久に刻まれる。
            </p>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: 'var(--space-lg)', border: 'var(--border-subtle)', borderLeft: '3px solid #aa44ff' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: '#aa44ff', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
              WEB SCENARIO
            </div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>公式Webシナリオ</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
              公式シナリオを購入すると、そのシナリオに連動した<span style={{ color: '#aa44ff' }}>Webシナリオ</span>にも参加可能に。TRPGの卓を離れても、物語の続きをWebで体験できる。
            </p>
          </div>
        </div>

        <div className="callout" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="callout__label">世界は拡張される：</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            セッションで起きた事件、Webゲームで進行した依頼、コミュニティに投稿された怪異——すべてが世界の歴史に刻まれる。この世界は完成しない。<span className="text-gold">プレイヤーが遊ぶたびに広がっていく。</span>
          </p>
        </div>
      </div>

      {/* ===== 世界観ティーザー ===== */}
      <section className="section">
        <div className="section__number">03 — WORLD</div>
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
