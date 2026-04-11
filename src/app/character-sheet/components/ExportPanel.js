'use client';

// エクスポートパネル — PDF / PNG / 印刷 の出力ボタン群
import { useRef, useCallback, useState } from 'react';
import CharacterCard from './CharacterCard';
import RpIdCard from '@/components/RpIdCard';

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

export default function ExportPanel({ state, sheetRef }) {
    const cardRef = useRef(null);
    const rpCardRef = useRef(null);
    const [exporting, setExporting] = useState(null);

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
                </div>

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
