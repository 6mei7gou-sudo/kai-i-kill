// 用語集ページ — サーバーコンポーネント（データ読み込み）
import fs from 'fs';
import path from 'path';
import GlossaryClient from './GlossaryClient';

function loadGlossary() {
    const filePath = path.join(process.cwd(), 'data', 'glossary.json');
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return [];
}

export const metadata = {
    title: '用語集 — 電脳怪異譚 KAI-I//KILL',
    description: 'この世界の主要な用語を分類別に検索・閲覧できるデータベース。怪異・能力・装備・組織の全てを網羅。',
};

export default function GlossaryPage() {
    const glossaryData = loadGlossary();
    return <GlossaryClient data={glossaryData} />;
}
