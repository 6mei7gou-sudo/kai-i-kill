'use client';

// ステータス付きキャラクターシート（B4縦 1480×2106px）
// CharacterForm の form データを受け取り、全ステータスを描画
// html2canvas キャプチャ用・全値 px 固定

import { forwardRef } from 'react';
import './FullCharacterSheet.css';

const AFF_COLORS = {
    '祓部': '#d4af37',
    '傭兵': '#3a6ea5',
    '無所属': '#7a7a8a',
};

const ABILITIES = [
    { key: 'rank_tai',   name: '体', reading: 'たい' },
    { key: 'rank_haya',  name: '疾', reading: 'はや' },
    { key: 'rank_shiki', name: '識', reading: 'しき' },
    { key: 'rank_han',   name: '判', reading: 'はん' },
    { key: 'rank_shiya', name: '察', reading: 'さつ' },
    { key: 'rank_jutsu', name: '術', reading: 'じゅつ' },
    { key: 'rank_kon',   name: '魂', reading: 'こん' },
];

const RANK_DICE = { D: 1, C: 2, B: 3, A: 4, S: 4 };

function rankDisplay(rank, hasPlus) {
    if (!rank) return 'D';
    if (rank === 'S') return 'S';
    return hasPlus ? `${rank}+` : rank;
}

function rankDiceText(rank) {
    const n = RANK_DICE[rank] || 1;
    return rank === 'S' ? `${n}d6+特典` : `${n}d6`;
}

const FullCharacterSheet = forwardRef(function FullCharacterSheet({ form }, ref) {
    const f = form || {};
    const affColor = AFF_COLORS[f.affiliation] || '#7a7a8a';
    const portrait = f.thumbnail_url || f.image_url;
    const stagePlus = Array.isArray(f.stage_plus) ? f.stage_plus : [];
    const skills = Array.isArray(f.skills) ? f.skills : [];
    const profLangs = Array.isArray(f.proficient_languages) ? f.proficient_languages : [];
    const weakLangs = Array.isArray(f.weak_languages) ? f.weak_languages : [];
    const cybernetics = Array.isArray(f.cybernetics) ? f.cybernetics.filter(c => c && c.name) : [];
    const equipOpts = Array.isArray(f.equipment_options) ? f.equipment_options : [];

    return (
        <div className="fcs" ref={ref}>
            {/* 左辺所属色ライン */}
            <div className="fcs__accent" style={{ background: affColor }} />

            {/* ヘッダー */}
            <div className="fcs__top">
                <div className="fcs__title-row">
                    <span className="fcs__brand">KAI-I//KILL</span>
                    <span className="fcs__brand-sub" style={{ color: affColor }}>CHARACTER SHEET · LV{f.level || 1}</span>
                </div>
            </div>

            {/* プロフィールブロック */}
            <div className="fcs__profile">
                <div className="fcs__portrait" style={{ borderColor: `${affColor}66` }}>
                    {portrait ? (
                        <img src={portrait} alt="" crossOrigin="anonymous" />
                    ) : (
                        <div className="fcs__portrait-ph" style={{ color: affColor }}>?</div>
                    )}
                </div>
                <div className="fcs__profile-text">
                    <div className="fcs__name">{f.character_name || '名無しの討伐者'}</div>
                    {f.title && <div className="fcs__title-text" style={{ color: affColor }}>《{f.title}》</div>}
                    <div className="fcs__affil-row">
                        {f.affiliation && (
                            <span className="fcs__badge" style={{ color: affColor, borderColor: `${affColor}66`, background: `${affColor}14` }}>
                                {f.affiliation}
                            </span>
                        )}
                        {f.sub_affiliation && <span className="fcs__sub">{f.sub_affiliation}</span>}
                    </div>
                    <div className="fcs__profile-grid">
                        <Field label="年齢"    value={f.age} />
                        <Field label="性別"    value={f.gender} />
                        <Field label="覚醒"    value={f.awakening} />
                        <Field label="背景"    value={f.background} />
                        <Field label="戦闘流派" value={f.weapon_type} />
                        <Field label="信念"    value={f.belief_points ? `${f.belief_points}点` : ''} />
                    </div>
                </div>
            </div>

            {/* 能力値 */}
            <Section title="能力値" titleEn="ABILITIES" accent={affColor}>
                <div className="fcs__abilities">
                    {ABILITIES.map(a => {
                        const rank = f[a.key] || 'D';
                        const hasPlus = stagePlus.includes(a.key);
                        return (
                            <div key={a.key} className="fcs__ability">
                                <div className="fcs__ability-name">{a.name}</div>
                                <div className="fcs__ability-reading">{a.reading}</div>
                                <div className="fcs__ability-rank">{rankDisplay(rank, hasPlus)}</div>
                                <div className="fcs__ability-dice">{rankDiceText(rank)}</div>
                            </div>
                        );
                    })}
                </div>
            </Section>

            {/* スキル */}
            <Section title="スキル" titleEn="SKILLS" accent={affColor}>
                {skills.length > 0 ? (
                    <ul className="fcs__skills">
                        {skills.map((s, i) => <li key={i} className="fcs__skill">{s}</li>)}
                    </ul>
                ) : (
                    <div className="fcs__empty">未選択</div>
                )}
            </Section>

            {/* 装備 */}
            <Section title="装備" titleEn="EQUIPMENT" accent={affColor}>
                <div className="fcs__equip-grid">
                    <Field label="形態" value={f.equipment_type} />
                    <Field label="装備名" value={f.equipment_name || f.custom_equipment_name} />
                    <Field label="メーカー" value={f.equipment_maker} />
                </div>
                {f.equipment_detail && (
                    <div className="fcs__equip-detail">{f.equipment_detail}</div>
                )}
                {equipOpts.length > 0 && (
                    <div className="fcs__equip-opts">
                        <span className="fcs__label">カスタム</span>
                        <span>{equipOpts.join('、')}</span>
                    </div>
                )}
            </Section>

            {/* サイバネティクス */}
            {(f.cyber_grade && f.cyber_grade !== 'none') && (
                <Section title="サイバネティクス" titleEn="CYBERNETICS" accent={affColor}>
                    <div className="fcs__cyber-grade">
                        <span className="fcs__label">等級</span>
                        <span>{f.cyber_grade}</span>
                    </div>
                    {cybernetics.length > 0 && (
                        <ul className="fcs__cyber-list">
                            {cybernetics.map((c, i) => (
                                <li key={i}>{c.name}{c.part ? `（${c.part}）` : ''}</li>
                            ))}
                        </ul>
                    )}
                </Section>
            )}

            {/* ギフト・魔法言語 */}
            <Section title="ギフト・魔法言語" titleEn="GIFT & LANGUAGES" accent={affColor}>
                {f.gift && (
                    <div className="fcs__gift">
                        <span className="fcs__label">ギフト</span>
                        <span>{f.gift}</span>
                    </div>
                )}
                <div className="fcs__lang-row">
                    <div className="fcs__lang">
                        <span className="fcs__label">得意</span>
                        <span>{profLangs.length > 0 ? profLangs.join('、') : '—'}</span>
                    </div>
                    <div className="fcs__lang">
                        <span className="fcs__label">苦手</span>
                        <span>{weakLangs.length > 0 ? weakLangs.join('、') : '—'}</span>
                    </div>
                </div>
            </Section>

            {/* 宿命・経歴 */}
            {(f.fate || f.brief_history) && (
                <Section title="宿命・経歴" titleEn="FATE & HISTORY" accent={affColor}>
                    {f.fate && (
                        <div className="fcs__fate">
                            <span className="fcs__label">宿命</span>
                            <span>{f.fate}</span>
                        </div>
                    )}
                    {f.brief_history && (
                        <div className="fcs__history">
                            <div className="fcs__label">経歴</div>
                            <div className="fcs__history-text">{f.brief_history}</div>
                        </div>
                    )}
                </Section>
            )}

            {/* フッター */}
            <div className="fcs__footer">
                <span>電脳怪異譚 KAI-I//KILL</span>
                <span>{f.author_name || ''}</span>
            </div>
        </div>
    );
});

// 小物コンポーネント
function Field({ label, value }) {
    return (
        <div className="fcs__field">
            <span className="fcs__label">{label}</span>
            <span className="fcs__value">{value || '—'}</span>
        </div>
    );
}

function Section({ title, titleEn, accent, children }) {
    return (
        <div className="fcs__section">
            <div className="fcs__section-head">
                <span className="fcs__section-title">{title}</span>
                <span className="fcs__section-en" style={{ color: accent }}>{titleEn}</span>
                <span className="fcs__section-line" style={{ background: `${accent}33` }} />
            </div>
            <div className="fcs__section-body">{children}</div>
        </div>
    );
}

export default FullCharacterSheet;
