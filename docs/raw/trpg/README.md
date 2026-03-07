# docs/raw/trpg/ 索引

電脳怪異譚 KAI-I//KILL TRPGルールファイルの索引。

## 現行ファイル一覧

| ファイル | 内容 | バージョン |
|:---|:---|:---:|
| **rules_unified.md** | **★主文書★** 統合ルールブック。判定・共鳴記録・戦闘・調査解明・魔法・異能・キャラ作成・所属・装備・ギフト・成長・怪異データ集を網羅 | v3.0 |
| **combat_hp_v2.md** | 戦闘ルール補遺。HP・ダメージ計算・護衛データの拡充版 | v2.0 |
| **cybernetics_v1.md** | サイバネティクス補遺。所属別の義体規格・改造ルール | v1.0 |
| **weapon_custom_data.md** | 武器カスタムデータ。武装型・半装身型・独立型等の個別装備リスト | — |
| **expansion_v1.md** | 追加データブック《禁域解放》。教団・怪異核・全装身型・搭乗型の追加データ | v1.0 |
| **system_data.json** | 構造化データ。rules_unified.md v3.0 の内容をJSON形式で収録 | v3.0 |
| **CONTEXT.md** | 引き継ぎ用コンテキスト。制作経緯と設計判断の記録 | — |
| **README.md** | 本ファイル。索引・ガイド | — |

## 利用シーン別ガイド

### PL説明時（セッション前）
- **rules_unified.md** の CHAPTER 0〜3, 8 を参照（世界観・判定・共鳴記録・キャラ作成）
- **system_data.json** から属性・所属・背景・クラスのデータを抽出

### セッション中（GM卓上）
- **rules_unified.md** の APPENDIX（クイックリファレンス）を参照
- **combat_hp_v2.md** で護衛データ・HP計算を確認
- **weapon_custom_data.md** で装備の詳細修正値を確認

### GM準備（シナリオ作成）
- **rules_unified.md** の CHAPTER 13（怪異データ集）でデータブロック形式を確認
- **expansion_v1.md** で教団・怪異核・特殊装備のデータを参照
- **cybernetics_v1.md** で義体関連のルールを確認

### Web開発・データ連携
- **system_data.json** をデータソースとして使用

## ファイル間の参照関係

```
rules_unified.md（★主文書・全体を統合）
├── combat_hp_v2.md（戦闘ルールの詳細データ）
├── cybernetics_v1.md（サイバネティクスの追加ルール）
├── weapon_custom_data.md（装備の個別データ）
└── expansion_v1.md（追加コンテンツ）

system_data.json ← rules_unified.md v3.0 のデータを構造化
CONTEXT.md ← 制作経緯の記録（独立）
```

## archive/ フォルダ

旧版ファイルを参照用に保管している。現行版との整合性は保証しない。

| ファイル | 内容 |
|:---|:---|
| rulebook_v1.md | 旧版ルールブック v1.0。rules_unified.md v3.0 に統合済み |
| combat_hp_v1.md | 戦闘ルール補遺 v1.0。combat_hp_v2.md に更新済み |
| system_data_v1.json | 旧版構造化データ v1.0。2d6+属性値の旧判定システムに基づく |
