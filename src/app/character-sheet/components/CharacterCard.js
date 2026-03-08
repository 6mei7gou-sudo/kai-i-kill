'use client';

// SNS共有用キャラカード — OGPサイズ（1200x630相当）のコンパクトカード
// PNGエクスポート時にこのコンポーネントをキャプチャする

import { ABILITIES, RANK_DATA, EMOTIONS, EROSION_LABELS } from '../data/masterData';

function getErosionLabel(value) {
    let current = EROSION_LABELS[0];
    for (const label of EROSION_LABELS) {
        if (value >= label.threshold) current = label;
    }
    return current;
}

export default function CharacterCard({ state }) {
    const erosionInfo = getErosionLabel(state.erosion);

    return (
        <div className="char-card" id="character-card-export">
            {/* 左側：キャラ情報 */}
            <div className="char-card__left">
                <div className="char-card__system">KAI-I//KILL</div>
                <div className="char-card__name">{state.name || '名無しの討伐者'}</div>
                <div className="char-card__meta">
                    {state.affiliation && <span>{state.affiliation}</span>}
                    {state.awakening && <span> / {state.awakening}</span>}
                </div>
                {state.belief && (
                    <div className="char-card__belief">「{state.belief}」</div>
                )}
                {/* 侵食率 */}
                <div className={`char-card__erosion ${erosionInfo.cssClass}`}>
                    <span className="char-card__erosion-label">侵食率</span>
                    <span className="char-card__erosion-value">{state.erosion}%</span>
                    <span className="char-card__erosion-status">{erosionInfo.label}</span>
                </div>
            </div>

            {/* 右側：ステータスグリッド */}
            <div className="char-card__right">
                <div className="char-card__abilities">
                    {ABILITIES.map(a => {
                        const rank = state.abilities[a.id] || 'D';
                        return (
                            <div key={a.id} className="char-card__ability">
                                <span className="char-card__ability-name">{a.name}</span>
                                <span className="char-card__ability-rank">{rank}</span>
                                <span className="char-card__ability-dice">{RANK_DATA[rank].dice}d6</span>
                            </div>
                        );
                    })}
                </div>

                {/* 共鳴記録バー（コンパクト版） */}
                <div className="char-card__emotions">
                    {EMOTIONS.map(emo => (
                        <div key={emo.id} className="char-card__emo-bar" title={emo.name}>
                            <div
                                className="char-card__emo-fill"
                                style={{
                                    width: `${(state.emotions[emo.id] || 0) * 10}%`,
                                    backgroundColor: emo.color,
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
