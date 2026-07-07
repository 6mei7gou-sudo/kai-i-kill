// 二次創作・イベント参加ガイドライン — docs/legal/guidelines.md を表示（紐付けは src/lib/siteDocs.js）
import MdRenderer from '@/components/MarkdownRenderer';
import { readSiteDoc } from '@/lib/siteDocs';

export const metadata = {
    title: '二次創作・イベント参加ガイドライン — 電脳怪異譚 KAI-I//KILL',
    description: 'KAI-I//KILL の二次創作およびイベント参加に関するガイドライン。',
};

export default function GuidelinesPage() {
    const content = readSiteDoc('guidelines');

    return (
        <div className="container">
            <div className="page-header">
                <div className="page-header__badge">GUIDELINES</div>
                <h1 className="page-header__title">二次創作・イベント参加ガイドライン</h1>
                <div className="page-header__subtitle">電脳怪異譚 KAI-I//KILL</div>
            </div>

            <MdRenderer content={content} bare={true} />
        </div>
    );
}
