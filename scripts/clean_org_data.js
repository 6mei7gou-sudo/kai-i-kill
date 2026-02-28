// 組織JSONデータのクリーニング第2弾
// 残り問題: 「拠点：\n\n 値」のように最後のラベル:値が結合されていない

const fs = require('fs');
const path = require('path');

const ORG_DIR = path.join(__dirname, '..', 'data', 'organizations');

function cleanText(text) {
    let cleaned = text;

    // 「ラベル：\n\n 値」パターンをすべて結合（改行のあとにスペース付きの値）
    cleaned = cleaned.replace(/([^。\n]{1,20}[：:])\n\n\s+(.{1,100}?)(?=\n\n|$)/g, '$1 $2');

    // 空段落の残骸
    cleaned = cleaned.replace(/\n\n\s+\n\n/g, '\n\n');
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // 製品名の後の半角スペースだけの段落を除去
    // パターン: 「シリーズ名\n\n \n\n説明」
    cleaned = cleaned.replace(/\n\n\s+(?=\n\n)/g, '');

    return cleaned.trim();
}

const files = fs.readdirSync(ORG_DIR).filter(f => f.endsWith('.json'));

for (const file of files) {
    const filePath = path.join(ORG_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    console.log(`\n=== ${file} ===`);

    data.sections = data.sections.map((section, i) => {
        const cleaned = cleanText(section);
        if (cleaned !== section) {
            console.log(`  [${i}] ${section.length} → ${cleaned.length} bytes (${section.length - cleaned.length} removed)`);
        }
        return cleaned;
    });

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`  ✓ ${file} 保存完了`);
}

console.log('\nクリーニング第2弾完了');
