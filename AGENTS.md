# AGENTS.md — AIエージェント向け作業指示（入口）

このリポジトリの作業ルールの**正本はルートの `CLAUDE.md`**。まず `CLAUDE.md` を読み、その指示に従うこと。本ファイルと食い違う場合は `CLAUDE.md` が優先。読む順序も `CLAUDE.md` の「最初に読むもの」に従う。

## 作業前に必ず守ること（最重要の要約）

- **絶対保護領域**：`/community/`・`/create/`・`/sns/`・`/mypage/`・`/admin/`・`/sign-in/`・`/sign-up/`・`/anomalies/`・`supabase/` の機能を削減しない
- **秘匿管理**：`docs/gm/`・`docs/rules/` は運営専用。内容を `docs/player/`・Web表示・公開文書に出さない（NGトピックの一覧は `CLAUDE.md` 編集の鉄則4）
- **紐付けの更新**：`docs/` のファイルを移動・改名したら `src/lib/siteDocs.js` を必ず更新する（対応表は `docs/README.md`）

## ビルド・テスト

```bash
npm ci
export NEXT_PUBLIC_SUPABASE_URL=https://dummy.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy
export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsuZXhhbXBsZS5jb20k
export CLERK_SECRET_KEY=sk_test_dummy
npm run build && npm test
```

環境変数は実値がなければ上記ダミー値で通る。

## 定型手順書（プレーンなMarkdown。どのエージェントでも読んで実行できる）

- `.claude/skills/lore-sync/SKILL.md` — GM版⇔プレイヤー版・用語集の同期チェック（`docs/gm/`・`docs/player/` 編集後に実行）
- `.claude/skills/secret-check/SKILL.md` — 公開コンテンツへの秘匿情報混入チェック（公開前に実行）
- `.claude/skills/verify-site/SKILL.md` — ビルド→テスト→全文書ページの表示確認（コミット前に実行）

## コミット

`fix(scope): 日本語の要約` 形式（type: feat / fix / refactor / chore / docs）。
