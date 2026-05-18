// 世界観バイブルのチャプター構成 — /world/ ハブと /world/[section]/ で共有
// ※ docs/player/world_bible_v1.0.md の章番号と完全に一致させること

export const CHAPTERS = [
    {
        slug: 'world',
        title: 'この世界について',
        titleEn: 'THE WORLD',
        desc: '架空日本の全体像、都市と地方管区、食と日常、そして怪異が存在する社会。',
        icon: '◉',
        sections: ['はじめに', '1. 世界概要'],
    },
    {
        slug: 'anomaly',
        title: '怪異と討伐',
        titleEn: 'ANOMALIES & COMBAT',
        desc: '怪異とは何か、核とルールの仕組み、分類体系、そして怪異を暴き討伐するまでのプロセス。',
        icon: '△',
        sections: ['2. 怪異とは何か', '3. 核とルール', '4. 怪異の分類', '5. 怪異を暴くプロセス', '6. 討伐手段'],
    },
    {
        slug: 'powers',
        title: '能力と装備',
        titleEn: 'POWERS & EQUIPMENT',
        desc: '魔法と異能の体系、魔導具、武装型から搭乗型までの装備分類。',
        icon: '✦',
        sections: ['7. 能力体系', '8. 魔導具', '9. 装備分類体系'],
    },
    {
        slug: 'factions',
        title: '組織と社会',
        titleEn: 'FACTIONS & SOCIETY',
        desc: '討伐免許制度、祓部・傭兵・無所属の三勢力、覚醒パターン、素養と権力構造、怪異への対応をめぐる思想、稀人。',
        icon: '⛊',
        sections: ['10. 討伐免許制度', '11. 三種の討伐者', '12. 覚醒パターン', '13. 素養と社会構造', '14. 魔導具産業と権力構造', '15. 怪異への対応をめぐる思想', '16. 稀人（まれびと）とは', '17. 謎の組織について'],
    },
    {
        slug: 'guide',
        title: 'プレイヤーへの手引き',
        titleEn: 'PLAYER GUIDANCE',
        desc: 'キャラクター作成の指針と、この世界で生き延びるための原則。',
        icon: '▶',
        sections: ['18. キャラクター作成の指針', '19. この世界で生き延びるための原則'],
    },
];
