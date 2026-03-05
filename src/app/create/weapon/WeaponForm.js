// 武器・装備投稿フォーム — クライアントコンポーネント
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { S, FormSelect, FormInput, FormTextArea, FormDynamicList } from '@/components/FormFields';
import { MANUFACTURER_NAMES, BASE_WEAPONS_BY_CATEGORY, CUSTOM_OPTIONS, ALL_OPTION_NAMES, findWeapon, findOption } from '@/data/weaponData';

// フォームの初期値
const INITIAL = {
    author_name: '', visibility: '公開', image_url: '', thumbnail_url: '', icon_url: '', image_urls: ['', '', ''], video_url: '', usage_url: '',
    gear_name: '', category: '武装型', body_part: '', manufacturer: 'その他', affiliation_fit: 'どれでも',
    summary: '', intended_role: [], strengths: [''], weaknesses: [''],
    base_name: '', quality: '標準', base_cp: 0, slot_count: 0, aptitude_dependency: '低',
    base_modifier: '', additional_traits: '',
    options: [{ name: '', type: '汎用', cp: 0, resonance: '', risk: '低', note: '' }],
    total_cp: 0, slot_exceeded: false, risk_level: '低', possible_anomalies: '',
    resonance_tendency: '', resonance_trigger: '', erosion_risk: 'なし', erosion_signs: '',
    base_product_url: '', asset_urls: [''], modification_notes: '', license_notes: '',
    credit: '', redistributable: '不可',
    related_characters: '', related_anomalies: '', related_factions: '', related_terms: '',
};

// 選択肢
const OPTIONS = {
    categories: ['武装型', '独立型', '半装身型', '全装身型', '搭乗型'],
    bodyParts: ['腕部', '脚部', '肩部', '胴部', 'その他'],
    manufacturers: MANUFACTURER_NAMES,
    affiliations: ['どれでも', '祓部', '傭兵', '無所属'],
    roles: ['攻撃', '防御', '支援', '解明', '封鎖', '逃走'],
    qualities: ['標準', '高品質', '試作品', '特注'],
    aptitudes: ['低', '低〜中', '中', '高'],
    risks: ['低', '中', '高', '非常に高'],
    erosions: ['なし', '低', '中', '高', '危険'],
    resonances: ['怒り', '渇望', '浄化', '恐怖', '焦燥', '哀愁'],
    optionTypes: ['汎用', '分類専用', 'メーカー専用'],
};

const CATEGORY_INFO = {
    '武装型': { mod: '+1', risk: '低', note: '誰でも使える' },
    '独立型': { mod: '援護+1', risk: '中', note: '機体依存' },
    '半装身型': { mod: '攻防+1', risk: '中', note: '部位選択必要' },
    '全装身型': { mod: '攻防+2', risk: '高', note: '扱える人間が少ない' },
    '搭乗型': { mod: '機動力+2', risk: '中', note: '狭所不向き' },
};

const RISK_COLOR = { '低': '#88cc44', '中': '#ffaa00', '高': '#ff6644', '非常に高': '#ff4444' };

// 初期CP基本値
const BASE_CP_BUDGET = 10;

export default function WeaponForm({ editId = null, initialData = null }) {
    const { user } = useUser();
    const router = useRouter();
    const isEdit = !!editId;

    const [form, setForm] = useState(INITIAL);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    // 編集モード: 既存データをフォームにセット
    useEffect(() => {
        if (initialData) {
            const parsed = { ...initialData };
            ['strengths', 'weaknesses', 'options', 'asset_urls'].forEach(key => {
                if (typeof parsed[key] === 'string') parsed[key] = JSON.parse(parsed[key] || '[]');
            });
            if (!Array.isArray(parsed.strengths) || parsed.strengths.length === 0) parsed.strengths = [''];
            if (!Array.isArray(parsed.weaknesses) || parsed.weaknesses.length === 0) parsed.weaknesses = [''];
            if (!Array.isArray(parsed.asset_urls) || parsed.asset_urls.length === 0) parsed.asset_urls = [''];
            if (!Array.isArray(parsed.options) || parsed.options.length === 0) parsed.options = [{ name: '', type: '汎用', cp: 0, resonance: '', risk: '低', note: '' }];
            setForm(prev => ({ ...prev, ...parsed }));
        }
    }, [initialData]);

    // ユーザー名を自動セット
    useEffect(() => {
        if (user && !form.author_name && !isEdit) {
            setForm(prev => ({ ...prev, author_name: `@${user.username || user.firstName || 'user'}` }));
        }
    }, [user, isEdit]);

    const set = useCallback((key, val) => setForm(prev => ({ ...prev, [key]: val })), []);

    // 動的リスト操作
    const addListItem = useCallback((key) => setForm(prev => ({ ...prev, [key]: [...prev[key], ''] })), []);
    const updateListItem = useCallback((key, idx, val) => setForm(prev => {
        const arr = [...prev[key]]; arr[idx] = val;
        return { ...prev, [key]: arr };
    }), []);
    const removeListItem = useCallback((key, idx) => setForm(prev => {
        const arr = prev[key].filter((_, i) => i !== idx);
        return { ...prev, [key]: arr.length ? arr : [''] };
    }), []);

    // オプション操作
    const addOption = useCallback(() => setForm(prev => ({
        ...prev, options: [...prev.options, { name: '', type: '汎用', cp: 0, resonance: '', risk: '低', note: '' }]
    })), []);
    const updateOption = useCallback((idx, field, val) => setForm(prev => {
        const opts = [...prev.options]; opts[idx] = { ...opts[idx], [field]: val };
        return { ...prev, options: opts };
    }), []);
    const removeOption = useCallback((idx) => setForm(prev => ({
        ...prev, options: prev.options.filter((_, i) => i !== idx)
    })), []);

    // ロール切り替え
    const toggleRole = useCallback((role) => setForm(prev => ({
        ...prev, intended_role: prev.intended_role.includes(role) ? prev.intended_role.filter(r => r !== role) : [...prev.intended_role, role]
    })), []);

    // リスク自動計算
    const calcRisk = () => {
        const cnt = form.options.filter(o => o.name.trim()).length;
        if (form.slot_exceeded) return '非常に高';
        if (cnt >= 4) return '高';
        if (cnt >= 2) return '中';
        return '低';
    };

    // 投稿/更新処理 — APIルート経由
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.gear_name.trim()) { setResult({ ok: false, msg: '武器名は必須です' }); return; }
        setSubmitting(true); setResult(null);
        try {
            const totalCp = form.base_cp + form.options.reduce((s, o) => s + (o.cp || 0), 0);
            const optCount = form.options.filter(o => o.name.trim()).length;
            const payload = {
                ...form, intended_role: form.intended_role,
                strengths: JSON.stringify(form.strengths.filter(Boolean)),
                weaknesses: JSON.stringify(form.weaknesses.filter(Boolean)),
                options: JSON.stringify(form.options.filter(o => o.name.trim())),
                asset_urls: JSON.stringify(form.asset_urls.filter(Boolean)),
                total_cp: totalCp, option_count: optCount, risk_level: calcRisk(),
            };
            delete payload.id; delete payload.created_at; delete payload.updated_at; delete payload.user_id;

            const method = isEdit ? 'PATCH' : 'POST';
            const body = isEdit
                ? { table: 'gear_posts', id: editId, data: payload }
                : { table: 'gear_posts', data: payload };

            const res = await fetch('/api/posts', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);

            setResult({ ok: true, msg: isEdit ? '装備データを更新しました！' : '武器・装備を投稿しました！' });
            if (!isEdit) setForm(INITIAL);
            setTimeout(() => router.push(`/community/gear/${json.data?.id || editId}/`), 1500);
        } catch (err) {
            setResult({ ok: false, msg: `${isEdit ? '更新' : '投稿'}に失敗しました: ${err.message}` });
        } finally { setSubmitting(false); }
    };

    const catInfo = CATEGORY_INFO[form.category];

    return (
        <div className="container">
            <section className="section">
                <span className="section__title">// {isEdit ? 'EDIT' : 'CREATE'} — WEAPON / GEAR</span>
                <h1 className="section__heading">{isEdit ? '武器・装備を編集' : '武器・装備を投稿'}</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>{isEdit ? '装備データを修正できます。' : '自作の武器・装備データをコミュニティに共有しましょう。'}</p>
            </section>

            <form onSubmit={handleSubmit}>
                {/* セクション0：メタ情報 */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 0 — META</div>
                    <h2 style={S.sectionHeading}>メタ情報</h2>
                    <div style={S.row}>
                        <FormInput label="投稿者名" value={form.author_name} onChange={v => set('author_name', v)} placeholder="@ユーザー名" />
                        <FormSelect label="公開範囲" value={form.visibility} onChange={v => set('visibility', v)} options={['公開', '限定']} />
                    </div>
                    <div style={S.row}>
                        <FormInput label="サムネイルURL" value={form.thumbnail_url} onChange={v => set('thumbnail_url', v)} placeholder="サムネイル画像 URL" />
                        <FormInput label="アイコンURL" value={form.icon_url} onChange={v => set('icon_url', v)} placeholder="アイコン画像 URL" />
                    </div>
                    <div style={S.row}>
                        <FormInput label="画像1 URL" value={form.image_urls[0]} onChange={v => { const a = [...form.image_urls]; a[0] = v; set('image_urls', a); }} placeholder="https://..." />
                        <FormInput label="画像2 URL" value={form.image_urls[1]} onChange={v => { const a = [...form.image_urls]; a[1] = v; set('image_urls', a); }} placeholder="https://..." />
                        <FormInput label="画像3 URL" value={form.image_urls[2]} onChange={v => { const a = [...form.image_urls]; a[2] = v; set('image_urls', a); }} placeholder="https://..." />
                    </div>
                    <div style={S.row}>
                        <FormInput label="動画URL（任意）" value={form.video_url} onChange={v => set('video_url', v)} placeholder="https://..." />
                        <FormInput label="使用例URL（任意）" value={form.usage_url} onChange={v => set('usage_url', v)} placeholder="VRワールド/配信 等" />
                    </div>
                </div>

                {/* セクション1：装備カテゴリ */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 1 — CATEGORY</div>
                    <h2 style={S.sectionHeading}>装備カテゴリ</h2>
                    <div style={S.row}>
                        <FormSelect label="分類 *" value={form.category} onChange={v => set('category', v)} options={OPTIONS.categories} />
                        {form.category === '半装身型' && <FormSelect label="装着部位" value={form.body_part} onChange={v => set('body_part', v)} options={OPTIONS.bodyParts} />}
                        <FormSelect label="メーカー" value={form.manufacturer} onChange={v => set('manufacturer', v)} options={OPTIONS.manufacturers} />
                        <FormSelect label="所属相性" value={form.affiliation_fit} onChange={v => set('affiliation_fit', v)} options={OPTIONS.affiliations} />
                    </div>
                    <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', border: 'var(--border-subtle)', display: 'flex', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>標準修正: <strong style={{ color: 'var(--accent-gold)' }}>{catInfo.mod}</strong></span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>怪異リスク: <strong style={{ color: catInfo.risk === '非常に高' ? 'var(--accent-danger)' : catInfo.risk === '高' ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>{catInfo.risk}</strong></span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{catInfo.note}</span>
                    </div>
                </div>

                {/* セクション2：概要 */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 2 — OVERVIEW</div>
                    <h2 style={S.sectionHeading}>概要</h2>
                    <FormInput label="武器名 / 型式 *" value={form.gear_name} onChange={v => set('gear_name', v)} placeholder="例：強化戦術銃【制式型】" />
                    <FormTextArea label="一行要約" value={form.summary} onChange={v => set('summary', v)} placeholder="例：核を狙うための曲射機構付き制式ライフル" />
                    <div style={S.fieldGroup}>
                        <label style={S.label}>想定役割</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {OPTIONS.roles.map(role => (
                                <button key={role} type="button" style={S.tagBtn(form.intended_role.includes(role))} onClick={() => toggleRole(role)}>{role}</button>
                            ))}
                        </div>
                    </div>
                    <FormDynamicList label="強み（3つまで）" items={form.strengths} placeholder="強み"
                        onUpdate={(i, v) => updateListItem('strengths', i, v)} onAdd={() => addListItem('strengths')} onRemove={(i) => removeListItem('strengths', i)} />
                    <FormDynamicList label="弱点・扱いづらさ（3つまで）" items={form.weaknesses} placeholder="弱点"
                        onUpdate={(i, v) => updateListItem('weaknesses', i, v)} onAdd={() => addListItem('weaknesses')} onRemove={(i) => removeListItem('weaknesses', i)} />
                </div>

                {/* セクション3：ベース装備 */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 3 — BASE</div>
                    <h2 style={S.sectionHeading}>ベース装備</h2>
                    <div style={S.fieldGroup}>
                        <label style={S.label}>ベース装備を選択</label>
                        <select
                            value={form.base_name}
                            onChange={e => {
                                const name = e.target.value;
                                set('base_name', name);
                                const w = findWeapon(name);
                                if (w) {
                                    set('base_cp', w.cp);
                                    set('slot_count', w.slot);
                                    set('manufacturer', w.maker);
                                    set('base_modifier', w.mod);
                                    set('additional_traits', w.note);
                                }
                            }}
                            style={{ width: '100%', padding: '10px 36px 10px 12px', background: 'var(--bg-elevated)', border: 'var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', appearance: 'none', WebkitAppearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23d4af37' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '12px' }}
                        >
                            <option value="" style={{ background: '#0a0c10', color: '#e8e6e3' }}>— ベース装備を選択 —</option>
                            {(BASE_WEAPONS_BY_CATEGORY[form.category] || []).map(w => (
                                <option key={w.name} value={w.name} style={{ background: '#0a0c10', color: '#e8e6e3' }}>{w.name}（{w.cp}CP / {w.maker}）</option>
                            ))}
                            <option value="_custom" style={{ background: '#0a0c10', color: '#e8e6e3' }}>自由入力…</option>
                        </select>
                    </div>
                    {form.base_name === '_custom' && (
                        <FormInput label="ベース名（自由入力）" value={form.custom_base_name || ''} onChange={v => set('custom_base_name', v)} placeholder="例：強化戦術銃【制式型】" />
                    )}
                    <div style={S.row}>
                        <FormSelect label="品質" value={form.quality} onChange={v => set('quality', v)} options={OPTIONS.qualities} />
                        <FormInput label="装備CP（本体）" value={form.base_cp} onChange={v => set('base_cp', v)} type="number" />
                        <FormInput label="スロット数" value={form.slot_count} onChange={v => set('slot_count', v)} type="number" />
                        <FormSelect label="素養依存" value={form.aptitude_dependency} onChange={v => set('aptitude_dependency', v)} options={OPTIONS.aptitudes} />
                    </div>
                    <FormInput label="基礎修正・性能" value={form.base_modifier} onChange={v => set('base_modifier', v)} placeholder="例：武器修正 +2" />
                    <FormInput label="追加特性" value={form.additional_traits} onChange={v => set('additional_traits', v)} placeholder="例：隠匿可、調査持込可" />
                </div>

                {/* セクション4：カスタム構成 */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 4 — OPTIONS</div>
                    <h2 style={S.sectionHeading}>カスタム構成</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-lg)', fontStyle: 'italic' }}>オプションを載せるほど怪異発生リスクが上がる。</p>
                    {form.options.map((opt, i) => (
                        <div key={i} style={{ padding: 'var(--space-md)', background: 'rgba(0,0,0,0.2)', border: 'var(--border-subtle)', marginBottom: 'var(--space-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)' }}>OPTION #{i + 1}</span>
                                {form.options.length > 1 && <button type="button" style={{ ...S.addBtn, color: 'var(--accent-danger)', borderColor: 'rgba(255,77,77,0.3)', padding: '4px 10px' }} onClick={() => removeOption(i)}>✕</button>}
                            </div>
                            <div style={S.row}>
                                <select
                                    value={opt.name}
                                    onChange={e => {
                                        const name = e.target.value;
                                        updateOption(i, 'name', name);
                                        const o = findOption(name);
                                        if (o) {
                                            updateOption(i, 'cp', o.cp);
                                            updateOption(i, 'resonance', o.resonance);
                                            updateOption(i, 'risk', o.risk);
                                        }
                                    }}
                                    style={{ flex: 1, padding: '10px 36px 10px 12px', background: 'var(--bg-elevated)', border: 'var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', appearance: 'none', WebkitAppearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23d4af37' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '12px' }}
                                >
                                    <option value="" style={{ background: '#0a0c10', color: '#e8e6e3' }}>— オプションを選択 —</option>
                                    {Object.entries(CUSTOM_OPTIONS).map(([group, opts]) => (
                                        <optgroup key={group} label={group}>
                                            {opts.map(o => (
                                                <option key={o.name} value={o.name} style={{ background: '#0a0c10', color: '#e8e6e3' }}>{o.name}（{o.cp}CP）</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                    <option value="_custom" style={{ background: '#0a0c10', color: '#e8e6e3' }}>自由入力…</option>
                                </select>
                                {opt.name === '_custom' && (
                                    <FormInput label="" value={opt.custom_name || ''} onChange={v => updateOption(i, 'custom_name', v)} placeholder="オプション名" />
                                )}
                                <FormSelect label="区分" value={opt.type} onChange={v => updateOption(i, 'type', v)} options={OPTIONS.optionTypes} />
                                <FormInput label="CP" value={opt.cp} onChange={v => updateOption(i, 'cp', v)} type="number" />
                                <FormSelect label="リスク" value={opt.risk} onChange={v => updateOption(i, 'risk', v)} options={OPTIONS.risks} />
                            </div>
                            <div style={S.row}>
                                <FormInput label="共鳴効果（任意）" value={opt.resonance} onChange={v => updateOption(i, 'resonance', v)} placeholder="例：渇望+1" />
                                <FormInput label="備考" value={opt.note} onChange={v => updateOption(i, 'note', v)} />
                            </div>
                        </div>
                    ))}
                    <button type="button" style={S.addBtn} onClick={addOption}>+ オプションを追加</button>
                    <div style={{ marginTop: 'var(--space-lg)', padding: '12px', background: 'rgba(0,0,0,0.3)', border: 'var(--border-subtle)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-xl)', flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>合計CP: <strong style={{ color: 'var(--text-primary)' }}>{form.base_cp + form.options.reduce((s, o) => s + (o.cp || 0), 0)}</strong></span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>搭載数: <strong style={{ color: 'var(--text-primary)' }}>{form.options.filter(o => o.name.trim()).length}</strong> / スロット {form.slot_count}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }}>リスク: <strong style={{ color: RISK_COLOR[calcRisk()] || '#888' }}>{calcRisk()}</strong></span>
                        </div>
                        <div style={{ marginTop: '8px' }}>
                            <label style={{ ...S.label, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: 0 }}>
                                <input type="checkbox" checked={form.slot_exceeded} onChange={e => set('slot_exceeded', e.target.checked)} />
                                スロット超過（違法改造）
                            </label>
                        </div>
                    </div>
                    {/* CP予算バー */}
                    {(() => {
                        const totalCp = Number(form.base_cp || 0) + form.options.reduce((s, o) => s + Number(o.cp || 0), 0);
                        const remaining = BASE_CP_BUDGET - totalCp;
                        const pct = Math.min(100, Math.max(0, (totalCp / BASE_CP_BUDGET) * 100));
                        const barColor = remaining < 0 ? '#ff4444' : remaining <= 2 ? '#ffaa00' : 'var(--accent-gold)';
                        return (
                            <div style={{ marginTop: 'var(--space-md)', padding: '12px', background: 'rgba(0,0,0,0.3)', border: 'var(--border-subtle)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>CP予算（初期{BASE_CP_BUDGET}CP）</span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', fontWeight: 700, color: barColor }}>
                                        {remaining >= 0 ? `残り ${remaining}CP` : `${Math.abs(remaining)}CP 超過！`}
                                    </span>
                                </div>
                                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${pct}%`, background: barColor, transition: 'width 0.3s, background 0.3s', borderRadius: '4px' }} />
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                                    ※ 背景「技術畑」選択時はCP+2。傭兵系統「技術屋」選択時はCP+2。キャラシート側で反映されます。
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* セクション5：怪異発生リスク */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 5 — RISK</div>
                    <h2 style={S.sectionHeading}>怪異発生リスク</h2>
                    <FormTextArea label="起きうる変調（任意）" value={form.possible_anomalies} onChange={v => set('possible_anomalies', v)} placeholder="例：発熱、異音、幻聴、弾道が歪む、夢に出る" />
                </div>

                {/* セクション6：共鳴・侵食 */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 6 — RESONANCE</div>
                    <h2 style={S.sectionHeading}>共鳴・侵食</h2>
                    <div style={S.row}>
                        <FormSelect label="共鳴傾向" value={form.resonance_tendency} onChange={v => set('resonance_tendency', v)} options={['', ...OPTIONS.resonances]} />
                        <FormSelect label="侵食リスク" value={form.erosion_risk} onChange={v => set('erosion_risk', v)} options={OPTIONS.erosions} />
                    </div>
                    <FormInput label="共鳴のトリガー" value={form.resonance_trigger} onChange={v => set('resonance_trigger', v)} placeholder="例：最大出力時、核を視認した時" />
                    <FormInput label="侵食の兆候（任意）" value={form.erosion_signs} onChange={v => set('erosion_signs', v)} placeholder="例：手が冷える、記憶が欠ける、怪異の言葉がわかる" />
                </div>

                {/* セクション7：VRC改変情報 */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 7 — VRC ASSETS</div>
                    <h2 style={S.sectionHeading}>VRC改変情報</h2>
                    <FormInput label="ベース商品URL（Booth等）" value={form.base_product_url} onChange={v => set('base_product_url', v)} placeholder="https://booth.pm/..." />
                    <FormDynamicList label="使用アセットURL一覧" items={form.asset_urls} placeholder="URL"
                        onUpdate={(i, v) => updateListItem('asset_urls', i, v)} onAdd={() => addListItem('asset_urls')} onRemove={(i) => removeListItem('asset_urls', i)} />
                    <FormTextArea label="改変メモ（任意）" value={form.modification_notes} onChange={v => set('modification_notes', v)} placeholder="改変の方針、変更点、依存関係・導入順・競合の注意点" />
                    <div style={S.row}>
                        <FormTextArea label="ライセンス表記" value={form.license_notes} onChange={v => set('license_notes', v)} placeholder="各アセットの利用規約の要点" />
                        <FormInput label="クレジット" value={form.credit} onChange={v => set('credit', v)} placeholder="クレジット表記" />
                        <FormSelect label="再配布" value={form.redistributable} onChange={v => set('redistributable', v)} options={['不可', '可']} />
                    </div>
                </div>

                {/* セクション8：関連リンク */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 8 — LINKS</div>
                    <h2 style={S.sectionHeading}>関連リンク</h2>
                    <div style={S.row}>
                        <FormInput label="関連キャラ" value={form.related_characters} onChange={v => set('related_characters', v)} placeholder="CHAR-???" />
                        <FormInput label="関連怪異" value={form.related_anomalies} onChange={v => set('related_anomalies', v)} placeholder="KAI-#### / TMP-???" />
                        <FormInput label="関連組織" value={form.related_factions} onChange={v => set('related_factions', v)} placeholder="FAC-???" />
                        <FormInput label="関連用語" value={form.related_terms} onChange={v => set('related_terms', v)} placeholder="用語リンク" />
                    </div>
                </div>

                {result && (
                    <div className="callout" style={{ marginBottom: 'var(--space-xl)', borderColor: result.ok ? 'var(--accent-cyber)' : 'var(--accent-danger)' }}>
                        <div className="callout__label" style={{ color: result.ok ? 'var(--accent-cyber)' : 'var(--accent-danger)' }}>{result.ok ? '投稿完了' : 'エラー'}</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{result.msg}</p>
                    </div>
                )}

                <button type="submit" style={S.submitBtn} disabled={submitting}
                    onMouseEnter={e => { e.target.style.background = 'linear-gradient(135deg, rgba(0, 255, 170, 0.3), rgba(0, 170, 255, 0.3))'; e.target.style.boxShadow = '0 0 30px rgba(0, 255, 170, 0.2)'; }}
                    onMouseLeave={e => { e.target.style.background = 'linear-gradient(135deg, rgba(0, 255, 170, 0.2), rgba(0, 170, 255, 0.2))'; e.target.style.boxShadow = 'none'; }}>
                    {submitting ? 'SUBMITTING...' : isEdit ? '▶ 装備データを更新' : '▶ 武器・装備を投稿'}
                </button>
            </form>
        </div>
    );
}
