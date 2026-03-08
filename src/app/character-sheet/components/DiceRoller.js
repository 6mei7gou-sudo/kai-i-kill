'use client';

// ダイスローラー — ランク制ダイスプール判定
import { useState } from 'react';
import { ABILITIES, RANK_DATA, JUDGMENT_RESULTS } from '../data/masterData';

// n個のd6を振り、最大値を達成値として返す
function rollDicePool(diceCount) {
    const results = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
    const achievement = Math.max(...results);
    return { results, achievement };
}

export default function DiceRoller({ abilities, onAddRoll }) {
    const [selectedAbility, setSelectedAbility] = useState(ABILITIES[0].id);
    const [lastRoll, setLastRoll] = useState(null);

    const handleRoll = () => {
        const rank = abilities[selectedAbility] || 'D';
        const diceCount = RANK_DATA[rank].dice;
        const { results, achievement } = rollDicePool(diceCount);
        const judgment = JUDGMENT_RESULTS[achievement];
        const ability = ABILITIES.find(a => a.id === selectedAbility);

        const roll = {
            ability: ability.name,
            rank,
            diceCount,
            results,
            achievement,
            judgment: judgment.label,
            icon: judgment.icon,
            cssClass: judgment.cssClass,
            timestamp: new Date().toLocaleTimeString('ja-JP'),
        };

        setLastRoll(roll);
        onAddRoll(roll);
    };

    return (
        <div className="sheet-section">
            <h3 className="sheet-section__title">
                <span className="sheet-section__icon">⚄</span>
                ダイス判定
                <span className="sheet-section__title-en">DICE ROLL</span>
            </h3>
            <div className="dice-roller">
                <div className="dice-roller__controls">
                    <select
                        className="dice-roller__select"
                        value={selectedAbility}
                        onChange={e => setSelectedAbility(e.target.value)}
                    >
                        {ABILITIES.map(a => (
                            <option key={a.id} value={a.id}>
                                {a.name}（{RANK_DATA[abilities[a.id] || 'D'].label}）
                            </option>
                        ))}
                    </select>
                    <button className="dice-roller__btn" onClick={handleRoll}>
                        ▶ ロール
                    </button>
                </div>

                {lastRoll && (
                    <div className={`dice-roller__result ${lastRoll.cssClass}`}>
                        <div className="dice-roller__result-header">
                            <span className="dice-roller__result-icon">{lastRoll.icon}</span>
                            <span className="dice-roller__result-label">{lastRoll.judgment}</span>
                        </div>
                        <div className="dice-roller__result-detail">
                            {lastRoll.ability}（{lastRoll.rank}）→ [{lastRoll.results.join(', ')}] → 達成値: {lastRoll.achievement}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
