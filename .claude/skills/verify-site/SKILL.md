---
name: verify-site
description: サイトのビルド＆表示検証。docs・siteDocs.js・ページを変更した後、コミット前に使う。ビルド→テスト→文書ページの実表示確認まで一括で行う。
---

# サイト検証（ビルド＆スモークテスト）

## 環境変数

ビルドには以下が必要。実値がなければダミー値で通る：

```bash
export NEXT_PUBLIC_SUPABASE_URL=https://dummy.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy
export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsuZXhhbXBsZS5jb20k
export CLERK_SECRET_KEY=sk_test_dummy
```

## 手順

1. `npm run build` — 成功すること（依存が無ければ先に `npm ci`）
2. `npm test` — 全テストがパスすること
3. `npx next start -p 3457` をバックグラウンドで起動し、`src/lib/siteDocs.js` の **全キー**に対応するルートへ curl して、各文書に固有の本文文字列が含まれることを確認する：
   - `/world/`・`/world/full/` → 「世界概要」
   - `/world/anomaly/` → 「核とルール」（chapters.js の各章スラッグも同様に1つずつ）
   - `/world/elevator/` → 「操作盤」
   - `/glossary/` → 「分類」
   - `/timeline/` → 「神代」
   - `/organizations/haraebe/` ほか4勢力 → 各勢力名
   - `/terms/`・`/privacy/`・`/guidelines/` → 各規約見出し
   - ステータスコードだけで判定しない（フッターのリンク文字列に誤マッチしやすいため、本文固有の文字列を使う）
4. 検証後はサーバーを停止する（`pkill -f next-server`）。

## 出力形式

ビルド結果／テスト件数／ルートごとのOK・NG一覧。NGがあれば該当ページと siteDocs.js のキー・パスの対応を疑い、原因調査の結果を添える。
