#!/usr/bin/env node
// Google OAuth 2.0 の refresh token をローカルで 1 回だけ取得するスクリプト。
//
// 前提:
//   1. GCP コンソールで OAuth 2.0 クライアント (Web application) を作成。
//   2. 承認済みリダイレクト URI に "http://localhost:53682/oauth/callback" を追加。
//   3. .env.local に GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET を設定。
//
// 使い方:
//   1) `node scripts/get-google-refresh-token.mjs` を実行
//   2) コンソールに表示された URL をブラウザで開いて Google でログイン
//   3) 「許可」を押すと自動で http://localhost:53682/oauth/callback にリダイレクト
//   4) 自動でコードを交換し refresh_token がコンソールに表示される
//   5) その refresh_token を Cloudflare Workers の Secret
//      (vibescareer-lp Worker → 設定 → 変数とシークレット の
//      GOOGLE_OAUTH_REFRESH_TOKEN) に保存。ローカル開発する場合は
//      .env.local の同名キーにも保存。
//
// 一度成功すれば refresh_token は半永久的に使えるので、このスクリプトは
// 初回セットアップでしか走らせない。
//
// 実装メモ:
// 以前は `googleapis` SDK を使っていたが、本番ランタイムから googleapis を
// 削除した (Cloudflare Workers 非互換) のに合わせてこのスクリプトも
// fetch ベースに書き換え。外部依存は node 組み込みモジュールのみ。

import { readFile } from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const ENV_FILE = path.join(PROJECT_ROOT, ".env.local");

const REDIRECT_PORT = 53682;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/oauth/callback`;
// 必要スコープ:
// - calendar.events  : events.insert (予定作成 + Meet 自動付与)
// - calendar.readonly: freebusy.query (空き時間取得)
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
];

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

async function loadDotEnv(filePath) {
  try {
    const text = await readFile(filePath, "utf8");
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
}

function buildAuthUrl(clientId) {
  const url = new URL(AUTH_ENDPOINT);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPES.join(" "));
  url.searchParams.set("access_type", "offline");
  // prompt=consent を強制することで、再認可時にも refresh_token が必ず発行される
  url.searchParams.set("prompt", "consent");
  return url.toString();
}

async function exchangeCodeForTokens(code, clientId, clientSecret) {
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
  });
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`token exchange failed: ${res.status} ${text}`);
  }
  return res.json();
}

async function main() {
  await loadDotEnv(ENV_FILE);

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("❌ .env.local に GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET が必要です。");
    process.exit(1);
  }

  const authUrl = buildAuthUrl(clientId);

  console.log("");
  console.log("▼ 下記 URL をブラウザで開いて承認してください:");
  console.log("");
  console.log(authUrl);
  console.log("");
  console.log("(承認後は http://localhost:" + REDIRECT_PORT + " に自動リダイレクトされ、");
  console.log(" このスクリプトに code が届きます)");
  console.log("");

  // ローカルコールバックサーバ
  const code = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, `http://localhost:${REDIRECT_PORT}`);
      if (url.pathname !== "/oauth/callback") {
        res.statusCode = 404;
        res.end("not found");
        return;
      }
      const c = url.searchParams.get("code");
      const err = url.searchParams.get("error");
      if (err) {
        res.statusCode = 400;
        res.end(`OAuth error: ${err}`);
        reject(new Error(`OAuth error: ${err}`));
        server.close();
        return;
      }
      if (!c) {
        res.statusCode = 400;
        res.end("no code");
        reject(new Error("no code in callback"));
        server.close();
        return;
      }
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(
        "<h2>✅ OAuth 認証完了</h2><p>このタブは閉じて、ターミナルに戻ってください。</p>"
      );
      resolve(c);
      setTimeout(() => server.close(), 200);
    });
    server.listen(REDIRECT_PORT, () => {
      // 起動 OK
    });
  });

  console.log("→ 認可コードを取得しました。アクセストークンに交換中...");
  const tokens = await exchangeCodeForTokens(code, clientId, clientSecret);

  if (!tokens.refresh_token) {
    console.error(
      "❌ refresh_token が含まれていません。" +
        "対象アカウントの権限承認をすでに済ませている場合、prompt=consent でも返らないことがあります。" +
        "Google アカウント -> セキュリティ -> サードパーティアプリのアクセス で当アプリの承認を一度解除してから再実行してください。"
    );
    process.exit(1);
  }

  console.log("");
  console.log("✅ 取得成功！下記の REFRESH_TOKEN を Cloudflare Worker の Secret (vibescareer-lp → 設定 → 変数とシークレット) に保存してください (ローカル開発するなら .env.local にも):");
  console.log("");
  console.log("GOOGLE_OAUTH_REFRESH_TOKEN=" + tokens.refresh_token);
  console.log("");
  console.log("(参考: access_token は短命なので保存不要。refresh_token から都度発行されます。)");
}

main().catch((err) => {
  console.error("💥 エラー:", err.message || err);
  process.exit(1);
});
