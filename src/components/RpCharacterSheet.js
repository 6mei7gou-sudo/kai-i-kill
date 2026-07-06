'use client';

// RP用キャラクターシート（幅1480px固定・高さ可変、最低B4縦）
// 戦闘数値を一切載せず、ロールプレイに必要な情報だけをまとめた大判シート
// html2canvas キャプチャ用・全値 px 固定。長文で切れないよう高さは内容に追従する
// prop は character（character_sheets の行をそのまま渡す）

import { forwardRef } from 'react';
import './RpCharacterSheet.css';

const AFF_COLORS = {
    '祓部': '#d4af37',
    '傭兵': '#3a6ea5',
    '無所属': '#7a7a8a',
};

const FA_ITEMS = [
    { key: 'coupling', label: 'カプ' },
    { key: 'bl', label: 'BL' },
    { key: 'gl', label: 'GL' },
    { key: 'nl', label: 'NL' },
    { key: 'yume', label: '夢' },
    { key: 'commission', label: '依頼' },
    { key: 'body_change', label: '身体変更' },
    { key: 'gender_swap', label: '性転換' },
    { key: 'hairstyle_change', label: '髪型' },
    { key: 'costume_change', label: '衣装' },
    { key: 'parody', label: 'パロ' },
    { key: 'mild_sexual', label: '性(軽)' },
    { key: 'mild_violence', label: '暴力(軽)' },
    { key: 'r18', label: 'R18' },
    { key: 'r18g', label: 'R18G' },
];
const FA_COLOR = { ok: '#00ffaa', ask: '#ffaa00', ng: '#ff4d4d' };
const FA_LABEL = { ok: 'OK', ask: '要相談', ng: 'NG' };

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const RpCharacterSheet = forwardRef(function RpCharacterSheet({ character: c }, ref) {
    const affColor = AFF_COLORS[c.affiliation] || '#7a7a8a';
    const portrait = c.thumbnail_url || c.image_url;
    const titleText = c.active_title || c.title;
    const profLangs = Array.isArray(c.proficient_languages) ? c.proficient_languages : [];
    const weakLangs = Array.isArray(c.weak_languages) ? c.weak_languages : [];
    const hasProfile = c.appearance || c.personality || c.speech_style;
    const hasStory = c.brief_history || c.fate || c.backstory;
    const hasSocial = c.social_x || c.social_vrc || c.social_url;

    return (
        <div className="rps" ref={ref}>
            {/* 左辺所属色ライン */}
            <div className="rps__accent" style={{ background: affColor }} />

            {/* ヘッダー */}
            <div className="rps__top">
                <span className="rps__brand">電脳怪異譚 KAI-I//KILL</span>
                <span className="rps__brand-sub" style={{ color: affColor }}>RP CHARACTER SHEET</span>
            </div>

            {/* プロフィールブロック */}
            <div className="rps__profile">
                <div className="rps__portrait" style={{ borderColor: `${affColor}66` }}>
                    {portrait ? (
                        <img src={portrait} alt="" crossOrigin="anonymous" />
                    ) : (
                        <div className="rps__portrait-ph" style={{ color: affColor }}>?</div>
                    )}
                </div>
                <div className="rps__profile-text">
                    {c.character_name_kana && <div className="rps__kana">{c.character_name_kana}</div>}
                    <div className="rps__name">{c.character_name || '名無しの討伐者'}</div>
                    {titleText && <div className="rps__title-text" style={{ color: affColor }}>《{titleText}》</div>}
                    <div className="rps__affil-row">
                        {c.affiliation && (
                            <span className="rps__badge" style={{ color: affColor, borderColor: `${affColor}66`, background: `${affColor}14` }}>
                                {c.affiliation}
                            </span>
                        )}
                        {c.sub_affiliation && <span className="rps__sub">{c.sub_affiliation}</span>}
                    </div>
                    <div className="rps__profile-grid">
                        <Field label="年齢" value={c.age} />
                        <Field label="性別" value={c.gender} />
                        <Field label="背景" value={c.background} />
                        <Field label="覚醒" value={c.awakening} />
                    </div>
                </div>
            </div>

            {/* 外見・性格・口調 */}
            {hasProfile && (
                <Section title="プロフィール" titleEn="PROFILE" accent={affColor}>
                    <LongField label="外見" value={c.appearance} />
                    <LongField label="性格" value={c.personality} />
                    <LongField label="口調・一人称" value={c.speech_style} />
                </Section>
            )}

            {/* 来歴・因縁・バックストーリー */}
            {hasStory && (
                <Section title="物語" titleEn="STORY" accent={affColor}>
                    <LongField label="簡略来歴" value={c.brief_history} />
                    <LongField label="因縁" value={c.fate} />
                    <LongField label="バックストーリー" value={c.backstory} />
                </Section>
            )}

            {/* 魔法言語 */}
            {(profLangs.length > 0 || weakLangs.length > 0) && (
                <Section title="魔法言語" titleEn="LANGUAGES" accent={affColor}>
                    <div className="rps__lang-row">
                        <div className="rps__lang">
                            <span className="rps__label">得意</span>
                            <span>{profLangs.length > 0 ? profLangs.join('、') : '—'}</span>
                        </div>
                        <div className="rps__lang">
                            <span className="rps__label">苦手</span>
                            <span>{weakLangs.length > 0 ? weakLangs.join('、') : '—'}</span>
                        </div>
                    </div>
                </Section>
            )}

            {/* 二次創作ガイドライン */}
            {c.fanart_policy && (
                <Section title="二次創作ガイドライン" titleEn="FANART POLICY" accent={affColor}>
                    <div className="rps__fanart-grid">
                        {FA_ITEMS.map(item => {
                            const val = c.fanart_policy[item.key] || 'ng';
                            return (
                                <div key={item.key} className="rps__fanart-item">
                                    <span className="rps__fanart-name">{item.label}</span>
                                    <span className="rps__fanart-val" style={{ color: FA_COLOR[val] }}>{FA_LABEL[val]}</span>
                                </div>
                            );
                        })}
                    </div>
                    {c.fanart_policy.note && <div className="rps__fanart-note">{c.fanart_policy.note}</div>}
                </Section>
            )}

            {/* SNS・連絡先 */}
            {hasSocial && (
                <Section title="リンク" titleEn="SOCIAL" accent={affColor}>
                    <div className="rps__social">
                        {c.social_x && <Field label="X" value={c.social_x} />}
                        {c.social_vrc && <Field label="VRChat" value={c.social_vrc} />}
                        {c.social_url && <Field label="URL" value={c.social_url} />}
                    </div>
                </Section>
            )}

            {/* フッター */}
            <div className="rps__footer">
                <span>AUTHOR: {c.author_name || '@unknown'}</span>
                <span>ISSUED: {formatDate(c.created_at)} / RP CHARACTER SHEET</span>
            </div>
        </div>
    );
});

// 小物コンポーネント
function Field({ label, value }) {
    return (
        <div className="rps__field">
            <span className="rps__label">{label}</span>
            <span className="rps__value">{value || '—'}</span>
        </div>
    );
}

// 複数行テキスト用（空なら非表示）
function LongField({ label, value }) {
    if (!value) return null;
    return (
        <div className="rps__long-field">
            <div className="rps__label">{label}</div>
            <div className="rps__long-text">{value}</div>
        </div>
    );
}

function Section({ title, titleEn, accent, children }) {
    return (
        <div className="rps__section">
            <div className="rps__section-head">
                <span className="rps__section-title">{title}</span>
                <span className="rps__section-en" style={{ color: accent }}>{titleEn}</span>
                <span className="rps__section-line" style={{ background: `${accent}33` }} />
            </div>
            <div className="rps__section-body">{children}</div>
        </div>
    );
}

export default RpCharacterSheet;
