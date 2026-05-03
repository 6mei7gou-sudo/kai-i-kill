// 小説一覧ページ
import NovelList from './NovelList';

export const metadata = {
    title: '小説 — コミュニティDB — KAI-I//KILL',
    description: 'プレイヤー投稿の小説一覧。登場するキャラクターと怪異から作品を探せます。',
};

export default function NovelsPage() {
    return (
        <div className="container">
            <div className="page-header">
                <div className="page-header__badge">COMMUNITY — NOVELS</div>
                <h1 className="page-header__title">小説</h1>
                <div className="page-header__subtitle">プレイヤー投稿の創作小説</div>
            </div>
            <NovelList />
        </div>
    );
}
