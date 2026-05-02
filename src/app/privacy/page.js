// プライバシーポリシー — docs/legal/privacy.md を表示
import fs from 'fs';
import path from 'path';
import MdRenderer from '@/components/MarkdownRenderer';

export const metadata = {
    title: 'プライバシーポリシー — 電脳怪異譚 KAI-I//KILL',
    description: 'KAI-I//KILL のプライバシーポリシー。収集する情報、利用目的、第三者提供等についての方針。',
};

export default function PrivacyPage() {
    const filePath = path.join(process.cwd(), 'docs', 'legal', 'privacy.md');
    const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';

    return (
        <div className="container">
            <div className="page-header">
                <div className="page-header__badge">PRIVACY POLICY</div>
                <h1 className="page-header__title">プライバシーポリシー</h1>
                <div className="page-header__subtitle">電脳怪異譚 KAI-I//KILL</div>
            </div>

            <MdRenderer content={content} bare={true} />
        </div>
    );
}
