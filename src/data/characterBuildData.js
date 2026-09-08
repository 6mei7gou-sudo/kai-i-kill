// =====================================================
// キャラクター作成 共有データモジュール（v4.0 準拠）
// 正本：docs/rules/rules_unified.md CHAPTER 9（キャラクター作成）
// CharacterForm（作成フォーム）・CharacterDetail（詳細）・
// /quickstart/（ガイド）が同じ定義を参照する。
// ここを変えたら 3 箇所すべてに反映される。
// =====================================================

// ── ランクとダイス ──
export const RANKS = ['D', 'C', 'B', 'A', 'S'];
export const RANK_VALUE = { D: 0, C: 1, B: 2, A: 3, S: 4 };
export const RANK_DICE = { D: '1d6', C: '2d6', B: '3d6', A: '4d6', S: '4d6+特典' };
export const RANK_LABEL = {
    D: '初期値。出目がそのまま結果になる',
    C: '一人前。2つ振って良い方を選べる',
    B: '熟練。配属特化の領域',
    A: '達人。成長の先にある',
    S: '規格外。物語の果てに辿り着く者だけの領域',
};
export const RANK_COLOR = { S: '#ff4444', A: '#ffcc00', B: '#d4af37', C: '#88aacc', D: '#8a8a9a' };

// ── 七つの能力値 ──
export const ABILITIES = [
    { key: 'rank_tai',   name: '体', reading: 'たい',  desc: '格闘・突破・物理耐久',         use: '近接攻撃、耐久判定、重装備の運用、援護' },
    { key: 'rank_haya',  name: '疾', reading: 'はや',  desc: '先手・回避・追跡',             use: '回避、先制、逃走、射撃の命中' },
    { key: 'rank_shiki', name: '識', reading: 'しき',  desc: '調査・知識・文献・解明',       use: '調査、データベース検索、ハッキング、魔法言語の読解' },
    { key: 'rank_han',   name: '判', reading: 'はん',  desc: '解明宣言・看破・戦術判断',     use: '解明判定、怪異のルール推測、NPC交渉、状況分析' },
    { key: 'rank_shiya', name: '察', reading: 'さつ',  desc: '怪異感知・観察・証言聴取',     use: '気配の察知、罠の発見、嘘の看破、周囲の異変' },
    { key: 'rank_jutsu', name: '術', reading: 'じゅつ', desc: '魔法行使・魔導具操作',         use: '魔法言語による詠唱、魔導具の起動、魔法的な干渉' },
    { key: 'rank_kon',   name: '魂', reading: 'こん',  desc: '信念維持・精神防御',           use: '恐怖への抵抗、浄化、封印処理' },
];
export const ABILITY_BY_KEY = Object.fromEntries(ABILITIES.map(a => [a.key, a]));
export const abilityName = (key) => ABILITY_BY_KEY[key]?.name || key;

// ── 所属 ──
export const AFFILIATIONS = ['祓部', '傭兵', '無所属'];
export const AFFILIATION_INFO = {
    '祓部':   { en: 'HARAEBE',      assignmentLabel: '配属班', bonus: '識の調査+2（3回/セッション）＋援軍要請1回', constraint: '任務命令への服従が義務。装備・行動に法的制限', tagline: '公的な怪異対処組織。組織の歯車として動き、現場で成長する' },
    '傭兵':   { en: 'MERCENARY',    assignmentLabel: '専門',   bonus: '装備1ランクUP、二つ名+1（常時）', constraint: '収益がないと活動困難。バック企業の方針に縛られる', tagline: 'ライセンスを持つ請負人。契約と実績の世界' },
    '無所属': { en: 'UNAFFILIATED', assignmentLabel: '流儀',   bonus: '察+1常時、裏ルート（1回/セッション）', constraint: '法的保護なし。全組織から警戒。補給ルート不安定', tagline: '組織に属せない者。何も持たないが生き延びてきた' },
};

// ── 背景（6種）— 2能力値がC昇格 + 背景スキル自動取得 ──
export const BACKGROUNDS = [
    { id: '神社育ち',       upgrades: ['rank_shiya', 'rank_kon'],  desc: '禁足地のデータベースへのアクセス権。古い怪異の解明鍵①の難易度-1' },
    { id: '鋼の肉体',       upgrades: ['rank_tai', 'rank_haya'],   desc: '武装型・半装身型装備のCP+4。護衛への初回攻撃に+1修正' },
    { id: '都市伝説研究者', upgrades: ['rank_shiki', 'rank_han'],  desc: '調査スペシャル時に解明鍵追加入手の可能性' },
    { id: '元実験体',       upgrades: ['rank_kon'],                desc: '魂C昇格。渇望の覚醒ギフトを1段階低コストで使用可能' },
    { id: 'ハッカー上がり', upgrades: ['rank_shiki', 'rank_haya'], desc: 'NGT魔法判定+1。独立型装備のCP+3' },
    { id: '魔道資格者',     upgrades: ['rank_jutsu', 'rank_shiki'], desc: '選択した魔法言語の+1修正が2状況に拡張。怪異誘発の確率が1ランク改善' },
];
export const BACKGROUND_BY_ID = Object.fromEntries(BACKGROUNDS.map(b => [b.id, b]));

// ── 配属（所属に連動）— 1能力値がB昇格 + 配属スキル解放 ──
export const ASSIGNMENTS = {
    '祓部': [
        { id: '古怪班',   upgrade: 'rank_shiki', desc: '古い怪異の調査・解明特化。伝承・禁足地の知識' },
        { id: '新怪班',   upgrade: 'rank_shiya', desc: '現代型怪異の追跡・分析。SNS・デジタルメディア' },
        { id: '封印班',   upgrade: 'rank_kon',   desc: '禁足地の管理と特級怪異の封印。浄化の専門家' },
        { id: '機動班',   upgrade: 'rank_tai',   desc: '前線投入の実働部隊。直轄即応隊・広域機動班' },
    ],
    '傭兵': [
        { id: '突撃型',   upgrade: 'rank_tai',   desc: '火力と耐久の前衛。傭兵の花形' },
        { id: '偵察型',   upgrade: 'rank_shiya', desc: '情報収集と戦場分析。目と耳の専門家' },
        { id: '技術型',   upgrade: 'rank_jutsu', desc: '装備改造と魔法技術。後方支援' },
        { id: '護衛型',   upgrade: 'rank_han',   desc: '要人護衛と脅威評価。交渉と戦術判断の専門家' },
    ],
    '無所属': [
        { id: '野良討伐者',   upgrade: 'rank_tai',   desc: '組織に頼らず腕一本で戦う。生存特化' },
        { id: '裏社会の住人', upgrade: 'rank_han',   desc: '情報網と人脈で勝負。交渉と策略' },
        { id: '在野研究者',   upgrade: 'rank_shiki', desc: '独自に怪異を研究する学者肌' },
        { id: '退魔師',       upgrade: 'rank_kon',   desc: '独学で祓いの術を身につけた一匹狼' },
    ],
};
export const findAssignment = (affiliation, id) => (ASSIGNMENTS[affiliation] || []).find(a => a.id === id) || null;
export const assignmentLabel = (affiliation) => AFFILIATION_INFO[affiliation]?.assignmentLabel || '配属';

// ── 覚醒パターン ──
export const AWAKENINGS = [
    { id: '先天覚醒型',   desc: '生まれつき素養を持ち訓練で開花',       effect: '術または魂がCでスタート（背景とは別枠）' },
    { id: 'ショック覚醒型', desc: '怪異に関わる強烈な体験が引き金',       effect: '恨み/喪失に対する判定+1。初期信念+1' },
    { id: '実験覚醒型',   desc: '人体実験で強制覚醒',                   effect: '察判定+1（怪異への過敏さ）' },
    { id: '接触覚醒型',   desc: '怪異の核や特殊素材への長期接触',       effect: '察判定に常時+1（怪異の気配への鋭敏さ）' },
];
export const AWAKENING_IDS = AWAKENINGS.map(a => a.id);
export const INNATE_AWAKENING = '先天覚醒型';
export const INNATE_CHOICES = ['rank_jutsu', 'rank_kon'];
export const DEFAULT_INNATE_CHOICE = 'rank_jutsu';

// ── 初期ギフト ──
export const GIFTS = [
    { id: '鍵の直感',     desc: '調査フェイズで1日1回、解明鍵のヒントをGMに求められる' },
    { id: '生還の意地',   desc: 'HP0時、魂判定成功で1HP残して生存（1シナリオ1回）' },
    { id: '装備の鬼',     desc: '武装型・半装身型装備の武器修正+1' },
    { id: 'ネットワーク', desc: '各都市に情報源NPC1人。1シナリオ1回情報提供' },
    { id: '怪異の残響',   desc: '怪異の気配を感知。1シナリオ1回、護衛の特性を質問可' },
    { id: '魔法師の直感', desc: '術判定スペシャル時、怪異誘発判定を免除（1シナリオ2回）' },
];

// ── 魔法言語 ──
export const LANGUAGES = [
    { id: 'Igniscript', color: '赤',   desc: '燃やす・爆発・熱変容',       hex: '#ff4444' },
    { id: 'Lupis Surf', color: '青',   desc: '流す・包む・圧力',           hex: '#4488ff' },
    { id: 'Ivyo',       color: '緑',   desc: '育てる・自然サイクル',       hex: '#44cc44' },
    { id: 'NGT',        color: '黄',   desc: '加速・電気的処理・情報解析', hex: '#ffcc00' },
    { id: 'Monyx',      color: '無色', desc: '最小術式・汎用転用',         hex: '#aaaaaa' },
    { id: 'P:',         color: '紫',   desc: '弱体化・妨害・封印（P派生）', hex: '#aa44ff' },
    { id: "P'",         color: '桃',   desc: '回復・強化・修復（P派生）',   hex: '#ff88cc' },
];
export const LANGUAGE_MAX = 3;

// ── 各種初期値・上限 ──
export const STAGE_PLUS_MAX = 2;          // +段階を付与できる能力値の数
export const BASE_BELIEF_POINTS = 5;      // 信念ポイント初期値
export const BASE_CP_BUDGET = 10;         // Lv1 装備CP予算
export const MAX_LEVEL = 20;

// レベル別スキルスロット数（3レベルに1個のペース）
// Lv1=1, Lv3=2, Lv6=3, Lv9=4, Lv12=5, Lv15=6, Lv18=7
export const SKILL_SLOTS_BY_LEVEL = [0, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7];

// サイバネティクス等級の必要レベル
export const CYBER_GRADE_MIN_LEVEL = { I: 1, II: 4, III: 9 };

// ── ステップ定義（フォームとクイックスタートで共有する見出し） ──
// 「この選択で決まること」を1行で説明する
export const GAME_DATA_STEPS = [
    { no: 1, key: 'background',  title: '背景',           en: 'BACKGROUND',  effect: '2つの能力値が D→C に昇格し、背景スキルを自動取得する', required: true },
    { no: 2, key: 'assignment',  title: '配属',           en: 'ASSIGNMENT',  effect: '所属の中での役割。1つの能力値が →B に昇格し、配属スキルが解放される', required: true },
    { no: 3, key: 'abilities',   title: '能力値の確認',   en: 'ABILITIES',   effect: 'ここまでの選択で決まったランクを確認し、+段階を2つ選ぶ。先天覚醒型は術か魂を選ぶ' },
    { no: 4, key: 'skills',      title: 'スキル',         en: 'SKILLS',      effect: '解放された軸から Lv1 は1つ選ぶ。背景スキルはスロット不要で自動取得' },
    { no: 5, key: 'gift',        title: '初期ギフト',     en: 'GIFT',        effect: '1つ選ぶ。特定の場面で使える切り札' },
    { no: 6, key: 'languages',   title: '魔法言語',       en: 'LANGUAGES',   effect: '得意（術判定+1）と苦手（-1）を同じ数だけ選ぶ（0〜3個ずつ）' },
    { no: 7, key: 'armament',    title: '装備',           en: 'ARMAMENT',    effect: '戦闘流派→ベース武器→形態→出自の順に選ぶと武器スペックが自動で決まる', required: true },
    { no: 8, key: 'cybernetics', title: 'サイバネティクス', en: 'CYBERNETICS', effect: '任意。等級が上がるほど強力だが、一度施術すると外せない' },
];

// ── RPシートの項目定義（フォームとクイックスタートで共有） ──
export const RP_SHEET_STEPS = [
    { no: 1, title: '名前と立場',       en: 'IDENTITY', desc: 'キャラ名・二つ名・年齢・性別と、所属（祓部／傭兵／無所属）、討伐者になった経緯（覚醒パターン）。所属は世界の中での立ち位置を決める' },
    { no: 2, title: '見た目・性格・口調', en: 'PROFILE',  desc: '外見の特徴、気質、一人称と話し方。セッションで他のプレイヤーが最初に見る情報' },
    { no: 3, title: '来歴と因縁',       en: 'STORY',    desc: '250字の簡略来歴と、なぜ怪異と戦うのか。動機が1つあればキャラクターは動き出す' },
    { no: 4, title: '二次創作ガイドライン', en: 'FANART', desc: 'ファンアートで許可する表現。あとから変えられる' },
    { no: 5, title: '出力して共有',     en: 'EXPORT',   desc: 'RPシート・名刺カード・IDカードをPNGで保存、またはテキストをコピーしてDiscord等に貼る' },
];
