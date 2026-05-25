# VibesRadar 受検者自動登録の運用ガイド

LP の予約成立と同時に、VibesRadar 管理画面 (`https://app.vibesradar.ai/company/login`)
へ受検者を自動登録し、本人に受検URLメールが届くまでを無人化する仕組み。

## 全体フロー

```
[/api/calendar/book で予約成立]
  ├ Google Calendar 予定作成
  ├ GAS シートに記録 (stage: booking_confirmed)
  ├ Slack 通知 (予約通知)
  └ GitHub repository_dispatch を POST  ← 新規追加
        ↓
[GitHub Actions: register-vibesradar.yml が起動]
  ├ Playwright Chromium で
  │   1. VibesRadar 管理画面にログイン
  │   2. 受検者管理 → +個別登録
  │   3. 氏名・メール入力 → 「登録して案内を送信」
  │   4. 完了文言/一覧復帰を確認
  ├ 成功 → VibesRadar が本人にメール送信 (自動)
  └ 失敗 → Slack に「手動登録してください」アラート
         + スクリーンショットを artifact として 7日間保存
```

起動から完了まで概ね **30秒〜1分**。

## 関連ファイル

| パス | 役割 |
|---|---|
| [scripts/register-vibesradar.mjs](scripts/register-vibesradar.mjs) | Playwright スクリプト本体 |
| [.github/workflows/register-vibesradar.yml](.github/workflows/register-vibesradar.yml) | GitHub Actions ワークフロー |
| [src/lib/dispatch-vibesradar.ts](src/lib/dispatch-vibesradar.ts) | LP → GitHub Actions の dispatch ヘルパー |
| [src/app/api/calendar/book/route.ts](src/app/api/calendar/book/route.ts) | 予約成立後に dispatch を呼ぶ (best-effort) |

## 初期セットアップ (1 回だけ)

### 1. GitHub Personal Access Token (PAT) を発行

LP (Cloudflare Workers) から GitHub Actions を起動するために必要。

1. https://github.com/settings/tokens?type=beta から **Fine-grained personal access token** を新規作成
2. Repository access: `minatomitasaki/vibescareer-lp` のみ選択
3. Permissions:
   - **Actions: Read and write** ← 必須 (dispatch 発火に必要)
   - 他は No access のままで OK
4. 生成された `github_pat_...` をコピー (このトークンは 1 回しか表示されない)

### 2. Cloudflare Workers の環境変数に PAT を登録

```powershell
# wrangler secret put でローカルから登録できる
npx --prefix "C:/Users/minato_mitasaki/Documents/claude-projects/vibescareer-lp" wrangler secret put GITHUB_DISPATCH_TOKEN
# → プロンプトで PAT を貼り付け
```

もしくは Cloudflare ダッシュボード → Workers & Pages → 該当 Worker → Settings → Variables → "Add variable" で `GITHUB_DISPATCH_TOKEN` を **Encrypt** にチェックして登録。

### 3. GitHub Secrets に VibesRadar 認証情報を登録

`https://github.com/minatomitasaki/vibescareer-lp/settings/secrets/actions` にて以下を追加:

| Secret 名 | 値 |
|---|---|
| `VIBESRADAR_EMAIL` | 管理画面のログインメール |
| `VIBESRADAR_PASSWORD` | 管理画面のログインパスワード |
| `SLACK_WEBHOOK_URL` | 既存の `VibesCareer_予約通知` の Incoming Webhook URL を流用可 |

> ⚠️ 既存の運用 (Cloudflare 側) でこれらをチャットに貼り付けた事実がある場合、
> 一度ローテーションしてから登録することを推奨。

### 4. 手動でテスト実行

セットアップ後、GitHub Actions タブから手動起動でドライランできる:

1. https://github.com/minatomitasaki/vibescareer-lp/actions/workflows/register-vibesradar.yml
2. "Run workflow" → name に `テスト 太郎`、email にテスト用アドレスを入力
3. 緑色になれば成功。失敗時は Slack に通知が飛ぶ + artifact にスクリーンショットが残る

### 5. 本番疎通テスト

LP の予約フォームから自分のテスト用メールで予約 → 数十秒後に VibesRadar から受検URLメールが届けば疎通成功。

## ローカル開発時の挙動

`npm run dev` でローカル開発する場合、`GITHUB_DISPATCH_TOKEN` は **未設定で OK**。
未設定の場合、予約 API は dispatch をスキップし、Cloudflare Workers のログに
`[api/calendar/book] vibesradar dispatch failed (non-fatal)` の warn が出るだけ。
予約自体は通常通り成立する (best-effort 設計)。

ローカルで dispatch まで含めてテストしたい場合のみ、`.env.local` に以下を追加:

```
GITHUB_DISPATCH_TOKEN=github_pat_...
# 別リポに dispatch したい場合 (通常不要)
# GITHUB_DISPATCH_REPO=owner/repo
```

## トラブルシュート

### 「セレクタが見つからない」系のエラー

VibesRadar 管理画面の UI が変わると壊れる。対処:

1. GitHub Actions の失敗 run から `playwright-artifacts-<run_id>` の zip をダウンロード
2. `debug-*.png` を見てどの段階で止まったか確認
3. [scripts/register-vibesradar.mjs](scripts/register-vibesradar.mjs) の該当ステップのセレクタを修正

### ローカルでデバッグしたい

```powershell
# 環境変数を設定 (PowerShell)
$env:VIBESRADAR_EMAIL = "..."
$env:VIBESRADAR_PASSWORD = "..."
$env:VIBESRADAR_HEADLESS = "false"  # ブラウザを表示してデバッグ

node "C:/Users/minato_mitasaki/Documents/claude-projects/vibescareer-lp/scripts/register-vibesradar.mjs" `
  --name "テスト 太郎" --email "test@example.com"
```

`VIBESRADAR_HEADLESS=false` でブラウザが目に見える状態で起動するので、どこで詰まっているか確認できる。

### dispatch が起動しない

LP 側のログ (Cloudflare Workers の Real-time logs) で `[api/calendar/book] vibesradar dispatch failed` を確認。
原因の典型例:

- `GITHUB_DISPATCH_TOKEN` 未設定 / 期限切れ / スコープ不足
- リポジトリ名が変わった → `GITHUB_DISPATCH_REPO` で上書き可能

## 失敗時の挙動

VibesRadar 登録に失敗しても **予約自体は成立する** (best-effort 設計)。
Slack に「手動登録してください」アラートが飛び、担当者が管理画面で対応する。

GitHub Actions のログには Playwright の全ログ + 失敗時スクリーンショットが残るので、
パターン化したエラーは [scripts/register-vibesradar.mjs](scripts/register-vibesradar.mjs)
のセレクタを増やしていくことで対応できる。
