// RPシート（簡易キャラクターシート）のセクション群
// 戦闘数値を含まない、ロールプレイに必要な情報だけをここで入力する
'use client';

import { S, FormSelect, FormInput, FormTextArea } from '@/components/FormFields';
import ImageUploader from '@/components/ImageUploader';
import '@/components/ImageUploader.css';
import { AFFILIATIONS, AFFILIATION_INFO, ASSIGNMENTS, AWAKENINGS, abilityName, assignmentLabel } from '@/data/characterBuildData';
import { cardStyle, cardTitle, cardDesc, gridCards, infoBox, FormSection, SubHead } from './formStyles';

const AFF_ACCENT = { '祓部': 'var(--faction-haraebe)', '傭兵': '#5b8fd0', '無所属': '#a0a0b0' };

const FANART_ITEMS = [
    { key: 'coupling', label: 'カップリング表現' },
    { key: 'bl', label: 'BL' },
    { key: 'gl', label: 'GL' },
    { key: 'nl', label: 'NL' },
    { key: 'yume', label: '夢表現' },
    { key: 'commission', label: 'FAの外部発注' },
    { key: 'body_change', label: '身体的特徴の変更' },
    { key: 'gender_swap', label: '性転換' },
    { key: 'hairstyle_change', label: '髪型変更' },
    { key: 'costume_change', label: '衣装変更' },
    { key: 'parody', label: 'パロディ' },
    { key: 'mild_sexual', label: '性表現（軽度）' },
    { key: 'mild_violence', label: '暴力（軽度の傷や流血）' },
    { key: 'r18', label: 'R18' },
    { key: 'r18g', label: 'R18G' },
];
const FA_STYLE = {
    ok:  { bg: 'rgba(0,255,170,0.15)', border: '1px solid rgba(0,255,170,0.4)', color: '#00ffaa', label: 'OK' },
    ask: { bg: 'rgba(255,170,0,0.15)', border: '1px solid rgba(255,170,0,0.4)', color: '#ffaa00', label: '要相談' },
    ng:  { bg: 'rgba(255,77,77,0.15)', border: '1px solid rgba(255,77,77,0.4)', color: '#ff4d4d', label: 'NG' },
};

export default function RpSections({ form, set, isEdit }) {
    const affInfo = AFFILIATION_INFO[form.affiliation] || AFFILIATION_INFO['祓部'];
    const assignments = ASSIGNMENTS[form.affiliation] || [];

    return (
        <>
            {/* ====== STEP 1: 名前と立場 ====== */}
            <FormSection id="rp-identity" no={1} en="IDENTITY" title="名前と立場" required
                effect="キャラ名だけあればシートは作れる。所属は世界の中での立ち位置、覚醒は討伐者になった経緯。"
                status={{ done: !!form.character_name.trim(), label: form.character_name.trim() ? '入力済み' : 'キャラ名が必要' }}>
                <div style={S.row}>
                    <FormInput label="キャラ名 *" value={form.character_name} onChange={v => set('character_name', v)} placeholder="例：黒崎 蓮" />
                    <FormInput label="フリガナ" value={form.character_name_kana} onChange={v => set('character_name_kana', v)} placeholder="例：くろさき れん" />
                    <FormInput label="二つ名（任意）" value={form.title} onChange={v => set('title', v)} placeholder="例：封印の名手" />
                </div>
                <div style={S.row}>
                    <FormInput label="年齢" value={form.age} onChange={v => set('age', v)} placeholder="例：24" />
                    <FormInput label="性別" value={form.gender} onChange={v => set('gender', v)} placeholder="自由記述" />
                    <FormInput label="投稿者名" value={form.author_name} onChange={v => set('author_name', v)} placeholder="@ユーザー名" />
                    <FormSelect label="公開範囲" value={form.visibility} onChange={v => set('visibility', v)} options={['公開', '限定']} />
                </div>

                {/* 所属 */}
                <SubHead>所属 — どこに身を置くか</SubHead>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: 'var(--space-sm)' }}>
                    {AFFILIATIONS.map(aff => {
                        const selected = form.affiliation === aff;
                        return (
                            <button key={aff} type="button"
                                onClick={() => { if (!selected) { set('affiliation', aff); set('sub_affiliation', ''); } }}
                                style={{ ...cardStyle(selected, AFF_ACCENT[aff]), flex: '1', minWidth: '160px' }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--font-size-md)', color: selected ? AFF_ACCENT[aff] : 'var(--text-primary)' }}>
                                    {aff} <span style={{ fontSize: '10px', fontWeight: 400, letterSpacing: '0.1em', opacity: 0.7 }}>{AFFILIATION_INFO[aff].en}</span>
                                </div>
                                <div style={cardDesc}>{AFFILIATION_INFO[aff].tagline}</div>
                            </button>
                        );
                    })}
                </div>
                <div style={{ ...infoBox, marginBottom: 'var(--space-lg)' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', marginBottom: '4px' }}>▸ {affInfo.bonus}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>▹ {affInfo.constraint}</div>
                </div>

                {/* 配属（任意。ゲームデータでB昇格に使う） */}
                <SubHead>{assignmentLabel(form.affiliation)} — 所属の中での役割（任意）</SubHead>
                <div style={gridCards}>
                    {assignments.map(asn => {
                        const selected = form.sub_affiliation === asn.id;
                        return (
                            <button key={asn.id} type="button" onClick={() => set('sub_affiliation', selected ? '' : asn.id)} style={cardStyle(selected, '#44aaff')}>
                                <div style={cardTitle(selected, '#44aaff')}>{asn.id}</div>
                                <div style={cardDesc}>{asn.desc}</div>
                                <div style={{ fontSize: '10px', color: '#44aaff', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>ゲームデータ：{abilityName(asn.upgrade)} → B</div>
                            </button>
                        );
                    })}
                </div>

                {/* 覚醒パターン */}
                <SubHead color="#aa44ff">覚醒パターン — どうやって討伐者になったか</SubHead>
                <div style={gridCards}>
                    {AWAKENINGS.map(awk => {
                        const selected = form.awakening === awk.id;
                        return (
                            <button key={awk.id} type="button" onClick={() => set('awakening', awk.id)} style={cardStyle(selected, '#aa44ff')}>
                                <div style={cardTitle(selected, '#aa44ff')}>{awk.id}</div>
                                <div style={cardDesc}>{awk.desc}</div>
                                <div style={{ fontSize: '10px', color: '#aa44ff', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>ゲームデータ：{awk.effect}</div>
                            </button>
                        );
                    })}
                </div>
            </FormSection>

            {/* ====== STEP 2: 見た目・性格・口調 ====== */}
            <FormSection id="rp-profile" no={2} en="PROFILE" title="見た目・性格・口調"
                effect="セッションで他のプレイヤーが最初に触れる情報。短くてもいいので、目を引く特徴を1つ。"
                status={{ done: !!(form.appearance || form.personality || form.speech_style) }}>
                <div style={S.row}>
                    <ImageUploader label="サムネイル" value={form.thumbnail_url} onChange={v => set('thumbnail_url', v)} folder="characters" hint="推奨 3:4（600×800px）— RPシート・資格証・詳細ページのメイン画像" />
                    <ImageUploader label="アイコン" value={form.icon_url} onChange={v => set('icon_url', v)} folder="characters" compact hint="推奨 1:1（200×200px）— 一覧カード・SNS投稿の丸アイコン" />
                </div>
                <FormTextArea label="外見" value={form.appearance} onChange={v => set('appearance', v)} placeholder="身長・体格・髪・瞳・服装・目を引く特徴など" />
                <FormTextArea label="性格" value={form.personality} onChange={v => set('personality', v)} placeholder="基本的な気質、対人傾向、譲れない信条など" />
                <FormTextArea label="口調・一人称" value={form.speech_style} onChange={v => set('speech_style', v)} placeholder="一人称・二人称、話し方の癖、口癖など" />
                <details>
                    <summary style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: 'var(--space-sm)' }}>追加画像（最大3枚）</summary>
                    <div style={S.row}>
                        {form.image_urls.map((url, i) => (
                            <ImageUploader key={i} label={`画像${i + 1}`} value={url} onChange={v => { const a = [...form.image_urls]; a[i] = v; set('image_urls', a); }} folder="characters" hint="推奨 16:9（例: 1200×675px）" />
                        ))}
                    </div>
                </details>
            </FormSection>

            {/* ====== STEP 3: 来歴と因縁 ====== */}
            <FormSection id="rp-story" no={3} en="STORY" title="来歴と因縁"
                effect="なぜ怪異と戦うのか。動機が1つあればキャラクターは動き出す（喪失・使命・贖罪・知的欲求・生存・復讐・保護・自分への恐怖）。"
                status={{ done: !!(form.brief_history || form.fate || form.backstory) }}>
                <div style={S.fieldGroup}>
                    <label style={S.label}>簡略来歴（250文字以内） — 資格証・RPシートに表示</label>
                    <textarea
                        value={form.brief_history}
                        onChange={e => { if (e.target.value.length <= 250) set('brief_history', e.target.value); }}
                        maxLength={250}
                        placeholder="例：灰嶺市底澱出身。幼少期に怪異に家族を奪われ、独学で祓いの術を身につけた。祓部への入隊を拒み、裏社会の情報網を頼りに単独で怪異を追い続けている。「あの日の借りは、必ず返す」——それだけが、この街で生き延びる理由。"
                        style={{ ...S.textarea, fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }}
                    />
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: form.brief_history.length >= 230 ? '#ffaa00' : 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>
                        {form.brief_history.length} / 250
                    </div>
                </div>
                <FormTextArea label="因縁 — 何を失い、何を追っているか" value={form.fate} onChange={v => set('fate', v)} placeholder="この世界で戦い続ける理由。" />
                <FormTextArea label="バックストーリー（任意）" value={form.backstory} onChange={v => set('backstory', v)} placeholder="キャラクターの過去、人間関係、転機となった出来事..." />
                <div style={S.row}>
                    <FormInput label="関連怪異" value={form.related_anomalies} onChange={v => set('related_anomalies', v)} placeholder="TMP-??? / KAI-####" />
                    <FormInput label="関連キャラ" value={form.related_characters} onChange={v => set('related_characters', v)} placeholder="CHAR-???" />
                    <FormInput label="関連組織" value={form.related_factions} onChange={v => set('related_factions', v)} placeholder="FAC-???" />
                </div>
            </FormSection>

            {/* ====== STEP 4: 二次創作ガイドライン ====== */}
            <FormSection id="rp-fanart" no={4} en="FANART POLICY" title="二次創作ガイドライン"
                effect="このキャラクターのファンアートで許可する表現。RPシート・資格証に反映される。あとから変更できる。"
                status={{ done: Object.values(form.fanart_policy || {}).some(v => v && v !== 'ng'), label: Object.values(form.fanart_policy || {}).some(v => v && v !== 'ng') ? '設定済み' : '全てNG（初期値）' }}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: 'var(--space-sm)', flexWrap: 'wrap' }}>
                    {['ok', 'ask', 'ng'].map(v => (
                        <button key={v} type="button"
                            onClick={() => set('fanart_policy', { ...(form.fanart_policy || {}), ...Object.fromEntries(FANART_ITEMS.map(i => [i.key, v])) })}
                            style={{ padding: '3px 10px', fontSize: '10px', fontFamily: 'var(--font-mono)', cursor: 'pointer', background: 'transparent', border: '1px dashed rgba(255,255,255,0.15)', color: FA_STYLE[v].color }}>
                            すべて{FA_STYLE[v].label}にする
                        </button>
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px' }}>
                    {FANART_ITEMS.map(item => {
                        const val = (form.fanart_policy || {})[item.key] || 'ng';
                        return (
                            <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', background: 'rgba(0,0,0,0.2)', border: 'var(--border-subtle)' }}>
                                <span style={{ flex: 1, fontSize: '12px', color: 'var(--text-primary)' }}>{item.label}</span>
                                {['ok', 'ask', 'ng'].map(v => {
                                    const on = val === v;
                                    return (
                                        <button key={v} type="button"
                                            onClick={() => set('fanart_policy', { ...(form.fanart_policy || {}), [item.key]: v })}
                                            style={{
                                                padding: '2px 8px', fontSize: '10px', fontFamily: 'var(--font-mono)', cursor: 'pointer',
                                                fontWeight: on ? 700 : 400,
                                                background: on ? FA_STYLE[v].bg : 'transparent',
                                                border: on ? FA_STYLE[v].border : '1px solid rgba(255,255,255,0.06)',
                                                color: on ? FA_STYLE[v].color : 'var(--text-muted)',
                                            }}>
                                            {FA_STYLE[v].label}
                                        </button>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
                <div style={{ marginTop: 'var(--space-md)' }}>
                    <FormTextArea label="備考（任意）" value={(form.fanart_policy || {}).note || ''} onChange={v => set('fanart_policy', { ...(form.fanart_policy || {}), note: v })} placeholder="その他の条件や補足事項があれば記入..." />
                </div>
                <SubHead>SNSアカウント（任意）— プレイヤーの連絡先としてシートに表示</SubHead>
                <div style={{ ...S.row, marginBottom: 0 }}>
                    <FormInput label="X（旧Twitter）" value={form.social_x} onChange={v => set('social_x', v)} placeholder="@username" />
                    <FormInput label="VRChat" value={form.social_vrc} onChange={v => set('social_vrc', v)} placeholder="VRChat表示名" />
                    <FormInput label="URL" value={form.social_url} onChange={v => set('social_url', v)} placeholder="https://..." />
                </div>
            </FormSection>
        </>
    );
}
