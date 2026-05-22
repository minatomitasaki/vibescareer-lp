// Google Calendar API ラッパー (Cloudflare Workers 互換版)
//
// 認証は OAuth 2.0 + refresh token 方式。環境変数:
//   GOOGLE_OAUTH_CLIENT_ID
//   GOOGLE_OAUTH_CLIENT_SECRET
//   GOOGLE_OAUTH_REFRESH_TOKEN
//   GOOGLE_CALENDAR_ID         (e.g. "primary" もしくは メールアドレス)
//
// /api/calendar/slots と /api/calendar/book からのみ呼び出される。
//
// 実装メモ:
// 以前は `googleapis` (Node 用 SDK) を使っていたが、Cloudflare Workers の
// fetch ランタイムとの相性が悪く、token refresh レスポンスの gzip 自動展開と
// gaxios 内部の処理が衝突して TypeError で死ぬ既知問題があった。
// → 必要な 3 endpoint (token / freeBusy / events.insert) だけを fetch で直接叩く実装に置換。
// Workers / Node どちらでも動く。

export const TIME_ZONE = "Asia/Tokyo";

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3";

function getEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`環境変数 ${key} が設定されていません`);
  return v;
}

// refresh_token を使って access_token を発行する。
// 短命 (約 1 時間) のためリクエスト毎に取得 (キャッシュなし)。
async function getAccessToken(): Promise<string> {
  const params = new URLSearchParams({
    client_id: getEnv("GOOGLE_OAUTH_CLIENT_ID"),
    client_secret: getEnv("GOOGLE_OAUTH_CLIENT_SECRET"),
    refresh_token: getEnv("GOOGLE_OAUTH_REFRESH_TOKEN"),
    grant_type: "refresh_token",
  });
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`token refresh failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { access_token?: string; error?: string };
  if (!data.access_token) {
    throw new Error(`token refresh: access_token がレスポンスに含まれていません (${data.error ?? "unknown"})`);
  }
  return data.access_token;
}

export type BusyRange = { start: string; end: string };

/**
 * freebusy.query で指定範囲内の busy 時間帯を返す。
 * 予定タイトルや詳細は返らないため安全 (個人カレンダーをユーザーに見せない設計)。
 */
export async function getBusyRanges(
  timeMin: string,
  timeMax: string,
): Promise<BusyRange[]> {
  const calendarId = getEnv("GOOGLE_CALENDAR_ID");
  const accessToken = await getAccessToken();

  const res = await fetch(`${CALENDAR_API}/freeBusy`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin,
      timeMax,
      timeZone: TIME_ZONE,
      items: [{ id: calendarId }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`freeBusy failed: ${res.status} ${text}`);
  }

  type FreeBusyResponse = {
    calendars?: Record<string, { busy?: Array<{ start?: string; end?: string }> }>;
  };
  const data = (await res.json()) as FreeBusyResponse;
  const busy = data.calendars?.[calendarId]?.busy ?? [];
  return busy
    .filter((b): b is { start: string; end: string } =>
      typeof b.start === "string" && typeof b.end === "string",
    )
    .map((b) => ({ start: b.start, end: b.end }));
}

export type CreateEventParams = {
  startISO: string;
  endISO: string;
  attendeeEmail: string;
  attendeeName: string;
  resultId: string;
  notes?: string;
};

/**
 * 初回カウンセリングの予定を作成し、Google Meet も自動付与する。
 * 参加者には Google から招待メールが自動送信される (sendUpdates=all)。
 */
export async function createCounselingEvent(
  params: CreateEventParams,
): Promise<{ eventId: string; meetUrl: string | null; htmlLink: string | null }> {
  const calendarId = getEnv("GOOGLE_CALENDAR_ID");
  const accessToken = await getAccessToken();

  const requestId = `vc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const url = new URL(
    `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`,
  );
  url.searchParams.set("sendUpdates", "all");
  url.searchParams.set("conferenceDataVersion", "1");

  const requestBody = {
    summary: `[VibesCareer] 初回カウンセリング - ${params.attendeeName} 様`,
    description: [
      `診断ID: ${params.resultId}`,
      `氏名: ${params.attendeeName}`,
      `メール: ${params.attendeeEmail}`,
      params.notes ? `\n備考:\n${params.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    start: { dateTime: params.startISO, timeZone: TIME_ZONE },
    end: { dateTime: params.endISO, timeZone: TIME_ZONE },
    attendees: [
      { email: params.attendeeEmail, displayName: params.attendeeName },
    ],
    conferenceData: {
      createRequest: {
        requestId,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`events.insert failed: ${res.status} ${text}`);
  }

  type EventResponse = {
    id?: string;
    hangoutLink?: string;
    htmlLink?: string;
  };
  const data = (await res.json()) as EventResponse;
  return {
    eventId: data.id ?? "",
    meetUrl: data.hangoutLink ?? null,
    htmlLink: data.htmlLink ?? null,
  };
}
