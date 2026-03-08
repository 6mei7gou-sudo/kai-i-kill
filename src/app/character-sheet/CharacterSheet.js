'use client';

// キャラクターシート — メインページ
// 全コンポーネントを組み合わせた統合画面

import { useRef } from 'react';
import { useCharacterState } from './hooks/useCharacterState';
import { AWAKENING_PATTERNS, AFFILIATIONS, BELIEFS } from './data/masterData';
import AbilityPanel from './components/AbilityPanel';
import EmotionMeter from './components/EmotionMeter';
import ErosionGauge from './components/ErosionGauge';
import DiceRoller from './components/DiceRoller';
import ExportPanel from './components/ExportPanel';
import SaveLoadPanel from './components/SaveLoadPanel';
import './character-sheet.css';

export default function CharacterSheetPage() {
    const {
        state,
        setField,
        setAbility,
        setEmotion,
        setErosion,
        addRoll,
        loadState,
        resetState,
        usedCP,
        remainingCP,
    } = useCharacterState();

    const sheetRef = useRef(null);

    return (
        <div className="character-sheet" ref={sheetRef}>
            <div className="character-sheet__header">
                <div className="character-sheet__header-label">PLAYER CHARACTER SHEET</div>
                <h1 className="character-sheet__title">キャラクターシート</h1>
                <div className="character-sheet__cp">
                    CP: <span className={remainingCP < 0 ? 'cp-over' : ''}>{remainingCP}</span> / 10
                    （使用: {usedCP}）
                </div>
            </div>

            {/* 基本情報 */}
            <div className="sheet-section">
                <h3 className="sheet-section__title">
                    <span className="sheet-section__icon">◆</span>
                    基本情報
                    <span className="sheet-section__title-en">PROFILE</span>
                </h3>
                <div className="profile-grid">
                    <div className="profile-field">
                        <label className="profile-field__label">キャラクター名</label>
                        <input
                            className="profile-field__input"
                            type="text"
                            value={state.name}
                            onChange={e => setField('name', e.target.value)}
                            placeholder="名前を入力"
                        />
                    </div>
                    <div className="profile-field">
                        <label className="profile-field__label">覚醒パターン</label>
                        <select
                            className="profile-field__select"
                            value={state.awakening}
                            onChange={e => setField('awakening', e.target.value)}
                        >
                            <option value="">選択してください</option>
                            {AWAKENING_PATTERNS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="profile-field">
                        <label className="profile-field__label">所属組織</label>
                        <select
                            className="profile-field__select"
                            value={state.affiliation}
                            onChange={e => setField('affiliation', e.target.value)}
                        >
                            <option value="">選択してください</option>
                            {AFFILIATIONS.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                    <div className="profile-field">
                        <label className="profile-field__label">信念</label>
                        <select
                            className="profile-field__select"
                            value={state.belief}
                            onChange={e => setField('belief', e.target.value)}
                        >
                            <option value="">選択してください</option>
                            {BELIEFS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div className="profile-field profile-field--wide">
                        <label className="profile-field__label">経歴・設定メモ</label>
                        <textarea
                            className="profile-field__textarea"
                            value={state.background}
                            onChange={e => setField('background', e.target.value)}
                            placeholder="キャラクターの経歴や設定を自由に記述"
                            rows={3}
                        />
                    </div>
                </div>
            </div>

            {/* 能力値 */}
            <AbilityPanel abilities={state.abilities} onSetAbility={setAbility} />

            {/* 感情メーター */}
            <EmotionMeter emotions={state.emotions} onSetEmotion={setEmotion} />

            {/* 侵食率 */}
            <ErosionGauge erosion={state.erosion} onSetErosion={setErosion} />

            {/* ダイスローラー */}
            <DiceRoller abilities={state.abilities} onAddRoll={addRoll} />

            {/* メモ */}
            <div className="sheet-section">
                <h3 className="sheet-section__title">
                    <span className="sheet-section__icon">✎</span>
                    セッションノート
                    <span className="sheet-section__title-en">SESSION NOTES</span>
                </h3>
                <textarea
                    className="profile-field__textarea profile-field__textarea--tall"
                    value={state.notes}
                    onChange={e => setField('notes', e.target.value)}
                    placeholder="セッション中のメモを記録"
                    rows={5}
                />
            </div>

            {/* エクスポート（PDF/PNG/印刷） */}
            <ExportPanel state={state} sheetRef={sheetRef} />

            {/* 保存/読込 */}
            <SaveLoadPanel state={state} onLoad={loadState} onReset={resetState} />
        </div>
    );
}
