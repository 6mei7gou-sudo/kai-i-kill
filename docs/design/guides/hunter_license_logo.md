# 討伐者資格証 ロゴマーク 画像生成プロンプト v1.0

> 討伐者資格証のヘッダー・背景・透かしに使用するロゴマークを
> 画像生成AIで作るためのプロンプト。全キャラ共通。

---

## コンセプト

「斬り裂かれた怪」— 漢字「怪」を直線のみで幾何学化し、45度の金の斜線で断つ。
プロダクトアイコン（product_icon_design_spec_v1.0.md）と同一モチーフ。

---

## メインプロンプト

```
Minimalist geometric logo mark on pure black background,
single abstract kanji "怪" (kai/monster) constructed entirely from straight lines,
the character is split diagonally from upper-left to lower-right by a glowing golden slash,
the slash creates a narrow gap of golden light bleeding through the cut,
the kanji strokes are rendered in pale gray (#e8e6e3) with sharp square-cut line endings,
the diagonal cut line is exactly 45 degrees, glowing warm gold (#d4af37) with soft bloom,
subtle gold glow emanating from the slash gap,
no curves anywhere - all strokes are perfectly straight geometric lines,
clean vector-style rendering, flat design, no gradients on the kanji itself,
very faint horizontal scanline texture overlay across entire image,
centered composition with generous padding,
square format 1:1 aspect ratio,
no text, no letters, no symbols other than the kanji,
no circle, no shield, no frame, no border,
black background #05070a,
icon design, logo mark, brand identity,
ultra minimal, professional, japanese cyberpunk aesthetic
```

---

## ネガティブプロンプト

```
text, words, letters, alphabet, watermark, signature,
circle frame, shield, border, ornate decoration,
colorful, rainbow, gradient background, white background,
3d render, realistic, photograph,
busy, cluttered, complex, detailed background,
curved lines, round shapes, soft edges,
multiple objects, multiple symbols
```

---

## 用途別バリエーション

メインプロンプトの末尾に追加する。

### favicon用（極小サイズ）

```
extremely simplified, bold thick strokes, minimal detail, high contrast,
must be readable at 16x16 pixels
```

### OGP用（横長背景）

```
16:9 aspect ratio, logo placed in center-left,
right side empty dark space for text overlay,
wider golden slash with more prominent glow
```

### 印刷用（高解像度）

```
ultra high resolution, crisp edges, print quality, 4096x4096,
perfect straight lines, no anti-aliasing artifacts
```

### 金箔風（グッズ・高級感）

```
metallic gold foil texture on the slash,
embossed effect on kanji strokes,
luxury premium aesthetic, subtle paper texture background
```

### ホログラム風（デジタル演出）

```
holographic iridescent sheen on the golden slash,
chromatic aberration at edges,
digital glitch artifacts near the cut line,
CRT monitor aesthetic
```

### 資格証の透かし用（薄い）

```
very low opacity, barely visible watermark style,
kanji strokes at 5% opacity pale gray,
golden slash at 8% opacity,
designed to be overlaid on dark content without interfering
```

---

## 色仕様

| 要素 | 色 | Hex |
|:-----|:---|:----|
| 背景 | 深黒 | `#05070a` |
| 字形（怪） | 灰白 | `#e8e6e3` |
| 切り裂き線 | 金 | `#d4af37` |
| 切り裂きグロー | 金（発光） | `#d4af37` @ 40% |
| 走査線 | 黒 | `rgba(0,0,0,0.08)` |

---

## 構造の詳細

```
「怪」の分解:

  忄（りっしんべん）     圣（つち＋又）
  │                    ─┬─
  ╱                     │
  ╲                    ─┴─
                       ╱ ╲

全体を45度の斜線が左上→右下に貫通。
斜線の両側に2〜3%のギャップ（光の隙間）。

完成形:
    │  ─┬─
    ╱ ╱  │
   ╱╱  ─┴─
  ╱╱   ╱ ╲
 ╱
（金の斜線が全体を断つ）
```

---

## 注意事項

- 曲線は一切使わない。全て直線で構成する
- 「怪」が読める必要はない。幾何学的な抽象パターンとして認識されればよい
- 金の斜線が最も目立つ要素。字形は背景に溶け込むくらいでちょうどいい
- 走査線は入れすぎない。「かすかに見える」程度
- 小サイズ（32px以下）では字形を省略し「暗い四角 + 金の斜線」だけにする
