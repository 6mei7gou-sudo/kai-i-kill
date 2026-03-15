// 討伐者資格証 — キャラデータを1200×630pxのカードとして描画するコンポーネント
// html2canvas でキャプチャしてPNG出力する前提のため、全サイズをpx固定で指定
'use client';

import { forwardRef } from 'react';
import './HunterLicense.css';

// ===== 定数 =====

const AFF_COLORS = {
    '祓部': '#d4af37',
    '傭兵': '#3a6ea5',
    '無所属': '#7a7a8a',
};

const RANK_COLORS = {
    D: '#555566', C: '#88aacc', B: '#d4af37', A: '#ffcc00', S: '#ff4444',
};

const RANK_FILL = { D: 20, C: 40, B: 60, A: 80, S: 100 };

const ABILITIES = [
    { key: 'rank_tai', name: '体' },
    { key: 'rank_haya', name: '疾' },
    { key: 'rank_shiki', name: '識' },
    { key: 'rank_han', name: '判' },
    { key: 'rank_shiya', name: '察' },
    { key: 'rank_jutsu', name: '術' },
    { key: 'rank_kon', name: '魂' },
];

const LANG_MAP = {
    'Igniscript': { abbr: 'IGN', color: '#ff4444' },
    'Lupis Surf': { abbr: 'LPS', color: '#3070c0' },
    'Ivyo':       { abbr: 'IVY', color: '#30a050' },
    'NGT':        { abbr: 'NGT', color: '#c0a030' },
    'Monyx':      { abbr: 'MNX', color: '#b0b0c0' },
    'P:':         { abbr: 'P:',  color: '#7030a0' },
    "P'":         { abbr: "P'",  color: '#c06088' },
};

const STATUS_BADGE = {
    pending:  { label: 'TMP', color: '#555566' },
    approved: { label: '公認', color: null },
    rejected: { label: '却下', color: '#c04050' },
};

// ===== ヘルパー =====

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function hasStage(stagePlus, key) {
    if (!Array.isArray(stagePlus)) return false;
    return stagePlus.includes(key);
}

// ===== コンポーネント =====

const HunterLicense = forwardRef(function HunterLicense({ character: c }, ref) {
    const affColor = AFF_COLORS[c.affiliation] || '#7a7a8a';
    const affAlpha = affColor + '26'; // 15% alpha
    const titleText = c.active_title || c.title;
    const statusInfo = STATUS_BADGE[c.approved_status] || STATUS_BADGE.pending;
    const statusColor = statusInfo.color || affColor;
    const portrait = c.thumbnail_url || c.image_url;
    const proficient = Array.isArray(c.proficient_languages) ? c.proficient_languages : [];
    const weak = Array.isArray(c.weak_languages) ? c.weak_languages : [];
    const stagePlus = Array.isArray(c.stage_plus) ? c.stage_plus : (typeof c.stage_plus === 'string' ? JSON.parse(c.stage_plus || '[]') : []);

    return (
        <div className="hunter-license" ref={ref}>
            {/* 左辺グロー */}
            <div className="hunter-license__glow" style={{ background: `linear-gradient(to right, ${affAlpha}, transparent)` }} />
            {/* 左辺ライン */}
            <div className="hunter-license__left-line" style={{ background: affColor }} />

            {/* HEADER */}
            <div className="hl-header">
                <span className="hl-header__left">電脳怪異譚 KAI-I//KILL</span>
                <span className="hl-header__right" style={{ color: affColor }}>討伐者資格証 / HUNTER LICENSE</span>
                <div className="hl-header__accent" style={{ background: affColor }} />
            </div>

            {/* PORTRAIT */}
            <div className="hl-portrait" style={{ border: `1px solid ${affColor}33` }}>
                {portrait ? (
                    <img src={portrait} alt="" crossOrigin="anonymous" />
                ) : (
                    <div className="hl-portrait__placeholder" style={{ color: affColor }}>?</div>
                )}
            </div>

            {/* ID / META */}
            <div className="hl-id-meta">
                <div className="hl-id-meta__label">// ID</div>
                <div className="hl-id-meta__value" style={{ color: affColor }}>
                    CHAR-{(c.id || '').substring(0, 8)}
                </div>
                <div className="hl-id-meta__label">// STATUS</div>
                <div className="hl-id-meta__info">{c.age || '不明'} / {c.gender || '不明'}</div>
                <div className="hl-id-meta__label" style={{ marginTop: 8 }}>// AUTHOR</div>
                <div className="hl-id-meta__author">{c.author_name || '@unknown'}</div>
            </div>

            {/* NAME BLOCK */}
            <div className="hl-name">
                <div className="hl-name__row1">
                    <span className="hl-name__bar" style={{ background: affColor }} />
                    <span className="hl-name__char-name">{c.character_name || '名無しの討伐者'}</span>
                    {titleText && (
                        <span className="hl-name__title" style={{ color: affColor }}>《{titleText}》</span>
                    )}
                </div>
                <div className="hl-name__row2">
                    <span className="hl-name__badge" style={{ color: affColor, background: affAlpha, border: `1px solid ${affColor}40` }}>
                        {c.affiliation || '不明'}
                    </span>
                    {c.sub_affiliation && <span className="hl-name__sub">{c.sub_affiliation}</span>}
                    {c.awakening && <span className="hl-name__awakening">{c.awakening}</span>}
                </div>
            </div>

            {/* ABILITY BLOCK */}
            <div className="hl-abilities">
                <div className="hl-abilities__label" style={{ color: affColor }}>// ABILITIES</div>
                <div className="hl-abilities__grid">
                    {ABILITIES.map(a => {
                        const rank = c[a.key] || 'D';
                        const color = RANK_COLORS[rank] || RANK_COLORS.D;
                        const fill = RANK_FILL[rank] || 20;
                        const plus = hasStage(stagePlus, a.key);
                        return (
                            <div className="hl-ability" key={a.key}>
                                <div className="hl-ability__name">{a.name}</div>
                                <div className="hl-ability__rank" style={{ color }}>
                                    {rank}
                                    {plus && <span className="hl-ability__plus" style={{ color: affColor }}>+</span>}
                                </div>
                                <div className="hl-ability__bar">
                                    <div className="hl-ability__bar-fill" style={{ width: `${fill}%`, background: color }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* DATA BLOCK */}
            <div className="hl-data">
                <div className="hl-data__label-row" style={{ color: affColor }}>// CHARACTER DATA</div>
                <div className="hl-data__grid">
                    {/* 行1 */}
                    <DataItem label="背景" value={c.background || '—'} />
                    <DataItem label="武器型" value={c.weapon_type || '—'} />
                    {/* 行2 */}
                    <DataItem label="ギフト" value={c.gift || '—'} />
                    <DataItem label="装備" value={c.equipment_name || '未装備'} />
                    {/* 行3 */}
                    <div>
                        <div className="hl-data-item__label">魔法言語</div>
                        <div className="hl-data-item__value">
                            {proficient.length > 0 ? proficient.map(lang => {
                                const info = LANG_MAP[lang];
                                return info ? (
                                    <span key={lang} className="hl-lang" style={{ color: info.color }}>{info.abbr}</span>
                                ) : (
                                    <span key={lang} className="hl-lang" style={{ color: '#9a9a9a' }}>{lang}</span>
                                );
                            }) : <span style={{ color: '#555566' }}>—</span>}
                            {weak.map(lang => {
                                const info = LANG_MAP[lang];
                                return info ? (
                                    <span key={lang} className="hl-lang hl-lang--weak" style={{ color: info.color }}>{info.abbr}</span>
                                ) : null;
                            })}
                        </div>
                    </div>
                    <div>
                        <div className="hl-data-item__label">信念 / サイバネ</div>
                        <div className="hl-data-item__value" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span>
                                {Array.from({ length: 10 }, (_, i) => (
                                    <span key={i} className={`hl-belief-dot ${i < (c.belief_points || 5) ? 'hl-belief-dot--active' : 'hl-belief-dot--empty'}`}
                                        style={i < (c.belief_points || 5) ? { background: affColor } : undefined}
                                    />
                                ))}
                            </span>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#9a9a9a' }}>
                                {c.cyber_grade && c.cyber_grade !== 'none' ? `等級${c.cyber_grade}` : 'サイバネなし'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div className="hl-footer">
                <span>ISSUED: {formatDate(c.created_at)}</span>
                <span>
                    STATUS:
                    <span className="hl-footer__status" style={{ color: statusColor, background: statusColor + '1a', border: `1px solid ${statusColor}40` }}>
                        {statusInfo.label}
                    </span>
                    <span style={{ marginLeft: 16 }}>BETA 0.1.0</span>
                </span>
            </div>
        </div>
    );
});

function DataItem({ label, value }) {
    return (
        <div>
            <div className="hl-data-item__label">{label}</div>
            <div className="hl-data-item__value">{value}</div>
        </div>
    );
}

export default HunterLicense;
