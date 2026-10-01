# KAI-I//KILL プロジェクト — AI作業指示書

電脳怪異譚 KAI-I//KILL の統合開発プロジェクト。Webサイト（Next.js）・オフラインTRPG・将来のVRイベント／Discord Botを、同一の世界観と判定メカニクスで横断する。秘匿情報を含む運営向け資料（`docs/gm/`）と、プレイヤー向け公開資料（`docs/player/`）を明確に分離して管理する。

## 最初に読むもの

1. `docs/README.md` — **フォルダ構成・Web公開/非公開の区分・サイトページとの対応表の正本**
2. `docs/CONTEXT.md` — プロジェクトの現状と引き継ぎ事項
3. `docs/rules/rules_unified.md` — 判定メカニクスの正本（v5.0。ルールデータは `docs/rules/data/*.json`）
4. `tasks/todo.md` — ロードマップと進行中タスク

## 編集の鉄則

1. **GM版⇔プレイヤー版の同期**：`docs/gm/` のファイルを更新したら、`docs/player/` の対応ファイル（同名）を開き、公開してよい変更だけを反映する。逆方向も同じ。作業後に /lore-sync で確認する。
2. **用語集への反映**：新しい固有名詞・設定を追加したら `docs/gm/glossary.md` と `docs/player/glossary.md` の両方に項目を追加する。
3. **文体**：`docs/gm/`・`docs/player/`・`docs/rules/` の本文は常体（だ・である調）で書く。`docs/legal/` は敬体のまま維持する。コード・コミットメッセージ・READMEはこのルールの対象外。
4. **秘匿管理**：次の話題は `docs/player/` およびWebに出さない — 教団の内部実態と目的／成仏・霧散の原理／祓部の内部対立の詳細／雷禽重工・特別研究部門／怪異核素材の仕様。該当するか判断がつかない場合は、変更を止めてユーザーに確認する。公開前に /secret-check を実行する。
5. **紐付けの更新**：`docs/` のファイルを移動・改名したら `src/lib/siteDocs.js` を必ず更新する（対応表は `docs/README.md`）。ページ側コードにdocsのパスを直書きしない。
6. **ファイル名に版番号を入れない**：版は各ファイル冒頭に記載する（改版時のリンク切れ防止）。
7. **ルールデータの正本は `docs/rules/data/*.json`**：ルールブック原稿（`docs/rules/rules_unified.md`）の `<!-- table:NAME -->` 区間は `node docs/_build/render_tables.mjs` で生成するので手で編集しない。数値・技・ギフト・等級・レベル表を変えるときは JSON を直して再生成し、`node docs/_build/check_rules_sync.mjs` で Web実装（`src/data/characterBuildData.js`）との整合を確認する。作業後に /rules-sync で確認する。

## 絶対保護領域

投稿サイト機能は再編・削減の対象外。**絶対に機能を削減しない**：
`/community/`・`/create/`・`/sns/`・`/mypage/`・`/admin/`・`/sign-in/`・`/sign-up/`・`/anomalies/`・`supabase/`

## 世界観の要点（正本は docs/player/world_bible.md と docs/gm/world_bible.md）

- 近未来架空日本。魔法はインフラとして社会に組み込まれ、怪異（噂・信念が臨界を超えて実体化したバグ）が実在する
- 怪異は「核」と「ルール」を持つ。三勢力：祓部（公的機関）・傭兵・無所属
- 企業は5社：蒼鉄機工・雷禽重工・銀鎚精機・鴉羽技研・朱鷺崎財閥
- **侵食率はWebサイト・キャラシUI・プレイヤー向け資料から全削除済み**（2026-04-19方針）。復活させない。異能等のリスクは共鳴メーター（渇望）で表現する

## 判定メカニクス（正本は docs/rules/rules_unified.md v5.0）

- ランク制ダイスプール：D=1d6 / C=2d6 / B=3d6 / A=4d6 / S=4d6＋固有特典。振った中から1個を選び、その出目が達成値（目標値4）かつ共鳴量（出目−3）。専心でダイス+1個、負傷で−1個
- 属性7つ：体・疾・識・判・察・術・魂
- 共鳴メーター6種（恐怖・怒り・哀愁・焦燥・渇望・浄化）。10で臨界。押し通し（共鳴+3で失敗を達成値4の成功に）
- セッション構造：調査フェーズ（解明鍵4つ）→ 解明完了宣言 → 討伐フェーズ（核防壁戦：防壁層1〜3＋怪異の手番）
- スキルは廃止。スタイル9種×段位3（27技）。効果は `docs/rules/data/styles.json` の effects で構造化
- Web実装は**ミッション単位で v4／v5 を切替**（rules_unified.md 付録C 手順5）。`src/data/missions/*.json` に `"rules": "v5"` を持つミッションは v5.0 エンジン `src/lib/battleEngine.js`（`styles.json` の effects を解釈）と画面 `src/app/games/mission/[missionId]/play/BattleV5.js` で動き、それ以外は旧 `src/lib/gameEngine.js`（v4.0）のまま。`characterBuildData.js` は JSON 駆動済み。旧 `system_data.json` は `docs/rules/archive/system_data_v4.json`

## 開発

- **ビルド/テスト**：`npm run build`・`npm test`（`__tests__/rules/` はルールデータ⇔原稿⇔Web実装の整合テスト）。環境変数 `NEXT_PUBLIC_SUPABASE_URL`・`NEXT_PUBLIC_SUPABASE_ANON_KEY`・`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`・`CLERK_SECRET_KEY` が必要（ローカル検証はダミー値で可）。本番はさらに `SUPABASE_SERVICE_ROLE_KEY`（サーバー専用。`NEXT_PUBLIC_` を付けない）が必須。検証は /verify-site を使う
- **DBアクセスの鉄則**：APIルートは `src/lib/supabaseServer.js`（service role）経由で書き込み、認可は `auth()`＋所有権チェックで行う。ブラウザーの `src/lib/supabase.js`（anon）は公開行の読取と Realtime 購読のみ。管理用列（`user_id`・`is_official`・`approved_*`・`level`・`status_points_used`・`active_title`）とCP残高は専用API以外から書き換えない。RLSの正本は `supabase/migration_security_hardening.sql`
- **コミットメッセージ**：`fix(scope): 日本語の要約` 形式（type: feat / fix / refactor / chore / docs）
- **主要ディレクトリ**：`src/`（App Router）・`src/lib/siteDocs.js`（docs⇔ページ紐付け）・`src/data/`（ゲームデータ）・`supabase/`（マイグレーション）・`archive/sheet-app-legacy/`（旧キャラシ、参照のみ）
- **他のAIエージェント**（OpenAI Codex等）の入口は `AGENTS.md`（本ファイルを正本とする要約）。恒久ルールを変えたら AGENTS.md の要約もずれていないか確認する
