// 世界観ハブ — 5章構成のチャプター選択ページ
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

export const metadata = {
    title: '世界観 — 電脳怪異譚 KAI-I//KILL',
    description: '近未来の架空日本、怪異の定義、魔法の体系、装備分類、討伐プロセスなど世界観バイブルをチャプター別に公開。',
};

// チャプター定義（MDセクション番号でグルーピング）
const CHAPTERS = [
    {
        slug: 'world',
        title: 'この世界について',
        titleEn: 'THE WORLD',
        desc: '架空日本の全体像、都市と地方管区、食と日常、そして怪異が存在する社会。',
        icon: '◉',
        sections: ['はじめに', '1. 世界概要'],
    },
    {
        slug: 'anomaly',
        title: '怪異と討伐',
        titleEn: 'ANOMALIES & COMBAT',
        desc: '怪異とは何か、核とルールの仕組み、分類体系、そして怪異を暴き討伐するまでのプロセス。',
        icon: '△',
        sections: ['2. 怪異とは何か', '3. 核とルール', '4. 怪異の分類', '5. 怪異を暴くプロセス', '6. 討伐手段'],
    },
    {
        slug: 'powers',
        title: '能力と装備',
        titleEn: 'POWERS & EQUIPMENT',
        desc: '魔法と異能の体系、魔導具、武装型から搭乗型までの装備分類。',
        icon: '✦',
        sections: ['7. 能力体系', '8. 魔導具', '9. 装備分類体系'],
    },
    {
        slug: 'factions',
        title: '組織と社会',
        titleEn: 'FACTIONS & SOCIETY',
        desc: '討伐免許制度、祓部・傭兵・無所属の三勢力、覚醒パターン、素養と権力構造、怪異への対応をめぐる思想、稀人。',
        icon: '⛊',
        sections: ['10. 討伐免許制度', '11. 三種の討伐者', '12. 覚醒パターン', '13. 素養と社会構造', '14. 魔導具産業と権力構造', '15. 怪異への対応をめぐる思想', '16. 稀人（まれびと）とは', '17. 謎の組織について'],
    },
    {
        slug: 'guide',
        title: 'プレイヤーへの手引き',
        titleEn: 'PLAYER GUIDANCE',
        desc: 'キャラクター作成の指針と、この世界で生き延びるための原則。',
        icon: '▶',
        sections: ['18. キャラクター作成の指針', '19. この世界で生き延びるための原則'],
    },
];

// 各チャプターの冒頭テキストを取得
function getChapterPreview(content, sectionTitle) {
    const lines = content.split('\n');
    const idx = lines.findIndex(l => l.startsWith('## ') && l.includes(sectionTitle));
    if (idx === -1) return '';
    // セクション開始後の最初の段落テキストを取得
    for (let i = idx + 1; i < Math.min(idx + 10, lines.length); i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('#') && !line.startsWith('|') && !line.startsWith('-') && line !== '---') {
            return line.length > 120 ? line.slice(0, 120) + '…' : line;
        }
    }
    return '';
}

export default function WorldPage() {
    const filePath = path.join(process.cwd(), 'docs', 'player', 'world_bible_v1.0.md');
    const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';

    return (
        <div className="container">
            <div className="page-header">
                <div className="page-header__badge">WORLD BIBLE — PLAYER HANDBOOK</div>
                <h1 className="page-header__title">世界観バイブル</h1>
                <div className="page-header__subtitle">電脳怪異譚　KAI-I//KILL — 討伐者ハンドブック</div>
                <p className="page-header__lead" style={{ marginTop: 'var(--space-md)', color: 'var(--text-secondary)', lineHeight: 1.9 }}>
                    この世界に踏み込む前に知っておくべき情報を5つの章に分けて解説する。
                </p>
            </div>

            <div style={{ display: 'grid', gap: 'var(--space-lg)', marginBottom: 'var(--space-3xl)' }}>
                {CHAPTERS.map((ch, i) => (
                    <Link key={ch.slug} href={`/world/${ch.slug}/`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{
                            background: 'var(--bg-card)',
                            border: 'var(--border-subtle)',
                            padding: 'var(--space-xl)',
                            display: 'flex',
                            gap: 'var(--space-lg)',
                            alignItems: 'flex-start',
                            transition: 'border-color 0.2s',
                        }}>
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--font-size-2xl)',
                                color: 'var(--accent-gold)',
                                opacity: 0.6,
                                minWidth: '40px',
                                textAlign: 'center',
                                lineHeight: 1,
                                paddingTop: '4px',
                            }}>
                                {ch.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
                                    CH.{String(i + 1).padStart(2, '0')} — {ch.titleEn}
                                </div>
                                <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-sm)', color: 'var(--text-heading)' }}>
                                    {ch.title}
                                </h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-md)', lineHeight: 2.0, marginBottom: 'var(--space-sm)' }}>
                                    {ch.desc}
                                </p>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                                    {ch.sections.length}セクション
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <Link href="/world/full/" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', textDecoration: 'none' }}>
                → 全文を1ページで読む
            </Link>
        </div>
    );
}

// チャプター定義をエクスポート（[section]/page.js で使用）
export { CHAPTERS };
