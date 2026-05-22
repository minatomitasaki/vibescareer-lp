# Cloudflare Workers 本番移行マニュアル

ホスティングを Vercel から **Cloudflare Workers**（OpenNext for Cloudflare 経由）に移し、`career.vibesradar.ai` で公開する。
親ドメイン `vibesradar.ai` は既に Cloudflare で管理されているので、サブドメイン追加で完結する。

> ⚠️ 当初「Cloudflare Pages」で検討していたが、Next.js は **Cloudflare Workers** が公式推奨。
> ダッシュボード上「Workers & Pages」という同じ画面から作成するため操作感はほぼ同じ。

最終構成:

```
ユーザー
   ↓
[Cloudflare DNS / Edge] (vibesradar.ai ゾーン)
   ↓
[Cloudflare Workers] (= vibescareer-lp Worker / OpenNext)
   ↑ git push (main) → Workers Builds
[GitHub: minatomitasaki/vibescareer-lp]
```

---

## 0. 移行前チェックリスト

- [ ] Cloudflare アカウントに `vibesradar.ai` の編集権限あり
- [ ] GitHub `minatomitasaki/vibescareer-lp` リポジトリへの Cloudflare 連携を許可できる
- [ ] 現在の Google OAuth 設定にアクセス可能（Google Cloud Console → APIs & Services → Credentials）
- [ ] Vercel 上の現行サイトはそのまま生かす（並行稼働 → 動作確認後に DNS 切替）

---

## 1. コード側の対応（AI 担当・✅ 完了）

`main` ブランチに次の変更を取り込み済み:

| 追加 | 内容 |
|---|---|
| `@opennextjs/cloudflare` | OpenNext for Cloudflare アダプタ |
| `wrangler` | Cloudflare CLI |
| `open-next.config.ts` | OpenNext 設定（最小構成）|
| `wrangler.jsonc` | Worker 設定（name / main / compat / assets）|
| `package.json` の cf:* スクリプト | `cf:build` / `cf:preview` / `cf:deploy` / `cf:typegen` |
| `.gitignore` の追記 | `.open-next/`, `.wrangler/`, `cloudflare-env.d.ts` |

Vercel との並行稼働は維持されている（Vercel 側のビルドコマンドは変更していない）。

---

## 2. Cloudflare Workers プロジェクト作成（ユーザー作業）

### 2-1. ダッシュボードでプロジェクト作成

1. Cloudflare ダッシュボード → **Workers & Pages** → **Create**
2. **Workers** タブ → **Import a repository**（or **Create Worker** → Git Connect）
3. GitHub アカウント承認 → `minatomitasaki/vibescareer-lp` を選択
4. Worker 名: `vibescareer-lp`（既存の `wrangler.jsonc` の `name` と一致）
5. Production branch: `main`

### 2-2. ビルド設定（Workers Builds）

| 項目 | 値 |
|---|---|
| Build command | `npm run cf:build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | （空欄＝リポジトリルート）|
| Node.js version | `22.x`（環境変数 `NODE_VERSION=22` でも可）|

> Cloudflare 側の Workers Builds が `cf:build` を実行 → `.open-next/` を生成 → そのまま `wrangler deploy` で Worker にアップロード、という流れになる。

### 2-3. 環境変数（Secrets）登録

Worker → **Settings → Variables and Secrets** → **Add variable**（Type: **Secret**）で登録:

| 変数名 | 入手元 |
|---|---|
| `GOOGLE_OAUTH_CLIENT_ID` | 既存 `.env.local` |
| `GOOGLE_OAUTH_CLIENT_SECRET` | 既存 `.env.local` |
| `GOOGLE_OAUTH_REFRESH_TOKEN` | 既存 `.env.local` |
| `GOOGLE_CALENDAR_ID` | 既存 `.env.local`（テスト用 `minato_mitasaki@organic-gr.com` から後日切替）|

⚠️ `OPENAI_API_KEY` は本番ランタイムでは未使用（`scripts/generate-images.mjs` がローカル専用）。本番には登録しない。

⚠️ `SLACK_WEBHOOK_URL` も登録不要。Slack 通知は GAS Web App (`src/components/EntryForm.tsx` / `src/app/api/calendar/book/route.ts` が POST する script.google.com の endpoint) 側で送信されており、Next.js ランタイムの `notifyBookingToSlack` は未設定時 no-op で素通り（[`src/lib/slack-notify.ts`](../src/lib/slack-notify.ts) 参照）。Vercel にも未登録のまま本番稼働している。

---

## 3. 初回デプロイ確認

1. プロジェクト作成すると自動で初回ビルドが走る
2. 成功すると `https://vibescareer-lp.<account>.workers.dev` という Cloudflare 提供 URL が発行される
3. その URL で動作確認:
   - `/` 入口LP の表示
   - `/result/creative-speed` 等 12 パターン
   - `/schedule` の予約 UI（Google Calendar の枠が読めること）
   - `/thanks` の表示

### Google OAuth リダイレクト URI の暫定追加

予約 UI が OAuth を使うため、Google Cloud Console の OAuth クライアント設定で
**承認済みリダイレクト URI** に下記を追加する（本番切替後に Vercel 側は削除可能）:

```
https://vibescareer-lp.<account>.workers.dev/api/auth/callback/google
https://career.vibesradar.ai/api/auth/callback/google
```

※ 実際のコールバックパスはコード側で確認（`src/lib/google-calendar.ts`）。

---

## 4. カスタムドメイン `career.vibesradar.ai` 設定

### 4-1. Worker 側

1. Worker → **Settings → Domains & Routes** → **Add → Custom Domain**
2. `career.vibesradar.ai` を入力 → 続行
3. 自動で `vibesradar.ai` ゾーンに DNS レコード（CNAME）を追加してくれる

### 4-2. DNS 確認

`vibesradar.ai` ゾーン → DNS タブで、以下が自動追加されているはず:

| Type | Name | Content | Proxy |
|---|---|---|---|
| CNAME | career | vibescareer-lp.<account>.workers.dev | Proxied (橙雲) |

橙雲（プロキシ）は **ON のまま**で問題ない。

### 4-3. SSL 発行待ち

数分〜十数分で `https://career.vibesradar.ai` が利用可能になる。Active になったらブラウザで開いて動作確認。

---

## 5. 動作確認（最重要）

| チェック項目 | 確認方法 |
|---|---|
| 入口LP表示 | `https://career.vibesradar.ai/` |
| 12 パターン結果LP | `/result/creative-speed` 〜 `/result/sales-stable` を抜き取りで |
| 予約 UI | `/schedule` → 日時選択 → 予約ボタンが押せる |
| Google Calendar | 予約後 `minato_mitasaki@organic-gr.com` のカレンダーに予定が追加される |
| Slack 通知 | `VibesCareer_予約通知` チャネルに新規予約メッセージが届く |
| `/thanks` | 予約完了後にリダイレクトされる |
| 画像 | アドバイザー写真・各セクション画像が表示される（`next/image` 経由）|
| モバイル | iPhone Safari で右側余白が出ない、ロードマップ進捗バーが追従 |

---

## 6. Vercel からの最終切替

ここまで `career.vibesradar.ai` で問題なく動いていれば、Vercel は撤退できる。

1. Vercel ダッシュボード → vibescareer-lp プロジェクト → **Settings → Domains** → カスタムドメインが付いていれば削除
2. Vercel → Settings → 一般 → プロジェクトを残しても課金は発生しないが、不要なら Delete Project
3. GitHub リポジトリの Vercel Integration を解除（任意）
4. Google OAuth リダイレクト URI から Vercel ドメインを削除

---

## 7. ロールバック手順

何か問題が起きた場合、Cloudflare Workers の **Deployments** タブから過去のビルドに 1 クリックで戻せる。
それでも解決しない場合は DNS で `career` レコードを一時的に削除して入口を閉じる。

---

## 8. 既知の制約 / 注意点

| 項目 | 注意 |
|---|---|
| Worker サイズ | Free 3MiB / Paid 10MiB（圧縮後）。VibesCareer 規模なら問題なし、初回ビルドで `wrangler` がサイズを出力する |
| `next/image` の最適化 | Cloudflare Workers の Image Optimization は Vercel と挙動が異なる。OpenNext がフォールバック実装するが、初回は画像表示の劣化が無いか目視確認 |
| ISR (再検証) | VibesCareer は全 `generateStaticParams` で SSG 完結しているため影響なし |
| Node.js 互換 | `wrangler.jsonc` で `compatibility_flags: ["nodejs_compat"]` を有効化済み（`googleapis` の動作に必須）|
| ビルド時間 | 初回は依存インストール込みで 3〜5 分かかる |
| ログ閲覧 | Worker → **Logs** タブで Real-time logs が見える |
| 環境変数の変更 | 変更後、再デプロイが必要（git push でもダッシュボードの Redeploy でも OK）|

---

## 9. ローカル動作確認（任意）

ローカルで Worker と同等の挙動を見たい場合:

```bash
# OpenNext でビルドして Wrangler の dev サーバで実行
npm run cf:preview
```

ブラウザで `http://localhost:8787` を開く。本番と同じ Worker 互換ランタイムで動く。

---

## 10. 次にやること（フォローアップ）

- [ ] Google Calendar の OAuth 主催者を本来の担当者に切替（`CALENDAR-OWNER-SWITCH.md` 参照）
- [ ] AGENTS.md の本番 URL を `https://vibescareer-lp.vercel.app` から `https://career.vibesradar.ai` に更新
- [ ] Slack 通知の本番動作確認（残 TODO）
- [ ] GA4 / GTM の設定（必要なら）

---

## リファレンス

- OpenNext for Cloudflare: https://opennext.js.org/cloudflare
- `@opennextjs/cloudflare` リポジトリ: https://github.com/opennextjs/opennextjs-cloudflare
- Cloudflare Workers Builds: https://developers.cloudflare.com/workers/ci-cd/builds/
- VibesCareer 内部リファレンス: `AGENTS.md`, `SESSION-HANDOFF.md`
