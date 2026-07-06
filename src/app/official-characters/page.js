// 公式キャラクターページ — サーバーコンポーネント
import OfficialCharactersList from './OfficialCharactersList';

export const metadata = {
    title: '公式キャラクター — 電脳怪異譚 KAI-I//KILL',
    description: 'KAI-I//KILL の公式キャラクターたちを紹介します。',
};

export default function OfficialCharactersPage() {
    return <OfficialCharactersList />;
}
