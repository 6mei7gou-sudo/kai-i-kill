// TRPGルール 章別詳細ページ — MdRendererでMarkdownをレンダリング
import fs from 'fs';
import path from 'path';
import MdRenderer from '@/components/MarkdownRenderer';
import Link from 'next/link';

const CHAPTERS = {
    overview:      { file: 'overview.md',      title: 'このゲームについて',    badge: 'CHAPTER 0-1 — OVERVIEW',      num: '00' },
    dice:          { file: 'dice.md',          title: '基本判定システム',      badge: 'CHAPTER 2 — DICE SYSTEM',     num: '01' },
    resonance:     { file: 'resonance.md',     title: '《共鳴記録》',         badge: 'CHAPTER 3 — RESONANCE',       num: '02' },
    combat:        { file: 'combat.md',        title: '戦闘《核護衛戦》',     badge: 'CHAPTER 4 — COMBAT',          num: '03' },
    skills:        { file: 'skills.md',        title: 'スキルシステム',       badge: 'CHAPTER 5 — SKILLS',          num: '04' },
    investigation: { file: 'investigation.md', title: '調査・解明・討伐',     badge: 'CHAPTER 6 — INVESTIGATION',   num: '05' },
    magic:         { file: 'magic.md',         title: '魔法システム',         badge: 'CHAPTER 7 — MAGIC',           num: '06' },
    creation:      { file: 'creation.md',      title: 'キャラクター作成',     badge: 'CHAPTER 9 — CREATION',        num: '08' },
    affiliation:   { file: 'affiliation.md',   title: '所属システム',         badge: 'CHAPTER 10 — AFFILIATION',    num: '09' },
    equipment:     { file: 'equipment.md',     title: '装備システム',         badge: 'CHAPTER 11 — EQUIPMENT',      num: '10' },
    gifts:         { file: 'gifts.md',         title: 'ギフト',             badge: 'CHAPTER 12 — GIFTS',          num: '11' },
    level:         { file: 'level.md',         title: 'レベルシステム',       badge: 'CHAPTER 13 — LEVEL',          num: '12' },
    'anomaly-data': { file: 'anomaly-data.md', title: '怪異データ集',        badge: 'CHAPTER 14 — ANOMALY DATA',   num: '13' },
    appendix:      { file: 'appendix.md',      title: 'クイックリファレンス', badge: 'APPENDIX — QUICK REFERENCE',  num: 'AP' },
};

export function generateStaticParams() {
    return Object.keys(CHAPTERS).map(chapter => ({ chapter }));
}

export async function generateMetadata({ params }) {
    const { chapter } = await params;
    const meta = CHAPTERS[chapter];
    return {
        title: `${meta?.title || 'ルール'} — TRPGルール — 電脳怪異譚 KAI-I//KILL`,
        description: `電脳怪異譚 KAI-I//KILLのTRPGルール「${meta?.title}」の詳細。`,
    };
}

function loadChapterContent(chapter) {
    const meta = CHAPTERS[chapter];
    if (!meta) return '';
    const filePath = path.join(process.cwd(), 'docs', 'rules', 'chapters', meta.file);
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8');
    }
    return '';
}

// 前後の章を取得
function getNavChapters(chapter) {
    const keys = Object.keys(CHAPTERS);
    const idx = keys.indexOf(chapter);
    return {
        prev: idx > 0 ? { slug: keys[idx - 1], ...CHAPTERS[keys[idx - 1]] } : null,
        next: idx < keys.length - 1 ? { slug: keys[idx + 1], ...CHAPTERS[keys[idx + 1]] } : null,
    };
}

export default async function RuleChapterPage({ params }) {
    const { chapter } = await params;
    const meta = CHAPTERS[chapter];
    const content = loadChapterContent(chapter);

    if (!content || !meta) {
        return <div className="container"><h1>ルールデータが見つかりません</h1></div>;
    }

    const { prev, next } = getNavChapters(chapter);

    return (
        <>
            <MdRenderer
                content={content}
                pageTitle={meta.title}
                pageBadge={meta.badge}
                pageSubtitle="電脳怪異譚　KAI-I//KILL — TRPGルールブック v4.0"
                showToc={true}
            />
            {/* 前後の章ナビ */}
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-lg) 0 var(--space-3xl)', gap: 'var(--space-md)' }}>
                    {prev ? (
                        <Link href={`/rules/${prev.slug}/`} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--accent-cyber)', textDecoration: 'none' }}>
                            ← {prev.title}
                        </Link>
                    ) : <span />}
                    <Link href="/rules/" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', textDecoration: 'none' }}>
                        目次に戻る
                    </Link>
                    {next ? (
                        <Link href={`/rules/${next.slug}/`} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--accent-cyber)', textDecoration: 'none' }}>
                            {next.title} →
                        </Link>
                    ) : <span />}
                </div>
            </div>
        </>
    );
}
