// 予約作成エンドポイント。
//
//   POST /api/calendar/book
//   body: {
//     startISO: string,
//     endISO: string,
//     formData: { firstName, lastName, email, phone, location, timing,
//                 birthdate, education, school, major, resultId, ... }
//   }
//
// 1. Google Calendar に予定を insert (Meet URL 自動付与)
// 2. 既存の GAS Web App にも引き続き POST してスプレッドシートに記録
// 3. 成功時は { ok: true, meetUrl, htmlLink } を返却
//
// 同じスロットで二重予約を防ぐため、insert 直前に freebusy.query で
// 再度 busy 状態を確認する。

import { NextResponse } from "next/server";
import {
  createCounselingEvent,
  getBusyRanges,
} from "@/lib/google-calendar";

export const dynamic = "force-dynamic";

const GAS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxdh39Lxmv0mQ55xzBU41OpZWykbVgq7pUouU83ieXMv9SzXQNWhBOxBiZ8kqeRqlZP/exec";

type EntryFormPayload = {
  resultId?: string;
  lastName?: string;
  firstName?: string;
  email?: string;
  phone?: string;
  location?: string;
  timing?: string;
  birthdate?: string;
  education?: string;
  school?: string;
  major?: string;
};

type BookRequest = {
  startISO?: string;
  endISO?: string;
  formData?: EntryFormPayload;
};

function isIsoLike(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s);
}

export async function POST(request: Request) {
  let body: BookRequest;
  try {
    body = (await request.json()) as BookRequest;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { startISO, endISO, formData } = body;
  if (!isIsoLike(startISO) || !isIsoLike(endISO)) {
    return NextResponse.json(
      { error: "startISO / endISO は ISO8601 形式で必須です" },
      { status: 400 },
    );
  }
  if (!formData?.email || !formData?.lastName || !formData?.firstName) {
    return NextResponse.json(
      { error: "氏名 / メールアドレスは必須です" },
      { status: 400 },
    );
  }

  // 二重予約防止: 直前に再度 busy を確認
  try {
    const busy = await getBusyRanges(startISO, endISO);
    if (busy.length > 0) {
      return NextResponse.json(
        {
          error:
            "選択された時間枠は他の方に押さえられたばかりです。別の時間帯を選び直してください。",
        },
        { status: 409 },
      );
    }
  } catch (err) {
    console.error("[api/calendar/book] freebusy check failed", err);
    return NextResponse.json(
      { error: "空き状況の再確認に失敗しました。再度お試しください。" },
      { status: 500 },
    );
  }

  // Google Calendar に予定作成
  let created: { eventId: string; meetUrl: string | null; htmlLink: string | null };
  try {
    created = await createCounselingEvent({
      startISO,
      endISO,
      attendeeEmail: formData.email,
      attendeeName: `${formData.lastName} ${formData.firstName}`,
      resultId: formData.resultId ?? "",
      notes: [
        formData.phone ? `電話: ${formData.phone}` : "",
        formData.location ? `希望勤務地: ${formData.location}` : "",
        formData.timing ? `希望転職時期: ${formData.timing}` : "",
        formData.birthdate ? `生年月日: ${formData.birthdate}` : "",
        formData.education ? `最終学歴: ${formData.education}` : "",
        formData.school ? `学校名: ${formData.school}` : "",
        formData.major ? `専攻学科: ${formData.major}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });
  } catch (err) {
    console.error("[api/calendar/book] events.insert failed", err);
    return NextResponse.json(
      { error: "予約の登録に失敗しました。少し待ってから再度お試しください。" },
      { status: 500 },
    );
  }

  // GAS にもログ送信 (失敗してもユーザーには成功で返す: best-effort)
  // stage: "booking_confirmed" を付けて、フォーム送信時 ("form_submitted") と
  // 区別できるようにする (GAS 側で stage 列を見れば離脱者と区別可能)。
  try {
    await fetch(GAS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        ...formData,
        stage: "booking_confirmed",
        bookingStartISO: startISO,
        bookingEndISO: endISO,
        bookingMeetUrl: created.meetUrl ?? "",
      }),
      // server 側 fetch なので mode: no-cors は不要
    });
  } catch (err) {
    console.warn("[api/calendar/book] GAS forward failed (non-fatal)", err);
  }

  return NextResponse.json({
    ok: true,
    eventId: created.eventId,
    meetUrl: created.meetUrl,
    htmlLink: created.htmlLink,
  });
}
