// キャラクターシート投稿フォーム — クライアントコンポーネント
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { S, FormSelect, FormInput, FormTextArea } from '@/components/FormFields';

// 初期値
const INITIAL = {
    author_name: '', visibility: '公開', image_url: '',
    character_name: '', title: '', age: '', gender: '',
    affiliation: '祓部', awakening: '先天覚醒型',
    attr_shiya: 3, attr_shiki: 3, attr_tai: 3, attr_jutsu: 3, attr_kon: 3, attr_en: 3,
    primary_language: '', secondary_language: '',
    equipment_type: '武装型', equipment_name: '', equipment_maker: '', equipment_detail: '',
    erosion_rate: 0,
    fate: '', backstory: '',
    related_anomalies: '', related_characters: '', related_factions: '',
};

const ATTRS = [
    { key: 'attr_shiya', name: '視野', reading: 'しや', desc: '現場調査・物証収集・怪異の気配察知' },
    { key: 'attr_shiki', name: '識', reading: 'しき', desc: '資料調査・データベース照会・怪異の識別' },
    { key: 'attr_tai', name: '体', reading: 'たい', desc: '直接戦闘・身体的耐久・逃走' },
    { key: 'attr_jutsu', name: '術', reading: 'じゅつ', desc: '魔法行使・魔導具運用・装備操作' },
    { key: 'attr_kon', name: '魂', reading: 'こん', desc: '精神的耐久・侵食への抵抗・恐怖への抵抗' },
    { key: 'attr_en', name: '縁', reading: 'えん', desc: '聞き込み・人脈活用・評判・組織との関係' },
];

const LANGUAGES = [
    { id: 'P', name: 'P', color: '—', desc: '汎用基礎言語。全言語と組み合わせ可能' },
    { id: 'Igniscript', name: 'Igniscript', color: '赤', desc: '燃やす・爆発・熱変容' },
    { id: 'Lupis Surf', name: 'Lupis Surf', color: '青', desc: '流す・包む・圧力' },
    { id: 'Ivyo', name: 'Ivyo', color: '緑', desc: '育てる・自然サイクル' },
    { id: 'NGT', name: 'NGT', color: '黄', desc: '加速・電気的処理・情報解析' },
    { id: 'Monyx', name: 'Monyx', color: '無色', desc: '最小術式・汎用転用' },
    { id: 'P:', name: 'P:', color: '紫', desc: '弱体化・妨害・封印（P派生）' },
    { id: "P'", name: "P'", color: '桃', desc: '回復・強化・修復（P派生）' },
];

const LANG_COLORS = { '赤': '#ff4444', '青': '#4488ff', '緑': '#44cc44', '黄': '#ffcc00', '無色': '#aaaaaa', '紫': '#aa44ff', '桃': '#ff88cc', '—': '#888888' };

const AFFILIATIONS = ['祓部', '傭兵', '無所属'];
const AWAKENINGS = ['先天覚醒型', 'ショック覚醒型', '実験覚醒型', '接触覚醒型'];
const EQUIPMENT_TYPES = ['武装型', '独立型', '半装身型', '全装身型', '搭乗型', '戦闘用搭乗型'];

const EROSION_STAGES = [
    { max: 25, name: '正常', color: '#88cc44', desc: '影響なし' },
    { max: 50, name: '変容の兆し', color: '#ffcc00', desc: '外見に軽微な変化。怪異の「声」が断片的に聞こえ始める' },
    { max: 75, name: '半化の影', color: '#ff8800', desc: '目に見える異形化。怪異の一部の能力が扱えるようになる' },
    { max: 99, name: '臨界', color: '#ff4444', desc: '重度の異形化。強力な異能が使用可能' },
    { max: 100, name: '怪異化', color: '#ff0000', desc: 'キャラクター終了。PCはGMが管理する怪異になる' },
];

const AFFILIATION_INFO = {
    '祓部': { bonus: '識の調査+2（3回/セッション）、援軍要請、古怪班配属で識+1', constraint: '任務命令への服従が義務。装備・行動に法的制限。' },
    '傭兵': { bonus: '装備1ランクUP、縁の情報収集+2（3回/セッション）、初期二つ名+1', constraint: '収益がないと活動困難。バック企業の方針に縛られる。' },
    '無所属': { bonus: '視野判定+1常時、裏ルート（1回/セッション）、改造個体センサー', constraint: '法的保護なし。全組織から警戒される。補給ルート不安定。' },
};

export default function CharacterForm({ editId = null, initialData = null }) {
    const { user } = useUser();
    const router = useRouter();
    const isEdit = !!editId;

    const [form, setForm] = useState(INITIAL);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    // 編集モード
    useEffect(() => {
        if (initialData) setForm(prev => ({ ...prev, ...initialData }));
    }, [initialData]);

    // ユーザー名自動セット
    useEffect(() => {
        if (user && !form.author_name && !isEdit) {
            setForm(prev => ({ ...prev, author_name: `@${user.username || user.firstName || 'user'}` }));
        }
    }, [user, isEdit]);

    const set = useCallback((key, val) => setForm(prev => ({ ...prev, [key]: val })), []);

    // 属性ポイント計算
    const totalPoints = ATTRS.reduce((s, a) => s + (form[a.key] || 0), 0);
    const remaining = 18 - totalPoints;

    // 属性変更（範囲チェック付き）
    const setAttr = useCallback((key, val) => {
        const num = Math.max(1, Math.min(5, parseInt(val) || 1));
        setForm(prev => ({ ...prev, [key]: num }));
    }, []);

    // 侵食段階の取得
    const getErosionStage = (rate) => EROSION_STAGES.find(s => rate <= s.max) || EROSION_STAGES[4];
    const erosionStage = getErosionStage(form.erosion_rate);

    // 投稿処理
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.character_name.trim()) { setResult({ ok: false, msg: 'キャラ名は必須です' }); return; }
        if (remaining !== 0) { setResult({ ok: false, msg: `属性ポイントがちょうど18点になるよう調整してください（現在: ${totalPoints}点）` }); return; }
        setSubmitting(true); setResult(null);
        try {
            const payload = { ...form };
            delete payload.id; delete payload.created_at; delete payload.updated_at; delete payload.user_id;

            const method = isEdit ? 'PATCH' : 'POST';
            const body = isEdit
                ? { table: 'character_sheets', id: editId, data: payload }
                : { table: 'character_sheets', data: payload };

            const res = await fetch('/api/posts', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);

            setResult({ ok: true, msg: isEdit ? 'シートを更新しました！' : 'キャラクターシートを投稿しました！' });
            if (!isEdit) setForm(INITIAL);
            setTimeout(() => router.push(`/community/characters/${json.data?.id || editId}/`), 1500);
        } catch (err) {
            setResult({ ok: false, msg: `${isEdit ? '更新' : '投稿'}に失敗: ${err.message}` });
        } finally { setSubmitting(false); }
    };

    const affInfo = AFFILIATION_INFO[form.affiliation];

    return (
        <div className="container">
            <section className="section">
                <span className="section__title">// {isEdit ? 'EDIT' : 'CREATE'} — CHARACTER SHEET</span>
                <h1 className="section__heading">{isEdit ? 'キャラクターシートを編集' : 'キャラクターシートを作成'}</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
                    {isEdit ? 'シートの内容を修正できます。' : '討伐者のキャラクターシートを作成してコミュニティに共有しましょう。'}
                </p>
            </section>

            <form onSubmit={handleSubmit}>
                {/* SEC 0: メタ */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 0 — META</div>
                    <h2 style={S.sectionHeading}>メタ情報</h2>
                    <div style={S.row}>
                        <FormInput label="投稿者名" value={form.author_name} onChange={v => set('author_name', v)} placeholder="@ユーザー名" />
                        <FormSelect label="公開範囲" value={form.visibility} onChange={v => set('visibility', v)} options={['公開', '限定']} />
                        <FormInput label="キャラ画像URL（任意）" value={form.image_url} onChange={v => set('image_url', v)} placeholder="https://..." />
                    </div>
                </div>

                {/* SEC 1: 基本情報 */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 1 — IDENTITY</div>
                    <h2 style={S.sectionHeading}>基本情報</h2>
                    <div style={S.row}>
                        <FormInput label="キャラ名 *" value={form.character_name} onChange={v => set('character_name', v)} placeholder="例：黒崎 蓮" />
                        <FormInput label="二つ名（任意）" value={form.title} onChange={v => set('title', v)} placeholder="例：封印の名手" />
                    </div>
                    <div style={S.row}>
                        <FormInput label="年齢" value={form.age} onChange={v => set('age', v)} placeholder="例：24" />
                        <FormInput label="性別" value={form.gender} onChange={v => set('gender', v)} placeholder="自由記述" />
                        <FormSelect label="所属 *" value={form.affiliation} onChange={v => set('affiliation', v)} options={AFFILIATIONS} />
                        <FormSelect label="覚醒パターン *" value={form.awakening} onChange={v => set('awakening', v)} options={AWAKENINGS} />
                    </div>
                    {/* 所属ボーナス表示 */}
                    <div style={{ marginTop: 'var(--space-md)', padding: '12px', background: 'rgba(0,0,0,0.3)', border: 'var(--border-subtle)' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', marginBottom: '6px' }}>{form.affiliation}の特性</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-cyber)', marginBottom: '4px' }}>▸ {affInfo.bonus}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>▹ {affInfo.constraint}</div>
                    </div>
                </div>

                {/* SEC 2: 属性配分 */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 2 — ATTRIBUTES</div>
                    <h2 style={S.sectionHeading}>属性配分</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)', padding: '12px', background: 'rgba(0,0,0,0.3)', border: 'var(--border-subtle)' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                            合計: <strong style={{ color: remaining === 0 ? 'var(--accent-cyber)' : 'var(--accent-danger)', fontSize: 'var(--font-size-lg)' }}>{totalPoints}</strong> / 18
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: remaining === 0 ? 'var(--accent-cyber)' : remaining > 0 ? 'var(--accent-gold)' : 'var(--accent-danger)' }}>
                            {remaining === 0 ? '✓ 配分完了' : remaining > 0 ? `残り ${remaining} ポイント` : `${Math.abs(remaining)} ポイント超過！`}
                        </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
                        {ATTRS.map(attr => (
                            <div key={attr.key} style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', border: 'var(--border-subtle)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <div>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)' }}>{attr.name}</span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginLeft: '8px' }}>({attr.reading})</span>
                                    </div>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xl)', fontWeight: 700, color: form[attr.key] >= 4 ? 'var(--accent-gold)' : 'var(--text-primary)' }}>{form[attr.key]}</span>
                                </div>
                                <input type="range" min={1} max={5} value={form[attr.key]} onChange={e => setAttr(attr.key, e.target.value)}
                                    style={{ width: '100%', accentColor: 'var(--accent-cyber)' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                    <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                                </div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '6px' }}>{attr.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SEC 3: 得意言語 */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 3 — LANGUAGE</div>
                    <h2 style={S.sectionHeading}>得意言語</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-lg)', fontStyle: 'italic' }}>
                        魔法使いは通常1つの言語で魔法を行使する。P: と P' は P の習得が前提。
                    </p>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>第一言語</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: 'var(--space-lg)' }}>
                        {LANGUAGES.map(lang => (
                            <button key={lang.id} type="button"
                                onClick={() => set('primary_language', form.primary_language === lang.id ? '' : lang.id)}
                                style={{
                                    padding: '10px 12px', border: form.primary_language === lang.id ? `2px solid ${LANG_COLORS[lang.color]}` : 'var(--border-subtle)',
                                    background: form.primary_language === lang.id ? `${LANG_COLORS[lang.color]}15` : 'rgba(0,0,0,0.2)',
                                    color: form.primary_language === lang.id ? LANG_COLORS[lang.color] : 'var(--text-secondary)',
                                    cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', transition: 'all 0.2s',
                                }}>
                                <div style={{ fontWeight: 700 }}>{lang.name} <span style={{ fontWeight: 400, fontSize: 'var(--font-size-xs)', color: LANG_COLORS[lang.color] }}>({lang.color})</span></div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{lang.desc}</div>
                            </button>
                        ))}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>第二言語（任意）</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                        {LANGUAGES.filter(l => l.id !== form.primary_language).map(lang => (
                            <button key={lang.id} type="button"
                                onClick={() => set('secondary_language', form.secondary_language === lang.id ? '' : lang.id)}
                                style={{
                                    padding: '10px 12px', border: form.secondary_language === lang.id ? `2px solid ${LANG_COLORS[lang.color]}` : 'var(--border-subtle)',
                                    background: form.secondary_language === lang.id ? `${LANG_COLORS[lang.color]}15` : 'rgba(0,0,0,0.2)',
                                    color: form.secondary_language === lang.id ? LANG_COLORS[lang.color] : 'var(--text-secondary)',
                                    cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', transition: 'all 0.2s',
                                }}>
                                <div style={{ fontWeight: 700 }}>{lang.name}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* SEC 4: 装備 */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 4 — EQUIPMENT</div>
                    <h2 style={S.sectionHeading}>主力装備</h2>
                    <div style={S.row}>
                        <FormSelect label="装備種別" value={form.equipment_type} onChange={v => set('equipment_type', v)} options={EQUIPMENT_TYPES} />
                        <FormInput label="装備名" value={form.equipment_name} onChange={v => set('equipment_name', v)} placeholder="例：強化戦術銃【制式型】" />
                        <FormInput label="メーカー" value={form.equipment_maker} onChange={v => set('equipment_maker', v)} placeholder="例：蒼鉄機工" />
                    </div>
                    <FormTextArea label="装備の詳細・カスタム（任意）" value={form.equipment_detail} onChange={v => set('equipment_detail', v)} placeholder="改造内容、特殊機能、入手経緯など" />
                    {form.affiliation === '傭兵' && (
                        <div style={{ padding: '8px 12px', background: 'rgba(0,255,170,0.05)', border: '1px solid rgba(0,255,170,0.2)', marginTop: 'var(--space-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-cyber)' }}>
                            傭兵特典: 装備を1ランク上から選べます
                        </div>
                    )}
                </div>

                {/* SEC 5: 侵食率 */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 5 — EROSION</div>
                    <h2 style={S.sectionHeading}>侵食率</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', marginBottom: 'var(--space-md)' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: erosionStage.color }}>{form.erosion_rate}%</span>
                        <div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: erosionStage.color, fontWeight: 700 }}>{erosionStage.name}</div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', maxWidth: '400px' }}>{erosionStage.desc}</div>
                        </div>
                    </div>
                    <input type="range" min={0} max={100} value={form.erosion_rate} onChange={e => set('erosion_rate', parseInt(e.target.value))}
                        style={{ width: '100%', accentColor: erosionStage.color }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                    </div>
                </div>

                {/* SEC 6: 因縁・バックストーリー */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 6 — STORY</div>
                    <h2 style={S.sectionHeading}>因縁・バックストーリー</h2>
                    <FormTextArea label="因縁" value={form.fate} onChange={v => set('fate', v)} placeholder="何を失ったか、何を追っているか。この世界で戦い続ける理由。" />
                    <FormTextArea label="バックストーリー（任意）" value={form.backstory} onChange={v => set('backstory', v)} placeholder="キャラクターの過去、人間関係、転機となった出来事..." rows={6} />
                </div>

                {/* SEC 7: 関連リンク */}
                <div style={S.section}>
                    <div style={S.sectionTitle}>SECTION 7 — LINKS</div>
                    <h2 style={S.sectionHeading}>関連リンク</h2>
                    <div style={S.row}>
                        <FormInput label="関連怪異" value={form.related_anomalies} onChange={v => set('related_anomalies', v)} placeholder="TMP-??? / KAI-####" />
                        <FormInput label="関連キャラ" value={form.related_characters} onChange={v => set('related_characters', v)} placeholder="CHAR-???" />
                        <FormInput label="関連組織" value={form.related_factions} onChange={v => set('related_factions', v)} placeholder="FAC-???" />
                    </div>
                </div>

                {result && (
                    <div className="callout" style={{ marginBottom: 'var(--space-xl)', borderColor: result.ok ? 'var(--accent-cyber)' : 'var(--accent-danger)' }}>
                        <div className="callout__label" style={{ color: result.ok ? 'var(--accent-cyber)' : 'var(--accent-danger)' }}>{result.ok ? '投稿完了' : 'エラー'}</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{result.msg}</p>
                    </div>
                )}

                <button type="submit" style={S.submitBtn} disabled={submitting || remaining !== 0}
                    onMouseEnter={e => { if (remaining === 0) { e.target.style.background = 'linear-gradient(135deg, rgba(0, 255, 170, 0.3), rgba(0, 170, 255, 0.3))'; e.target.style.boxShadow = '0 0 30px rgba(0, 255, 170, 0.2)'; } }}
                    onMouseLeave={e => { e.target.style.background = 'linear-gradient(135deg, rgba(0, 255, 170, 0.2), rgba(0, 170, 255, 0.2))'; e.target.style.boxShadow = 'none'; }}>
                    {submitting ? 'SUBMITTING...' : isEdit ? '▶ シートを更新' : '▶ キャラクターシートを投稿'}
                </button>
            </form>
        </div>
    );
}
