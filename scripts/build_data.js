// 設定資料のMarkdownファイルを読み込んでセクション単位に構造化するユーティリティ
const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(process.cwd(), 'docs', 'public');
const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Markdownファイルをセクション区切りでパースする
 * "---" で区切られた各ブロックをセクションとして抽出
 */
function parseMarkdownSections(content) {
    // 先頭のタイトル行を取得
    const lines = content.split('\n');
    const title = lines[0].trim();

    // "---" で分割してセクション化
    const sections = content
        .split(/\n---\n/)
        .map(section => section.trim())
        .filter(section => section.length > 0);

    return { title, sections };
}

/**
 * 用語集をパースして構造化JSONに変換
 */
function parseGlossary(content) {
    const entries = [];
    // 【用語名】のパターンで分割
    const termBlocks = content.split(/(?=【)/);

    for (const block of termBlocks) {
        const nameMatch = block.match(/【(.+?)】/);
        if (!nameMatch) continue;

        const name = nameMatch[1];
        const categoryMatch = block.match(/分類：(.+?)(?:\n|$)/);
        const relatedMatch = block.match(/関連：(.+?)(?:\n|$)/);
        const descMatch = block.match(/解説：\s*\n?\s*([\s\S]*?)(?=(?:【|$))/);

        entries.push({
            name,
            category: categoryMatch ? categoryMatch[1].trim() : '',
            related: relatedMatch ? relatedMatch[1].split('、').map(s => s.trim()) : [],
            description: descMatch ? descMatch[1].trim() : '',
        });
    }

    return entries;
}

/**
 * タイムラインをパースして構造化JSONに変換
 */
function parseTimeline(content) {
    const entries = [];
    const sections = content.split(/\n---\n/);

    for (const section of sections) {
        const yearMatch = section.match(/(\d{4}年|現在から\d+年前)/);
        const titleMatch = section.match(/【(.+?)】/);

        if (yearMatch || titleMatch) {
            // ★は常識レベル、？は真偽不明
            const isCommonKnowledge = section.includes('★');
            const isUncertain = section.includes('？');

            entries.push({
                year: yearMatch ? yearMatch[1] : '',
                title: titleMatch ? titleMatch[1] : '',
                description: section
                    .replace(/【.+?】/, '')
                    .replace(/★|？/g, '')
                    .trim(),
                isCommonKnowledge,
                isUncertain,
            });
        }
    }

    return entries;
}

/**
 * World Bibleのセクションを構造化
 */
function parseWorldBible(content) {
    const sections = [];
    // 大見出しで区切る（ "1. " や "## " で始まる行）
    const parts = content.split(/\n---\n/);

    for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;

        // 最初の行をタイトルとして取得
        const lines = trimmed.split('\n');
        const title = lines[0].replace(/^\d+\.\s*/, '').replace(/^#+\s*/, '').trim();
        const body = lines.slice(1).join('\n').trim();

        if (title && body) {
            sections.push({ title, body });
        }
    }

    return sections;
}

// メイン処理
function main() {
    // 出力先ディレクトリの確保
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // 用語集のパースと出力
    const glossaryPath = path.join(DOCS_DIR, 'player_glossary_v1.0.md');
    if (fs.existsSync(glossaryPath)) {
        const glossary = parseGlossary(fs.readFileSync(glossaryPath, 'utf-8'));
        fs.writeFileSync(
            path.join(DATA_DIR, 'glossary.json'),
            JSON.stringify(glossary, null, 2),
            'utf-8'
        );
        console.log(`[OK] 用語集: ${glossary.length}件`);
    }

    // タイムラインのパースと出力
    const timelinePath = path.join(DOCS_DIR, 'player_timeline_v1.0.md');
    if (fs.existsSync(timelinePath)) {
        const timeline = parseTimeline(fs.readFileSync(timelinePath, 'utf-8'));
        fs.writeFileSync(
            path.join(DATA_DIR, 'timeline.json'),
            JSON.stringify(timeline, null, 2),
            'utf-8'
        );
        console.log(`[OK] タイムライン: ${timeline.length}件`);
    }

    // World Bibleのパースと出力
    const biblePath = path.join(DOCS_DIR, 'player_bible_v1.0.md');
    if (fs.existsSync(biblePath)) {
        const sections = parseWorldBible(fs.readFileSync(biblePath, 'utf-8'));
        fs.writeFileSync(
            path.join(DATA_DIR, 'world_bible.json'),
            JSON.stringify(sections, null, 2),
            'utf-8'
        );
        console.log(`[OK] World Bible: ${sections.length}セクション`);
    }

    // 組織詳細のパースと出力
    const orgFiles = [
        { file: 'player_detail_haraebe.md', key: 'haraebe' },
        { file: 'player_detail_companies.md', key: 'companies' },
        { file: 'player_detail_mercenaries.md', key: 'mercenaries' },
        { file: 'player_detail_unaffiliated.md', key: 'unaffiliated' },
    ];

    const orgDir = path.join(DATA_DIR, 'organizations');
    if (!fs.existsSync(orgDir)) fs.mkdirSync(orgDir, { recursive: true });

    for (const org of orgFiles) {
        const orgPath = path.join(DOCS_DIR, org.file);
        if (fs.existsSync(orgPath)) {
            const content = fs.readFileSync(orgPath, 'utf-8');
            const parsed = parseMarkdownSections(content);
            fs.writeFileSync(
                path.join(orgDir, `${org.key}.json`),
                JSON.stringify(parsed, null, 2),
                'utf-8'
            );
            console.log(`[OK] 組織: ${org.key} (${parsed.sections.length}セクション)`);
        }
    }

    console.log('\nデータ変換完了');
}

main();
