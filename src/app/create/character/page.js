// キャラクターシート投稿ページ — サーバーコンポーネント
import CharacterForm from './CharacterForm';

export const metadata = {
    title: 'キャラクターシート作成 — 電脳怪異譚 KAI-I//KILL',
    description: 'TRPGキャラクターシートを作成してコミュニティに共有しましょう。',
};

export default function CreateCharacterPage() {
    return <CharacterForm />;
}
