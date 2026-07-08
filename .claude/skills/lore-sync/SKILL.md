---
name: lore-sync
description: GM版⇔プレイヤー版の設定資料と用語集の同期チェック。docs/gm/ または docs/player/ を編集した後、コミット前に使う。
---

# GM版⇔プレイヤー版 同期チェック

CLAUDE.md「編集の鉄則」1・2を実行可能な手順に落としたもの。**このSkillは報告までを行い、修正はユーザー確認後に行う。**

## 手順

1. `git diff --name-only`（未コミットぶん）と直近コミットから、変更された `docs/gm/` / `docs/player/` のファイルを列挙する。
2. 変更ファイルごとに対応する相方を開く：
   - `docs/gm/world_bible.md` ⇔ `docs/player/world_bible.md`
   - `docs/gm/glossary.md` ⇔ `docs/player/glossary.md`
   - `docs/gm/factions/<name>.md` ⇔ `docs/player/factions/<name>.md`
   - 相方が存在しないファイル（gm/geography.md、player/timeline.md 等）は「片側のみ」と報告する。
3. 変更内容（追加・修正された節・固有名詞・数値）が相方に反映されているか、必要なのに欠けているかを箇条書きで判定する。
4. 変更で登場した新しい固有名詞を抽出し、`docs/gm/glossary.md` と `docs/player/glossary.md` の両方に項目があるか確認する。
5. player側への反映候補それぞれについて、CLAUDE.md 鉄則4の秘匿トピックに該当しないかチェックする。

## 出力形式

以下の3区分で報告する：

- **同期OK**：反映不要または反映済みの変更
- **要反映**：相方ファイル・用語集への反映が必要な箇所（ファイル名と該当節を明記）
- **秘匿注意**：player側に反映すべきでない、または判断がつかない箇所（理由付き）

「要反映」「秘匿注意」が1件でもあれば、修正に着手する前にユーザーの指示を待つ。
