# docs/ 索引

電脳怪異譚 KAI-I//KILL プロジェクト資料の全体ガイド。

---

## Web公開／非公開の区分

本リポジトリの資料は、**Webサイトに公開するもの**と**運営内部のみで保持するもの**に明確に分かれる。再編方針（2026-04確定）に基づく。

### Web公開（プレイヤー・来訪者が読む）
- `player/` — プレイヤー向け世界観（秘匿除去済み）
- 将来：Web用の簡略ゲームガイド（判定の基本概念のみ）

### Web非公開（運営・制作チームのみ）
- `gm/` — **秘匿情報を含む運営向け世界観**。絶対にWebに出さない
- `rules/` — **判定メカニクス共通仕様**。以下の全プロダクトの根拠資料として機能：
  - Webゲーム判定エンジン（実装済）
  - VRイベントのロールプレイ判定基盤（将来）
  - オフラインTRPGセッション（従来通り）
  - Discord Bot等のBot系連携（将来）
- `templates/` — 投稿用書式・公式PC記入フォーマット（運営ツール）
- `design/` — デザインシステム・ビジュアル制作資料
- `_build/`、`pdf/` — ビルド・PDF出力物（運営作業物）
- `site/` — サイト設計資料
- `specs/` — 技術仕様書（ゲームエンジン等）

### 投稿サイト機能との関係
Webの投稿機能（キャラシ投稿、怪異調査書投稿、武器投稿、SNS等）は、本 `docs/` の公開区分とは別軸で運用される。投稿コンテンツはユーザー生成物として Supabase 上に存在し、`docs/` の公開・非公開とは独立。

---

## フォルダ構成

```
docs/
├── gm/                  GM専用（秘匿情報含む）
│   ├── world_bible      世界観バイブル v1.1
│   ├── glossary         用語集 v1.0
│   ├── geography        地理設定 v1.0
│   └── factions/        勢力別詳細（祓部・傭兵・企業・無所属）
│
├── player/              プレイヤー向け（秘匿除去済み）
│   ├── world_bible      世界観バイブル v1.0
│   ├── glossary         用語集 v1.0
│   ├── timeline         年表 v1.0
│   ├── character_concept_guide   キャラクター造形ガイド（世界観指針）
│   └── factions/        勢力別詳細（祓部・傭兵・企業・無所属）
│
├── rules/               TRPGルール
│   ├── rules_unified    ★主文書★ 統合ルールブック v4.0
│   ├── combat_hp        戦闘補遺 v4.0
│   ├── cybernetics      サイバネティクス補遺 v1.0
│   ├── weapon_custom_data  武器データ
│   ├── expansion        追加データブック《禁域解放》 v1.0
│   ├── system_data.json 構造化データ v4.0
│   ├── chapters/        Web用チャプター分割（15章）
│   └── archive/         旧版（参照用）
│
├── templates/           テンプレート集
│   ├── anomaly_investigation  怪異調査書
│   ├── weapon_gear_post       武器投稿
│   └── official_pc            公式PC記入フォーマット
│
├── design/              デザイン関連
│   ├── system/          デザインシステム・トークン
│   └── guides/          各勢力デザインガイド・ロゴ・ライセンス仕様
│
├── pdf/                 PDF出力物
│   └── gm-beta/        GMベータ版PDF
│
├── _build/              ビルドスクリプト（非コンテンツ）
├── site/                サイト設計
├── CONTEXT.md           引き継ぎコンテキスト
└── README.md            本ファイル
```

---

## 利用シーン別ガイド

### PL説明時（セッション前）
- `rules/rules_unified.md` の CHAPTER 0〜3, 8（世界観・判定・共鳴記録・キャラ作成）
- `rules/system_data.json` から属性・所属・背景・配属のデータを抽出
- `player/` 配下の世界観バイブル・用語集を配布

### セッション中（GM卓上）
- `rules/rules_unified.md` の APPENDIX（クイックリファレンス）
- `rules/combat_hp.md` で護衛データ・HP計算を確認
- `rules/weapon_custom_data.md` で装備の詳細修正値を確認

### GM準備（シナリオ作成）
- `rules/rules_unified.md` の CHAPTER 13（怪異データ集）
- `rules/expansion.md` で教団・怪異核・特殊装備のデータを参照
- `rules/cybernetics.md` で義体関連のルールを確認
- `gm/` 配下の世界観バイブル・勢力詳細を参照

### Web開発・データ連携
- `rules/system_data.json` をデータソースとして使用
- `rules/chapters/` をWeb表示用に参照
- `design/system/` のトークンをフロントエンドで使用

---

## ルール文書の参照関係

```
rules/rules_unified.md（★主文書・全体を統合）
├── rules/combat_hp.md（戦闘ルールの詳細データ）
├── rules/cybernetics.md（サイバネティクスの追加ルール）
├── rules/weapon_custom_data.md（装備の個別データ）
└── rules/expansion.md（追加コンテンツ）

rules/system_data.json ← rules_unified.md v4.0 のデータを構造化
rules/chapters/ ← rules_unified.md をWeb表示用に章別分割
```

---

## archive/ について

旧版ファイルを参照用に保管。現行版との整合性は保証しない。

| ファイル | 内容 |
|:---|:---|
| rulebook_v1.md | 旧版 v1.0。v4.0 に統合済み |
| rulebook_v3.md | 旧版 v3.0。v4.0 に統合済み |
| combat_hp_v1.md | 戦闘補遺 v1.0 |
| combat_hp_v2.md | 戦闘補遺 v2.0（クロック制）。v4.0でHP制に移行 |
| system_data_v1.json | 旧版データ v1.0。2d6+属性値の旧判定 |
