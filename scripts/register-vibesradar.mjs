// VibesRadar 管理画面に受検者を自動登録する Playwright スクリプト。
//
// 使い方:
//   node scripts/register-vibesradar.mjs --name "山田 太郎" --email "taro@example.com"
//
// 想定環境変数 (GitHub Actions の Secrets / .env.local):
//   VIBESRADAR_EMAIL     ログインメールアドレス
//   VIBESRADAR_PASSWORD  ログインパスワード
//   VIBESRADAR_HEADLESS  "false" を渡すとブラウザ表示モードで動く (デバッグ用)
//
// 終了コード:
//   0 = 成功 (登録完了画面を確認)
//   1 = 失敗 (ログイン不可 / セレクタ不一致 / タイムアウト等)
//
// 失敗時は stderr に詳細を吐き、GitHub Actions のログから原因を追跡できる。
// スクリーンショットも debug-*.png として artifact に残す。

import { chromium } from "@playwright/test";
import { parseArgs } from "node:util";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

const LOGIN_URL = "https://app.vibesradar.ai/company/login";
const DASHBOARD_HOST = "app.vibesradar.ai";

const ARTIFACTS_DIR = "playwright-artifacts";

async function main() {
  const { values } = parseArgs({
    options: {
      name: { type: "string" },
      email: { type: "string" },
    },
  });

  const name = values.name?.trim();
  const email = values.email?.trim();
  if (!name || !email) {
    console.error("Usage: node scripts/register-vibesradar.mjs --name \"姓 名\" --email \"...\"");
    process.exit(1);
  }

  const loginEmail = process.env.VIBESRADAR_EMAIL;
  const loginPassword = process.env.VIBESRADAR_PASSWORD;
  if (!loginEmail || !loginPassword) {
    console.error("環境変数 VIBESRADAR_EMAIL / VIBESRADAR_PASSWORD が未設定です");
    process.exit(1);
  }

  // CI 以外でも誤って本番アカウントを叩かないよう、ヘッドレスをデフォルトに
  const headless = process.env.VIBESRADAR_HEADLESS !== "false";

  if (!existsSync(ARTIFACTS_DIR)) {
    await mkdir(ARTIFACTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({
    locale: "ja-JP",
    timezoneId: "Asia/Tokyo",
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  // タイムアウトを長めに (Chromium 起動直後・SPA の hydration 待ちを吸収)
  page.setDefaultTimeout(20_000);
  page.setDefaultNavigationTimeout(30_000);

  const dumpScreenshot = async (label) => {
    try {
      const ts = Date.now();
      await page.screenshot({
        path: `${ARTIFACTS_DIR}/debug-${label}-${ts}.png`,
        fullPage: true,
      });
    } catch {
      // スクリーンショット失敗は無視
    }
  };

  try {
    // ── 1. ログイン ────────────────────────────────────────
    console.log("[step 1] ログイン画面へ遷移");
    await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded" });

    // メール / パスワード入力
    // type 属性ベースで拾うのが一番安定 (label のテキストが変わる可能性あり)
    await page.locator('input[type="email"]').first().fill(loginEmail);
    await page.locator('input[type="password"]').first().fill(loginPassword);

    // ログインボタン: type="submit" を最優先、なければテキスト「ログイン」
    const loginButton = page
      .locator('button[type="submit"], button:has-text("ログイン")')
      .first();
    await Promise.all([
      page.waitForURL((url) => url.host === DASHBOARD_HOST && !url.pathname.includes("/login"), {
        timeout: 20_000,
      }),
      loginButton.click(),
    ]);
    console.log("[step 1] ログイン成功:", page.url());

    // ── 2. 受検者管理画面へ ───────────────────────────────
    console.log("[step 2] 「受検者管理」をクリック");
    await page
      .getByRole("link", { name: "受検者管理" })
      .or(page.getByRole("button", { name: "受検者管理" }))
      .or(page.locator('a:has-text("受検者管理"), button:has-text("受検者管理")'))
      .first()
      .click();
    await page.waitForLoadState("networkidle");

    // ── 3. 個別登録モーダル / 画面を開く ──────────────────
    console.log("[step 3] 「+個別登録」をクリック");
    // 「+ 個別登録」「+個別登録」両方に対応 (空白の有無)
    await page
      .getByRole("button", { name: /個別登録/ })
      .or(page.getByRole("link", { name: /個別登録/ }))
      .or(page.locator(':is(button, a):has-text("個別登録")'))
      .first()
      .click();
    await page.waitForLoadState("networkidle");

    // ── 4. フォーム入力 ───────────────────────────────────
    console.log("[step 4] 氏名・メールを入力");
    // 氏名: ラベル「氏名」近傍の input、または placeholder マッチ
    const nameInput = page
      .getByLabel("氏名")
      .or(page.locator('input[placeholder*="氏名"]'))
      .or(page.locator('input[name*="name" i]'))
      .first();
    await nameInput.fill(name);

    const emailInput = page
      .getByLabel(/メール/)
      .or(page.locator('input[type="email"]'))
      .or(page.locator('input[placeholder*="メール"]'))
      .first();
    await emailInput.fill(email);

    // ── 5. 登録ボタン ─────────────────────────────────────
    console.log("[step 5] 「登録して案内を送信」をクリック");
    const submitButton = page
      .getByRole("button", { name: "登録して案内を送信" })
      .or(page.locator('button:has-text("登録して案内を送信")'))
      .first();
    await submitButton.click();

    // ── 6. 成功確認 ───────────────────────────────────────
    // 完了文言 (「送信しました」等) or 一覧画面復帰のいずれかを待つ
    console.log("[step 6] 成功表示を待機");
    const successByText = page
      .getByText(/送信しました|登録しました|案内.*送信/)
      .first()
      .waitFor({ timeout: 15_000 })
      .then(() => "text");

    const successByNav = page
      .waitForURL((url) => /examinee|candidate|user|list/i.test(url.pathname), {
        timeout: 15_000,
      })
      .then(() => "nav");

    const reason = await Promise.race([successByText, successByNav]).catch(
      () => null,
    );

    if (!reason) {
      await dumpScreenshot("submit-no-confirmation");
      throw new Error(
        "登録ボタン押下後、完了文言も一覧画面復帰も検知できませんでした",
      );
    }

    console.log(`[done] 受検者登録に成功しました (確認方法: ${reason})`);
    await dumpScreenshot("success");
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error("[error]", err instanceof Error ? err.message : String(err));
    await dumpScreenshot("fatal");
    await browser.close();
    process.exit(1);
  }
}

await main();
