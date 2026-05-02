// 二次創作・イベント参加ガイドライン — docs/legal/guidelines.md を表示
import fs from 'fs';
import path from 'path';
import MdRenderer from '@/components/MarkdownRenderer';

export const metadata = {
    title: '二次創作・イベント参加ガイドライン — 電脳怪異譚 KAI-I//KILL',
    description: 'KAI-I//KILL の二次創作およびイベント参加に関するガイドライン。',
};

export default function GuidelinesPage() {
    const filePath = path.join(process.cwd(), 'docs', 'legal', 'guidelines.md');
    const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';

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
