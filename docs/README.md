| system_data_v1.json | 旧版データ v1.0。2d6+属性値の旧判定 |
| rulebook_v4.md | 旧版 v4.0 統合ルールブック。v5.0 で再設計（変更点は rules_unified.md 付録B） |
| combat_hp_v4.md | 戦闘補遺 v4.0（HP制）。v5.0 で第5章・第12章に統合 |
| expansion_v1.md | 追加データブック《禁域解放》v1.0（侵食率）。運用オフ |
| system_data_v4.json | 旧版データ v4.0。v5.0 では data/*.json に置換 |# docs/ 索引

電脳怪異譚 KAI-I//KILL プロジェクト資料の全体ガイド。

---

## Web公開／非公開の区分

本リポジトリの資料は、**Webサイトに公開するもの**と**運営内部のみで保持するもの**に明確に分かれる。再編方針（2026-04確定）に基づく。

### Web公開（プレイヤー・来訪者が読む）
- `player/` — プレイヤー向け世界観（秘匿除去済み）。`player/special/` の特設記事（異世界エレベーター）を含む
- `legal/` — 利用規約・プライバシーポリシー・ガイドライン（サイトで表示）
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
- `_build/` — PDF等のビルドスクリプト（運営作業物）
- `site/` — サイト設計資料
- `specs/` — 技術仕様書（ゲームエンジン等）

### 投稿サイト機能との関係
Webの投稿機能（キャラシ投稿、怪異調査書投稿、武器投稿、SNS等）は、本 `docs/` の公開区分とは別軸で運用される。投稿コンテンツはユーザー生成物として Supabase 上に存在し、`docs/` の公開・非公開とは独立。

---

## フォルダ構成

バージョン番号はファイル名に含めず、各ファイル冒頭の表記で管理する（改版してもWeb側の参照が壊れないようにするため）。

```
docs/
├── gm/                  GM専用（秘匿情報含む）
│   ├── world_bible.md   世界観バイブル v1.1【復元版】
│   ├── glossary.md      用語集 v1.0【復元版】
│   ├── geography.md     地理設定 v1.0【復元版】
│   └── factions/        勢力別詳細（祓部・傭兵・企業・無所属）【復元版】
│
├── player/              プレイヤー向け（秘匿除去済み）
│   ├── world_bible.md   世界観バイブル v1.0
│   ├── glossary.md      用語集 v1.0
│   ├── timeline.md      年表 v1.0
│   ├── character_concept_guide.md   キャラクター造形ガイド（世界観指針）
│   ├── factions/        勢力別詳細（祓部・傭兵・企業・無所属）
│   └── special/         特設記事（elevator.md — /world/elevator で表示）
│
├── rules/               TRPGルール
│   ├── rules_unified    ★主文書★ コアルールブック v5.0（判定メカニクスの正本。表は data/ から生成）
│   ├── data/            ★ルールデータの正本★（能力値・共鳴・等級・キャラ作成選択肢・スタイル27技・ギフト・装備・レベル表）
│   ├── cybernetics      サイバネティクス補遺 v1.0（v5.0 では第10章 10-5 のオプションルール。全リスト）
│   ├── weapon_custom_data  武器データ（v5.0 の武器修正上限+4 に合わせた改訂が未了）
│   └── archive/         旧版（rulebook_v4・combat_hp_v4・expansion_v1・system_data_v4 ほか。参照用）
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
├── legal/               利用規約・プライバシー・ガイドライン（Web公開）
│
├── _build/              ビルドスクリプト（非コンテンツ）
│   ├── render_tables.mjs  data/*.json → rules_unified.md の表を再生成（--check で整合検査）
│   ├── check_rules_sync.mjs  data/*.json ⇔ src/data/characterBuildData.js の整合検査
│   └── book/            v5.0 コアルールブックの組版（rules_unified.md → B5 PDF。`npm install && npm run build`）
├── site/                サイト設計
├── specs/               技術仕様書（ゲームエンジン等）
├── CONTEXT.md           引き継ぎコンテキスト
└── README.md            本ファイル
```

### gm/ の【復元版】について

`docs/gm/` のMarkdown原稿は一時リポジトリから失われていたため、2026-07に以下のソースから復元した：

- 世界観バイブル・勢力別詳細・用語集 ← `_build/gm_rulebook_full.html`（2026-03頃のGM用総合ルールブックビルド）
- 地理設定 ← `_build/gen_geography_pdf.py`（PDF生成スクリプトの埋め込みコンテンツ）

復元元のHTMLと旧PDF出力物（`pdf/gm-beta/`）は内容が重複するため復元完了後に削除した（git履歴には残存）。

復元内容はv3.0期のスナップショットであり、その後の設定更新が反映されていない箇所がある。特に企業構成：復元版の `gm/factions/companies.md` には旧構想の「羅刹技研」が登場するが、現行正典（`player/factions/companies.md`）の企業は蒼鉄機工・雷禽重工・銀鎚精機・鴉羽技研・朱鷺崎財閥の5社である。各ファイル冒頭の注記を参照し、現行の正典（`player/` 最新版・`rules/rules_unified.md` v4.0）と突き合わせて更新すること。

---

## Web表示との対応表

サイトページと `docs/` の紐付けは **`src/lib/siteDocs.js` で一元管理**している。文書を追加・移動・改名する場合は必ず siteDocs.js を更新すること。ページ側のコードにパスを直書きしてはならない。

| ルート | 文書 | siteDocs キー |
|:---|:---|:---|
| `/world/`・`/world/[section]/`・`/world/full/` | `player/world_bible.md` | `world-bible` |
| `/world/elevator/` | `player/special/elevator.md` | `special-elevator` |
| `/glossary/` | `player/glossary.md` | `glossary` |
| `/timeline/` | `player/timeline.md` | `timeline` |
| `/organizations/haraebe/` ほか4勢力 | `player/factions/*.md` | `faction-<slug>` |
| `/terms/` | `legal/terms.md` | `terms` |
| `/privacy/` | `legal/privacy.md` | `privacy` |
| `/guidelines/` | `legal/guidelines.md` | `guidelines` |

補足：
- `/world/` の章構成は `src/app/world/chapters.js` の `CHAPTERS` が `player/world_bible.md` の `## 章番号` と対応する。世界観バイブルの章を増減・改番したら chapters.js も更新すること
- `docs/gm/`・`docs/rules/` は運営専用のため siteDocs.js に登録してはならない

---

## 利用シーン別ガイド

### PL説明時（セッション前）
- `rules/rules_unified.md` の序章・第1章〜第3章・第6章（世界観・判定・共鳴記録・キャラクター作成）
- `rules/data/character_options.json`・`styles.json` から背景・配属・覚醒・スタイルの選択肢を抽出
- `player/` 配下の世界観バイブル・用語集を配布

### セッション中（GM卓上）
- `rules/rules_unified.md` の付録A（クイックリファレンス）と巻末キャラクターシート（書籍版PDF）
- 第5章（核防壁戦）・第12章（等級別データ・層特性）
- `rules/weapon_custom_data.md` で装備の詳細修正値を確認

### GM準備（シナリオ作成）
- `rules/rules_unified.md` の第12章（怪異を作る）・第13章（サンプル怪異）・第14章（GMの心得）
- `rules/cybernetics.md` で義体関連のオプションルールを確認
- `gm/` 配下の世界観バイブル・勢力詳細を参照

### Web開発・データ連携
- `rules/data/*.json` をデータソースとして使用（`docs/_build/check_rules_sync.mjs` で Web実装との整合を検査）
- `design/system/` のトークンをフロントエンドで使用

---

## ルール文書の参照関係

```
rules/data/*.json（★ルールデータの正本）
├── rules/rules_unified.md（★主文書 v5.0）← 表は _build/render_tables.mjs で data/ から生成（マーカー区間は手で編集しない）
│   ├── rules/cybernetics.md（オプションルールの全リスト）
│   ├── rules/weapon_custom_data.md（装備の個別データ）
│   └── _build/book/ ← 書籍版PDFを生成（唯一の原稿は rules_unified.md）
└── src/data/characterBuildData.js ← _build/check_rules_sync.mjs で共通項目の一致を検査（v5.0 実装後は data/ を import する）
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
