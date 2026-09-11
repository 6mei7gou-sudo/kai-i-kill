// 投稿の取得ヘルパー（クライアントコンポーネント用）
// ブラウザーの anon キーでは公開行しか読めないため、所有者向け（非公開・限定）の閲覧は
// 認可を行う /api/posts 経由で取得する。

/**
 * 単一の投稿を取得する。見つからない／閲覧権限がない場合は null
 * @param {'anomaly_drafts'|'gear_posts'|'character_sheets'|'novels'} table
 * @param {string} id
 */
export async function fetchPost(table, id) {
    try {
        const res = await fetch(`/api/posts?table=${encodeURIComponent(table)}&id=${encodeURIComponent(id)}`);
        if (!res.ok) return null;
        const json = await res.json();
        return json.ok ? json.data : null;
    } catch (_) {
        return null;
    }
}
