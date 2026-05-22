"use client";

// 自前の日程調整 UI。
// /api/calendar/slots からスロットを取得、/api/calendar/book で予約 → /thanks へ遷移。
// フォーム入力値は sessionStorage("vc:entry") から読み出す。

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Slot = { startISO: string; endISO: string; label: string };

type EntryFormPayload = {
  resultId: string;
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
};

const DAYS_AHEAD = 14;
const WEEK_LABEL = ["日", "月", "火", "水", "木", "金", "土"];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function buildDateTabs() {
  const out: { iso: string; day: number; weekday: string; isWeekend: boolean }[] = [];
  const today = new Date();
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const d = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    const iso = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    const weekday = WEEK_LABEL[d.getDay()];
    out.push({
      iso,
      day: d.getDate(),
      weekday,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    });
  }
  return out;
}

export function SchedulePicker() {
  const router = useRouter();
  const dates = useMemo(buildDateTabs, []);
  const [formData, setFormData] = useState<EntryFormPayload | null>(null);
  const [missingForm, setMissingForm] = useState(false);
  const [selectedIso, setSelectedIso] = useState(dates[0].iso);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [picked, setPicked] = useState<Slot | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // sessionStorage からフォーム値を読み出す
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("vc:entry");
      if (!raw) {
        setMissingForm(true);
        return;
      }
      setFormData(JSON.parse(raw) as EntryFormPayload);
    } catch {
      setMissingForm(true);
    }
  }, []);

  // 日付変更時に slots 取得
  useEffect(() => {
    let aborted = false;
    setLoadingSlots(true);
    fetch(`/api/calendar/slots?date=${selectedIso}`)
      .then((r) => r.json())
      .then((data) => {
        if (aborted) return;
        if (Array.isArray(data.slots)) {
          setSlots(data.slots);
        } else {
          setSlots([]);
        }
      })
      .catch(() => {
        if (!aborted) setSlots([]);
      })
      .finally(() => {
        if (!aborted) setLoadingSlots(false);
      });
    return () => {
      aborted = true;
    };
  }, [selectedIso]);

  async function confirmBooking() {
    if (!picked || !formData) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/calendar/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startISO: picked.startISO,
          endISO: picked.endISO,
          formData,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setSubmitError(data.error ?? "予約に失敗しました。少し待ってからもう一度お試しください。");
        setSubmitting(false);
        return;
      }
      // sessionStorage はクリア (重複予約防止)
      try {
        sessionStorage.removeItem("vc:entry");
      } catch {
        /* ignore */
      }
      router.push("/lp01/thanks");
    } catch {
      setSubmitError("通信エラーが発生しました。電波の良い場所で再度お試しください。");
      setSubmitting(false);
    }
  }

  if (missingForm) {
    return (
      <div className="bg-white border border-brand-primary/30 rounded-2xl p-6 text-center">
        <p className="text-[14px] text-text-secondary leading-[1.8]">
          フォーム入力情報が見つかりませんでした。
          <br />
          お手数ですが診断結果ページから再度フォームを送信してください。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 日付タブ (横スクロール) */}
      <div className="flex gap-2 overflow-x-auto pb-2 px-1">
        {dates.map((d) => {
          const selected = d.iso === selectedIso;
          return (
            <button
              key={d.iso}
              type="button"
              onClick={() => {
                setSelectedIso(d.iso);
                setPicked(null);
              }}
              className={`flex-shrink-0 flex flex-col items-center w-14 py-2 rounded-xl border-2 transition ${
                selected
                  ? "bg-brand-primary text-white border-brand-primary shadow-md"
                  : "bg-white border-border-default text-text-primary hover:border-brand-primary"
              }`}
            >
              <span
                className={`text-[10px] font-bold ${
                  selected
                    ? "text-white/90"
                    : d.isWeekend
                      ? "text-accent-red"
                      : "text-text-muted"
                }`}
              >
                {d.weekday}
              </span>
              <span className="text-[18px] font-black leading-none mt-1">
                {d.day}
              </span>
            </button>
          );
        })}
      </div>

      {/* スロットグリッド */}
      <div className="bg-white border border-border-default rounded-2xl p-4">
        {loadingSlots ? (
          <p className="text-center text-[13px] text-text-muted py-8">
            空き時間を取得中…
          </p>
        ) : slots.length === 0 ? (
          <p className="text-center text-[13px] text-text-muted py-8">
            この日は空きがありません。別の日を選択してください。
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {slots.map((s) => {
              const isPicked = picked?.startISO === s.startISO;
              return (
                <button
                  key={s.startISO}
                  type="button"
                  onClick={() => setPicked(s)}
                  className={`border-2 rounded-lg py-2.5 text-[13px] font-bold transition ${
                    isPicked
                      ? "bg-brand-primary text-white border-brand-primary"
                      : "bg-white border-border-default text-text-primary hover:border-brand-primary"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 確認 + 予約ボタン */}
      {picked && formData && (
        <div className="bg-bg-form rounded-2xl border border-brand-primary/30 p-4">
          <p className="text-[13px] text-text-secondary mb-2">
            以下の日程で予約してよろしいですか?
          </p>
          <p className="text-[16px] font-black text-text-primary">
            {selectedIso.replaceAll("-", "/")}{" "}
            <span className="text-brand-primary">{picked.label}</span>
          </p>
          <p className="text-[12px] text-text-muted mt-1">
            {formData.lastName} {formData.firstName} 様 / {formData.email}
          </p>
          <button
            type="button"
            onClick={confirmBooking}
            disabled={submitting}
            className="btn-cta-radar-orange group w-full mt-4 text-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="relative z-10">
              {submitting ? "予約処理中…" : "この日程で予約する"}
            </span>
            <span className="relative z-10 inline-block transition-transform group-hover:translate-x-1">
              ▶
            </span>
          </button>
          {submitError && (
            <p
              role="alert"
              className="text-accent-red text-[12px] text-center mt-3"
            >
              {submitError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
