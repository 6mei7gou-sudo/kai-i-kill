// タイムラインページ — 年表を時系列で表示
import fs from 'fs';
import path from 'path';

function loadTimeline() {
    const filePath = path.join(process.cwd(), 'docs', 'public', 'player_timeline_v1.0.md');
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8');
    }
    return '';
}

// タイムラインのMarkdownから年表エントリーを抽出
function parseTimelineEntries(content) {
    const entries = [];
    // 【イベント名】パターンで分割
    const blocks = content.split(/(?=【)/);

    for (const block of blocks) {
        const nameMatch = block.match(/【(.+?)】/);
        if (!nameMatch) continue;

        const name = nameMatch[1];
        // 発生時期の抽出
        const yearMatch = block.match(/発生時期：(.+?)(?:\n|$)/);
        // 関連の抽出
        const relatedMatch = block.match(/関連：(.+?)(?:\n|$)/);
        // 解説の抽出
        const descMatch = block.match(/解説：\s*\n?\s*([\s\S]*?)(?=(?:【|$))/);
        // ★（常識）と？（真偽不明）マーク
        const isCommon = block.includes('★');
        const isUncertain = block.includes('？');

        entries.push({
            name,
            year: yearMatch ? yearMatch[1].trim() : '',
            related: relatedMatch ? relatedMatch[1].split('、').map(s => s.trim()) : [],
            description: descMatch ? descMatch[1].replace(/★|？/g, '').trim() : '',
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
    const entries = parseTimelineEntries(content);

    return (
        <div className="container">
            <section className="section">
                <span className="section__title">// Timeline</span>
                <h1 className="section__heading">世界年表</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                    この世界で記録された怪異関連事件の年表です。
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                    <span className="badge badge--cyber">★ = 常識レベル</span>
                    <span className="badge badge--kai">？ = 真偽不明</span>
                </div>
            </section>

            <div className="timeline">
                {entries.map((entry, i) => (
                    <div key={i} className="timeline-entry">
                        <span className="timeline-entry__year">
                            {entry.year}
                            {entry.isCommon && ' ★'}
                            {entry.isUncertain && ' ？'}
                        </span>
                        <h3 className="timeline-entry__title">{entry.name}</h3>
                        <p className="timeline-entry__desc">{entry.description}</p>
                        {entry.related.length > 0 && (
                            <div style={{ marginTop: 'var(--space-sm)', display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                                {entry.related.map((rel, j) => (
                                    <span key={j} className="badge badge--cyber">{rel}</span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
