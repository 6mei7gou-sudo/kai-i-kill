// =====================================================
// サイバネティクス 共有データモジュール
// CharacterForm で使用
// =====================================================

// 改造等級
export const CYBER_GRADES = [
    { id: 'none', label: 'なし（素体）', cpLimit: 0, erosion: 0 },
    { id: 'I', label: '等級Ⅰ — 表層改造', cpLimit: 3, erosion: 0 },
    { id: 'II', label: '等級Ⅱ — 深層改造', cpLimit: 6, erosion: 5 },
    { id: 'III', label: '等級Ⅲ — 全置換', cpLimit: 10, erosion: 15 },
];

// 改造部位
export const CYBER_PARTS = ['頭部', '眼球', '胴体', '右腕', '左腕', '脚部'];

// サイバネティクス一覧（等級別）
export const CYBERNETICS = {
    // 等級Ⅰ 表層改造
    'I': [
        { name: '戦術HUD', part: '頭部', cp: 1, effect: '識判定+1（戦闘中）。護衛HP可視化', resonance: 'なし', maker: '蒼鉄機工' },
        { name: '皮下センサーアレイ', part: '胴体', cp: 1, effect: '怪異接近時に自動警告。察+1（感知）', resonance: '浄化+1', maker: '蒼鉄機工' },
        { name: '神経加速パッチ', part: '頭部', cp: 2, effect: 'イニシアチブ+1', resonance: '焦燥+1', maker: '雷禽重工' },
        { name: '指先感触強化', part: '右腕', cp: 1, effect: '精密作業+1', resonance: 'なし', maker: '銀鎚精機' },
        { name: '声紋変換器', part: '頭部', cp: 1, effect: '交渉・潜入+1', resonance: 'なし', maker: '鴉羽技研' },
        { name: 'サブリミナル翻訳機', part: '頭部', cp: 2, effect: '魔法言語1つを判定不要で理解', resonance: '浄化+1', maker: '蒼鉄機工' },
    ],
    // 等級Ⅱ 深層改造
    'II': [
        { name: '義腕【戦闘型】', part: '右腕', cp: 3, effect: '体+1（格闘）。素手+2修正', resonance: '怒り+1', maker: '雷禽重工' },
        { name: '義腕【精密型】', part: '右腕', cp: 3, effect: '術+1。銃器命中+1', resonance: 'なし', maker: '蒼鉄機工' },
        { name: '脳内演算チップ', part: '頭部', cp: 4, effect: '識・判+1。解明行動+1', resonance: '焦燥+1', maker: '蒼鉄機工' },
        { name: '人工心肺【強化型】', part: '胴体', cp: 3, effect: 'HP最大値+3。毒・窒息耐性', resonance: 'なし', maker: '蒼鉄機工' },
        { name: '跳躍ブースター', part: '脚部', cp: 3, effect: '疾+1。垂直移動ペナルティ無効', resonance: '焦燥+1', maker: '雷禽重工' },
        { name: 'サーマルアイ', part: '眼球', cp: 3, effect: '暗視。壁越し生体感知。察+1', resonance: '渇望+1', maker: '雷禽重工' },
        { name: '消音歩行機構', part: '脚部', cp: 2, effect: '足音消去。潜入・隠密+2', resonance: 'なし', maker: '鴉羽技研' },
        { name: '皮下装甲プレート', part: '胴体', cp: 3, effect: '物理ダメージ常時−1', resonance: 'なし', maker: '銀鎚精機' },
    ],
    // 等級Ⅲ 全置換
    'III': [
        { name: '全身義体【汎用型】', part: '全部位', cp: 8, effect: '体・疾+1ランク。HP+5。魂−1', resonance: '渇望+2', maker: '雷禽重工' },
        { name: '脊髄魔導回路', part: '胴体', cp: 5, effect: '術+1ランク。反動ダメージ半減', resonance: '渇望+2', maker: '蜃気楼工廠' },
        { name: '怪異核インプラント', part: '頭部', cp: 6, effect: '察+1ランク。ルール直感感知', resonance: '渇望+3・恐怖+1', maker: '蜃気楼工廠' },
        { name: '四肢全交換【戦闘特化】', part: '両腕・脚部', cp: 7, effect: '体+2ランク。素手+4。術−1ランク', resonance: '怒り+2', maker: '雷禽重工' },
        { name: '全身装甲皮膚', part: '胴体', cp: 5, effect: '物理−2。耐火耐電。触覚喪失、交渉−1', resonance: '渇望+1', maker: '銀鎚精機' },
        { name: '電脳直結ジャック', part: '頭部', cp: 4, effect: 'ネット怪異直接介入。識+1ランク', resonance: '焦燥+2', maker: '鴉羽技研' },
    ],
};

// 全サイバネティクスのフラットリスト
export const ALL_CYBERNETICS = Object.values(CYBERNETICS).flat();

// 名前で検索
export const findCybernetic = (name) => ALL_CYBERNETICS.find(c => c.name === name) || null;
