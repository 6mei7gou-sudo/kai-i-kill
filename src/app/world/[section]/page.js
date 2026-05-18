// 世界観バイブル — チャプター別ページ
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import MdRenderer from '@/components/MarkdownRenderer';
import { CHAPTERS } from '../chapters';

// MDファイルから指定セクション群を抽出
function extractSections(content, sectionTitles) {
    const lines = content.split('\n');
    let result = [];
    let capturing = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('## ')) {
            const title = line.replace(/^## /, '').trim();
            // このセクションが対象かチェック
            capturing = sectionTitles.some(s => title === s || title.includes(s));
        }

        if (capturing) {
            result.push(line);
        }
    }

    return result.join('\n');
}

export async function generateStaticParams() {
    return CHAPTERS.map(ch => ({ section: ch.slug }));
}

export async function generateMetadata({ params }) {
    const { section } = await params;
    const ch = CHAPTERS.find(c => c.slug === section);
    return {
        title: ch ? `${ch.title} — 世界観 — KAI-I//KILL` : '世界観 — KAI-I//KILL',
        description: ch ? `世界観バイブル「${ch.title}」の全文。` : '',
    };
}

export default async function WorldSectionPage({ params }) {
    const { section } = await params;
    const chIdx = CHAPTERS.findIndex(c => c.slug === section);
    const ch = CHAPTERS[chIdx];

    if (!ch) {
        return (
            <div className="container">
                <h1>ページが見つかりません</h1>
                <Link href="/world/">← 世界観バイブルに戻る</Link>
            </div>
        );
    }

    const filePath = path.join(process.cwd(), 'docs', 'player', 'world_bible_v1.0.md');
    const fullContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
    const sectionContent = extractSections(fullContent, ch.sections);

    const prev = chIdx > 0 ? CHAPTERS[chIdx - 1] : null;
    const next = chIdx < CHAPTERS.length - 1 ? CHAPTERS[chIdx + 1] : null;

    return (
        <div className="container">
            {/* パンくず */}
            <div style={{ marginBottom: 'var(--space-md)' }}>
                <Link href="/world/" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', textDecoration: 'none' }}>
                    ← 世界観バイブル
                </Link>
            </div>

            {/* ヘッダー */}
            <div className="page-header">
                <div className="page-header__badge">CH.{String(chIdx + 1).padStart(2, '0')} — {ch.titleEn}</div>
                <h1 className="page-header__title">{ch.title}</h1>
                <div className="page-header__subtitle">世界観バイブル — 電脳怪異譚 KAI-I//KILL</div>
            </div>

            {/* 本文 */}
            <MdRenderer content={sectionContent} showToc={ch.sections.length >= 4} bare={true} />

            {/* 前後ナビ */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-xl) 0',
                borderTop: 'var(--border-subtle)',
                marginTop: 'var(--space-2xl)',
            }}>
                {prev ? (
                    <Link href={`/world/${prev.slug}/`} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--accent-gold)', textDecoration: 'none' }}>
                        ← {prev.title}
                    </Link>
                ) : <span />}
                <Link href="/world/" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', textDecoration: 'none' }}>
                    目次
                </Link>
                {next ? (
                    <Link href={`/world/${next.slug}/`} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--accent-gold)', textDecoration: 'none' }}>
                        {next.title} →
                    </Link>
                ) : <span />}
            </div>
        </div>
    );
}
