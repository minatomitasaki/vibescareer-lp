# 引き継ぎ書: 画像生成タスク (別タブ用)

このドキュメントは、VibesCareer LP の **画像生成タスク** を別の Claude Code セッションで進める際の引き継ぎ用です。

---

## プロジェクト基本情報

- パス: `C:\Users\minato_mitasaki\Documents\claude-projects\vibescareer-lp`
- Git remote: `github.com/minatomitasaki/vibescareer-lp`
- 本番: `https://vibescareer-lp.vercel.app`
- 自動デプロイ: `main` に push → Vercel が自動ビルド (60〜90 秒)

---

## 画像生成の仕組み

### スクリプト構成

| ファイル | 役割 |
|---|---|
| `scripts/image-manifest.mjs` | 画像エントリのマニフェスト (`file` / `size` / `quality` / `prompt`) を export している |
| `scripts/generate-images.mjs` | OpenAI gpt-image-2 (ChatGPT Images 2.0) で生成し `public/images/` に保存 |
| `package.json` の `gen:images` | `node scripts/generate-images.mjs` を呼ぶエイリアス |

### API キー

`.env.local` に `OPENAI_API_KEY` が設定済み。スクリプト内で自前ローダーが `.env.local` を読み込む。

### 実行コマンド

未生成のみ (既存ファイルがあるものはスキップ):
```bash
npm --prefix "C:/Users/minato_mitasaki/Documents/claude-projects/vibescareer-lp" run gen:images
```

特定ファイルのみ:
```bash
npm --prefix "C:/Users/minato_mitasaki/Documents/claude-projects/vibescareer-lp" run gen:images -- foo.png bar.png
```

強制再生成 (既存ファイル上書き):
```bash
npm --prefix "C:/Users/minato_mitasaki/Documents/claude-projects/vibescareer-lp" run gen:images -- --force foo.png
```

### コスト目安

gpt-image-2 (quality: "high"):
- 1024x1024 (正方形): 約 $0.05 / 枚
- 1024x1536 (縦長): 約 $0.10 / 枚
- 1536x1024 (横長): 約 $0.10 / 枚

サポートサイズはこの 3 つのみ。

---

## gpt-image-2 の特性 (重要)

### 日本語・数字の文字精度

- 完璧ではない。「180」が「18O」、「電力会社」が「電力会礼」になる可能性あり
- プロンプトに **`CRITICAL TEXT ACCURACY: ... must be PERFECTLY accurate ...`** の指示を入れると改善する
- それでも 2〜3 割は崩れる。生成後に **必ず Read ツールで目視確認** する

### 失敗時の対処

1. **文字が崩れる** → 同じプロンプトで `--force` 再生成 (ランダム性で 2-3 回試すと当たることが多い)
2. **レイアウトが違う** → プロンプトに `LEFT BOX`, `RIGHT BOX`, `BOTTOM RIBBON` 等の構造指示を明示
3. **API レート制限 (429)** → 1〜2 分待って再実行

### プロンプトのベストプラクティス

- 構造を箇条書きで明示 (`LAYOUT (top section): ...` `- LEFT BOX (BEFORE): ...`)
- 含めたい文字列をプロンプト内で何度か繰り返す
- `STRICT:` セクションで「No watermark, no logo, no humans」のようにネガティブ指示を書く
- `CRITICAL TEXT ACCURACY:` で重要文字列を列挙する

---

## ImagePlaceholder の挙動

`src/components/ImagePlaceholder.tsx` の仕様:

- **開発時 (`NODE_ENV=development`)**: `public/images/` にファイルがなければプレースホルダー枠 (🖼️ アイコン + ラベル) を表示
- **本番時 (Vercel)**: 必ず `<Image>` タグを出力する。**画像が無いと 404 → broken image** になるので、本番デプロイ前に必ず画像を生成して `public/images/` にコミットする

---

## 既存の画像エントリ一覧 (`scripts/image-manifest.mjs`)

主要なグループ (詳細は manifest 末尾を見る):

- ヒーロー画像: `hero-businessman.png` 等
- 入口LP セクション 1-N の挿絵
- 結果LP セクション 1-17 の挿絵 (`result-hero-*.png`, `result-radar-bonus.png`, `result-concerns-faces.png`, `result-headache-three.png`, `result-service-hero.png`, `result-roadmap.png`, `result-last-message.png`)
- アドバイザー 4 名: `advisor-watanabe.png`, `advisor-matsushita.png`, `advisor-miura.png`, `advisor-furusawa.png` (1024x1024, フォトリアル portrait)
- 成功事例 4 名の写真: `success-case-1.png` 〜 `success-case-4.png` (1536x1024, フォトリアル editorial)
- 成功事例 4 件の年収インフォグラフィック: `success-case-1-salary.png` 〜 `success-case-4-salary.png` (1536x1024, flat infographic)

---

## 現在進行中のタスク

### 1. 成功事例の年収インフォグラフィック画像 (再生成中)

- バックグラウンドジョブ ID: `brhc793a0` で 4 枚を `--force` 再生成中
- 修正内容: 「¥」マークを廃止して「円」を使う + 金額をケースごとに変更
  - case1: 電力会社 420 → 広告代理店 600 (+180)
  - case2: 市役所公務員 380 → Webマーケター 480 (+100)
  - case3: 新聞記者 400 → セールスライター 470 (+70)
  - case4: 空港免税店 370 → 新規事業開発 450 (+80)
- 関連ファイル:
  - `src/data/landing.ts` の `SUCCESS_CASES` (データ更新済み)
  - `scripts/image-manifest.mjs` の末尾 4 件 (プロンプト更新済み)
- 完了したら確認後 commit → push

### 2. Slack 通知の本番動作確認 (保留)

Vercel デプロイ後、本番でフォーム → 予約 → Slack に通知が来るか E2E テスト。コード自体は実装済み。

---

## 完了済みの主要作業 (本セッション)

### Google Calendar 連携 (完了)

- `/api/calendar/slots` (空き時間取得) + `/api/calendar/book` (予約作成 + Meet URL 自動付与)
- 主催者: `minato_mitasaki@organic-gr.com` (三反﨑さんの Workspace アカウント)
- 必要スコープ: `calendar.events` + `calendar.readonly` (freebusy.query には readonly 必須)
- 関連: `src/lib/google-calendar.ts`, `src/lib/slot-generator.ts`, `src/components/SchedulePicker.tsx`

### Slack 通知 (完了)

- 予約完了時に Slack Incoming Webhook で通知
- `SLACK_WEBHOOK_URL` は Vercel 環境変数に登録済み
- 関連: `src/lib/slack-notify.ts`, `src/app/api/calendar/book/route.ts`

### GAS スプレッドシート連携 (完了)

- `stage` 列で「form_submitted (フォーム送信時)」と「booking_confirmed (予約成立時)」を識別
- 予約日時 (N/O 列) は GAS 側で `new Date(payload.bookingStartISO)` で Date オブジェクトに変換して保存
- シート URL: `https://docs.google.com/spreadsheets/d/1n0r6uED1J7PFeNhC5PQqqt5RWNEHBCHRuPIrhmLf9SQ/edit?gid=0#gid=0`

### 成功事例セクション (完了)

- カード構成: 写真 (16:10) → 名前/年齢オーバーレイ → タイトル → 金額インフォグラフィック画像 → 本文
- 金額部分は HTML/CSS から AI 生成画像 1 枚に置換 (上記タスク 1 で再生成中)

### アドバイザーカード (完了)

- 4 名 (山内除く)、AI 生成フォトリアル portrait
- ヘッダー帯はオレンジグラデ `linear-gradient(135deg, #ffd9b3 0%, #ff8533 55%, #ff6b00 100%)`
- キャッチコピーは Noto Serif JP weight 900

---

## 別タブで画像生成する際の手順

### 新規画像を作る場合

1. `scripts/image-manifest.mjs` の配列末尾 (`];` の直前) にエントリを追加:
   ```js
   {
     file: "new-image.png",
     size: "1024x1024",  // or "1024x1536" or "1536x1024"
     quality: "high",
     prompt: [
       "...",
     ].join("\n"),
   },
   ```
2. 生成:
   ```bash
   npm --prefix "C:/Users/minato_mitasaki/Documents/claude-projects/vibescareer-lp" run gen:images -- new-image.png
   ```
3. Read で目視確認 → 問題なければ git に commit & push

### 既存画像を再生成する場合

1. `image-manifest.mjs` の該当プロンプトを編集
2. `--force` で再生成:
   ```bash
   npm --prefix "..." run gen:images -- --force target.png
   ```

### 他のタブとの衝突回避

- **同じファイル名を別タブで同時に生成しない** (片方の出力が上書きされる)
- 別画像なら並列実行 OK
- 現在のタブで進行中: `success-case-1-salary.png`, `success-case-2-salary.png`, `success-case-3-salary.png`, `success-case-4-salary.png` (ジョブ `brhc793a0`)

---

## トラブルシューティング

### 画像生成が動かない

- `.env.local` に `OPENAI_API_KEY` があるか:
  ```bash
  grep -q "^OPENAI_API_KEY=" "C:/Users/minato_mitasaki/Documents/claude-projects/vibescareer-lp/.env.local" && echo "set" || echo "missing"
  ```
- スクリプト構文エラー: `node scripts/generate-images.mjs` を直接実行してエラー確認

### Vercel 本番で画像が壊れる

- 画像が `public/images/` にコミットされてるか確認
- `next.config.ts` の `images.localPatterns` に `?v=*` クエリ許可があるか

### 生成画像のキャッシュ

- 開発時は `ImagePlaceholder` が mtime をクエリに付与して自動キャッシュバスティング
- 本番では普通の Next.js Image 最適化、必要なら強制リロード
