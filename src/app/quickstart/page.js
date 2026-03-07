// クイックスタート — キャラクター作成ガイド＆能力解説
import Link from 'next/link';

export const metadata = {
    title: 'クイックスタート — 電脳怪異譚 KAI-I//KILL',
    description: 'キャラクター作成の手順と、七つの能力値・ダイスシステム・共鳴記録の解説。',
};

export default function QuickstartPage() {
    return (
        <div className="container">
            {/* ページヘッダー */}
            <div className="page-header">
                <div className="page-header__badge">QUICKSTART GUIDE</div>
                <h1 className="page-header__title">クイックスタート</h1>
                <div className="page-header__subtitle">電脳怪異譚　KAI-I//KILL — 討伐者ハンドブック</div>
            </div>

            <div className="callout" style={{ marginBottom: 'var(--space-2xl)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
                    はじめてキャラクターを作る人向けのガイド。このページだけでキャラクター作成の全体像が掴める。
                    詳細なルールはGMが持つルールブックを参照。
                </p>
            </div>

            {/* ===== ダイスシステム ===== */}
            <section className="section">
                <div className="section__number">01 — DICE SYSTEM</div>
                <h2 className="section__heading">
                    ダイスシステム
                    <span className="section__heading-en">RANK DICE POOL</span>
                </h2>
            </section>

            <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <p className="section__desc" style={{ marginBottom: 'var(--space-lg)' }}>
                    能力値のランクに応じて振れるダイスの数が変わる。高ランクほど選択肢が増え、判定が安定する。
                </p>

                <div className="content-body" style={{ marginBottom: 'var(--space-lg)' }}>
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>ランク</th>
                                <th style={{ width: '100px' }}>ダイス数</th>
                                <th>イメージ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><span className="badge badge--muted">D</span></td>
                                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)' }}>1d6</td>
                                <td>初期値。出目がそのまま結果になる。祈るしかない</td>
                            </tr>
                            <tr>
                                <td><span className="badge badge--grade-2">C</span></td>
                                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)' }}>2d6</td>
                                <td>一人前。2つ振って良い方を選べる余裕が生まれる</td>
                            </tr>
                            <tr>
                                <td><span className="badge badge--grade-2">B</span></td>
                                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)' }}>3d6</td>
                                <td>熟練。安定して成功を狙える。クラス特化の領域</td>
                            </tr>
                            <tr>
                                <td><span className="badge badge--grade-special">A</span></td>
                                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)' }}>4d6</td>
                                <td>達人。初期作成では到達できない。成長の先にある</td>
                            </tr>
                            <tr>
                                <td><span className="badge badge--grade-special">S</span></td>
                                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)' }}>4d6+特典</td>
                                <td>規格外。物語の果てに辿り着く者だけが持つ領域</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="callout">
                    <div className="callout__label">判定の読み方：</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        ダイスを振ったら1個を<span className="text-gold">「達成値ダイス」</span>、別の1個を<span className="text-gold">「共鳴ダイス」</span>として選ぶ。達成値4以上で成功。出目6はスペシャル（自動成功＋追加効果）、出目1はファンブル（自動失敗）。
                    </p>
                </div>
            </div>

            {/* ===== 七つの能力値 ===== */}
            <section className="section">
                <div className="section__number">02 — ATTRIBUTES</div>
                <h2 className="section__heading">
                    七つの能力値
                    <span className="section__heading-en">SEVEN STATS</span>
                </h2>
            </section>

            <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <p className="section__desc" style={{ marginBottom: 'var(--space-lg)' }}>
                    キャラクターの基礎を決める七つの数値。全てランクDからスタートし、背景・クラス・覚醒パターンで引き上げる。
                </p>

                <div className="content-body" style={{ marginBottom: 'var(--space-lg)' }}>
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '70px' }}>能力値</th>
                                <th style={{ width: '120px' }}>読み</th>
                                <th>何に使うか</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: 'var(--font-size-lg)' }}>体</td>
                                <td>たい</td>
                                <td>肉体の強さ・耐久力。近接攻撃、耐久判定、重装備の運用に使う</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: 'var(--font-size-lg)' }}>疾</td>
                                <td>しつ</td>
                                <td>速さ・反射神経。回避、先制判定、逃走、射撃の命中に使う</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: 'var(--font-size-lg)' }}>識</td>
                                <td>しき</td>
                                <td>知識・情報処理能力。調査、データベース検索、ハッキング、魔法言語の読解に使う</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: 'var(--font-size-lg)' }}>判</td>
                                <td>はん</td>
                                <td>判断力・推理力。解明判定、怪異のルール推測、NPC交渉、状況分析に使う</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: 'var(--font-size-lg)' }}>察</td>
                                <td>さつ</td>
                                <td>知覚・直感。怪異の気配の察知、罠の発見、嘘の看破、周囲の異変に使う</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: 'var(--font-size-lg)' }}>術</td>
                                <td>じゅつ</td>
                                <td>魔法の行使能力。魔法言語による詠唱、魔導具の起動、魔法的な干渉に使う</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: 'var(--font-size-lg)' }}>魂</td>
                                <td>たましい</td>
                                <td>精神力・意志の強さ。異能の発動、恐怖への抵抗、封印処理に使う</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ===== キャラクター作成手順 ===== */}
            <section className="section">
                <div className="section__number">03 — CHARACTER CREATION</div>
                <h2 className="section__heading">
                    作成手順
                    <span className="section__heading-en">STEP BY STEP</span>
                </h2>
            </section>

            <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <p className="section__desc" style={{ marginBottom: 'var(--space-lg)' }}>
                    9つのステップでキャラクターが完成する。全能力値ランクDから始まり、選択によってランクが上がっていく。
                </p>

                {/* STEP 1: 背景 */}
                <div style={{ background: 'var(--bg-card)', padding: 'var(--space-lg)', border: 'var(--border-subtle)', marginBottom: 'var(--space-md)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
                        STEP 1 — BACKGROUND
                    </div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>背景を選ぶ</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8, marginBottom: 'var(--space-md)' }}>
                        キャラクターの出自を決める。選んだ背景に応じて<span className="text-gold">2つの能力値がDからCに昇格</span>し、初期効果が付与される。
                    </p>
                    <div className="content-body">
                        <table>
                            <thead>
                                <tr>
                                    <th>背景</th>
                                    <th>C昇格</th>
                                    <th>初期効果</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>神社育ち</td>
                                    <td style={{ whiteSpace: 'nowrap' }}>察・魂</td>
                                    <td>禁足地データベースへの非公式アクセス。古い怪異の解明難易度−1</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>元傭兵</td>
                                    <td style={{ whiteSpace: 'nowrap' }}>体・疾</td>
                                    <td>武装型・半装身型装備のCP+4。護衛への初回攻撃に+1</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>都市伝説研究者</td>
                                    <td style={{ whiteSpace: 'nowrap' }}>識・判</td>
                                    <td>調査判定スペシャル時に解明鍵の追加入手の可能性</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>元実験体</td>
                                    <td style={{ whiteSpace: 'nowrap' }}>魂＋異能+1</td>
                                    <td>渇望ギフトのコスト軽減</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>ハッカー上がり</td>
                                    <td style={{ whiteSpace: 'nowrap' }}>識・疾</td>
                                    <td>NGT魔法判定に+1。独立型装備のCP+3</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>魔法資格持ち</td>
                                    <td style={{ whiteSpace: 'nowrap' }}>術・識</td>
                                    <td>選択した魔法言語の+1修正が拡張。怪異誘発率の改善</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* STEP 2: クラス */}
                <div style={{ background: 'var(--bg-card)', padding: 'var(--space-lg)', border: 'var(--border-subtle)', marginBottom: 'var(--space-md)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
                        STEP 2 — CLASS
                    </div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>クラスを選ぶ</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8, marginBottom: 'var(--space-md)' }}>
                        戦闘と探索のスタイルを決める。<span className="text-gold">1つの能力値がBランクに昇格</span>し、クラス固有の特技を得る。
                    </p>
                    <div className="content-body">
                        <table>
                            <thead>
                                <tr>
                                    <th>クラス</th>
                                    <th>B昇格</th>
                                    <th>クラス特技</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>祓士</td>
                                    <td style={{ whiteSpace: 'nowrap' }}>魂→B</td>
                                    <td>浄化ギフトを1段階低い覚醒段階から使用可能</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>機甲士</td>
                                    <td style={{ whiteSpace: 'nowrap' }}>体→B</td>
                                    <td>護衛への連鎖ダメージ条件が緩和される</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>解明師</td>
                                    <td style={{ whiteSpace: 'nowrap' }}>判→B</td>
                                    <td>解明完了宣言時に討伐クロック追加−1</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>情報屋</td>
                                    <td style={{ whiteSpace: 'nowrap' }}>識→B</td>
                                    <td>怪異予兆カードの公開条件を任意タイミングに変更可（1回）</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* STEP 3: 所属 */}
                <div style={{ background: 'var(--bg-card)', padding: 'var(--space-lg)', border: 'var(--border-subtle)', marginBottom: 'var(--space-md)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
                        STEP 3 — AFFILIATION
                    </div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>所属を選ぶ</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8, marginBottom: 'var(--space-md)' }}>
                        使えるリソースと縛りの両方が決まる。詳細は<Link href="/organizations/" style={{ color: 'var(--accent-gold)' }}>組織・人物ページ</Link>を参照。
                    </p>
                    <div className="content-body">
                        <table>
                            <thead>
                                <tr>
                                    <th>所属</th>
                                    <th>強み</th>
                                    <th>制約</th>
                                    <th style={{ width: '100px' }}>PL上限</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>祓部</td>
                                    <td>データベース+2（識判定）、援軍要請</td>
                                    <td>命令服従義務、装備・行動制限</td>
                                    <td><span className="text-gold">祓士まで</span></td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>傭兵</td>
                                    <td>装備1ランク上、コネクション+2、初期二つ名</td>
                                    <td>収益不安定、法的保護が限定的</td>
                                    <td><span className="text-gold">Cランクまで</span></td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>無所属</td>
                                    <td>察+1常時、裏ルート、勘判定</td>
                                    <td>法的保護なし、補給不安定、情報に疎い</td>
                                    <td style={{ color: 'var(--text-muted)' }}>制限なし</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* STEP 4: 覚醒パターン */}
                <div style={{ background: 'var(--bg-card)', padding: 'var(--space-lg)', border: 'var(--border-subtle)', marginBottom: 'var(--space-md)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
                        STEP 4 — AWAKENING
                    </div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>覚醒パターンを選ぶ</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8, marginBottom: 'var(--space-md)' }}>
                        素養がどう目覚めたかを決める。キャラクターの過去と初期ステータスに影響する。
                    </p>
                    <div className="content-body">
                        <table>
                            <thead>
                                <tr>
                                    <th>パターン</th>
                                    <th>概要</th>
                                    <th>機械的特徴</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>先天覚醒型</td>
                                    <td>生まれつき素養を持ち訓練で開花</td>
                                    <td>術or魂がCでスタート（追加）</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>ショック覚醒型</td>
                                    <td>怪異に関わる強烈な体験が引き金</td>
                                    <td>恨み・喪失の判定+1。初期信念+1</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>実験覚醒型</td>
                                    <td>人体実験で強制覚醒</td>
                                    <td>異能+1</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: 700, color: 'var(--text-heading)', whiteSpace: 'nowrap' }}>接触覚醒型</td>
                                    <td>怪異の核や特殊素材に長期接触</td>
                                    <td>察判定に常時+1</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* STEP 5-9 */}
                <div style={{ background: 'var(--bg-card)', padding: 'var(--space-lg)', border: 'var(--border-subtle)', marginBottom: 'var(--space-lg)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
                        STEP 5〜9 — FINISHING
                    </div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-md)' }}>仕上げ</h3>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
                        <p style={{ marginBottom: 'var(--space-sm)' }}><span className="text-gold">5. 初期ギフトを1つ選ぶ</span> — 鍵の直感、生還の意地、装備の鬼、ネットワーク、固有異能、魔法師の直感から選択</p>
                        <p style={{ marginBottom: 'var(--space-sm)' }}><span className="text-gold">6. 装備をCPの範囲内で選ぶ</span> — 所属によって使える装備のグレードが変わる</p>
                        <p style={{ marginBottom: 'var(--space-sm)' }}><span className="text-gold">7. 信念を設定する</span> — 最大5点でスタート。消費して判定を振り直せる</p>
                        <p><span className="text-gold">8. 怪異予兆カードをGMから受け取る</span> — セッション開始時に配布される</p>
                    </div>
                </div>
            </div>

            {/* ===== 共鳴記録 ===== */}
            <section className="section">
                <div className="section__number">04 — RESONANCE</div>
                <h2 className="section__heading">
                    《共鳴記録》
                    <span className="section__heading-en">EMOTION RESONANCE</span>
                </h2>
            </section>

            <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <p className="section__desc" style={{ marginBottom: 'var(--space-lg)' }}>
                    判定のたびに感情が蓄積する。共鳴が深まればギフトが解放されるが、10点に達すると代償が来る。<span className="text-gold">浄化だけは臨界が恩恵になる。</span>
                </p>

                <div className="content-body" style={{ marginBottom: 'var(--space-lg)' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>感情</th>
                                <th>上昇する場面</th>
                                <th>臨界（10点）の代償</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ fontWeight: 700, color: '#8b2020' }}>恐怖</td>
                                <td>逃走・防御に失敗した時、怪異のルールを破った時</td>
                                <td>次の魂判定が自動ファンブル</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 700, color: '#cc4400' }}>怒り</td>
                                <td>攻撃スペシャル時、仲間が傷ついた時の行動</td>
                                <td>1ラウンド強制：最も近い敵への最大火力攻撃のみ</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 700, color: '#4488cc' }}>哀愁</td>
                                <td>解明鍵を入手した時、NPCとの別れの場面</td>
                                <td>次の調査判定すべて−1。信念1消費</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 700, color: '#cc8800' }}>焦燥</td>
                                <td>制限ラウンド残り1で行動した時、手がかりを失った時</td>
                                <td>次の行動宣言を先に公開（奇襲不可）</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 700, color: '#8844aa' }}>渇望</td>
                                <td>異能・特殊素材装備を使用した時</td>
                                <td>次の異能使用のコストが倍増</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 700, color: '#44aa88' }}>浄化</td>
                                <td>解明完了宣言成功時、信念を全消費した時</td>
                                <td style={{ color: 'var(--accent-gold)' }}>代償なし。大浄化ギフト発動</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="two-col" style={{ marginBottom: 'var(--space-lg)' }}>
                    <div style={{ background: 'var(--bg-card)', padding: 'var(--space-lg)', border: 'var(--border-subtle)' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-gold)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
                            AWAKENING GIFTS
                        </div>
                        <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>覚醒ギフト</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
                            共鳴メーターが<span className="text-gold">1〜3点で初級</span>、<span className="text-gold">4〜6点で中級</span>、<span className="text-gold">7〜9点で上級</span>のギフトが解放される。感情を溜めるほど強い力が使えるが、臨界に近づく。
                        </p>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: 'var(--space-lg)', border: 'var(--border-subtle)' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--accent-danger)', letterSpacing: '0.1em', marginBottom: 'var(--space-xs)' }}>
                            CRITICAL
                        </div>
                        <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>臨界</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.8 }}>
                            10点に達すると代償が発動し、メーターは0にリセットされる。<span className="text-gold">浄化だけは代償ではなく大浄化（味方全体への恩恵）が発動する。</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* ===== リンク ===== */}
            <section className="section">
                <div className="section__number">MORE — DEEP DIVE</div>
                <h2 className="section__heading">
                    もっと知る
                    <span className="section__heading-en">FURTHER READING</span>
                </h2>
            </section>

            <div className="card-grid" style={{ marginBottom: 'var(--space-3xl)' }}>
                <Link href="/organizations/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card">
                        <div className="card__icon">✕</div>
                        <div className="card__title-en">FACTIONS</div>
                        <h3 className="card__title">組織・人物</h3>
                        <p className="card__desc">
                            祓部・傭兵・無所属の詳細。作成制限・ランクシステム・キャラクター例を収録。
                        </p>
                    </div>
                </Link>
                <Link href="/anomalies/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card">
                        <div className="card__icon">△</div>
                        <div className="card__title-en">ANOMALIES</div>
                        <h3 className="card__title">怪異・能力・装備</h3>
                        <p className="card__desc">
                            怪異の等級・二つの力・装備体系の概要。
                        </p>
                    </div>
                </Link>
                <Link href="/world/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card">
                        <div className="card__icon">◉</div>
                        <div className="card__title-en">WORLD BIBLE</div>
                        <h3 className="card__title">世界観バイブル</h3>
                        <p className="card__desc">
                            世界の成り立ち・魔法インフラ・怪異のメカニズムの全文。
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
