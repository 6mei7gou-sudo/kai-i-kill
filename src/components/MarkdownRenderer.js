// 共通Markdownレンダラー — 整形済みMDファイルをデザインシステム準拠でレンダリング
// サーバーコンポーネント専用（React Server Components）

/**
 * Markdownテキストを構造化ブロックにパースする
 * 対応記法：##/###/#### 見出し、表（|区切り）、太字（**）、リスト（- / 1.）、区切り線（---）
 */
function parseMd(content) {
    const lines = content.split('\n');
    const blocks = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // 空行をスキップ
        if (line.trim() === '') { i++; continue; }

        // 区切り線（---）
        if (/^---+$/.test(line.trim())) {
            blocks.push({ type: 'hr' });
            i++;
            continue;
        }

        // 見出し（## / ### / ####）
        const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
        if (headingMatch) {
            blocks.push({
                type: 'heading',
                level: headingMatch[1].length,
                text: headingMatch[2].trim(),
            });
            i++;
            continue;
        }

        // テーブル（| col1 | col2 | 形式）
        if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
            const tableLines = [];
            while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
                tableLines.push(lines[i]);
                i++;
            }
            // ヘッダー行 / 区切り行（|---|---| 形式）/ データ行を分離
            if (tableLines.length >= 2) {
                const parseRow = (row) => row.split('|').slice(1, -1).map(c => c.trim());
                const headers = parseRow(tableLines[0]);
                // 区切り行（---）をスキップ
                const dataStart = tableLines[1].includes('---') ? 2 : 1;
                const rows = tableLines.slice(dataStart).map(parseRow);
                blocks.push({ type: 'table', headers, rows });
            }
            continue;
        }

        // リスト（- で始まる行をグルーピング）
        if (/^\s*-\s+/.test(line)) {
            const items = [];
            while (i < lines.length && /^\s*-\s+/.test(lines[i])) {
                items.push(lines[i].replace(/^\s*-\s+/, '').trim());
                i++;
            }
            blocks.push({ type: 'list', ordered: false, items });
            continue;
        }

        // 番号付きリスト（1. 2. で始まる行）
        if (/^\s*\d+\.\s+/.test(line)) {
            const items = [];
            while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
                items.push(lines[i].replace(/^\s*\d+\.\s+/, '').trim());
                i++;
            }
            blocks.push({ type: 'list', ordered: true, items });
            continue;
        }

        // 段落（連続する通常行をまとめる）
        let para = '';
        while (i < lines.length && lines[i].trim() !== '' && !lines[i].match(/^#{1,4}\s/) && !lines[i].trim().startsWith('|') && !/^---+$/.test(lines[i].trim()) && !/^\s*-\s+/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i])) {
            para += (para ? ' ' : '') + lines[i].trim();
            i++;
        }
        if (para) {
            blocks.push({ type: 'paragraph', text: para });
        }
    }

    return blocks;
}

/**
 * インラインMarkdown記法をReactノードに変換
 * 対応：**太字**
 */
function renderInline(text) {
    if (!text || !text.includes('**')) return text;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} style={{ color: 'var(--text-heading)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
}

/**
 * セクション番号を自動生成（## 見出しに対して連番を付与）
 */
function getSectionNumber(index) {
    return String(index + 1).padStart(2, '0');
}

/**
 * 見出しからIDを生成（サイドバー目次のアンカー用）
 */
function headingToId(text) {
    return text.replace(/\s+/g, '-').replace(/[^\u3000-\u9FFF\u4E00-\u9FFF\uF900-\uFAFFa-zA-Z0-9-]/g, '').toLowerCase();
}

/**
 * MdRendererコンポーネント
 * @param {string} content - Markdownテキスト
 * @param {boolean} showToc - 目次表示（デフォルト: false）
 * @param {string} pageTitle - ページタイトル（H1見出しを上書き）
 * @param {string} pageBadge - ページバッジテキスト
 * @param {string} pageSubtitle - サブタイトル
 */
export default function MdRenderer({ content, showToc = false, pageTitle, pageBadge, pageSubtitle }) {
    const blocks = parseMd(content);

    // ## レベルの見出しを抽出（目次用＋セクション番号用）
    const h2Headings = blocks.filter(b => b.type === 'heading' && b.level === 2);

    // セクション番号マップ（h2テキスト → 番号）
    const sectionMap = {};
    h2Headings.forEach((h, i) => { sectionMap[h.text] = getSectionNumber(i); });

    return (
        <div className="container">
            {/* ページヘッダー */}
            {pageTitle && (
                <div className="page-header">
                    {pageBadge && <div className="page-header__badge">{pageBadge}</div>}
                    <h1 className="page-header__title">{pageTitle}</h1>
                    {pageSubtitle && <div className="page-header__subtitle">{pageSubtitle}</div>}
                </div>
            )}

            {/* 目次＋本文レイアウト */}
            <div className={showToc ? 'world-layout' : ''}>
                {/* 本文 */}
                <div className="content-body" style={{ flex: 1 }}>
                    {blocks.map((block, idx) => renderBlock(block, idx, sectionMap))}
                </div>

                {/* 目次サイドバー（showToc=true時のみ） */}
                {showToc && (
                    <nav className="world-sidebar">
                        {h2Headings.map((h, i) => (
                            <a key={i} className="world-sidebar__link" href={`#${headingToId(h.text)}`}>
                                {h.text}
                            </a>
                        ))}
                    </nav>
                )}
            </div>
        </div>
    );
}

/**
 * 個別ブロックのレンダリング
 */
function renderBlock(block, idx, sectionMap) {
    switch (block.type) {
        case 'hr':
            return null; // MDの区切り線はセクション間のスペーシングで代替

        case 'heading': {
            const id = headingToId(block.text);

            if (block.level === 1) {
                return null; // H1はページヘッダーで処理済み
            }

            if (block.level === 2) {
                const num = sectionMap[block.text] || '00';
                // 「1. 世界概要」→ 番号を分離して英語ラベルを生成
                const cleanText = block.text.replace(/^\d+\.\s*/, '');
                return (
                    <section key={idx} className="section" id={id} style={{ scrollMarginTop: 'var(--space-2xl)' }}>
                        <div className="section__number">{num} — SECTION</div>
                        <h2 className="section__heading">{cleanText}</h2>
                    </section>
                );
            }

            if (block.level === 3) {
                return <h3 key={idx} id={id} style={{
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: 700,
                    color: 'var(--text-heading)',
                    marginTop: 'var(--space-xl)',
                    marginBottom: 'var(--space-sm)',
                    paddingBottom: 'var(--space-xs)',
                    borderBottom: 'var(--border-section)',
                }}>{renderInline(block.text)}</h3>;
            }

            if (block.level === 4) {
                return <h4 key={idx} id={id} style={{
                    fontSize: 'var(--font-size-md)',
                    fontWeight: 700,
                    color: 'var(--text-heading)',
                    marginTop: 'var(--space-lg)',
                    marginBottom: 'var(--space-xs)',
                }}>{renderInline(block.text)}</h4>;
            }

            return null;
        }

        case 'paragraph':
            // 引用風テキスト（「」で始まる短文）
            if (block.text.startsWith('「') && block.text.length < 100) {
                return (
                    <div key={idx} className="callout" style={{ fontStyle: 'italic' }}>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9 }}>{renderInline(block.text)}</p>
                    </div>
                );
            }
            return <p key={idx} style={{
                color: 'var(--text-secondary)',
                lineHeight: 1.9,
                marginBottom: 'var(--space-md)',
            }}>{renderInline(block.text)}</p>;

        case 'table':
            return (
                <div key={idx} style={{ overflowX: 'auto', marginBottom: 'var(--space-xl)' }}>
                    <table>
                        <thead>
                            <tr>
                                {block.headers.map((h, i) => <th key={i}>{renderInline(h)}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {block.rows.map((row, ri) => (
                                <tr key={ri}>
                                    {row.map((cell, ci) => (
                                        <td key={ci} style={ci === 0 ? { fontWeight: 700, color: 'var(--text-heading)' } : {}}>
                                            {renderInline(cell)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );

        case 'list':
            if (block.ordered) {
                return (
                    <ol key={idx} style={{
                        paddingLeft: 'var(--space-xl)',
                        marginBottom: 'var(--space-md)',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.9,
                    }}>
                        {block.items.map((item, i) => (
                            <li key={i} style={{ marginBottom: 'var(--space-xs)' }}>{renderInline(item)}</li>
                        ))}
                    </ol>
                );
            }
            return (
                <ul key={idx} style={{
                    listStyle: 'none',
                    paddingLeft: 0,
                    marginBottom: 'var(--space-md)',
                }}>
                    {block.items.map((item, i) => (
                        <li key={i} style={{
                            color: 'var(--text-secondary)',
                            lineHeight: 1.9,
                            marginBottom: 'var(--space-xs)',
                            paddingLeft: 'var(--space-lg)',
                            position: 'relative',
                        }}>
                            <span style={{
                                position: 'absolute',
                                left: 0,
                                color: 'var(--accent-gold)',
                                opacity: 0.6,
                            }}>—</span>
                            {renderInline(item)}
                        </li>
                    ))}
                </ul>
            );

        default:
            return null;
    }
}

/**
 * MDファイルから目次用の見出しリストだけを抽出するユーティリティ
 */
export function extractHeadings(content) {
    return content.split('\n')
        .filter(line => /^##\s+/.test(line))
        .map(line => ({
            text: line.replace(/^##\s+/, '').replace(/^\d+\.\s*/, '').trim(),
            id: headingToId(line.replace(/^##\s+/, '')),
        }));
}
