// RP用IDカード — ステータスなしの免許証風カード（1200×630px）
// html2canvas でキャプチャする前提のため、全サイズをpx固定で指定
'use client';

import { forwardRef } from 'react';
import './RpIdCard.css';

const AFF_COLORS = {
    '祓部': '#d4af37',
    '傭兵': '#3a6ea5',
    '無所属': '#7a7a8a',
};

const STATUS_BADGE = {
    pending:  { label: 'TMP', color: '#555566' },
    approved: { label: '公認', color: null },
    rejected: { label: '却下', color: '#c04050' },
};

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const RpIdCard = forwardRef(function RpIdCard({ character: c }, ref) {
    const affColor = AFF_COLORS[c.affiliation] || '#7a7a8a';
    const affAlpha = affColor + '26';
    const titleText = c.active_title || c.title;
    const statusInfo = STATUS_BADGE[c.approved_status] || STATUS_BADGE.pending;
    const statusColor = statusInfo.color || affColor;
    const portrait = c.thumbnail_url || c.image_url;

    return (
        <div className="rp-id" ref={ref}>
            {/* 左辺グロー */}
            <div className="rp-id__glow" style={{ background: `linear-gradient(to right, ${affAlpha}, transparent)` }} />
            <div className="rp-id__left-line" style={{ background: affColor }} />

            {/* ヘッダー */}
            <div className="rp-id__header">
                <span className="rp-id__header-left">電脳怪異譚 KAI-I//KILL</span>
                <span className="rp-id__header-right" style={{ color: affColor }}>討伐者身分証 / HUNTER ID</span>
                <div className="rp-id__header-accent" style={{ background: affColor }} />
            </div>

            {/* ポートレート */}
            <div className="rp-id__portrait" style={{ border: `1px solid ${affColor}33` }}>
                {portrait ? (
                    <img src={portrait} alt="" crossOrigin="anonymous" />
                ) : (
                    <div className="rp-id__portrait-ph" style={{ color: affColor }}>?</div>
                )}
            </div>

            {/* IDメタ（ポートレート下） */}
            <div className="rp-id__meta">
                <div className="rp-id__meta-label">// ID</div>
                <div className="rp-id__meta-value" style={{ color: affColor }}>
                    CHAR-{(c.id || '').substring(0, 8)}
                </div>
                <div className="rp-id__meta-label">// STATUS</div>
                <div className="rp-id__meta-info">{c.age || '不明'} / {c.gender || '不明'}</div>
                <div className="rp-id__meta-label" style={{ marginTop: 8 }}>// AUTHOR</div>
                <div className="rp-id__meta-author">{c.author_name || '@unknown'}</div>
            </div>

            {/* 名前ブロック */}
            <div className="rp-id__name">
                <div className="rp-id__name-row1">
                    <span className="rp-id__name-bar" style={{ background: affColor }} />
                    <span className="rp-id__name-text">{c.character_name || '名無しの討伐者'}</span>
                    {titleText && (
                        <span className="rp-id__name-title" style={{ color: affColor }}>《{titleText}》</span>
                    )}
                </div>
                <div className="rp-id__name-row2">
                    <span className="rp-id__name-badge" style={{ color: affColor, background: affAlpha, border: `1px solid ${affColor}40` }}>
                        {c.affiliation || '不明'}
                    </span>
                    {c.sub_affiliation && <span className="rp-id__name-sub">{c.sub_affiliation}</span>}
                    {c.awakening && <span className="rp-id__name-awakening">{c.awakening}</span>}
                </div>
            </div>

            {/* プロフィール情報 */}
            <div className="rp-id__profile">
                <div className="rp-id__profile-label" style={{ color: affColor }}>// PROFILE</div>
                <div className="rp-id__profile-grid">
                    <div>
                        <div className="rp-id__profile-key">背景</div>
                        <div className="rp-id__profile-val">{c.background || '—'}</div>
                    </div>
                    <div>
                        <div className="rp-id__profile-key">覚醒</div>
                        <div className="rp-id__profile-val">{c.awakening || '—'}</div>
                    </div>
                </div>
            </div>

            {/* 経歴 */}
            <div className="rp-id__history">
                <div className="rp-id__history-label" style={{ color: affColor }}>// BRIEF HISTORY</div>
                <div className="rp-id__history-text">
                    {c.brief_history || 'この討伐者の経歴は記録されていない。'}
                </div>
            </div>

            {/* ファンアートポリシー */}
            {c.fanart_policy && (() => {
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
                const COLOR = { ok: '#00ffaa', ask: '#ffaa00', ng: '#ff4d4d' };
                const LABEL = { ok: 'OK', ask: '要相談', ng: 'NG' };
                const p = c.fanart_policy;
                return (
                    <div className="rp-id__fanart">
                        <div className="rp-id__fanart-label" style={{ color: affColor }}>// FANART POLICY</div>
                        <div className="rp-id__fanart-grid">
                            {FA_ITEMS.map(item => {
                                const val = p[item.key] || 'ng';
                                return (
                                    <div key={item.key} className="rp-id__fanart-item">
                                        <span className="rp-id__fanart-name">{item.label}</span>
                                        <span className="rp-id__fanart-val" style={{ color: COLOR[val] }}>{LABEL[val]}</span>
                                    </div>
                                );
                            })}
                        </div>
                        {p.note && <div className="rp-id__fanart-note">{p.note}</div>}
                    </div>
                );
            })()}

            {/* フッター */}
            <div className="rp-id__footer">
                <span>ISSUED: {formatDate(c.created_at)}</span>
                <span>
                    STATUS:
                    <span className="rp-id__footer-status" style={{ color: statusColor, background: statusColor + '1a', border: `1px solid ${statusColor}40` }}>
                        {statusInfo.label}
                    </span>
                    <span style={{ marginLeft: 16 }}>RP CARD</span>
                </span>
            </div>
        </div>
    );
});

export default RpIdCard;
