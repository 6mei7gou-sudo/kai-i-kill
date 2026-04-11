# ゲームエンジン仕様書 — KAI-I//KILL v3

## 概要

`src/lib/gameEngine.js` + `src/lib/dice.js` で構成されるターン制戦闘エンジン。
キャラクターデータを受け取り、ミッションの護衛（ガーディアン）と核を相手に戦闘をシミュレートする。

---

## ファイル構成

| ファイル | 役割 |
|:---|:---|
| `src/lib/dice.js` | ダイスロール・判定・ダメージ計算・HP計算 |
| `src/lib/gameEngine.js` | 戦闘ステートマシン本体 |
| `src/lib/weaponCalc.js` | 武器スペック詳細計算 |
| `src/data/skillData.js` | スキル定義・取得ロジック |
| `src/data/weaponData.js` | 武器・装備形態・出自データ |

---

## 1. ダイスシステム（dice.js）

### ランク制ダイスプール

| ランク | ダイス数 | Sボーナス |
|:---:|:---:|:---:|
| D | 1d6 | — |
| C | 2d6 | — |
| B | 3d6 | — |
| A | 4d6 | — |
| S | 4d6 | +2 |

### 判定（resolveCheck）

```
入力: ランク, 修正値, 難易度（デフォルト4）
処理:
  1. ランクに応じたダイスプールを振る
  2. 最大出目 + Sボーナス + 修正値 = 達成値
  3. 達成値 ≥ 難易度 → 成功
特殊結果:
  - スペシャル: 6の目が2個以上 → 自動成功
  - ファンブル: 全ての目が1 → 自動失敗
```

### ダメージ計算（calculateDamage）

```
ダメージ = 達成値 + 武器修正 − 防御力（最低0）
```

### HP計算（calculateHP）

```
HP = 10 + 体ランクボーナス
  D=+0, C=+2, B=+4, A=+6, S=+8
```

---

## 2. 戦闘フェーズ

```
INIT → PLAYER_TURN → ENEMY_TURN → ROUND_END → INIT（次ラウンド）
                                                  ↓
                                          ラウンド超過 → TIMEOUT
PLAYER_TURN → VICTORY（核HP=0）
ENEMY_TURN → DEFEAT（プレイヤーHP=0）
```

| フェーズ | 意味 |
|:---|:---|
| `init` | ラウンド開始（イニシアチブ判定、護衛全滅→核露出） |
| `player_turn` | プレイヤー行動選択 |
| `enemy_turn` | 敵全体の行動処理 |
| `round_end` | ラウンド終了→次ラウンドへ |
| `victory` | 核HP=0 で勝利 |
| `defeat` | プレイヤーHP=0 で敗北 |
| `timeout` | ラウンド上限超過で撤退 |

---

## 3. 初期状態生成（createBattleState）

キャラクターデータとミッションデータから戦闘ステートを構築する。

### 入力
- `character`: キャラクターシートのデータ（DB格納形式）
- `mission`: ミッション定義（護衛・核のステータス、ラウンド上限）

### 処理手順

1. **ボーナス計算**
   - クラスボーナス（祓士→核攻撃+2、機甲士→護衛ダメージ+2、等）
   - 背景ボーナス（鋼の肉体→HP+2 初回攻撃+1、技術畑→装備修正+1、等）
   - サイバネティクスボーナス（名前にキーワードを含むかで判定）

2. **武器修正計算**（優先度順）
   - `weaponCalc.calcWeaponStats()` → 武器詳細ステータス（オプション込み）
   - `getWeaponSpec()` → 武器型×出自×装備形態の基本計算
   - `EQUIPMENT_MOD` → フォールバック固定値

3. **HP計算**: `10 + 体ランクボーナス + 背景HP + サイバネHP`

4. **スキル読み込み**（`loadBattleSkills`）
   - 共通スキル + 所属スキル + 配属スキル + 覚醒スキル + 武器スキル + 背景スキル
   - 使用回数上限: メイン=1回, サブ=2回, パッシブ/リアクション=無制限

5. **パッシブスキル適用**（`applyPassiveSkills`）
   - 効果テキストからフラグを設定:
     - `_round1AttackBonus`: 1ラウンド目攻撃+1
     - `_lowHpAttackBonus`: HP50%以下で攻撃+1
     - `_lowHpDefenseBonus`: HP50%以下で防御+1
     - `_canSeeEnemyHp`: 護衛HP表示
     - `_rageAttackBonus`: 怒り4以上でダメージ+1
     - `_overflowToCore`: 護衛撃破時の余剰ダメージ核伝播
     - `_reducedAnomalyRisk`: 怪異誘発改善

6. **敵・核の初期化**: ミッション定義をそのままコピー

### 出力ステート構造

```
{
  phase, round, maxRounds,
  player: {
    name, hp, maxHp,
    rank_tai/haya/shiki/han/shiya/jutsu/kon,
    weaponMod, weaponDetails, defense,
    classBonus, bgBonus, cyberBonus,
    beliefPoints, healUsesLeft,
    skills[], skillUses{},
    _skillBuff, _skillDefense,  ← スキルによる一時バフ
    _round1AttackBonus, _lowHpAttackBonus, ...  ← パッシブフラグ
  },
  enemies: [{ id, name, hp, maxHp, attack, defense, ai, traits }],
  core: { name, hp, maxHp, defense, exposed },
  log: [{ type, message, ... }],
  totalDamageDealt, totalDamageTaken,
  resonance: { fear, rage, sorrow, haste, thirst, purge },
}
```

---

## 4. プレイヤー行動

### 4-1. 通常攻撃（playerAttack）

```
対象: 護衛（生存中）または 核（露出時）

修正値 = 武器修正
  + スキルバフ（_skillBuff）
  + 初回攻撃ボーナス（背景: 鋼の肉体）
  + 1ラウンド目ボーナス（パッシブ）
  + HP50%以下ボーナス（パッシブ: 傭兵の矜持）
  + 核攻撃ボーナス（クラス: 祓士+2）
  + 武器の条件付きボーナス

判定: resolveCheck(識ランク, 修正値, 防御+4)

成功時:
  ダメージ = calculateDamage(達成値, 護衛DmgBonus+怒りBonus, 防御)
  スペシャル → ×1.5、浄化+1
  護衛撃破 & _overflowToCore → 余剰ダメージ核伝播

ファンブル → 焦燥+1
攻撃成功 → 怒り+1

行動後: スキルバフ・防御バフをリセット、ENEMY_TURNへ
```

### 4-2. 魔法攻撃（playerMagic）

```
判定: resolveCheck(術ランク, 魔法修正, 防御+3)  ← 通常攻撃より難易度-1

ファンブル → 自傷2ダメージ、恐怖+1
成功時:
  ダメージ = calculateDamage(達成値, 1, 防御)
  魂使い倍率適用（×1.5）
  渇望+1

行動後: ENEMY_TURNへ
```

### 4-3. 回避（playerEvade）

```
回避ボーナス = 2 + 背景ボーナス + サイバネボーナス + スキルバフ
敵ターンで被ダメージ半減（切り上げ、最低1）
```

### 4-4. 回復（playerHeal）

```
条件: 信念ポイント > 0 かつ 回復回数 ≤ 2
回復量 = 3 + 背景ボーナス（信仰者+1）
信念ポイント-1、回復回数-1
```

### 4-5. スキル使用（playerSkill）

```
条件:
  - スキルIDが player.skills に存在する
  - 使用回数がmaxUses未満（メイン=1, サブ=2）
  - 信念消費系 → 信念ポイント > 0
  - HP条件系 → HP50%以下 / HP4以下

スキル判定ランク: スキルの attr に対応するランク
  体→tai, 疾→haya, 識→shiki, 判→han, 察→shiya, 術→jutsu, 魂→kon
```

#### スキル効果の分類と処理

**攻撃系スキル**（以下のキーワードいずれかを含む場合）:
- `ダメージ+`, `ダメージ2倍`, `防御力を無視`, `武器修正2倍`
- `達成値を採用`, `回攻撃`, `同時攻撃`, `に攻撃`, `魔法攻撃`
- `全体に`, `反撃`, `核に直接`

| パターン | 処理 |
|:---|:---|
| 核に直接Nダメージ | 核が露出していれば固定ダメージ |
| 全体攻撃 | 生存護衛全体に個別判定→各ダメージ |
| 2回判定→高い方採用 | 2回resolveCheck→max→ダメージ |
| N回攻撃（各ダメージ-M） | N回独立判定→合計ダメージ |
| 武器修正2倍 | weaponMod×2で計算 |
| 防御無視 | ダメージ = 達成値 + 武器修正 + ボーナス（防御引かない） |
| ダメージ2倍 | 最終ダメージ×2 |
| 単体攻撃（上記以外） | 通常のresolveCheck→ダメージ |

追加効果:
- 反動: `反動Nダメージ` → 自傷N
- 防御力低下: `防御力-N` → 対象のdefense減少
- 行動遅延: ログに記録

**回復系**: `HP` + `回復` → HP回復

**バフ系**: `判定+` / `行使+` → `_skillBuff` 加算

**防御系**: `受けるダメージ` / `軽減` → `_skillDefense` 加算

**回避系**: `回避+` / `リアクション判定+` → `_skillBuff` 加算

**デバフ系**: `防御力` + `-` → 対象の defense 減少

**共鳴操作**: `共鳴メーター` / `浄化` → 最大共鳴-N

**特性開示**: `特性` + `開示/把握` → ログ記録のみ

**核防御ゼロ化**: `核` + `防御力=0` → core.defense = 0

**味方全員バフ**: `味方全員` + `判定+` → `_skillBuff` 加算

**その他**: ログにeffect文をそのまま表示

#### 共鳴コスト

スキル使用後、effectに `渇望+N` を含む場合 → 渇望メーター+N

---

## 5. 敵ターン処理（processEnemyTurn）

### 敵AI

| AI種別 | 行動 |
|:---|:---|
| `aggressive` | 常に攻撃 |
| `defensive` | HP30%以下 or 最後の1体 → 攻撃、それ以外 → 防御 |
| `support` | 核を守る |

### 敵攻撃処理

```
攻撃ロール = max(1〜2d6) + 敵攻撃力  ← 攻撃力4以上は2d6
プレイヤー回避判定: resolveCheck(疾ランク, 回避ボーナス, 攻撃ロール)

命中時:
  ダメージ = 敵攻撃力 + 1 - プレイヤー防御 - スキル防御 - HP50%以下防御（最低1）
  回避態勢中 → ダメージ半減（切り上げ、最低1）

HP30%以下被弾 → 恐怖+1
被弾 → 怒り+1
HP50%以下（初回） → 負傷状態ログ「全判定-1」
```

---

## 6. ラウンド進行

### ラウンド開始（startRound）
- イニシアチブ判定（疾ランクでダイスプール）
- 護衛全滅チェック → 核露出
- 最終ラウンド → 焦燥+1

### ラウンド終了（endRound）
- 次ラウンド番号 > maxRounds → TIMEOUT
- それ以外 → INIT（次ラウンド）

---

## 7. 共鳴メーター

| 内部キー | 日本語 | 上昇トリガー |
|:---|:---|:---|
| `fear` | 恐怖 | 魔法ファンブル、HP30%以下被弾 |
| `rage` | 怒り | 攻撃成功、被弾 |
| `sorrow` | 哀愁 | （現在未使用） |
| `haste` | 焦燥 | ファンブル、最終ラウンド |
| `thirst` | 渇望 | 魔法攻撃成功、スキルコスト |
| `purge` | 浄化 | スペシャル判定 |

---

## 8. 協力戦闘（createCoopBattleState）

複数キャラクターで戦闘するモード。基本的にソロ戦闘と同じボーナス計算を各キャラに適用。

違い:
- `players[]` 配列（疾ランク降順でソート）
- `activePlayerIndex` で行動順管理
- 解明師のラウンド延長は最大+1に制限
- スキル・パッシブは未適用（Coop版では `loadBattleSkills` を呼んでいない）
- ヘイト管理フィールドあり（`hate`）

---

## 9. 戦闘結果（getBattleResult）

```
{
  result: '勝利' / '敗北' / '撤退',
  roundsTaken: ラウンド数,
  totalDamageDealt: 与ダメージ合計,
  totalDamageTaken: 被ダメージ合計,
  remainingHp: 残りHP,
  resonanceSnapshot: 共鳴メーター最終値,
  battleLog: 全ログ配列,
}
```

---

## 10. 既知の制限・注意点

1. **スキル効果はテキストパースで判定**: skillData.jsのeffect文字列をregexで解析してゲーム処理に変換している。新しいスキルを追加する場合、effectの文言がgameEngineのパターンにマッチするよう注意が必要。

2. **Coop戦闘にスキル未実装**: `createCoopBattleState` はスキルの読み込み・適用を行っていない。

3. **配属スキルの読み込み**: `character.sub_affiliation` が空の場合、配属スキルが読み込まれない。ExportPanelが空文字をハードコードしている問題あり。

4. **負傷状態**: ログに「全判定-1」と表示されるが、実際の判定処理に負傷ペナルティは反映されていない。

5. **通常攻撃の判定属性**: `resolveCheck` に `rank_shiki`（識）を使っている。武器型に応じた属性（体/疾/術）ではない。

6. **敵の特殊行動**: `defend`（防御）と`guard`（核守護）はログのみで数値的な効果がない。
