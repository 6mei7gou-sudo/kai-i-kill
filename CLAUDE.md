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
    │   ├── CONTEXT.md               引き継ぎ用コンテキスト
    │   ├── rules_unified.md         ★主文書★ 統合ルールブック v3.0
    │   ├── rulebook_v1.md           旧版ルールブック v1.0（参照用）
    │   ├── combat_hp_v1.md          戦闘ルール補遺 v1.0
    │   ├── combat_hp_v2.md          戦闘ルール補遺 v2.0（拡充版）
    │   ├── cybernetics_v1.md        サイバネティクス補遺 v1.0
    │   └── weapon_custom_data.md    武器カスタムデータ
    ├── create/
    │   ├── anomaly_investigation_template_TMP_v1.0.md  怪異調査書テンプレート
    │   ├── weapon_gear_post_template.md                武器投稿テンプレート
    │   └── ia_site_structure_simple_v0.1.md            サイト構造設計
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
- **異能**＝内側から発生する力、使うと怪異に近づく（侵食率で管理）
- **サイバネティクス**：所属によって規格品 / 高出力カスタム / 違法改造に分かれる
- **企業**：蒼鉄機工（国家系・保守的）、雷禽重工（独立系・高出力）、鴉羽技研（闇）、蜃気楼工廠（怪異核素材）

## TRPGシステム概要

- **ダイスシステム**：ランク制ダイスプール（D=1d6 / C=2d6 / B=3d6 / A=4d6 / S=4d6+ボーナス）
- **属性**：体・疾・識・判・視野・術・魂 の7つ
- **セッション構造**：調査フェーズ → 解明完了宣言 → 討伐フェーズ（核護衛戦）
- **感情システム**：《共鳴記録》— 恐怖/怒り/哀愁/焦燥/渇望/浄化の6メーター
- **侵食率**：0〜100%。異能使用で上昇し絶対に下がらない。100%でキャラクター終了
- **主文書**：`docs/raw/trpg/rules_unified.md`（v3.0）が最新版

## Webサイト（Next.js）

- `src/`：Next.js App Router ベースのWebサイト
- `sheet-app/`：キャラクターシート投稿システム
- `supabase/`：データベースマイグレーション
- `data/`：Webサイト用データファイル
- Webサイトには**世界観とキャラクター情報のみ**を掲載する。ゲームルールはルールブック（docs/raw/trpg/）に記載する
