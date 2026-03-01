// 怪異調査書（TMP）投稿フォーム — クライアントコンポーネント
'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { S, FormSelect, FormInput, FormTextArea, FormDynamicList } from '@/components/FormFields';

// フォームの初期値
const INITIAL = {
    author_name: '',
    visibility: '公開',
    status: '未確認',
    grade: '不明',
    threat_type: '不明',
    tags: [],
    influence_range: '不明',
    damage_type: '不明',
    anomaly_name: '',
    summary: '',
    typical_pattern: '',
    omen: '',
    worst_case: '',
    origin: '',
    spread_route: '',
    distorted_countermeasure: false,
    original_countermeasure: '',
    current_countermeasure: '',
    core_type: '不明',
    core_candidates: [''],
    core_behavior: '不明',
    core_destroyable: '不明',
    triggers: [''],
    taboos: [''],
    loopholes: '',
    violation_early: '',
    violation_mid: '',
    violation_late: '',
    testimonies: [''],
    media_urls: [''],
    avoidance: '',
    secondary_prevention: '',
    investigation_notes: '',
    related_anomalies: '',
    related_characters: '',
    related_factions: '',
    related_terms: '',
};

// 選択肢
const OPTIONS = {
    grades: ['不明', '五級', '四級', '三級', '二級', '一級', '特級'],
    threats: ['不明', '丁種', '丙種', '乙種', '甲種'],
    statuses: ['未確認', '調査中', '目撃多数', '沈静化', '再燃'],
    ranges: ['不明', '局所', '地域', '広域', 'ネットワーク上'],
    damages: ['不明', '物理', '精神', '複合', '社会的'],
    coreTypes: ['不明', '場所', '物品', '記録媒体', '人物', '集団記憶', 'その他'],
    coreBehaviors: ['不明', '固定', '条件移動', '複製（拡散）'],
    coreDestroyable: ['不明', '可', '条件付き', '不可'],
    tagOptions: ['都市伝説', 'ネットロア', '呪物', '場所', '夢', '音', '映像', '言語', '感染', '儀式', '認識災害'],
};

const HP_GUIDE = { '五級': '5〜10', '四級': '10〜20', '三級': '20〜35', '二級': '35〜60', '一級': '60〜100', '特級': '100以上' };
const GRADE_COLOR = { '特級': 'var(--accent-danger)', '一級': 'var(--accent-gold)', '二級': 'var(--accent-blue)', '三級': 'var(--text-primary)', '四級': 'var(--text-secondary)', '五級': 'var(--text-muted)', '不明': 'var(--text-muted)' };
const THREAT_COLOR = { '甲種': 'var(--accent-danger)', '乙種': 'var(--accent-gold)', '丙種': 'var(--text-secondary)', '丁種': 'var(--accent-blue)', '不明': 'var(--text-muted)' };

export default function AnomalyForm() {
    const [form, setForm] = useState(INITIAL);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    // フォーム更新
    const set = useCallback((key, val) => setForm(prev => ({ ...prev, [key]: val })), []);

    // 動的リスト操作
    const addItem = useCallback((key) => setForm(prev => ({ ...prev, [key]: [...prev[key], ''] })), []);
    const updateItem = useCallback((key, idx, val) => setForm(prev => {
        const arr = [...prev[key]]; arr[idx] = val;
        return { ...prev, [key]: arr };
    }), []);
    const removeItem = useCallback((key, idx) => setForm(prev => {
        const arr = prev[key].filter((_, i) => i !== idx);
        return { ...prev, [key]: arr.length ? arr : [''] };
    }), []);

    // タグ切り替え
    const toggleTag = useCallback((tag) => setForm(prev => ({
        ...prev,
        tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    })), []);

    // 投稿処理
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.anomaly_name.trim()) { setResult({ ok: false, msg: '怪異の通称は必須です' }); return; }
        setSubmitting(true); setResult(null);
        try {
            const payload = {
                ...form,
                core_candidates: JSON.stringify(form.core_candidates.filter(Boolean)),
                triggers: JSON.stringify(form.triggers.filter(Boolean)),
                taboos: JSON.stringify(form.taboos.filter(Boolean)),
                testimonies: JSON.stringify(form.testimonies.filter(Boolean)),
                media_urls: JSON.stringify(form.media_urls.filter(Boolean)),
            };
            const { error } = await supabase.from('anomaly_drafts').insert([payload]);
            if (error) throw error;
            setResult({ ok: true, msg: '怪異調査書を投稿しました！' });
            setForm(INITIAL);
        } catch (err) {
            setResult({ ok: false, msg: `投稿に失敗しました: ${err.message}` });
        } finally { setSubmitting(false); }
    };

    return (
        <div className="container">
            <section className="section">
                <span className="section__title">// CREATE — ANOMALY INVESTIGATION</span>
                <h1 className="section__heading">怪異調査書を作成</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
                    目撃した怪異、調査中の怪異をコミュニティに共有しましょう。
                </p>
                <div className="callout" style={{ marginBottom: 0 }}>
                    <div className="callout__label">注意：</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        本書は未公認の調査書（TMP）です。公認（KAI）への昇格はイベント時のみ行われます。
                    </p>
                </div>
            </section>

            <form onSubmit={handleSubmit}>
                {/* セクション0：メタ情報 */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 0 — META</div>
                    <h2 style={S.sectionHeading}>メタ情報</h2>
                    <div style={S.row}>
                        <FormInput label="投稿者名" value={form.author_name} placeholder="@ユーザー名" onChange={v => set('author_name', v)} />
                        <FormSelect label="公開範囲" value={form.visibility} onChange={v => set('visibility', v)} options={['公開', '限定']} />
                        <FormSelect label="調査状態" value={form.status} onChange={v => set('status', v)} options={OPTIONS.statuses} />
                    </div>
                </div>

                {/* セクション1：暫定分類 */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 1 — CLASSIFICATION</div>
                    <h2 style={S.sectionHeading}>暫定分類</h2>
                    <div style={S.row}>
                        <FormSelect label="存在強度等級" value={form.grade} onChange={v => set('grade', v)} options={OPTIONS.grades} hint={HP_GUIDE[form.grade] ? `HP目安: ${HP_GUIDE[form.grade]}` : ''} />
                        <FormSelect label="脅威度種別" value={form.threat_type} onChange={v => set('threat_type', v)} options={OPTIONS.threats} />
                        <FormSelect label="影響範囲" value={form.influence_range} onChange={v => set('influence_range', v)} options={OPTIONS.ranges} />
                        <FormSelect label="被害性質" value={form.damage_type} onChange={v => set('damage_type', v)} options={OPTIONS.damages} />
                    </div>
                    <div style={S.fieldGroup}>
                        <label style={S.label}>分類タグ</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {OPTIONS.tagOptions.map(tag => (
                                <button key={tag} type="button" style={S.tagBtn(form.tags.includes(tag))} onClick={() => toggleTag(tag)}>#{tag}</button>
                            ))}
                        </div>
                    </div>
                    {form.grade !== '不明' && (
                        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', marginTop: 'var(--space-md)', padding: '12px', background: 'rgba(0,0,0,0.3)', border: 'var(--border-subtle)' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>PREVIEW:</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: GRADE_COLOR[form.grade] }}>{form.grade}</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: THREAT_COLOR[form.threat_type] }}>{form.threat_type}</span>
                            {form.tags.map(t => <span key={t} className="badge badge--cyber">#{t}</span>)}
                        </div>
                    )}
                </div>

                {/* セクション2：概要 */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 2 — OVERVIEW</div>
                    <h2 style={S.sectionHeading}>概要</h2>
                    <FormInput label="怪異の通称 *" value={form.anomaly_name} onChange={v => set('anomaly_name', v)} placeholder="例：深夜廻り" />
                    <FormTextArea label="一行要約" value={form.summary} onChange={v => set('summary', v)} placeholder="例：◯◯すると必ず□□が起きる噂" />
                    <FormTextArea label="典型パターン" value={form.typical_pattern} onChange={v => set('typical_pattern', v)} placeholder="何が起きる？順番は？" />
                    <div style={S.row}>
                        <FormTextArea label="前兆" value={form.omen} onChange={v => set('omen', v)} placeholder="遭遇前に起きる兆候" />
                        <FormTextArea label="最悪ケース" value={form.worst_case} onChange={v => set('worst_case', v)} placeholder="推定でも可" />
                    </div>
                </div>

                {/* セクション3：発生源・拡散 */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 3 — ORIGIN</div>
                    <h2 style={S.sectionHeading}>発生源・拡散</h2>
                    <FormTextArea label="元ネタ（噂の種）" value={form.origin} onChange={v => set('origin', v)} placeholder="伝承 / 学校 / 掲示板 / 動画 / チェーンDM 等" />
                    <FormTextArea label="拡散経路" value={form.spread_route} onChange={v => set('spread_route', v)} placeholder="SNS / 配信 / クローズドコミュニティ 等" />
                    <div style={S.fieldGroup}>
                        <label style={{ ...S.label, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={form.distorted_countermeasure} onChange={e => set('distorted_countermeasure', e.target.checked)} />
                            "歪んだ対策" が流通している
                        </label>
                    </div>
                    {form.distorted_countermeasure && (
                        <div style={S.row}>
                            <FormTextArea label="本来の対策（推定）" value={form.original_countermeasure} onChange={v => set('original_countermeasure', v)} />
                            <FormTextArea label="現在流通している対策" value={form.current_countermeasure} onChange={v => set('current_countermeasure', v)} hint="危険なら赤字で注意喚起" />
                        </div>
                    )}
                </div>

                {/* セクション4：核の推定 */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 4 — CORE</div>
                    <h2 style={S.sectionHeading}>核（Core）の推定</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-lg)', fontStyle: 'italic' }}>怪異は「核」に宿る、または核を中心に増殖する前提で推定を書く。</p>
                    <div style={S.row}>
                        <FormSelect label="核の種別（推定）" value={form.core_type} onChange={v => set('core_type', v)} options={OPTIONS.coreTypes} />
                        <FormSelect label="核の挙動（推定）" value={form.core_behavior} onChange={v => set('core_behavior', v)} options={OPTIONS.coreBehaviors} />
                        <FormSelect label="核の破壊可否（推定）" value={form.core_destroyable} onChange={v => set('core_destroyable', v)} options={OPTIONS.coreDestroyable} />
                    </div>
                    <FormDynamicList label="核の候補" items={form.core_candidates} placeholder="場所 / URL / 物品名 など"
                        onUpdate={(i, v) => updateItem('core_candidates', i, v)} onAdd={() => addItem('core_candidates')} onRemove={(i) => removeItem('core_candidates', i)} />
                </div>

                {/* セクション5：ルール推定 */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 5 — RULES</div>
                    <h2 style={S.sectionHeading}>ルール（Rule）の推定</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-lg)', fontStyle: 'italic' }}>ルールを破るほど逃げられなくなるタイプが多い。確定していなくてOK。</p>
                    <FormDynamicList label="発動条件（トリガー候補）" items={form.triggers} placeholder="トリガー" hint="怪異が動き出すきっかけ"
                        onUpdate={(i, v) => updateItem('triggers', i, v)} onAdd={() => addItem('triggers')} onRemove={(i) => removeItem('triggers', i)} />
                    <FormDynamicList label="禁忌（やってはいけない候補）" items={form.taboos} placeholder="禁忌" hint="破るほど逃げられなくなる"
                        onUpdate={(i, v) => updateItem('taboos', i, v)} onAdd={() => addItem('taboos')} onRemove={(i) => removeItem('taboos', i)} />
                    <FormTextArea label="例外・抜け道（候補）" value={form.loopholes} onChange={v => set('loopholes', v)} placeholder="例：△△を先に行えばセーフ、らしい" />
                    <label style={{ ...S.label, marginTop: 'var(--space-lg)' }}>違反時の症状（段階）</label>
                    <div style={S.row}>
                        <FormInput label="初期" value={form.violation_early} onChange={v => set('violation_early', v)} placeholder="初期症状" />
                        <FormInput label="中期" value={form.violation_mid} onChange={v => set('violation_mid', v)} placeholder="中期症状" />
                        <FormInput label="末期" value={form.violation_late} onChange={v => set('violation_late', v)} placeholder="末期症状" />
                    </div>
                </div>

                {/* セクション6：観測記録 */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 6 — OBSERVATIONS</div>
                    <h2 style={S.sectionHeading}>観測記録</h2>
                    <FormDynamicList label="目撃証言" items={form.testimonies} placeholder="証言"
                        onUpdate={(i, v) => updateItem('testimonies', i, v)} onAdd={() => addItem('testimonies')} onRemove={(i) => removeItem('testimonies', i)} />
                    <FormDynamicList label="記録媒体URL" items={form.media_urls} placeholder="URL" hint="画像・動画・音声・文章のURL"
                        onUpdate={(i, v) => updateItem('media_urls', i, v)} onAdd={() => addItem('media_urls')} onRemove={(i) => removeItem('media_urls', i)} />
                </div>

                {/* セクション7：暫定対処 */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 7 — COUNTERMEASURES</div>
                    <h2 style={S.sectionHeading}>暫定対処</h2>
                    <FormTextArea label="その場の回避" value={form.avoidance} onChange={v => set('avoidance', v)} placeholder="例：視線を切る / 数を数える / 音を止める" />
                    <FormTextArea label="二次被害防止" value={form.secondary_prevention} onChange={v => set('secondary_prevention', v)} placeholder="例：拡散しない / URLを共有しない" />
                    <FormTextArea label="追加調査メモ" value={form.investigation_notes} onChange={v => set('investigation_notes', v)} placeholder="次に検証すべきポイント" />
                </div>

                {/* セクション8：関連リンク */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 8 — LINKS</div>
                    <h2 style={S.sectionHeading}>関連リンク</h2>
                    <div style={S.row}>
                        <FormInput label="関連怪異" value={form.related_anomalies} onChange={v => set('related_anomalies', v)} placeholder="TMP-???" />
                        <FormInput label="関連キャラ" value={form.related_characters} onChange={v => set('related_characters', v)} placeholder="CHAR-???" />
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
                    {submitting ? 'SUBMITTING...' : '▶ 怪異調査書を投稿'}
                </button>
            </form>
        </div>
    );
}
