// 小説詳細ページ
import { use } from 'react';
import NovelDetail from './NovelDetail';

export default function NovelDetailPage({ params }) {
    const { id } = use(params);
    return <NovelDetail id={id} />;
}
