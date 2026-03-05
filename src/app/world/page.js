// 世界観ページ — World Bible（プレイヤー版）をMDから直接レンダリング
import fs from 'fs';
import path from 'path';
import MdRenderer from '@/components/MarkdownRenderer';

function loadWorldBible() {
    const filePath = path.join(process.cwd(), 'docs', 'public', 'player_bible_v1.0.md');
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8');
    }
    return '';
}

export const metadata = {
    title: '世界観 — 電脳怪異譚 KAI-I//KILL',
    description: '近未来の架空日本、怪異の定義、魔法と異能の体系、装備分類、討伐プロセスなど世界観バイブルの全文を公開。',
};

export default function WorldPage() {
    const content = loadWorldBible();

    return (
        <MdRenderer
            content={content}
            pageTitle="世界観バイブル"
            pageBadge="WORLD BIBLE — PLAYER HANDBOOK"
            pageSubtitle="電脳怪異譚　KAI-I//KILL — 討伐者ハンドブック"
            showToc={true}
        />
    );
}
