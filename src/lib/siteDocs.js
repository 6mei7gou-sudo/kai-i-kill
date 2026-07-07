// docs/ 配下の設定資料とサイトページの紐付けを一元管理する
// ルート⇔ファイルの対応表は docs/README.md「Web表示との対応表」にも掲載している。
// 新しい文書をサイトに載せる場合は必ずここに登録し、ページ側は readSiteDoc(key) で読むこと。
// ※ docs/gm/・docs/rules/ は運営専用資料のため、ここに登録してはならない（Web非公開方針）
import fs from 'fs';
import path from 'path';

export const SITE_DOCS = {
    // 世界観（プレイヤー向け）
    'world-bible': { file: 'player/world_bible.md', route: '/world/' },
    'glossary': { file: 'player/glossary.md', route: '/glossary/' },
    'timeline': { file: 'player/timeline.md', route: '/timeline/' },
    'special-elevator': { file: 'player/special/elevator.md', route: '/world/elevator/' },

    // 勢力別詳細（プレイヤー向け）
    'faction-haraebe': { file: 'player/factions/haraebe.md', route: '/organizations/haraebe/' },
    'faction-companies': { file: 'player/factions/companies.md', route: '/organizations/companies/' },
    'faction-mercenaries': { file: 'player/factions/mercenaries.md', route: '/organizations/mercenaries/' },
    'faction-unaffiliated': { file: 'player/factions/unaffiliated.md', route: '/organizations/unaffiliated/' },

    // 規約類
    'terms': { file: 'legal/terms.md', route: '/terms/' },
    'privacy': { file: 'legal/privacy.md', route: '/privacy/' },
    'guidelines': { file: 'legal/guidelines.md', route: '/guidelines/' },
};

/**
 * 登録済みの文書を読み込む。未登録キー・ファイル欠落時は空文字を返す
 * @param {keyof typeof SITE_DOCS | string} key
 * @returns {string}
 */
export function readSiteDoc(key) {
    const doc = SITE_DOCS[key];
    if (!doc) return '';
    const filePath = path.join(process.cwd(), 'docs', doc.file);
    return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
}
