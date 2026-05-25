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

/** タイトル "予約可能" のイベントだけを抽出した「許可枠」 */
export type AvailableEventRange = { start: string; end: string };

/** events.list で取得した、許可枠と busy 枠の両方をまとめた結果 */
export type CalendarAvailability = {
  /** タイトル == "予約可能" の時間帯 (許可枠) */
  available: AvailableEventRange[];
  /** タイトル != "予約可能" の時間帯 (二重予約防止用の busy) */
  busy: BusyRange[];
};

/** 予約可能枠を示すカレンダーイベントのタイトル (完全一致) */
const AVAILABLE_TITLE = "予約可能";

/**
 * events.list で指定範囲のイベントを取得し、タイトル "予約可能" のイベントを
 * 「許可枠 (available)」、それ以外のイベントを「busy」に振り分けて返す。
 *
 * 終日イベント (date 形式) は除外 (空き枠管理に時刻が必要なため)。
 * cancelled イベントも除外。繰り返しイベントは singleEvents=true で展開済み。
 */
export async function getCalendarAvailability(
  timeMin: string,
  timeMax: string,
): Promise<CalendarAvailability> {
  const calendarId = getEnv("GOOGLE_CALENDAR_ID");
  const accessToken = await getAccessToken();

  const url = new URL(
    `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`,
  );
  url.searchParams.set("timeMin", timeMin);
  url.searchParams.set("timeMax", timeMax);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", "250");
  url.searchParams.set("timeZone", TIME_ZONE);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`events.list failed: ${res.status} ${text}`);
  }

  type EventsListResponse = {
    items?: Array<{
      summary?: string;
      status?: string;
      start?: { dateTime?: string };
      end?: { dateTime?: string };
      attendees?: Array<{
        self?: boolean;
        responseStatus?: string;
      }>;
    }>;
  };
  const data = (await res.json()) as EventsListResponse;
  const items = data.items ?? [];

  const available: AvailableEventRange[] = [];
  const busy: BusyRange[] = [];

  for (const ev of items) {
    if (ev.status === "cancelled") continue;
    const start = ev.start?.dateTime;
    const end = ev.end?.dateTime;
    if (!start || !end) continue; // 終日イベントなど時刻が無いものは除外
    if (ev.summary === AVAILABLE_TITLE) {
      available.push({ start, end });
      continue;
    }
    // カレンダー主催者本人が「辞退」している予定は空きとみなす (busy に入れない)
    // accepted / tentative / needsAction はすべて busy 扱い
    const selfAttendee = ev.attendees?.find((a) => a.self);
    if (selfAttendee?.responseStatus === "declined") continue;
    busy.push({ start, end });
  }
  return { available, busy };
}

export type CreateEventParams = {
  startISO: string;
  endISO: string;
  attendeeEmail: string;
  attendeeName: string;
  resultId: string;
  notes?: string;
  /** 日本語化済みの適性ラベル (例 "安定 / エンジニア職") */
  combinedLabel?: string;
  /** 適正年収レンジ (例 "480〜580万円") */
  salaryRange?: string;
  /** サブ職種 1 (個人別 2 位、日本語名) */
  subJobLabel1?: string;
  /** サブ職種 2 (個人別 3 位、日本語名) */
  subJobLabel2?: string;
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

  const subJobs = [params.subJobLabel1, params.subJobLabel2]
    .filter(Boolean)
    .join(" / ");

  const requestBody = {
    summary: `[VibesCareer] 初回カウンセリング - ${params.attendeeName} 様`,
    description: [
      params.combinedLabel ? `適性: ${params.combinedLabel}` : "",
      params.salaryRange ? `年収レンジ: ${params.salaryRange}` : "",
      subJobs ? `サブ職種候補: ${subJobs}` : "",
      `氏名: ${params.attendeeName}`,
      `メール: ${params.attendeeEmail}`,
      params.notes ? `\n備考:\n${params.notes}` : "",
      params.resultId ? `\n(診断ID: ${params.resultId})` : "",
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
