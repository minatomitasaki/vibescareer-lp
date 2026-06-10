// Slack Incoming Webhook 経由の通知ヘルパー。
//
// 環境変数:
//   SLACK_WEBHOOK_URL  (未設定なら何もしない: ローカル開発時など)
//
// /api/calendar/book で予約成立時に呼び出される。
// 通知失敗は予約成立を妨げないため best-effort (try/catch で握りつぶす)。

// Cloudflare Workers の実行環境はタイムゾーンが UTC 固定のため、Date#getHours() 等を
// そのまま使うと JST から 9 時間ずれた値が返る (例: JST 22:00 → 13 が返る)。
// Slack 通知の日時表示は必ず Asia/Tokyo で計算する。
const TIME_ZONE = "Asia/Tokyo";

function tokyoParts(iso: string): Record<string, string> {
  const d = new Date(iso);
  const numeric = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const weekday = new Intl.DateTimeFormat("ja-JP", {
    timeZone: TIME_ZONE,
    weekday: "short",
  }).formatToParts(d);
  const map: Record<string, string> = {};
  for (const p of numeric) map[p.type] = p.value;
  map.weekday = weekday.find((x) => x.type === "weekday")?.value ?? "";
  // hour: "2-digit" + hour12: false で 24 を返す環境があるため 00 に補正
  if (map.hour === "24") map.hour = "00";
  return map;
}

function fmtDateJp(iso: string): string {
  const p = tokyoParts(iso);
  return `${p.year}/${p.month}/${p.day} (${p.weekday}) ${p.hour}:${p.minute}`;
}

function fmtTimeJp(iso: string): string {
  const p = tokyoParts(iso);
  return `${p.hour}:${p.minute}`;
}

export type BookingNotifyPayload = {
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  location: string;
  timing: string;
  birthdate: string;
  /** LP02 のみ: 年齢レンジ文字列 (例 "23〜25歳")。LP01 は未使用 */
  age?: string;
  education: string;
  school: string;
  major: string;
  resultId: string;
  /** LP バージョン (例 "lp01" / "lp02")。Slack 見出しに表示して識別 */
  lpVersion?: string;
  /** 日本語化済みの適性ラベル (例 "安定 / エンジニア職") */
  combinedLabel?: string;
  /** 適正年収レンジ (例 "480〜580万円") */
  salaryRange?: string;
  /** サブ職種 1 (個人別 2 位、日本語名) */
  subJobLabel1?: string;
  /** サブ職種 2 (個人別 3 位、日本語名) */
  subJobLabel2?: string;
  /** 広告流入元 (UTM パラメータ、EntryForm で localStorage から取得) */
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  utm_placement?: string;
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

  // 流入元行: utm_source / utm_campaign / utm_content をスラッシュ区切りで表示。
  // 全部空 (直接訪問・検索流入) なら 「(直接 / 自然検索)」を表示。
  const utmParts = [p.utm_source, p.utm_campaign, p.utm_content].filter(Boolean);
  const utmLine = utmParts.length > 0 ? utmParts.join(" / ") : "(直接 / 自然検索)";
  const placementLine = p.utm_placement ? ` (${p.utm_placement})` : "";

  // LP02 経由の予約はオファー内容が違う (個別カウンセリング主役) ため、
  // 受信側で運用を分けやすいよう見出しで明示する。
  const lpLabel =
    p.lpVersion === "lp03"
      ? "LP03 (漫画記事流入)"
      : p.lpVersion === "lp02"
        ? "LP02 (個別カウンセリング)"
        : p.lpVersion === "lp01"
          ? "LP01 (VibesRadar 受検チケット)"
          : "LP不明";

  const lines = [
    `🎉 *新規予約が入りました* — ${lpLabel}`,
    "─────────────",
    `*お客様:* ${p.lastName} ${p.firstName} 様`,
    `*メール:* ${p.email}`,
    `*日時:* ${fmtDateJp(p.startISO)} - ${fmtTimeJp(p.endISO)}`,
    `*流入元:* ${utmLine}${placementLine}`,
    `*適性:* ${p.combinedLabel || p.resultId || "(なし)"}`,
    `*年収レンジ:* ${p.salaryRange || "(なし)"}`,
    `*サブ職種候補:* ${subJobs || "(なし)"}`,
    `*電話:* ${p.phone || "(未入力)"}`,
    `*希望地域:* ${p.location || "(未入力)"}`,
    `*希望時期:* ${p.timing || "(未入力)"}`,
    // LP02 は年齢レンジ、LP01 は生年月日 を表示 (片方しか値がない想定)
    p.age
      ? `*年齢:* ${p.age}`
      : `*生年月日:* ${p.birthdate || "(未入力)"}`,
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

// =====================================================================
// フォーム入力 (リード捕捉) 用 Slack 通知。
// 予約成立より手前の段階で「誰が」「どの LP の」「どの段階で」入力した
// かをチームに即通知するための軽量バージョン。
//
// 想定 stage:
//   - "preview_unlocked": LP02 の preview ページで 4 項目 (氏名・電話・
//     メール・生年月日) を入力した時点
//   - "form_submitted": LP01/LP02 とも 詳細フォーム送信 → 予約画面遷移
//     直前の状態 (まだ予約は成立していない)
// =====================================================================
export type LeadNotifyPayload = {
  resultId: string;
  lpVersion?: string;
  stage: "preview_unlocked" | "form_submitted";
  lastName: string;
  firstName: string;
  email: string;
  phone?: string;
  birthdate?: string;
  /** LP02 のみ: 年齢レンジ文字列 (例 "23〜25歳") */
  age?: string;
  location?: string;
  timing?: string;
  education?: string;
  school?: string;
  major?: string;
  combinedLabel?: string;
  salaryRange?: string;
  subJobLabel1?: string;
  subJobLabel2?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  utm_placement?: string;
};

export async function notifyLeadToSlack(p: LeadNotifyPayload): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;

  const lpLabel =
    p.lpVersion === "lp03"
      ? "LP03 (漫画記事流入)"
      : p.lpVersion === "lp02"
        ? "LP02 (個別カウンセリング)"
        : p.lpVersion === "lp01"
          ? "LP01 (VibesRadar 受検チケット)"
          : "LP不明";

  // ステージ見出し:
  //   preview_unlocked: LP02 だけが使う (第1段フォーム)
  //   form_submitted:  LP01/LP02/LP03 共通 (予約直前)
  const stageLabel =
    p.stage === "preview_unlocked"
      ? "📝 *リード入力 (LP02 第1段フォーム)*"
      : p.lpVersion === "lp03"
        ? "📋 *リード入力 (LP03 1段フォーム / 予約直前)*"
        : "📋 *詳細フォーム入力 (予約直前)*";

  const utmParts = [p.utm_source, p.utm_campaign, p.utm_content].filter(Boolean);
  const utmLine = utmParts.length > 0 ? utmParts.join(" / ") : "(直接 / 自然検索)";
  const placementLine = p.utm_placement ? ` (${p.utm_placement})` : "";

  const subJobs = [p.subJobLabel1, p.subJobLabel2].filter(Boolean).join(" / ");

  const lines = [
    `${stageLabel} — ${lpLabel}`,
    "─────────────",
    `*お客様:* ${p.lastName} ${p.firstName} 様`,
    `*メール:* ${p.email}`,
    p.phone ? `*電話:* ${p.phone}` : null,
    // LP02: 年齢レンジ / LP01: 生年月日。片方しか入っていない想定
    p.age
      ? `*年齢:* ${p.age}`
      : p.birthdate
        ? `*生年月日:* ${p.birthdate}`
        : null,
    `*流入元:* ${utmLine}${placementLine}`,
    p.combinedLabel ? `*適性:* ${p.combinedLabel}` : null,
    p.salaryRange ? `*年収レンジ:* ${p.salaryRange}` : null,
    subJobs ? `*サブ職種候補:* ${subJobs}` : null,
    p.location ? `*希望地域:* ${p.location}` : null,
    p.timing ? `*希望時期:* ${p.timing}` : null,
    p.education ? `*最終学歴:* ${p.education}` : null,
    p.school ? `*学校名:* ${p.school}` : null,
    p.major ? `*専攻学科:* ${p.major}` : null,
    "─────────────",
  ].filter((l): l is string => Boolean(l));

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: lines.join("\n") }),
    });
  } catch (err) {
    console.warn("[slack-notify lead] failed", err);
  }
}
