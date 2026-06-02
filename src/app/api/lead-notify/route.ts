// リード捕捉 (フォーム入力時) の Slack 通知エンドポイント。
//
//   POST /api/lead-notify
//   body: LeadNotifyPayload (src/lib/slack-notify.ts 参照)
//   → 200 { ok: true }
//
// 各フォーム (LP01 EntryForm / LP02 PreviewForm / LP02 DetailsForm) から
// GAS の Web App と並行で呼ばれる軽量エンドポイント。
// Slack Webhook URL はサーバの環境変数で秘匿、クライアントに露出させない。
//
// best-effort: Slack 通知が失敗してもユーザー体験を妨げないよう、
// 必ず 200 を返す (ユーザーフォームの送信成功扱いを邪魔しない)。

import { NextResponse } from "next/server";
import {
  notifyLeadToSlack,
  type LeadNotifyPayload,
} from "@/lib/slack-notify";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let payload: LeadNotifyPayload;
  try {
    payload = (await request.json()) as LeadNotifyPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  // ざっくりだけバリデーション (必須項目漏れは fail オープン:
  // 通知だけスキップして 200 を返す)
  const okEnough =
    typeof payload?.email === "string" &&
    typeof payload?.lastName === "string" &&
    typeof payload?.firstName === "string" &&
    (payload?.stage === "preview_unlocked" ||
      payload?.stage === "form_submitted");

  if (okEnough) {
    try {
      await notifyLeadToSlack(payload);
    } catch (err) {
      console.warn("[api/lead-notify] notify failed", err);
    }
  } else {
    console.warn("[api/lead-notify] skipped: invalid payload", payload?.stage);
  }

  return NextResponse.json({ ok: true });
}
