# カレンダー連携の主催者切り替え マニュアル

VibesCareer の予約フローを動かしている **Google Calendar の主催者アカウント** を、別の人のアカウントに切り替えるための手順書です。

現在の主催者: `minato_mitasaki@organic-gr.com` (テスト用)
↓
新しい主催者: 本番運用者の Google アカウント (例: `本番@example.com`)

---

## 何が変わる?

切り替え後、VibesCareer の予約フロー (`/api/calendar/book`) は **新しい人のカレンダー** に予定を作成します。具体的には:

- 予約 = 新しい人の Google カレンダーに「[VibesCareer] 初回カウンセリング - お客様 様」として登録される
- Google Meet の URL も自動付与され、新しい人が主催者として表示される
- Slack 通知や GAS シートは変わらず動く (主催者情報は使っていないため)

---

## 方法 A: 三反﨑さん主導で切り替える (推奨・楽)

**新しい人にお願いするのはブラウザでログインして「許可」を押すだけ** の方法。約 5 分。

### Step 1: 三反﨑さんの PC で認証スクリプトを実行

PowerShell で以下を実行：

```powershell
cd C:\Users\minato_mitasaki\Documents\claude-projects\vibescareer-lp
node scripts/get-google-refresh-token.mjs
```

コンソールに長い URL (`https://accounts.google.com/o/oauth2/v2/auth?...`) が表示されます。

### Step 2: 新しい人にブラウザで承認してもらう

**選択肢 2 つ**：

**2-a. URL を新しい人にチャットで送って、自分のブラウザで踏んでもらう**
- Slack / メールなどで URL を新しい人に送信
- 新しい人はブラウザで開き、**自分の Google アカウント (本番運用用)** でログイン
- 「VibesCareer LP」が以下にアクセスしますという画面で「**許可**」をクリック

**2-b. 三反﨑さんのブラウザで新しい人にログインしてもらう**
- 三反﨑さんのブラウザ (シークレットウィンドウ推奨) で URL を開く
- 新しい人を呼んで、その場でログイン + 許可してもらう

どちらでも、許可ボタン押下後、画面が `http://localhost:53682/oauth/callback` にリダイレクトされます。

> **重要**: ローカルサーバーが動いている (Step 1 のスクリプト実行中) のは三反﨑さんの PC なので、新しい人のブラウザでも三反﨑さんの PC でも、最終的なリダイレクト先 (`localhost:53682`) は **三反﨑さんの PC** にアクセスします。
> → 2-a の場合: 新しい人のブラウザでは「ページにアクセスできません」と表示される (OK)。が、その時点で三反﨑さんの PC ローカルサーバーが認可コードを受け取って、refresh_token を出力する
> → 2-b の場合: 三反﨑さんの PC で完結する (一番確実)

### Step 3: refresh_token をメモ

PowerShell に以下のような表示が出ます:
```
✅ 取得成功！下記の REFRESH_TOKEN を .env.local と Vercel 環境変数に保存してください:

GOOGLE_OAUTH_REFRESH_TOKEN=1//0eXXXXXX...XXXXXX
```

この `1//0e...` の値をコピー (秘密情報なのでチャットや GitHub に貼らない)。

### Step 4: 新しい人の Google Calendar ID を確認

ほとんどの場合は `"primary"` で OK (= ログイン中のアカウントのメインカレンダー)。

別カレンダー (例: 「面談」専用カレンダー) を使う場合のみ:
1. 新しい人に [Google Calendar](https://calendar.google.com/) の設定 → 該当カレンダーを開く → 「カレンダーの統合」セクションの「カレンダー ID」をコピーしてもらう
2. 例: `c_xxxxxxxxxxx@group.calendar.google.com`

### Step 5: Vercel 環境変数を更新

[vercel.com/dashboard](https://vercel.com/dashboard) → `vibescareer-lp` → Settings → Environment Variables

以下 **2 つ** を編集 (Edit):

| 変数名 | 新しい値 |
|---|---|
| `GOOGLE_OAUTH_REFRESH_TOKEN` | Step 3 で取得した `1//0e...` |
| `GOOGLE_CALENDAR_ID` | `primary` (or Step 4 のカレンダー ID) |

**Save** を押す。

### Step 6: `.env.local` も同じ値に更新

ローカル開発用に `.env.local` の同じ 2 行も書き換える:
```env
GOOGLE_OAUTH_REFRESH_TOKEN=1//0e...
GOOGLE_CALENDAR_ID=primary
```

### Step 7: Vercel に再デプロイトリガー

環境変数は変更しただけでは既存デプロイに反映されないので、再デプロイが必要。

**方法 1**: 空コミットで push
```powershell
cd C:\Users\minato_mitasaki\Documents\claude-projects\vibescareer-lp
git commit --allow-empty -m "chore: 主催者カレンダー切り替えの再デプロイ"
git push origin main
```

**方法 2**: Vercel ダッシュボード → Deployments → 最新の「⋯」→ Redeploy

### Step 8: 動作確認

1. `https://vibescareer-lp.vercel.app/result/planning-stable` を開く
2. フォームに**テスト情報**を入力 (メールアドレスは自分のものを使用)
3. `/schedule` で日時を選んで予約
4. **新しい人の Google カレンダーに予定が入っている**ことを確認
5. 入力したメールアドレスに Google から招待メール (Meet URL 付き) が届くことを確認
6. 完了 → Slack に通知が来ることを確認

すべて OK なら切り替え完了 🎉

---

## 方法 B: 新しい人が完結 (技術スキル必要)

新しい人にエンジニアレベルの技術がある場合のみ。

### 必要なもの
- Node.js 18+ がインストールされた PC
- このリポジトリへの読み取り権限 (Public なので URL でアクセス可)
- `.env.local` に `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET` を共有してもらう (これは秘密情報なので慎重に)
- Vercel プロジェクトへの編集権限 (環境変数を変更できる)

### 手順

1. リポジトリを clone
   ```bash
   git clone https://github.com/minatomitasaki/vibescareer-lp.git
   cd vibescareer-lp
   ```
2. `.env.local` を作成し、三反﨑さんから共有された:
   ```env
   GOOGLE_OAUTH_CLIENT_ID=<三反﨑さんから>
   GOOGLE_OAUTH_CLIENT_SECRET=<三反﨑さんから>
   ```
3. 依存インストール:
   ```bash
   npm install
   ```
4. 認証スクリプト実行:
   ```bash
   node scripts/get-google-refresh-token.mjs
   ```
5. 表示された URL を**自分のブラウザで開く** → 自分の Google アカウントでログイン → 「許可」
6. ターミナルに表示された `GOOGLE_OAUTH_REFRESH_TOKEN=1//0e...` をコピー
7. Vercel ダッシュボードで以下を更新:
   - `GOOGLE_OAUTH_REFRESH_TOKEN`: コピーした値
   - `GOOGLE_CALENDAR_ID`: `primary` (or 任意のカレンダー ID)
8. Vercel ダッシュボードから Redeploy
9. テスト予約で確認

---

## トラブルシューティング

### Q. 認証で「アクセスをブロックしました: このアプリは Google の審査プロセスを完了していません」と出た

Google Cloud Console の OAuth 同意画面で、新しい人のメールアドレスを **テストユーザー** として登録する必要があります:

1. [Google Cloud Console](https://console.cloud.google.com/) → 該当プロジェクトを開く
2. 「APIとサービス」→「OAuth 同意画面」
3. 「テストユーザー」セクションで「+ ADD USERS」
4. 新しい人のメールアドレスを追加
5. 再度認証スクリプトを実行

### Q. 「Request had insufficient authentication scopes.」と出た

スコープが足りていない。`scripts/get-google-refresh-token.mjs` の `SCOPES` 配列に以下 2 つが含まれているか確認:
```js
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
];
```
※ `calendar.readonly` がないと `freebusy.query` が動かない (空き時間取得失敗)。

### Q. 予約完了後、新しい人のカレンダーに予定が入らない

- Vercel ダッシュボードで `GOOGLE_OAUTH_REFRESH_TOKEN` が正しく更新されているか確認
- 環境変数を更新した後、必ず Redeploy したか確認
- `https://vibescareer-lp.vercel.app/api/calendar/slots?debug=env` (現在は debug 機能なし、ログでのみ確認可)

### Q. 認証スクリプト実行時に「.env.local に GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET が必要」と出た

`.env.local` ファイルにこの 2 つの環境変数が定義されているか確認。Vercel ダッシュボードに登録されていても、**ローカル `.env.local` には別途書く必要** がある。

### Q. 旧 (minato_mitasaki) のカレンダーをもう完全に解除したい

特に対応は不要。新しい refresh_token に置き換えた時点で旧アカウントの権限は使われなくなる。

念のため Google アカウント側からも解除する場合:
1. `minato_mitasaki@organic-gr.com` で [https://myaccount.google.com/permissions](https://myaccount.google.com/permissions) を開く
2. 「VibesCareer LP」(or OAuth クライアント名) を選択
3. 「アクセス権を削除」

---

## 切り替え後に残しておくべき情報

切り替えが成功したら、`SESSION-HANDOFF.md` の「重要な設定・前提」テーブルの「OAuth 主催者」を新しいメールアドレスに更新する:

```diff
- | OAuth 主催者 | `minato_mitasaki@organic-gr.com` |
+ | OAuth 主催者 | `本番@example.com` |
```

---

## まとめ

| やること | 担当 | 所要時間 |
|---|---|---|
| 認証スクリプト実行 | 三反﨑さん | 1 分 |
| 新しい人のブラウザで「許可」 | 新しい人 | 30 秒 |
| Vercel 環境変数更新 (2 変数) | 三反﨑さん | 2 分 |
| 再デプロイ + テスト予約 | 三反﨑さん | 5 分 |
| **合計** |  | **約 10 分** |

新しい人が必要なのは Step 2 の「30 秒の承認」だけです。
