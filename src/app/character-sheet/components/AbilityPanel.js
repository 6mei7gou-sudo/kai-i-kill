'use client';

// 能力値パネル — 7属性のランク設定
// 各属性ごとにD〜Sのランクをセレクトボックスで設定

import { ABILITIES, RANKS, RANK_DATA } from '../data/masterData';

export default function AbilityPanel({ abilities, onSetAbility }) {
    return (
        <div className="sheet-section">
            <h3 className="sheet-section__title">
                <span className="sheet-section__icon">◈</span>
                能力値
                <span className="sheet-section__title-en">ABILITIES</span>
            </h3>
            <div className="ability-grid">
                {ABILITIES.map(ability => {
                    const rank = abilities[ability.id] || 'D';
                    const data = RANK_DATA[rank];
                    return (
                        <div key={ability.id} className="ability-card">
                            <div className="ability-card__header">
                                <span className="ability-card__name">{ability.name}</span>
                                <span className="ability-card__dice">{data.dice}d6</span>
                            </div>
                            <div className="ability-card__desc">{ability.desc}</div>
                            <select
                                className="ability-card__select"
                                value={rank}
                                onChange={e => onSetAbility(ability.id, e.target.value)}
                            >
                                {RANKS.map(r => (
                                    <option key={r} value={r}>{RANK_DATA[r].label}</option>
                                ))}
                            </select>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
