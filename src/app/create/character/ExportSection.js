// 出力セクション — 投稿前でも使える。RPシート PNG / 名刺カード PNG / RP用IDカード PNG / ステータスシート PNG / テキスト
'use client';

import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import CharacterCard from '@/components/CharacterCard';
import RpIdCard from '@/components/RpIdCard';
import RpCharacterSheet from '@/components/RpCharacterSheet';
import FullCharacterSheet from '@/components/FullCharacterSheet';
import { exportAsImage } from '@/lib/exportImage';
import { ABILITIES } from '@/data/characterBuildData';
import { buildPlainText, calcBeliefPoints } from '@/lib/characterBuild';
import { FormSection } from './formStyles';

/** 固定幅コンポーネントを親幅に合わせて縮小表示する */
function ScaledPreview({ width, children }) {
    const outerRef = useRef(null);
    const innerRef = useRef(null);
    const [scale, setScale] = useState(0.4);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        const outer = outerRef.current;
        const inner = innerRef.current;
        if (!outer || !inner || typeof ResizeObserver === 'undefined') return;
        const update = () => {
            const s = Math.min(1, outer.clientWidth / width);
            setScale(s);
            setHeight(inner.offsetHeight * s);
        };
        update();
        const ro = new ResizeObserver(update);
        ro.observe(outer);
        ro.observe(inner);
        return () => ro.disconnect();
    }, [width]);

    return (
        <div ref={outerRef} style={{ width: '100%', height: height || undefined, overflow: 'hidden', position: 'relative' }}>
            <div ref={innerRef} style={{ width, transformOrigin: 'top left', transform: `scale(${scale})`, position: 'absolute', top: 0, left: 0 }}>
                {children}
            </div>
        </div>
    );
}

export default function ExportSection({ form, gameEnabled, ranks, innateChoice }) {
    const rpSheetRef = useRef(null);
    const charCardRef = useRef(null);
    const rpCardRef = useRef(null);
    const fullSheetRef = useRef(null);
    const [exporting, setExporting] = useState(null);
    const [textCopied, setTextCopied] = useState(false);
    const [preview, setPreview] = useState('rp');

    // 各カード／シートが期待する形（character_sheets の行）に揃える
    const character = useMemo(() => {
        const rankCols = {};
        ABILITIES.forEach(a => { rankCols[a.key] = ranks?.[a.key]?.rank || 'D'; });
        return {
            ...form,
            ...rankCols,
            id: form.character_name || 'draft',
            image_url: form.image_url || form.thumbnail_url || '',
            thumbnail_url: form.thumbnail_url || form.image_url || '',
            active_title: form.title || '',
            approved_status: 'pending',
            belief_points: calcBeliefPoints(form.awakening),
            created_at: new Date().toISOString(),
            // ゲームデータOFFなら戦闘系の列をシートから外す
            ...(gameEnabled ? {} : { background: '', weapon_type: '', gift: '', skills: [], stage_plus: [], proficient_languages: [], weak_languages: [] }),
        };
    }, [form, ranks, gameEnabled]);

    const fileBaseName = (form.character_name || 'character').replace(/[^\w\u3040-\u30ff\u4e00-\u9fff-]/g, '_');

    const doExport = useCallback(async (key, ref, suffix, size) => {
        if (!ref.current) return;
        setExporting(key);
        try {
            await exportAsImage(ref.current, `${fileBaseName}_${suffix}`, size);
        } catch (err) {
            console.error('画像出力エラー:', err);
            alert('画像出力に失敗しました');
        }
        setExporting(null);
    }, [fileBaseName]);

    const handleCopyText = useCallback(async () => {
        const text = buildPlainText(form, { gameEnabled, innateChoice });
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                const ta = document.createElement('textarea');
                ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
                document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
            }
            setTextCopied(true);
            setTimeout(() => setTextCopied(false), 2000);
        } catch (err) {
            console.error('クリップボードコピーエラー:', err);
            alert('コピーに失敗しました');
        }
    }, [form, gameEnabled, innateChoice]);

    const btnStyle = (primary) => ({
        padding: '10px 18px',
        background: primary ? 'rgba(212,175,55,0.1)' : 'rgba(255, 255, 255, 0.04)',
        border: primary ? '1px solid var(--accent-gold-border)' : '1px solid rgba(255, 255, 255, 0.15)',
        color: primary ? 'var(--accent-gold)' : 'var(--text-primary)',
        fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', cursor: 'pointer',
    });
    const tabStyle = (on) => ({
        padding: '6px 14px', fontFamily: 'var(--font-mono)', fontSize: '11px', cursor: 'pointer',
        background: on ? 'rgba(212,175,55,0.12)' : 'transparent',
        border: on ? '1px solid var(--accent-gold-border)' : '1px solid rgba(255,255,255,0.08)',
        color: on ? 'var(--accent-gold)' : 'var(--text-muted)',
    });

    const previews = [
        { key: 'rp', label: 'RPシート', width: 1480 },
        { key: 'card', label: '名刺カード', width: 910 },
        { key: 'id', label: 'IDカード', width: 1200 },
        ...(gameEnabled ? [{ key: 'full', label: 'ステータスシート', width: 1480 }] : []),
    ];

    return (
        <FormSection id="export" en="EXPORT" title="出力"
            effect="投稿前でも使える。RPシートは戦闘数値を含まない大判シート。Discord等にはテキストコピーが便利。">
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
                <button type="button" style={btnStyle(true)} disabled={!!exporting} onClick={() => doExport('rp', rpSheetRef, 'rpsheet', { width: 1480 })}>
                    {exporting === 'rp' ? '⏳ 生成中...' : '📜 RPシート PNG'}
                </button>
                <button type="button" style={btnStyle()} disabled={!!exporting} onClick={() => doExport('card', charCardRef, 'card', { width: 910, height: 550 })}>
                    {exporting === 'card' ? '⏳ 生成中...' : '🃏 名刺カード PNG'}
                </button>
                <button type="button" style={btnStyle()} disabled={!!exporting} onClick={() => doExport('id', rpCardRef, 'rpid', { width: 1200, height: 630 })}>
                    {exporting === 'id' ? '⏳ 生成中...' : '🪪 RP用IDカード PNG'}
                </button>
                {gameEnabled && (
                    <button type="button" style={btnStyle()} disabled={!!exporting} onClick={() => doExport('full', fullSheetRef, 'sheet', { width: 1480, height: 2106 })}>
                        {exporting === 'full' ? '⏳ 生成中...' : '📊 ステータスシート PNG'}
                    </button>
                )}
                <button type="button" style={btnStyle()} disabled={!!exporting} onClick={handleCopyText}>
                    {textCopied ? '✓ コピー済み' : '💬 テキストコピー'}
                </button>
            </div>

            {/* プレビュー切替 */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                {previews.map(p => (
                    <button key={p.key} type="button" style={tabStyle(preview === p.key)} onClick={() => setPreview(p.key)}>{p.label}</button>
                ))}
            </div>
            <div style={{ border: 'var(--border-subtle)', background: 'rgba(0,0,0,0.3)', padding: '8px' }}>
                {preview === 'rp' && <ScaledPreview width={1480}><RpCharacterSheet character={character} /></ScaledPreview>}
                {preview === 'card' && <ScaledPreview width={910}><CharacterCard character={character} /></ScaledPreview>}
                {preview === 'id' && <ScaledPreview width={1200}><RpIdCard character={character} /></ScaledPreview>}
                {preview === 'full' && gameEnabled && <ScaledPreview width={1480}><FullCharacterSheet form={character} /></ScaledPreview>}
            </div>

            {/* キャプチャ用（画面外・原寸） */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }} aria-hidden="true">
                <div ref={rpSheetRef}><RpCharacterSheet character={character} /></div>
                <div ref={charCardRef}><CharacterCard character={character} /></div>
                <div ref={rpCardRef}><RpIdCard character={character} /></div>
                {gameEnabled && <div ref={fullSheetRef}><FullCharacterSheet form={character} /></div>}
            </div>
        </FormSection>
    );
}
