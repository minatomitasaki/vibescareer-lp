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

  if (!date || !DATE_REGEX.test(date)) {
    return NextResponse.json(
      { error: "date クエリは YYYY-MM-DD 形式で指定してください" },
      { status: 400 },
    );
  }

  try {
    const { timeMin, timeMax } = dayBoundsJst(date);
    const busy = await getBusyRanges(timeMin, timeMax);
    const slots = buildAvailableSlots(date, busy);
    return NextResponse.json({ date, slots });
  } catch (err) {
    console.error("[api/calendar/slots] failed", err);
    return NextResponse.json(
      { error: "空き時間の取得に失敗しました。時間を置いてお試しください。" },
      { status: 500 },
    );
  }
}
