// =====================================================
// 武器・装備 共有データモジュール
// WeaponForm / CharacterForm の両方で使用
// =====================================================

// メーカー一覧
export const MANUFACTURERS = [
    { id: '蒼鉄機工', desc: '安全・信頼の国家系企業。祓部標準', fit: '祓部' },
    { id: '雷禽重工', desc: '高出力・高リスク。傭兵向け市場を独占', fit: '傭兵' },
    { id: '鴉羽技研', desc: 'グレーゾーン職人集団。違法改造・怪異核', fit: '無所属' },
    { id: '銀鎚精機', desc: '個人専用品の職人集団。世界に一つの専用機', fit: '全' },
    { id: '蜃気楼工廠', desc: '実態不明。怪異核素材の魔導具を製造', fit: '上級者向け' },
    { id: 'その他', desc: '上記以外 / 自作 / 出所不明', fit: '自由' },
];
export const MANUFACTURER_NAMES = MANUFACTURERS.map(m => m.id);

// ----- 基礎武器リスト（分類別） -----

// 武装型
export const WEAPONS_ARMED = [
    // 物理系
    { name: '戦術ナイフ・制式', maker: '蒼鉄機工', cp: 3, slot: 2, mod: '+1', note: '軽量。隠匿しやすい。祓部標準支給品' },
    { name: '魔法剣【蒼鉄一般型】', maker: '蒼鉄機工', cp: 6, slot: 2, mod: '+2', note: '刃に魔力を通した標準型。信頼性が高い' },
    { name: '強化戦術銃【制式型】', maker: '蒼鉄機工', cp: 5, slot: 2, mod: '+2', note: '祓部標準銃器。安全装置付き' },
    { name: '雷禽高出力ライフル', maker: '雷禽重工', cp: 8, slot: 3, mod: '+3', note: '素養C以上推奨。命中ブレが大きい' },
    { name: '雷禽近接爆砕槌', maker: '雷禽重工', cp: 7, slot: 3, mod: '+3（連鎖+2）', note: '連鎖ダメージに特化' },
    { name: '銀鎚特注刀【受注生産】', maker: '銀鎚精機', cp: 12, slot: 3, mod: '+3（専用+4）', note: '個人最適化。納期6ヶ月〜1年' },
    { name: '曰く付き怪異核武器', maker: '鴉羽技研', cp: 5, slot: 2, mod: '+2〜+5', note: '素材による。侵食リスクあり' },
    // 魔法・霊的武装
    { name: '祓い用幣【神道術式】', maker: '蒼鉄機工', cp: 4, slot: 2, mod: '+0（古怪+3）', note: '古い怪異に特化' },
    { name: '術式封印符×10', maker: '蒼鉄機工', cp: 2, slot: 0, mod: '護衛特性無効化', note: '使い捨て。設置が必要' },
    { name: '高出力魔法砲【雷禽型】', maker: '雷禽重工', cp: 10, slot: 3, mod: '+4（素養B以上）', note: '最大出力の魔法砲撃' },
    { name: '怪異核ブレード【壊れ核】', maker: '鴉羽技研', cp: 8, slot: 3, mod: '+3（感知+1）', note: '感情が薄れる副作用' },
    { name: '蜃気楼共鳴刃', maker: '蜃気楼工廠', cp: 10, slot: 3, mod: '+4（vs核）', note: '核への直接攻撃特化。侵食ロール' },
];

// 独立型
export const WEAPONS_INDEPENDENT = [
    // 偵察・索敵
    { name: '偵察球体型【蒼鉄G-01】', maker: '蒼鉄機工', cp: 5, slot: 2, mod: '±0', note: '祓部標準偵察機。護衛配置感知' },
    { name: '小型索敵ドローン【蒼鉄D-03】', maker: '蒼鉄機工', cp: 6, slot: 2, mod: '+1（索敵時）', note: '察+1。怪異位置の質問可' },
    { name: '電子妨害探機【雷禽E-07】', maker: '雷禽重工', cp: 7, slot: 3, mod: '±0（妨害+2）', note: '護衛特性を1R無効化' },
    { name: '鴉羽式改造偵察虫', maker: '鴉羽技研', cp: 5, slot: 2, mod: '±0', note: '手のひらサイズ。隠密使用可' },
    // 戦闘
    { name: '攻撃型自律機【蒼鉄A-05】', maker: '蒼鉄機工', cp: 8, slot: 3, mod: '+2', note: '護衛自動追尾。特務班愛用' },
    { name: '高機動戦闘機【雷禽F-11】', maker: '雷禽重工', cp: 10, slot: 3, mod: '+3（素養B以上）', note: '高速機動。操作難度高' },
    { name: '包囲展開型複合機×3【雷禽S-09】', maker: '雷禽重工', cp: 9, slot: 2, mod: '+1（全機+3）', note: '3機包囲攻撃' },
    { name: '怪異核搭載自律兵器', maker: '蜃気楼工廠', cp: 10, slot: 3, mod: '+4（vs怪異）', note: '壊れた核で駆動。侵食ロール' },
];

// 半装身型
export const WEAPONS_HALF = [
    { name: '蒼鉄腕部強化装甲', maker: '蒼鉄機工', cp: 6, slot: 3, mod: '+1（防御+1）', note: '祓部標準品。安定性が高い', part: '腕部' },
    { name: '蒼鉄脚部高機動ブーツ', maker: '蒼鉄機工', cp: 5, slot: 2, mod: 'SPD+1', note: 'イニシアチブ優位', part: '脚部' },
    { name: '羽衣腕部【雷禽】', maker: '雷禽重工', cp: 8, slot: 3, mod: '+2（素養+3）', note: 'モジュール換装容易', part: '腕部' },
    { name: '羽衣肩部【雷禽】', maker: '雷禽重工', cp: 8, slot: 3, mod: '独立型展開可', note: '肩部から独立型展開', part: '肩部' },
    { name: '羽衣脚部【雷禽】', maker: '雷禽重工', cp: 7, slot: 3, mod: 'SPD+1・回避+1', note: '高速移動特化', part: '脚部' },
    { name: '銀鎚個人専用腕部', maker: '銀鎚精機', cp: 14, slot: 4, mod: '+3（専用）', note: '世界に一つ。他者使用不可', part: '腕部' },
    { name: '鴉羽特注改造腕部', maker: '鴉羽技研', cp: 8, slot: 3, mod: '+3〜+4', note: '違法スロット+1。検知リスク', part: '腕部' },
];

// 全装身型
export const WEAPONS_FULL = [
    { name: '蒼鉄制式甲冑【壱型】', maker: '蒼鉄機工', cp: 10, slot: 4, mod: '+2（防御+2）', note: '特務班正式装備。同調難度低' },
    { name: '蒼鉄制式甲冑【弐型・重装】', maker: '蒼鉄機工', cp: 14, slot: 4, mod: '+3（防御+3）', note: '壱型上位。重量級。機動力低' },
    { name: '雷神鎧【雷禽・量産型】', maker: '雷禽重工', cp: 15, slot: 5, mod: '+3（素養+4）', note: '傭兵向け。同調失敗で侵食+5%' },
    { name: '雷神鎧【雷禽・試作型】', maker: '雷禽重工', cp: 18, slot: 5, mod: '+5（素養B以上）', note: 'テスト限定。同調難度最高' },
    { name: '銀鎚個人専用全装甲', maker: '銀鎚精機', cp: 22, slot: 5, mod: '+4（専用+5）', note: '世界に一着。侵食補正設計込み' },
    { name: '蜃気楼製怪異外殻', maker: '蜃気楼工廠', cp: 16, slot: 5, mod: '+3〜+6（侵食依存）', note: '高侵食ほど強い。人間性を失う' },
];

// 搭乗型
export const WEAPONS_MOUNT = [
    { name: '蒼鉄軽装バイク【巡回型】', maker: '蒼鉄機工', cp: 8, slot: 3, mod: '機動力+2', note: '祓部巡回用。離脱が容易' },
    { name: '蒼鉄機動車輌【指揮型】', maker: '蒼鉄機工', cp: 12, slot: 4, mod: '機動力+1（防御+2）', note: '移動指揮所。複数人搭乗可' },
    { name: '雷禽高速滑走機【ライダー型】', maker: '雷禽重工', cp: 10, slot: 3, mod: '機動力+3（攻撃+1）', note: '傭兵向け高速突撃用' },
    { name: '雷禽重装機動車【ブルドッグ】', maker: '雷禽重工', cp: 14, slot: 4, mod: '機動力+1（攻撃+2）', note: '車載砲搭載可。燃費が悪い' },
    { name: '鴉羽改造二輪【闇鴉】', maker: '鴉羽技研', cp: 9, slot: 3, mod: '機動力+3（隠密+1）', note: '消音・消光。夜間特化。違法スロット+1' },
    { name: '銀鎚特注機動三輪', maker: '銀鎚精機', cp: 16, slot: 4, mod: '機動力+2（専用+3）', note: '個人適合操縦系。他者操縦不可' },
    { name: '蜃気楼製浮遊輪', maker: '蜃気楼工廠', cp: 12, slot: 3, mod: '機動力+4（3次元）', note: '浮遊。地形無視。侵食ロール' },
];

// 戦闘用搭乗型（GM限定）
export const WEAPONS_COMBAT_MOUNT = [
    { name: '蒼鉄制式戦闘車輌【鉄壁】', maker: '蒼鉄機工', cp: 18, slot: 4, mod: '三級以下+3（防御+3）', note: '公式作戦限定。2名以上運用' },
    { name: '雷禽重戦闘機【雷獣】', maker: '雷禽重工', cp: 22, slot: 5, mod: '三級以下+4（攻撃+3）', note: '傭兵集団向け。素養B以上' },
    { name: '雷禽試作超大型機【雷帝】', maker: '雷禽重工', cp: 25, slot: 6, mod: '二級以下+5（攻撃+4）', note: 'テスト最上位機。暴走リスク' },
    { name: '鴉羽改造戦闘車輌【夜鴉】', maker: '鴉羽技研', cp: 20, slot: 5, mod: '三級以下+4（隠密+2）', note: '違法運用前提。発見で没収' },
];

// 分類別にまとめたマップ
export const BASE_WEAPONS_BY_CATEGORY = {
    '武装型': WEAPONS_ARMED,
    '独立型': WEAPONS_INDEPENDENT,
    '半装身型': WEAPONS_HALF,
    '全装身型': WEAPONS_FULL,
    '搭乗型': WEAPONS_MOUNT,
    '戦闘用搭乗型': WEAPONS_COMBAT_MOUNT,
};

// ----- カスタムオプション一覧 -----
export const CUSTOM_OPTIONS = {
    // 汎用（攻撃系）
    '汎用・攻撃': [
        { name: '出力増幅', cp: 2, mod: '+2', resonance: '渇望+1', risk: '中' },
        { name: '連続射撃機構', cp: 3, mod: '+1（2回攻撃）', resonance: '焦燥+1', risk: '低' },
        { name: '集束出力', cp: 2, mod: '+3（単発限定）', resonance: '怒り+2', risk: '中' },
        { name: 'ルール干渉型魔導具', cp: 4, mod: '±0', resonance: '渇望+1', risk: '高' },
        { name: '急所補正', cp: 2, mod: '+1（SP時+3）', resonance: '怒り+1', risk: '低' },
        { name: '広域放出', cp: 3, mod: '+1（全護衛）', resonance: '焦燥+1・渇望+1', risk: '高' },
    ],
    // 汎用（防御系）
    '汎用・防御': [
        { name: '衝撃吸収装甲', cp: 2, mod: '±0', resonance: '恐怖−1', risk: '低' },
        { name: '魔法バリア発生機', cp: 3, mod: '±0', resonance: '浄化+1', risk: '中' },
        { name: '非常離脱装置', cp: 2, mod: '±0', resonance: '恐怖+1', risk: '低' },
        { name: '自己修復魔導具', cp: 3, mod: '±0', resonance: '浄化+1', risk: '中' },
        { name: '電磁遮蔽', cp: 2, mod: '±0', resonance: 'なし', risk: '低' },
    ],
    // 汎用（支援系）
    '汎用・支援': [
        { name: '感知拡張センサー', cp: 2, mod: '±0', resonance: '浄化+1', risk: '低' },
        { name: '解明支援演算', cp: 2, mod: '±0', resonance: '浄化+1', risk: '低' },
        { name: 'マーキング弾', cp: 2, mod: '±0', resonance: '焦燥+1', risk: '低' },
        { name: '転移封印陣', cp: 4, mod: '±0', resonance: '浄化+2', risk: '高' },
        { name: '連携リンク', cp: 2, mod: '±0', resonance: 'なし', risk: '低' },
    ],
    // 武装型専用
    '武装型専用': [
        { name: '刃物増幅', cp: 1, mod: '+1（常時）', resonance: '怒り+1', risk: '低' },
        { name: '霊的刃コーティング', cp: 3, mod: '+2（vs怪異）', resonance: '浄化+1', risk: '中' },
        { name: '曲射機構', cp: 2, mod: '+1', resonance: '焦燥+1', risk: '低' },
        { name: '格闘増力機', cp: 3, mod: '+2（連鎖時）', resonance: '怒り+2', risk: '中' },
        { name: '抜刀速度向上', cp: 2, mod: '±0', resonance: '焦燥+1', risk: '低' },
        { name: '折りたたみ隠匿', cp: 1, mod: '−1', resonance: 'なし', risk: '低' },
    ],
    // 独立型専用
    '独立型専用': [
        { name: '索敵特化AI', cp: 2, mod: '±0', resonance: '浄化+1', risk: '低' },
        { name: '囮モジュール', cp: 2, mod: '±0', resonance: '恐怖−1', risk: '低' },
        { name: '包囲展開AI', cp: 3, mod: '+1（全方位）', resonance: '焦燥+1', risk: '中' },
        { name: '怪異感知センサー搭載', cp: 3, mod: '±0', resonance: '渇望+1', risk: '中' },
        { name: '自爆起爆装置', cp: 4, mod: '+5（自爆）', resonance: '恐怖+2・怒り+2', risk: '高' },
        { name: '霊的スキャナー', cp: 2, mod: '±0', resonance: '浄化+2', risk: '低' },
    ],
    // 半装身型専用
    '半装身型専用': [
        { name: 'ハイブリッド出力', cp: 3, mod: '+2/+1', resonance: '渇望+1', risk: '中' },
        { name: '部位変換モジュール', cp: 2, mod: '±0', resonance: 'なし', risk: '低' },
        { name: '反動吸収機構', cp: 2, mod: '+1（大型）', resonance: '怒り+1', risk: '低' },
        { name: '肩部ドローン統合', cp: 4, mod: '±0', resonance: '渇望+1', risk: '高' },
        { name: '緊急冷却装置', cp: 2, mod: '±0', resonance: '浄化+1', risk: '低' },
        { name: '魔力直結ライン', cp: 3, mod: '+3（最大出力）', resonance: '渇望+2', risk: '高' },
    ],
    // 全装身型専用
    '全装身型専用': [
        { name: '同調深化インターフェース', cp: 4, mod: '+2（同調時）', resonance: '渇望+2', risk: '高' },
        { name: '全身出力最大化', cp: 3, mod: '+4（最大出力）', resonance: '怒り+3', risk: '非常に高' },
        { name: '都市伝説抑制システム', cp: 3, mod: '±0', resonance: '浄化+1', risk: '低' },
        { name: '魔導フィールド展開', cp: 4, mod: '±0', resonance: '浄化+2', risk: '高' },
        { name: '怪異同調炉', cp: 5, mod: '+2〜+5', resonance: '渇望+3・恐怖+1', risk: '非常に高' },
        { name: '緊急切離し機構', cp: 2, mod: '±0', resonance: '恐怖+1', risk: '低' },
    ],
};

// カスタムオプション名のフラットリスト（全カテゴリ）
export const ALL_OPTION_NAMES = Object.values(CUSTOM_OPTIONS).flat().map(o => o.name);

// カスタムオプションを名前で検索
export const findOption = (name) => {
    for (const group of Object.values(CUSTOM_OPTIONS)) {
        const found = group.find(o => o.name === name);
        if (found) return found;
    }
    return null;
};

// 基礎武器を名前で検索
export const findWeapon = (name) => {
    for (const list of Object.values(BASE_WEAPONS_BY_CATEGORY)) {
        const found = list.find(w => w.name === name);
        if (found) return found;
    }
    return null;
};
