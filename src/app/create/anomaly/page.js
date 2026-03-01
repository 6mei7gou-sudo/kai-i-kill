// 怪異調査書（TMP）投稿ページ — サーバーコンポーネント
import AnomalyForm from './AnomalyForm';

export const metadata = {
    title: '怪異調査書を作成 — 電脳怪異譚 KAI-I//KILL',
    description: '怪異調査書（TMP）を作成し、コミュニティに共有しましょう。',
};

export default function CreateAnomalyPage() {
    return <AnomalyForm />;
}
