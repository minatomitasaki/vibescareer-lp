<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# VibesCareer LP — プロジェクト共通指示書

このセクションは Claude Code / Cursor / Codex 等の AI エージェントが、複数タブ・複数セッションで開いても**同じ方針**で実装できるよう統一する目的のもの。
CLAUDE.md は `@AGENTS.md` 参照のため、ここに書けば自動的に Claude Code でも読まれる。

## プロジェクト概要

- 名称: **VibesCareer LP** (20代・第二新卒向けのパーソナル型 転職支援サービス LP)
- スタック: Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS v4
- 主要ページ: `/` (入口LP) / `/result/[id]` (12 パターンの診断結果LP) / `/schedule` (予約) / `/thanks` (完了)
- 本番: `https://career.vibesradar.ai` (Cloudflare Workers + OpenNext、main push で Workers Builds が自動デプロイ 3〜5 分)
- リポジトリ: `github.com/minatomitasaki/vibescareer-lp` (Public)

## ブランド / デザインの基本

### カラー (`globals.css` の `:root` で定義)
- メイン: `--color-brand-primary: #ff6b00` (warm orange)
- 薄オレンジ: `--color-brand-primary-light: #ffe5d1`
- グラデ (濃): `linear-gradient(135deg, #ffd9b3 0%, #ff8533 55%, #ff6b00 100%)`
- 背景クリーム: `#FFFAF2` / `#FFFEFB`
- アクセント (悩み訴求の涙のみ): light blue `#7EC8E3`
- **NG: 青 / 緑 / シアン / 紫を装飾色として使わない** (warm tone で統一)

### フォント (`layout.tsx` で `next/font/google` 経由)
- 本文: Noto Sans JP (`--font-sans`)
- 英字: Inter (`--font-display`)
- セリフ (アドバイザーキャッチ専用): Noto Serif JP (`--font-serif`)

### トンマナの参考
- **構成参考: `https://tarushiru.jp/career01`** (悩み訴求セクション以降は基本この LP の流れを踏襲)
- ただし **CSS の直接コピーは禁止** — レイアウトのアイデアだけを抽出し、VibesCareer の独自オレンジで再実装
- 競合 LP の青系装飾は VibesCareer の warm orange に置換する

## コーディング方針

### TypeScript
- `strict: true` 想定。未使用変数 / インポートは残さない
- `any` は避ける。`unknown` + 型ガードを優先

### Tailwind CSS v4
- 基本は Tailwind ユーティリティ
- 複雑な装飾は `globals.css` の独自クラス (kebab-case、セクション名プレフィックス: `.concern-card`, `.service-point-callout` 等)

### Next.js App Router
- ページは `src/app/**/page.tsx`
- 結果LP は 12 パターン (`<job>-<workplace>`) を `generateStaticParams` で静的生成
- 画像表示は `src/components/ImagePlaceholder.tsx` を使う (`next/image` ラッパー、開発時はプレースホルダー対応)

### コミット方針 (重要)
- **日本語コミットメッセージ**。冒頭は `feat:` / `fix:` / `style:` / `refactor:` / `docs:` / `chore:` を付ける
- **Co-Authored-By を必ず末尾に**:
  ```
  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  ```
- 1 コミット 1 目的、HEREDOC で multi-line message を渡す:
  ```bash
  git commit -m "$(cat <<'EOF'
  feat: ○○を実装
  
  - 詳細1
  - 詳細2
  
  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

### 型チェック (push 前に必ず)
```bash
npx --prefix "C:/Users/minato_mitasaki/Documents/claude-projects/vibescareer-lp" --no-install tsc -p "C:/Users/minato_mitasaki/Documents/claude-projects/vibescareer-lp/tsconfig.json" --noEmit
```
無音で完了すれば OK。

## 主要ファイル

| パス | 役割 |
|---|---|
| `src/app/result/[id]/page.tsx` | 結果LP の全セクション (Section 1〜18) |
| `src/app/page.tsx` | 入口LP (15秒診断) |
| `src/app/schedule/page.tsx` | 予約日程選択 |
| `src/app/thanks/page.tsx` | 予約完了サンクスページ |
| `src/app/globals.css` | グローバル CSS (Tailwind v4 + 自前クラス) |
| `src/app/layout.tsx` | 共通レイアウト・フォント |
| `src/data/landing.ts` | アドバイザー / 成功事例 / パートナーロゴ等 |
| `src/data/results.ts` | 結果LP の 12 パターン分テキスト |
| `src/lib/google-calendar.ts` | Google Calendar API ラッパー |
| `src/lib/slack-notify.ts` | Slack 通知 |
| `src/components/SchedulePicker.tsx` | 自前の予約UI |
| `src/components/EntryForm.tsx` | フォーム送信 (client) |
| `src/components/ImagePlaceholder.tsx` | 画像表示ヘルパー |
| `scripts/image-manifest.mjs` | AI 画像生成マニフェスト |
| `scripts/generate-images.mjs` | `npm run gen:images` の実体 |

## 関連ドキュメント (タスクごとに参照する)

アクティブな引継ぎ・ガイドは `docs/`、古い参考資料は `docs/archive/` に集約済み。

| ファイル | 内容 |
|---|---|
| `docs/SESSION-HANDOFF.md` | 現在のセッションの実装状況サマリ (全体把握用) |
| `docs/IMAGE-PROMPT-GUIDE.md` | 画像生成プロンプト設計ガイド (社員シェア用、汎用) |
| `docs/IMAGE-GEN-HANDOFF.md` | 別タブで画像生成タスクをやる時の引継ぎ |
| `docs/THANKS-PAGE-HANDOFF.md` | `/thanks` ページのデザイン調整用引継ぎ |
| `docs/CALENDAR-OWNER-SWITCH.md` | Google Calendar 主催者の切り替え手順 |
| `docs/VIBESRADAR-AUTOMATION.md` | LP 予約 → VibesRadar 自動登録の運用ドキュメント |
| `docs/BRIEF.md` | 当初プロジェクトブリーフ |
| `docs/archive/HANDOFF*.md` / `CLOUDFLARE-PAGES-MIGRATION.md` | 過去の引継ぎ・移行記録 (参考用) |

## Calendar / 予約 / Slack 連携

| 項目 | 値 |
|---|---|
| OAuth 主催者 | `daisuke_watanabe@organic-gr.com` (2026-05-22 に旧テスト主催者 minato_mitasaki@organic-gr.com から切替済み) |
| Calendar スコープ | `calendar.events` + `calendar.readonly` (両方必須) |
| Slack 通知 | `VibesCareer_予約通知` アプリ (Incoming Webhook) |
| GAS シート | stage 列で「form_submitted」「booking_confirmed」を識別 |

## 画像生成 (gpt-image-2)

詳細は `docs/IMAGE-PROMPT-GUIDE.md`。要点:
- 実行: `npm --prefix "..." run gen:images -- [filename.png]`、強制再生成は `-- --force`
- サポートサイズ: `1024x1024` / `1024x1536` / `1536x1024` のみ
- 生成後は **必ず Read で画像を視覚的に確認** (日本語崩れ・指の本数・構図・ロゴ混入をチェック)
- カラー: warm orange / cream / black ベース、**青系を装飾に入れない**
- 人物イラスト: `section3-full.png` を style reference にした 2D ベクター調 (細ペン線 + フラットカラー)
- アドバイザー写真: 本人実写 (例: `advisor-furusawa.png`, `advisor-watanabe.png`)、AI 生成版は `*-old.png` でバックアップ

## 振る舞いルール

### コード修正
- JSX + CSS の両方を触る変更は **両方やってから 1 コミット**
- セクション削除時: main の呼び出しと関数定義の **両方** を削除
- 未使用 import / 定数を残さない

### 画像差し替え
- `.jpg` で受け取った本人写真は PowerShell の System.Drawing で `.png` に変換 (Next.js Image の最適化都合)
- 旧バージョンを `*-old.png` でバックアップしてから上書き

### 別タブ作業時の git 競合回避
- 編集前: `git pull origin main`
- push 前: `git pull --rebase origin main`
- メインタブと同じファイルを触る場合は、互いに作業セクションを確認

### 新規フォーム作成チェックリスト
LP01 `EntryForm` / LP02 `PreviewForm` / `DetailsForm` のような GAS + Slack に連携するフォームを新規に作るとき、下記が **すべて payload に入っているか必ず確認する**。1 つでも漏れると、本番で気づくまでサイレントにデータがロストする (実例: 2026-06 に LP02 PreviewForm で UTM を含め忘れ、Meta 経由のリードがすべて「直接 / 自然検索」扱いになった事故)。

```
payload = {
  // ── 必須メタ ──────────────────────────────
  resultId,
  lpVersion: "lp01" | "lp02",   // ← LP の識別。Slack 見出しと GAS タブ振り分けに使う
  stage: "preview_unlocked" | "form_submitted" | "booking_confirmed",
  // ── 個人情報 (フォームから取得) ─────────────
  lastName, firstName, email, phone, birthdate, ...,
  // ── 診断メタ (buildResultMetaForSheet 由来) ─
  workplaceLabel, jobLabel, combinedLabel,
  subJobLabel1, subJobLabel2, salaryRange,
  // ── 広告流入元 (getStoredUtm() で localStorage から取得) ──
  utm_source, utm_medium, utm_campaign,
  utm_term, utm_content, utm_placement,
}
```

送信処理は **必ず GAS と Slack の両方に並行 POST** する:

```ts
await Promise.allSettled([
  fetch(GAS_ENDPOINT, { method: "POST", mode: "no-cors", ... }),
  fetch("/api/lead-notify", { method: "POST", ... }),
]);
```

最後に **遷移先 router.push のパスが LP01/LP02 で正しいか** を必ず確認 (`/lp01/...` と `/lp02/...` を取り違えると動線が壊れる)。

## やらないこと

- ユーザーの明示的な指示なしに `git push --force` / `git reset --hard` / ブランチ削除しない
- secret 情報 (refresh_token / Webhook URL / API キー) をチャットに貼らない、ファイルにも書かない
- 競合 LP の CSS や HTML を一字一句コピーしない (構造アイデアの参考に留める)
- ユーザーが「保留」「いったんステイ」と言ったタスクには勝手に手を出さない
- `.env.local` をコミットしない (`.gitignore` で `.env*` 除外済み)
- **Windows ローカルから `npm run cf:deploy` / `wrangler deploy` を実行しない**
  - 過去に Windows + OpenNext の互換性問題で本番 LP が壊れた事例あり (ChunkLoadError / Internal Server Error)
  - 本番デプロイは **必ず `git push origin main` 経由で Workers Builds (Cloudflare 側 = Linux) に任せる**
  - OpenNext は実行時に `WARN OpenNext is not fully compatible with Windows.` を出すが、これは無視せず、deploy をキャンセルする
  - もし誤って deploy して本番が壊れたら、Cloudflare ダッシュボード → デプロイタブ → 過去の git push 由来 (commit hash がメッセージに付いているもの) の安定版にロールバックして即復旧する

## エージェント起動時の前置きテンプレ

CLAUDE.md (→ AGENTS.md) は自動で読まれるので、追加で渡すべきは「**何をやりたいか**」だけ:

```
このプロジェクトの AGENTS.md は既に読み込まれている前提で、
次の作業をします: [具体的にやりたいこと]
```

例:
```
AGENTS.md を踏まえて、/thanks ページの完了見出しをよりリッチにしたい。
docs/THANKS-PAGE-HANDOFF.md も参照して進めて。
```
