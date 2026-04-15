# sheet-app（レガシー版） — 退避済み

このディレクトリは、旧版の独立HTMLキャラクターシートアプリを保管している。
2026-04-15、Next.js版（`src/app/character-sheet/`）への一本化に伴い、`sheet-app/` から `archive/sheet-app-legacy/` に退避した。

## 退避の理由

1. **UI実装の重複**：Next.js版と提供機能の大半が重複していた
2. **マスターデータの乖離**：`data.js` の所属データが旧版（KCB / PHANTOM / NEXUS 等）のまま。Next.js版は v4.0 対応（祓部 / 傭兵 / 無所属）
3. **二重管理の回避**：同じ用途のコードが2箇所にあると修正コストが倍化する

## 継承した機能（Next.js版へ移植済み）

- **ダイス判定履歴のUI表示**（直近20件を表示）→ `src/app/character-sheet/components/DiceRoller.js`
- **感情メーターの臨界表示**（10到達時の警告）→ `src/app/character-sheet/components/EmotionMeter.js`
- **Discord貼り付け用テキストエクスポート**（アスキーアート形式）→ `src/app/character-sheet/components/ExportPanel.js`

## 継承しなかった機能

以下はNext.js版のみで提供：
- PDF出力、PNG出力（全体／キャラカード／RP用IDカード）
- JSON入出力、印刷レイアウト、キャラクター画像アップロード、配属サブ選択

## 将来の参照用途

- v4.0以前の旧データ仕様の参考資料として
- 軽量オフライン版が必要になった場合のベースとして
- 移植漏れが判明した場合の参照元として

**このディレクトリのコードは本番・開発いずれにも含まれない。**
