// 武器・装備 個別閲覧ページ
import GearDetail from './GearDetail';

export const metadata = {
    title: '武器・装備詳細 — 電脳怪異譚 KAI-I//KILL',
};

export default function GearDetailPage({ params }) {
    return <GearDetail id={params.id} />;
}
