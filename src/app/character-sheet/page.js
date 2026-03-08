// /character-sheet ルートのエントリーポイント
import CharacterSheetPage from './CharacterSheet';

export const metadata = {
    title: 'キャラクターシート — KAI-I//KILL',
    description: 'KAI-I//KILL TRPG キャラクターシート作成・管理ツール',
};

export default function Page() {
    return <CharacterSheetPage />;
}
