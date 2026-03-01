// 武器・装備 コミュニティ一覧 — サーバーコンポーネント
import GearList from './GearList';

export const metadata = {
    title: '武器・装備一覧 — 電脳怪異譚 KAI-I//KILL',
    description: 'コミュニティが投稿した武器・装備データの一覧。カテゴリ・メーカーで検索できます。',
};

export default function CommunityGearPage() {
    return <GearList />;
}
