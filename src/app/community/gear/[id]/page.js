// 武器・装備 個別閲覧ページ
import GearDetail from './GearDetail';

export const metadata = {
    title: '武器・装備詳細 — 電脳怪異譚 KAI-I//KILL',
};

export default async function GearDetailPage({ params }) {
    const { id } = await params;
    return <GearDetail id={id} />;
}
