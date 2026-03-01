'use strict';

// KAI-I//KILL ゲームルール・マスターデータ
const DATA = {

  // ─── 能力値定義（7種） ───────────────────────────────────────────
  abilities: [
    { id: 'body',     name: '肉体', desc: '体力・筋力・耐久性' },
    { id: 'sense',    name: '感覚', desc: '知覚・直感・探知' },
    { id: 'mind',     name: '精神', desc: '意志力・集中力・記憶' },
    { id: 'skill',    name: '技巧', desc: '技術・精密操作・工作' },
    { id: 'social',   name: '社会', desc: '交渉・情報収集・人脈' },
    { id: 'kaiki',    name: '怪異', desc: '異能・霊力・怪異の理解' },
    { id: 'survival', name: '生存', desc: '危機回避・本能・適応力' }
  ],

  // ─── ランク定義 ──────────────────────────────────────────────────
  // S ランクは「神域」の5ダイス（4基本 + 1ボーナス）
  rankData: {
    'D': { dice: 1, label: 'D（未覚醒）' },
    'C': { dice: 2, label: 'C（覚醒）' },
    'B': { dice: 3, label: 'B（強化）' },
    'A': { dice: 4, label: 'A（超常）' },
    'S': { dice: 5, label: 'S（神域）' }
  },

  // ─── 感情定義（6種） ──────────────────────────────────────────────
  emotions: [
    { id: 'fear',    name: '恐怖', color: '#9b59b6' },
    { id: 'anger',   name: '怒り',   color: '#e74c3c' },
    { id: 'sorrow',  name: '哀愁', color: '#3498db' },
    { id: 'anxiety', name: '焦燥', color: '#f39c12' },
    { id: 'desire',  name: '渇望', color: '#e91e63' },
    { id: 'purify',  name: '浄化', color: '#00e5ff' }
  ],

  // ─── 覚醒パターン ─────────────────────────────────────────────────
  awakeningPatterns: [
    '事故遭遇型', '実験被験者型', '呪詛継承型',
    '怪異接触型', '先天性怪異型', '自発的覚醒型', 'その他'
  ],

  // ─── 所属組織 ─────────────────────────────────────────────────────
  affiliations: [
    '怪異対策局（KCB）', '民間調査会社 PHANTOM',
    '霊薬研究機関 NEXUS', '無所属・フリーランス',
    '地下組織「怪異教団」', '政府特殊部隊', 'その他'
  ],

  // ─── 信念 ─────────────────────────────────────────────────────────
  beliefs: [
    '怪異との共存', '人類の守護', '力の追求',
    '真実の探究', '復讐の完遂', '愛する者を守る',
    '自己の進化', 'その他'
  ],

  // ─── 初期 CP（キャラクター作成ポイント） ─────────────────────────
  startingCP: 10,

  // ─── 装備マスタ ────────────────────────────────────────────────────
  equipment: [
    // 武器
    { id: 'gun01',   name: '改造拳銃',          category: '武器', maker: '民間流通', slot: '武器スロット', cp: 2, desc: '信頼性の高い改造済み拳銃。' },
    { id: 'gun02',   name: '霊力散弾銃',         category: '武器', maker: 'NEXUS製',  slot: '武器スロット', cp: 3, desc: '霊力弾を射出する。怪異に有効。' },
    { id: 'blade01', name: '霊刀',               category: '武器', maker: '古式鍛造', slot: '武器スロット', cp: 3, desc: '怪異を斬るために鍛えられた古の刀。' },
    { id: 'blade02', name: '式神端末（攻撃型）', category: '武器', maker: 'KCB製',    slot: '武器スロット', cp: 4, desc: '式神を電子的に具現化する端末。遠隔攻撃可。' },
    { id: 'blade03', name: '電磁ブレード',        category: '武器', maker: 'PHANTOM製',slot: '武器スロット', cp: 3, desc: '電磁場を刃として形成する。霊体も切れる。' },
    // 防具
    { id: 'armor01', name: '防護スーツ',         category: '防具', maker: '汎用品',   slot: '防具スロット', cp: 2, desc: '軽量な防護素材のスーツ。' },
    { id: 'armor02', name: '霊符コート',          category: '防具', maker: '古式',     slot: '防具スロット', cp: 3, desc: '霊符を縫い込んだコート。呪詛を軽減。' },
    { id: 'armor03', name: '対霊装甲',            category: '防具', maker: 'NEXUS製',  slot: '防具スロット', cp: 4, desc: '怪異の攻撃を特に防ぐための重装甲。' },
    // 道具
    { id: 'tool01', name: '解析端末',            category: '道具', maker: 'KCB製',    slot: '道具スロット', cp: 1, desc: '怪異の情報を解析・記録する端末。' },
    { id: 'tool02', name: '暗号通信機',           category: '道具', maker: '民間流通', slot: '道具スロット', cp: 1, desc: '暗号化通信が可能な携帯機器。' },
    { id: 'tool03', name: '霊力チャージャー',     category: '道具', maker: 'NEXUS製',  slot: '道具スロット', cp: 2, desc: '霊力を蓄積・放出できる装置。' },
    { id: 'tool04', name: '封印キット',           category: '道具', maker: '古式',     slot: '道具スロット', cp: 2, desc: '怪異を一時的に封印する道具一式。' },
    { id: 'tool05', name: 'ナノ医療パック',       category: '道具', maker: '汎用品',   slot: '道具スロット', cp: 1, desc: 'ナノマシンによる応急処置。' },
    // 特殊
    { id: 'spec01', name: '怪異細胞サンプル',    category: '特殊', maker: 'NEXUS製',  slot: '特殊スロット', cp: 3, desc: '怪異の細胞を安全に保管したサンプル。' },
    { id: 'spec02', name: '禁書アーカイブ',      category: '特殊', maker: '地下流通', slot: '特殊スロット', cp: 2, desc: '禁じられた怪異の知識が記録されたアーカイブ。' }
  ],

  // ─── 装備オプション ────────────────────────────────────────────────
  options: [
    { id: 'opt01', name: '高精度照準システム',   forCategory: '武器', cp: 1, desc: '命中精度が向上する。' },
    { id: 'opt02', name: '霊力増幅ユニット',     forCategory: '武器', cp: 2, desc: '霊力攻撃の威力が増す。' },
    { id: 'opt03', name: 'サイレンサー',         forCategory: '武器', cp: 1, desc: '射撃音を大幅に軽減する。' },
    { id: 'opt04', name: '緊急展開システム',     forCategory: '防具', cp: 1, desc: '不意打ち時に自動展開する。' },
    { id: 'opt05', name: '侵食耐性コーティング', forCategory: '防具', cp: 2, desc: '怪異による侵食ダメージを軽減する。' },
    { id: 'opt06', name: 'AI補助システム',       forCategory: '道具', cp: 1, desc: '使用時の判定にボーナスが得られる。' },
    { id: 'opt07', name: 'データリンク',         forCategory: '道具', cp: 1, desc: '他キャラクターと情報共有できる。' }
  ],

  // ─── ギフト（特殊能力） ────────────────────────────────────────────
  gifts: [
    { id: 'gift01', name: '怪異の目',   cp: 0, desc: '怪異を肉眼で知覚できる。' },
    { id: 'gift02', name: '超再生',     cp: 2, desc: '怪異の力で傷を高速修復する。' },
    { id: 'gift03', name: '霊波感知',   cp: 1, desc: '周囲の霊的エネルギーの流れを感知する。' },
    { id: 'gift04', name: '怪異同化',   cp: 3, desc: '侵食率と引き換えに怪異の特性を模倣する。' },
    { id: 'gift05', name: '精神防壁',   cp: 2, desc: '精神攻撃・操作への高い耐性を持つ。' },
    { id: 'gift06', name: '式神使い',   cp: 2, desc: '電子式神を呼び出して使役する。' },
    { id: 'gift07', name: '呪詛転換',   cp: 2, desc: '呪詛を一部反射または無効化する。' },
    { id: 'gift08', name: '怪異言語',   cp: 1, desc: '怪異と意思疎通ができる。' }
  ],

  // ─── 侵食率ラベル ─────────────────────────────────────────────────
  erosionLabels: [
    { threshold: 0,   label: '正常',       cssClass: 'erosion-normal' },
    { threshold: 20,  label: '変容の兆し', cssClass: 'erosion-warning' },
    { threshold: 50,  label: '半化の影',   cssClass: 'erosion-danger' },
    { threshold: 80,  label: '臨界',       cssClass: 'erosion-critical' },
    { threshold: 100, label: '怪異化',     cssClass: 'erosion-kaiki' }
  ],

  // ─── 判定結果テーブル ─────────────────────────────────────────────
  judgmentResults: {
    1: { label: 'ファンブル', icon: '🔴', cssClass: 'result-fumble',   desc: '最悪の失敗。予想外の悪い展開が起きる。' },
    2: { label: '失敗',       icon: '⚫', cssClass: 'result-fail',     desc: '行動は失敗した。' },
    3: { label: '失敗',       icon: '⚫', cssClass: 'result-fail',     desc: '行動は失敗した。' },
    4: { label: '部分成功',   icon: '🟡', cssClass: 'result-partial',  desc: '一部は達成できたが、代償がある。' },
    5: { label: '成功',       icon: '🟢', cssClass: 'result-success',  desc: '行動は成功した。' },
    6: { label: '完全成功',   icon: '✨', cssClass: 'result-critical', desc: '完璧な成功！追加効果が得られる。' }
  }
};
