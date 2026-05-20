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

## 応用テクニック

### 1. LP 全体でトンマナを揃える方法

別のセクションで別の人物・別のシーンを生成しても **「同じサイトの中の写真」と感じさせる** ための手法。

**核となる発想**: プロンプトに「**共有テンプレ句**」を仕込んで、それを全画像で使い回す。被写体が変わっても、形容句が同じなら世界観が揃う。

#### 共有テンプレ句 (これらを全画像のプロンプトに必ず入れる)

| カテゴリー | 共有文 |
|---|---|
| 品質基準 | `Magazine-quality, like Wired Japan / Forbes Japan editorial portrait` |
| 光 | `warm natural daylight from a large window, soft directional shadows` |
| 質感 | `healthy realistic skin tones, very slight film-like grain` |
| カメラ | `35mm or 50mm prime lens, shallow depth of field, sharp focus on the face` |
| カラーパレット | `warm cream / beige / soft orange accents in the background, tying into the brand's warm orange tone` |
| ブランド色 | `#ff6b00` を明示 (RGB 値を直接書く方が AI に伝わりやすい) |
| 除外 | `NOT illustration, NOT 3D render, NOT anime, NOT cartoon` |

#### 男性・女性で「変える部分 / 変えない部分」を分ける

被写体が変わるたびに、変えるパラメーターを 4 つに絞ると、世界観が崩れない:

| 変える | 例 (男性) | 例 (女性) |
|---|---|---|
| 髪型 | `neat short black hair` | `shoulder-length dark brown hair with a soft natural wave` |
| 服装の系統 | `navy slim-fit blazer over a crisp white t-shirt` | `soft cream knit sweater under a tailored navy blazer` |
| 表情の方向性 | `confident, energetic with a slight gentle smile` | `warm, friendly with a clear natural open smile` |
| アクション | `reviewing campaign storyboards` | `typing on her laptop` |

**変えないもの**: 光・カメラ・構図・カラーパレット・STRICT 内容。これらを変えるとトンマナが破綻する。

#### 入口 LP (Top) と結果 LP (Result) の繋ぎ

入口 LP のヒーロー画像と、結果 LP の人物写真で同じ世界観にするコツ:

- **両方に共通のカラーパレット句** を入れる: `warm cream / beige / soft orange tones`
- **両方に共通のテイスト宣言** を入れる: `Magazine-quality editorial`
- **背景のシーン要素を統一**: モダンな木製デスク / 自然光 / 観葉植物
- **構図 (subject occupies the LEFT/RIGHT 2/3 of the frame) も統一**

これだけで、別の被写体・別の職種でも「同じサイトの写真」として感じられる。

#### 失敗パターン (やりがち)

- 個別のプロンプトでカラーパレット句を**外す** → その 1 枚だけ世界観がズレる
- 男性は `professional headshot`、女性は `lifestyle photo` のように **冒頭スタイル宣言を変える** → 質感が違ってくる
- 各セクションごとに違うレンズ感を指定 → 一貫性が崩れる

---

### 2. 「素材だけ修正、テキストは維持」する技術 — Inpainting / Masked Editing

> **キー技術**: OpenAI Image API の **`/v1/images/edits`** エンドポイント + **マスク画像** による部分編集 (Inpainting と呼ばれる)。

#### 仕組み

1. 元画像と同じサイズの **マスク PNG** を用意
   - **透明 (alpha=0)** の領域 → AI が再生成する
   - **不透明 (alpha=255)** の領域 → そのまま維持
2. `images/edits` API に **元画像 + マスク + 新プロンプト** を送る
3. AI は透明部分だけを描き直し、不透明部分 (例: テキスト) はそのまま保持

#### ChatGPT UI でやる場合 (簡単)

ChatGPT (Plus) で生成した画像に対して:
1. 生成済み画像をクリックして編集モードに入る
2. 「ここだけ変えて」「○○の部分だけ別のものに」と指示
3. UI が自動的にマスク領域を判定して再生成

これは内部的に edits API + マスクを使っている。テキストはそのまま残るように AI が周辺の文脈から判断してくれる。

#### API でやる場合 (制御可能)

```bash
curl https://api.openai.com/v1/images/edits \
  -F model="gpt-image-2" \
  -F image="@original.png" \
  -F mask="@mask.png" \
  -F prompt="新しい素材の指示 (テキストには触れない)"
```

マスク PNG の作り方:
- **Photoshop / Figma**: 元画像と同じサイズで新規レイヤー、編集したい領域を消しゴム (透明化) → PNG 書き出し
- **Pillow (Python)**: 元画像と同じサイズの透明 PNG を作って、テキスト領域だけ不透明で塗る
- **CLI**: ImageMagick で透明レイヤーを作って合成

#### 実用上のコツ

- **マスクの境界をフェザー (ぼかし) する** → 編集領域と保持領域の境目が自然に馴染む
- **テキスト周辺は「不透明」で広めに保持** → 文字の輪郭がブレない
- **素材のサイズ感は変えない** → 元の構図を保つために、プロンプトで「same composition」を指示

#### 別のアプローチ: 最初から分ける

実は、**Inpainting に頼らず「素材」と「テキスト」を別の画像にして、HTML/CSS で重ねる** ほうが運用が楽な場面が多い:

- 素材画像 (テキストなし、AI 生成)
- テキストレイヤー (HTML/CSS で position: absolute で重ねる)

これなら **テキストの修正が一瞬** (HTML 編集だけ)、再生成不要。

VibesCareer の運用では、可能な限りこのアプローチを優先しています (BEFORE/AFTER インフォグラフィックは画像に焼き込んだが、フォーム見出しなどは HTML で別レイヤー化)。

---

### 3. 参考画像 / 競合スクショを渡すことは精度向上に効くか?

> **結論**: 効きます。ただし「インスピレーション」として使い、**そのままのコピーは避ける**。

#### 効果が高い使い方

| 用途 | プロンプト例 | 渡す画像 |
|---|---|---|
| トンマナ参照 | "Match the warm color tone and editorial feel of the reference" | 参考写真 1 枚 |
| 構図参照 | "Use the same compositional layout as the reference (subject left, blurred background right)" | 構図見本 |
| スタイル参照 | "Match the photorealism level shown in the reference" | クオリティ見本 |

#### 技術的に渡す方法

- **ChatGPT UI**: 画像をドラッグアンドドロップ + テキスト指示
- **API**: `/v1/images/edits` の入力画像として渡す、または `references` 系のパラメーターを使う (モデルやエンドポイントで仕様が異なるので最新ドキュメントで確認)

#### 効きにくいケース・避けるべきケース

- **競合サイトを丸ごとコピーしようとする**: 著作権侵害のリスク。AI も拒否することがある
- **解像度が低すぎる参考画像**: 細部が伝わらず、AI が逆に混乱する → 1024px 以上推奨
- **複数枚の参考画像で違うトンマナを渡す**: AI がブレる → 1〜2 枚に絞る

#### ベストプラクティス

1. 参考画像は「**この雰囲気・トンマナ・構図感**」を伝えるためのもの
2. 具体的な要素 (色 / 構図 / ライティング / カメラ感) は**プロンプトで言語化**しておく
3. 参考画像 + プロンプトの**両方**を渡すと、AI の解釈が安定する
4. 競合の素材を「ベースに変形して使う」のは著作権上 NG。あくまで「インスピレーションを得る」目的に絞る

VibesCareer 制作でも、参考 LP のスクショは「**こういう構造で作りたい**」という設計意図を伝えるのには使いましたが、生成 AI に直接渡すよりも、構造的特徴を抽出して**自分のプロンプトに言語化**して投げる方が、ブランド適合性が高い結果になりました。

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
| トンマナ統一 | 共有テンプレ句を全プロンプトで使い回す |
| 部分修正 | Inpainting (マスク付き edits API) or 最初から HTML/CSS で別レイヤー化 |
| 参考画像 | インスピレーション用途で使うのは有効、丸コピーは避ける |

このガイドはあくまで **gpt-image-2 で「LP に使える」品質の画像を量産する** ための実用的なテクニックです。Midjourney / Imagen / Stable Diffusion 等の他モデルではプロンプト構造が異なるので、別途調整が必要です。
