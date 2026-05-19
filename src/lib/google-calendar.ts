// Google Calendar API ラッパー
//
// 認証は OAuth 2.0 + refresh token 方式。Vercel の環境変数に下記を設定:
//   GOOGLE_OAUTH_CLIENT_ID
//   GOOGLE_OAUTH_CLIENT_SECRET
//   GOOGLE_OAUTH_REFRESH_TOKEN
//   GOOGLE_CALENDAR_ID         (e.g. "primary" もしくは メールアドレス)
//
// /api/calendar/slots と /api/calendar/book からのみ呼び出される。

import { google, type calendar_v3 } from "googleapis";

// 必要スコープ:
// - calendar.events  : events.insert (予定作成 + Meet 自動付与)
// - calendar.readonly: freebusy.query (空き時間取得)
// freebusy は events スコープに含まれないため、両方必要。
const SCOPE = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
].join(" ");
export const TIME_ZONE = "Asia/Tokyo";

function getEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`環境変数 ${key} が設定されていません`);
  return v;
}

function getCalendar(): calendar_v3.Calendar {
  const oauth2 = new google.auth.OAuth2(
    getEnv("GOOGLE_OAUTH_CLIENT_ID"),
    getEnv("GOOGLE_OAUTH_CLIENT_SECRET"),
  );
  oauth2.setCredentials({
    refresh_token: getEnv("GOOGLE_OAUTH_REFRESH_TOKEN"),
    scope: SCOPE,
  });
  return google.calendar({ version: "v3", auth: oauth2 });
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
  const cal = getCalendar();
  const calendarId = getEnv("GOOGLE_CALENDAR_ID");
  const res = await cal.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      timeZone: TIME_ZONE,
      items: [{ id: calendarId }],
    },
  });
  const busy = res.data.calendars?.[calendarId]?.busy ?? [];
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
 * 参加者には Google から招待メールが自動送信される。
 */
export async function createCounselingEvent(
  params: CreateEventParams,
): Promise<{ eventId: string; meetUrl: string | null; htmlLink: string | null }> {
  const cal = getCalendar();
  const calendarId = getEnv("GOOGLE_CALENDAR_ID");

  const requestId = `vc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const res = await cal.events.insert({
    calendarId,
    sendUpdates: "all",
    conferenceDataVersion: 1,
    requestBody: {
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
    },
  });

  return {
    eventId: res.data.id ?? "",
    meetUrl: res.data.hangoutLink ?? null,
    htmlLink: res.data.htmlLink ?? null,
  };
}
