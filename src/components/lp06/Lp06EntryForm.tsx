"use client";

// LP06 申込フォーム (client component) — 白ベース(標準テーマ)・名前+メールのみ。
//
// 動線: LINE登録 → 挨拶メッセージから /lp06/entry に誘導 → このフォーム送信
//   → GAS スプシ + Slack 通知へ POST → sessionStorage("vc:entry") に保存
//   → /lp06/schedule (カレンダー) へ遷移。
//
// 電話は収集しない。GAS シートのヘッダー列互換維持のため、payload のキー順は
// EntryForm(lp01)/PreviewForm(lp02) と完全一致させ、未収集項目は空文字で送る
// (AGENTS.md「新規フォーム作成チェックリスト」に準拠)。

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getStoredUtm } from "@/lib/utm";

const GAS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxdh39Lxmv0mQ55xzBU41OpZWykbVgq7pUouU83ieXMv9SzXQNWhBOxBiZ8kqeRqlZP/exec";

const INPUT_CLS =
  "w-full border-2 border-border-default rounded-lg px-3 py-2.5 text-[14px] focus:border-brand-primary focus:outline-none bg-white";

export function Lp06EntryForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const fd = new FormData(event.currentTarget);
    const utm = getStoredUtm();

    // キー順は lp01/lp02 と完全一致 (GAS のヘッダー列対応のため固定)。
    // LP06 は電話・診断結果を持たないので該当項目は空送信。
    const payload = {
      resultId: "lp06",
      lpVersion: "lp06" as const,
      stage: "form_submitted" as const,
      lastName: String(fd.get("lastName") ?? ""),
      firstName: String(fd.get("firstName") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: "",
      age: "",
      birthdate: "",
      location: "",
      timing: "",
      education: "",
      school: "",
      major: "",
      workplaceLabel: "",
      jobLabel: "",
      combinedLabel: "",
      subJobLabel1: "",
      subJobLabel2: "",
      salaryRange: "",
      utm_source: utm.utm_source ?? "",
      utm_medium: utm.utm_medium ?? "",
      utm_campaign: utm.utm_campaign ?? "",
      utm_term: utm.utm_term ?? "",
      utm_content: utm.utm_content ?? "",
      utm_placement: utm.utm_placement ?? "",
    };

    // /lp06/schedule の SchedulePicker が読めるように保存
    try {
      sessionStorage.setItem("vc:entry", JSON.stringify(payload));
    } catch {
      /* ignore */
    }

    try {
      await Promise.allSettled([
        fetch(GAS_ENDPOINT, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
        }),
        fetch("/api/lead-notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
      ]);
      router.push("/lp06/schedule");
    } catch {
      setError("送信に失敗しました。時間を置いて再度お試しください。");
      setSubmitting(false);
    }
  }

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={onSubmit}
      data-clarity-mask="true"
    >
      <Field label="お名前" required>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            name="lastName"
            placeholder="姓"
            className={INPUT_CLS}
            required
          />
          <input
            type="text"
            name="firstName"
            placeholder="名"
            className={INPUT_CLS}
            required
          />
        </div>
      </Field>

      <Field
        label="メールアドレス"
        required
        hint="診断の案内時に使用します"
      >
        <input type="email" name="email" className={INPUT_CLS} required />
      </Field>

      <p className="text-center text-[11px] leading-[1.6] text-text-muted">
        <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-primary underline"
        >
          個人情報取扱方針
        </a>
        に同意にして、次へ進む
      </p>

      <button
        type="submit"
        disabled={submitting}
        className="btn-cta-radar-orange group w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="relative z-10">
          {submitting ? "送信中…" : "次へ進む"}
        </span>
        <span className="relative z-10 inline-block transition-transform group-hover:translate-x-1">
          ▶
        </span>
      </button>

      {error && (
        <p role="alert" className="mt-2 text-center text-[12px] text-accent-red">
          {error}
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-[13px] font-bold text-text-primary">
          {label}
          {required && (
            <span className="rounded bg-accent-red px-1.5 py-0.5 text-[10px] font-black text-white">
              必須
            </span>
          )}
        </span>
        {hint && (
          <span className="text-right text-[10.5px] leading-tight text-text-muted">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
