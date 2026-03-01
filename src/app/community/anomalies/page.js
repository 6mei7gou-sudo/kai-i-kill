// 怪異調査書（TMP）コミュニティ一覧 — サーバーコンポーネント
import AnomalyList from './AnomalyList';

export const metadata = {
    title: '怪異調査書一覧 — 電脳怪異譚 KAI-I//KILL',
    description: 'コミュニティが投稿した怪異調査書（TMP）の一覧。等級・脅威度・タグで検索できます。',
};

export default function CommunityAnomaliesPage() {
    return <AnomalyList />;
}
