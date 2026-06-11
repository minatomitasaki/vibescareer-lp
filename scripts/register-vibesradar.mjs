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
    // VibesRadar SPA はバックグラウンドで継続的に通信 (WebSocket/ポーリング等) しており
    // networkidle が永続的に満たされないため、networkidle ではなく load を待つ。
    // load も拾えない場合は次の「個別登録」ボタン出現を直接待つので問題ない。
    await page
      .waitForLoadState("load", { timeout: 15_000 })
      .catch(() => undefined);

    // ── 3. 個別登録モーダル / 画面を開く ──────────────────
    console.log("[step 3] 「+個別登録」をクリック");
    // 「+ 個別登録」「+個別登録」両方に対応 (空白の有無)
    await page
      .getByRole("button", { name: /個別登録/ })
      .or(page.getByRole("link", { name: /個別登録/ }))
      .or(page.locator(':is(button, a):has-text("個別登録")'))
      .first()
      .click();

    // 登録モーダル/ダイアログの出現を待つ。
    // 一覧画面の検索フィルター (id="candidates-email-filter" 等) と混ざらないよう、
    // 以後の input 探索はダイアログ内にスコープを限定する。
    // radix-ui 系 (data-slot="dialog-content") にも対応。
    const dialog = page
      .getByRole("dialog")
      .or(
        page.locator(
          '[role="dialog"], [data-slot="dialog-content"], [data-state="open"][role="alertdialog"]',
        ),
      )
      .first();
    const dialogVisible = await dialog
      .waitFor({ state: "visible", timeout: 10_000 })
      .then(() => true)
      .catch(() => false);

    // ダイアログを取れたらそこを scope に、ダメならページ全体だがフィルター系は除外
    const scope = dialogVisible ? dialog : page;

    // ── 4. フォーム入力 ───────────────────────────────────
    console.log(`[step 4] 氏名・メールを入力 (dialog scope: ${dialogVisible})`);
    // 氏名: ラベル「氏名」近傍の input、または placeholder マッチ
    // どのパスでも検索フィルター (id 末尾が -filter / -search) は除外
    const nameInput = scope
      .getByLabel("氏名")
      .or(scope.locator('input[placeholder*="氏名"]:not([id*="filter"]):not([id*="search"])'))
      .or(scope.locator('input[name*="name" i]:not([id*="filter"]):not([id*="search"])'))
      .first();
    await nameInput.fill(name);

    // メール: ラベル先頭が「メール」(「メールアドレス」「メール」両方マッチ)
    // type=email / placeholder マッチは検索フィルターを除外
    const emailInput = scope
      .getByLabel(/^メール/)
      .or(scope.locator('input[type="email"]:not([id*="filter"]):not([id*="search"])'))
      .or(scope.locator('input[placeholder*="メール"]:not([id*="filter"]):not([id*="search"])'))
      .first();
    await emailInput.fill(email);

    // ── 5. 登録ボタン ─────────────────────────────────────
    console.log("[step 5] 「登録して案内を送信」をクリック");
    // ダイアログ scope 内で探す (ダイアログ外の同名ボタンが存在する場合の誤クリックを防ぐ)
    const submitButton = scope
      .getByRole("button", { name: "登録して案内を送信" })
      .or(scope.locator('button:has-text("登録して案内を送信")'))
      .first();

    // クリック前の状態を記録 (遷移検知に使う)
    const urlBeforeSubmit = page.url();
    await dumpScreenshot("before-submit");

    await submitButton.click();

    // ── 6. 成功確認 ───────────────────────────────────────
    // 「登録ボタン押下 → 何かが変化した」ことを厳密に検知する。
    // 旧実装は waitForURL がパスマッチで即 return してしまい、押す前から成功扱い
    // になるバグがあった。今は以下の3条件のうちいずれかが起きるまで待つ:
    //   a) 完了文言 (Toast / alert) が新しく表示される
    //   b) 登録ダイアログが閉じる
    //   c) URL が現在と異なるものに変わる
    console.log("[step 6] 成功表示を待機 (a:文言 / b:ダイアログ閉鎖 / c:URL遷移)");

    const successByText = page
      .getByText(/送信しました|登録しました|案内.*送信|登録が完了|追加しました/)
      .first()
      .waitFor({ state: "visible", timeout: 15_000 })
      .then(() => "text");

    // ダイアログを最初に検出できていた場合のみ「閉じる」を待つ
    const successByDialogClose = dialogVisible
      ? dialog
          .waitFor({ state: "hidden", timeout: 15_000 })
          .then(() => "dialog-closed")
      : new Promise(() => {}); // never resolve (シグナルとして使わない)

    // URL が「現在と異なるもの」に変わるのを待つ (パスマッチではない)
    const successByNav = page
      .waitForURL((url) => url.href !== urlBeforeSubmit, { timeout: 15_000 })
      .then(() => "nav");

    const reason = await Promise.race([
      successByText,
      successByDialogClose,
      successByNav,
    ]).catch(() => null);

    // submit 後のスクリーンショットは必ず残す (成功でも失敗でも診断材料に)
    await dumpScreenshot(`after-submit-${reason ?? "no-signal"}`);

    if (!reason) {
      // バリデーションエラーで送信できていない可能性が高い → エラー文言の有無もログに残す
      const errorTexts = await scope
        .locator(':is([role="alert"], .error, [aria-invalid="true"])')
        .allTextContents()
        .catch(() => []);
      if (errorTexts.length > 0) {
        console.error("[step 6] 画面上のエラー文言:", errorTexts);
      }
      throw new Error(
        "登録ボタン押下後、完了文言・ダイアログ閉鎖・URL 遷移のいずれも検知できませんでした",
      );
    }

    console.log(`[done] 受検者登録に成功しました (確認方法: ${reason})`);
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
