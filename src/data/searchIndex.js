// サイト内検索インデックス
// title + desc + keywords を対象に部分一致検索する

export const SEARCH_INDEX = [
  // はじめに
  { title: 'クイックスタート', desc: 'キャラクター作成・ダイス・能力値の解説', path: '/quickstart/', keywords: ['はじめ', 'キャラ', '作成', 'ダイス', '能力値', '初心者', 'チュートリアル'] },
  { title: 'キャラ製作ガイドライン', desc: '作っていいキャラ・NGキャラの一覧', path: '/quickstart/character-guide/', keywords: ['キャラクター', 'NG', '禁止', '動機', 'OK', '作成制限'] },
  { title: '怪異・能力・装備', desc: '怪異の定義・魔法・装備の概要', path: '/anomalies/', keywords: ['怪異', '魔法', '装備', '異能', '等級', '概要'] },
  { title: '怪異とは', desc: '怪異の発生原理・核とルール・分類・等級・討伐の三段階', path: '/anomalies/about/', keywords: ['怪異', '核', 'ルール', '等級', '脅威度', '討伐', '分類', '甲種', '乙種'] },

  // 世界観
  { title: '世界観バイブル', desc: '近未来架空日本の世界観・5章構成', path: '/world/', keywords: ['世界', '設定', '魔法', 'インフラ', '日本', '近未来'] },
  { title: 'この世界について', desc: '架空日本の全体像・都市・食と日常', path: '/world/world/', keywords: ['世界', '日本', '都市', '灰嶺', '千隼', '管区'] },
  { title: '怪異と討伐', desc: '怪異の定義・核とルール・分類・討伐プロセス', path: '/world/anomaly/', keywords: ['怪異', '核', 'ルール', '分類', '討伐', '甲種'] },
  { title: '能力と装備', desc: '魔法・異能・魔導具・装備分類体系', path: '/world/powers/', keywords: ['能力', '魔法', '装備', '魔導具', '武装型'] },
  { title: '組織と社会', desc: '討伐免許・三勢力・覚醒・権力構造', path: '/world/factions/', keywords: ['組織', '祓部', '傭兵', '免許', '覚醒', '権力'] },
  { title: 'プレイヤーへの手引き', desc: 'キャラ作成指針・生存原則', path: '/world/guide/', keywords: ['キャラ', '作成', '指針', '生存', '原則'] },
  { title: '世界年表', desc: '鵺ヶ原事変から御神楽事変までの歴史', path: '/timeline/', keywords: ['年表', '歴史', '事変', '鵺ヶ原', '御神楽', '時系列'] },
  { title: '用語集', desc: '専門用語をカテゴリ別に検索', path: '/glossary/', keywords: ['用語', '辞典', '検索', '怪異', '魔法', '組織'] },

  // 組織
  { title: '組織・人物', desc: '祓部・傭兵・無所属の三勢力と権力構造', path: '/organizations/', keywords: ['組織', '勢力', '祓部', '傭兵', '無所属', '陣営'] },
  { title: '祓部詳細', desc: '公的除霊機関の組織構造・階級・配属', path: '/organizations/haraebe/', keywords: ['祓部', 'はらえべ', '祓士', '古怪班', '新怪班', '封印班', '機動班'] },
  { title: '傭兵詳細', desc: '匿名傭兵ネットワークの仕組みと文化', path: '/organizations/mercenaries/', keywords: ['傭兵', 'Anonymous', '二つ名', '突撃型', '偵察型', '技術型', '護衛型'] },
  { title: '企業詳細', desc: '蒼鉄機工・雷禽重工・鴉羽技研の解説', path: '/organizations/companies/', keywords: ['企業', '蒼鉄', '雷禽', '鴉羽', '銀鎚', 'メーカー'] },
  { title: '無所属詳細', desc: '組織に属さない討伐者たちの生き方', path: '/organizations/unaffiliated/', keywords: ['無所属', '野良', '裏社会', '在野', '退魔師', 'フリーランス'] },

  // TRPGルール
  { title: 'ルール目次', desc: '統合ルールブック v4.0 の全14章', path: '/rules/', keywords: ['ルール', 'ルールブック', 'TRPG', '目次'] },
  { title: '基本判定システム', desc: 'ランク制ダイスプール・段階修正', path: '/rules/dice/', keywords: ['ダイス', '判定', 'ランク', 'd6', '達成値', '段階'] },
  { title: '《共鳴記録》', desc: '6種の感情メーター・覚醒ギフト', path: '/rules/resonance/', keywords: ['共鳴', '感情', '恐怖', '怒り', '哀愁', '焦燥', '渇望', '浄化', 'メーター'] },
  { title: '戦闘《核護衛戦》', desc: '核と護衛の構造・ラウンド進行・ダメージ', path: '/rules/combat/', keywords: ['戦闘', '核', '護衛', 'ダメージ', 'HP', 'ラウンド', '行動'] },
  { title: 'スキルシステム', desc: '6軸スキル・所属/配属/覚醒/背景/武器技能', path: '/rules/skills/', keywords: ['スキル', '所属', '配属', '覚醒', '背景', '武器技能'] },
  { title: '調査・解明・討伐', desc: '三段階プロセス・四つの解明鍵', path: '/rules/investigation/', keywords: ['調査', '解明', '討伐', '解明鍵', '予兆カード'] },
  { title: '魔法システム', desc: '8つの魔法言語・怪異誘発判定', path: '/rules/magic/', keywords: ['魔法', 'P', 'Igniscript', 'Lupis', 'Ivyo', 'NGT', 'Monyx', '誘発'] },
  { title: 'キャラクター作成', desc: '10ステップの作成手順・初期値', path: '/rules/creation/', keywords: ['キャラクター', '作成', '手順', '初期値'] },
  { title: '所属システム', desc: '祓部・傭兵・無所属の詳細ルール', path: '/rules/affiliation/', keywords: ['所属', '祓部', '傭兵', '無所属'] },
  { title: '装備システム', desc: '武器種×企業マトリクス・CP・スロット', path: '/rules/equipment/', keywords: ['装備', '武器', 'CP', 'スロット', 'カスタム', 'メーカー'] },
  { title: 'ギフト', desc: '初期ギフト・覚醒ギフト・共鳴段階解放', path: '/rules/gifts/', keywords: ['ギフト', '覚醒', '能力', '特殊'] },
  { title: 'レベルシステム', desc: 'Lv1-10の成長・能力値昇格', path: '/rules/level/', keywords: ['レベル', '成長', '昇格', 'Lv', '経験'] },
  { title: '怪異データ集', desc: '等級別怪異テンプレート・護衛データ', path: '/rules/anomaly-data/', keywords: ['怪異', 'データ', 'テンプレート', '護衛', '等級'] },

  // 遊ぶ
  { title: 'ゲームハブ', desc: 'ミッション・ADV・派遣クエスト', path: '/games/', keywords: ['ゲーム', 'ミッション', 'アドベンチャー', '派遣', 'クエスト'] },
  { title: '怪異討伐ミッション', desc: 'ターン制の怪異討伐バトル', path: '/games/mission/', keywords: ['ミッション', '討伐', 'バトル', '戦闘', 'ソロ', '協力'] },
  { title: '怪異譚ADV', desc: '分岐テキストアドベンチャー', path: '/games/adv/', keywords: ['ADV', 'アドベンチャー', 'テキスト', '分岐', 'シナリオ'] },
  { title: '派遣クエスト', desc: '放置系クエスト', path: '/games/dispatch/', keywords: ['派遣', 'クエスト', '放置', 'アイドル'] },
  { title: 'MirrorLine', desc: 'ゲーム内SNS', path: '/sns/', keywords: ['SNS', 'MirrorLine', 'コミュニティ', 'チャット', 'RP'] },

  // つくる
  { title: 'キャラシート作成', desc: 'キャラクターシートの作成フォーム', path: '/create/character/', keywords: ['キャラ', 'シート', '作成', 'フォーム'] },
  { title: '武器・装備を投稿', desc: '武器や装備の投稿フォーム', path: '/create/weapon/', keywords: ['武器', '装備', '投稿', 'カスタム'] },
  { title: '怪異調査書を作成', desc: 'オリジナル怪異の投稿フォーム', path: '/create/anomaly/', keywords: ['怪異', '調査書', '投稿', 'オリジナル'] },
  { title: 'マイページ', desc: '投稿一覧・実績・リソース管理', path: '/mypage/', keywords: ['マイページ', 'プロフィール', '投稿', '実績'] },
  { title: 'コミュニティDB', desc: '怪異調査書・武器装備・キャラシートの投稿一覧', path: '/community/', keywords: ['コミュニティ', '投稿', '一覧', '閲覧'] },
  { title: '怪異調査書一覧', desc: 'コミュニティ投稿の怪異調査書', path: '/community/anomalies/', keywords: ['怪異', '調査書', 'TMP', '投稿'] },
  { title: '武器・装備一覧', desc: 'コミュニティ投稿の武器・装備データ', path: '/community/gear/', keywords: ['武器', '装備', 'ギア', '投稿'] },
  { title: 'キャラクターシート一覧', desc: 'コミュニティ投稿のキャラシート', path: '/community/characters/', keywords: ['キャラ', 'シート', 'PC', '投稿'] },
  { title: 'お問い合わせ', desc: 'フィードバック・バグ報告', path: '/contact/', keywords: ['問い合わせ', '連絡', 'バグ', 'フィードバック'] },
];
