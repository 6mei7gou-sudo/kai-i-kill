---
name: rules-sync
description: ルール正本（docs/rules/data/*.json）⇔ ルールブック原稿（docs/rules/rules_unified.md）⇔ Web実装（src/data/characterBuildData.js・src/lib/gameEngine.js）の整合チェック。ルール・データ・キャラ作成の定義を変えた後、コミット前に使う。
---

# ルール正本⇔原稿⇔Web実装 同期チェック

同じルールが「原稿の表」「構造化データ」「Web実装の定数」の3箇所に存在する。**正本は `docs/rules/data/*.json`** であり、原稿の表はそこから生成し、Web実装はそこと一致していなければならない（`CLAUDE.md` 編集の鉄則7）。2026-09-08 のスキル枠齟齬（ルールブックと `SKILL_SLOTS_BY_LEVEL` の食い違い）の再発を防ぐ手順。

## 手順

1. **原稿の表がデータと一致しているか**
   ```bash
   node docs/_build/render_tables.mjs --check
   ```
   差分が出たら、**JSON を直して** `node docs/_build/render_tables.mjs` で表を再生成する。原稿側の `<!-- table:NAME --> … <!-- /table -->` 区間を手で編集してはならない（次の再生成で消える）。
2. **Web実装がデータと一致しているか**
   ```bash
   node docs/_build/check_rules_sync.mjs
   ```
   「不一致」は修正対象。「移行待ち（想定内）」は v5.0 実装で解消される既知の差分なので、そのまま報告する。
3. `npm test -- __tests__/rules` で上記2つを含む整合性テストが通ることを確認する。
4. データに項目を足した（新しい技・ギフト・オプションなど）場合、`render_tables.mjs` の対応する表に反映されるか、原稿に該当マーカーが置かれているかを確認する。「原稿に未配置の表」の警告が出たら、原稿の適切な位置にマーカー区間を追加する。

## 出力形式

- **一致**：検査したファイルと表の数
- **不一致**：表名または定数名、データ側の値、原稿／Web側の値、直すべき場所
- **移行待ち**：v5.0 実装で解消予定の既知差分（修正しない）
