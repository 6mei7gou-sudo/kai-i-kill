'use client';

// 侵食率ゲージ — 0〜100% の視覚的なゲージ表示
import { EROSION_LABELS } from '../data/masterData';

// 現在の侵食段階を返す
function getErosionInfo(value) {
    let current = EROSION_LABELS[0];
    for (const label of EROSION_LABELS) {
        if (value >= label.threshold) current = label;
    }
    return current;
}

export default function ErosionGauge({ erosion, onSetErosion }) {
    const info = getErosionInfo(erosion);

    return (
        <div className="sheet-section">
            <h3 className="sheet-section__title">
                <span className="sheet-section__icon">▲</span>
                侵食率
                <span className="sheet-section__title-en">EROSION RATE</span>
            </h3>
            <div className={`erosion-panel ${info.cssClass}`}>
                <div className="erosion-panel__gauge-track">
                    <div
                        className="erosion-panel__gauge-fill"
                        style={{ width: `${erosion}%` }}
                    />
                </div>
                <div className="erosion-panel__info">
                    <span className="erosion-panel__value">{erosion}%</span>
                    <span className="erosion-panel__label">{info.label}</span>
                </div>
                <div className="erosion-panel__controls">
                    <button
                        className="erosion-panel__btn"
                        onClick={() => onSetErosion(erosion - 5)}
                        disabled={erosion <= 0}
                    >−5</button>
                    <button
                        className="erosion-panel__btn"
                        onClick={() => onSetErosion(erosion - 1)}
                        disabled={erosion <= 0}
                    >−1</button>
                    <input
                        className="erosion-panel__input"
                        type="number"
                        min="0"
                        max="100"
                        value={erosion}
                        onChange={e => onSetErosion(parseInt(e.target.value) || 0)}
                    />
                    <button
                        className="erosion-panel__btn"
                        onClick={() => onSetErosion(erosion + 1)}
                        disabled={erosion >= 100}
                    >+1</button>
                    <button
                        className="erosion-panel__btn"
                        onClick={() => onSetErosion(erosion + 5)}
                        disabled={erosion >= 100}
                    >+5</button>
                </div>
            </div>
        </div>
    );
}
