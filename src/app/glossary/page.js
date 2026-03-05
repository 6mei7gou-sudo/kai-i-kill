// 用語集ページ — MDファイルからパースしてGlossaryClientに渡す
import fs from 'fs';
import path from 'path';
import GlossaryClient from './GlossaryClient';

/**
 * MDファイルから用語エントリを抽出する
 * フォーマット:
 *   ### 【用語名】★       ← 名前＋重要度
 *   - **分類**：XXX       ← カテゴリ
 *   - **関連**：AAA、BBB  ← 関連語
 *   説明テキスト...        ← 本文
 */
function parseGlossaryMd(content) {
    const entries = [];
    const lines = content.split('\n');
    let currentEntry = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // ### 【用語名】★ or ### 【用語名】？ or ### 【用語名】
        const entryMatch = line.match(/^###\s+【(.+?)】\s*(★|？)?$/);
        if (entryMatch) {
            // 前のエントリを保存
            if (currentEntry) entries.push(currentEntry);
            currentEntry = {
                name: entryMatch[1],
                importance: entryMatch[2] || '',
                category: '',
                related: [],
                description: '',
            };
            continue;
        }

        if (!currentEntry) continue;

        // - **分類**：XXX
        const catMatch = line.match(/^-\s+\*\*分類\*\*[：:]\s*(.+)$/);
        if (catMatch) {
            currentEntry.category = catMatch[1].trim();
            continue;
        }

        // - **関連**：XXX、YYY
        const relMatch = line.match(/^-\s+\*\*関連\*\*[：:]\s*(.+)$/);
        if (relMatch) {
            currentEntry.related = relMatch[1].split(/[、,]/).map(r => r.trim()).filter(Boolean);
            continue;
        }

        // 区切り線・空行・章見出しはスキップ
        if (line === '' || /^---/.test(line) || /^##\s+/.test(line)) continue;

        // リストアイテム以外の通常テキスト → 説明文
        if (!line.startsWith('- **')) {
            if (currentEntry.description) {
                currentEntry.description += ' ' + line;
            } else {
                currentEntry.description = line;
            }
        }
    }

    // 最後のエントリを保存
    if (currentEntry) entries.push(currentEntry);

    return entries;
}

function loadGlossary() {
    const filePath = path.join(process.cwd(), 'docs', 'public', 'player_glossary_v1.0.md');
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        return parseGlossaryMd(content);
    }
    return [];
}

export const metadata = {
    title: '用語集 — 電脳怪異譚 KAI-I//KILL',
    description: '怪異・魔法・組織・装備に関する討伐者向け用語データベース。カテゴリ検索・キーワード検索対応。',
};

export default function GlossaryPage() {
    const data = loadGlossary();
    return <GlossaryClient data={data} />;
}
