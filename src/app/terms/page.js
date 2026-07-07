// 利用規約 — docs/legal/terms.md を表示（紐付けは src/lib/siteDocs.js）
import MdRenderer from '@/components/MarkdownRenderer';
import { readSiteDoc } from '@/lib/siteDocs';

export const metadata = {
    title: '利用規約 — 電脳怪異譚 KAI-I//KILL',
    description: 'KAI-I//KILL の利用規約。アカウント、投稿、禁止事項等についての規定。',
};

export default function TermsPage() {
    const content = readSiteDoc('terms');

    return (
        <div className="container">
            <div className="page-header">
                <div className="page-header__badge">TERMS OF USE</div>
                <h1 className="page-header__title">利用規約</h1>
                <div className="page-header__subtitle">電脳怪異譚 KAI-I//KILL</div>
            </div>

            <MdRenderer content={content} bare={true} />
        </div>
    );
}
