// キャラクターシート詳細ページ
import CharacterDetail from './CharacterDetail';

export const metadata = { title: 'キャラクターシート — 電脳怪異譚 KAI-I//KILL' };

export default async function CharacterDetailPage({ params }) {
    const { id } = await params;
    return <CharacterDetail id={id} />;
}
