// 営業時間 × 30 分のスロットグリッドを生成し、Google Calendar の busy ranges
// と被るものを除外する。すべて JST (Asia/Tokyo) を前提に扱う。
//
// 営業時間ポリシーは下記の BUSINESS_HOURS で定義。除外日は当面なし
// (運用が決まったら追加する)。

import type { BusyRange } from "@/lib/google-calendar";

export type Slot = {
  startISO: string; // RFC3339 with +09:00
  endISO: string;
  label: string; // "10:00 - 10:30"
};

// 平日 / 土日とも 10:00 - 19:00、30 分刻み
const BUSINESS_HOURS = {
  startHour: 10,
  endHour: 19,
  slotMinutes: 30,
};

// 当日からの締切 (分)。例: 60 → 1 時間以内のスロットは取らせない
const LEAD_TIME_MINUTES = 60;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** "2026-05-19" → 同日 00:00 JST の Date */
function dateAtJstMidnight(yyyyMmDd: string): Date {
  // JST は UTC+9 なので、その日の 00:00 JST は UTC で前日 15:00。
  // RFC3339 で +09:00 を明示してパースさせるのが確実。
  return new Date(`${yyyyMmDd}T00:00:00+09:00`);
}

function toJstIso(d: Date): string {
  // 与えられた Date を JST のローカルタイムとして RFC3339 で表現する。
  // d は UTC エポックを持つ Date なので、JST のローカル H/M を計算しなおす。
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const yyyy = jst.getUTCFullYear();
  const mm = pad2(jst.getUTCMonth() + 1);
  const dd = pad2(jst.getUTCDate());
  const hh = pad2(jst.getUTCHours());
  const mi = pad2(jst.getUTCMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:00+09:00`;
}

/** "YYYY-MM-DD" の JST 当日のスロット (busy で除外する前の素グリッド) を生成 */
function generateGridForDate(yyyyMmDd: string): Slot[] {
  const slots: Slot[] = [];
  const base = dateAtJstMidnight(yyyyMmDd);
  for (let h = BUSINESS_HOURS.startHour; h < BUSINESS_HOURS.endHour; h++) {
    for (let m = 0; m < 60; m += BUSINESS_HOURS.slotMinutes) {
      const start = new Date(base.getTime() + (h * 60 + m) * 60 * 1000);
      const end = new Date(
        start.getTime() + BUSINESS_HOURS.slotMinutes * 60 * 1000,
      );
      const endHour = h + (m + BUSINESS_HOURS.slotMinutes >= 60 ? 1 : 0);
      const endMinute = (m + BUSINESS_HOURS.slotMinutes) % 60;
      if (endHour > BUSINESS_HOURS.endHour) break;
      slots.push({
        startISO: toJstIso(start),
        endISO: toJstIso(end),
        label: `${pad2(h)}:${pad2(m)} - ${pad2(endHour)}:${pad2(endMinute)}`,
      });
    }
  }
  return slots;
}

function overlaps(a: { start: Date; end: Date }, b: { start: Date; end: Date }) {
  return a.start < b.end && b.start < a.end;
}

/** busy 範囲と被ったスロットを除外して空きだけを返す */
export function filterFreeSlots(slots: Slot[], busy: BusyRange[]): Slot[] {
  if (busy.length === 0) return slots;
  const busyRanges = busy.map((b) => ({
    start: new Date(b.start),
    end: new Date(b.end),
  }));
  return slots.filter((s) => {
    const range = { start: new Date(s.startISO), end: new Date(s.endISO) };
    return !busyRanges.some((b) => overlaps(range, b));
  });
}

/** 過去スロット + LEAD_TIME 以内のスロットを除外 */
export function dropPastSlots(slots: Slot[]): Slot[] {
  const cutoff = new Date(Date.now() + LEAD_TIME_MINUTES * 60 * 1000);
  return slots.filter((s) => new Date(s.startISO) >= cutoff);
}

/**
 * 1 日分の空きスロットを返す。
 * busy は呼び出し側 (route handler) で freebusy.query から取得して渡す。
 */
export function buildAvailableSlots(
  yyyyMmDd: string,
  busy: BusyRange[],
): Slot[] {
  const grid = generateGridForDate(yyyyMmDd);
  const future = dropPastSlots(grid);
  return filterFreeSlots(future, busy);
}

/** 「YYYY-MM-DD」から JST 当日の 00:00 / 翌日 00:00 の RFC3339 を返す (freebusy 用範囲) */
export function dayBoundsJst(yyyyMmDd: string): { timeMin: string; timeMax: string } {
  const start = dateAtJstMidnight(yyyyMmDd);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { timeMin: toJstIso(start), timeMax: toJstIso(end) };
}
