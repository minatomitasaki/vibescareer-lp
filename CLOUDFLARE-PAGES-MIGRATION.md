# Cloudflare Pages 本番移行マニュアル

ホスティングを Vercel から Cloudflare Pages に移し、`career.vibesradar.ai` で公開する。
親ドメイン `vibesradar.ai` は既に Cloudflare で管理されているので、サブドメイン追加で完結する。

最終構成:

```
ユーザー
   ↓
[Cloudflare DNS / Edge] (vibesradar.ai ゾーン)
   ↓
[Cloudflare Pages] (= vibescareer-lp プロジェクト)
   ↑ git push (main)
[GitHub: minatomitasaki/vibescareer-lp]
```

---

## 0. 移行前チェックリスト

- [ ] Cloudflare アカウントに `vibesradar.ai` の編集権限あり
- [ ] GitHub `minatomitasaki/vibescareer-lp` リポジトリへの Cloudflare 連携を許可できる
- [ ] 現在の Google OAuth 設定にアクセス可能（Google Cloud Console → APIs & Services → Credentials）
- [ ] Vercel 上の現行サイトはそのまま生かす（並行稼働 → 動作確認後に DNS 切替）

---

## 1. コード側の対応（AI 担当）

Next.js を Cloudflare Pages で動かすため、Next.js プロジェクトにアダプタを追加する。

1. `@opennextjs/cloudflare` を導入
2. `next.config.ts` に `output: "standalone"` などの調整
3. `wrangler.toml` を追加（Cloudflare Pages 用設定）
4. `package.json` に `pages:build` / `pages:deploy` スクリプト追加

このフェーズは PR 化して main にマージするまで Vercel 側は影響を受けない。

---

## 2. Cloudflare Pages プロジェクト作成（ユーザー作業）

### 2-1. ダッシュボードでプロジェクト作成

1. Cloudflare ダッシュボード → **Workers & Pages** → **Create application** → **Pages** タブ
2. **Connect to Git** → GitHub アカウント承認 → `minatomitasaki/vibescareer-lp` を選択
3. プロジェクト名: `vibescareer-lp`（ダッシュボード内識別用、URL には影響しない）
4. Production branch: `main`

### 2-2. ビルド設定

| 項目 | 値 |
|---|---|
| Framework preset | Next.js |
| Build command | `npm run pages:build` ※AI が後で用意するスクリプト |
| Build output directory | `.vercel/output/static` |
| Root directory | （空欄＝リポジトリルート）|
| Node.js version | 20.x もしくは 22.x |

### 2-3. 環境変数（Production / Preview 両方に登録）

| 変数名 | 入手元 |
|---|---|
| `GOOGLE_OAUTH_CLIENT_ID` | 既存 `.env.local` |
| `GOOGLE_OAUTH_CLIENT_SECRET` | 既存 `.env.local` |
| `GOOGLE_OAUTH_REFRESH_TOKEN` | 既存 `.env.local` |
| `GOOGLE_CALENDAR_ID` | 既存 `.env.local`（テスト用 `minato_mitasaki@organic-gr.com` から後日切替）|
| `SLACK_WEBHOOK_URL` | 既存 `.env.local`（VibesCareer_予約通知 アプリ）|

⚠️ `OPENAI_API_KEY` は本番ランタイムでは未使用（`scripts/generate-images.mjs` がローカル専用）。本番には登録しない。

---

## 3. 初回デプロイ確認

1. プロジェクト作成すると自動で初回ビルドが走る
2. 成功すると `https://vibescareer-lp.pages.dev` という Cloudflare 提供 URL が発行される
3. その URL で動作確認:
   - `/` 入口LP の表示
   - `/result/creative-speed` 等 12 パターン
   - `/schedule` の予約 UI（Google Calendar の枠が読めること）
   - `/thanks` の表示

### Google OAuth リダイレクト URI の暫定追加

予約 UI が OAuth を使うため、Google Cloud Console の OAuth クライアント設定で
**承認済みリダイレクト URI** に下記を追加する（本番切替後に Vercel 側は削除可能）:

```
https://vibescareer-lp.pages.dev/api/auth/callback/google
https://career.vibesradar.ai/api/auth/callback/google
```

※ 実際のコールバックパスはコード側で確認。`@/lib/google-calendar.ts` 周辺。

---

## 4. カスタムドメイン `career.vibesradar.ai` 設定

### 4-1. Cloudflare Pages 側

1. Pages プロジェクト → **Custom domains** → **Set up a custom domain**
2. `career.vibesradar.ai` を入力 → 続行
3. 自動で DNS レコード（CNAME）を追加するか確認画面が出る → **Yes, add CNAME**

### 4-2. DNS 確認

`vibesradar.ai` ゾーン → DNS タブで、以下が自動追加されているはず:

| Type | Name | Content | Proxy |
|---|---|---|---|
| CNAME | career | vibescareer-lp.pages.dev | Proxied (橙雲) |

橙雲（プロキシ）は **ON のまま**で問題ない（Cloudflare Pages は Cloudflare 自身のサービスなのでループしない）。

### 4-3. SSL 発行待ち

数分〜十数分で `https://career.vibesradar.ai` が利用可能になる。
Active になったらブラウザで開いて動作確認。

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

何か問題が起きた場合、Cloudflare Pages の **Deployments** タブから過去のビルドに 1 クリックで戻せる。
それでも解決しない場合は DNS で `career` レコードを一時的に削除して入口を閉じる。

---

## 8. 既知の制約 / 注意点

| 項目 | 注意 |
|---|---|
| `next/image` の最適化 | Cloudflare Pages は Vercel の Image Optimization と挙動が異なる。`@opennextjs/cloudflare` 経由で対応可能だが、初回は画像表示の劣化が無いか目視確認 |
| ISR (再検証) | VibesCareer は全 `generateStaticParams` で SSG 完結しているため影響なし |
| ビルド時間 | 初回は依存インストール込みで 3〜5 分かかる |
| ログ閲覧 | Cloudflare Pages → Functions → Real-time logs で SSR 関数のログが見える |
| 環境変数の変更 | ダッシュボードで変更後、再デプロイが必要（自動デプロイトリガーなし）|

---

## 9. 次にやること（フォローアップ）

- [ ] Google Calendar の OAuth 主催者を本来の担当者に切替（`CALENDAR-OWNER-SWITCH.md` 参照）
- [ ] AGENTS.md の本番 URL を `https://vibescareer-lp.vercel.app` から `https://career.vibesradar.ai` に更新
- [ ] Slack 通知の本番動作確認（残 TODO）
- [ ] GA4 / GTM の設定（必要なら）

---

## 困ったときの連絡先 / リファレンス

- Cloudflare Pages 公式: https://developers.cloudflare.com/pages/
- `@opennextjs/cloudflare`: https://github.com/opennextjs/opennextjs-cloudflare
- VibesCareer 内部リファレンス: `AGENTS.md`, `SESSION-HANDOFF.md`
