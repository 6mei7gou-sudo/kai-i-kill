'use client';

// 共鳴記録メーター — 6感情の値を0〜10で管理
import { EMOTIONS } from '../data/masterData';

export default function EmotionMeter({ emotions, onSetEmotion }) {
    return (
        <div className="sheet-section">
            <h3 className="sheet-section__title">
                <span className="sheet-section__icon">◉</span>
                共鳴記録
                <span className="sheet-section__title-en">RESONANCE RECORD</span>
            </h3>
            <div className="emotion-grid">
                {EMOTIONS.map(emo => {
                    const value = emotions[emo.id] || 0;
                    return (
                        <div key={emo.id} className="emotion-card">
                            <div className="emotion-card__label" style={{ color: emo.color }}>
                                {emo.name}
                            </div>
                            <div className="emotion-card__bar-track">
                                <div
                                    className="emotion-card__bar-fill"
                                    style={{ width: `${value * 10}%`, backgroundColor: emo.color }}
                                />
                            </div>
                            <div className="emotion-card__controls">
                                <button
                                    className="emotion-card__btn"
                                    onClick={() => onSetEmotion(emo.id, value - 1)}
                                    disabled={value <= 0}
                                >−</button>
                                <span className="emotion-card__value">{value}</span>
                                <button
                                    className="emotion-card__btn"
                                    onClick={() => onSetEmotion(emo.id, value + 1)}
                                    disabled={value >= 10}
                                >+</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
