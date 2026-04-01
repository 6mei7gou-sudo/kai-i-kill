// TRPGルール ハブページ — 全章への目次
import Link from 'next/link';

export const metadata = {
    title: 'TRPGルール — 電脳怪異譚 KAI-I//KILL',
    description: '電脳怪異譚 KAI-I//KILLのTRPGルールブック全章。判定・戦闘・調査・魔法・装備・スキルなど。',
};

const CHAPTERS = [
    { slug: 'overview',      num: '00', title: 'このゲームについて',    desc: '世界観の概要・怪異のメカニズム・能力体系・三組織', icon: '◉' },
    { slug: 'dice',          num: '01', title: '基本判定システム',      desc: 'ランク制ダイスプール・段階修正・判定手順', icon: '◇' },
    { slug: 'resonance',     num: '02', title: '《共鳴記録》',         desc: '6種の感情メーター・覚醒ギフト・臨界', icon: '◈' },
    { slug: 'combat',        num: '03', title: '戦闘《核護衛戦》',     desc: '核と護衛の構造・ラウンド進行・ダメージ計算・行動一覧', icon: '⚔' },
    { slug: 'skills',        num: '04', title: 'スキルシステム',       desc: '6軸スキル・所属/配属/覚醒/背景/武器技能', icon: '▤' },
    { slug: 'investigation',  num: '05', title: '調査・解明・討伐',     desc: '三段階プロセス・四つの解明鍵・予兆カード', icon: '△' },
    { slug: 'magic',         num: '06', title: '魔法システム',         desc: '8つの魔法言語・怪異誘発判定・得意/苦手', icon: '✦' },
    { slug: 'innate',        num: '07', title: '異能',               desc: '異能の発現・使用制限・変質リスク', icon: '◆' },
    { slug: 'creation',      num: '08', title: 'キャラクター作成',     desc: '10ステップの作成手順・初期値・制限', icon: '☖' },
    { slug: 'affiliation',   num: '09', title: '所属システム',         desc: '祓部・傭兵・無所属の詳細・配属選択肢', icon: '✕' },
    { slug: 'equipment',     num: '10', title: '装備システム',         desc: '武器種×企業マトリクス・CP・スロット・カスタム', icon: '⊕' },
    { slug: 'gifts',         num: '11', title: 'ギフト',             desc: '初期ギフト・覚醒ギフト・共鳴段階解放', icon: '★' },
    { slug: 'level',         num: '12', title: 'レベルシステム',       desc: 'Lv1-10の成長・能力値昇格・スキル追加・装備解禁', icon: '▶' },
    { slug: 'anomaly-data',  num: '13', title: '怪異データ集',        desc: '等級別怪異テンプレート・護衛データ・特殊怪異', icon: '△' },
    { slug: 'appendix',      num: 'AP', title: 'クイックリファレンス', desc: '判定チャート・ダメージ表・行動一覧', icon: '▤' },
];

export default function RulesHubPage() {
    return (
        <div className="container">
            <div className="page-header">
                <div className="page-header__badge">TRPG RULEBOOK v4.0</div>
                <h1 className="page-header__title">TRPGルール</h1>
                <div className="page-header__subtitle">電脳怪異譚　KAI-I//KILL — 《共鳴記録》統合エディション</div>
            </div>

            <div className="callout" style={{ marginBottom: 'var(--space-2xl)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
                    全14章＋付録で構成されるTRPGルールブック。
                    初めての方は<Link href="/quickstart/" style={{ color: 'var(--accent-gold)', textDecoration: 'none', fontWeight: 700 }}>クイックスタート</Link>から読むことを推奨する。
                </p>
            </div>

            <div className="card-grid" style={{ marginBottom: 'var(--space-3xl)' }}>
                {CHAPTERS.map(ch => (
                    <Link key={ch.slug} href={`/rules/${ch.slug}/`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <div className="card__icon">{ch.icon}</div>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>CH.{ch.num}</span>
                            </div>
                            <div className="card__title-en">{ch.slug.toUpperCase()}</div>
                            <h3 className="card__title">{ch.title}</h3>
                            <p className="card__desc">{ch.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
