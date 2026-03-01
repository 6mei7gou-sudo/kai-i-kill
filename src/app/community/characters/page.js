// キャラクターシート一覧ページ — サーバーコンポーネント
import CharacterList from './CharacterList';

export const metadata = {
    title: 'キャラクターシート一覧 — 電脳怪異譚 KAI-I//KILL',
    description: 'コミュニティが投稿したキャラクターシートを閲覧できます。',
};

export default function CharactersPage() {
    return <CharacterList />;
}
