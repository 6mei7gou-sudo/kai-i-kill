// 特設：異世界エレベーター — docs/player/special/elevator.md を表示（紐付けは src/lib/siteDocs.js）
import Link from 'next/link';
import MdRenderer from '@/components/MarkdownRenderer';
import { readSiteDoc } from '@/lib/siteDocs';

export const metadata = {
    title: '異世界エレベーター — 世界を知る — KAI-I//KILL',
    description: '電脳怪異譚 KAI-I//KILL の特設ページ。異世界エレベーターに関する記録。',
};

export default function ElevatorPage() {
    const content = readSiteDoc('special-elevator');

    return (
        <div className="container">
            {/* パンくず */}
            <div style={{ marginBottom: 'var(--space-md)' }}>
                <Link href="/world/" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', textDecoration: 'none' }}>
                    ← 世界観バイブル
                </Link>
            </div>

            <div className="page-header">
                <div className="page-header__badge">SPECIAL — ELEVATOR</div>
                <h1 className="page-header__title">異世界エレベーター</h1>
                <div className="page-header__subtitle">特設記録 — 電脳怪異譚 KAI-I//KILL</div>
            </div>

            <MdRenderer content={content} bare={true} />
        </div>
    );
}
