// 組織詳細ページ — 各組織のMDファイルを直接レンダリング（紐付けは src/lib/siteDocs.js）
import MdRenderer from '@/components/MarkdownRenderer';
import { readSiteDoc } from '@/lib/siteDocs';

// スラッグと表示メタデータの対応（本文は siteDocs の faction-<slug> キーで読む）
const ORG_META = {
    haraebe: {
        title: '祓部（はらえべ）詳細',
        badge: 'HARAEBE — PUBLIC AGENCY',
    },
    companies: {
        title: '企業詳細',
        badge: 'COMPANIES — CORPORATE ENTITIES',
    },
    mercenaries: {
        title: '傭兵詳細',
        badge: 'MERCENARIES — INDEPENDENT FORCES',
    },
    unaffiliated: {
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
    if (!ORG_META[slug]) return '';
    return readSiteDoc(`faction-${slug}`);
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
