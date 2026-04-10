// =====================================================
// 武器・装備 共有データモジュール v3.0
// カスケード方式（段階式選択）
// =====================================================

// ── STEP 1: 戦闘流派（どう戦うか） ──

export const COMBAT_STYLE_STATS = {
    '斬撃': { mod: 2, ability: 'rank_tai', desc: '切れ味と手数', weapons: '刀・剣・斧・薙刀', note: '先制攻撃時+1' },
    '打撃': { mod: 3, ability: 'rank_tai', desc: '一撃の破壊力', weapons: '槌・棍棒・鈍器', note: 'SP時ダメージ+1' },
    '射撃': { mod: 2, ability: 'rank_haya', desc: '距離と精度', weapons: '銃器・弓・投擲武器', note: '遠距離時+1' },
    '魔導': { mod: 2, ability: 'rank_jutsu', desc: '魔法との連携', weapons: '杖・魔導書・符術具', note: '魔法行使+1' },
    '体術': { mod: 1, ability: 'rank_tai', desc: '素手の技巧', weapons: '格闘・武道・肉体強化', note: 'サブ行動で追加攻撃可' },
};

export const COMBAT_STYLE_NAMES = Object.keys(COMBAT_STYLE_STATS);

// 旧互換エイリアス（旧「武器型」→ 新「戦闘流派」マッピング）
const STYLE_TO_OLD = { '斬撃': '斬撃型', '打撃': '打撃型', '射撃': '射撃型', '魔導': '魔導型', '体術': '体術型' };
const OLD_TO_STYLE = { '斬撃型': '斬撃', '打撃型': '打撃', '射撃型': '射撃', '魔導型': '魔導', '体術型': '体術' };
export { STYLE_TO_OLD, OLD_TO_STYLE };

// 旧形式互換: WEAPON_TYPE_STATS（旧キーでもアクセス可）
export const WEAPON_TYPE_STATS = Object.fromEntries(
    Object.entries(COMBAT_STYLE_STATS).map(([k, v]) => [k + '型', v])
);
export const WEAPON_TYPE_NAMES = Object.keys(WEAPON_TYPE_STATS);

// ── STEP 4: 出自（どこから来たか） ──

export const ORIGIN_TIER = {
    '汎用品':    { modBonus: 0, cpMul: 1.0, slotBonus: 0, desc: 'メーカーを問わない量産型・市場流通品', note: '量産型', fit: '全' },
    '蒼鉄機工':  { modBonus: 0, cpMul: 1.2, slotBonus: 0, desc: '安全・信頼の国家系企業。祓部標準', note: '安全装置付き。祓部標準', fit: '祓部' },
    '雷禽重工':  { modBonus: 1, cpMul: 1.6, slotBonus: 1, desc: '高出力・高リスク。傭兵向け市場を独占', note: '素養C以上推奨。高出力', fit: '傭兵' },
    '鴉羽技研':  { modBonus: 1, cpMul: 1.6, slotBonus: 1, desc: 'グレーゾーン職人集団。違法改造・特注品', note: '違法スロット。検知リスク', fit: '無所属' },
    '銀鎚精機':  { modBonus: 1, cpMul: 2.4, slotBonus: 1, desc: '個人専用品の職人集団。世界に一つの専用機', note: '個人専用品。他者使用不可', fit: '全' },
    'その他':    { modBonus: 0, cpMul: 1.0, slotBonus: 0, desc: '上記以外 / 自作 / 出所不明', note: '自作・出所不明', fit: '自由' },
};

export const ORIGIN_NAMES = Object.keys(ORIGIN_TIER);

// 旧互換エイリアス
export const MANUFACTURER_TIER = ORIGIN_TIER;
export const MANUFACTURER_NAMES = ORIGIN_NAMES;
export const MANUFACTURERS = ORIGIN_NAMES.map(id => ({
    id,
    desc: ORIGIN_TIER[id].desc,
    fit: ORIGIN_TIER[id].fit,
}));

// ── STEP 3: 装備形態（どう装備するか） ──

export const EQUIPMENT_FORM_STATS = {
    '武装':   { baseSlot: 2, cpBase: 5, desc: '手持ち武器。最も汎用的' },
    '独立':   { baseSlot: 2, cpBase: 7, desc: '自律機・ドローン。識判定で操作' },
    '半装身':  { baseSlot: 3, cpBase: 8, desc: '身体装着型。防御と火力の両立' },
    '搭乗':   { baseSlot: 3, cpBase: 10, desc: '搭乗機動兵器。機動力に優れる' },
};

export const EQUIPMENT_FORM_NAMES = Object.keys(EQUIPMENT_FORM_STATS);

// 旧互換: 旧「装備分類」→ 新「装備形態」マッピング
const FORM_TO_OLD = { '武装': '武装型', '独立': '独立型', '半装身': '半装身型', '搭乗': '搭乗型' };
const OLD_TO_FORM = { '武装型': '武装', '独立型': '独立', '半装身型': '半装身', '搭乗型': '搭乗' };
export { FORM_TO_OLD, OLD_TO_FORM };

// 旧形式互換: EQUIPMENT_TYPE_STATS（旧キーでもアクセス可）
export const EQUIPMENT_TYPE_STATS = Object.fromEntries(
    Object.entries(EQUIPMENT_FORM_STATS).map(([k, v]) => [k + '型', v])
);
export const EQUIPMENT_TYPE_NAMES = Object.keys(EQUIPMENT_TYPE_STATS);

// ── STEP 2: ベース武器（何を持つか） ──

export const BASE_WEAPONS = {
    '斬撃': [
        { id: '剣', modAdj: 0, reach: '近接', note: 'バランス型。片手使用可' },
        { id: '双剣', modAdj: -1, reach: '近接', note: '2回攻撃（各-1）。両手占有' },
        { id: '小刀', modAdj: -1, reach: '至近', note: '隠匿携帯可。イニシアチブ+1' },
        { id: '太刀', modAdj: 1, reach: '近接', note: '先制攻撃時+1。両手占有' },
        { id: '大剣', modAdj: 2, reach: '近〜中', note: '攻撃判定-1。SP時ダメージ+2。両手占有' },
        { id: '斧', modAdj: 0, reach: '近接', note: 'SP時ダメージ+1' },
        { id: '薙刀', modAdj: 0, reach: '中近接', note: '護衛2体に同時攻撃可（各ダメージ-1）' },
        { id: '鎖鎌', modAdj: 0, reach: '近〜中', note: '命中時、1R行動遅延（行動値-3）' },
        { id: '槍', modAdj: 0, reach: '中近接', note: '護衛接近時にリアクション攻撃可' },
        { id: 'ハルバード', modAdj: 1, reach: '中近接', note: '斬撃/打撃どちらの武器技能でも使用可。両手占有' },
        { id: 'ガンブレード', modAdj: 0, reach: '近〜中', note: '近接/射撃を切替可（切替にサブ行動）' },
    ],
    '打撃': [
        { id: '棍棒', modAdj: 0, reach: '近接', note: 'バランス型。標準打撃武器' },
        { id: 'メイス', modAdj: 0, reach: '近接', note: '命中時、対象の防御力-1（次Rまで）' },
        { id: '槌', modAdj: 1, reach: '近接', note: '命中時、対象の防御力-2（次Rまで）。両手占有' },
        { id: '両手斧', modAdj: 2, reach: '近接', note: '攻撃判定-1。護衛撃破時に余剰ダメージ+1。両手占有' },
        { id: 'ナックル', modAdj: -1, reach: '至近', note: 'サブ行動で追加攻撃可（判定-1）' },
        { id: '盾', modAdj: -2, reach: '至近', note: '防御+2。片手武器と併用可。攻撃は体術判定' },
    ],
    '射撃': [
        { id: '銃', modAdj: 0, reach: '中距離', note: '構え不要。片手使用可' },
        { id: '二丁拳銃', modAdj: -1, reach: '中距離', note: '2回攻撃（各-1）。両手占有。リロード遅延' },
        { id: 'ライフル', modAdj: 1, reach: '遠距離', note: '遠距離時+1追加。至近〜近接使用不可。両手占有' },
        { id: 'ショットガン', modAdj: 0, reach: '近〜中', note: '至近距離で+2追加。中距離以遠使用不可' },
        { id: '弓', modAdj: 0, reach: '遠距離', note: '構え（サブ行動）後+1。無音。両手占有' },
        { id: 'ボウガン', modAdj: 1, reach: '遠距離', note: '攻撃後リロード必要（次Rサブ行動）' },
        { id: '投擲武器', modAdj: -1, reach: '中距離', note: '使い捨て（3回分）。隠匿携帯可' },
        { id: 'ガンブレード', modAdj: 0, reach: '近〜中', note: '近接/射撃を切替可（切替にサブ行動）' },
    ],
    '魔導': [
        { id: '魔導杖', modAdj: 0, reach: '中〜遠', note: '魔法行使+1。両手占有' },
        { id: '魔導書', modAdj: 0, reach: '中〜遠', note: '1セッション1回、追加魔法使用可。両手占有' },
        { id: '符・結界具', modAdj: -1, reach: '近〜中', note: '護衛特性を1R封印（1戦闘2回まで）。片手使用可' },
        { id: '魔導短杖', modAdj: -1, reach: '中距離', note: '片手使用可。魔法行使+1' },
        { id: '魔導砲', modAdj: 2, reach: '遠距離', note: '攻撃判定-1。広域攻撃可。両手占有。構え必要' },
    ],
    '体術': [
        { id: '格闘', modAdj: 0, reach: '至近', note: '標準体術。素手で戦う' },
        { id: '武道', modAdj: 0, reach: '至近', note: '先制攻撃時+1。カウンター可' },
        { id: '肉体強化', modAdj: 1, reach: '至近', note: 'サイバネティクス連動。HP判定時+1' },
        { id: '体術・投げ', modAdj: 0, reach: '至近', note: '命中時、対象を1R行動遅延。次R先手確定' },
    ],
};

// 装備形態ごとのサブオプション（搭乗/独立/半装身用）
export const FORM_OPTIONS = {
    '搭乗': [
        { id: 'モービル', modAdj: 0, reach: '機動', note: '汎用機動兵器。搭乗・下車にサブ行動消費' },
        { id: 'バイク', modAdj: 0, reach: '高速機動', note: '高速移動。離脱が容易。機動力+1' },
        { id: '機動車輌', modAdj: 0, reach: '機動', note: '複数人搭乗可。防御+1' },
        { id: '浮遊機', modAdj: 1, reach: '3次元機動', note: '地形無視。3次元移動。機動力+2' },
    ],
    '独立': [
        { id: 'ドローン', modAdj: 0, reach: '中〜遠', note: '偵察+攻撃。識判定で操作' },
        { id: '自律兵器', modAdj: 1, reach: '中距離', note: 'AI制御。指示なしでも基本行動' },
        { id: '偵察機', modAdj: -1, reach: '遠距離', note: '察+1。非戦闘特化' },
        { id: '複合機群', modAdj: 0, reach: '中距離', note: '3機包囲攻撃。全機命中時+2' },
    ],
    '半装身': [
        { id: '腕部装甲', modAdj: 0, reach: '近接', note: '防御+1。安定性が高い' },
        { id: '脚部ブーツ', modAdj: 0, reach: '近接', note: 'SPD+1。イニシアチブ優位' },
        { id: '肩部ユニット', modAdj: 0, reach: '中距離', note: '独立型展開可。肩部ドローン搭載' },
        { id: '全身軽装甲', modAdj: 1, reach: '近接', note: '防御+1、SPD+1。全身占有' },
    ],
};

// 旧互換エイリアス
export const EQUIPMENT_SUBTYPES = Object.fromEntries(
    Object.entries(FORM_OPTIONS).map(([k, v]) => [k + '型', v])
);
// 旧互換: WEAPON_SUBTYPES（旧キーでもアクセス可）
export const WEAPON_SUBTYPES = Object.fromEntries(
    Object.entries(BASE_WEAPONS).map(([k, v]) => [k + '型', v])
);

// サブタイプ検索（新旧キー両対応）
export function findSubtype(styleOrType, subtypeId) {
    // 新キー（斬撃）→ BASE_WEAPONS を検索
    const baseList = BASE_WEAPONS[styleOrType];
    if (baseList) {
        const found = baseList.find(s => s.id === subtypeId);
        if (found) return found;
    }
    // 旧キー（斬撃型）→ WEAPON_SUBTYPES を検索
    const oldList = WEAPON_SUBTYPES[styleOrType];
    if (oldList) {
        const found = oldList.find(s => s.id === subtypeId);
        if (found) return found;
    }
    // 装備形態サブオプションも検索（新旧キー両方）
    for (const subs of Object.values(FORM_OPTIONS)) {
        const found = subs.find(s => s.id === subtypeId);
        if (found) return found;
    }
    return null;
}

// ── 武器スペック計算（カスケードの結合点） ──

/**
 * 戦闘流派×出自×装備形態×ベース武器からスペックを算出
 * 新旧キー両対応（斬撃 / 斬撃型 どちらでも可）
 * @returns {{ mod: number, cp: number, slot: number, notes: string[], ability: string }}
 */
export function getWeaponSpec(styleOrType, originOrMaker, formOrCategory, baseWeaponId) {
    // 新キー・旧キー両対応
    const style = OLD_TO_STYLE[styleOrType] || styleOrType;
    const form = OLD_TO_FORM[formOrCategory] || formOrCategory;

    const wt = COMBAT_STYLE_STATS[style];
    if (!wt) return null;
    const mf = ORIGIN_TIER[originOrMaker] || ORIGIN_TIER['汎用品'];
    const et = EQUIPMENT_FORM_STATS[form] || EQUIPMENT_FORM_STATS['武装'];

    // ベース武器の修正値
    const sub = baseWeaponId ? findSubtype(style, baseWeaponId) : null;
    const modAdj = sub ? sub.modAdj : 0;

    const mod = wt.mod + mf.modBonus + modAdj;
    const cp = Math.round(et.cpBase * mf.cpMul);
    const slot = et.baseSlot + mf.slotBonus;

    const reach = sub ? (sub.reach || '') : '';
    const notes = [];
    if (sub && sub.note) notes.push(sub.note);
    else if (wt.note) notes.push(wt.note);
    if (mf.note && mf.note !== '量産型') notes.push(mf.note);

    return { mod, cp, slot, notes, ability: wt.ability, reach, subtypeModAdj: modAdj };
}

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

// 装備種別に対応するオプション一覧（汎用＋専用）を返す
export const getOptionsForType = (equipmentType) => {
    const result = {};
    for (const [catName, opts] of Object.entries(CUSTOM_OPTIONS)) {
        const isExclusive = catName.endsWith('専用');
        if (isExclusive) {
            const matchType = catName.replace('専用', '');
            if (matchType === equipmentType) result[catName] = opts;
        } else {
            result[catName] = opts;
        }
    }
    return result;
};
