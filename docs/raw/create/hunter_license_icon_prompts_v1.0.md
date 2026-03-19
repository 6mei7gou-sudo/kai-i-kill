# 討伐者ライセンス アイコン用 画像生成プロンプト集 v1.0

> キャラクターシートの討伐者資格証に使用するポートレート画像を
> 画像生成AIで作るためのプロンプトテンプレート。

---

## 基本ルール

- **比率**: 3:4（600×800px推奨）
- **構図**: バストアップ（胸から上）。顔が画像上部1/3に来る
- **背景**: 暗色・単色・抽象的（キャラが映えること優先）
- **画風**: セミリアル〜アニメ調。統一感を出すためスタイルを固定する
- **光源**: 左上または正面やや上から。顔に光が当たること

---

## 共通プロンプト（全キャラ共通の末尾に付ける）

```
portrait, bust up, dark background, dramatic lighting from upper left,
semi-realistic anime style, high detail face, sharp eyes,
3:4 aspect ratio, character ID card photo style,
cyberpunk japanese aesthetic, muted color palette with gold accent,
no text, no watermark, no frame
```

---

## 所属別プロンプト

### 祓部（はらえべ）キャラ

```
[キャラ描写], wearing dark navy combat uniform with subtle gold trim,
formal military-style collar, small gold emblem on chest,
serious professional expression, government agent aesthetic,
cool blue-white ambient lighting,
portrait, bust up, dark background, dramatic lighting,
semi-realistic anime style, 3:4 aspect ratio, ID card photo style
```

**バリエーション：**

古怪班（白衣）:
```
[キャラ描写], wearing white shrine-style overcoat over dark combat suit,
traditional japanese priest aesthetic mixed with modern tactical gear,
calm contemplative expression, spiritual atmosphere,
soft white and gold lighting
```

新怪班（デジタル）:
```
[キャラ描写], wearing dark tactical suit with teal digital interface elements,
holographic HUD reflected in eyes, tech-savvy appearance,
modern sharp expression, digital scan lines in background,
cyan and dark blue lighting
```

封印班（深藍）:
```
[キャラ描写], wearing deep indigo heavy-duty containment suit,
ritual sealing marks on gloves, patient determined expression,
dark blue atmospheric lighting, mist or fog elements
```

機動班（前線）:
```
[キャラ描写], wearing heavy dark combat armor with scuff marks,
tactical visor pushed up on forehead, battle-ready intense expression,
harsh orange-tinted combat lighting
```

---

### 傭兵キャラ

```
[キャラ描写], wearing mixed tactical gear from different manufacturers,
corporate sponsor logo partially visible, confident mercenary expression,
urban night environment lighting, blue and orange accent lights,
portrait, bust up, dark background, dramatic lighting,
semi-realistic anime style, 3:4 aspect ratio, ID card photo style
```

**バリエーション：**

突撃型（重装）:
```
[キャラ描写], wearing heavy tactical armor with burnt orange accents,
large caliber weapon holstered on back, aggressive confident expression,
warm harsh lighting, industrial background blur
```

偵察型（軽装）:
```
[キャラ描写], wearing lightweight stealth suit with sensor equipment,
analytical calm expression, multiple small devices on belt,
cool blue-green ambient lighting, night city background blur
```

技術型（後方支援）:
```
[キャラ描写], wearing tech-heavy vest with tools and diagnostic equipment,
welding goggles on forehead, focused intelligent expression,
workshop warm lighting, sparks bokeh in background
```

護衛型（交渉）:
```
[キャラ描写], wearing sharp tactical suit blending combat and formal wear,
calculating protective expression, earpiece visible,
professional neutral lighting, clean dark background
```

---

### 無所属キャラ

```
[キャラ描写], wearing mismatched civilian and salvaged tactical clothing,
worn patched gear from different eras and sources,
wary survival-hardened expression, street-smart appearance,
harsh uneven lighting, urban decay background blur,
portrait, bust up, dark background, dramatic lighting,
semi-realistic anime style, 3:4 aspect ratio, ID card photo style
```

**バリエーション：**

野良討伐者:
```
[キャラ描写], muscular build, minimal gear, bandaged fists,
old scars on face and arms, defiant survival expression,
harsh single-source lighting, concrete wall background
```

裏社会の住人:
```
[キャラ描写], wearing dark civilian coat hiding weapons underneath,
sharp observant expression, blending into shadows,
noir-style dramatic shadows, rain-wet surface reflections
```

在野研究者:
```
[キャラ描写], wearing practical glasses, many pockets in coat,
notebook or tablet tucked under arm, curious analytical expression,
warm desk lamp lighting, bookshelf blur in background
```

退魔師:
```
[キャラ描写], wearing aged yellowed white garment over dark clothes,
prayer beads around wrist, weathered traditional items,
calm spiritual expression with tired eyes,
dim shrine interior lighting, incense smoke
```

路地裏の犬:
```
[キャラ描写], young thin build, hoodie and worn sneakers,
sharp alert eyes contrasting with youthful face,
street-level harsh neon lighting, alley background blur
```

脱走兵:
```
[キャラ描写], wearing modified former-organization uniform with insignia scratched off,
paint-over marks where logos used to be, haunted wary expression,
cold fluorescent lighting, abandoned facility background
```

---

## キャラ描写の記入例

`[キャラ描写]` の部分に入れる具体的な描写：

```
性別・年齢:   young adult male, age 24
髪:          short messy black hair
目:          sharp amber eyes
体格:        lean athletic build
特徴:        scar across left cheek, cybernetic right arm (steel blue)
表情:        determined serious expression
```

### 組み合わせ例

**祓部・古怪班の青年**:
```
young adult male, age 22, short neat black hair, calm brown eyes,
lean build, wearing white shrine-style overcoat over dark combat suit,
traditional japanese priest aesthetic mixed with modern tactical gear,
small gold emblem on chest, prayer beads on left wrist,
calm contemplative expression with underlying resolve,
portrait, bust up, dark background, soft white and gold lighting,
semi-realistic anime style, 3:4 aspect ratio, ID card photo style,
cyberpunk japanese aesthetic, no text, no watermark
```

**傭兵・突撃型の女性**:
```
adult female, age 28, long red hair tied back in ponytail,
fierce green eyes, athletic muscular build,
wearing heavy tactical armor with burnt orange accents and scuff marks,
large caliber rifle holstered on back, confident smirk,
corporate sponsor patch on shoulder,
portrait, bust up, dark background, warm harsh industrial lighting,
semi-realistic anime style, 3:4 aspect ratio, ID card photo style,
cyberpunk japanese aesthetic, no text, no watermark
```

**無所属・脱走兵の男性**:
```
adult male, age 30, unkempt gray-streaked hair, tired dark eyes,
medium build with visible exhaustion, stubble,
wearing modified dark navy uniform with insignia scratched off,
faded paint marks where organization logo used to be,
haunted wary expression, cybernetic left eye (dull red glow),
portrait, bust up, dark background, cold fluorescent lighting,
semi-realistic anime style, 3:4 aspect ratio, ID card photo style,
cyberpunk japanese aesthetic, no text, no watermark
```

---

## ネガティブプロンプト（除外指定）

```
text, watermark, signature, frame, border, logo,
blurry, low quality, deformed, extra fingers, extra limbs,
full body, legs visible, below waist,
bright cheerful background, white background,
cartoon style, chibi, super deformed,
real photo, photorealistic
```

---

## 注意事項

- **所属色を反映する**: 祓部=金のアクセント、傭兵=青/橙のアクセント、無所属=灰/錆色
- **装備の出所を反映する**: 蒼鉄製=鋼青マット仕上げ、雷禽製=角張った焦橙ライン、鴉羽改造=暗炭の継ぎ接ぎ
- **公式キャラは特別感を出す**: 照明をより劇的に、ポーズに自信を持たせる
- **無所属は「統一感のなさ」が正解**: 装備がバラバラで色が揃っていないのが自然
- **背景は暗く保つ**: 資格証の暗色UIに合成されるため、明るい背景は避ける
