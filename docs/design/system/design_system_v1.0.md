# 電脳怪異譚 KAI-I//KILL デザインシステム v1.0

> *「知識が命を救う。無知が人を殺す。」*
> *── このデザインシステムは、電脳怪異譚の世界を視覚言語として定義する。*

---

## 目次

- [CHAPTER 1　デザイン原則](#ch1)
- [CHAPTER 2　カラーシステム](#ch2)
- [CHAPTER 3　タイポグラフィ](#ch3)
- [CHAPTER 4　グリッドシステム](#ch4)
- [CHAPTER 5　スペーシングシステム](#ch5)
- [CHAPTER 6　コンポーネント](#ch6)
- [CHAPTER 7　デザインパターン](#ch7)
- [CHAPTER 8　デザイントークン](#ch8)
- [CHAPTER 9　Do / Don't](#ch9)
- [CHAPTER 10　開発者ガイド](#ch10)

---

<a id="ch1"></a>
# CHAPTER 1　デザイン原則

## 1-1　概観

KAI-I//KILLのデザインは「HUD端末UI」を基盤とする。討伐者が怪異と対峙する際に使用する情報端末──暗闇の中で光る画面、金色のハイライト、走査線のノイズ──その質感がこのシステムの核だ。

美しさと機能は同義だ。装飾のための装飾は存在しない。

## 1-2　五つの原則

### 原則① 闇の中の情報（Information in Darkness）

> 暗黒の背景に浮かぶ情報。討伐者の端末画面がそのまま界面になる。

背景は常にダークモードを基調とし、情報はコントラストによって浮かび上がらせる。重要度の高い情報ほど明るく、低い情報ほど闇に沈む。この階層構造が「調査なしの討伐は自殺行為だ」という世界の鉄則を視覚的に再現する。

### 原則② 金の権威（Gold Authority）

> 金色は権威であり、危険の裏返しだ。

ゴールドはこの世界の魔法インフラ・権力構造・重要データを示すプライマリアクセントだ。金色が光る場所には必ず意味がある。濫用は禁止。ゴールドの過剰使用は「大きな魔法を使えば大きな怪異が生まれる」というこの世界の法則に反する。

### 原則③ 走査線のリアリティ（Scanline Reality）

> 完璧な画面は存在しない。ノイズがこの世界のリアリティだ。

CRT走査線、微かなグロウ、ガラスの反射──これらの不完全さがデジタルと怪異が交差する世界を表現する。ただし装飾ノイズは情報を阻害しない範囲に留める。視認性を損なう演出は排除する。

### 原則④ 段階的開示（Progressive Disclosure）

> 知識は段階的に開示される。一度に全てを見せない。

怪異の解明プロセスと同じく、情報は段階的に開示する。概要→詳細→秘匿情報の順で深度を持たせる。折りたたみ、ホバー、モーダルの三層構造で情報密度をコントロールする。

### 原則⑤ 不可逆の重み（Weight of the Irreversible）

> 侵食率は絶対に下がらない。取り返しのつかない操作には重みを持たせる。

破壊的操作（データの削除、不可逆な変更）には明確な警告と確認を設ける。赤は常に「取り返しがつかない」を意味する。この世界で侵食率が下がらないように、重要な操作の重さをUIで表現する。

## 1-3　トーン＆ムード

| 要素 | 表現 | 避けるもの |
|------|------|------------|
| 全体の印象 | 暗く静謐、だが情報密度が高い | 明るい・ポップ・カジュアル |
| 色彩 | 抑制された暗色に金と赤のアクセント | パステル・蛍光色の乱用 |
| タイポグラフィ | 端末フォントと日本語の共存 | 丸ゴシック・手書き風 |
| アニメーション | 控えめなフェード・グロウ | バウンス・スプリング・過剰な動き |
| アイコン | 線画・幾何学的・最小限 | イラスト風・絵文字・写実的 |
| 文体 | 常体（だ・である調） | 敬体（です・ます調） |

---

<a id="ch2"></a>
# CHAPTER 2　カラーシステム

## 2-1　プライマリパレット

### 背景色（Background）

闇のグラデーション。最も暗い色が基盤、段階的に明るくなる色が階層を示す。

| トークン名 | 値 | 用途 |
|------------|------|------|
| `bg-primary` | `#05070a` | ページ背景・最深層 |
| `bg-secondary` | `#0a0c10` | サイドバー・セカンダリ領域 |
| `bg-tertiary` | `#0f1218` | セクション背景・浮上層 |
| `bg-card` | `#0d1015` | カード背景 |
| `bg-card-hover` | `#141820` | カードホバー状態 |
| `bg-elevated` | `#181c24` | モーダル・ドロップダウン |
| `bg-glass` | `rgba(5, 7, 10, 0.92)` | グラスモーフィズム |
| `bg-overlay` | `rgba(0, 0, 0, 0.7)` | オーバーレイ・遮蔽 |

### テキスト色（Text）

| トークン名 | 値 | コントラスト比（対bg-primary） | 用途 |
|------------|------|------|------|
| `text-heading` | `#ffffff` | 19.6:1 | 見出し・最重要テキスト |
| `text-primary` | `#e8e6e3` | 16.4:1 | 本文・主要テキスト |
| `text-secondary` | `#9a9a9a` | 7.2:1 | 補助テキスト・ラベル |
| `text-muted` | `#555566` | 3.1:1 | 注釈・メタ情報（装飾的） |
| `text-disabled` | `#3a3a44` | 1.9:1 | 無効状態テキスト |

> コントラスト比の基準：主要テキストは WCAG AA（4.5:1以上）を満たす。`text-muted` は装飾的テキストにのみ使用し、情報伝達には使わない。

### アクセント色（Accent）

| トークン名 | 値 | 用途 |
|------------|------|------|
| `accent-gold` | `#d4af37` | プライマリアクセント・CTA・重要情報 |
| `accent-gold-bright` | `#eebb4d` | ホバー状態・強調 |
| `accent-gold-glow` | `rgba(212, 175, 55, 0.3)` | グロウエフェクト |
| `accent-gold-subtle` | `rgba(212, 175, 55, 0.1)` | 背景ティント |
| `accent-gold-border` | `rgba(212, 175, 55, 0.25)` | ボーダー |
| `accent-blue` | `#3a6ea5` | サブアクセント・サイバー要素 |
| `accent-blue-glow` | `rgba(58, 110, 165, 0.25)` | 青系グロウ |
| `accent-blue-subtle` | `rgba(58, 110, 165, 0.08)` | 青系背景ティント |

## 2-2　セマンティックカラー

### ステータス色

| トークン名 | 値 | 意味 |
|------------|------|------|
| `status-danger` | `#e63946` | 危険・エラー・不可逆操作 |
| `status-danger-subtle` | `rgba(230, 57, 70, 0.12)` | 危険背景 |
| `status-danger-border` | `rgba(230, 57, 70, 0.35)` | 危険ボーダー |
| `status-warning` | `#e6952b` | 警告・注意 |
| `status-warning-subtle` | `rgba(230, 149, 43, 0.12)` | 警告背景 |
| `status-success` | `#2a9d6e` | 成功・安全 |
| `status-success-subtle` | `rgba(42, 157, 110, 0.12)` | 成功背景 |
| `status-info` | `#3a6ea5` | 情報・中立 |
| `status-info-subtle` | `rgba(58, 110, 165, 0.10)` | 情報背景 |

### 怪異等級色（Grade Colors）

存在強度等級に対応する色。等級が高いほど鮮烈に、低いほど沈む。

| 等級 | トークン名 | 値 | 視覚的意図 |
|------|------------|------|------------|
| 特級 | `grade-special` | `#e63946` | 鮮烈な赤──封印が限界の存在 |
| 一級 | `grade-1` | `#d4af37` | 金──長い歴史を持つ強力な存在 |
| 二級 | `grade-2` | `#c78f30` | 深い金──記録のある古い怪異 |
| 三級 | `grade-3` | `#8a7a45` | 鈍い金──拡散が進んだ怪異 |
| 四級 | `grade-4` | `#5a6a50` | 灰緑──発生したばかりの怪異 |
| 五級 | `grade-5` | `#4a5060` | 灰青──自然消滅しうる微小怪異 |

### 脅威度種別色（Threat Colors）

| 種別 | トークン名 | 値 | 視覚的意図 |
|------|------------|------|------------|
| 甲種 | `threat-alpha` | `#e63946` | 赤──無差別に人を害する |
| 乙種 | `threat-beta` | `#e6952b` | 橙──条件付きで害する |
| 丙種 | `threat-gamma` | `#8a7a45` | 鈍金──刺激しなければ安全 |
| 丁種 | `threat-delta` | `#3a6ea5` | 青──人を害さない |

## 2-3　ワールドカラー

### 感情共鳴メーター色（Resonance Colors）

共鳴記録システムの6種の感情に対応する。ゲーム内メカニクスと直結した色。

| メーター | トークン名 | 値 | グロウ |
|----------|------------|------|--------|
| 恐怖（FEAR） | `resonance-fear` | `#8b2030` | `rgba(139, 32, 48, 0.4)` |
| 怒り（RAGE） | `resonance-rage` | `#d45020` | `rgba(212, 80, 32, 0.4)` |
| 哀愁（SORROW） | `resonance-sorrow` | `#2855a0` | `rgba(40, 85, 160, 0.4)` |
| 焦燥（HASTE） | `resonance-haste` | `#d48820` | `rgba(212, 136, 32, 0.4)` |
| 渇望（THIRST） | `resonance-thirst` | `#7030a0` | `rgba(112, 48, 160, 0.4)` |
| 浄化（PURGE） | `resonance-purge` | `#40a070` | `rgba(64, 160, 112, 0.4)` |

### 魔法言語色（Magic Language Colors）

8つの魔法言語に対応する色。魔法属性の視覚的識別に使用する。

| 言語 | トークン名 | 値 | 用途 |
|------|------------|------|------|
| P（基礎） | `magic-p` | `#9a9a9a` | 基礎言語・汎用 |
| Igniscript（赤） | `magic-ignis` | `#d43030` | 火属性・破壊 |
| Lupis Surf（青） | `magic-lupis` | `#3070c0` | 水属性・制御 |
| Ivyo（緑） | `magic-ivyo` | `#30a050` | 自然属性・持続 |
| NGT（黄） | `magic-ngt` | `#c0a030` | 電気属性・情報 |
| Monyx（無色） | `magic-monyx` | `#b0b0c0` | 無色・汎用最適化 |
| P:（紫） | `magic-p-seal` | `#7030a0` | 封印・弱体化 |
| P'（桃） | `magic-p-heal` | `#c06088` | 回復・強化 |

### 所属色（Faction Colors）

三組織の識別に使用する。

| 所属 | トークン名 | 値 | 意味 |
|------|------------|------|------|
| 祓部 | `faction-haraebe` | `#d4af37` | 金──国家権力・公的機関 |
| 傭兵 | `faction-mercenary` | `#3a6ea5` | 青──企業・技術力 |
| 無所属 | `faction-unaffiliated` | `#7a7a8a` | 灰──帰属なし・自由 |

### 企業色（Corporate Colors）

| 企業 | トークン名 | 値 |
|------|------------|------|
| 蒼鉄機工 | `corp-sotetsu` | `#3a5a8a` |
| 雷禽重工 | `corp-raikin` | `#c06020` |
| 鴉羽技研 | `corp-karasuha` | `#3a3a4a` |
| 蜃気楼工廠 | `corp-shinkirou` | `#6a3060` |

## 2-4　ダークモード仕様

KAI-I//KILLは**ダークモードのみ**をサポートする。ライトモードは存在しない。この世界は暗闇の中で情報を読み取る世界だ。

ただし、以下の場面で背景輝度を段階的に上げる：

| 場面 | 背景色 | 理由 |
|------|--------|------|
| デフォルト | `bg-primary` (#05070a) | 通常表示 |
| モーダル内 | `bg-elevated` (#181c24) | 浮上層の明示 |
| 印刷プレビュー | `#1a1c22` | 印刷時の可読性確保 |

## 2-5　コントラストとアクセシビリティ

| 組み合わせ | コントラスト比 | WCAG AA | WCAG AAA |
|------------|---------------|---------|----------|
| text-heading / bg-primary | 19.6:1 | ✓ | ✓ |
| text-primary / bg-primary | 16.4:1 | ✓ | ✓ |
| text-secondary / bg-primary | 7.2:1 | ✓ | ✓ |
| accent-gold / bg-primary | 8.1:1 | ✓ | ✓ |
| status-danger / bg-primary | 5.2:1 | ✓ | — |
| text-primary / bg-card | 14.8:1 | ✓ | ✓ |
| accent-gold / bg-elevated | 5.8:1 | ✓ | — |

### カラー使用ルール

1. **色だけで情報を伝えない**：等級・状態・カテゴリは色＋テキストラベル＋アイコンの三重で表現する
2. **赤は不可逆のみ**：`status-danger` は破壊的操作・致命的エラー・怪異の最高脅威にのみ使用する
3. **金は意味のある場所だけ**：`accent-gold` はCTA・重要データ・ナビゲーション要素に限定する
4. **セマンティック色は上書きしない**：ステータス色をブランド色やアクセント色に流用しない

---

<a id="ch3"></a>
# CHAPTER 3　タイポグラフィ

## 3-1　フォントファミリー

### プライマリフォント（本文・見出し）

```
font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif;
```

Noto Sans JPを基盤とする。角ゴシック体の無機質さがサイバーパンクの質感に適合し、日本語の可読性が高い。

### モノスペースフォント（コード・データ・UI要素）

```
font-family: 'JetBrains Mono', 'Consolas', 'Courier New', monospace;
```

端末画面・データ表示・ゲームメカニクスの数値にはモノスペースを使用する。HUD端末UIの核心を担うフォントだ。

### 使い分けの基準

| 場面 | フォント | 理由 |
|------|----------|------|
| 本文・説明文 | Noto Sans JP | 日本語の可読性 |
| 見出し | Noto Sans JP (700/900) | 見出しの重み |
| 数値・データ | JetBrains Mono | 桁揃え・端末感 |
| コード・術式名 | JetBrains Mono | 技術的要素の明示 |
| ラベル・バッジ | JetBrains Mono | 分類情報の識別性 |
| 引用・世界観テキスト | Noto Sans JP (300) | 軽い重みで雰囲気を出す |

## 3-2　タイプスケール（9段階）

8pxベースラインに基づく比率1.25のスケール。レスポンシブ対応。

| レベル | トークン名 | デスクトップ | モバイル（≤768px） | 行間 | ウェイト | 用途 |
|--------|------------|-------------|-------------------|------|----------|------|
| Hero | `type-hero` | 3.5rem (56px) | clamp(2.2rem, 6vw, 3.5rem) | 1.1 | 900 | ヒーローセクション |
| Display | `type-display` | 2.8rem (44.8px) | 2.0rem | 1.15 | 700 | ページタイトル |
| H1 | `type-h1` | 2.2rem (35.2px) | 1.6rem | 1.2 | 700 | セクション見出し |
| H2 | `type-h2` | 1.6rem (25.6px) | 1.3rem | 1.25 | 700 | サブセクション見出し |
| H3 | `type-h3` | 1.3rem (20.8px) | 1.1rem | 1.3 | 500 | 項目見出し |
| Body | `type-body` | 0.95rem (15.2px) | 0.95rem | 1.9 | 400 | 本文 |
| Small | `type-small` | 0.85rem (13.6px) | 0.85rem | 1.6 | 400 | 補助テキスト |
| XS | `type-xs` | 0.75rem (12px) | 0.75rem | 1.5 | 400 | ラベル・バッジ |
| Micro | `type-micro` | 0.65rem (10.4px) | 0.65rem | 1.4 | 400 | メタ情報・タイムスタンプ |

### レスポンシブスケール実装

```css
:root {
  --type-hero: clamp(2.2rem, 4vw + 1rem, 3.5rem);
  --type-display: clamp(2.0rem, 3vw + 0.8rem, 2.8rem);
  --type-h1: clamp(1.6rem, 2.5vw + 0.6rem, 2.2rem);
  --type-h2: clamp(1.3rem, 2vw + 0.4rem, 1.6rem);
  --type-h3: clamp(1.1rem, 1.5vw + 0.3rem, 1.3rem);
  --type-body: 0.95rem;
  --type-small: 0.85rem;
  --type-xs: 0.75rem;
  --type-micro: 0.65rem;
}
```

## 3-3　行間（Line Height）

| 場面 | 行間 | 理由 |
|------|------|------|
| 見出し（Hero〜H3） | 1.1〜1.3 | コンパクトに締める |
| 本文 | 1.9 | 日本語の可読性を最大化 |
| テーブルセル | 1.6 | データの密度と可読性のバランス |
| ラベル・バッジ | 1.0 | 一行で完結する要素 |

## 3-4　文字間隔（Letter Spacing）

| 場面 | 値 | 理由 |
|------|------|------|
| 見出し（日本語） | `0.04em` | 見出しの格を出す |
| 見出し（英数字） | `0.08em` | ワイドスペーシングで端末感 |
| 本文 | `0` | デフォルト |
| モノスペース | `0.02em` | 微調整のみ |
| ラベル・バッジ | `0.06em` | 大文字ラベルの可読性 |

## 3-5　アクセシビリティ要件

| 項目 | 基準 |
|------|------|
| 最小フォントサイズ | 12px（`type-xs` の下限） |
| 本文の最小サイズ | 15px（`type-body`） |
| ユーザーによるサイズ変更 | `rem` 単位で指定。ブラウザのフォントサイズ設定に追従する |
| 行の最大文字数 | 40文字（日本語）/ 80文字（英語） |
| フォーカス時の文字サイズ変更 | なし（レイアウトシフトを防ぐ） |
| スクリーンリーダー対応 | 視覚的な見出しレベルとHTML見出しレベルを一致させる |

## 3-6　タイポグラフィの使用例

### 見出し階層

```
[type-hero]     電脳怪異譚 KAI-I//KILL
[type-display]  第一章：調査プロセス
[type-h1]       怪異の正体
[type-h2]       核の所在
[type-h3]       被害パターン
[type-body]     怪異は集合的な噂・言説・信念が臨界点を超えた時に…
[type-small]    ※改造個体の可能性あり
[type-xs]       四級・乙種・循環型
[type-micro]    2034.08.15 更新
```

### モノスペースの使用場面

```
HP: 10 + 体ランクボーナス      ← ステータス数値
討伐クロック: ████████░░ 8/10  ← ゲージ表示
Igniscript::flame_burst()      ← 術式名
侵食率: 47%                    ← パーセンテージ
```

---

<a id="ch4"></a>
# CHAPTER 4　グリッドシステム

## 4-1　12カラムグリッド

コンテンツの整列と一貫性を保証する12カラムグリッド。8pxベースラインとの親和性を確保する。

### グリッド定数

| プロパティ | 値 | 説明 |
|------------|------|------|
| カラム数 | 12 | 2, 3, 4, 6分割が可能 |
| ガター（列間隔） | 24px (3 × 8px) | カラム間の固定間隔 |
| マージン（外側余白） | 24px（モバイル）/ 48px（デスクトップ） | コンテナの左右余白 |
| 最大コンテンツ幅 | 1200px | コンテンツエリアの上限 |
| サイドバー幅 | 220px（固定） | ナビゲーション領域 |
| メインコンテンツ最大幅 | 900px | テキスト主体コンテンツの上限 |

### ブレークポイント

| 名称 | トークン名 | 値 | カラム数 | ガター | マージン |
|------|------------|------|---------|--------|---------|
| Mobile | `bp-mobile` | 0〜767px | 4 | 16px | 16px |
| Tablet | `bp-tablet` | 768〜1023px | 8 | 24px | 32px |
| Desktop | `bp-desktop` | 1024〜1439px | 12 | 24px | 48px |
| Wide | `bp-wide` | 1440px〜 | 12 | 32px | auto（中央寄せ） |

### レイアウトパターン

```
■ フルレイアウト（サイドバー + コンテンツ）

┌──────────┬──────────────────────────────────────┐
│ Sidebar  │  Main Content                        │
│ 220px    │  max-width: 900px                    │
│ (fixed)  │  (centered in remaining space)       │
│          │                                      │
└──────────┴──────────────────────────────────────┘

■ カードグリッド（auto-fill）

┌─────────────┬─────────────┬─────────────┐
│  Card       │  Card       │  Card       │
│  min: 280px │  min: 280px │  min: 280px │
└─────────────┴─────────────┴─────────────┘

■ 2カラムレイアウト

┌───────────────────┬───────────────────┐
│  Left Column      │  Right Column     │
│  6col             │  6col             │
└───────────────────┴───────────────────┘

■ コンテンツ + サイド情報

┌──────────────────────────┬──────────┐
│  Main Content            │  Aside   │
│  8col                    │  4col    │
└──────────────────────────┴──────────┘
```

### CSS実装

```css
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-lg);        /* 24px */
  max-width: var(--content-max);  /* 1200px */
  margin: 0 auto;
  padding: 0 var(--space-2xl);   /* 48px */
}

.grid--cards {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.grid--two-col {
  grid-template-columns: repeat(2, 1fr);
}

/* span ユーティリティ */
.col-1  { grid-column: span 1; }
.col-2  { grid-column: span 2; }
.col-3  { grid-column: span 3; }
.col-4  { grid-column: span 4; }
.col-6  { grid-column: span 6; }
.col-8  { grid-column: span 8; }
.col-12 { grid-column: span 12; }

/* レスポンシブ */
@media (max-width: 1023px) {
  .grid {
    grid-template-columns: repeat(8, 1fr);
    padding: 0 var(--space-xl);  /* 32px */
  }
  .col-8 { grid-column: span 8; }
  .col-4 { grid-column: span 8; }  /* フルワイドに */
}

@media (max-width: 767px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-md);        /* 16px */
    padding: 0 var(--space-md);  /* 16px */
  }
  .grid--two-col {
    grid-template-columns: 1fr;
  }
}
```

## 4-2　サイドバーレイアウト

サイドバーはグリッドの外側に独立して配置する。

```css
.site-layout {
  display: flex;
  min-height: 100vh;
}

.site-sidebar {
  width: var(--sidebar-width);  /* 220px */
  flex-shrink: 0;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  overflow-y: auto;
}

.main-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  max-width: var(--content-text-max);  /* 900px */
}

/* モバイル：サイドバーはオフキャンバスに */
@media (max-width: 767px) {
  .site-sidebar {
    transform: translateX(-100%);
    transition: transform 250ms ease;
    z-index: 100;
  }
  .site-sidebar.is-open {
    transform: translateX(0);
  }
  .main-content {
    margin-left: 0;
  }
}
```

---

<a id="ch5"></a>
# CHAPTER 5　スペーシングシステム

## 5-1　8pxベースライン

全てのスペーシングは8pxの倍数で構成する。一貫したリズムと整列を保証する。

### スペーシングスケール

| トークン名 | 値 | px換算 | 主な用途 |
|------------|------|--------|----------|
| `space-0` | `0` | 0px | リセット |
| `space-2xs` | `0.125rem` | 2px | 微細な間隔（アイコンとテキストの隙間） |
| `space-xs` | `0.25rem` | 4px | バッジ内パディング・密着要素間 |
| `space-sm` | `0.5rem` | 8px | ★基本単位。小型コンポーネント内パディング |
| `space-md` | `1rem` | 16px | コンポーネント内パディング・要素間ギャップ |
| `space-lg` | `1.5rem` | 24px | セクション内の要素間・グリッドガター |
| `space-xl` | `2rem` | 32px | セクション間の余白 |
| `space-2xl` | `3rem` | 48px | 大セクション間・コンテナマージン |
| `space-3xl` | `4rem` | 64px | ページセクション間 |
| `space-4xl` | `6rem` | 96px | ヒーロー領域の上下余白 |
| `space-5xl` | `8rem` | 128px | フルページセクション間の大余白 |

> 8pxの倍数にない `space-2xs`（2px）と `space-xs`（4px）は、バッジ・アイコン・ボーダーなどのマイクロスペーシング専用。コンポーネント間のスペーシングには使用しない。

### CSS実装

```css
:root {
  --space-0:   0;
  --space-2xs: 0.125rem;
  --space-xs:  0.25rem;
  --space-sm:  0.5rem;
  --space-md:  1rem;
  --space-lg:  1.5rem;
  --space-xl:  2rem;
  --space-2xl: 3rem;
  --space-3xl: 4rem;
  --space-4xl: 6rem;
  --space-5xl: 8rem;
}
```

## 5-2　スペーシングの適用ルール

### コンポーネント内部（Internal Spacing）

| コンポーネント種別 | パディング | 要素間ギャップ |
|-------------------|-----------|---------------|
| ボタン | `space-sm` × `space-md` (8px 16px) | — |
| カード | `space-lg` (24px) | `space-md` (16px) |
| バッジ | `space-xs` × `space-sm` (4px 8px) | — |
| テーブルセル | `space-sm` × `space-md` (8px 16px) | — |
| モーダル | `space-xl` (32px) | `space-lg` (24px) |
| 入力フィールド | `space-sm` × `space-md` (8px 16px) | — |
| サイドバー項目 | `space-sm` × `space-md` (8px 16px) | `space-xs` (4px) |

### コンポーネント間（External Spacing）

| 関係 | 間隔 | 例 |
|------|------|------|
| 同種の密接した要素 | `space-sm` (8px) | リスト項目間 |
| 同グループの要素 | `space-md` (16px) | カード内の見出しと本文 |
| 異なるグループ | `space-lg` (24px) | フォームのフィールドグループ間 |
| セクション間 | `space-xl`〜`space-2xl` (32〜48px) | ページの論理セクション |
| 大セクション間 | `space-3xl`〜`space-4xl` (64〜96px) | チャプター・ページ分割 |

## 5-3　垂直リズム

本文のline-height 1.9（≒28.5px at 15px）を基準に、見出し前後の余白を調整する。

| 要素 | 上マージン | 下マージン |
|------|-----------|-----------|
| H1 | `space-3xl` (64px) | `space-lg` (24px) |
| H2 | `space-2xl` (48px) | `space-md` (16px) |
| H3 | `space-xl` (32px) | `space-sm` (8px) |
| 段落 | `0` | `space-md` (16px) |
| リスト | `0` | `space-md` (16px) |
| テーブル | `space-md` (16px) | `space-lg` (24px) |
| コードブロック | `space-md` (16px) | `space-md` (16px) |

## 5-4　ボーダーとシャドウ

### ボーダー

| トークン名 | 値 | 用途 |
|------------|------|------|
| `border-subtle` | `1px solid rgba(255, 255, 255, 0.06)` | 最小限の区切り |
| `border-section` | `1px solid rgba(255, 255, 255, 0.08)` | セクション区切り |
| `border-gold` | `1px solid var(--accent-gold-border)` | 金のアクセントボーダー |
| `border-danger` | `1px solid var(--status-danger-border)` | 危険状態のボーダー |
| `border-input` | `1px solid rgba(255, 255, 255, 0.12)` | 入力フィールド |
| `border-input-focus` | `1px solid var(--accent-gold)` | 入力フォーカス状態 |

### ボーダー半径

| トークン名 | 値 | 用途 |
|------------|------|------|
| `radius-none` | `0` | 角なし（デフォルト） |
| `radius-sm` | `2px` | バッジ・タグ |
| `radius-md` | `4px` | カード・ボタン・入力 |
| `radius-lg` | `8px` | モーダル・大型カード |
| `radius-full` | `9999px` | ピル型・アバター |

> KAI-I//KILLでは角丸を抑制する。端末UIの硬質さを維持するため、`radius-sm`（2px）または`radius-md`（4px）を基本とする。大きな角丸は柔らかすぎる印象を与えるため使用しない。

### シャドウ

| トークン名 | 値 | 用途 |
|------------|------|------|
| `shadow-card` | `0 2px 12px rgba(0, 0, 0, 0.4)` | カード・浮上要素 |
| `shadow-elevated` | `0 4px 24px rgba(0, 0, 0, 0.6)` | モーダル・ドロップダウン |
| `shadow-glow-gold` | `0 0 12px var(--accent-gold-glow)` | 金のグロウエフェクト |
| `shadow-glow-blue` | `0 0 12px var(--accent-blue-glow)` | 青のグロウエフェクト |
| `shadow-glow-danger` | `0 0 12px rgba(230, 57, 70, 0.3)` | 赤のグロウエフェクト |
| `shadow-inset` | `inset 0 1px 3px rgba(0, 0, 0, 0.3)` | 入力フィールドの窪み |

## 5-5　トランジション

| トークン名 | 値 | 用途 |
|------------|------|------|
| `transition-fast` | `150ms ease` | ホバー・フォーカス |
| `transition-normal` | `250ms ease` | 開閉・スライド |
| `transition-slow` | `500ms ease` | フェードイン・ページ遷移 |

### アニメーション基準

| 種別 | 許可 | 禁止 |
|------|------|------|
| フェード | ○ 控えめな透明度変化 | × フラッシュ・ストロボ |
| スライド | ○ 短距離の移動 | × バウンス・スプリング |
| グロウ | ○ ゆるやかな発光 | × 点滅・パルス |
| スケール | ○ 1.0→1.02程度の微小拡大 | × 大きな拡大縮小 |

> `prefers-reduced-motion: reduce` が有効な場合、全てのアニメーションを即時完了に切り替える。

---

<a id="ch6"></a>
# CHAPTER 6　コンポーネント

## 概要

全コンポーネントは以下の5項目で定義する。

1. **構造**：HTML構造と構成要素
2. **状態**：default / hover / active / focus / disabled
3. **仕様**：サイズ・色・スペーシングの具体値
4. **アクセシビリティ**：ARIA属性・キーボード操作・スクリーンリーダー対応
5. **使用ガイド**：適切な使い方と避けるべき使い方

---

## 6-01　Button（ボタン）

### バリエーション

| バリエーション | 背景 | テキスト色 | ボーダー | 用途 |
|-------------|------|-----------|---------|------|
| **Primary** | `accent-gold` | `#05070a` | なし | 主要CTA：討伐開始・保存・送信 |
| **Secondary** | `transparent` | `accent-gold` | `border-gold` | 副次CTA：キャンセル・詳細を見る |
| **Ghost** | `transparent` | `text-secondary` | `border-subtle` | 低優先度：閉じる・リセット |
| **Danger** | `status-danger` | `#ffffff` | なし | 不可逆操作：削除・怪異化確定 |

### サイズ

| サイズ | 高さ | パディング | フォント | 用途 |
|--------|------|-----------|---------|------|
| Small | 32px | 8px 16px | `type-small` (0.85rem) | テーブル内・密集UI |
| Medium | 40px | 8px 24px | `type-body` (0.95rem) | 標準 |
| Large | 48px | 12px 32px | `type-h3` (1.1rem) | ヒーロー・単体CTA |

### 状態

| 状態 | Primary | Secondary | Ghost | Danger |
|------|---------|-----------|-------|--------|
| Default | bg: `accent-gold` | border: `accent-gold-border` | border: `border-subtle` | bg: `status-danger` |
| Hover | bg: `accent-gold-bright` + `shadow-glow-gold` | bg: `accent-gold-subtle` | bg: `rgba(255,255,255,0.04)` | brightness 1.15 + `shadow-glow-danger` |
| Active | brightness 0.9 | bg: `accent-gold-subtle` opacity 0.8 | bg: `rgba(255,255,255,0.06)` | brightness 0.85 |
| Focus | `shadow-glow-gold` + outline 2px | `shadow-glow-gold` + outline 2px | outline 2px `accent-gold` | outline 2px `status-danger` |
| Disabled | opacity 0.4, cursor: not-allowed | opacity 0.4 | opacity 0.3 | opacity 0.4 |

### アクセシビリティ

- `role="button"` を明示（`<button>` 以外の要素を使う場合）
- `aria-disabled="true"` を disabled 状態で付与
- キーボード：Enter / Space で発火。Tab でフォーカス移動
- Danger ボタンは単独で配置せず、確認ダイアログを経由する

### CSS仕様

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  border-radius: var(--radius-md);
  font-family: var(--font-mono);
  font-weight: 500;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.btn--primary {
  background: var(--accent-gold);
  color: var(--bg-primary);
  border: none;
}

.btn--primary:hover {
  background: var(--accent-gold-bright);
  box-shadow: var(--shadow-glow-gold);
}
```

---

## 6-02　Card（カード）

### 構造

```
┌─ Card ─────────────────────────────┐
│ [Header]  (optional: badge, icon)  │
│ [Title]                            │
│ [Body]    (text, data, content)    │
│ [Footer]  (optional: actions)      │
└────────────────────────────────────┘
```

### バリエーション

| バリエーション | 用途 | 特徴 |
|-------------|------|------|
| **Default** | 汎用情報カード | `bg-card` + `border-subtle` |
| **Interactive** | クリック可能カード | ホバーで `bg-card-hover` + ボーダー明滅 |
| **Glossary** | 用語集エントリ | 左ボーダー金色ライン |
| **Timeline** | 年表エントリ | 左側にタイムラインドット |
| **Anomaly** | 怪異データカード | 等級色のトップボーダー |
| **Equipment** | 装備カード | 企業色のアクセント |

### 仕様

| プロパティ | 値 |
|-----------|------|
| 背景 | `bg-card` (#0d1015) |
| ボーダー | `border-subtle` |
| 角丸 | `radius-md` (4px) |
| パディング | `space-lg` (24px) |
| シャドウ | `shadow-card` |
| ホバー背景 | `bg-card-hover` (#141820) |
| ホバーボーダー | `rgba(255, 255, 255, 0.12)` |
| 内部要素間隔 | `space-md` (16px) |

### アクセシビリティ

- Interactive カードは `role="link"` または `<a>` でラップ
- カード内の操作要素はカード自体のクリックと独立させる
- ホバー効果はフォーカスでも同等に発火させる

---

## 6-03　Badge（バッジ）

等級・脅威度・ステータスなどの分類ラベル。

### バリエーション

| バリエーション | 背景 | テキスト色 | ボーダー | 用途 |
|-------------|------|-----------|---------|------|
| **Gold** | `accent-gold-subtle` | `accent-gold` | `accent-gold-border` | 重要ラベル・所属 |
| **Danger** | `status-danger-subtle` | `status-danger` | `status-danger-border` | 高脅威・甲種 |
| **Muted** | `rgba(255,255,255,0.05)` | `text-secondary` | `border-subtle` | 低優先度情報 |
| **Grade** | 等級色のsubtle | 等級色 | 等級色の30%透過 | 存在強度等級 |
| **Faction** | 所属色のsubtle | 所属色 | 所属色の30%透過 | 三組織の識別 |
| **Magic** | 言語色のsubtle | 言語色 | 言語色の30%透過 | 魔法言語 |

### 仕様

| プロパティ | 値 |
|-----------|------|
| パディング | `space-xs` × `space-sm` (4px 8px) |
| フォント | `type-xs` (0.75rem), JetBrains Mono |
| 角丸 | `radius-sm` (2px) |
| 文字間隔 | `0.06em` |
| 行間 | 1.0 |

### 生成関数

```javascript
const badge = (color) => ({
  color: color,
  backgroundColor: `${color}18`,
  border: `1px solid ${color}4D`,
  padding: '4px 8px',
  borderRadius: '2px',
  fontSize: '0.75rem',
  fontFamily: 'var(--font-mono)',
  letterSpacing: '0.06em',
});
```

---

## 6-04　Input（入力フィールド）

### 構造

```
┌─ Field ────────────────────────────┐
│ [Label]              (type-small)  │
│ ┌─ Input ──────────────────────┐   │
│ │ Placeholder / Value          │   │
│ └──────────────────────────────┘   │
│ [Helper / Error]     (type-xs)     │
└────────────────────────────────────┘
```

### 状態

| 状態 | ボーダー | 背景 | ラベル色 |
|------|---------|------|---------|
| Default | `border-input` | `bg-primary` | `text-secondary` |
| Focus | `border-input-focus` + `shadow-glow-gold` | `bg-primary` | `accent-gold` |
| Error | `border-danger` + `shadow-glow-danger` | `status-danger-subtle` | `status-danger` |
| Disabled | `border-subtle` | `rgba(255,255,255,0.02)` | `text-disabled` |

### 仕様

| プロパティ | 値 |
|-----------|------|
| 高さ | 40px |
| パディング | `space-sm` × `space-md` (8px 16px) |
| フォント | `type-body` (0.95rem), Noto Sans JP |
| ボーダー | 1px solid |
| 角丸 | `radius-md` (4px) |
| テキスト色 | `text-primary` |
| プレースホルダー色 | `text-muted` |
| ラベルとの間隔 | `space-sm` (8px) |
| エラーメッセージとの間隔 | `space-xs` (4px) |

### アクセシビリティ

- `<label>` と `<input>` を `for`/`id` で紐付ける
- エラー時は `aria-invalid="true"` + `aria-describedby` でエラーメッセージを参照
- プレースホルダーをラベルの代替にしない

---

## 6-05　Select（セレクト／ドロップダウン）

### 仕様

Input と同じ外観を基本とする。ドロップダウンメニューは `bg-elevated` を背景とし、`shadow-elevated` で浮上させる。

| プロパティ | 値 |
|-----------|------|
| トリガー | Input と同一仕様 + 右端に矢印アイコン |
| ドロップダウン背景 | `bg-elevated` (#181c24) |
| ドロップダウンボーダー | `border-section` |
| ドロップダウンシャドウ | `shadow-elevated` |
| 選択肢パディング | `space-sm` × `space-md` (8px 16px) |
| ホバー背景 | `bg-card-hover` |
| 選択済み | `accent-gold-subtle` 背景 + `accent-gold` テキスト |
| 最大表示数 | 6項目（スクロール） |

### アクセシビリティ

- `role="listbox"` + `role="option"`
- キーボード：↑↓で選択移動、Enter で確定、Esc で閉じる
- `aria-expanded` でドロップダウンの開閉状態を通知

---

## 6-06　Checkbox / Toggle（チェックボックス／トグル）

### Checkbox 仕様

| プロパティ | 値 |
|-----------|------|
| サイズ | 18px × 18px |
| ボーダー | `border-input` |
| 角丸 | `radius-sm` (2px) |
| チェック色 | `accent-gold` |
| ラベルとの間隔 | `space-sm` (8px) |
| ラベルフォント | `type-body` |

### Toggle 仕様

| プロパティ | 値 |
|-----------|------|
| トラックサイズ | 36px × 20px |
| ノブサイズ | 16px |
| OFF 背景 | `rgba(255,255,255,0.1)` |
| ON 背景 | `accent-gold` |
| トランジション | `transition-fast` |

### アクセシビリティ

- `role="checkbox"` / `role="switch"` + `aria-checked`
- ラベルはクリック可能領域に含める

---

## 6-07　Modal（モーダル）

### 構造

```
┌─ Overlay (bg-overlay) ──────────────────────┐
│                                              │
│   ┌─ Modal (bg-elevated) ──────────────┐     │
│   │ [Header]  Title × Close           │     │
│   │ ─────────────────────────────────  │     │
│   │ [Body]    Content                  │     │
│   │ ─────────────────────────────────  │     │
│   │ [Footer]  Actions                  │     │
│   └────────────────────────────────────┘     │
│                                              │
└──────────────────────────────────────────────┘
```

### 仕様

| プロパティ | 値 |
|-----------|------|
| オーバーレイ | `bg-overlay` (rgba(0,0,0,0.7)) |
| モーダル背景 | `bg-elevated` (#181c24) |
| モーダルボーダー | `border-section` |
| モーダル角丸 | `radius-lg` (8px) |
| モーダルシャドウ | `shadow-elevated` |
| 幅 | min(90vw, 560px) |
| ヘッダーパディング | `space-lg` (24px) |
| ボディパディング | `space-lg` (24px) |
| フッターパディング | `space-md` × `space-lg` (16px 24px) |
| フッターのボタン配置 | `justify-content: flex-end`, `gap: space-sm` |

### Danger モーダル（確認ダイアログ）

不可逆操作の確認に使用する。通常モーダルとの差異：

| プロパティ | 値 |
|-----------|------|
| ヘッダーボーダー | `border-danger` |
| アイコン | 警告アイコン（`status-danger` 色） |
| 確認ボタン | Danger バリエーション |

### アクセシビリティ

- `role="dialog"` + `aria-modal="true"` + `aria-labelledby`
- 開く時にフォーカスをモーダル内の最初の操作要素に移動
- 閉じる時に開いた元の要素にフォーカスを返す
- Tab でモーダル内をループ（フォーカストラップ）
- Esc で閉じる
- 背景クリックで閉じる（Danger モーダルは背景クリック無効）

---

## 6-08　Table（テーブル）

### 仕様

| プロパティ | 値 |
|-----------|------|
| ヘッダー背景 | `bg-tertiary` (#0f1218) |
| ヘッダーフォント | `type-small` (0.85rem), weight 500 |
| ヘッダー色 | `text-secondary` |
| ヘッダー文字間隔 | `0.06em` |
| ボディフォント | `type-body` (0.95rem) |
| ボディ色 | `text-primary` |
| セルパディング | `space-sm` × `space-md` (8px 16px) |
| 行ボーダー | `border-subtle` |
| ホバー行背景 | `bg-card-hover` |
| ストライプ（偶数行） | `rgba(255,255,255,0.02)` |

### 数値カラム

数値を含むカラムは `JetBrains Mono` + `text-align: right` で表示する。

### アクセシビリティ

- `<table>` + `<thead>` + `<tbody>` の正しい構造
- `<th scope="col">` / `<th scope="row">` を適切に使用
- ソート可能カラムは `aria-sort` で状態を通知

---

## 6-09　Tooltip（ツールチップ）

### 仕様

| プロパティ | 値 |
|-----------|------|
| 背景 | `bg-elevated` (#181c24) |
| テキスト色 | `text-primary` |
| フォント | `type-small` (0.85rem) |
| パディング | `space-sm` × `space-md` (8px 16px) |
| 角丸 | `radius-md` (4px) |
| シャドウ | `shadow-elevated` |
| ボーダー | `border-section` |
| 最大幅 | 280px |
| 表示遅延 | 300ms |
| フェード | `transition-fast` |

### アクセシビリティ

- `role="tooltip"` + `aria-describedby` で紐付け
- ホバーとフォーカスの両方で表示
- Esc で閉じる

---

## 6-10　Toast / Alert（通知）

### バリエーション

| バリエーション | 左ボーダー色 | アイコン色 | 背景 |
|-------------|------------|-----------|------|
| **Info** | `status-info` | `status-info` | `status-info-subtle` |
| **Success** | `status-success` | `status-success` | `status-success-subtle` |
| **Warning** | `status-warning` | `status-warning` | `status-warning-subtle` |
| **Danger** | `status-danger` | `status-danger` | `status-danger-subtle` |

### 仕様

| プロパティ | 値 |
|-----------|------|
| 幅 | min(90vw, 400px) |
| パディング | `space-md` (16px) |
| 左ボーダー | 3px solid（バリエーション色） |
| 角丸 | `radius-md` (4px) |
| 位置 | 画面右上、`space-lg` (24px) マージン |
| 自動非表示 | 5秒（Danger は手動のみ） |
| アニメーション | 右からスライドイン、上にスライドアウト |

### アクセシビリティ

- `role="alert"` (Danger) / `role="status"` (Info, Success, Warning)
- `aria-live="assertive"` (Danger) / `aria-live="polite"` (他)
- 閉じるボタンを必ず配置

---

## 6-11　Progress Bar（プログレスバー）

### 仕様

| プロパティ | 値 |
|-----------|------|
| トラック背景 | `rgba(255,255,255,0.06)` |
| トラック高さ | 8px |
| トラック角丸 | `radius-full` |
| バー色 | `accent-gold`（デフォルト）、セマンティック色 |
| バー角丸 | `radius-full` |
| ラベルフォント | `type-xs`, JetBrains Mono |
| トランジション | `transition-normal` (width) |

### バリエーション

| バリエーション | バー色 | 用途 |
|-------------|--------|------|
| Default | `accent-gold` | 汎用進捗 |
| Danger | `status-danger` | 侵食率・臨界近接 |
| Erosion | グラデーション（段階色） | 侵食率トラック（後述） |
| Clock | `accent-gold` → 減少で `status-danger` | 討伐クロック |

---

## 6-12　Navigation - Sidebar（ナビゲーション：サイドバー）

### 構造

```
┌─ Sidebar ──────────┐
│ [Brand Logo]       │
│ ───────────────── │
│ [Nav Group Label]  │
│   [Nav Item]       │
│   [Nav Item]  ←    │  (active)
│   [Nav Item]       │
│ ───────────────── │
│ [Nav Group Label]  │
│   [Nav Item]       │
│   [Nav Item]       │
│ ───────────────── │
│ [Auth Section]     │
└────────────────────┘
```

### 仕様

| プロパティ | 値 |
|-----------|------|
| 幅 | 220px（固定） |
| 背景 | `bg-secondary` (#0a0c10) |
| 右ボーダー | `border-subtle` |
| グループラベル | `type-xs`, `text-muted`, `letter-spacing: 0.08em` |
| ナビ項目パディング | `space-sm` × `space-md` (8px 16px) |
| ナビ項目フォント | `type-small` (0.85rem) |
| ナビ項目テキスト色 | `text-secondary` |
| ホバー背景 | `rgba(255,255,255,0.04)` |
| アクティブ背景 | `accent-gold-subtle` |
| アクティブテキスト色 | `accent-gold` |
| アクティブ左ボーダー | 2px solid `accent-gold` |

---

## 6-13　Navigation - Breadcrumb（パンくずリスト）

### 仕様

| プロパティ | 値 |
|-----------|------|
| フォント | `type-small` (0.85rem) |
| テキスト色 | `text-muted`（リンク以外） |
| リンク色 | `text-secondary` |
| リンクホバー色 | `accent-gold` |
| 区切り文字 | `/`（`text-muted` 色） |
| 現在地テキスト色 | `text-primary` |
| 間隔 | `space-sm` (8px) |

### アクセシビリティ

- `<nav aria-label="パンくずリスト">` + `<ol>`
- 現在地は `aria-current="page"`

---

## 6-14　Navigation - Tabs（タブ）

### 仕様

| プロパティ | 値 |
|-----------|------|
| タブバー下ボーダー | `border-section` |
| タブパディング | `space-sm` × `space-md` (8px 16px) |
| タブフォント | `type-small` (0.85rem), weight 500 |
| 非選択テキスト色 | `text-secondary` |
| 選択テキスト色 | `accent-gold` |
| 選択下ボーダー | 2px solid `accent-gold` |
| ホバーテキスト色 | `text-primary` |
| ホバー背景 | `rgba(255,255,255,0.03)` |

### アクセシビリティ

- `role="tablist"` + `role="tab"` + `role="tabpanel"`
- `aria-selected` で選択状態を明示
- キーボード：←→でタブ移動、Enter/Space で選択

---

## 6-15　Callout（コールアウト）

情報の強調表示。世界観に沿った引用や重要注記に使用する。

### バリエーション

| バリエーション | 左ボーダー色 | 背景 | 用途 |
|-------------|------------|------|------|
| **Default** | `accent-gold` | `accent-gold-subtle` | 重要情報・ルール強調 |
| **Info** | `accent-blue` | `accent-blue-subtle` | 補足情報・解説 |
| **Warning** | `status-warning` | `status-warning-subtle` | 注意事項 |
| **Danger** | `status-danger` | `status-danger-subtle` | 致命的注意・不可逆性の警告 |
| **Quote** | `text-muted` | `rgba(255,255,255,0.02)` | 世界観テキスト・引用 |

### 仕様

| プロパティ | 値 |
|-----------|------|
| 左ボーダー | 3px solid（バリエーション色） |
| パディング | `space-md` × `space-lg` (16px 24px) |
| 角丸 | `radius-md` (4px)（右側のみ） |
| フォント | `type-body` (0.95rem) |
| 引用テキスト | `type-body`, weight 300, italic |

---

## 6-16　Divider（区切り線）

### バリエーション

| バリエーション | スタイル | 用途 |
|-------------|---------|------|
| **Subtle** | `border-subtle` | コンテンツ内の軽い区切り |
| **Section** | `border-section` | セクション間の区切り |
| **Gold** | `border-gold` | 重要セクションの区切り |
| **Ornamental** | 金色の中央ドット `●` + 左右ライン | チャプター区切り |

### Ornamental の構造

```
──────── ● ────────
```

中央に `accent-gold` のドット、左右に `border-section` のライン。チャプター間やヒーローセクションの区切りに使用する。

---

## 6-17　Accordion（アコーディオン）

### 構造

```
┌─ Accordion Item ──────────────────────┐
│ [▸ Title]                  [Badge]    │
├───────────────────────────────────────┤
│ [Content]  (collapsed by default)     │
└───────────────────────────────────────┘
```

### 仕様

| プロパティ | 値 |
|-----------|------|
| ヘッダーパディング | `space-md` (16px) |
| ヘッダーフォント | `type-h3` (1.1rem), weight 500 |
| ヘッダー色 | `text-primary` |
| アイコン（▸/▾）色 | `accent-gold` |
| ボーダー | `border-subtle`（項目間） |
| 展開アニメーション | height `transition-normal` |
| コンテンツパディング | `0` × `space-md` × `space-md` × `space-md` |
| ホバー背景 | `rgba(255,255,255,0.02)` |

### アクセシビリティ

- `aria-expanded` でトグル状態を通知
- キーボード：Enter/Space でトグル、↑↓で項目間移動

---

## 6-18　Search（検索）

### 構造

```
┌─ Search ───────────────────────────┐
│ 🔍 [検索キーワードを入力...]       │
└────────────────────────────────────┘
     │ (入力開始で以下が表示)
     ▼
┌─ Results Dropdown ──────────────────┐
│ [Result Item]                       │
│ [Result Item]                       │
│ [Result Item]                       │
│ ─── 全件表示 →                      │
└─────────────────────────────────────┘
```

### 仕様

Input コンポーネントと同一仕様 + 左端に検索アイコン（`text-muted` 色）。

| プロパティ | 値 |
|-----------|------|
| アイコンサイズ | 16px |
| アイコン色 | `text-muted` → フォーカス時 `accent-gold` |
| 結果ドロップダウン | Select のドロップダウンと同一仕様 |
| 結果項目 | タイトル（`text-primary`）+ 説明（`text-secondary`, `type-small`） |
| ハイライト | 検索語の一致部分を `accent-gold` でハイライト |
| 最大表示 | 5件 + 「全件表示」リンク |

---

## 6-19　Pagination（ページネーション）

### 仕様

| プロパティ | 値 |
|-----------|------|
| ボタンサイズ | 32px × 32px |
| ボタンフォント | `type-small`, JetBrains Mono |
| テキスト色 | `text-secondary` |
| ホバー背景 | `rgba(255,255,255,0.04)` |
| 選択背景 | `accent-gold-subtle` |
| 選択テキスト色 | `accent-gold` |
| 選択ボーダー | `accent-gold-border` |
| 間隔 | `space-xs` (4px) |
| 角丸 | `radius-sm` (2px) |

---

## 6-20　Loading / Skeleton（ローディング）

### スピナー

| プロパティ | 値 |
|-----------|------|
| サイズ | 24px（Small）/ 40px（Medium）/ 64px（Large） |
| 色 | `accent-gold` |
| アニメーション | 回転 1s linear infinite |
| 厚み | 2px |

### スケルトン

| プロパティ | 値 |
|-----------|------|
| 背景 | `rgba(255,255,255,0.04)` |
| アニメーション | shimmer 2s ease infinite |
| シマー色 | `rgba(255,255,255,0.06)` |
| 角丸 | `radius-sm` (2px) |

### アクセシビリティ

- スピナーに `role="status"` + `aria-label="読み込み中"`
- スケルトンに `aria-busy="true"` を親要素に付与

---

## 6-21　Avatar（アバター）

### 仕様

| サイズ | 値 | 用途 |
|--------|------|------|
| XS | 24px | インラインテキスト |
| SM | 32px | リスト・コメント |
| MD | 48px | プロフィールカード |
| LG | 80px | プロフィールページ |
| XL | 120px | ヒーロー・詳細ページ |

| プロパティ | 値 |
|-----------|------|
| 角丸 | `radius-full` |
| ボーダー | 2px solid `border-subtle` |
| フォールバック背景 | `bg-tertiary` |
| フォールバック文字色 | `text-secondary` |
| フォールバック文字 | 名前の頭文字（JetBrains Mono） |

---

## 6-22　Tag / Label（タグ）

バッジより大きく、削除可能なフィルタリング用要素。

### 仕様

| プロパティ | 値 |
|-----------|------|
| パディング | `space-xs` × `space-md` (4px 16px) |
| フォント | `type-small` (0.85rem) |
| 背景 | `rgba(255,255,255,0.06)` |
| テキスト色 | `text-primary` |
| ボーダー | `border-subtle` |
| 角丸 | `radius-full` |
| 削除アイコン | `×`, `text-muted` → hover: `status-danger` |
| ホバー | ボーダー `rgba(255,255,255,0.12)` |

---

## 6-23　Status Indicator（ステータスインジケーター）

オンライン状態や動作状態を示す小型インジケーター。

### バリエーション

| 状態 | 色 | ドット | ラベル例 |
|------|------|--------|---------|
| Active | `status-success` | ● 点灯 | 活動中・接続中 |
| Warning | `status-warning` | ● 点灯 | 注意・不安定 |
| Error | `status-danger` | ● 点灯 | エラー・切断 |
| Inactive | `text-muted` | ○ 空洞 | 非活動・オフライン |

### 仕様

| プロパティ | 値 |
|-----------|------|
| ドットサイズ | 8px |
| ドットとラベルの間隔 | `space-sm` (8px) |
| ラベルフォント | `type-small` |
| ラベル色 | 対応するステータス色 |

---

## ── ゲーム固有コンポーネント ──

以下はKAI-I//KILLのTRPGシステムに特化したコンポーネントだ。

---

## 6-24　Resonance Meter（感情共鳴メーター）

共鳴記録システムの6種の感情メーターを表示する。

### 構造

```
┌─ Resonance Meter ────────────────────────┐
│ [Label]  恐怖 FEAR                       │
│ ┌──────────────────────────────────────┐ │
│ │ ███████░░░░░░░░░░░░░░ 7/10          │ │
│ └──────────────────────────────────────┘ │
│ [Stage] 第三段階: 上級覚醒ギフト          │
└──────────────────────────────────────────┘
```

### 仕様

| プロパティ | 値 |
|-----------|------|
| ラベルフォント | `type-small`, JetBrains Mono |
| ラベル色 | 対応する `resonance-*` 色 |
| トラック背景 | `rgba(255,255,255,0.06)` |
| トラック高さ | 12px |
| バー色 | 対応する `resonance-*` 色 |
| バーグロウ | `0 0 8px [resonance-*-glow]` |
| 数値フォント | `type-xs`, JetBrains Mono |
| 段階ラベルフォント | `type-xs` |
| 各メーター間隔 | `space-sm` (8px) |
| 全体パディング | `space-md` (16px) |

### 覚醒段階の視覚表現

| 蓄積点 | 段階 | バーの表現 |
|--------|------|-----------|
| 0 | — | トラックのみ（バーなし） |
| 1〜3 | 第一段階 | バー通常表示 |
| 4〜6 | 第二段階 | バー + 微かなパルスアニメーション |
| 7〜9 | 第三段階 | バー + 強いパルス + グロウ増加 |
| 10 | 臨界 | バー全点灯 + フラッシュ + `status-danger` ボーダー |

### アクセシビリティ

- `role="meter"` + `aria-valuenow` + `aria-valuemin="0"` + `aria-valuemax="10"`
- `aria-label` で「恐怖メーター: 7/10, 第三段階」のように状態を通知

---

## 6-25　Erosion Tracker（侵食率トラッカー）

侵食率（0〜100%）の不可逆進行を視覚化する。

### 構造

```
┌─ Erosion Tracker ────────────────────────┐
│ 侵食率 EROSION                           │
│ ┌──────────────────────────────────────┐ │
│ │ ██████████████████░░░░░ 47%          │ │
│ └──────────────────────────────────────┘ │
│ 段階: 変容の兆し                          │
│ ⚠ 侵食率は絶対に下がらない               │
└──────────────────────────────────────────┘
```

### バー色のグラデーション（段階対応）

| 侵食率 | バー色 | 段階名 |
|--------|--------|--------|
| 0〜25% | `status-success` (#2a9d6e) | 正常 |
| 26〜50% | `status-warning` (#e6952b) | 変容の兆し |
| 51〜75% | `resonance-thirst` (#7030a0) | 半化の影 |
| 76〜99% | `status-danger` (#e63946) | 臨界 |
| 100% | `#ffffff` (点滅) | 怪異化 |

### 仕様

| プロパティ | 値 |
|-----------|------|
| トラック高さ | 16px |
| バー角丸 | `radius-full` |
| 数値フォント | `type-h3` (1.1rem), JetBrains Mono, weight 700 |
| 段階ラベルフォント | `type-small` |
| 警告テキスト | `type-xs`, `status-danger` 色 |
| ボーダー | 76%以上で `border-danger` |

### アクセシビリティ

- `role="meter"` + `aria-valuenow` + `aria-valuemin="0"` + `aria-valuemax="100"`
- 76%以上で `aria-live="assertive"` による臨界通知

---

## 6-26　Subjugation Clock（討伐クロック）

怪異の討伐進行を管理するクロック表示。

### 構造

```
┌─ Clock ──────────────────────────────────┐
│ 討伐クロック SUBJUGATION CLOCK           │
│                                          │
│    ┌──────────────────────┐              │
│    │  ████████░░  8/10    │              │
│    └──────────────────────┘              │
│                                          │
│ 制限ラウンド: 2/3  [残1ラウンド]          │
└──────────────────────────────────────────┘
```

### 仕様

| プロパティ | 値 |
|-----------|------|
| クロックバー色 | `accent-gold`（通常）→ 残2以下で `status-danger` |
| クロックバー高さ | 20px |
| 数値フォント | `type-h2` (1.6rem), JetBrains Mono, weight 700 |
| ラウンド表示フォント | `type-small`, JetBrains Mono |
| 残1ラウンド表示 | `status-danger` 色 + パルスアニメーション |
| ボーダー | `border-gold`（通常）→ `border-danger`（残2以下） |
| 背景 | `bg-card` |
| パディング | `space-lg` (24px) |

---

## 6-27　Anomaly Data Block（怪異データブロック）

GMが使用する怪異の完全データ表示。

### 構造

```
┌─ Anomaly Header ─────────────────────────┐
│ [Grade Badge]  [Threat Badge]            │
│ [Name]  深夜廻り                          │
│ [Origin] 「深夜に一人で歩くと…」          │
├──────────────────────────────────────────┤
│ ■ 分類情報                                │
│ 永続性: 循環型  影響範囲: 局所型           │
│ 被害性質: 精神型                           │
├──────────────────────────────────────────┤
│ ■ 核                                      │
│ 24時間営業コンビニの駐車場に立つ…         │
├──────────────────────────────────────────┤
│ ■ 戦闘データ                              │
│ 初期クロック: 6  制限ラウンド: 3           │
├──────────────────────────────────────────┤
│ ■ 護衛                                    │
│ [Guard Card] [Guard Card]                │
├──────────────────────────────────────────┤
│ ■ ルール                                  │
│ - ルール1                                 │
│ - ルール2                                 │
├──────────────────────────────────────────┤
│ ■ 解明鍵の難易度修正                      │
│ ①正体: +0  ②核: −1  ③被害: +0  ④全容: +0│
└──────────────────────────────────────────┘
```

### 仕様

| プロパティ | 値 |
|-----------|------|
| 上部ボーダー | 3px solid [grade色] |
| 背景 | `bg-card` |
| ヘッダー背景 | `bg-tertiary` |
| 名前フォント | `type-h2`, weight 700 |
| 元の噂フォント | `type-body`, weight 300, italic |
| セクションラベル | `type-small`, JetBrains Mono, `text-muted` |
| データ値フォント | `type-body`, JetBrains Mono（数値のみ） |
| セクション区切り | `border-subtle` |
| パディング | `space-lg` (24px) |

---

## 6-28　Guard Card（護衛カード）

護衛データの個別表示。

### 構造

```
┌─ Guard Card ──────────────────┐
│ 《迷い案内》                   │
│ HP: 5  行動値: 2              │
│ ──────────────────────────── │
│ 特性: 干渉（BLOCK）           │
│ この護衛がいる限り核への       │
│ 直接攻撃−2                    │
└───────────────────────────────┘
```

### 仕様

| プロパティ | 値 |
|-----------|------|
| 背景 | `bg-tertiary` |
| ボーダー | `border-section` |
| 名前フォント | `type-h3`, weight 700 |
| HP・行動値フォント | `type-body`, JetBrains Mono |
| 特性名フォント | `type-small`, JetBrains Mono, `accent-gold` |
| 特性説明フォント | `type-small` |
| パディング | `space-md` (16px) |
| 幅 | 240px（横並び時）/ 100%（縦積み時） |

---

## 6-29　Character Stat Block（キャラクターステータスブロック）

7能力値のランク表示。

### 構造

```
┌─ Stat Block ─────────────────────────────┐
│ ┌─────┬─────┬─────┬─────┬─────┬─────┬──┐│
│ │ 体  │ 疾  │ 識  │ 判  │察 │ 術  │魂││
│ │  B  │  C  │  A  │  B  │  C  │  D  │ B││
│ │ 3d6 │ 2d6 │ 4d6 │ 3d6 │ 2d6 │ 1d6 │3d6│
│ └─────┴─────┴─────┴─────┴─────┴─────┴──┘│
└──────────────────────────────────────────┘
```

### ランク別色

| ランク | テキスト色 | 背景色 |
|--------|-----------|--------|
| S | `accent-gold-bright` | `accent-gold-subtle` |
| A | `accent-gold` | `rgba(212, 175, 55, 0.06)` |
| B | `text-primary` | `rgba(255, 255, 255, 0.04)` |
| C | `text-secondary` | `rgba(255, 255, 255, 0.02)` |
| D | `text-muted` | `transparent` |

### 仕様

| プロパティ | 値 |
|-----------|------|
| セル幅 | 均等分割（7列） |
| 能力名フォント | `type-xs`, weight 500 |
| ランクフォント | `type-h2`, JetBrains Mono, weight 700 |
| ダイス数フォント | `type-micro`, JetBrains Mono |
| セルパディング | `space-sm` × `space-xs` (8px 4px) |
| セル間ボーダー | `border-subtle` |
| text-align | center |

---

## 6-30　Dice Display（ダイス表示）

判定結果のダイス目を表示する。

### 仕様

| プロパティ | 値 |
|-----------|------|
| ダイスサイズ | 40px × 40px |
| 背景 | `bg-tertiary` |
| ボーダー | `border-section` |
| 角丸 | `radius-md` (4px) |
| 数値フォント | `type-h2`, JetBrains Mono, weight 700 |
| 数値色 | `text-primary`（通常） |
| スペシャル（6）| 数値色: `accent-gold`, ボーダー: `border-gold`, グロウ: `shadow-glow-gold` |
| ファンブル（1）| 数値色: `status-danger`, ボーダー: `border-danger`, グロウ: `shadow-glow-danger` |
| ダイス間隔 | `space-sm` (8px) |
| 達成値ダイスマーク | 上部に `accent-gold` のドット |
| 共鳴ダイスマーク | 上部に対応メーター色のドット |

---

## 6-31　Investigation Key Tracker（解明鍵トラッカー）

四つの解明鍵の進行状況を表示する。

### 構造

```
┌─ Keys ───────────────────────────────────┐
│  ● ①怪異の正体     [解明済]              │
│  ● ②核の所在       [解明済]              │
│  ○ ③被害パターン   [未解明]              │
│  ○ ④ルールの全容   [未解明]              │
│ ──────────────────────────────────────── │
│ 解明状況: 2/4鍵                           │
└──────────────────────────────────────────┘
```

### 仕様

| プロパティ | 値 |
|-----------|------|
| 解明済ドット | ● `accent-gold`, グロウ付き |
| 未解明ドット | ○ `text-muted`, 空洞 |
| 鍵名フォント | `type-body` |
| ステータスフォント | `type-xs`, JetBrains Mono |
| 解明済ステータス色 | `accent-gold` |
| 未解明ステータス色 | `text-muted` |
| 項目間隔 | `space-sm` (8px) |
| サマリーフォント | `type-small`, JetBrains Mono, weight 700 |

---

## 6-32　Equipment Card（装備カード）

装備データの表示カード。

### 構造

```
┌─ Equipment Card ─────────────────────────┐
│ [Type Badge]  半装身型                    │
│ [Name]  雷禽重工 RK-07 アームガード       │
│ [Maker Badge]  雷禽重工                   │
│ ──────────────────────────────────────── │
│ 武器修正: +2                              │
│ 怪異発生リスク: 中                         │
│ ──────────────────────────────────────── │
│ カスタムオプション:                        │
│  • 出力増幅 (+2 / 侵食+1)                │
│  • 霊的出力 (+2 vs 怪異耐性型)            │
│ ──────────────────────────────────────── │
│ 共鳴影響: 渇望+1 (使用時)                 │
└──────────────────────────────────────────┘
```

### 仕様

| プロパティ | 値 |
|-----------|------|
| 背景 | `bg-card` |
| 上部ボーダー | 2px solid [メーカー色] |
| 名前フォント | `type-h3`, weight 700 |
| データ値フォント | `type-body`, JetBrains Mono |
| カスタムオプション | リスト、`type-small` |
| 共鳴影響テキスト | `type-xs`, 対応メーター色 |
| パディング | `space-lg` (24px) |
| カード幅 | min(100%, 360px) |

---

## 6-33　Timeline Entry（年表エントリ）

### 構造

```
         ●── 1867年
         │   鵺ヶ原事変
         │   近代初の大規模怪異事件として記録…
         │
         ●── 1931年
         │   白鴉事件
         │   大都市の地下工事中に封印されていた…
```

### 仕様

| プロパティ | 値 |
|-----------|------|
| タイムライン線 | 2px solid `accent-gold-border` |
| ドット | 8px, `accent-gold`, `radius-full` |
| ドットグロウ | `shadow-glow-gold` |
| 年号フォント | `type-small`, JetBrains Mono, `accent-gold` |
| タイトルフォント | `type-h3`, weight 700 |
| 説明フォント | `type-body` |
| エントリ間隔 | `space-xl` (32px) |
| 線とコンテンツの間隔 | `space-lg` (24px) |

---

## 6-34　Glossary Entry（用語集エントリ）

### 構造

```
┌─ Glossary Entry ─────────────────────────┐
│ 【怪異】★                                │
│ ──────────────────────────────────────── │
│ 分類: 基本概念                            │
│ 関連: バグ、核、ルール、信念密度           │
│ ──────────────────────────────────────── │
│ 集合的な噂・言説・信念が臨界点を超えた    │
│ 時に現実へと侵食する存在の総称だ…         │
└──────────────────────────────────────────┘
```

### 仕様

| プロパティ | 値 |
|-----------|------|
| 左ボーダー | 3px solid `accent-gold` |
| 用語名フォント | `type-h2`, weight 700 |
| マーク（★/？）色 | `accent-gold`（★）/ `status-warning`（？） |
| 分類・関連フォント | `type-xs`, `text-secondary` |
| 関連語リンク色 | `accent-gold` |
| 本文フォント | `type-body` |
| パディング | `space-lg` (24px) |
| 背景 | `bg-card` |
| マージン下 | `space-xl` (32px) |

---

## 6-35　Conviction Points（信念ポイント表示）

### 構造

```
信念 CONVICTION
● ● ● ○ ○   3/5
```

### 仕様

| プロパティ | 値 |
|-----------|------|
| 残存ドット | ● `accent-gold`, 12px |
| 消費済みドット | ○ `text-muted`, 12px, 空洞 |
| ドット間隔 | `space-xs` (4px) |
| 数値フォント | `type-small`, JetBrains Mono |
| ラベルフォント | `type-xs`, JetBrains Mono, `text-muted` |

---

## 6-36　Status Condition Card（状態異常カード）

### 構造

```
┌─ Condition ──────────┐
│ ⚡ WOUND              │
│ 全判定−1              │
│ 回復: 応急/回復行動   │
└──────────────────────┘
```

### 仕様

| プロパティ | 値 |
|-----------|------|
| 背景 | `status-danger-subtle`（有害）/ `status-info-subtle`（中立） |
| 左ボーダー | 2px solid 対応ステータス色 |
| 名前フォント | `type-small`, JetBrains Mono, weight 700 |
| 効果フォント | `type-xs` |
| 回復条件フォント | `type-micro`, `text-muted` |
| パディング | `space-sm` × `space-md` (8px 16px) |
| 角丸 | `radius-sm` (2px) |

---

<a id="ch7"></a>
# CHAPTER 7　デザインパターン

## 7-1　ページレイアウトパターン

### パターン A：テキスト主体ページ

ルールブック・世界観バイブル・用語集など、長文コンテンツのレイアウト。

```
┌─ Sidebar ─┬─ Main ──────────────────────────┐
│           │  [Page Header]                   │
│           │  ─────────────────────────────── │
│           │  [Section H1]                    │
│           │  [Body Text]                     │
│           │  [Table]                         │
│           │  [Section H2]                    │
│           │  [Body Text]                     │
│           │  [Callout]                       │
│           │                                  │
│           │  max-width: 900px (centered)     │
└───────────┴──────────────────────────────────┘
```

- テキストコンテンツは `max-width: 900px` で中央寄せ
- 行の最大文字数40文字（日本語）を目安に

### パターン B：カードグリッドページ

一覧・索引・データブラウジングのレイアウト。

```
┌─ Sidebar ─┬─ Main ──────────────────────────┐
│           │  [Page Header]                   │
│           │  [Filter Bar]                    │
│           │  ┌─────┬─────┬─────┐             │
│           │  │Card │Card │Card │             │
│           │  ├─────┼─────┼─────┤             │
│           │  │Card │Card │Card │             │
│           │  └─────┴─────┴─────┘             │
│           │  [Pagination]                    │
└───────────┴──────────────────────────────────┘
```

- `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`
- フィルター＋ページネーションで大量データをハンドリング

### パターン C：詳細ページ

個別データの詳細表示（怪異詳細・キャラクター詳細・装備詳細）。

```
┌─ Sidebar ─┬─ Main ──────────────────────────┐
│           │  [Breadcrumb]                    │
│           │  [Detail Header] (name, badges)  │
│           │  ┌──────────┬──────────┐         │
│           │  │  Main    │  Side    │         │
│           │  │  Content │  Info    │         │
│           │  │  8col    │  4col    │         │
│           │  └──────────┴──────────┘         │
└───────────┴──────────────────────────────────┘
```

- メインコンテンツ（8カラム）にストーリー・ルール
- サイドバー情報（4カラム）にステータス・メタデータ

### パターン D：セッション管理ページ

TRPG進行中の画面レイアウト。

```
┌─ Sidebar ─┬─ Main ──────────────────────────┐
│           │  [Session Header]                │
│           │  ┌──────────────────┬────────┐   │
│           │  │  Game Area       │ Status │   │
│           │  │  (Narrative,     │ Panel  │   │
│           │  │   Actions,       │ (Clock,│   │
│           │  │   Dice)          │ Meters,│   │
│           │  │                  │ Keys)  │   │
│           │  └──────────────────┴────────┘   │
└───────────┴──────────────────────────────────┘
```

## 7-2　情報階層パターン

### 段階的開示（Progressive Disclosure）

```
Level 0: 一覧カード     → 名前 + 等級バッジ + 1行サマリー
Level 1: 詳細ページ     → 全データ表示（テーブル + テキスト）
Level 2: モーダル/展開   → 秘匿情報・詳細解説・GM向け注記
```

### 怪異等級の視覚的重み

等級が上がるにつれて視覚的な「重み」を増す。

| 等級 | カードの演出 |
|------|-------------|
| 五級 | 通常カード。バッジのみ |
| 四級 | 通常カード + 上部に等級色ライン |
| 三級 | 等級色ライン + バッジに微グロウ |
| 二級 | 等級色ライン + カードボーダーに等級色 + バッジグロウ |
| 一級 | 全面等級色ボーダー + 金色グロウ + ヘッダー背景に金ティント |
| 特級 | 赤ボーダー + 赤グロウ + 警告アイコン + パルスアニメーション |

## 7-3　フォームパターン

### バリデーション

- エラーメッセージはフィールドの直下に `type-xs`、`status-danger` で表示
- エラーのあるフィールドは即座に `border-danger` に切り替え
- 送信後のサーバーエラーはページ上部に Toast(Danger) で表示

## 7-4　空状態パターン（Empty State）

データが存在しない場合の表示。

```
┌──────────────────────────────────────────┐
│                                          │
│         [Icon: 半透明, 48px]             │
│                                          │
│    まだデータが登録されていない           │
│    [type-body, text-secondary]           │
│                                          │
│    [Button: Secondary]                   │
│                                          │
└──────────────────────────────────────────┘
```

## 7-5　エラーパターン

404のエラーページは「調査対象が見つからなかった」、500のエラーページは「バグ検出」として、世界観に沿った表現を使う。404は `accent-gold` のヒーロー数値、500は `status-danger` のヒーロー表示。

## 7-6　レスポンシブパターン

| 要素 | Desktop (≥1024px) | Tablet (768-1023px) | Mobile (≤767px) |
|------|-------------------|---------------------|-----------------|
| サイドバー | 固定表示 | 折りたたみ可能 | オフキャンバス |
| カードグリッド | 3列 | 2列 | 1列 |
| 2カラムレイアウト | 8:4 | 6:6 | 縦積み |
| テーブル | 通常表示 | 横スクロール | カード化 |
| モーダル | 中央、max 560px | 中央、max 90vw | フルスクリーン |
| ステータスブロック | 7列横並び | 4列+3列 | 2列+縦積み |
| 共鳴メーター | 6列横並び | 3列×2行 | 縦積み |

---

<a id="ch8"></a>
# CHAPTER 8　デザイントークン

## 8-1　JSON トークン定義

```json
{
  "color": {
    "bg": {
      "primary":    { "value": "#05070a" },
      "secondary":  { "value": "#0a0c10" },
      "tertiary":   { "value": "#0f1218" },
      "card":       { "value": "#0d1015" },
      "cardHover":  { "value": "#141820" },
      "elevated":   { "value": "#181c24" },
      "glass":      { "value": "rgba(5, 7, 10, 0.92)" },
      "overlay":    { "value": "rgba(0, 0, 0, 0.7)" }
    },
    "text": {
      "heading":    { "value": "#ffffff" },
      "primary":    { "value": "#e8e6e3" },
      "secondary":  { "value": "#9a9a9a" },
      "muted":      { "value": "#555566" },
      "disabled":   { "value": "#3a3a44" }
    },
    "accent": {
      "gold":         { "value": "#d4af37" },
      "goldBright":   { "value": "#eebb4d" },
      "goldGlow":     { "value": "rgba(212, 175, 55, 0.3)" },
      "goldSubtle":   { "value": "rgba(212, 175, 55, 0.1)" },
      "goldBorder":   { "value": "rgba(212, 175, 55, 0.25)" },
      "blue":         { "value": "#3a6ea5" },
      "blueGlow":     { "value": "rgba(58, 110, 165, 0.25)" },
      "blueSubtle":   { "value": "rgba(58, 110, 165, 0.08)" }
    },
    "status": {
      "danger":        { "value": "#e63946" },
      "dangerSubtle":  { "value": "rgba(230, 57, 70, 0.12)" },
      "dangerBorder":  { "value": "rgba(230, 57, 70, 0.35)" },
      "warning":       { "value": "#e6952b" },
      "warningSubtle": { "value": "rgba(230, 149, 43, 0.12)" },
      "success":       { "value": "#2a9d6e" },
      "successSubtle": { "value": "rgba(42, 157, 110, 0.12)" },
      "info":          { "value": "#3a6ea5" },
      "infoSubtle":    { "value": "rgba(58, 110, 165, 0.10)" }
    },
    "grade": {
      "special": { "value": "#e63946" },
      "1":       { "value": "#d4af37" },
      "2":       { "value": "#c78f30" },
      "3":       { "value": "#8a7a45" },
      "4":       { "value": "#5a6a50" },
      "5":       { "value": "#4a5060" }
    },
    "threat": {
      "alpha": { "value": "#e63946" },
      "beta":  { "value": "#e6952b" },
      "gamma": { "value": "#8a7a45" },
      "delta": { "value": "#3a6ea5" }
    },
    "resonance": {
      "fear":    { "value": "#8b2030", "glow": "rgba(139, 32, 48, 0.4)" },
      "rage":    { "value": "#d45020", "glow": "rgba(212, 80, 32, 0.4)" },
      "sorrow":  { "value": "#2855a0", "glow": "rgba(40, 85, 160, 0.4)" },
      "haste":   { "value": "#d48820", "glow": "rgba(212, 136, 32, 0.4)" },
      "thirst":  { "value": "#7030a0", "glow": "rgba(112, 48, 160, 0.4)" },
      "purge":   { "value": "#40a070", "glow": "rgba(64, 160, 112, 0.4)" }
    },
    "magic": {
      "p":      { "value": "#9a9a9a" },
      "ignis":  { "value": "#d43030" },
      "lupis":  { "value": "#3070c0" },
      "ivyo":   { "value": "#30a050" },
      "ngt":    { "value": "#c0a030" },
      "monyx":  { "value": "#b0b0c0" },
      "pSeal":  { "value": "#7030a0" },
      "pHeal":  { "value": "#c06088" }
    },
    "faction": {
      "haraebe":      { "value": "#d4af37" },
      "mercenary":    { "value": "#3a6ea5" },
      "unaffiliated": { "value": "#7a7a8a" }
    },
    "corp": {
      "sotetsu":   { "value": "#3a5a8a" },
      "raikin":    { "value": "#c06020" },
      "karasuha":  { "value": "#3a3a4a" },
      "shinkirou": { "value": "#6a3060" }
    }
  },
  "typography": {
    "fontFamily": {
      "primary": { "value": "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif" },
      "mono":    { "value": "'JetBrains Mono', 'Consolas', 'Courier New', monospace" }
    },
    "fontSize": {
      "hero":    { "value": "clamp(2.2rem, 4vw + 1rem, 3.5rem)" },
      "display": { "value": "clamp(2.0rem, 3vw + 0.8rem, 2.8rem)" },
      "h1":      { "value": "clamp(1.6rem, 2.5vw + 0.6rem, 2.2rem)" },
      "h2":      { "value": "clamp(1.3rem, 2vw + 0.4rem, 1.6rem)" },
      "h3":      { "value": "clamp(1.1rem, 1.5vw + 0.3rem, 1.3rem)" },
      "body":    { "value": "0.95rem" },
      "small":   { "value": "0.85rem" },
      "xs":      { "value": "0.75rem" },
      "micro":   { "value": "0.65rem" }
    },
    "lineHeight": {
      "tight":   { "value": "1.1" },
      "heading": { "value": "1.25" },
      "body":    { "value": "1.9" },
      "table":   { "value": "1.6" },
      "label":   { "value": "1.0" }
    },
    "fontWeight": {
      "light":    { "value": "300" },
      "regular":  { "value": "400" },
      "medium":   { "value": "500" },
      "bold":     { "value": "700" },
      "black":    { "value": "900" }
    }
  },
  "spacing": {
    "0":   { "value": "0" },
    "2xs": { "value": "0.125rem" },
    "xs":  { "value": "0.25rem" },
    "sm":  { "value": "0.5rem" },
    "md":  { "value": "1rem" },
    "lg":  { "value": "1.5rem" },
    "xl":  { "value": "2rem" },
    "2xl": { "value": "3rem" },
    "3xl": { "value": "4rem" },
    "4xl": { "value": "6rem" },
    "5xl": { "value": "8rem" }
  },
  "border": {
    "subtle":     { "value": "1px solid rgba(255, 255, 255, 0.06)" },
    "section":    { "value": "1px solid rgba(255, 255, 255, 0.08)" },
    "gold":       { "value": "1px solid rgba(212, 175, 55, 0.25)" },
    "danger":     { "value": "1px solid rgba(230, 57, 70, 0.35)" },
    "input":      { "value": "1px solid rgba(255, 255, 255, 0.12)" },
    "inputFocus": { "value": "1px solid #d4af37" }
  },
  "radius": {
    "none": { "value": "0" },
    "sm":   { "value": "2px" },
    "md":   { "value": "4px" },
    "lg":   { "value": "8px" },
    "full": { "value": "9999px" }
  },
  "shadow": {
    "card":       { "value": "0 2px 12px rgba(0, 0, 0, 0.4)" },
    "elevated":   { "value": "0 4px 24px rgba(0, 0, 0, 0.6)" },
    "glowGold":   { "value": "0 0 12px rgba(212, 175, 55, 0.3)" },
    "glowBlue":   { "value": "0 0 12px rgba(58, 110, 165, 0.25)" },
    "glowDanger": { "value": "0 0 12px rgba(230, 57, 70, 0.3)" },
    "inset":      { "value": "inset 0 1px 3px rgba(0, 0, 0, 0.3)" }
  },
  "transition": {
    "fast":   { "value": "150ms ease" },
    "normal": { "value": "250ms ease" },
    "slow":   { "value": "500ms ease" }
  },
  "breakpoint": {
    "mobile":  { "value": "767px" },
    "tablet":  { "value": "1023px" },
    "desktop": { "value": "1024px" },
    "wide":    { "value": "1440px" }
  },
  "layout": {
    "sidebarWidth":    { "value": "220px" },
    "contentMax":      { "value": "1200px" },
    "contentTextMax":  { "value": "900px" },
    "gridColumns":     { "value": "12" },
    "gridGutter":      { "value": "24px" }
  }
}
```

---

<a id="ch9"></a>
# CHAPTER 9　Do / Don't

## 9-1　カラー

| Do | Don't |
|----|-------|
| 背景は常にダーク系（`bg-primary`〜`bg-elevated`） | ライトグレーや白の背景を使う |
| 金色は意味のある要素にのみ使用する | 金色を装飾として乱用する |
| 赤は不可逆操作と最高脅威にのみ使用する | 赤を注意喚起やアクセントに流用する |
| 等級色は等級の表示にのみ使用する | 等級色を別の分類体系に流用する |
| 色 + テキスト + アイコンの三重で情報を伝える | 色だけで状態や分類を区別する |

## 9-2　タイポグラフィ

| Do | Don't |
|----|-------|
| 見出しは Noto Sans JP Bold/Black を使う | 見出しにライトウェイトを使う |
| 数値・データは JetBrains Mono を使う | 数値をプロポーショナルフォントで表示する |
| 日本語本文の行間は 1.9 を維持する | 行間を 1.5 未満に詰める |
| `clamp()` でレスポンシブサイズを指定する | 固定 `px` でフォントサイズを指定する |
| 1行40文字（日本語）を目安に幅を制限する | テキストをフルワイドで表示する |

## 9-3　スペーシング

| Do | Don't |
|----|-------|
| 8px の倍数でスペーシングを設計する | 5px, 7px, 13px のような半端な値を使う |
| トークン名（`space-md`）で指定する | マジックナンバーをハードコードする |
| 関連する要素は近く、無関係な要素は遠く配置する | 全ての要素に均等な間隔を取る |

## 9-4　コンポーネント

| Do | Don't |
|----|-------|
| Danger ボタンは確認ダイアログを経由する | Danger ボタンを単独で配置する |
| カードのホバーはフォーカスでも同等に発火する | マウスホバーのみに視覚効果をつける |
| モーダルはフォーカストラップを実装する | モーダル外にフォーカスが抜ける |
| テーブルは数値カラムを右揃え・モノスペースにする | 数値を左揃え・プロポーショナルで表示する |
| Toast の Danger は手動閉じのみにする | Danger Toast を自動的に消す |
| 空状態には説明テキストとアクションを配置する | データなしの画面を白紙で放置する |

## 9-5　ゲームUI

| Do | Don't |
|----|-------|
| 侵食率トラッカーは段階色で重みを視覚化する | 侵食率を単純なテキスト表示にする |
| 共鳴メーターの臨界はパルスアニメーションで警告する | 臨界状態を通常と同じ表現にする |
| 討伐クロックの残り少ない状態は赤に変化させる | クロックの緊急度を色で示さない |
| 等級が上がるにつれてカードの視覚的重みを増す | 全等級のカードを同じ見た目にする |
| 解明鍵は進行状況が一目で分かるようにする | 解明鍵のステータスをテキストのみで表示する |
| ダイスのスペシャル（6）は金色グロウで祝福する | スペシャルとファンブルを同じ表現にする |

## 9-6　アクセシビリティ

| Do | Don't |
|----|-------|
| フォーカスインジケーターを全ての操作要素に付ける | フォーカスリングを `outline: none` で消す |
| `rem` 単位でフォントサイズを指定する | `px` 固定でフォントサイズを指定する |
| `prefers-reduced-motion` でアニメーションを制御する | ユーザー設定を無視してアニメーションを強制する |
| ARIA 属性で状態とロールを明示する | 視覚的な手がかりだけに頼る |
| コントラスト比 4.5:1 以上を主要テキストで確保する | 暗い背景に暗いテキストを配置する |

## 9-7　トーン＆ムード

| Do | Don't |
|----|-------|
| 暗く静謐な雰囲気を維持する | 明るくポップな演出を入れる |
| 走査線やグロウは情報を阻害しない範囲にする | ノイズエフェクトで可読性を損なう |
| 世界観テキストは常体で統一する | 敬体（です・ます調）を混在させる |
| エラーメッセージも世界観に沿わせる | 技術的なエラーコードをそのまま表示する |
| 控えめなアニメーションでHUD端末感を出す | バウンスなどカジュアルな動きを入れる |

---

<a id="ch10"></a>
# CHAPTER 10　開発者ガイド

## 10-1　技術スタック

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 16.x | フレームワーク（App Router） |
| CSS Custom Properties | — | スタイリング（CSS-in-JSは使用しない） |
| Google Fonts | — | Noto Sans JP, JetBrains Mono |
| Clerk | — | 認証（ダークテーマオーバーライド） |
| Supabase | — | データベース |

## 10-2　CSS カスタムプロパティの実装

全てのデザイントークンは `:root` に CSS カスタムプロパティとして定義する。

```css
:root {
  /* ── Color: Background ── */
  --bg-primary:    #05070a;
  --bg-secondary:  #0a0c10;
  --bg-tertiary:   #0f1218;
  --bg-card:       #0d1015;
  --bg-card-hover: #141820;
  --bg-elevated:   #181c24;
  --bg-glass:      rgba(5, 7, 10, 0.92);
  --bg-overlay:    rgba(0, 0, 0, 0.7);

  /* ── Color: Text ── */
  --text-heading:   #ffffff;
  --text-primary:   #e8e6e3;
  --text-secondary: #9a9a9a;
  --text-muted:     #555566;
  --text-disabled:  #3a3a44;

  /* ── Color: Accent ── */
  --accent-gold:         #d4af37;
  --accent-gold-bright:  #eebb4d;
  --accent-gold-glow:    rgba(212, 175, 55, 0.3);
  --accent-gold-subtle:  rgba(212, 175, 55, 0.1);
  --accent-gold-border:  rgba(212, 175, 55, 0.25);
  --accent-blue:         #3a6ea5;
  --accent-blue-glow:    rgba(58, 110, 165, 0.25);
  --accent-blue-subtle:  rgba(58, 110, 165, 0.08);

  /* ── Color: Status ── */
  --status-danger:        #e63946;
  --status-danger-subtle: rgba(230, 57, 70, 0.12);
  --status-danger-border: rgba(230, 57, 70, 0.35);
  --status-warning:       #e6952b;
  --status-warning-subtle:rgba(230, 149, 43, 0.12);
  --status-success:       #2a9d6e;
  --status-success-subtle:rgba(42, 157, 110, 0.12);
  --status-info:          #3a6ea5;
  --status-info-subtle:   rgba(58, 110, 165, 0.10);

  /* ── Color: Grade ── */
  --grade-special: #e63946;
  --grade-1: #d4af37;
  --grade-2: #c78f30;
  --grade-3: #8a7a45;
  --grade-4: #5a6a50;
  --grade-5: #4a5060;

  /* ── Color: Resonance ── */
  --resonance-fear:       #8b2030;
  --resonance-fear-glow:  rgba(139, 32, 48, 0.4);
  --resonance-rage:       #d45020;
  --resonance-rage-glow:  rgba(212, 80, 32, 0.4);
  --resonance-sorrow:     #2855a0;
  --resonance-sorrow-glow:rgba(40, 85, 160, 0.4);
  --resonance-haste:      #d48820;
  --resonance-haste-glow: rgba(212, 136, 32, 0.4);
  --resonance-thirst:     #7030a0;
  --resonance-thirst-glow:rgba(112, 48, 160, 0.4);
  --resonance-purge:      #40a070;
  --resonance-purge-glow: rgba(64, 160, 112, 0.4);

  /* ── Color: Magic ── */
  --magic-p:      #9a9a9a;
  --magic-ignis:  #d43030;
  --magic-lupis:  #3070c0;
  --magic-ivyo:   #30a050;
  --magic-ngt:    #c0a030;
  --magic-monyx:  #b0b0c0;
  --magic-p-seal: #7030a0;
  --magic-p-heal: #c06088;

  /* ── Color: Faction ── */
  --faction-haraebe:      #d4af37;
  --faction-mercenary:    #3a6ea5;
  --faction-unaffiliated: #7a7a8a;

  /* ── Typography ── */
  --font-primary: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif;
  --font-mono:    'JetBrains Mono', 'Consolas', 'Courier New', monospace;

  --type-hero:    clamp(2.2rem, 4vw + 1rem, 3.5rem);
  --type-display: clamp(2.0rem, 3vw + 0.8rem, 2.8rem);
  --type-h1:      clamp(1.6rem, 2.5vw + 0.6rem, 2.2rem);
  --type-h2:      clamp(1.3rem, 2vw + 0.4rem, 1.6rem);
  --type-h3:      clamp(1.1rem, 1.5vw + 0.3rem, 1.3rem);
  --type-body:    0.95rem;
  --type-small:   0.85rem;
  --type-xs:      0.75rem;
  --type-micro:   0.65rem;

  /* ── Spacing ── */
  --space-0:   0;
  --space-2xs: 0.125rem;
  --space-xs:  0.25rem;
  --space-sm:  0.5rem;
  --space-md:  1rem;
  --space-lg:  1.5rem;
  --space-xl:  2rem;
  --space-2xl: 3rem;
  --space-3xl: 4rem;
  --space-4xl: 6rem;
  --space-5xl: 8rem;

  /* ── Border ── */
  --border-subtle:      1px solid rgba(255, 255, 255, 0.06);
  --border-section:     1px solid rgba(255, 255, 255, 0.08);
  --border-gold:        1px solid rgba(212, 175, 55, 0.25);
  --border-danger:      1px solid rgba(230, 57, 70, 0.35);
  --border-input:       1px solid rgba(255, 255, 255, 0.12);
  --border-input-focus: 1px solid #d4af37;

  /* ── Radius ── */
  --radius-none: 0;
  --radius-sm:   2px;
  --radius-md:   4px;
  --radius-lg:   8px;
  --radius-full: 9999px;

  /* ── Shadow ── */
  --shadow-card:       0 2px 12px rgba(0, 0, 0, 0.4);
  --shadow-elevated:   0 4px 24px rgba(0, 0, 0, 0.6);
  --shadow-glow-gold:  0 0 12px rgba(212, 175, 55, 0.3);
  --shadow-glow-blue:  0 0 12px rgba(58, 110, 165, 0.25);
  --shadow-glow-danger:0 0 12px rgba(230, 57, 70, 0.3);
  --shadow-inset:      inset 0 1px 3px rgba(0, 0, 0, 0.3);

  /* ── Transition ── */
  --transition-fast:   150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow:   500ms ease;

  /* ── Layout ── */
  --sidebar-width:     220px;
  --content-max:       1200px;
  --content-text-max:  900px;
}
```

## 10-3　命名規則

BEM（Block Element Modifier）ライクな命名を使用する。

```
.block                 → コンポーネント名
.block__element        → コンポーネント内の要素
.block--modifier       → バリエーション
```

例：`.card`, `.card__header`, `.card--anomaly`, `.btn--primary`, `.badge--grade`

## 10-4　動的スタイル生成

バッジや色付き要素の動的生成にはインラインスタイルオブジェクトを使用する。

```javascript
// 動的バッジスタイル
const badgeStyle = (color) => ({
  color: color,
  backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
  border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
  padding: 'var(--space-xs) var(--space-sm)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--type-xs)',
  fontFamily: 'var(--font-mono)',
  letterSpacing: '0.06em',
});

// 共鳴メーターバースタイル
const meterBarStyle = (type, value) => ({
  width: `${(value / 10) * 100}%`,
  backgroundColor: `var(--resonance-${type})`,
  boxShadow: value >= 7
    ? `0 0 12px var(--resonance-${type}-glow)` : 'none',
  transition: 'width var(--transition-normal)',
  height: '12px',
  borderRadius: 'var(--radius-full)',
});
```

## 10-5　データマッピング定数

```javascript
const GRADE_COLOR = {
  '特級': 'var(--grade-special)',
  '一級': 'var(--grade-1)',
  '二級': 'var(--grade-2)',
  '三級': 'var(--grade-3)',
  '四級': 'var(--grade-4)',
  '五級': 'var(--grade-5)',
};

const RESONANCE_COLOR = {
  fear:   'var(--resonance-fear)',
  rage:   'var(--resonance-rage)',
  sorrow: 'var(--resonance-sorrow)',
  haste:  'var(--resonance-haste)',
  thirst: 'var(--resonance-thirst)',
  purge:  'var(--resonance-purge)',
};

const FACTION_COLOR = {
  '祓部':   'var(--faction-haraebe)',
  '傭兵':   'var(--faction-mercenary)',
  '無所属': 'var(--faction-unaffiliated)',
};
```

## 10-6　アクセシビリティチェックリスト

新しいコンポーネントを作成する際に確認する項目。

- [ ] キーボードのみで全操作が完了するか
- [ ] Tab 順序が論理的か
- [ ] フォーカスインジケーターが視認可能か
- [ ] `role` 属性が適切に設定されているか
- [ ] `aria-label` / `aria-describedby` で補足情報が付いているか
- [ ] 色だけに依存した情報伝達がないか
- [ ] コントラスト比が WCAG AA（4.5:1）以上か
- [ ] `prefers-reduced-motion` に対応しているか
- [ ] スクリーンリーダーで意味が通るか
- [ ] 200% ズームでレイアウトが崩れないか

## 10-7　HUD端末エフェクトの実装

### 走査線オーバーレイ

```css
body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.015) 0px,
    rgba(0, 0, 0, 0.015) 1px,
    transparent 1px,
    transparent 3px
  );
}
```

### コーナーグロウ

```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9998;
  background:
    radial-gradient(ellipse at 0% 0%, rgba(58, 110, 165, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 100% 100%, rgba(58, 110, 165, 0.02) 0%, transparent 50%);
}
```

### フェードインアニメーション

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.fade-in { animation: fadeInUp 0.6s ease forwards; }

@media (prefers-reduced-motion: reduce) {
  .fade-in { animation: none; opacity: 1; }
}
```

## 10-8　ファイル構成の推奨

```
src/
├── app/
│   ├── globals.css          ← 全トークン定義 + ベーススタイル
│   └── layout.js
├── styles/
│   ├── tokens.css           ← デザイントークン（:root）
│   ├── typography.css       ← タイポグラフィ
│   ├── grid.css             ← グリッドシステム
│   └── components/          ← コンポーネントCSS
│       ├── button.css
│       ├── card.css
│       ├── badge.css
│       ├── modal.css
│       ├── resonance-meter.css
│       ├── erosion-tracker.css
│       └── ...
├── constants/
│   ├── colors.js            ← GRADE_COLOR, FACTION_COLOR 等
│   └── styles.js            ← badgeStyle(), meterBarStyle() 等
└── data/
    └── tokens.json          ← デザイントークン（JSON形式）
```

---

# 末文

> *「噂が臨界点を超えた時、それは現実のバグになる。」*
> *── 電脳怪異譚 KAI-I//KILL デザインシステム v1.0*

このデザインシステムは、電脳怪異譚の世界を視覚言語として一貫性を持って表現するための基盤だ。全てのコンポーネント、全ての色、全てのスペーシングには意味がある。

闇の中に浮かぶ金色の光──それがこのデザインシステムの核だ。
