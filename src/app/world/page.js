// 世界観ハブ — 5章構成のチャプター選択ページ
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { CHAPTERS } from './chapters';

export const metadata = {
    title: '世界観 — 電脳怪異譚 KAI-I//KILL',
    description: '近未来の架空日本、怪異の定義、魔法の体系、装備分類、討伐プロセスなど世界観バイブルをチャプター別に公開。',
};

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
