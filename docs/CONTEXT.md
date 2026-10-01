# KAI-I//KILL プロジェクト — 引き継ぎコンテキスト

新しいセッションはまず ルートの `CLAUDE.md`（恒久ルール）と `docs/README.md`（構成の正本）を読むこと。本ファイルは「いま何がどうなっているか」＝変わっていく事実だけを記録する。

## プロダクト全体像

**IP名：** 怪異キル（kai-i-kill）／ジャンル：近未来架空日本 × ホラー × サイバーパンク。
Webサイト（世界観読み物・Webゲーム・投稿コミュニティ・SNS）、オフラインTRPG、将来のVRイベント・Discord Botを同一の世界観・判定メカニクスで横断する。

## 資料の現状（2026-07-08時点）

- **ルールの正本は `docs/rules/rules_unified.md`（v5.0）とルールデータ `docs/rules/data/*.json`**。ルールの要約はここには書かない。正本を読むこと。v4.0 は `docs/rules/archive/rulebook_v4.md`
- v4.0で廃止された旧概念（旧資料を読むときの注意）：討伐クロック → 核HP制／EP制 → レベル制／クラス制 → 所属×配属×覚醒×背景×武器型／護衛の耐久値 → フルステータス化／1ターン1行動 → メイン・サブ・リアクション制
- **`docs/gm/` は2026-07にビルド成果物から復元**した（各ファイル冒頭の注記参照）。特に `gm/factions/companies.md` は旧構想「羅刹技研」を含み、現行正典（蒼鉄機工・雷禽重工・銀鎚精機・鴉羽技研・朱鷺崎財閥）への改稿が必要
- **侵食率は公開面から全削除**（2026-04-19方針）。`docs/rules/archive/expansion_v1.md` は内部資料として残置、運用上オフ
- docs⇔サイトページの紐付けは `src/lib/siteDocs.js` で一元管理（対応表は `docs/README.md`）
- キャラクター作成の選択肢定義（背景・配属・覚醒・ギフト・魔法言語・各上限）は `src/data/characterBuildData.js`、ランク計算・完成度判定は `src/lib/characterBuild.js` が正本のWeb実装。`docs/rules/rules_unified.md` CHAPTER 9 を変えたらここも更新する（フォーム・詳細・クイックスタートに同時反映される）

## v5.0 再設計（進行中・2026-09-29〜）

- **`docs/rules/rules_unified.md` は v5.0 に置換済み**（2026-09-29、付録C 手順4）。旧 v4.0 系（rulebook・combat_hp・expansion・system_data）は `archive/`、`chapters/` は廃止。**Web実装はミッション単位で v4／v5 を切替中**。`"rules": "v5"` のミッションは v5.0 エンジンで動き、既存ミッションは v4.0 のまま（手順5(d) で順次移行）
- ドラフトは `docs/rules/rules_unified.md`（**v5.0 draft-2**：未決事項を埋めた全文版。序章＋14章＋付録A〜C、1,680行）。ブランチ `claude/lucid-cerf-35qowq`
- **書籍版**：`docs/_build/book/`（`npm install && bash fetch-fonts.sh && npm run build`）が rules_unified.md から B5・74ページのPDFを組版する（Paged.js＋Chromium。表紙・目次・パート扉・章頭帯・キャラクターシート2枚・奥付）。出力 `out/` とフォント `fonts/` は git 管理外
- draft-2 で決めたこと：魔法（怪異誘発判定はスペシャル選択時・押し通し時・ファンブル時）／覚醒ギフト18種＋大浄化の刷新（取得不要・段階で自動解放）／装備（武器修正の上限+4、防御+3、メーカー補正を共鳴ベースに）／サイバネティクス（改造CP廃止・装備CPから購入・常時共鳴で表現・GM許可制）／レベル1〜20の全定義（スタイル解禁 Lv1/3/5/8/10/13/16/20、ランク+1 Lv3/5/7/10/13/16/20、専心+1 Lv2/6/11/17）／文書構造の再編方針（付録C。`chapters/` 廃止、`docs/rules/data/*.json` をデータ正本化、表はJSONから生成）
- 確定済みの設計方針：判定は「振った中から1個選び、その出目が達成値かつ共鳴量（出目−3）」／共鳴ダイスと段階13ステップを廃止し専心・負傷（ダイス±1個）へ／押し通し（共鳴+3で成功に変える）で詰み防止／共鳴は6メーター維持で上昇先を行為の種類から一意に決める／護衛の個体管理を廃止し防壁層1〜3へ／スキル6軸74個を廃止しスタイル9種×段位3（27技）へ／効果は部品合成式の構造化データ
- **据え置き**：7能力値・ランクD〜S・所属3・背景6・配属12・覚醒4・信念ポイント・CP予算・レベル20。既存の投稿キャラの能力値まわりはそのまま通用する
- 状態：draft-2 は Codex レビュー（P1×2・P2×6）を反映して **main にマージ済み**（PR #1）。付録Cの手順2〜3を実施済み：`docs/rules/data/*.json`（8ファイル）をルールデータの正本とし、`docs/_build/render_tables.mjs` が rules_unified.md の40表を JSON から再生成、`docs/_build/check_rules_sync.mjs` が Web実装との共通項目を検査、`__tests__/rules/data-integrity.test.js` と `/rules-sync` スキルで運用。手順5は段階実施中：(a) ✓ `src/data/rulesData.js` 新設と `characterBuildData.js` の JSON 駆動化、(b) ✓ キャラシのスキル欄→スタイル欄（`styles` JSONB 列・主／副／第三・レベル別段位・技一覧）、詳細ページ・フルシート・クイックスタートの表示更新。(c) ✓ v5.0 討伐エンジン `src/lib/battleEngine.js` を**別モジュールで新設**（`styles.json` の effects を解釈するディスパッチャ。判定は「振る→出目を1つ選ぶ」の2段階で `pending` に保留、失敗時は押し通し／受け入れ、怪異の手番は襲撃／貫通／侵蝕／再生＋回避判定、層特性10種、臨界代償6種、解明鍵・解明完了宣言）と画面 `src/app/games/mission/[missionId]/play/BattleV5.js`。ミッション JSON に `"rules": "v5"` と `anomaly`（core／layers／threat／limitRounds／keys）を持たせると切り替わる（`v5_grade4_midnight`・`v5_grade3_kuchisake`）。テストは `__tests__/lib/battleEngine.test.js`（固定ダイス列）と `__tests__/games/BattleV5.test.js`。**未了：(d) 既存 v4 ミッション（ソロ3・協力2）の v5 化と協力戦対応、`gameEngine.js`・`skillData.js` の廃止**。それまで既存ミッションは v4.0 のスキルで動く
- **DB 適用（本番）**：`supabase/migration_characters_v7_styles.sql` を **v5.0 フォームのデプロイ前に** SQL Editor で実行する（`styles` 列の追加＋既存シートの武器型→主／配属→副の写像）。列がない状態で新フォームから投稿・編集すると失敗する
- 27技は `styles.json` に部品合成式（timing/target/uses/resonance/effects）で構造化済み。`battleEngine.js` の `applyEffects` がこの `effects` を解釈する（文字列マッチはしない）。技を増やすときは JSON の effects だけで表現できるか確認し、新しい effect type が要るなら `applyEffects` と `schema` を同時に拡張する
- Claude側スキル：`rules-sync` は新設済み。`verify-site` の改訂（ルート導出化＋キャラシ生成器・Webゲームのスモーク追加）は未着手

## 未対応の改善候補（優先度低）

- 「噂の拡散が怪異を強化する」メカニクス（信念密度のゲーム化）
- 魔導具の具体的な組み込みルール
- GM復元版と現行正典との突き合わせ更新（上記 companies.md ほか）

## セキュリティ運用（2026-09-11 レビュー対応）

- **アクセス経路**：DBへの書き込みは Next.js APIルート（`src/app/api/**`）が `src/lib/supabaseServer.js`（service role キー）で行う。ブラウザーの anon キー（`src/lib/supabase.js`）は公開行の読取と Realtime 購読だけに使う
- **必須の環境変数（本番）**：`SUPABASE_SERVICE_ROLE_KEY`（Supabase → Project Settings → API の service_role。`NEXT_PUBLIC_` を付けない）。未設定なら anon キーにフォールバックして警告を出す
- **RLS強化マイグレーション** `supabase/migration_security_hardening.sql`：anon/authenticated の INSERT/UPDATE/DELETE を全廃、非公開テーブル（reports・user_migration_map・account_cp・cp_transactions・serial_codes・dispatch_quests・mission_results・adv_completions）の SELECT を閉鎖、novels は「公開」のみ、入場制限スレッドとその返信は anon から読めない。加えて `cp_adjust()`（CP残高の原子的更新）と SNS カウンターのトリガーを定義する
- **適用順序（厳守）**：① Vercel に `SUPABASE_SERVICE_ROLE_KEY` を設定してデプロイ → ② SQL Editor でマイグレーションを実行。逆にすると API の書き込みが全て失敗する
- **同マイグレーションの追加分（第2回レビュー）**：既存DBの CHECK 制約更新（SNS layer に meta/rp、実績種別に dispatch）、公開実績に残る生シリアルコードの不透明ID化、`migrate_user_data()`（Dev→Production 移行を1トランザクションで実行。失敗時は移行済みにならず再試行できる）
- **適用後の確認**：匿名で `account_cp`/`reports` の SELECT が拒否されること、非公開小説がIDでも取れないこと、いいね・返信でカウンターが増えること、`npm test` の `__tests__/api/*-security.test.js`・`concurrency.test.js` が通ること
- **未対応（運用側）**：Storage バケット `uploads` の RLS（匿名アップロード・他人の画像削除の可否）、main ブランチ保護、`docs/gm/`・`docs/rules/` が公開リポジトリで閲覧できる件は本対応の範囲外。別途判断が必要
- **残存リスク**：ミッション／ADVの進行はクライアントで計算しているため、勝敗そのものはサーバーで検証していない（実在コンテンツ・所有キャラ・定義上の難易度／エンディングのみ検証）。サーバー側ゲームエンジン化は別タスク

## 変更ログ（新しい順）

- 2026-09-11：第2回セキュリティレビュー R2-01〜R2-08 対応。移行APIの全エラー検査と原子化（所有者列の対応表に novels・sns_chat_rooms.created_by・reports を追加）、キャラ下書きのユーザー別キー化、シリアル引換の source_id を不透明IDに、派遣実績の保存エラーを応答に含める、チャットルーム作成時のメンバー表示名保存と失敗時のルーム取消、既存DBの CHECK 制約更新（layer / achievement_type）。回帰テスト10件追加
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
