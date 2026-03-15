// キャラクターシート詳細 — v4.0 6軸スキル対応
'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import IdBadge from '@/components/IdBadge';
import { getBackgroundSkill, getSkillTypeColor, getAxisColor, getAvailableSkills } from '@/data/skillData';
import HunterLicense from '@/components/HunterLicense';
import { exportAsImage } from '@/lib/exportImage';

const AFF_COLOR = { '祓部': '#4488ff', '傭兵': '#ffaa00', '無所属': '#ff6644' };
const LANG_COLORS = { 'Igniscript': '#ff4444', 'Lupis Surf': '#4488ff', 'Ivyo': '#44cc44', 'NGT': '#ffcc00', 'Monyx': '#aaa', 'P:': '#aa44ff', "P'": '#ff88cc' };

const ABILITIES = [
    { key: 'rank_tai', name: '体', reading: 'たい' },
    { key: 'rank_haya', name: '疾', reading: 'はや' },
    { key: 'rank_shiki', name: '識', reading: 'しき' },
    { key: 'rank_han', name: '判', reading: 'はん' },
    { key: 'rank_shiya', name: '察', reading: 'さつ' },
    { key: 'rank_jutsu', name: '術', reading: 'じゅつ' },
    { key: 'rank_kon', name: '魂', reading: 'こん' },
];

const RANK_ORDER = { D: 1, C: 2, B: 3, A: 4, S: 5 };
const RANK_DICE = { D: '1d6', C: '2d6', B: '3d6', A: '4d6', S: '4d6+' };

const STATUS_BADGE = {
    pending: { label: 'TMP', color: '#ffaa00', bg: 'rgba(255,170,0,0.1)', border: 'rgba(255,170,0,0.3)' },
    approved: { label: '公認', color: '#00ffaa', bg: 'rgba(0,255,170,0.1)', border: 'rgba(0,255,170,0.3)' },
    rejected: { label: '却下', color: '#ff4d4d', bg: 'rgba(255,77,77,0.1)', border: 'rgba(255,77,77,0.3)' },
};

const SS = {
    section: { marginBottom: 'var(--space-2xl)', padding: 'var(--space-xl)', background: 'var(--bg-card)', border: 'var(--border-subtle)' },
    sTitle: { fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)', textTransform: 'uppercase' },
    sHead: { fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-md)' },
    label: { fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '4px' },
    value: { color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8, marginBottom: 'var(--space-md)' },
};

const Field = ({ label, value }) => {
    if (!value) return null;
    return <div style={{ marginBottom: 'var(--space-md)' }}><div style={SS.label}>{label}</div><div style={SS.value}>{value}</div></div>;
};

export default function CharacterDetail({ id }) {
    const { user } = useUser();
    const [e, setE] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImg, setActiveImg] = useState(0);
    const [achievements, setAchievements] = useState([]);
    const [serialCode, setSerialCode] = useState('');
    const [serialMsg, setSerialMsg] = useState(null);
    const [exporting, setExporting] = useState(false);
    const [levelUpMethod, setLevelUpMethod] = useState('cp');
    const [levelUpCode, setLevelUpCode] = useState('');
    const [levelUpMsg, setLevelUpMsg] = useState(null);
    const [levelingUp, setLevelingUp] = useState(false);
    const licenseRef = useRef(null);
    const [serialLoading, setSerialLoading] = useState(false);
    const [linkedGear, setLinkedGear] = useState(null);
    const isOwner = user && e?.user_id && user.id === e.user_id;

    useEffect(() => {
        (async () => {
            const { data } = await supabase.from('character_sheets').select('*').eq('id', id).single();
            if (data) {
                setE(data);
                if (data.linked_gear_id) {
                    try {
                        const { data: gearData } = await supabase.from('gear_posts').select('gear_name, total_cp, category, manufacturer').eq('id', data.linked_gear_id).single();
                        if (gearData) setLinkedGear(gearData);
                    } catch (_) {}
                }
            }
            try {
                const { data: achData } = await supabase.from('character_achievements').select('*').eq('character_id', id);
                if (achData) setAchievements(achData);
            } catch (_) {}
            setLoading(false);
        })();
    }, [id]);

    const handleSetTitle = async (titleName) => {
        const res = await fetch('/api/games/title', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ character_id: id, active_title: titleName }),
        });
        if (res.ok) setE(prev => ({ ...prev, active_title: titleName }));
    };

    const handleRedeem = async () => {
        if (!serialCode.trim()) return;
        setSerialLoading(true); setSerialMsg(null);
        try {
            const res = await fetch('/api/games/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: serialCode.trim(), character_id: id }),
            });
            const json = await res.json();
            if (res.ok) {
                setSerialMsg({ ok: true, text: `「${json.achievement.name}」を獲得しました！` });
                setSerialCode('');
                const { data: achData } = await supabase.from('character_achievements').select('*').eq('character_id', id);
                if (achData) setAchievements(achData);
            } else { setSerialMsg({ ok: false, text: json.error }); }
        } catch (_) { setSerialMsg({ ok: false, text: '通信エラーが発生しました' }); }
        setSerialLoading(false);
    };

    if (loading) return <div className="container" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--text-muted)' }}>読み込み中...</div>;
    if (!e) return <div className="container" style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--text-muted)' }}>シートが見つかりませんでした。</div>;

    const affColor = AFF_COLOR[e.affiliation] || '#888';
    const statusBadge = STATUS_BADGE[e.approved_status || 'pending'];
    const stagePlus = e.stage_plus || [];
    const skills = e.skills || [];
    const bgSkill = getBackgroundSkill(e.background);

    // スキル名→データ逆引き
    const allSkills = getAvailableSkills({
        affiliation: e.affiliation, assignment: e.sub_affiliation,
        awakening: e.awakening, weaponType: e.weapon_type,
    });

    const images = [];
    if (e.thumbnail_url) images.push(e.thumbnail_url);
    if (e.image_url && !images.includes(e.image_url)) images.push(e.image_url);
    if (Array.isArray(e.image_urls)) e.image_urls.filter(u => u && !images.includes(u)).forEach(u => images.push(u));

    // ランクの色
    const rankColor = (rank) => rank === 'S' ? '#ff4444' : rank === 'A' ? '#ffcc00' : rank === 'B' ? 'var(--accent-gold)' : rank === 'C' ? '#88aacc' : 'var(--text-muted)';
    const maxRankVal = Math.max(...ABILITIES.map(a => RANK_ORDER[e[a.key]] || 0));

    return (
        <div className="container">
            <Link href="/community/characters/" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--accent-cyber)', textDecoration: 'none' }}>← 一覧に戻る</Link>

            {/* ===== ヒーロー ===== */}
            <div style={{
                marginTop: 'var(--space-lg)', padding: 'var(--space-2xl)',
                background: `linear-gradient(135deg, ${affColor}08, rgba(0,0,0,0.6))`,
                border: `1px solid ${affColor}33`, position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '100%', background: `linear-gradient(180deg, ${affColor}05, transparent)`, pointerEvents: 'none' }} />
                <div style={{ display: 'flex', gap: 'var(--space-2xl)', alignItems: 'flex-start', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                    {/* 画像 */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        {images.length > 0 ? (
                            <div>
                                <img src={images[activeImg] || images[0]} alt={e.character_name} style={{ width: '180px', height: '180px', objectFit: 'cover', border: `3px solid ${affColor}66` }} />
                                {images.length > 1 && (
                                    <div style={{ display: 'flex', gap: '4px', marginTop: '8px', justifyContent: 'center' }}>
                                        {images.map((img, i) => (
                                            <img key={i} src={img} alt="" onClick={() => setActiveImg(i)}
                                                style={{ width: '36px', height: '36px', objectFit: 'cover', cursor: 'pointer', border: activeImg === i ? `2px solid ${affColor}` : '1px solid rgba(255,255,255,0.1)', opacity: activeImg === i ? 1 : 0.5 }} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${affColor}15`, border: `2px solid ${affColor}33`, fontSize: '4rem' }}>☖</div>
                        )}
                    </div>

                    {/* プロフィール */}
                    <div style={{ flex: 1, minWidth: '280px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>// CHARACTER PROFILE v4</span>
                            <span style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 700, background: statusBadge.bg, border: `1px solid ${statusBadge.border}`, color: statusBadge.color, fontFamily: 'var(--font-mono)' }}>{statusBadge.label}</span>
                        </div>

                        <h1 style={{ fontSize: 'var(--font-size-2xl)', margin: '0 0 4px', display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                            {e.character_name}
                            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, padding: '2px 8px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', color: 'var(--accent-gold)', verticalAlign: 'middle' }}>Lv.{e.level || 1}</span>
                            {e.is_official && <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, padding: '2px 8px', background: 'rgba(192,208,224,0.12)', border: '1px solid rgba(192,208,224,0.3)', color: '#c0d0e0', verticalAlign: 'middle' }}>★ OFFICIAL</span>}
                            {e.title && <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 400, color: 'var(--text-muted)' }}>「{e.title}」</span>}
                            {e.active_title && (
                                <span style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-mono)', fontWeight: 700, padding: '2px 10px', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.4)', color: 'var(--accent-gold)' }}>
                                    {e.active_title}
                                </span>
                            )}
                        </h1>

                        {/* タグ行 */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', padding: '3px 10px', background: affColor + '18', border: `1px solid ${affColor}44`, color: affColor, fontWeight: 700 }}>{e.affiliation}</span>
                            {e.sub_affiliation && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', padding: '3px 10px', border: '1px solid rgba(68,170,255,0.3)', color: '#44aaff', background: 'rgba(68,170,255,0.08)' }}>{e.sub_affiliation}</span>}
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', padding: '3px 10px', border: '1px solid rgba(170,68,255,0.3)', color: '#aa44ff', background: 'rgba(170,68,255,0.08)' }}>{e.awakening}</span>
                            {e.weapon_type && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', padding: '3px 10px', border: '1px solid rgba(255,102,68,0.3)', color: '#ff6644', background: 'rgba(255,102,68,0.08)' }}>{e.weapon_type}</span>}
                        </div>

                        {/* 基本スペック */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginBottom: 'var(--space-md)' }}>
                            {e.age && <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: 'var(--border-subtle)' }}><div style={SS.label}>年齢</div><div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{e.age}</div></div>}
                            {e.gender && <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: 'var(--border-subtle)' }}><div style={SS.label}>性別</div><div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{e.gender}</div></div>}
                            {e.background && <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: 'var(--border-subtle)' }}><div style={SS.label}>背景</div><div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{e.background}</div></div>}
                            {e.gift && <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: 'var(--border-subtle)' }}><div style={SS.label}>ギフト</div><div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-gold)' }}>{e.gift}</div></div>}
                        </div>

                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                            by {e.author_name || '名無し'} · {new Date(e.created_at).toLocaleDateString('ja-JP')}
                        </div>
                        {isOwner && (
                            <Link href={`/create/character/${id}/`} style={{ display: 'inline-block', marginTop: 'var(--space-sm)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)', padding: '6px 16px', textDecoration: 'none' }}>編集する</Link>
                        )}
                    </div>
                </div>
            </div>

            {/* ===== 実績・称号 ===== */}
            {(achievements.length > 0 || isOwner) && (
                <div style={{ ...SS.section, marginTop: 'var(--space-lg)' }}>
                    <div style={SS.sTitle}>ACHIEVEMENTS</div>
                    <h2 style={SS.sHead}>実績・称号</h2>
                    {achievements.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: 'var(--space-lg)' }}>
                            {achievements.map(a => {
                                const isActive = e.active_title === a.achievement_name;
                                return (
                                    <span key={a.id} onClick={() => isOwner && handleSetTitle(isActive ? null : a.achievement_name)}
                                        style={{
                                            fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', fontWeight: 700,
                                            padding: '4px 12px', background: isActive ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255,255,255,0.05)',
                                            border: isActive ? '2px solid var(--accent-gold)' : 'var(--border-subtle)',
                                            color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                                            cursor: isOwner ? 'pointer' : 'default',
                                        }}>
                                        {isActive && '★ '}{a.achievement_name}
                                    </span>
                                );
                            })}
                        </div>
                    )}
                    {isOwner && (
                        <div style={{ padding: 'var(--space-md)', background: 'rgba(0,0,0,0.3)', border: 'var(--border-subtle)' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>SERIAL CODE</div>
                            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                <input type="text" value={serialCode} onChange={ev => { setSerialCode(ev.target.value); setSerialMsg(null); }}
                                    placeholder="シリアルコードを入力" style={{ flex: 1, padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', background: 'var(--bg-card)', border: 'var(--border-subtle)', color: 'var(--text-primary)', textTransform: 'uppercase' }} />
                                <button onClick={handleRedeem} disabled={serialLoading || !serialCode.trim()}
                                    style={{ padding: '8px 16px', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', background: serialCode.trim() ? 'var(--accent-gold)' : 'var(--bg-tertiary)', color: serialCode.trim() ? 'var(--bg-primary)' : 'var(--text-muted)', border: 'none', cursor: serialCode.trim() ? 'pointer' : 'not-allowed', fontWeight: 700 }}>
                                    {serialLoading ? '...' : '引換'}
                                </button>
                            </div>
                            {serialMsg && <div style={{ marginTop: 'var(--space-sm)', fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-mono)', color: serialMsg.ok ? 'var(--accent-gold)' : 'var(--accent-danger)' }}>{serialMsg.text}</div>}
                        </div>
                    )}
                </div>
            )}

            {/* ===== レベルアップ ===== */}
            {isOwner && (e.level || 1) < (e.is_official ? 10 : 5) && (() => {
                const PL_CP_TABLE = { 1: 100, 2: 150, 3: 250, 4: 400 };
                const cpCost = PL_CP_TABLE[e.level || 1] || null;
                return (
                <div style={{ ...SS.section, marginBottom: 'var(--space-lg)' }}>
                    <div style={SS.sTitle}>LEVEL UP</div>
                    <h2 style={SS.sHead}>レベルアップ（現在 Lv.{e.level || 1}{e.is_official ? ' / 上限10' : ' / 上限5'}）</h2>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
                        {e.is_official ? (
                            <button
                                onClick={async () => {
                                    setLevelingUp(true); setLevelUpMsg(null);
                                    try {
                                        const res = await fetch('/api/games/levelup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ character_id: id, method: 'official' }) });
                                        const json = await res.json();
                                        if (!res.ok) throw new Error(json.error);
                                        setE(prev => ({ ...prev, level: json.data.level }));
                                        setLevelUpMsg({ ok: true, text: `Lv.${json.levelUp.from} → Lv.${json.levelUp.to} にレベルアップ！` });
                                    } catch (err) { setLevelUpMsg({ ok: false, text: err.message }); }
                                    finally { setLevelingUp(false); }
                                }}
                                disabled={levelingUp}
                                style={{ padding: '8px 20px', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', background: 'rgba(192,208,224,0.1)', border: '1px solid rgba(192,208,224,0.3)', color: '#c0d0e0', cursor: 'pointer', fontWeight: 700 }}
                            >
                                {levelingUp ? '処理中...' : '★ レベルアップ（公式・無制限）'}
                            </button>
                        ) : (
                            <>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {['cp', 'serial'].map(m => (
                                        <button key={m} type="button" onClick={() => { setLevelUpMethod(m); setLevelUpMsg(null); }}
                                            style={{
                                                padding: '4px 12px', fontFamily: 'var(--font-mono)', fontSize: '11px', cursor: 'pointer',
                                                background: levelUpMethod === m ? 'rgba(212,175,55,0.15)' : 'transparent',
                                                border: levelUpMethod === m ? '1px solid rgba(212,175,55,0.4)' : '1px solid rgba(255,255,255,0.05)',
                                                color: levelUpMethod === m ? 'var(--accent-gold)' : 'var(--text-muted)',
                                            }}>
                                            {m === 'cp' ? `CP消費（${cpCost || '?'}CP）` : 'シリアルコード'}
                                        </button>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--space-sm)', flex: 1, minWidth: '200px' }}>
                                    {levelUpMethod === 'serial' && (
                                        <input type="text" value={levelUpCode} onChange={ev => { setLevelUpCode(ev.target.value); setLevelUpMsg(null); }}
                                            placeholder="レベルアップ用コード" style={{ flex: 1, padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', background: 'var(--bg-card)', border: 'var(--border-subtle)', color: 'var(--text-primary)', textTransform: 'uppercase' }} />
                                    )}
                                    <button
                                        onClick={async () => {
                                            if (levelUpMethod === 'serial' && !levelUpCode.trim()) return;
                                            setLevelingUp(true); setLevelUpMsg(null);
                                            try {
                                                const payload = { character_id: id, method: levelUpMethod };
                                                if (levelUpMethod === 'serial') payload.code = levelUpCode.trim();
                                                const res = await fetch('/api/games/levelup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                                                const json = await res.json();
                                                if (!res.ok) throw new Error(json.error);
                                                setE(prev => ({ ...prev, level: json.data.level }));
                                                setLevelUpCode('');
                                                setLevelUpMsg({ ok: true, text: `Lv.${json.levelUp.from} → Lv.${json.levelUp.to} にレベルアップ！` });
                                            } catch (err) { setLevelUpMsg({ ok: false, text: err.message }); }
                                            finally { setLevelingUp(false); }
                                        }}
                                        disabled={levelingUp || (levelUpMethod === 'serial' && !levelUpCode.trim())}
                                        style={{ padding: '8px 16px', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', color: 'var(--accent-gold)', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' }}
                                    >
                                        {levelingUp ? '処理中...' : 'レベルアップ'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    {levelUpMsg && <div style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-mono)', color: levelUpMsg.ok ? 'var(--accent-gold)' : 'var(--accent-danger)' }}>{levelUpMsg.text}</div>}
                </div>
                );
            })()}

            {/* ===== 能力値（ランク制） ===== */}
            <div style={SS.section}>
                <div style={SS.sTitle}>ABILITIES</div>
                <h2 style={SS.sHead}>能力値ランク</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
                    {ABILITIES.map(a => {
                        const hiddenAbilities = Array.isArray(e.hidden_abilities) ? e.hidden_abilities : [];
                        const isHidden = hiddenAbilities.includes(a.key);
                        const rank = isHidden ? '?' : (e[a.key] || 'D');
                        const val = isHidden ? 0 : (RANK_ORDER[rank] || 1);
                        const pct = (val / 5) * 100;
                        const hasPlus = !isHidden && stagePlus.includes(a.key);
                        const display = isHidden ? '？' : (hasPlus && rank !== 'S' ? `${rank}+` : rank);
                        const isMax = !isHidden && val === maxRankVal;
                        return (
                            <div key={a.key} style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.2)', border: isHidden ? '1px solid rgba(255,255,255,0.03)' : isMax ? '1px solid var(--accent-gold-border)' : hasPlus ? '1px solid rgba(100,200,255,0.2)' : 'var(--border-subtle)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }}>
                                        {a.name} <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>({a.reading})</span>
                                    </span>
                                    <span style={{
                                        fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-lg)', fontWeight: 700,
                                        color: isHidden ? '#333' : rankColor(rank), minWidth: '36px', textAlign: 'center',
                                    }}>{display}</span>
                                </div>
                                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${pct}%`, background: isHidden ? '#222' : isMax ? 'var(--accent-gold)' : affColor, transition: 'width 0.5s' }} />
                                </div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    {isHidden ? '—' : `${RANK_DICE[rank]}${hasPlus ? '（達成値+1）' : ''}`}
                                </div>
                            </div>
                        );
                    })}
                </div>
                {/* 信念ポイント */}
                <div style={{ marginTop: 'var(--space-md)', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: 'var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>BELIEF POINTS</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--accent-gold)' }}>{e.belief_points || 5}</span>
                </div>
            </div>

            {/* ===== スキル ===== */}
            {(skills.length > 0 || bgSkill) && (
                <div style={SS.section}>
                    <div style={SS.sTitle}>SKILLS</div>
                    <h2 style={SS.sHead}>取得スキル</h2>

                    {/* 背景スキル */}
                    {bgSkill && (
                        <div style={{ padding: '10px 14px', background: 'rgba(68,204,136,0.06)', border: '1px solid rgba(68,204,136,0.2)', marginBottom: 'var(--space-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{bgSkill.id}</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#44cc88' }}>背景（自動）</span>
                            </div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{bgSkill.effect}</div>
                        </div>
                    )}

                    {/* 選択スキル */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
                        {skills.map(skillId => {
                            const skill = allSkills.find(s => s.id === skillId);
                            if (!skill) return <div key={skillId} style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.2)', border: 'var(--border-subtle)' }}><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{skillId}</span></div>;
                            const axisColor = getAxisColor(skill.axis);
                            const typeColor = getSkillTypeColor(skill.type);
                            return (
                                <div key={skillId} style={{ padding: '10px 14px', background: `${axisColor}08`, border: `1px solid ${axisColor}33` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--font-size-sm)', color: axisColor }}>{skill.id}</span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '1px 6px', border: `1px solid ${typeColor}40`, color: typeColor }}>{skill.type}</span>
                                    </div>
                                    <div style={{ fontSize: '10px', color: axisColor, fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>[{skill.axis}] {skill.attr}判定</div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{skill.effect}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ===== 得意/苦手言語 ===== */}
            {((e.proficient_languages && e.proficient_languages.length > 0) || (e.weak_languages && e.weak_languages.length > 0)) && (
                <div style={SS.section}>
                    <div style={SS.sTitle}>LANGUAGE</div>
                    <h2 style={SS.sHead}>魔法言語</h2>
                    <div style={{ display: 'flex', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
                        {e.proficient_languages && e.proficient_languages.length > 0 && (
                            <div>
                                <div style={SS.label}>得意言語（+1）</div>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {e.proficient_languages.map(lang => (
                                        <span key={lang} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', fontWeight: 700, padding: '4px 12px', border: `2px solid ${LANG_COLORS[lang] || '#888'}`, background: `${LANG_COLORS[lang] || '#888'}15`, color: LANG_COLORS[lang] || '#888' }}>{lang}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {e.weak_languages && e.weak_languages.length > 0 && (
                            <div>
                                <div style={SS.label}>苦手言語（-1）</div>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {e.weak_languages.map(lang => (
                                        <span key={lang} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', padding: '4px 12px', border: '1px solid rgba(230,57,70,0.4)', background: 'rgba(230,57,70,0.08)', color: 'var(--accent-danger)' }}>{lang}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ===== 装備 ===== */}
            {(e.equipment_type || e.equipment_name) && (
                <div style={SS.section}>
                    <div style={SS.sTitle}>EQUIPMENT</div>
                    <h2 style={SS.sHead}>主力装備</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
                        <Field label="種別" value={e.equipment_type} />
                        <Field label="装備名" value={e.equipment_name === '_custom' ? e.custom_equipment_name : e.equipment_name} />
                        <Field label="メーカー" value={e.equipment_maker} />
                    </div>
                    <Field label="詳細" value={e.equipment_detail} />

                    {/* CP予算 */}
                    {(() => {
                        let cpBudget = 10;
                        if (e.background === '鋼の肉体' && (e.equipment_type === '武装型' || e.equipment_type === '半装身型')) cpBudget += 4;
                        if (e.background === 'ハッカー上がり' && e.equipment_type === '独立型') cpBudget += 3;
                        // v3互換
                        if (e.background === '技術畑') cpBudget += 2;
                        if (e.sub_affiliation === '技術屋') cpBudget += 2;

                        const usedCp = linkedGear ? Number(linkedGear.total_cp || 0) : 0;
                        const remaining = cpBudget - usedCp;
                        const pct = cpBudget > 0 ? Math.min(100, Math.max(0, (usedCp / cpBudget) * 100)) : 0;
                        const barColor = remaining < 0 ? 'var(--accent-danger)' : remaining <= 2 ? '#ffaa00' : 'var(--accent-gold)';

                        return (
                            <div style={{ marginTop: 'var(--space-md)', padding: '12px 14px', background: 'rgba(0,0,0,0.2)', border: 'var(--border-subtle)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: usedCp > 0 ? '8px' : 0 }}>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>装備CP予算</span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--accent-gold)' }}>{cpBudget}CP</span>
                                </div>
                                {usedCp > 0 && (
                                    <>
                                        <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, marginBottom: '6px' }}>
                                            <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 3, transition: 'width 0.3s' }} />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{linkedGear.gear_name}: {usedCp}CP</span>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', fontWeight: 700, color: barColor }}>
                                                {remaining >= 0 ? `残り ${remaining}CP` : `${Math.abs(remaining)}CP 超過`}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })()}

                    {e.linked_gear_id ? (
                        <Link href={`/community/gear/${e.linked_gear_id}/`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: 'var(--space-md)', padding: '8px 16px', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', background: 'rgba(212, 175, 55, 0.08)', border: '1px solid var(--accent-gold-border)', color: 'var(--accent-gold)', textDecoration: 'none' }}>
                            連携装備の詳細を見る
                        </Link>
                    ) : isOwner && (
                        <Link href={`/create/character/${e.id}/`} style={{ display: 'inline-flex', marginTop: 'var(--space-md)', padding: '8px 16px', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', background: 'rgba(255,255,255,0.03)', border: 'var(--border-subtle)', color: 'var(--text-muted)', textDecoration: 'none' }}>
                            投稿済み装備を連携する（編集）
                        </Link>
                    )}
                </div>
            )}

            {/* ===== ストーリー ===== */}
            {(e.fate || e.backstory) && (
                <div style={SS.section}>
                    <div style={SS.sTitle}>STORY</div>
                    <h2 style={SS.sHead}>因縁・バックストーリー</h2>
                    <Field label="因縁" value={e.fate} />
                    {e.backstory && <><div style={SS.label}>バックストーリー</div><div style={{ ...SS.value, whiteSpace: 'pre-wrap' }}>{e.backstory}</div></>}
                </div>
            )}

            {/* ===== 関連リンク ===== */}
            {(e.related_anomalies || e.related_characters || e.related_factions) && (
                <div style={SS.section}>
                    <div style={SS.sTitle}>LINKS</div>
                    <h2 style={SS.sHead}>関連リンク</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
                        <Field label="関連怪異" value={e.related_anomalies} />
                        <Field label="関連キャラ" value={e.related_characters} />
                        <Field label="関連組織" value={e.related_factions} />
                    </div>
                </div>
            )}

            {/* 討伐者資格証（画面外に配置してキャプチャ用） */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <HunterLicense ref={licenseRef} character={e} />
            </div>

            {/* フッター */}
            <IdBadge id={id} label="CHARACTER ID" created_at={e.created_at} updated_at={e.updated_at} />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginBottom: 'var(--space-2xl)' }}>
                <button
                    onClick={async () => {
                        if (!licenseRef.current || exporting) return;
                        setExporting(true);
                        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                        const idShort = (e.id || '').substring(0, 8);
                        await exportAsImage(licenseRef.current, `kaiii_license_${idShort}_${dateStr}`, { width: 1200, height: 727 });
                        setExporting(false);
                    }}
                    disabled={exporting}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', background: 'rgba(212,175,55,0.05)', padding: '4px 12px', border: '1px solid rgba(212,175,55,0.3)', cursor: 'pointer' }}
                >
                    {exporting ? '生成中...' : '資格証をダウンロード'}
                </button>
                {isOwner && <Link href={`/create/character/${id}/`} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', padding: '4px 12px', border: '1px solid rgba(255,170,0,0.3)', textDecoration: 'none' }}>編集</Link>}
                <Link href="/community/characters/" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', padding: '4px 12px', border: 'var(--border-subtle)', textDecoration: 'none' }}>← 一覧</Link>
            </div>
        </div>
    );
}
