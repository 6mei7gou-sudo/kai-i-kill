// 画像出力ユーティリティ — html2canvas でDOM要素をPNGとしてダウンロード
'use client';

import html2canvas from 'html2canvas';

/**
 * 指定DOM要素をPNG画像としてダウンロード
 * @param {HTMLElement} element - キャプチャ対象
 * @param {string} filename - 拡張子なしのファイル名
 * @param {object} options - { scale, width, height, backgroundColor }
 */
export async function exportAsImage(element, filename = 'export', options = {}) {
    const canvas = await html2canvas(element, {
        scale: options.scale || 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: options.backgroundColor || '#05070a',
        logging: false,
        width: options.width || undefined,
        height: options.height || undefined,
    });

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
