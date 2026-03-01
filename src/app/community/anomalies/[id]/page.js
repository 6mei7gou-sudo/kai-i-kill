// 怪異調査書 個別閲覧ページ
import AnomalyDetail from './AnomalyDetail';

export const metadata = {
    title: '怪異調査書 — 電脳怪異譚 KAI-I//KILL',
};

export default async function AnomalyDetailPage({ params }) {
    const { id } = await params;
    return <AnomalyDetail id={id} />;
}
