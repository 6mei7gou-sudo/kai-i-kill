// 世界観バイブル — 全文1ページ表示（紐付けは src/lib/siteDocs.js）
import Link from 'next/link';
import MdRenderer from '@/components/MarkdownRenderer';
import { readSiteDoc } from '@/lib/siteDocs';

export const metadata = {
    title: '世界観（全文） — 電脳怪異譚 KAI-I//KILL',
    description: '世界観バイブルの全セクションを1ページで表示。',
};

export default function WorldFullPage() {
    const content = readSiteDoc('world-bible');

    return (
        <>
            <div style={{ padding: '0 var(--space-lg)', marginBottom: 'var(--space-md)' }}>
                <Link href="/world/" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', textDecoration: 'none' }}>
                    ← チャプター別で読む
                </Link>
            </div>
            <MdRenderer
                content={content}
                pageTitle="世界観バイブル（全文）"
                pageBadge="WORLD BIBLE — FULL TEXT"
                pageSubtitle="電脳怪異譚　KAI-I//KILL — 討伐者ハンドブック"
                showToc={true}
            />
        </>
    );
}
