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
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) {
    throw new Error("GITHUB_DISPATCH_TOKEN が未設定です");
  }
  const repo = process.env.GITHUB_DISPATCH_REPO || DEFAULT_REPO;
  const url = `https://api.github.com/repos/${repo}/dispatches`;

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

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `repository_dispatch failed: ${res.status} ${res.statusText} ${text}`,
    );
  }
}
