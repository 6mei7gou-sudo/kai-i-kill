// 用語集MDファイルをglossary.jsonに変換するスクリプト
const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, '..', 'docs', 'raw', 'glossary', 'player_glossary_v1.0.md');
const outPath = path.join(__dirname, '..', 'data', 'glossary.json');

const content = fs.readFileSync(mdPath, 'utf-8');

// エントリを抽出（**【...】** パターン）
const entries = [];
const blocks = content.split(/^---$/m).map(b => b.trim()).filter(b => b);

for (const block of blocks) {
    // 用語名の検出
    const nameMatch = block.match(/^\*\*【(.+?)】(★|？)?\*\*$/m);
    if (!nameMatch) continue;

    const name = nameMatch[1];
    const importance = nameMatch[2] || ''; // ★ or ？ or ''

    // 分類
    const catMatch = block.match(/^分類：(.+)$/m);
    const category = catMatch ? catMatch[1].trim() : '';

    // 関連（「関連：」行。記録事件にはない場合がある）
    const relMatch = block.match(/^関連：(.+)$/m);
    const related = relMatch
        ? relMatch[1].split(/[、,]/).map(s => s.trim()).filter(Boolean)
        : [];

    // 発生時期（記録事件用）
    const dateMatch = block.match(/^発生時期：(.+)$/m);
    const date = dateMatch ? dateMatch[1].trim() : null;

    // 解説
    const descMatch = block.match(/^解説：\n?([\s\S]+)$/m);
    let description = descMatch ? descMatch[1].trim() : '';

    // 末尾の空行を除去
    description = description.replace(/\n+$/, '');

    const entry = { name, category, importance, related, description };
    if (date) entry.date = date;

    entries.push(entry);
}

fs.writeFileSync(outPath, JSON.stringify(entries, null, 2), 'utf-8');
console.log(`変換完了: ${entries.length}件の用語を ${outPath} に出力`);

// カテゴリ別の件数を表示
const cats = {};
entries.forEach(e => { cats[e.category] = (cats[e.category] || 0) + 1; });
console.log('カテゴリ別:', cats);
