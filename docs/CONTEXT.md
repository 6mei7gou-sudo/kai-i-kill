# KAI-I//KILL プロジェクト — 引き継ぎコンテキスト

新しいセッションはまず ルートの `CLAUDE.md`（恒久ルール）と `docs/README.md`（構成の正本）を読むこと。本ファイルは「いま何がどうなっているか」＝変わっていく事実だけを記録する。

## プロダクト全体像

**IP名：** 怪異キル（kai-i-kill）／ジャンル：近未来架空日本 × ホラー × サイバーパンク。
Webサイト（世界観読み物・Webゲーム・投稿コミュニティ・SNS）、オフラインTRPG、将来のVRイベント・Discord Botを同一の世界観・判定メカニクスで横断する。

## 資料の現状（2026-07-08時点）

- **ルールの正本は `docs/rules/rules_unified.md`（v4.0）**。ルールの要約はここには書かない。正本を読むこと
- v4.0で廃止された旧概念（旧資料を読むときの注意）：討伐クロック → 核HP制／EP制 → レベル制／クラス制 → 所属×配属×覚醒×背景×武器型／護衛の耐久値 → フルステータス化／1ターン1行動 → メイン・サブ・リアクション制
- **`docs/gm/` は2026-07にビルド成果物から復元**した（各ファイル冒頭の注記参照）。特に `gm/factions/companies.md` は旧構想「羅刹技研」を含み、現行正典（蒼鉄機工・雷禽重工・銀鎚精機・鴉羽技研・朱鷺崎財閥）への改稿が必要
- **侵食率は公開面から全削除**（2026-04-19方針）。`docs/rules/expansion.md` は内部資料として残置、運用上オフ
- docs⇔サイトページの紐付けは `src/lib/siteDocs.js` で一元管理（対応表は `docs/README.md`）
- キャラクター作成の選択肢定義（背景・配属・覚醒・ギフト・魔法言語・各上限）は `src/data/characterBuildData.js`、ランク計算・完成度判定は `src/lib/characterBuild.js` が正本のWeb実装。`docs/rules/rules_unified.md` CHAPTER 9 を変えたらここも更新する（フォーム・詳細・クイックスタートに同時反映される）

## 未対応の改善候補（優先度低）

- 「噂の拡散が怪異を強化する」メカニクス（信念密度のゲーム化）
- 魔導具の具体的な組み込みルール
- GM復元版と現行正典との突き合わせ更新（上記 companies.md ほか）

## セキュリティ運用（2026-09-11 レビュー対応）

- **アクセス経路**：DBへの書き込みは Next.js APIルート（`src/app/api/**`）が `src/lib/supabaseServer.js`（service role キー）で行う。ブラウザーの anon キー（`src/lib/supabase.js`）は公開行の読取と Realtime 購読だけに使う
- **必須の環境変数（本番）**：`SUPABASE_SERVICE_ROLE_KEY`（Supabase → Project Settings → API の service_role。`NEXT_PUBLIC_` を付けない）。未設定なら anon キーにフォールバックして警告を出す
- **RLS強化マイグレーション** `supabase/migration_security_hardening.sql`：anon/authenticated の INSERT/UPDATE/DELETE を全廃、非公開テーブル（reports・user_migration_map・account_cp・cp_transactions・serial_codes・dispatch_quests・mission_results・adv_completions）の SELECT を閉鎖、novels は「公開」のみ、入場制限スレッドとその返信は anon から読めない。加えて `cp_adjust()`（CP残高の原子的更新）と SNS カウンターのトリガーを定義する
- **適用順序（厳守）**：① Vercel に `SUPABASE_SERVICE_ROLE_KEY` を設定してデプロイ → ② SQL Editor でマイグレーションを実行。逆にすると API の書き込みが全て失敗する
- **適用後の確認**：匿名で `account_cp`/`reports` の SELECT が拒否されること、非公開小説がIDでも取れないこと、いいね・返信でカウンターが増えること、`npm test` の `__tests__/api/*-security.test.js`・`concurrency.test.js` が通ること
- **未対応（運用側）**：Storage バケット `uploads` の RLS（匿名アップロード・他人の画像削除の可否）、main ブランチ保護、`docs/gm/`・`docs/rules/` が公開リポジトリで閲覧できる件は本対応の範囲外。別途判断が必要
- **残存リスク**：ミッション／ADVの進行はクライアントで計算しているため、勝敗そのものはサーバーで検証していない（実在コンテンツ・所有キャラ・定義上の難易度／エンディングのみ検証）。サーバー側ゲームエンジン化は別タスク

## 変更ログ（新しい順）

- 2026-09-11：セキュリティレビュー（F01〜F11）対応。service role によるサーバー専用DBアクセス、RLS強化マイグレーション、投稿APIの列制限・非公開保護・装備CPのサーバー計算と先払い、CP加算APIの管理者専用化、ゲーム結果・派遣のサーバー検証、CP／能力値／レベルの原子的更新、いいね実行者の認証固定、SNSカウンターのトリガー化、スレッド一覧の本文非返却、Next 16.3.4／Clerk 7.9.2 へ更新。回帰テスト39件追加（計103件）

- 2026-09-08：v1.1.0 リリース（サイドバー表記・package.json を 1.1.0 に更新、`src/data/siteNews.js` にリリースノート4件を追加）
- 2026-09-08：`/quickstart/` をWebゲーム向けに全面改稿。TRPG卓向けのルール解説（ダイス判定・共鳴記録・核護衛戦・調査解明の手順）とサイバネティクスの解説を削除し、「世界設定10項目 → RPシート → ゲームデータの読み方（能力値がWebゲームのどこに効くか）→ 作り方 STEP1〜7 → Webゲーム5モードの遊び方 → CPとレベルアップ」の構成にした。TRPGルールの解説は `docs/rules/` のみが担う
- 2026-09-08：スキル枠の齟齬を解消。ルールブック（9-1「スキルを2つ選択」・13-3レベルテーブル）をWeb実装 `SKILL_SLOTS_BY_LEVEL`（Lv1=1、Lv3=2、Lv6=3、Lv9=4）に合わせて改訂
- 2026-09-08：キャラクターシート生成器（`/create/character/`）とクイックスタート（`/quickstart/`）を再設計。RPシート（名前・立場・見た目・来歴・二次創作）を既定にし、ゲームデータ（ステータス・戦闘用データ）はスイッチで追加する方式に変更。ステータスの構造（7能力値／背景C×2／配属B×1／先天覚醒C／+段階×2）は不変。背景・配属・覚醒・ギフト等の定義とランク計算を `src/data/characterBuildData.js`・`src/lib/characterBuild.js` に集約し、フォーム・詳細ページ・クイックスタートが共有する。ゲームデータ未設定のシートは詳細ページでステータス系セクションを非表示にする
- 2026-07-08：`AGENTS.md` 新設（OpenAI Codex等の他エージェント向け入口。正本はCLAUDE.md）
- 2026-07-08：docs全面再編（gm/復元・安定ファイル名化・siteDocs.js新設・重複ビルド成果物削除）。AI環境の指示書・記憶ファイルをスリム化
- 2026-04-19：侵食率削除プロジェクト完走。`/character-sheet/` 廃止、出力機能を `/create/character/` に統合
- 2026-04-15：再編計画確定（Web公開/非公開の区分、キャラシUI一本化ほか）
- 2026-03頃：rules v4.0 完成（v3.0からの再構成）。GM用総合ルールブックPDFビルド
