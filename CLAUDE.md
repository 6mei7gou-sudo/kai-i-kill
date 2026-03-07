# KAI-I//KILL TRPG制作プロジェクト

## 概要

電脳怪異譚KAI-I//KILLのTRPGリファレンス資料。
GM専用資料（秘匿情報含む）とプレイヤー向け資料（秘匿除去済み）の二系統を管理する。

## ファイル構成

```
docs/
├── gm/                  ← GM専用ファイル（秘匿設定・内部対立・真相を含む）
│   ├── world_bible_v1.1.md        世界観バイブル（完全版）
│   ├── glossary_v1.0.md           用語集（GM版・秘匿情報あり）
│   ├── detail_haraebe.md          祓部 詳細設定
│   ├── detail_mercenaries.md      傭兵 詳細設定
│   ├── detail_companies.md        企業 詳細設定
│   └── detail_unaffiliated.md     無所属 詳細設定
│
├── public/              ← プレイヤー向けファイル（GMのみが知る情報は除去済み）
│   ├── player_bible_v1.0.md       世界観バイブル（公開版）
│   ├── player_glossary_v1.0.md    用語集（プレイヤー版）
│   ├── player_timeline_v1.0.md    年表（プレイヤー版）
│   ├── player_detail_haraebe.md   祓部 公開設定
│   ├── player_detail_mercenaries.md  傭兵 公開設定
│   ├── player_detail_companies.md    企業 公開設定
│   └── player_detail_unaffiliated.md 無所属 公開設定
│
└── raw/                 ← 原本・ルールブック・テンプレート
    ├── trpg/
    │   ├── rules_unified.md         ★主文書★ 統合ルールブック v3.0
    │   ├── combat_hp_v2.md          戦闘ルール補遺 v2.0（拡充版）
    │   ├── cybernetics_v1.md        サイバネティクス補遺 v1.0
    │   ├── weapon_custom_data.md    武器カスタムデータ
    │   ├── expansion_v1.md         追加データブック《禁域解放》 v1.0（教団・怪異核・全装身型・搭乗型）
    │   ├── system_data.json         構造化データ（v3.0対応）
    │   ├── CONTEXT.md               引き継ぎ用コンテキスト
    │   ├── README.md                索引・利用ガイド
    │   └── archive/                 旧版（参照用）
    │       ├── rulebook_v1.md           旧版ルールブック v1.0
    │       ├── combat_hp_v1.md          戦闘ルール補遺 v1.0
    │       └── system_data_v1.json      旧版構造化データ v1.0
    ├── create/
    │   ├── anomaly_investigation_template_TMP_v1.0.md  怪異調査書テンプレート
    │   ├── weapon_gear_post_template.md                武器投稿テンプレート
    │   ├── ia_site_structure_simple_v0.1.md            サイト構造設計
    │   └── official_pc_template_v1.0.md               公式PC記入フォーマット v1.0
    ├── haraebe/          ← public/と同内容（整形済み）
    ├── mercenaries/
    ├── companies/
    ├── unaffiliated/
    ├── glossary/
    └── timeline/
```

## 編集の鉄則

1. **GM版 → プレイヤー版の同期**：GM版を更新したら対応するプレイヤー版も確認・更新する
2. **用語集への反映**：新設定を追加したら `gm/glossary_v1.0.md` と `public/player_glossary_v1.0.md` にも反映する
3. **文体統一**：常体（だ・である調）で統一。敬体（です・ます調）は使わない
4. **秘匿管理**：プレイヤー版にGM専用情報を混入しない。判断に迷う場合は確認を取る
5. **マークダウン書式**：見出し（`#`〜`####`）、テーブル（`|...|`）、箇条書き（`-`）を統一的に使用する

## 世界観サマリー

- **舞台**：近未来架空日本・魔法インフラ社会・怪異が実在する
- **ジャンル**：現代伝奇アクションTRPG「電脳怪異譚 KAI-I//KILL」
- **怪異**：集合的な噂・信念が臨界を超えて現実に侵食する存在。核とルールを持つ
- **三勢力**：祓部（公的機関）・傭兵（企業系）・無所属
- **魔法**＝プログラミング言語（P / Igniscript / Lupis Surf / Ivyo / NGT / Monyx / P: / P'）
- **異能**＝内側から発生する力、使うと怪異に近づく
- **サイバネティクス**：所属によって規格品 / 高出力カスタム / 違法改造に分かれる
- **企業**：蒼鉄機工（国家系・保守的）、雷禽重工（独立系・高出力）、鴉羽技研（闇）、蜃気楼工廠（怪異核素材）

## TRPGシステム概要

- **ダイスシステム**：ランク制ダイスプール（D=1d6 / C=2d6 / B=3d6 / A=4d6 / S=4d6+ボーナス）
- **属性**：体・疾・識・判・察・術・魂 の7つ
- **セッション構造**：調査フェーズ → 解明完了宣言 → 討伐フェーズ（核護衛戦）
- **感情システム**：《共鳴記録》— 恐怖/怒り/哀愁/焦燥/渇望/浄化の6メーター
- **侵食率**：拡張ルール（《禁域解放》EX-5.5）で導入。基本ルールでは使用しない
- **主文書**：`docs/raw/trpg/rules_unified.md`（v3.0）が最新版

## Webサイト（Next.js）

- `src/`：Next.js App Router ベースのWebサイト
- `sheet-app/`：キャラクターシート投稿システム
- `supabase/`：データベースマイグレーション
- `data/`：Webサイト用データファイル
- Webサイトには**世界観とキャラクター情報のみ**を掲載する。ゲームルールはルールブック（docs/raw/trpg/）に記載する

## 機能拡大ロードマップ

現在 Phase 1 から順に開発中。

| Phase | テーマ | 概要 |
|:---:|:---|:---|
| **1** | 足場固め | テスト基盤、sheet-app統合、キャラシ出力（PDF/PNG/JSON）、DB整理 |
| **2** | コミュニティ深化 | コメント/リアクション、プロフィール強化、通知、公認設定申請・承認フロー |
| **3** | PBW基盤 | セッションルーム、IC投稿、キャラ状態パネル、非同期プレイ、PBW⇔TRPGリソース変換 |
| **4** | Webゲーム | ダイスローラー、怪異遭遇シミュレーター、キャラビルダー、GM用DB |
| **5** | コンテンツ拡充 | ルールブックWebビューア、公式素材DLページ、シナリオテンプレート、ギャラリー |
| **6** | スケーリング | PWA化、API公開、Discord Bot、i18n |
| **7** | マネタイズ | Stripe決済、有料コンテンツ管理、クリエイター収益化、サブスクプラン |

### 現在の作業：Phase 1

- [ ] Jest + React Testing Library セットアップ、主要APIとコンポーネントのテスト
- [ ] sheet-app を `/character-sheet` ルートとして Next.js に統合、Clerk連携
- [ ] キャラクターシート出力（PDF/PNG/JSON/印刷用レイアウト）
- [ ] Supabase CLI or Prisma でマイグレーション管理正式化、RLSポリシー強化
