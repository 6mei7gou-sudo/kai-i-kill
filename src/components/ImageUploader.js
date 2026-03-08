'use client';

// 画像アップローダー共通コンポーネント
// ドラッグ&ドロップ or ファイル選択 → Supabase Storage にアップロード → URL返却
// URLの直接入力（従来方式）にもフォールバック対応

import { useState, useRef, useCallback } from 'react';
import { uploadImage } from '@/lib/storage';

/**
 * @param {object} props
 * @param {string} props.value - 現在の画像URL
 * @param {function} props.onChange - URL変更時のコールバック
 * @param {string} props.folder - Supabase Storage のフォルダ名
 * @param {string} props.label - ラベル（例: 'キャラクター画像'）
 * @param {boolean} props.compact - コンパクトモード（キャラシ用）
 */
export default function ImageUploader({
    value = '',
    onChange,
    folder = 'general',
    label = '画像',
    compact = false,
}) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [mode, setMode] = useState('upload'); // 'upload' | 'url'
    const inputRef = useRef(null);

    // ファイルアップロード処理
    const handleFile = useCallback(async (file) => {
        if (!file) return;
        setUploading(true);
        setError(null);

        const result = await uploadImage(file, folder);

        if (result.error) {
            setError(result.error);
        } else {
            onChange(result.url);
        }
        setUploading(false);
    }, [folder, onChange]);

    // ファイル選択
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    // ドラッグ&ドロップ
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            handleFile(file);
        }
    }, [handleFile]);

    const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
    const handleDragLeave = () => setDragOver(false);

    // クリア
    const handleClear = () => {
        onChange('');
        setError(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className={`image-uploader ${compact ? 'image-uploader--compact' : ''}`}>
            <div className="image-uploader__header">
                <span className="image-uploader__label">{label}</span>
                <div className="image-uploader__mode-toggle">
                    <button
                        type="button"
                        className={`image-uploader__mode-btn ${mode === 'upload' ? 'active' : ''}`}
                        onClick={() => setMode('upload')}
                    >ファイル</button>
                    <button
                        type="button"
                        className={`image-uploader__mode-btn ${mode === 'url' ? 'active' : ''}`}
                        onClick={() => setMode('url')}
                    >URL</button>
                </div>
            </div>

            {mode === 'upload' ? (
                <div
                    className={`image-uploader__dropzone ${dragOver ? 'image-uploader__dropzone--active' : ''} ${uploading ? 'image-uploader__dropzone--uploading' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => inputRef.current?.click()}
                >
                    {uploading ? (
                        <span className="image-uploader__status">⏳ アップロード中...</span>
                    ) : value ? (
                        <div className="image-uploader__preview-wrap">
                            <img src={value} alt={label} className="image-uploader__preview" />
                            <button
                                type="button"
                                className="image-uploader__clear"
                                onClick={(e) => { e.stopPropagation(); handleClear(); }}
                            >✕</button>
                        </div>
                    ) : (
                        <span className="image-uploader__placeholder">
                            📁 クリックまたはドラッグ&ドロップ<br />
                            <small>JPEG / PNG / WebP / GIF（5MB以下）</small>
                        </span>
                    )}
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFileSelect}
                        hidden
                    />
                </div>
            ) : (
                <div className="image-uploader__url-mode">
                    <input
                        type="text"
                        className="image-uploader__url-input"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="https://..."
                    />
                    {value && (
                        <img src={value} alt={label} className="image-uploader__preview image-uploader__preview--url" />
                    )}
                </div>
            )}

            {error && <div className="image-uploader__error">⚠ {error}</div>}
        </div>
    );
}
