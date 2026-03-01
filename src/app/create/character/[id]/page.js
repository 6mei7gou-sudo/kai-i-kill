// キャラクターシート編集ページ
import EditCharacterClient from './EditCharacterClient';

export const metadata = { title: 'キャラクターシート編集 — 電脳怪異譚 KAI-I//KILL' };

export default async function EditCharacterPage({ params }) {
    const { id } = await params;
    return <EditCharacterClient id={id} />;
}
