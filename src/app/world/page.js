// 世界観ページ — World Bible（プレイヤー版）をセクション別に表示
import fs from 'fs';
import path from 'path';
import Link from 'next/link';

function loadWorldBible() {
    const filePath = path.join(process.cwd(), 'data', 'world_bible.json');
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return [];
}

export const metadata = {
    title: '世界観 — 電脳怪異譚 KAI-I//KILL',
    description: '近未来の架空日本、怪異の定義、魔法と異能の体系、装備分類、討伐プロセスなど世界観バイブルの全文を公開。',
};

// テキストから**太字**を処理してReactノードに変換
function formatText(text) {
    if (!text.includes('**')) return text;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} style={{ color: 'var(--text-heading)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
}

// 段落リストから構造化ブロックを生成
function parseBody(body) {
    // === フェーズ1: テーブルをbodyから直接抽出 ===
    // テーブル定義：[開始キーワード, ヘッダー配列, 行数]
    const tableDefs = [
        { start: '等級\n\n基準\n\n特級', headers: ['等級', '基準'], rows: 6 },
        { start: '種別\n\n基準\n\n甲種', headers: ['種別', '基準'], rows: 4 },
        { start: '項目\n\n魔法\n\n異能\n\n原理', headers: ['項目', '魔法', '異能'], rows: 5 },
        { start: '言語名\n\n属性\n\nアプローチの質感\n\nP', headers: ['言語名', '属性', 'アプローチの質感'], rows: 8 },
        { start: '分類\n\n主な用途\n\n怪異発生リスク\n\n扱いやすさ\n\n武装型', headers: ['分類', '主な用途', '怪異発生リスク', '扱いやすさ'], rows: 6 },
        { start: '極\n\n構成\n\n行動原理\n\n第一極', headers: ['極', '構成', '行動原理'], rows: 3 },
        { start: 'パターン\n\n概要\n\n先天覚醒型', headers: ['パターン', '概要'], rows: 4 },
    ];

    // テーブルを抽出してプレースホルダーに置換
    const tables = [];
    let processedBody = body;

    for (const def of tableDefs) {
        const startIdx = processedBody.indexOf(def.start);
        if (startIdx < 0) continue;

        // ヘッダー部分を特定
        const headerStr = def.headers.join('\n\n');
        const headerStart = processedBody.indexOf(headerStr, startIdx);
        if (headerStart < 0) continue;

        // ヘッダー後のデータを col * rows 個のセル分読み取り
        const afterHeader = headerStart + headerStr.length;
        const remainingText = processedBody.slice(afterHeader);
        const cells = remainingText.split('\n\n');

        const colCount = def.headers.length;
        const totalCells = colCount * def.rows;
        const dataTokens = [];
        let tokenIdx = 0;

        for (let ci = 0; ci < cells.length && dataTokens.length < totalCells; ci++) {
            const cell = cells[ci].trim();
            if (cell && cell !== '•') {
                dataTokens.push(cell);
            }
            tokenIdx = ci + 1;
        }

        // テーブル行を組み立て
        const tableRows = [];
        for (let r = 0; r < def.rows && r * colCount < dataTokens.length; r++) {
            const row = dataTokens.slice(r * colCount, (r + 1) * colCount);
            if (row.length === colCount) tableRows.push(row);
        }

        if (tableRows.length > 0) {
            // 消費した文字数を計算
            const consumed = cells.slice(0, tokenIdx).join('\n\n');
            const endIdx = afterHeader + consumed.length;
            const placeholder = `__TABLE_${tables.length}__`;
            tables.push({ headers: def.headers, rows: tableRows });

            processedBody = processedBody.slice(0, headerStart) + placeholder + processedBody.slice(endIdx);
        }
    }

    // === フェーズ2: テーブル除去後の段落を解析 ===
    const paragraphs = processedBody.split('\n\n');
    const blocks = [];

    // サブ見出しキーワード
    const subHeadingKeywords = [
        '定義', '発生原理', '一般人との関係',
        '強さによる分類', '古い怪異', '新しい怪異',
        '一時型', '循環型', '定着型',
        '存在強度等級', '脅威度種別',
        '基本原則', 'ボスレベル', '無力化の方法',
        '魔法：チートコード', '異能：アプリケーション', '魔法と異能の対比',
        '公的機関（祓部）', '傭兵集団', '無所属',
        '魔導省と祓部', '蒼鉄機工', '雷禽重工', '権力の三極構造', '情報統制',
        '第一段階：調査プロセス', '第二段階：解明プロセス', '第三段階：討伐プロセス',
    ];

    // テーブルデータに含まれる可能性のあるキーワードは除外
    const tableDataWords = ['核', 'ルール', '改造個体', '別個体', '所属', '覚醒パターン',
        '能力スタイル', '装備', '因縁'];

    function isSubHeading(text) {
        const clean = text.replace(/\*\*/g, '').trim();
        if (clean.length > 50 || clean.length <= 1) return false;
        if (clean.endsWith('。')) return false;
        if (clean.startsWith('__TABLE_')) return false;
        // 明示的なキーワード一致
        if (subHeadingKeywords.some(kw => clean.includes(kw))) return true;
        // 短い＋句読点なし＋「：」含みのラベル型テキスト
        if (clean.includes('：') && clean.length <= 30) return true;
        // テーブルデータに含まれるキーワードは除外
        if (tableDataWords.includes(clean)) return false;
        return false;
    }

    let i = 0;
    while (i < paragraphs.length) {
        const p = paragraphs[i].trim();

        // 空段落/箇条書き記号のみ
        if (!p || p === '•' || p === '：') { i++; continue; }

        // テーブルプレースホルダー
        const tableMatch = p.match(/^__TABLE_(\d+)__$/);
        if (tableMatch) {
            blocks.push({ type: 'table', ...tables[parseInt(tableMatch[1])] });
            i++;
            continue;
        }

        // 箇条書き検出：テキスト + 次が「•」
        if (i + 1 < paragraphs.length && paragraphs[i + 1]?.trim() === '•') {
            const items = [p];
            let li = i + 2;
            while (li < paragraphs.length) {
                const lp = paragraphs[li]?.trim();
                if (!lp || lp === '•') { li++; continue; }
                if (li + 1 < paragraphs.length && paragraphs[li + 1]?.trim() === '•') {
                    items.push(lp);
                    li += 2;
                } else break;
            }
            blocks.push({ type: 'list', items });
            i = li;
            continue;
        }

        // サブ見出し
        if (isSubHeading(p)) {
            blocks.push({ type: 'subheading', text: p.replace(/\*\*/g, '') });
            i++;
            continue;
        }

        // 通常段落
        blocks.push({ type: 'paragraph', text: p });
        i++;
    }

    return blocks;
}

// スタイル定数
const S = {
    subheading: {
        fontSize: '1.1rem',
        fontWeight: 700,
        color: 'var(--text-heading)',
        marginTop: '2rem',
        marginBottom: '0.75rem',
        paddingBottom: '0.25rem',
        borderBottom: '1px solid rgba(212,175,55,0.15)',
    },
    paragraph: {
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        lineHeight: 1.9,
        marginBottom: '1rem',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '1.5rem',
        fontSize: '0.85rem',
    },
    th: {
        padding: '0.6rem 0.75rem',
        fontSize: '0.7rem',
        fontFamily: 'var(--font-mono)',
        color: 'var(--accent-gold)',
        letterSpacing: '0.1em',
        textAlign: 'left',
        fontWeight: 400,
        borderBottom: '1px solid rgba(212,175,55,0.2)',
    },
    td: {
        padding: '0.6rem 0.75rem',
        fontSize: '0.82rem',
        color: 'var(--text-secondary)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        verticalAlign: 'top',
    },
    tdFirst: {
        padding: '0.6rem 0.75rem',
        fontSize: '0.82rem',
        color: 'var(--text-heading)',
        fontWeight: 700,
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        verticalAlign: 'top',
        whiteSpace: 'nowrap',
    },
    listItem: {
        color: 'var(--text-secondary)',
        fontSize: '0.88rem',
        lineHeight: 1.8,
        paddingLeft: '1rem',
        position: 'relative',
        marginBottom: '0.5rem',
    },
    listDash: {
        position: 'absolute',
        left: 0,
        color: 'var(--accent-gold)',
        opacity: 0.6,
    },
};

export default function WorldPage() {
    const sections = loadWorldBible();

    return (
        <div className="container">
            <section className="section">
                <span className="section__title">// World Bible</span>
                <h1 className="section__heading">世界観バイブル</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)', maxWidth: '800px' }}>
                    討伐者が知るべき世界の基本情報をまとめた資料です。秘匿レベルの情報は含まれません。
                </p>
            </section>

            <div className="world-layout">
                {/* サイドナビゲーション */}
                <nav className="world-sidebar">
                    {sections.map((section, i) => (
                        <a
                            key={i}
                            href={`#section-${i}`}
                            className="world-sidebar__link"
                        >
                            {section.title}
                        </a>
                    ))}
                </nav>

                {/* コンテンツ本文 */}
                <div className="content-body" style={{ flex: 1 }}>
                    {sections.map((section, si) => {
                        const blocks = parseBody(section.body);

                        return (
                            <article key={si} id={`section-${si}`} style={{ marginBottom: 'var(--space-3xl)' }}>
                                <h2>{section.title}</h2>

                                {blocks.map((block, bi) => {
                                    // サブ見出し
                                    if (block.type === 'subheading') {
                                        return <h3 key={bi} style={S.subheading}>{block.text}</h3>;
                                    }

                                    // テーブル
                                    if (block.type === 'table') {
                                        return (
                                            <div key={bi} style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                                                <table style={S.table}>
                                                    <thead>
                                                        <tr>
                                                            {block.headers.map((h, hi) => (
                                                                <th key={hi} style={S.th}>{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {block.rows.map((row, ri) => (
                                                            <tr key={ri}>
                                                                {row.map((cell, ci) => (
                                                                    <td key={ci} style={ci === 0 ? S.tdFirst : S.td}>
                                                                        {formatText(cell)}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        );
                                    }

                                    // 箇条書き
                                    if (block.type === 'list') {
                                        return (
                                            <div key={bi} style={{ marginBottom: '1.25rem' }}>
                                                {block.items.map((item, ii) => (
                                                    <div key={ii} style={S.listItem}>
                                                        <span style={S.listDash}>—</span>
                                                        {formatText(item)}
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    }

                                    // 通常段落
                                    return (
                                        <p key={bi} style={S.paragraph}>
                                            {formatText(block.text)}
                                        </p>
                                    );
                                })}
                            </article>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
