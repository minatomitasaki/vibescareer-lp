// Slack Incoming Webhook 経由の通知ヘルパー。
//
// 環境変数:
//   SLACK_WEBHOOK_URL  (未設定なら何もしない: ローカル開発時など)
//
// /api/calendar/book で予約成立時に呼び出される。
// 通知失敗は予約成立を妨げないため best-effort (try/catch で握りつぶす)。

const WEEKDAY_JP = ["日", "月", "火", "水", "木", "金", "土"];

function fmtDateJp(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const wd = WEEKDAY_JP[d.getDay()];
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${day} (${wd}) ${hh}:${mm}`;
}

function fmtTimeJp(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export type BookingNotifyPayload = {
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  location: string;
  timing: string;
  birthdate: string;
  education: string;
  school: string;
  major: string;
  resultId: string;
  /** 日本語化済みの適性ラベル (例 "安定 / エンジニア職") */
  combinedLabel?: string;
  /** 適正年収レンジ (例 "480〜580万円") */
  salaryRange?: string;
  /** サブ職種 1 (個人別 2 位、日本語名) */
  subJobLabel1?: string;
  /** サブ職種 2 (個人別 3 位、日本語名) */
  subJobLabel2?: string;
  startISO: string;
  endISO: string;
  meetUrl: string | null;
};

export async function notifyBookingToSlack(
  p: BookingNotifyPayload,
): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;

  const subJobs = [p.subJobLabel1, p.subJobLabel2].filter(Boolean).join(" / ");

  const lines = [
    "🎉 *新規予約が入りました*",
    "─────────────",
    `*お客様:* ${p.lastName} ${p.firstName} 様`,
    `*メール:* ${p.email}`,
    `*日時:* ${fmtDateJp(p.startISO)} - ${fmtTimeJp(p.endISO)}`,
    `*適性:* ${p.combinedLabel || p.resultId || "(なし)"}`,
    `*年収レンジ:* ${p.salaryRange || "(なし)"}`,
    `*サブ職種候補:* ${subJobs || "(なし)"}`,
    `*電話:* ${p.phone || "(未入力)"}`,
    `*希望地域:* ${p.location || "(未入力)"}`,
    `*希望時期:* ${p.timing || "(未入力)"}`,
    `*生年月日:* ${p.birthdate || "(未入力)"}`,
    `*最終学歴:* ${p.education || "(未入力)"}`,
    `*学校名:* ${p.school || "(未入力)"}`,
    `*専攻学科:* ${p.major || "(未入力)"}`,
    `*Meet:* ${p.meetUrl ?? "(自動付与失敗)"}`,
    "─────────────",
    "📊 <https://docs.google.com/spreadsheets/d/1n0r6uED1J7PFeNhC5PQqqt5RWNEHBCHRuPIrhmLf9SQ/edit?gid=0#gid=0|申込ログシートを開く>",
  ];

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: lines.join("\n") }),
    });
  } catch (err) {
    console.warn("[slack-notify] failed", err);
  }
}
