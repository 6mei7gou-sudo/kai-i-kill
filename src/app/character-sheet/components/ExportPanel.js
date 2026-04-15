'use client';

// エクスポートパネル — PDF / PNG / 印刷 / テキスト の出力ボタン群
import { useRef, useCallback, useState } from 'react';
import CharacterCard from './CharacterCard';
import RpIdCard from '@/components/RpIdCard';
import {
    ABILITIES, RANK_DATA, EMOTIONS, EROSION_LABELS,
    EQUIPMENT, EQUIPMENT_OPTIONS, GIFTS, STARTING_CP,
} from '../data/masterData';

// 侵食率ラベル取得
function getErosionLabel(value) {
    let current = EROSION_LABELS[0];
    for (const e of EROSION_LABELS) {
        if (value >= e.threshold) current = e;
    }
    return current;
}

// Discord貼り付け用プレーンテキストを生成（sheet-app の buildExportText 相当）
function buildExportText(state, remainingCP) {
    const bar = (val, max = 10) => '▓'.repeat(val) + '░'.repeat(max - val);
    const name = state.name || '（名前なし）';
    const lines = [];

    lines.push('═══════════════════════════════════');
    lines.push('  KAI-I//KILL キャラクターシート');
    lines.push('═══════════════════════════════════');
    lines.push('');
    lines.push('【基本情報】');
    lines.push(`名前：${name}`);
    if (state.affiliation) lines.push(`所属：${state.affiliation}${state.sub_affiliation ? `（${state.sub_affiliation}）` : ''}`);
    if (state.awakening) lines.push(`覚醒：${state.awakening}`);
    if (state.belief) lines.push(`信念：${state.belief}`);
    if (state.background) lines.push(`背景：${state.background}`);
    lines.push('');
    lines.push('【能力値】');
    ABILITIES.forEach(a => {
        const rank = state.abilities[a.id] || 'D';
        lines.push(`  ${a.name}：${rank}（${RANK_DATA[rank].dice}d6）`);
    });
    lines.push('');
    lines.push('【共鳴記録】');
    EMOTIONS.forEach(e => {
        const val = state.emotions[e.id] || 0;
        lines.push(`  ${e.name}：${bar(val)} ${val}/10${val >= 10 ? ' ⚠臨界！' : ''}`);
    });
    lines.push('');
    const erosionInfo = getErosionLabel(state.erosion);
    lines.push('【侵食率】');
    lines.push(`  ${state.erosion}% ／ 【${erosionInfo.label}】`);
    lines.push('');
    lines.push(`【装備】（CP残：${remainingCP} / ${STARTING_CP}）`);
    if (!state.equipped || state.equipped.length === 0) {
        lines.push('  （なし）');
    } else {
        state.equipped.forEach(entry => {
            const item = EQUIPMENT.find(eq => eq.id === entry.equipId);
            if (!item) return;
            let optStr = '';
            if (entry.optionIds && entry.optionIds.length > 0) {
                const optNames = entry.optionIds.map(oid => {
                    const o = EQUIPMENT_OPTIONS.find(opt => opt.id === oid);
                    return o ? o.name : '';
                }).filter(Boolean);
                if (optNames.length > 0) optStr = ` ＋ ${optNames.join('、')}`;
            }
            lines.push(`  • ${item.name}（${item.slot}）${optStr}`);
        });
    }
    if (state.selectedGifts && state.selectedGifts.length > 0) {
        lines.push('');
        lines.push('【ギフト】');
        state.selectedGifts.forEach(gId => {
            const g = GIFTS.find(gift => gift.id === gId);
            if (g) lines.push(`  • ${g.name}：${g.desc}`);
        });
    }
    if (state.notes) {
        lines.push('');
        lines.push('【メモ】');
        lines.push(state.notes);
    }
    lines.push('');
    lines.push('═══════════════════════════════════');
    return lines.join('\n');
}

// ExportPanel の state を RpIdCard の character 形式に変換
function stateToRpCharacter(state) {
    return {
        id: state.name || 'draft',
        character_name: state.name,
        affiliation: state.affiliation,
        sub_affiliation: state.sub_affiliation || '',
        awakening: state.awakening,
        background: state.background,
        brief_history: state.notes,
        image_url: state.characterImage,
        thumbnail_url: state.characterImage,
        age: '',
        gender: '',
        active_title: '',
        title: '',
        approved_status: 'pending',
        author_name: '',
        fanart_policy: null,
        created_at: new Date().toISOString(),
    };
}

export default function ExportPanel({ state, remainingCP = STARTING_CP, sheetRef }) {
    const cardRef = useRef(null);
    const rpCardRef = useRef(null);
    const [exporting, setExporting] = useState(null);
    const [textOpen, setTextOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const exportedText = textOpen ? buildExportText(state, remainingCP) : '';

    // Discordテキストコピー
    const handleCopyText = useCallback(async () => {
        const text = buildExportText(state, remainingCP);
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                // フォールバック：非対応ブラウザ用
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('クリップボードコピーエラー:', err);
            alert('コピーに失敗しました。テキストを手動でコピーしてください。');
            setTextOpen(true);
        }
    }, [state, remainingCP]);

    // PDF出力
    const handlePdf = useCallback(async () => {
        if (!sheetRef?.current) return;
        setExporting('pdf');
        try {
            // 動的インポートでバンドルサイズ削減
            const { exportPdf } = await import('../utils/exportPdf');
            await exportPdf(sheetRef.current, state.name || 'character');
        } catch (err) {
            console.error('PDF出力エラー:', err);
            alert('PDF出力に失敗しました');
        }
        setExporting(null);
    }, [sheetRef, state.name]);

    // PNG出力（フルシート）
    const handlePngFull = useCallback(async () => {
        if (!sheetRef?.current) return;
        setExporting('png-full');
        try {
            const { exportPng } = await import('../utils/exportPng');
            await exportPng(sheetRef.current, `${state.name || 'character'}_sheet`);
        } catch (err) {
            console.error('PNG出力エラー:', err);
            alert('PNG出力に失敗しました');
        }
        setExporting(null);
    }, [sheetRef, state.name]);

    // PNG出力（キャラカード）
    const handlePngCard = useCallback(async () => {
        if (!cardRef.current) return;
        setExporting('png-card');
        try {
            const { exportPng } = await import('../utils/exportPng');
            await exportPng(cardRef.current, `${state.name || 'character'}_card`);
        } catch (err) {
            console.error('キャラカードPNG出力エラー:', err);
            alert('キャラカード出力に失敗しました');
        }
        setExporting(null);
    }, [state.name]);

    // PNG出力（RP用IDカード）
    const handlePngRp = useCallback(async () => {
        if (!rpCardRef.current) return;
        setExporting('png-rp');
        try {
            const { exportPng } = await import('../utils/exportPng');
            await exportPng(rpCardRef.current, `${state.name || 'character'}_rpid`);
        } catch (err) {
            console.error('RP用IDカードPNG出力エラー:', err);
            alert('RP用IDカード出力に失敗しました');
        }
        setExporting(null);
    }, [state.name]);

    // 印刷
    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    return (
        <div className="sheet-section">
            <h3 className="sheet-section__title">
                <span className="sheet-section__icon">↓</span>
                エクスポート
                <span className="sheet-section__title-en">EXPORT</span>
            </h3>

            <div className="export-panel">
                <div className="export-panel__actions">
                    <button
                        className="export-panel__btn"
                        onClick={handlePdf}
                        disabled={!!exporting}
                    >
                        {exporting === 'pdf' ? '⏳ 生成中...' : '📄 PDF出力'}
                    </button>
                    <button
                        className="export-panel__btn"
                        onClick={handlePngFull}
                        disabled={!!exporting}
                    >
                        {exporting === 'png-full' ? '⏳ 生成中...' : '🖼 PNG出力（全体）'}
                    </button>
                    <button
                        className="export-panel__btn"
                        onClick={handlePngCard}
                        disabled={!!exporting}
                    >
                        {exporting === 'png-card' ? '⏳ 生成中...' : '🃏 キャラカード出力'}
                    </button>
                    <button
                        className="export-panel__btn"
                        onClick={handlePngRp}
                        disabled={!!exporting}
                    >
                        {exporting === 'png-rp' ? '⏳ 生成中...' : '🪪 RP用IDカード出力'}
                    </button>
                    <button
                        className="export-panel__btn"
                        onClick={handlePrint}
                        disabled={!!exporting}
                    >
                        🖨 印刷
                    </button>
                    <button
                        className="export-panel__btn"
                        onClick={handleCopyText}
                        disabled={!!exporting}
                        title="Discord/テキストチャット貼り付け用のプレーンテキストをクリップボードにコピー"
                    >
                        {copied ? '✓ コピー済み' : '💬 テキストコピー'}
                    </button>
                    <button
                        className="export-panel__btn"
                        onClick={() => setTextOpen(v => !v)}
                        disabled={!!exporting}
                    >
                        {textOpen ? '📄 テキスト閉じる' : '📄 テキスト表示'}
                    </button>
                </div>

                {textOpen && (
                    <div className="export-panel__text-preview">
                        <div className="export-panel__text-label">プレーンテキスト（選択してコピー可）</div>
                        <textarea
                            className="export-panel__textarea"
                            value={exportedText}
                            readOnly
                            rows={20}
                            onFocus={(e) => e.target.select()}
                        />
                    </div>
                )}

                {/* キャラカードプレビュー */}
                <div className="export-panel__card-preview">
                    <div className="export-panel__card-label">キャラカード プレビュー</div>
                    <div ref={cardRef}>
                        <CharacterCard state={state} />
                    </div>
                </div>

                {/* RP用IDカード（画面外に配置してキャプチャ用） */}
                <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                    <div ref={rpCardRef}>
                        <RpIdCard character={stateToRpCharacter(state)} />
                    </div>
                </div>
            </div>
        </div>
    );
}
