#!/usr/bin/env node
// 認可コードを refresh_token に交換するスクリプト。
//
// `get-google-refresh-token.mjs` がローカルサーバー (localhost:53682) で
// code を自動受信するのに対し、こちらは「別マシンで認可した結果の
// リダイレクト URL から code を手動で渡す」用。
//
// 用途:
//   新主催者にチャットで認証 URL を共有するパターンでは、Google が
//   `http://localhost:53682/oauth/callback?code=...` に向けてリダイレクト
//   する。だが、ここでの localhost は新主催者の PC を指すため、
//   三反﨑さんの PC のローカルサーバーには届かない。
//   新主催者にアドレスバーの URL (or code 部分) をコピーして送って
//   もらい、それをこのスクリプトに渡すことで refresh_token を発行する。
//
// 使い方:
//   1. 新主催者に scripts/get-google-refresh-token.mjs 実行時に出る
//      認証 URL を共有 (もしくはこのスクリプトの buildAuthUrl 出力でも可)
//   2. 新主催者がシークレットウィンドウで認証して「許可」を押す
//   3. 「このサイトにアクセスできません (localhost)」のエラー画面に
//      なるが、アドレスバーには `http://localhost:53682/oauth/callback?
//      code=4/0Ae...&scope=...` のような URL がそのまま残る
//   4. 新主催者にアドレスバーの URL をまるごとコピーして送ってもらう
//   5. このスクリプトに引数として渡す:
//        node scripts/exchange-google-auth-code.mjs "<URL or code>"
//   6. refresh_token がコンソールに表示される
//
// 前提:
//   .env.local に GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET を設定。

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const ENV_FILE = path.join(PROJECT_ROOT, ".env.local");

const REDIRECT_URI = "http://localhost:53682/oauth/callback";
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

function extractCode(arg) {
  if (!arg) return null;
  // URL 形式 (http://localhost:53682/oauth/callback?code=...&scope=...)
  if (arg.startsWith("http://") || arg.startsWith("https://")) {
    try {
      const url = new URL(arg);
      return url.searchParams.get("code");
    } catch {
      return null;
    }
  }
  // 「code=...」だけが渡された場合
  if (arg.startsWith("code=")) {
    const v = arg.slice("code=".length);
    return v.split("&")[0] || null;
  }
  // 生の code (4/0Ae... など) として扱う
  return arg;
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
  const arg = process.argv[2];
  if (!arg) {
    console.error("");
    console.error("使い方:");
    console.error("  node scripts/exchange-google-auth-code.mjs '<URL or code>'");
    console.error("");
    console.error("引数の例:");
    console.error("  http://localhost:53682/oauth/callback?code=4/0Ae...&scope=...");
    console.error("  code=4/0Ae...");
    console.error("  4/0Ae...");
    process.exit(1);
  }

  const code = extractCode(arg);
  if (!code) {
    console.error("❌ 引数から code を取り出せませんでした:", arg);
    process.exit(1);
  }

  await loadDotEnv(ENV_FILE);
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("❌ .env.local に GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET が必要です。");
    process.exit(1);
  }

  console.log("→ code を access_token / refresh_token に交換中...");
  const tokens = await exchangeCodeForTokens(code, clientId, clientSecret);

  if (!tokens.refresh_token) {
    console.error(
      "❌ refresh_token が含まれていません。" +
        "対象アカウントの権限承認をすでに済ませている場合、prompt=consent でも返らないことがあります。" +
        "Google アカウント -> セキュリティ -> サードパーティアプリのアクセス で当アプリの承認を一度解除してから再度認証してください。"
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
