// 営業時間 × 1 時間のスロットグリッドを生成し、Google Calendar の
// 「予約可能」イベントに完全に内包されるスロットだけを許可、
// かつ「予約可能」以外のイベント (= busy) と被るスロットは弾く。
// すべて JST (Asia/Tokyo) 前提。

import type { AvailableEventRange, BusyRange } from "@/lib/google-calendar";

export type Slot = {
  startISO: string; // RFC3339 with +09:00
  endISO: string;
  label: string; // "10:00 - 11:00"
};

// 10:00 - 24:00、1 時間刻み
const BUSINESS_HOURS = {
  startHour: 10,
  endHour: 24,
  slotMinutes: 60,
};

// 当日からの締切 (分)。
// スロットの開始時刻が「現在時刻 + LEAD_TIME_MINUTES」以上であれば予約可能。
// 例: 現在 17:30、LEAD_TIME = 30 → 18:00 枠は OK / 17:31 → 18:00 枠は NG。
const LEAD_TIME_MINUTES = 30;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** "2026-05-19" → 同日 00:00 JST の Date */
function dateAtJstMidnight(yyyyMmDd: string): Date {
  // JST は UTC+9。RFC3339 で +09:00 を明示してパースさせるのが確実。
  return new Date(`${yyyyMmDd}T00:00:00+09:00`);
}

function toJstIso(d: Date): string {
  // 与えられた Date を JST のローカルタイムとして RFC3339 で表現する。
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const yyyy = jst.getUTCFullYear();
  const mm = pad2(jst.getUTCMonth() + 1);
  const dd = pad2(jst.getUTCDate());
  const hh = pad2(jst.getUTCHours());
  const mi = pad2(jst.getUTCMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:00+09:00`;
}

/** "YYYY-MM-DD" の JST 当日のスロット (許可・busy 判定前の素グリッド) を生成 */
function generateGridForDate(yyyyMmDd: string): Slot[] {
  const slots: Slot[] = [];
  const base = dateAtJstMidnight(yyyyMmDd);
  for (let h = BUSINESS_HOURS.startHour; h < BUSINESS_HOURS.endHour; h++) {
    for (let m = 0; m < 60; m += BUSINESS_HOURS.slotMinutes) {
      const start = new Date(base.getTime() + (h * 60 + m) * 60 * 1000);
      const end = new Date(
        start.getTime() + BUSINESS_HOURS.slotMinutes * 60 * 1000,
      );
      const endHour = h + Math.floor((m + BUSINESS_HOURS.slotMinutes) / 60);
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

function contains(outer: { start: Date; end: Date }, inner: { start: Date; end: Date }) {
  return outer.start.getTime() <= inner.start.getTime()
    && outer.end.getTime() >= inner.end.getTime();
}

/**
 * 「予約可能」イベントに完全に内包されるスロットだけを残す。
 * カレンダー側で「10:00 - 13:00 予約可能」のような長いブロックが置かれた場合、
 * 10/11/12 時の 3 枠が許可される。
 */
export function filterByAvailableEvents(
  slots: Slot[],
  available: AvailableEventRange[],
): Slot[] {
  if (available.length === 0) return [];
  const availRanges = available.map((a) => ({
    start: new Date(a.start),
    end: new Date(a.end),
  }));
  return slots.filter((s) => {
    const slot = { start: new Date(s.startISO), end: new Date(s.endISO) };
    return availRanges.some((a) => contains(a, slot));
  });
}

/** busy 範囲と被ったスロットを除外 (二重予約防止) */
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

/**
 * 「現在時刻 + LEAD_TIME_MINUTES」より前に始まるスロットを除外。
 * 境界は >= で許可 (例: 17:30 ちょうどに 18:00 枠は OK)。
 */
export function dropPastSlots(slots: Slot[]): Slot[] {
  const cutoff = new Date(Date.now() + LEAD_TIME_MINUTES * 60 * 1000);
  return slots.filter((s) => new Date(s.startISO) >= cutoff);
}

/**
 * 1 日分の空きスロットを返す。
 * available / busy は呼び出し側 (route handler) で events.list から取得して渡す。
 */
export function buildAvailableSlots(
  yyyyMmDd: string,
  available: AvailableEventRange[],
  busy: BusyRange[],
): Slot[] {
  const grid = generateGridForDate(yyyyMmDd);
  const allowed = filterByAvailableEvents(grid, available);
  const future = dropPastSlots(allowed);
  return filterFreeSlots(future, busy);
}

/** 「YYYY-MM-DD」から JST 当日の 00:00 / 翌日 00:00 の RFC3339 を返す (取得範囲用) */
export function dayBoundsJst(yyyyMmDd: string): { timeMin: string; timeMax: string } {
  const start = dateAtJstMidnight(yyyyMmDd);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { timeMin: toJstIso(start), timeMax: toJstIso(end) };
}
