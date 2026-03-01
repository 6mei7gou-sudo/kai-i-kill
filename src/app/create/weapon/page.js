// 武器・装備投稿ページ — サーバーコンポーネント
import WeaponForm from './WeaponForm';

export const metadata = {
    title: '武器・装備を投稿 — 電脳怪異譚 KAI-I//KILL',
    description: '武器・装備のデータを投稿し、コミュニティに共有しましょう。',
};

export default function CreateWeaponPage() {
    return <WeaponForm />;
}
