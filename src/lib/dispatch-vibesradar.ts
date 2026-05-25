// GitHub Actions の repository_dispatch を発火させて、
// VibesRadar 管理画面への受検者自動登録ワークフロー
// (.github/workflows/register-vibesradar.yml) を起動するヘルパー。
//
// 必要な環境変数:
//   GITHUB_DISPATCH_TOKEN  repo (or public_repo) スコープを持つ PAT
//   GITHUB_DISPATCH_REPO   "minatomitasaki/vibescareer-lp" 形式 (未設定なら固定値)
//
// best-effort: dispatch 失敗で予約成立を妨げないよう、呼び出し側は
// await した上でエラーをログに出すだけにとどめる。

const DEFAULT_REPO = "minatomitasaki/vibescareer-lp";
const EVENT_TYPE = "register-vibesradar";

export type VibesRadarDispatchPayload = {
  name: string; // "姓 名" を半角スペースで連結したフルネーム
  email: string;
  resultId?: string;
};

/**
 * GitHub に repository_dispatch を投げる。
 * 成功で 204、失敗時は throw。呼び出し側で握りつぶす想定。
 */
export async function dispatchVibesRadarRegistration(
  payload: VibesRadarDispatchPayload,
): Promise<void> {
  // デバッグ: 呼び出し自体が起きているか確認
  console.log("[dispatch-vibesradar] called", {
    name: payload.name,
    email: payload.email,
    resultId: payload.resultId,
  });

  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) {
    throw new Error("GITHUB_DISPATCH_TOKEN が未設定です");
  }
  // デバッグ: token が読めているか (値そのものは出さず、長さだけ)
  console.log(`[dispatch-vibesradar] token length: ${token.length}, prefix: ${token.slice(0, 12)}...`);

  const repo = process.env.GITHUB_DISPATCH_REPO || DEFAULT_REPO;
  const url = `https://api.github.com/repos/${repo}/dispatches`;
  console.log(`[dispatch-vibesradar] POST ${url} event=${EVENT_TYPE}`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      // GitHub API は User-Agent 必須
      "User-Agent": "vibescareer-lp",
    },
    body: JSON.stringify({
      event_type: EVENT_TYPE,
      client_payload: {
        name: payload.name,
        email: payload.email,
        resultId: payload.resultId ?? "",
      },
    }),
  });

  console.log(`[dispatch-vibesradar] response status: ${res.status} ${res.statusText}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `repository_dispatch failed: ${res.status} ${res.statusText} ${text}`,
    );
  }

  console.log("[dispatch-vibesradar] success");
}
