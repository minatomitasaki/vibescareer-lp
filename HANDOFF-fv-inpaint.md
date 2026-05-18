# 引き継ぎ: fv-full.png 人物トンマナ統一作業

このドキュメントは別タブの Claude Code に作業を引き継ぐためのものです。
新しいタブでは、まずこのファイルを Read して状況を把握してから続行してください。

---

## ゴール

`public/images/fv-full.png` の **テキスト・バッジ配置は変えず、人物部分のトンマナを
`public/images/section3-full.png` の半写実 2D イラスト調に合わせる**。

## 結論: アプローチ B (短プロンプト + 参照画像 2 枚) で成功 ✅

紆余曲折を経て、**最終的にうまくいったのは下記の方法**です。

### 勝ちパターン

- エンドポイント: `POST https://api.openai.com/v1/images/edits`
- モデル: `gpt-image-2`
- `image[0]` = `section3-full.png` ← **スタイル参照を先頭に置く** のがミソ
- `image[1]` = `fv-full.backup.png` ← テキスト・構図の参照
- `mask` パラメータは **使わない**
- **プロンプトを 30 行程度まで絞り込む**

### なぜこれが効いたか (仮説)

- 元のプロンプトは 1000 行近くあり style 指示が散乱していた → モデルが style に振り切れず CGI 風に着地
- プロンプトを「image[0] の style を完全に踏襲、image[1] の text/composition を踏襲」だけに絞ったら、
  style transfer が一気に効いて section3 風の 2D vector + cel shading になった
- mask が無いので継ぎ目がなく、全体に一体感がある

### 試したけど採用しなかった方法

- **アプローチ A: マスク付きインペイント**
  - `scripts/make-mask.mjs` + `mask` パラメータでテキスト領域を保護
  - サブコピーがマスクに食い込んで欠落
  - マスク境界に継ぎ目が出る (人物の輪郭が切れる感じ)
  - スクリプトは残してあるが今回の本採用には使わない

## 現在のファイル状態

| ファイル | 内容 | 採否 |
|---|---|---|
| [public/images/fv-full.png](public/images/fv-full.png) | アプローチ A の結果 (人物は section3 風だがサブコピー欠落) | **不採用** |
| [public/images/fv-full-b-test.png](public/images/fv-full-b-test.png) | **アプローチ B の結果 ✅** これを本採用する | **採用** |
| [public/images/fv-full.backup.png](public/images/fv-full.backup.png) | 作業前のオリジナル (CGI 風人物・テキスト全部あり) | 比較用に保管 |
| [public/images/fv-full-mask.png](public/images/fv-full-mask.png) | アプローチ A 用マスク | 不要 (残してOK) |
| [public/images/fv-full-mask-preview.png](public/images/fv-full-mask-preview.png) | マスク可視化 | 不要 (残してOK) |

## ⏭️ 残タスク (新タブでやってほしいこと)

1. **`fv-full-b-test.png` → `fv-full.png` に置き換え (本採用)**
   ```powershell
   Copy-Item public\images\fv-full-b-test.png public\images\fv-full.png -Force
   ```

2. **マニフェストをアプローチ B 仕様に書き直す**

   現状の [scripts/image-manifest.mjs](scripts/image-manifest.mjs) の `fv-full.png` エントリは
   アプローチ A (clean canvas + mask) 用に書かれている。これをアプローチ B 仕様に戻す:

   - `references: ["section3-full.png", "fv-full.backup.png"]` ← 順序が重要
     (image[0] = style ref を先頭に)
   - `mask` フィールドは削除
   - プロンプトを [scripts/test-approach-b.mjs](scripts/test-approach-b.mjs) の `PROMPT` 定数の
     内容に差し替える (30行程度)
   - コメントも「アプローチ B: 短プロンプト style transfer」に書き直す

3. **`npm run gen:images -- --force fv-full.png` で再現できるか検証**
   マニフェスト経由でも同じ結果が出れば、`test-approach-b.mjs` は削除可能。

4. **(任意) 不要ファイルのクリーンアップ**
   下記は今回採用しなかった経路の副産物。残しても害はないが、整理するなら:
   - `scripts/make-mask.mjs` (アプローチ A 用、汎用ツールとして残す価値はある)
   - `scripts/make-clean-canvas.mjs` (もし存在すれば、アプローチ A 用)
   - `scripts/test-approach-b.mjs` (使い捨て、削除可)
   - `public/images/fv-full-mask.png`, `fv-full-mask-preview.png`, `fv-full-clean.png`

## 重要な前提・環境

- **OS**: Windows 11 / PowerShell
- **node.exe のフルパス**: `C:\Program Files\nodejs\node.exe`
  - `npm` は PATH に通っていないので、スクリプトを直接呼ぶ場合は node.exe をフルパスで指定
  - npm scripts (`npm run xxx`) が必要な場合もフルパスから `npm.cmd` を叩く: `& "C:\Program Files\nodejs\npm.cmd" run gen:images`
- **API キー**: [.env.local](.env.local) の `OPENAI_API_KEY` (sk-proj-...) — 設定済み
- **モデル**: `gpt-image-2` (ChatGPT Images 2.0 / 2026年4月リリース)
- **元画像寸法**: 1024 × 1536 (縦長 2:3、スマホ LP 想定)
- **生成画像の所要時間**: 1024×1536 high quality + 参照×2 で約 30〜60 秒・数十〜数百円

## ユーザーの方針

- すべて日本語で応答
- コード内コメントも日本語
- 「テキスト・レイアウトは1pxたりとも変えない」が大原則だったが、アプローチ B の結果を見て
  「文字精度・配置がほぼ同じなら OK」と確認済み
- Next.js 16 系 + Turbopack 利用 (今回の作業には無関係)

## アプローチ B の勝ちプロンプト (再掲)

完全形は [scripts/test-approach-b.mjs](scripts/test-approach-b.mjs) の `PROMPT` 定数参照。
要旨は以下:

```
You are given TWO images:
  image[0] = section3-full.png — STYLE TARGET. Replicate its 2D vector illustration style EXACTLY.
             NO 3D, NO CGI, NO photorealism, NO anime/manga.
  image[1] = fv-full.backup.png — COMPOSITION & TEXT TARGET. Reproduce its layout and Japanese text.

Produce a 1024×1536 vertical image with:
  - Composition & text of image[1]
  - Character rendering style of image[0]

Two characters:
  - LEFT: Japanese man with magnifying glass
  - RIGHT: Japanese woman walking up stairs
  - BOTH in image[0]'s 2D vector style.

All Japanese text rendered character-for-character (list each string).
STRICT: zero translation, zero paraphrasing.
STRICT: characters MUST match image[0]'s style.
```

## 動作確認済みの実行コマンド

ワンショットで再生成する場合:
```powershell
& "C:\Program Files\nodejs\node.exe" scripts\test-approach-b.mjs
```
→ `public/images/fv-full-b-test.png` に出力。

マニフェスト書き換え後に正規ルートで再生成する場合:
```powershell
& "C:\Program Files\nodejs\node.exe" scripts\generate-images.mjs --force fv-full.png
```
→ `public/images/fv-full.png` に直接出力。

## 参考: section3-full.png のスタイル特徴 (style target)

- 4 人の若手日本人ビジネスパーソン (女性 2・男性 2) が正面向きで横並び
- 線画はくっきり、肌は写実寄りのベージュ陰影付き
- スーツは紺・グレー・薄ベージュなど落ち着いた色味
- 半写実 2D イラスト (Japanese / Korean corporate LP イラストレーター調)
- 背景は薄ベージュ・無地
