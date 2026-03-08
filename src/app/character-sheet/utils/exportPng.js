'use client';

// PNG出力 — html2canvas でシートまたはキャラカードをPNG画像として保存
import html2canvas from 'html2canvas';

/**
 * 指定DOM要素をPNG画像としてダウンロード
 * @param {HTMLElement} element - キャプチャ対象のDOM要素
 * @param {string} filename - 出力ファイル名（拡張子なし）
 * @param {object} options - 追加オプション
 */
export async function exportPng(element, filename = 'character_card', options = {}) {
    const canvas = await html2canvas(element, {
        scale: options.scale || 2,
        useCORS: true,
        backgroundColor: options.backgroundColor || '#0a0c10',
        logging: false,
        width: options.width || undefined,
        height: options.height || undefined,
    });

    // canvas → Blob → ダウンロード
    canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.png`;
        a.click();
        URL.revokeObjectURL(url);
    }, 'image/png');
}

/**
 * OGP用サイズ（1200x630）でキャラカードをPNG出力
 * @param {HTMLElement} element - キャラカードのDOM要素
 * @param {string} filename - 出力ファイル名
 */
export async function exportOgpCard(element, filename = 'character_card') {
    return exportPng(element, filename, {
        scale: 2,
        width: 1200,
        height: 630,
    });
}
