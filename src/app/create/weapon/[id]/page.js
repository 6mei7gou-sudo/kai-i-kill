// 武器・装備 編集ページ
import EditGearClient from './EditGearClient';

export const metadata = {
    title: '武器・装備を編集 — 電脳怪異譚 KAI-I//KILL',
};

export default async function EditGearPage({ params }) {
    const { id } = await params;
    return <EditGearClient id={id} />;
}
