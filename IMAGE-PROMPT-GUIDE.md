# 画像生成プロンプト設計ガイド

VibesCareer LP の制作で使った OpenAI gpt-image-2 (ChatGPT Images 2.0) 向けのプロンプト設計手法をまとめたものです。
他プロジェクトでも応用できる「再現可能なルール」として整理しています。

---

## 前提知識: gpt-image-2 の仕様

| 項目 | 値 |
|---|---|
| API endpoint (新規生成) | `https://api.openai.com/v1/images/generations` |
| API endpoint (編集 / スタイル参照) | `https://api.openai.com/v1/images/edits` |
| サポートサイズ | `1024x1024` / `1024x1536` / `1536x1024` の 3 つのみ |
| quality | `low` / `medium` / `high` の 3 段階。LP 用は基本 `high` |
| コスト目安 | 1 枚 $0.05〜$0.20 (size × quality 次第) |

**苦手なこと**
- 日本語と数字の正確な描画 (失敗率 2〜3 割)
- 多すぎる文字を 1 枚に並べる
- 手の指の本数 (5 本以上 / 4 本以下になりがち)

**得意なこと**
- 環境ポートレート (人物 + 背景の空気感)
- 雑誌風のレタッチ仕上げ
- グラデーション / シャドウ / 光沢のあるグラフィック

---

## プロンプトの 7 パート構成 (テンプレート)

すべてのプロンプトを以下の順序で書きます。**順序を変えると AI の解釈精度が落ちる** ので守る。

```
1. 冒頭スタイル宣言        ← 何の画像か。雑誌名やジャンルで縛る
2. 被写体の詳細           ← 国籍 / 年齢 / 髪 / 服装 / 表情
3. シーン・背景           ← 場所 / 小物 / テクスチャ
4. 照明・カメラ           ← 光の方向 / 色温度 / レンズ / 被写界深度
5. 構図                  ← 被写体の配置 / フレーミング
6. カラーパレット         ← ブランドカラーとの統一指示
7. STRICT (除外指定)      ← 含めたくないものを明示

(+8. CRITICAL TEXT ACCURACY ← 文字を含む画像のみ)
```

---

## ジャンル別テンプレート

### A. 人物写真 (環境ポートレート)

業務シーンの人物撮影風。Wired Japan / Forbes Japan の特集写真ノリで指示する。

```
PHOTOREALISTIC editorial-style professional photograph, horizontal 1536x1024.
Magazine-quality, like a Wired Japan / Forbes Japan editorial portrait of a young professional.

Subject: A Japanese [man/woman] in [his/her] [late 20s] ([28] years old),
a [創業者 / マーケター / プランナー 等] working at a [業種] company in Tokyo.
- [髪型], [服装の具体的記述]. [表情の方向性] expression with a soft natural smile.
- He/She is naturally engaged in his/her work — [具体的なアクション 1], OR [アクション 2],
  OR turning slightly toward the camera with a confident smile.

Setting: a modern [業種] office — [部屋の特徴], [小物リスト], [壁面の様子].

Lighting: warm natural daylight from a large window, soft directional shadows,
healthy realistic skin tones, very slight film-like grain.

Camera/lens: 35mm or 50mm prime lens, shallow depth of field,
sharp focus on the face, gentle bokeh on the background.

Composition: subject occupies the LEFT 2/3 of the frame, environmental portrait.

Color palette: warm cream / beige / soft orange accents in the background,
tying into the brand's warm orange tone.

STRICT: NOT illustration, NOT 3D render, NOT anime, NOT cartoon, NOT painting.
ONE Japanese [man/woman] only, no other visible people.
Natural realistic human anatomy: correct number of fingers, realistic eyes.
No text, no watermark, no logo, no UI overlay.
```

### B. コーポレートヘッドショット (円形クロップ前提)

```
PHOTOREALISTIC professional corporate headshot portrait, square 1024x1024.

Subject: A Japanese [man/woman] in [his/her] [mid-30s], the [役職] of a [業種] company.
- [髪 / 顔の特徴], [服装]. [表情] with a soft closed-mouth smile.
- Head-and-shoulders framing, perfectly centered for circular cropping.
- Eyes looking directly at the camera, warm and approachable.

Lighting: soft studio key light from front-left, gentle fill,
very slight rim light. Skin tones natural and healthy.

Background: soft out-of-focus neutral cream / light beige tone (#FFF6EC range)
with a very subtle warm-orange halo, like a high-end LinkedIn profile photo.

Camera/lens: 85mm portrait lens, shallow depth of field, sharp focus on the eyes.

STRICT: No text, no watermark, no logo, no graphic elements.
ONE person only. Clean professional photograph, NOT illustration, NOT anime.
```

### C. フラットインフォグラフィック (テキスト入り)

BEFORE/AFTER、ステップ図、リボンバッジ等。

```
Modern flat-design infographic, horizontal 1536x1024,
for a Japanese [サービス] landing page.
Theme: [テーマを 1 行で]

LAYOUT (top section): [上部の構造を箇条書き]
- LEFT BOX: [背景色 / 形 / 中身 を具体的に]
- CENTER: [中央の要素]
- RIGHT BOX: [背景色 / 形 / 中身]

LAYOUT (bottom section): [下部の構造]

Background: [色] (#XXXXXX) with [装飾要素].

Style: clean modern Japanese commercial infographic, sharp typography,
vibrant orange (#ff6b00) accents.

CRITICAL TEXT ACCURACY: All Japanese characters must be PERFECTLY accurate,
no misspellings — '電力会社', '広告代理店', '年収', '万円', 'BEFORE', 'AFTER'.
Numbers: 420, 600, 180 must be exact.

STRICT: No watermark, no logo, no humans, no photo elements. Pure flat infographic.
```

---

## 文字精度を上げる 5 つのテクニック

gpt-image-2 で日本語や数字を入れたいときの工夫。

### 1. 同じ文字列を 3 回以上繰り返す
LAYOUT セクション内、CRITICAL TEXT ACCURACY セクション、STRICT セクションでそれぞれ言及する。
AI は「繰り返し出てくる単語」を重要だと認識する。

### 2. CRITICAL TEXT ACCURACY 専用セクションを設ける
```
CRITICAL TEXT ACCURACY: All Japanese characters must be PERFECTLY accurate,
no misspellings, no garbled kanji — '電力会社', '広告代理店', '年収'.
Numbers 420, 600, 180 must be exact.
```

### 3. ネガティブ指示でゴミ文字を防ぐ
```
The yen mark '¥' MUST NOT appear anywhere — use '万円' instead.
No random English text, no decorative dummy text.
```

### 4. 1 ブロックあたり 30 文字以内に抑える
それ以上長いと中央で文字が崩れがち。長文は短文に分割するか、画像化を諦めて HTML/CSS で重ねる。

### 5. 失敗したら同じプロンプトで `--force` 再生成
AI のランダム性で、2〜3 回試すと当たる。プロンプトを大幅に変えるより、同じプロンプトで複数回試す方が効率的。

---

## アンチパターン (やりがちなミス)

| ❌ NG | ✅ OK |
|---|---|
| `"good quality"`, `"beautiful"` (抽象的) | `"sharp focus on the eyes, healthy skin tones, slight film-like grain"` (具体的) |
| `"photorealistic AND vintage illustration"` (矛盾) | どちらか 1 つに絞る |
| 3 つ以上の場所を 1 文に詰める | 1 文に 1 つの場所 |
| ロゴ・透かしを書かないと **勝手に入る** | `"STRICT: No watermark, no logo"` を必ず書く |
| AI に「文字を入れない」と言わない | `"No text, no caption, no UI overlay"` を必ず書く |

---

## 運用 Tips

### バッチ生成
複数枚を 1 マニフェストにまとめて、1 コマンドで生成すると効率的。

```js
// scripts/image-manifest.mjs (抜粋)
export const IMAGES = [
  { file: "advisor-watanabe.png", size: "1024x1024", quality: "high", prompt: "..." },
  { file: "advisor-miura.png",    size: "1024x1024", quality: "high", prompt: "..." },
  // ...
];
```

```bash
# 未生成のみ
npm run gen:images

# 特定ファイルだけ
npm run gen:images -- foo.png bar.png

# 強制再生成 (既存上書き)
npm run gen:images -- --force foo.png
```

### 生成後の確認
必ず Read tool / エクスプローラーで開いて目視確認:
- 日本語の文字化け
- 人物の指の本数 (要 5 本)
- 構図のズレ (被写体が中央に寄りすぎ 等)
- ロゴ / 透かしの混入

ダメなら `--force` で再生成 (2〜3 回試すと当たることが多い)。

### Vercel デプロイとの相性
本番環境では `public/images/` の画像を直接配信。`<Image>` タグでファイル不在だと 404 になるので、**コミット前に必ず画像生成 → public/images/ に配置 → コミット & push** の順を守る。

---

## 実例 (本プロジェクトから)

### 例 1: 男性プランナーの環境ポートレート

```
PHOTOREALISTIC editorial-style professional photograph, horizontal 1536x1024.
Magazine-quality, like a Vogue Business / Wired Japan / Forbes Japan editorial portrait of a young professional.

Subject: A Japanese man in his late 20s (28 years old),
a creative planner working at a modern Tokyo advertising agency.
- Neat short black hair, clean shave, modern smart-casual style:
  navy slim-fit blazer over a crisp white t-shirt.
- He is naturally engaged in his work — reviewing campaign storyboards
  or paper sketches on his desk, OR turning toward the camera with a
  confident soft smile.

Setting: a modern Tokyo advertising agency office — open-plan creative
space with whitewashed walls, large windows pouring in natural light,
design boards / mood boards / colorful Post-its on a wall in the background,
modern wooden desks with a MacBook, a few green plants.

Lighting: warm natural daylight from a large window, soft directional
shadows, healthy realistic skin tones, very slight film-like grain.

Camera/lens: 35mm or 50mm prime lens, shallow depth of field,
sharp focus on his face.

Composition: subject occupies the LEFT 2/3 of the frame, environmental portrait.

Color palette: warm cream / beige / soft orange accents in the office
background.

STRICT: NOT illustration, NOT 3D render, NOT anime, NOT cartoon, NOT painting.
ONE Japanese man only, no other visible people in frame.
Natural realistic human anatomy: correct number of fingers, realistic eyes.
No text, no watermark, no logo, no UI overlay.
```

### 例 2: BEFORE / AFTER 年収インフォグラフィック

```
Modern flat-design infographic, horizontal 1536x1024,
for a Japanese career-change service landing page.
Theme: dramatic BEFORE→AFTER salary improvement.

LAYOUT (top section): Two rounded rectangle boxes side by side with
a bold orange arrow between them.
- LEFT BOX (BEFORE): muted grey background (#ECEFF1), rounded.
  Contains 3 lines stacked: 'BEFORE' (small caps), '電力会社' (medium),
  '年収 420万円' (large bold).
- CENTER: large vibrant orange right-pointing arrow (▶) with soft glow.
- RIGHT BOX (AFTER): vibrant orange gradient (#ff8533 → #ff6b00),
  slightly larger than BEFORE, with drop shadow. WHITE text stacked:
  'AFTER', '広告代理店', '年収 600万円'.

LAYOUT (bottom section): Wide ribbon-style banner spanning the width,
orange gradient (#ff8533 → #ff6b00), glossy 3D effect, drop shadow.
WHITE bold text: '年収 +180万円 UP ↗' with upward arrow at end.

Background: warm cream (#FFFAF5) with very faint upward trending line
chart graphic in pale orange.

CRITICAL TEXT ACCURACY: Japanese characters must be PERFECTLY accurate —
'電力会社', '広告代理店', '年収', '万円', 'UP', 'BEFORE', 'AFTER'.
Numbers 420, 600, 180 must be exact. The yen mark '¥' MUST NOT appear
anywhere — use '万円' as the currency unit instead.

STRICT: No watermark, no logo, no humans, no photo elements,
NO '¥' symbol anywhere. Pure flat infographic design.
```

---

## まとめ

| ポイント | キー |
|---|---|
| 構造 | 7 パートを順序通り |
| ジャンル | 冒頭スタイル宣言で AI に何を作るか伝える |
| 文字 | 繰り返し + CRITICAL TEXT ACCURACY + ネガティブ指示 |
| 仕上げ | STRICT で除外を明示 |
| 失敗対応 | プロンプトを変えず `--force` で再試行 |
| 確認 | 目視必須 (指 / 顔 / 文字 / ロゴ混入) |

このガイドはあくまで **gpt-image-2 で「LP に使える」品質の画像を量産する** ための実用的なテクニックです。Midjourney / Imagen / Stable Diffusion 等の他モデルではプロンプト構造が異なるので、別途調整が必要です。
