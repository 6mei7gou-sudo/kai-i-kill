// 組織詳細ページ — 各組織のMDファイルを直接レンダリング
import fs from 'fs';
import path from 'path';
import MdRenderer from '@/components/MarkdownRenderer';

// スラッグとファイル名・メタデータの対応
const ORG_META = {
    haraebe: {
        file: 'player_detail_haraebe.md',
        title: '祓部（はらえべ）詳細',
        badge: 'HARAEBE — PUBLIC AGENCY',
    },
    companies: {
        file: 'player_detail_companies.md',
        title: '企業詳細',
        badge: 'COMPANIES — CORPORATE ENTITIES',
    },
    mercenaries: {
        file: 'player_detail_mercenaries.md',
        title: '傭兵詳細',
        badge: 'MERCENARIES — INDEPENDENT FORCES',
    },
    unaffiliated: {
        file: 'player_detail_unaffiliated.md',
        title: '無所属詳細',
        badge: 'UNAFFILIATED — LONE OPERATORS',
    },
};

export function generateStaticParams() {
    return Object.keys(ORG_META).map(slug => ({ slug }));
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const meta = ORG_META[slug];
    return {
        title: `${meta?.title || '組織'} — 電脳怪異譚 KAI-I//KILL`,
        description: `${meta?.title}の詳細設定資料。組織構造・人員構成・キャラクター例・設計指針を収録。`,
    };
}

function loadOrgContent(slug) {
    const meta = ORG_META[slug];
    if (!meta) return '';
    const filePath = path.join(process.cwd(), 'docs', 'public', meta.file);
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8');
    }
    return '';
}

export default async function OrgDetailPage({ params }) {
    const { slug } = await params;
    const meta = ORG_META[slug];
    const content = loadOrgContent(slug);

    if (!content || !meta) {
        return <div className="container"><h1>組織データが見つかりません</h1></div>;
    }

    return (
        <MdRenderer
            content={content}
            pageTitle={meta.title}
            pageBadge={meta.badge}
            pageSubtitle="電脳怪異譚　KAI-I//KILL — 討伐者ハンドブック"
            showToc={true}
        />
    );
}
