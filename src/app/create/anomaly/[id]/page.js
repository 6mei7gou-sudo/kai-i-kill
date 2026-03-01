// 怪異調査書 編集ページ
import EditAnomalyClient from './EditAnomalyClient';

export const metadata = {
    title: '怪異調査書を編集 — 電脳怪異譚 KAI-I//KILL',
};

export default async function EditAnomalyPage({ params }) {
    const { id } = await params;
    return <EditAnomalyClient id={id} />;
}
