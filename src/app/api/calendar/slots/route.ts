// 指定日 (YYYY-MM-DD JST) の空きスロットを返す。
//
//   GET /api/calendar/slots?date=2026-05-20
//   →  { date: "2026-05-20", slots: [{ startISO, endISO, label }, ...] }
//
// 公開エンドポイント。認証なし。
// 個人カレンダーの詳細は外に出ない (freebusy は busy/free 時間だけ返す)。

import { NextResponse } from "next/server";
import { getBusyRanges } from "@/lib/google-calendar";
import { buildAvailableSlots, dayBoundsJst } from "@/lib/slot-generator";

export const dynamic = "force-dynamic"; // ISR/SSG 無効化、常に最新

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  // デバッグ用: process.env の各キーが見えているか (値は返さない)
  const envCheck = {
    hasClientId: !!process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientIdLength: process.env.GOOGLE_OAUTH_CLIENT_ID?.length ?? 0,
    hasClientSecret: !!process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    clientSecretLength: process.env.GOOGLE_OAUTH_CLIENT_SECRET?.length ?? 0,
    hasRefreshToken: !!process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
    refreshTokenLength: process.env.GOOGLE_OAUTH_REFRESH_TOKEN?.length ?? 0,
    hasCalendarId: !!process.env.GOOGLE_CALENDAR_ID,
    calendarIdValue: process.env.GOOGLE_CALENDAR_ID ?? null,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    nodeEnv: process.env.NODE_ENV ?? null,
  };

  // ?debug=env なら env 情報だけ返して終了
  if (searchParams.get("debug") === "env") {
    return NextResponse.json({ envCheck });
  }

  if (!date || !DATE_REGEX.test(date)) {
    return NextResponse.json(
      { error: "date クエリは YYYY-MM-DD 形式で指定してください", envCheck },
      { status: 400 },
    );
  }

  try {
    const { timeMin, timeMax } = dayBoundsJst(date);
    const busy = await getBusyRanges(timeMin, timeMax);
    const slots = buildAvailableSlots(date, busy);
    return NextResponse.json({ date, slots, _debug: { busyCount: busy.length, timeMin, timeMax } });
  } catch (err) {
    console.error("[api/calendar/slots] failed", err);
    // 一時的にエラー詳細を返す (原因切り分け用、原因判明後に汎用メッセージに戻す)
    const detail =
      err && typeof err === "object" && "message" in err
        ? String((err as { message?: unknown }).message)
        : String(err);
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code?: unknown }).code)
        : undefined;
    return NextResponse.json(
      {
        error: "空き時間の取得に失敗しました。",
        _debug: { detail, code, envCheck },
      },
      { status: 500 },
    );
  }
}
