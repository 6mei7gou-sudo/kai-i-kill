# KAI-I//KILL 再編プロジェクト TODO

## 方針（決定済み）

| 領域 | 扱い |
|---|---|
| Webゲーム | TRPGルールをそのまま判定エンジンとして使う（A案） |
| プレイヤー向け世界観 | Web公開（読み物として残す） |
| 運営向け世界観 | Web非公開（純粋な設定資料） |
| TRPG詳細ルール | Webから引っ込めて内部資料化。代わりに簡略ゲームガイドをWebに新設（Z案） |
| キャラ作成ガイド | 世界観指針だけWeb公開、TRPG要素は削除 or ゲーム側へ（P案） |
| キャラシUI重複 | `src/app/character-sheet/` に一本化、`sheet-app/` は退避（S案） |
| **投稿サイト機能** | **絶対保護**。今回の再編対象外 |

## 守る領域（触らない）

- `/community/`（キャラシ・怪異・武器一覧）
- `/create/`（投稿フォーム）
- `/sns/`（MirrorLine）
- `/mypage/`、`/admin/`、`/sign-in/`、`/sign-up/`
- `supabase/` 全体
- `/anomalies/`

---

## フェーズ別タスク

### フェーズ4：運営資料の内部化（リスクゼロ・最初に着手）
- [ ] `docs/README.md` に「Web公開／非公開」の明示セクション追加
- [ ] `docs/gm/`、`docs/templates/`、`docs/design/`、`docs/_build/`、`docs/pdf/` の扱いを明文化
- [ ] `docs/specs/game_engine_spec.md` の位置付け確認

### フェーズ5：ドキュメント・索引の更新
- [ ] ルート `CLAUDE.md` を新構造に合わせて更新
- [ ] `docs/CONTEXT.md` 更新（AI引き継ぎ用）
- [ ] Webナビゲーションの刷新計画（`/rules/` 削除、`/game-guide/` 追加の予告）

### フェーズ1：詳細ルールをWebから引っ込める
- [ ] `src/app/rules/` の現状確認（ページ構造・SEOへの影響）
- [ ] `src/app/game-guide/`（仮称）新設
  - 内容：ダイス／属性／ランク／判定基本概念のみ
- [ ] `/quickstart/` との統合判断
- [ ] `src/app/rules/` を削除 or 非表示化
- [ ] `docs/rules/` は内部資料として物理的には残す

### フェーズ2：character_creation_guide の分割 ✅
- [x] `docs/player/character_creation_guide_v1.0.md` の内容仕分け
- [x] 世界観指針部分を `docs/player/character_concept_guide.md` として抽出
- [x] TRPG要素は既存 `docs/rules/chapters/creation.md` に存在するため旧ファイル削除で対応
- [ ] `src/app/quickstart/character-guide` ページのMDファイル読み込み化は将来課題（現状はJSXハードコードで動作、β案で残置）
- [ ] `src/app/quickstart/character-guide/page.js` に「実験体」「稀人」セクションを追加（ドキュメント反映漏れ修正・2026-05-27）

### フェーズ3：キャラシUI重複解消 ✅
- [x] `sheet-app/` と `src/app/character-sheet/` の機能差分調査
- [x] sheet-app 独自3機能をNext.js版へ移植（ダイス履歴UI・感情臨界表示・Discord用テキスト出力）
- [x] `sheet-app/` を `archive/sheet-app-legacy/` へ退避、退避理由README追加
- [x] 参照（CLAUDE.md、docs/CONTEXT.md）更新
- [x] キャラシ投稿機能（`/create/character/`）はコンポーネント共有ゼロのため無影響を確認済み

---

## TRPGルールブックのサイト実装（`docs/CLAUDE_CODE_HANDOFF.md` 由来）

### Phase A：即効性ある小規模タスク（今セッションで完結） ✅
- [x] クイックスタートのエラッタ反映（`src/app/quickstart/page.js`）
  - [x] ファンブル定義変更：「出目1は自動失敗」→「振ったダイスすべてが1で自動失敗」（Dランク1/6事故の設計）
  - [x] 配属スキル数：「各3（計30）」→「各3（計36）」（配属12種×3）
  - [x] 共鳴記録が卓共有であることを明記（感情メーターはPC全員で共有・ギフトも全PC共用・使用コスト対象+1）
  - [x] 共鳴ダイス出目→感情対応（1恐怖 / 2焦燥 / 3哀愁 / 4怒り / 5渇望 / 6浄化）
  - [x] イベント加算は1回+2の明記
- [x] 構文チェックしてコミット

### Phase B：PL公開ページ（別セッション）
- [ ] `/trpg/rules/` 配下に章別ページ作成（0〜4章、7章）
- [ ] 5章から共通スキル・初期ギフト・装備表をPL側にも複製
- [ ] トップページの「TRPG Coming Soon」を `/trpg/rules/` 導線カードに差し替え

### Phase C：GM限定ページ + Clerk認証（別セッション）
- [ ] `src/middleware.js` を新規作成（現状なし）
- [ ] `/trpg/gm/` 配下に GM限定ページ（5,6,8,9,10章）
- [ ] GMロール or フラグの設計

### Phase D：データJSON化（別セッション）
- [ ] `skills.json`（全80スキル）
- [ ] `gifts.json`（覚醒ギフト18＋大浄化＋初期6）
- [ ] `equipment.json`（武器4G・防具3G・消耗品）
- [ ] `anomalies.json`（サンプル怪異3体）
- [ ] キャラシフォーム側のハードコード定義と統合

### Phase E（余力）：共鳴盤コンポーネント
- [ ] 6感情メーター（0-10）＋臨界演出＋ギフト解放段階のReact共有コンポーネント
- [ ] JSONエクスポート機能

---

## ログ

- 2026-04-15：計画確定、フェーズ4から着手予定
- 2026-04-19：「侵食（erosion）削除」プロジェクト完走。キャラシUI／武器投稿フォーム／武器詳細／プレイヤー文書／シナリオJSON／CLAUDE.md／CONTEXT.md／Supabase 削除SQL下書き
- 2026-04-19：新キャラカード（名刺サイズ 910×550px）／年齢・性別・二つ名フィールド／RP用IDカード経歴オーバーフロー修正
- 2026-04-19：`/character-sheet/` ルート廃止。出力機能（キャラカード／RP用IDカード／プレーンテキスト）を `/create/character/` の SECTION 16 に統合。共有 CharacterCard コンポーネントを `src/components/` に新設。`archive/sheet-app-legacy/` は退避保管継続
