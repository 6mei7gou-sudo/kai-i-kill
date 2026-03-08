'use client';

// PDF出力 — html2canvas でシートをキャプチャ → jsPDF でA4 PDFに変換
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * 指定DOM要素をPDFとしてダウンロード
 * @param {HTMLElement} element - キャプチャ対象のDOM要素
 * @param {string} filename - 出力ファイル名（拡張子なし）
 */
export async function exportPdf(element, filename = 'character') {
    // DOMをキャンバスに変換（高解像度）
    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0a0c10',
        logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // A4サイズ（mm）
    const pdfWidth = 210;
    const pdfHeight = 297;

    // 画像のアスペクト比を維持してA4に収める
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const scaledWidth = imgWidth * ratio;
    const scaledHeight = imgHeight * ratio;

    // 複数ページ対応：コンテンツがA4を超える場合は分割
    const totalPages = Math.ceil(scaledHeight / pdfHeight);
    const pdf = new jsPDF('p', 'mm', 'a4');

    for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();

        // 各ページにオフセット付きで画像を配置
        const yOffset = -(page * pdfHeight);
        pdf.addImage(imgData, 'PNG', 0, yOffset, scaledWidth, scaledHeight);
    }

    pdf.save(`${filename}.pdf`);
}
