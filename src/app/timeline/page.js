// タイムラインページ — 年表を時系列で表示（整形後フォーマット対応）
import fs from 'fs';
import path from 'path';

function loadTimeline() {
    const filePath = path.join(process.cwd(), 'docs', 'public', 'player_timeline_v1.0.md');
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8');
    }
    return '';
}

// 章（セクション）を抽出する
function parseChapters(content) {
    const chapters = [];
    // ## 第N章：タイトル（年代範囲）で分割
    const chapterRegex = /^## (第.+?章：.+)$/gm;
    let match;
    const chapterStarts = [];

    while ((match = chapterRegex.exec(content)) !== null) {
        chapterStarts.push({ title: match[1], index: match.index });
    }

    for (let i = 0; i < chapterStarts.length; i++) {
        const start = chapterStarts[i].index;
        const end = i + 1 < chapterStarts.length ? chapterStarts[i + 1].index : content.length;
        const body = content.slice(start, end);
        chapters.push({
            title: chapterStarts[i].title,
            entries: parseEntries(body),
        });
    }

    return chapters;
}

// 個別エントリを抽出する
// フォーマット: **年代：イベント名** ★ — 説明
// または: **年代** — 説明（名前なし）
function parseEntries(chapterBody) {
    const entries = [];
    // **で始まる行をエントリの先頭として検出
    const lines = chapterBody.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('**')) continue;

        // パターン1: **年代：イベント名** ★？ — 説明
        // パターン2: **年代** ★？ — 説明
        const entryMatch = trimmed.match(
            /^\*\*(.+?)\*\*\s*(★)?\s*(？)?\s*—\s*(.+)$/
        );
        if (!entryMatch) continue;

        const rawLabel = entryMatch[1];
        const isCommon = !!entryMatch[2];
        const isUncertain = !!entryMatch[3];
        const description = entryMatch[4].trim();

        // ラベルに「：」が含まれる場合は年代とイベント名を分離
        let year, name;
        const colonIdx = rawLabel.indexOf('：');
        if (colonIdx !== -1) {
            year = rawLabel.slice(0, colonIdx).trim();
            name = rawLabel.slice(colonIdx + 1).trim();
        } else {
            year = rawLabel.trim();
            name = '';
        }

        entries.push({
            year,
            name,
            description,
            isCommon,
            isUncertain,
        });
    }

    return entries;
}

export const metadata = {
    title: '世界年表 — 電脳怪異譚 KAI-I//KILL',
    description: '鵺ヶ原事変（1867年）から御神楽事変まで、怪異に関わる重要事件の記録を時系列で辿る。',
};

export default function TimelinePage() {
    const content = loadTimeline();
    const chapters = parseChapters(content);

    return (
        <div className="container">
            {/* ページヘッダー */}
            <div className="page-header">
                <div className="page-header__badge">TIMELINE — CHRONOLOGICAL RECORD</div>
                <h1 className="page-header__title">世界年表</h1>
                <div className="page-header__subtitle">電脳怪異譚　KAI-I//KILL — 討伐者ハンドブック</div>
            </div>

            {/* 凡例 */}
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-2xl)', flexWrap: 'wrap' }}>
                <span className="badge badge--gold">★ 常識レベル</span>
                <span className="badge badge--danger">？ 真偽不明</span>
                <span className="badge badge--muted">無印 = 公的記録</span>
            </div>

            {/* 章ごとに表示 */}
            {chapters.map((chapter, ci) => (
                <section key={ci} style={{ marginBottom: 'var(--space-3xl)' }}>
                    {/* 章見出し */}
                    <div className="section">
                        <div className="section__number">{`CHAPTER ${String(ci + 1).padStart(2, '0')}`}</div>
                        <h2 className="section__heading">
                            {chapter.title.replace(/^第.+?章：/, '')}
                        </h2>
                    </div>

                    {/* タイムライン */}
                    <div className="timeline">
                        {chapter.entries.map((entry, ei) => (
                            <div key={ei} className="timeline-entry">
                                <span className="timeline-entry__year">
                                    {entry.year}
                                    {entry.isCommon && <span className="mark--common"> ★</span>}
                                    {entry.isUncertain && <span className="mark--uncertain"> ？</span>}
                                </span>
                                {entry.name && (
                                    <h3 className="timeline-entry__title">{entry.name}</h3>
                                )}
                                <p className="timeline-entry__desc">{entry.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            ))}

            {/* クロージング */}
            <section className="closing">
                <p className="closing__text">
                    <span className="closing__em">年表に空白があるとすれば、そこに何かが隠れている可能性がある。</span>
                </p>
            </section>
        </div>
    );
}
