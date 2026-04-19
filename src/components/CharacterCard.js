'use client';

// 名刺サイズのキャラカード（910×550px）— ステータスなし、パーソナルデータのみ
// PNGエクスポート時にこのコンポーネントをキャプチャする
// 受け取る character オブジェクトは RpIdCard と同じ形式（character_name / image_url 等）

import { forwardRef } from 'react';
import './CharacterCard.css';

const AFF_COLORS = {
    '祓部': '#d4af37',
    '傭兵': '#3a6ea5',
    '無所属': '#7a7a8a',
};

const CharacterCard = forwardRef(function CharacterCard({ character: c }, ref) {
    const affColor = AFF_COLORS[c.affiliation] || '#7a7a8a';
    const portrait = c.thumbnail_url || c.image_url;
    const titleText = c.active_title || c.title;

    return (
        <div className="char-card" id="character-card-export" ref={ref}>
            {/* 左辺所属色ライン */}
            <div className="char-card__accent" style={{ background: affColor }} />

            {/* ヘッダー */}
            <div className="char-card__header">
                <span className="char-card__brand">KAI-I//KILL</span>
                <span className="char-card__brand-sub" style={{ color: affColor }}>CHARACTER CARD</span>
            </div>

            {/* 本体 */}
            <div className="char-card__body">
                {/* 左：画像 */}
                <div className="char-card__portrait" style={{ borderColor: `${affColor}55` }}>
                    {portrait ? (
                        <img src={portrait} alt="" crossOrigin="anonymous" />
                    ) : (
                        <div className="char-card__portrait-ph" style={{ color: affColor }}>?</div>
                    )}
                </div>

                {/* 右：テキスト情報 */}
                <div className="char-card__info">
                    <div className="char-card__name">{c.character_name || '名無しの討伐者'}</div>
                    {titleText && (
                        <div className="char-card__title" style={{ color: affColor }}>《{titleText}》</div>
                    )}

                    <div className="char-card__row">
                        {c.affiliation && (
                            <span className="char-card__badge" style={{
                                color: affColor,
                                borderColor: `${affColor}66`,
                                background: `${affColor}14`,
                            }}>
                                {c.affiliation}
                            </span>
                        )}
                        {c.sub_affiliation && (
                            <span className="char-card__sub">{c.sub_affiliation}</span>
                        )}
                    </div>

                    {c.awakening && (
                        <div className="char-card__awakening">
                            <span className="char-card__key">覚醒</span>
                            <span className="char-card__val">{c.awakening}</span>
                        </div>
                    )}

                    <div className="char-card__personal">
                        <div className="char-card__personal-item">
                            <span className="char-card__key">年齢</span>
                            <span className="char-card__val">{c.age || '—'}</span>
                        </div>
                        <div className="char-card__personal-item">
                            <span className="char-card__key">性別</span>
                            <span className="char-card__val">{c.gender || '—'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* フッター */}
            <div className="char-card__footer">
                <span>電脳怪異譚 KAI-I//KILL</span>
                <span>CHAR CARD</span>
            </div>
        </div>
    );
});

export default CharacterCard;
