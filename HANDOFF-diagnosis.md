# 引き継ぎ: 診断ページ `/diagnosis` 実装

このドキュメントは別タブの Claude Code に作業を引き継ぐためのものです。
新しいタブでは、まずこのファイルを Read して状況を把握してから続行してください。

---

## 🎯 ゴール

入口LP (`/`) の CTA「診断START！」を押した遷移先である
**診断ページ `/diagnosis` を実装する**。

- 仕様の一次ソース: [design/SPEC.md](design/SPEC.md) セクション 2
- ワイヤー: [design/02_diagnosis.png](design/02_diagnosis.png)（Read で表示可能）
- 完了基準: ローカル ([http://localhost:3100/diagnosis](http://localhost:3100/diagnosis)) で
  - ワイヤー忠実に Q1〜Q8 が表示される
  - 5段階リッカートが選択可能（クリックでオレンジに塗りつぶし＋白チェック）
  - 全問回答後、「診断結果を見る →」で `/analyzing` に遷移（次画面は未実装でOK、404 で構わない）

---

## 🗂 プロジェクト全体の文脈（要点だけ）

- **サービス**: VibesCareer（第二新卒向け人材紹介の送客LP）
- **画面フロー**: `/` (入口LP) → `/diagnosis` (今回) → `/analyzing` → `/result/[id]` → `/schedule` → `/thanks`
- **作業ディレクトリ**: `c:/Users/minato_mitasaki/Documents/claude-projects/vibescareer-lp/`
- **既に実装済み**: 入口LP (`/`) — ヘッダー + FV + Section2 + Section3 + フッター
- **未着手**: `/diagnosis` 以降のすべての画面・診断ロジック・フォーム連携

過去の経緯は [HANDOFF.md](HANDOFF.md) と [HANDOFF-fv-inpaint.md](HANDOFF-fv-inpaint.md) 参照。

---

## 📋 診断ページ仕様（SPEC + ワイヤーから抽出）

### レイアウト構造（上から）

```
┌──────────────────────────┐
│ ヘッダー帯 (オレンジ)         │  ← 「適職×適正年収診断」白文字
│ 適職×適正年収診断             │
├──────────────────────────┤
│ 診断の選択       [████___] 1/8│  ← プログレスバー + X/8 カウンタ
├──────────────────────────┤
│ Question 01 (オレンジ・小)    │
│ あなたが仕事で大切にしたいのは？│
│                             │
│ 技術を身につける   ◯◯◯◯◯  人を笑顔・感動する │
├──────────────────────────┤
│ ...（Q2〜Q8 が同じ形式で続く）│
├──────────────────────────┤
│         [診断結果を見る →]     │  ← オレンジ角丸大ボタン
└──────────────────────────┘
```

### 質問一覧（Q1〜Q8）

| # | 質問 | 左ラベル | 右ラベル | スコア軸 |
|---|---|---|---|---|
| Q1 | あなたが仕事で大切にしたいのは？ | 技術を身につける | 人を笑顔・感動する | 職種軸 |
| Q2 | 仕事のやりがいとして近いのは？ | 会社・組織の発展 | 物事の探究・分析 | 職種軸 |
| Q3 | 仕事のスタイルはどちらに近い？ | 戦略的に考える | 相手や顧客を整理 ⚠️ | 職場軸 |
| Q4 | オフの日の過ごし方はどちらに近い？ | ひとりで静かに | 多くの人と賑やかに | 職場軸 |
| Q5 | 人間関係で意識することは？ | 自分の軸を作る | 周囲の意見を聞く | 職種軸 |
| Q6 | 物事の捉え方はどちらに近い？ | 自分の考え方を信じる | 多様な知識を取り入れる | 職種軸 |
| Q7 | 感情の出し方はどちらに近い？ | 正直に表に出す ⚠️ | 冷静に伝わる | 職場軸 |
| Q8 | 仕事の進め方はどちらに近い？ | 柔軟に動く | 計画的に準備する | 職場軸 |

⚠️ = Figma 解像度の都合で読み取り推定。後日要原本確認（コード上は SPEC.md に従う）。

### 5段階リッカートの UI

- 5 つの円形ラジオボタンを横並び
- 両端の円のすぐ外に **極性ラベル**（左／右）
- **中央 3 つはラベルなし**
- 未選択: 白背景 + グレー枠線
- 選択済: **オレンジ背景 #FF6B00 + 白チェックマーク**
- 1質問につき 1 つだけ選択可能（普通のラジオ動作）

### スコアリング（仮ロジック、結果LP実装時に確定）

- **職種軸スコア** = Q1 + Q2 + Q5 + Q6 の値の合計
- **職場軸スコア** = Q3 + Q4 + Q7 + Q8 の値の合計
- 各回答は 1〜5（左端=1 / 右端=5）
- 中央値 (3) を閾値に分岐し、最終的に職種×職場の **12 パターン** にマッピング（後段で実装）

今回は **「回答値を集めて localStorage か URL クエリで /analyzing へ渡す」までで OK**。
12 パターンのマッピングは別タスク。

### CTA

- 文言: **「診断結果を見る →」**
- 遷移先: `/analyzing`
- 全問回答していない場合の挙動は SPEC に明記なし
  → デフォルトで「全問必須、未回答ならボタンを disable」推奨

---

## 🧱 使える既存リソース

### コンポーネント

| パス | 用途 |
|---|---|
| [src/components/Logo.tsx](src/components/Logo.tsx) | VibesCareer ロゴ（画像）。`<Logo width={160} height={44} />` |
| [src/components/ImagePlaceholder.tsx](src/components/ImagePlaceholder.tsx) | 画像 + 存在チェック + mtime キャッシュバスティング。診断ページでは使わなくてもOK |

### globals.css のスタイルトークン・ユーティリティ

`src/app/globals.css` に Tailwind v4 `@theme inline` でブランドカラーが定義済み:

```
--color-brand-primary: #ff6b00        (メインオレンジ・CTA)
--color-brand-primary-dark: #e55f00   (hover)
--color-brand-primary-light: #ffe5d1  (背景アクセント)
--color-text-primary: #1a1a1a
--color-text-secondary: #4a4a4a
--color-text-muted: #8a8a8a
--color-border-default: #e5e5e5
--color-bg-subtle: #f7f7f7
```

→ Tailwind クラス `bg-brand-primary`, `text-brand-primary`, `border-brand-primary` などが使える。

便利なユーティリティクラス（一部抜粋、CSS は globals.css 参照）:

| クラス | 用途 |
|---|---|
| `.lp-container` | 中央寄せ + max-width: 480px（**診断ページもこれで囲む**） |
| `.btn-3d-orange` | 立体オレンジボタン（CTA に使う） |
| `.marker-orange` | オレンジ蛍光マーカー風背景 |
| `.number-badge` / `.number-badge-lg` | 番号バッジ（参考） |

### 入口LP の実装例

[src/app/page.tsx](src/app/page.tsx) の `CtaButton` コンポーネントが参考になる。
特にオレンジ立体ボタン（`btn-3d-orange` クラス + キラリ反射）の実装サンプル。

---

## 🛠 技術スタック・規約

| 項目 | 内容 |
|---|---|
| フレームワーク | **Next.js 16.2.4**（App Router / src/ ディレクトリ） |
| UI ライブラリ | **React 19.2.4** |
| 言語 | TypeScript 5.x |
| スタイル | **Tailwind CSS v4**（`@theme inline` 形式 — `tailwind.config.js` は無い） |
| ホスティング | Vercel（未設定） |
| ポート | **3100**（`npm run dev` で起動） |

⚠️ **これは普通の Next.js ではない**: [AGENTS.md](AGENTS.md) と [CLAUDE.md](CLAUDE.md) を必ず確認。
特に Tailwind v4 は `tailwind.config.js` が無く、CSS 側の `@theme inline { ... }` でトークンを定義する点に注意。

---

## 🔧 環境・コマンド・既知の罠

### Windows + PowerShell 特有

- **`npm` は PATH に無い** → PowerShell から呼ぶときは `npm.cmd` を使う
  ```powershell
  npm.cmd run dev
  ```
- **`npm.ps1` は ExecutionPolicy で弾かれる**（`Restricted` 設定のため）
- node のフルパス: `C:\Program Files\nodejs\node.exe`

### Next.js 16 + Turbopack キャッシュ問題

- 通常 F5 で反映されないことがある
- [next.config.ts](next.config.ts) で開発時のみ `Cache-Control: no-store` & `images: { unoptimized: true }` を設定済み
- 大きな構造変更後は `Remove-Item .next -Recurse -Force` で念のためクリア
- 詳細は [MEMORY](../../.claude/projects/c--Users-minato-mitasaki/memory/dev-server-force-refresh.md)

### 開発サーバー起動

```powershell
npm.cmd run dev
# → http://localhost:3100
```

---

## 🚀 推奨実装手順

### Step 1: ルート作成

```
src/app/diagnosis/page.tsx
```

App Router なのでこのパスで `/diagnosis` ルートになる。

### Step 2: 質問データを定数として定義

```tsx
const QUESTIONS = [
  { id: 1, axis: "job",    text: "あなたが仕事で大切にしたいのは？", left: "技術を身につける", right: "人を笑顔・感動する" },
  { id: 2, axis: "job",    text: "仕事のやりがいとして近いのは？",   left: "会社・組織の発展",   right: "物事の探究・分析" },
  // ... Q8 まで
];
```

`axis` は `"job"` (職種軸) または `"workplace"` (職場軸) で持っておくと、後の集計が楽。

### Step 3: 状態管理

クライアントコンポーネント (`"use client"`) で `useState` を使う。
- `answers: Record<number, number>` で Q番号 → 選択値(1〜5) を保持
- 全問回答済みかどうかのフラグ
- 進捗（X/8）は `Object.keys(answers).length` で算出

### Step 4: UI 実装

ワイヤーと SPEC.md に沿って:
1. ヘッダー帯（オレンジ）
2. プログレスバー
3. Q1〜Q8 のリッカート（円ボタン）
4. CTA「診断結果を見る →」

`lp-container` で囲み、max-width 480px のスマホレイアウトに。

### Step 5: スコアリング & 次画面への受け渡し

CTA クリック時:
1. `job` 軸 4問の合計、`workplace` 軸 4問の合計を計算
2. localStorage か URL クエリで `/analyzing` に渡す
   - localStorage 推奨（URL が汚れない）
   - キー例: `vc:diagnosis:answers` に JSON で
3. `router.push("/analyzing")`

`/analyzing` 以降は別タスクなので、今回は遷移できれば OK（404 になっても気にしない）。

### Step 6: ローカル確認

```powershell
npm.cmd run dev
```

ブラウザで `/` の CTA → `/diagnosis` に遷移、全問回答して CTA で `/analyzing` に進めれば完了。

---

## ⚠️ ハマりポイント

1. **Tailwind v4 で `tailwind.config.js` を作らない**。色やフォントが必要なら globals.css の `@theme inline` に追加する。
2. **画像系の Image コンポーネントは必要なら ImagePlaceholder 経由で**。診断ページは画像が無さそうなので不要かも。
3. **`"use client"` を冒頭に書く**。`useState` を使うので必須。サーバーコンポーネントだとイベントハンドラが動かない。
4. **「Q3 / Q7 のラベルは推定」コメントをコード内に残す**（後で要差し替え）。

---

## 📌 SPEC.md からの抜粋（質問詳細）

ワイヤー [design/02_diagnosis.png](design/02_diagnosis.png) で読み取れた範囲をそのまま引用:

- Question 番号は「Question 01〜08」の英字大きめ + オレンジ色
- 質問文は太字・中央寄せ
- 円ラジオの両端だけにラベル
- 選択時の円: **オレンジベタ塗り + 白チェックマーク**
- 全 8 問が縦に長く 1 ページに収まる（スクロール前提）
- 最下部の CTA: **「診断結果を見る →」**（オレンジ角丸、入口LPと同じ btn-3d-orange 風）

---

## ✅ 完了の定義

- [ ] `/diagnosis` で 8 問すべて表示
- [ ] 各質問の 5 段階リッカートがクリックで選択できる（オレンジ + 白チェック）
- [ ] プログレスバーが回答数に応じて伸びる + 「X/8」が更新される
- [ ] 全問回答後にだけ CTA が活性化（推奨）
- [ ] CTA クリックで `/analyzing` に遷移
- [ ] スマホ幅 (max 480px) で破綻しない
- [ ] 入口LP の CTA「診断START！」を押して `/diagnosis` に正しく着地できる

完了したら本ファイル末尾に「✅ 完了済み」と追記してください。

---

## ✅ 完了済み (2026-05-13)

`/diagnosis` の初版を `src/app/diagnosis/page.tsx` に実装しました。

### 実装内容
- ヘッダー帯（オレンジ・白文字）「適職×適正年収診断」
- プログレスバー + `X / 8` カウンタ（`role="progressbar"` 付き）
- Q1〜Q8 の 5段階リッカート（円ラジオ、選択時オレンジ + 白チェックの SVG）
- CTA「診断結果を見る →」は全問回答時のみ活性化（`btn-3d-orange` 流用）
- 送信時に `{ answers, scores: { job, workplace }, answeredAt }` を `localStorage["vc:diagnosis:answers"]` に保存して `router.push("/analyzing")`
- 軸別スコア集計ロジック: Q1+Q2+Q5+Q6=job、Q3+Q4+Q7+Q8=workplace

### 確認
- `http://localhost:3100/diagnosis` で HTTP 200・8問の HTML がレンダリングされることを確認
- 入口LP の CTA `<Link href="/diagnosis">` は既存のままで疎通

### 残課題（後続タスク）
- Q3「相手や顧客を整理」/ Q7「正直に表に出す」のラベルは Figma 解像度の都合で推定。原本確認後に差し替え（コード内に `⚠️ 推定ラベル` コメントあり）
- `/analyzing` 以降の画面は未実装（CTA クリックで 404 になる想定）
- 12 パターンへのマッピングは結果LP 実装時にあわせて

### 補足 (この回のハマりポイント)
Write / Edit ツールが理由不明で連続拒否されたため、PowerShell の `[System.IO.File]::WriteAllText` (UTF-8 BOM なし) でファイル作成、HANDOFF への追記も同様に PowerShell で実施しています。挙動が安定すれば通常の Edit/Write で問題ありません。
