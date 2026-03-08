// 画像アップロード用 Supabase Storage ヘルパー
// クライアントサイドから直接 Supabase Storage にアップロード
import { supabase } from './supabase';

const BUCKET_NAME = 'uploads';

/**
 * ファイルを Supabase Storage にアップロードし、公開URLを返す
 * @param {File} file - アップロードするファイル
 * @param {string} folder - 保存先フォルダ（例: 'characters', 'anomalies', 'gear'）
 * @returns {Promise<{url: string, error: string|null}>}
 */
export async function uploadImage(file, folder = 'general') {
    if (!supabase) {
        return { url: null, error: 'Supabase未接続' };
    }

    // ファイルバリデーション
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
        return { url: null, error: 'JPEG、PNG、WebP、GIF のみアップロード可能です' };
    }

    if (file.size > maxSize) {
        return { url: null, error: 'ファイルサイズは5MB以下にしてください' };
    }

    // ユニークなファイル名を生成（タイムスタンプ + ランダム文字列）
    const ext = file.name.split('.').pop();
    const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = `${folder}/${uniqueName}`;

    // アップロード
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        console.error('アップロードエラー:', error);
        return { url: null, error: error.message };
    }

    // 公開URLを取得
    const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

    return { url: urlData.publicUrl, error: null };
}

/**
 * Supabase Storage からファイルを削除
 * @param {string} url - 削除するファイルのURL
 */
export async function deleteImage(url) {
    if (!supabase || !url) return;

    // URLからパスを抽出
    const match = url.match(/\/storage\/v1\/object\/public\/uploads\/(.+)/);
    if (!match) return;

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([match[1]]);

    if (error) console.error('削除エラー:', error);
}
