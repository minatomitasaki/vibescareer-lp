---
name: gen-image
description: VibesCareer LP の画像 (public/images/*.png) を新規生成、または既存画像を再生成するときに使う。manifest 編集 → gpt-image-2 で生成 → 視覚チェック → コスト報告までを 1 ターンで処理。トリガ例「○○の画像作って」「このバナー再生成して」「離脱 POP の画像差し替え」「画像のサイズ変更したい」
---

# gen-image Skill

VibesCareer LP の AI 画像生成ワークフロー (gpt-image-2 経由)。AGENTS.md と IMAGE-PROMPT-GUIDE.md の規約を内包。

## 入力に応じた分岐

| ユーザー要求 | 動作 |
|---|---|
| 新規画像 (例: 「新しいバナー作って」) | manifest に新エントリ追加 → 生成 |
| 既存画像の再生成 (例: 「この画像のここだけ変えて」) | 該当 entry の prompt を最小限差分で修正 → `--force` で再生成 |
| サイズ変更 | manifest の `size` を更新 + `--force` 再生成 |

## ワークフロー

### Step 1: 要件確認 (不明点だけ)

最低限決まっていれば即着手。不明な時だけユーザーに 1-2 個質問:
- ファイル名 (推測できれば既存スタイルに揃える、例: `result-xxx-bonus.png`, `exit-popup-x.png`)
- 用途 (どの section / モーダルで使う?)
- サイズ (1024x1024 / 1024x1536 / 1536x1024 のいずれか — gpt-image-2 のサポート 3 種のみ)
- VibesRadar ロゴ焼き込みの有無 (= references に `vibes-radar-logo.png` を入れるか)

「お任せ」と言われたら推奨案を提示してから進める。

### Step 2: manifest 編集

`scripts/image-manifest.mjs` の IMAGES 配列に新エントリを追加 (または既存 entry を Edit):

```js
{
  file: "<filename>.png",
  size: "1024x1024" | "1024x1536" | "1536x1024",
  quality: "high",
  references: ["vibes-radar-logo.png"], // 必要時のみ
  prompt: somePromptBuilder(), // or 直接 [...].join("\n")
},
```

### Step 3: プロンプトのスタイル規約 (必ず守る)

- **カラー**: warm orange (`#FF6B00` / `#FF8533`)、cream `#FFFAF2` / mint `#ECFDF3` / peach `#FFF7ED`
- **NG カラー**: 青 / 緑 / シアン / 紫を装飾色として使わない (warm tone で統一)
  - 例外: VibesRadar 関連バナーの mint green リボン (`#22C55E`) と、悩み訴求の light blue 涙だけ OK
- **タイポ**: Noto Sans JP / Hiragino スタイル、editorial premium feel、ベタな web ad 風を避ける
- **下部空白**: CTA ボタンを画像上に重ねる用途なら下部 ~140px を「pure empty space」と明示。HTML を真下に通常配置するなら不要
- **VibesRadar ロゴ**: `references: ["vibes-radar-logo.png"]` を指定し、prompt 内で「pixel-faithful reproduction of image[0]」と強く指示
- **日本語**: 「character-for-character correct」を明示、漢字・カタカナの誤字を避ける
- **既存スタイルのコピー**: 似た用途の画像があれば `radarBonusPrompt()` / `meetingBonusPrompt()` / `exitPopupPromptA()` 等の既存関数を参考にする

### Step 4: 生成実行

```powershell
npm --prefix "C:/Users/minato_mitasaki/Documents/claude-projects/vibescareer-lp" run gen:images -- <filename>.png
```

複数枚同時生成: `-- a.png b.png c.png`
強制再生成 (既存ファイルを上書き): 末尾に `--force`

1 枚あたり 30-60 秒。複数枚は順次。

### Step 5: 視覚チェック (必須)

生成後、必ず `Read` で画像を視覚的に確認する。チェック項目:

- **日本語の文字崩れ** (テキストが化けてないか、誤字・脱字、漢字の正しさ)
- **指の本数** (人物が映る場合は 5 本ちゃんと描けてるか)
- **構図・配置** (要素が画面外に切れていないか)
- **VibesRadar ロゴの再現** (字形・色・順序 V-i-b-e-s-R-a-d-a-r が正しいか)
- **下部空白** (CTA オーバーラップ前提なら確保されているか)
- **NG カラーの混入** (青系装飾が入ってないか)

問題があれば原因をプロンプトに反映して `--force` 再生成。同じ問題が 2-3 回続くなら、ユーザーに別アプローチ (CSS クロップ、HTML 分離など) を提案。

### Step 6: コスト報告 + 次のアクション

- gpt-image-2 high quality の概算コスト:
  - 1024x1024: ~$0.1-0.2
  - 1024x1536 / 1536x1024: ~$0.15-0.3
- 「成功 N / 失敗 M、概算コスト $X」を 1 行で報告
- OK ならコミット候補として add 推奨 (ship Skill に渡す流れ)

## 注意

- 画像の構図変更で AI が指示を守りきれない (例: 下部空白がいくら指示しても狭くなる) 場合は、画像再生成を繰り返さず、CSS でクロップ or HTML 分離など別アプローチを早めに提案する
- VibesRadar ロゴは独自に描くと壊れる。必ず `references` で公式ロゴを参照させる
- アドバイザー実写は本人写真を使う運用。AI 生成版は `*-old.png` でバックアップしてから上書きする (AGENTS.md 参照)
