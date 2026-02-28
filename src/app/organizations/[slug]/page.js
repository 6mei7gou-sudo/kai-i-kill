// 組織詳細ページ — 参照サイト準拠デザイン v5
import fs from 'fs';
import path from 'path';
import Link from 'next/link';

const ORG_META = {
    haraebe: {
        name: '祓部（はらえべ）詳細',
        en: 'PUBLIC AGENCY',
        sectionNum: '09',
        sectionLabel: 'HARAEBE DETAILS',
        pageNum: '3-1',
    },
    companies: {
        name: '企業詳細',
        en: 'COMPANIES',
        sectionNum: '12',
        sectionLabel: 'COMPANY DETAILS',
        pageNum: '3-2',
    },
    mercenaries: {
        name: '傭兵詳細',
        en: 'MERCENARIES',
        sectionNum: '10',
        sectionLabel: 'MERCENARY DETAILS',
        pageNum: '3-3',
    },
    unaffiliated: {
        name: '無所属詳細',
        en: 'UNAFFILIATED',
        sectionNum: '11',
        sectionLabel: 'UNAFFILIATED DETAILS',
        pageNum: '3-4',
    },
};

export function generateStaticParams() {
    return Object.keys(ORG_META).map(slug => ({ slug }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const meta = ORG_META[slug];
    return {
        title: `${meta?.name || '組織'} — 電脳怪異譚 KAI-I//KILL`,
        description: `${meta?.name}の詳細設定資料。`,
    };
}

function loadOrgContent(slug) {
    const filePath = path.join(process.cwd(), 'data', 'organizations', `${slug}.json`);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return null;
}

// ========== テキストパーサー ==========

// ラベル:値のデータ行を検出
function parseDataLine(text) {
    const m = text.match(/^(.{1,20})[：:]\s*(.+)$/);
    if (m && !m[2].includes('。') && m[2].length < 100) {
        return { label: m[1], value: m[2] };
    }
    return null;
}

// テーブル形式の検出（項目/内容/キー/値...）
function parseTableData(paragraphs) {
    if (paragraphs.length >= 4 && paragraphs[0] === '項目' && paragraphs[1] === '内容') {
        const rows = [];
        for (let i = 2; i < paragraphs.length - 1; i += 2) {
            rows.push({ label: paragraphs[i], value: paragraphs[i + 1] });
        }
        return rows;
    }
    return null;
}

// セクション分割
function parseSection(rawText) {
    const paras = rawText.split('\n\n').filter(l => l.trim());
    if (paras.length === 0) return null;
    let heading = null;
    let paragraphs = paras;
    if (paras[0].length < 60 && !paras[0].includes('。')) {
        heading = paras[0];
        paragraphs = paras.slice(1);
    }
    return { heading, paragraphs };
}

// 段落をブロックに構造化
function buildBlocks(paragraphs) {
    const blocks = [];
    let current = { subheading: null, dataLines: [], bodyLines: [], tableData: null };

    // テーブルデータ検索
    const table = parseTableData(paragraphs);
    if (table) {
        return [{ subheading: null, dataLines: [], bodyLines: [], tableData: table }];
    }

    const subKeywords = [
        '部門', '班', '主要業務', 'シリーズ', '対立', '派', '特別職',
        '内面と動機', '装備と戦闘スタイル', 'ドラマの種', '概要',
        '組織構造', '特徴', '職種', '強み', '制約', 'キャラクター接点',
        '内部構造', '人員構成', 'まとめ', '指針', '不文律',
        '技術部の職種', '情報と信頼', '装備の入手', '法的な立場',
        '背景', '主要製品', '企業の性格'
    ];

    for (let i = 0; i < paragraphs.length; i++) {
        const para = paragraphs[i].trim();
        if (!para) continue;

        const dataLine = parseDataLine(para);
        if (dataLine) {
            current.dataLines.push(dataLine);
            continue;
        }

        const isSub = para.length < 80 && !para.includes('。') &&
            (para.match(/^第[一二三四]/) || para.match(/^最上位/) ||
                subKeywords.some(kw => para.includes(kw)));

        if (isSub && (current.bodyLines.length > 0 || current.dataLines.length > 0)) {
            blocks.push({ ...current });
            current = { subheading: para, dataLines: [], bodyLines: [], tableData: null };
        } else if (isSub) {
            current.subheading = para;
        } else {
            current.bodyLines.push(para);
        }
    }

    if (current.subheading || current.bodyLines.length > 0 || current.dataLines.length > 0) {
        blocks.push(current);
    }

    // 後処理: bodyLines内のテーブルパターン
    for (const block of blocks) {
        if (block.bodyLines.length >= 4) {
            const idx = block.bodyLines.findIndex((l, i) =>
                l === '項目' && i + 1 < block.bodyLines.length && block.bodyLines[i + 1] === '内容');
            if (idx >= 0) {
                const tableLines = block.bodyLines.splice(idx);
                const rows = [];
                for (let i = 2; i < tableLines.length - 1; i += 2) {
                    rows.push({ label: tableLines[i], value: tableLines[i + 1] });
                }
                block.tableData = rows;
            }
        }
    }

    return blocks;
}

// ========== スタイル定数 ==========

const S = {
    // セクションヘッダー（参照サイトの 09 — HARAEBU DETAILS スタイル）
    sectionIndex: {
        fontFamily: 'var(--font-mono)',
        fontSize: '0.7rem',
        color: 'var(--accent-gold)',
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        marginBottom: '0.5rem',
    },
    pageTitle: {
        fontSize: '2rem',
        fontWeight: 700,
        color: 'var(--text-heading)',
        display: 'inline',
        marginRight: '1rem',
    },
    pageBadge: {
        display: 'inline-block',
        fontSize: '0.7rem',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-muted)',
        letterSpacing: '0.15em',
        verticalAlign: 'middle',
    },
    // セクション見出し（細い下線付き）
    sectionHeading: {
        fontSize: '1.3rem',
        fontWeight: 700,
        color: 'var(--text-heading)',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
        marginBottom: '1rem',
        marginTop: '2.5rem',
    },
    // カード（部門や企業ブロック用）
    card: {
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        padding: '1.5rem',
        marginBottom: '1rem',
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '0.75rem',
    },
    cardTitle: {
        fontSize: '1.1rem',
        fontWeight: 700,
        color: 'var(--text-heading)',
    },
    cardBadge: {
        fontSize: '0.6rem',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-muted)',
        letterSpacing: '0.15em',
        padding: '2px 8px',
        border: '1px solid rgba(255,255,255,0.1)',
    },
    // メタデータ行（スラッシュ区切り）
    metaLine: {
        fontSize: '0.75rem',
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-muted)',
        marginBottom: '1rem',
        letterSpacing: '0.03em',
    },
    // 本文
    body: {
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        lineHeight: 1.9,
        marginBottom: '0.75rem',
    },
    // ゴールドのサブラベル
    subLabel: {
        fontSize: '0.75rem',
        fontFamily: 'var(--font-mono)',
        color: 'var(--accent-gold)',
        letterSpacing: '0.1em',
        marginBottom: '0.25rem',
        marginTop: '1.25rem',
    },
    // コールアウト（強み/制約ボックス）
    callout: {
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.06)',
        padding: '1.25rem 1.5rem',
        marginTop: '1.5rem',
        marginBottom: '1rem',
    },
    // 2列グリッド
    twoCol: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
        marginBottom: '1.5rem',
    },
    twoColCell: {
        background: 'rgba(5,7,10,0.9)',
        padding: '1.25rem 1.5rem',
    },
    // テーブル
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '1.5rem',
    },
};

// ========== レンダリング ==========

// メタデータ行（スラッシュ区切り）
function renderMetaLine(dataLines) {
    if (dataLines.length === 0) return null;
    return (
        <div style={S.metaLine}>
            {dataLines.map((d, i) => (
                <span key={i}>
                    {i > 0 && <span style={{ margin: '0 0.5rem', opacity: 0.4 }}>/</span>}
                    <span>{d.label}：{d.value}</span>
                </span>
            ))}
        </div>
    );
}

// テーブル（役職体系やまとめ表）
function renderTable(tableData) {
    if (!tableData || tableData.length === 0) return null;
    return (
        <table style={S.table}>
            <tbody>
                {tableData.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{
                            padding: '0.75rem 1rem',
                            fontWeight: 700,
                            color: 'var(--text-heading)',
                            width: '120px',
                            verticalAlign: 'top',
                            fontSize: '0.85rem',
                        }}>
                            {row.label}
                        </td>
                        <td style={{
                            padding: '0.75rem 1rem',
                            color: 'var(--text-secondary)',
                            fontSize: '0.85rem',
                            lineHeight: 1.7,
                        }}>
                            {row.value}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

// まとめテーブル検出
function isSummaryTable(paragraphs) {
    if (paragraphs.length > 6) {
        const headers = ['名前', '二つ名', '覚醒', '背景', '装備', '侵食',
            '企業', '所属キャラの特徴', '強み', '弱み・制約'];
        const headerMatch = headers.filter(h => paragraphs.some(p => p === h));
        return headerMatch.length >= 3;
    }
    return false;
}

function renderSummaryTable(paragraphs) {
    const headers = [];
    const rows = [];
    let headerDone = false;
    let currentRow = [];

    for (const para of paragraphs) {
        if (!headerDone) {
            if (['名前', '二つ名', '覚醒', '背景', '装備', '侵食',
                '企業', '所属キャラの特徴', '強み', '弱み・制約'].includes(para)) {
                headers.push(para);
            } else {
                headerDone = true;
                currentRow.push(para);
            }
        } else {
            currentRow.push(para);
            if (currentRow.length === headers.length) {
                rows.push([...currentRow]);
                currentRow = [];
            }
        }
    }

    if (headers.length === 0) return null;

    return (
        <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <table style={S.table}>
                <thead>
                    <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                        {headers.map((h, i) => (
                            <th key={i} style={{
                                padding: '0.5rem 0.75rem',
                                fontSize: '0.7rem',
                                fontFamily: 'var(--font-mono)',
                                color: 'var(--accent-gold)',
                                letterSpacing: '0.1em',
                                textAlign: 'left',
                                fontWeight: 400,
                            }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, ri) => (
                        <tr key={ri} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            {row.map((cell, ci) => (
                                <td key={ci} style={{
                                    padding: '0.6rem 0.75rem',
                                    fontSize: '0.8rem',
                                    color: ci === 0 ? 'var(--text-heading)' : 'var(--text-secondary)',
                                    fontWeight: ci === 0 ? 700 : 400,
                                }}>{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ========== メインコンポーネント ==========

export default async function OrgDetailPage({ params }) {
    const { slug } = await params;
    const meta = ORG_META[slug];
    const data = loadOrgContent(slug);

    if (!data || !meta) {
        return <div className="container"><h1>組織データが見つかりません</h1></div>;
    }

    const sections = data.sections
        .slice(1, -1)
        .map(parseSection)
        .filter(Boolean);

    return (
        <div className="container">
            {/* ページヘッダー（参照サイト準拠） */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={S.sectionIndex}>
                    {meta.sectionNum} — {meta.sectionLabel}
                </div>
                <div>
                    <h1 style={S.pageTitle}>{meta.name}</h1>
                    <span style={S.pageBadge}>{meta.en}</span>
                </div>
            </div>

            {/* セクション一覧 */}
            {sections.map((section, si) => {
                // 設計指針判定（先に判定する）
                const isDesignGuide = section.heading && (
                    section.heading.includes('設計指針') || section.heading.includes('まとめ')
                );

                const blocks = buildBlocks(section.paragraphs);
                // 設計指針セクション内のまとめテーブルは無視する
                const isSummary = !isDesignGuide && section.paragraphs && isSummaryTable(section.paragraphs);

                // セクション見出しのスタイルを判断
                const isGroupHeading = section.heading && (
                    section.heading.includes('の例') || section.heading.includes('の生態')
                );

                // キャラクタープロフィール判定
                const isProfile = !isDesignGuide && blocks.length > 0 && blocks[0].dataLines.length >= 2;

                return (
                    <section key={si}>
                        {/* セクション見出し */}
                        {section.heading && !isGroupHeading && !isProfile && (
                            <h2 style={S.sectionHeading}>{section.heading}</h2>
                        )}
                        {section.heading && isGroupHeading && (
                            <h2 style={{
                                ...S.sectionHeading,
                                fontSize: '1.1rem',
                                marginTop: '3rem',
                                color: 'var(--text-heading)',
                            }}>{section.heading}</h2>
                        )}

                        {/* プロフィール型の見出し：名前 + 二つ名（ゴールド）横並び */}
                        {section.heading && isProfile && (() => {
                            const aliasData = blocks[0]?.dataLines?.find(d => d.label.includes('二つ名'));
                            return (
                                <h2 style={{
                                    ...S.sectionHeading,
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    gap: '1rem',
                                    flexWrap: 'wrap',
                                }}>
                                    <span>{section.heading}</span>
                                    {aliasData && (
                                        <span style={{
                                            fontSize: '0.9rem',
                                            fontWeight: 400,
                                            color: 'var(--accent-gold)',
                                        }}>「{aliasData.value.replace(/[「」]/g, '')}」</span>
                                    )}
                                </h2>
                            );
                        })()}

                        {/* まとめテーブル */}
                        {isSummary && renderSummaryTable(section.paragraphs)}

                        {/* プロフィール型（キャラ/集団）→ 参照サイト準拠カード */}
                        {!isSummary && isProfile && (
                            <div style={S.card}>
                                {blocks.map((block, bi) => {
                                    // ドラマの種 → コールアウトボックス
                                    const isDrama = block.subheading && block.subheading.includes('ドラマの種');
                                    // 背景/装備と戦闘スタイル → 青い見出し
                                    const isBlueHeading = block.subheading && (
                                        block.subheading === '背景' ||
                                        block.subheading.includes('装備') ||
                                        block.subheading.includes('戦闘')
                                    );
                                    // 内面と動機/概要/組織構造 → 通常の見出し
                                    const isNormalSub = block.subheading && !isDrama && !isBlueHeading;

                                    return (
                                        <div key={bi}>
                                            {/* 最初のブロック：タグ行でメタデータ表示 */}
                                            {bi === 0 && block.dataLines.length > 0 && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                                                    {block.dataLines.map((d, di) => (
                                                        <span key={di} style={{
                                                            fontSize: '0.75rem',
                                                            padding: '3px 10px',
                                                            background: d.label.includes('侵食')
                                                                ? (d.value.includes('あり') ? 'rgba(224,96,96,0.15)' : 'rgba(255,255,255,0.04)')
                                                                : 'rgba(255,255,255,0.04)',
                                                            border: d.label.includes('侵食') && d.value.includes('あり')
                                                                ? '1px solid rgba(224,96,96,0.3)' : '1px solid rgba(255,255,255,0.08)',
                                                            color: d.label.includes('侵食') && d.value.includes('あり')
                                                                ? '#e06060' : 'var(--text-secondary)',
                                                        }}>
                                                            {d.value}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* 青い見出し（背景/装備） */}
                                            {isBlueHeading && (
                                                <div style={{
                                                    fontSize: '0.8rem',
                                                    fontFamily: 'var(--font-mono)',
                                                    color: '#4a9eff',
                                                    letterSpacing: '0.08em',
                                                    marginTop: '1.25rem',
                                                    marginBottom: '0.5rem',
                                                }}>{block.subheading}</div>
                                            )}

                                            {/* 通常のサブ見出し */}
                                            {isNormalSub && bi > 0 && (
                                                <div style={S.subLabel}>{block.subheading}</div>
                                            )}

                                            {/* 後続ブロックのメタデータ */}
                                            {bi > 0 && block.dataLines.length > 0 && renderMetaLine(block.dataLines)}

                                            {/* テーブル */}
                                            {block.tableData && renderTable(block.tableData)}

                                            {/* ドラマの種 → コールアウトボックス */}
                                            {isDrama && (
                                                <div style={{
                                                    background: 'rgba(255,255,255,0.02)',
                                                    border: '1px solid rgba(255,255,255,0.06)',
                                                    padding: '1rem 1.25rem',
                                                    marginTop: '1rem',
                                                }}>
                                                    <div style={{
                                                        fontSize: '0.75rem',
                                                        fontFamily: 'var(--font-mono)',
                                                        color: 'var(--text-muted)',
                                                        letterSpacing: '0.08em',
                                                        marginBottom: '0.5rem',
                                                    }}>ドラマの種</div>
                                                    {block.bodyLines.map((para, pi) => (
                                                        <p key={pi} style={{
                                                            ...S.body,
                                                            fontSize: '0.82rem',
                                                            color: 'var(--text-muted)',
                                                            paddingLeft: '0.75rem',
                                                            position: 'relative',
                                                        }}>
                                                            <span style={{
                                                                position: 'absolute', left: 0,
                                                                color: 'var(--text-muted)', opacity: 0.5,
                                                            }}>—</span>
                                                            {para}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}

                                            {/* 通常本文（ドラマの種以外） */}
                                            {!isDrama && block.bodyLines.map((para, pi) => (
                                                <p key={pi} style={S.body}>{para}</p>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* 設計指針 → コールアウト + 六例まとめテーブル */}
                        {!isSummary && isDesignGuide && (() => {
                            // 六例まとめテーブルのブロックを分離

                            let summaryStartIdx = -1;
                            for (let bi = 0; bi < blocks.length; bi++) {
                                if (blocks[bi].subheading && blocks[bi].subheading.includes('まとめ')) {
                                    summaryStartIdx = bi;
                                    break;
                                }
                            }

                            // まとめブロック以前 → ガイドブロック
                            const guideBlocks = summaryStartIdx >= 0
                                ? blocks.slice(0, summaryStartIdx)
                                : blocks;

                            // まとめブロック以降の全bodyLinesとsubheadingsを結合
                            let summaryTableBlock = null;
                            if (summaryStartIdx >= 0) {
                                const allLines = [];
                                const titleBlock = blocks[summaryStartIdx];
                                // まとめブロック自身のbodyLines
                                allLines.push(...titleBlock.bodyLines);
                                // それ以降のブロックはsubheadingとbodyLinesを追加
                                for (let bi = summaryStartIdx + 1; bi < blocks.length; bi++) {
                                    if (blocks[bi].subheading) allLines.push(blocks[bi].subheading);
                                    allLines.push(...blocks[bi].bodyLines);
                                }
                                summaryTableBlock = {
                                    subheading: titleBlock.subheading,
                                    bodyLines: allLines,
                                };
                            }

                            return (
                                <div>
                                    {/* 強み/制約/ドラマの核 → コールアウト */}
                                    <div style={S.callout}>
                                        {guideBlocks.map((block, bi) => (
                                            <div key={bi}>
                                                {block.subheading && (
                                                    <div style={{
                                                        ...S.subLabel,
                                                        color: block.subheading.includes('制約') || block.subheading.includes('弱み')
                                                            ? '#e06060'
                                                            : 'var(--accent-gold)',
                                                    }}>
                                                        {block.subheading}
                                                    </div>
                                                )}
                                                {block.dataLines.length > 0 && renderMetaLine(block.dataLines)}
                                                {block.bodyLines.map((para, pi) => (
                                                    <p key={pi} style={S.body}>{para}</p>
                                                ))}
                                            </div>
                                        ))}
                                    </div>

                                    {/* 六例まとめ → テーブル */}
                                    {summaryTableBlock && (() => {
                                        const lines = summaryTableBlock.bodyLines;
                                        const headers = ['名前', '二つ名', '覚醒', '背景', '装備', '侵食'];
                                        // ヘッダーを探す
                                        let headerIdx = -1;
                                        for (let i = 0; i < lines.length; i++) {
                                            if (lines[i] === '名前') { headerIdx = i; break; }
                                        }

                                        if (headerIdx >= 0) {
                                            // ヘッダー行の列数を検出
                                            const actualHeaders = [];
                                            let hi = headerIdx;
                                            while (hi < lines.length && headers.includes(lines[hi])) {
                                                actualHeaders.push(lines[hi]);
                                                hi++;
                                            }
                                            const colCount = actualHeaders.length;
                                            const dataLines = lines.slice(hi);
                                            const rows = [];
                                            for (let i = 0; i < dataLines.length; i += colCount) {
                                                rows.push(dataLines.slice(i, i + colCount));
                                            }

                                            return (
                                                <div>
                                                    <h3 style={{
                                                        ...S.sectionHeading,
                                                        fontSize: '1.1rem',
                                                        marginTop: '2rem',
                                                    }}>{summaryTableBlock.subheading}</h3>
                                                    <div style={{ overflowX: 'auto' }}>
                                                        <table style={S.table}>
                                                            <thead>
                                                                <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                                                                    {actualHeaders.map((h, i) => (
                                                                        <th key={i} style={{
                                                                            padding: '0.6rem 0.75rem',
                                                                            fontSize: '0.7rem',
                                                                            fontFamily: 'var(--font-mono)',
                                                                            color: 'var(--accent-gold)',
                                                                            letterSpacing: '0.1em',
                                                                            textAlign: 'left',
                                                                            fontWeight: 400,
                                                                        }}>{h}</th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {rows.map((row, ri) => (
                                                                    <tr key={ri} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                                        {row.map((cell, ci) => (
                                                                            <td key={ci} style={{
                                                                                padding: '0.6rem 0.75rem',
                                                                                fontSize: '0.8rem',
                                                                                color: ci === 0 ? 'var(--text-heading)'
                                                                                    : (actualHeaders[ci] === '侵食' && cell.includes('あり'))
                                                                                        ? '#e06060' : 'var(--text-secondary)',
                                                                                fontWeight: ci === 0 ? 700 : 400,
                                                                            }}>{cell}</td>
                                                                        ))}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>
                            );
                        })()}

                        {/* 通常セクション */}
                        {!isSummary && !isProfile && !isDesignGuide && (
                            <div>
                                {blocks.map((block, bi) => (
                                    <div key={bi} style={{ marginBottom: '1rem' }}>
                                        {block.subheading && (
                                            <div style={S.subLabel}>{block.subheading}</div>
                                        )}
                                        {block.dataLines.length > 0 && renderMetaLine(block.dataLines)}
                                        {block.tableData && renderTable(block.tableData)}
                                        {block.bodyLines.map((para, pi) => (
                                            <p key={pi} style={S.body}>{para}</p>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                );
            })}

            {/* 他の組織へのリンク */}
            <div style={{
                borderTop: '1px solid rgba(212,175,55,0.15)',
                paddingTop: '2rem',
                marginTop: '3rem',
            }}>
                <div style={S.sectionIndex}>OTHER FACTIONS</div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                    {Object.entries(ORG_META).filter(([k]) => k !== slug).map(([k, v]) => (
                        <Link
                            key={k}
                            href={`/organizations/${k}/`}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                color: 'var(--text-secondary)',
                                fontSize: '0.8rem',
                                textDecoration: 'none',
                            }}
                        >
                            {v.name}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
