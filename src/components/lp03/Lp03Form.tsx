"use client";

// LP03 リードフォーム (article 経由で /lp03 に着地したユーザー向け)。
// LP02 PreviewForm と同じ 4 項目 (氏名 / 電話 / メール / 年齢) に絞る。
// 詳細項目 (希望勤務地 / 時期 / 学歴 / 学校名) は LP03 では収集しない。
// 送信:
//   - GAS Web App に stage="form_submitted" / lpVersion="lp03" で POST
//   - sessionStorage("vc:entry") に payload を保存
//   - /lp03/schedule に遷移して日程選択へ

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getStoredUtm } from "@/lib/utm";

const GAS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxdh39Lxmv0mQ55xzBU41OpZWykbVgq7pUouU83ieXMv9SzXQNWhBOxBiZ8kqeRqlZP/exec";

const INPUT_CLS =
  "w-full border-2 border-border-default rounded-lg px-3 py-2.5 text-[14px] focus:border-brand-primary focus:outline-none bg-white";

// 年齢レンジ (LP02 PreviewForm と完全一致)
const AGE_OPTIONS = [
  "19歳以下",
  "20〜22歳",
  "23〜25歳",
  "26〜27歳",
  "28〜29歳",
  "30〜35歳",
  "36歳以上",
] as const;

export function Lp03Form() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const fd = new FormData(event.currentTarget);
    const utm = getStoredUtm();

    const payload = {
      // LP03 は診断結果を経由しないため resultId は固定値
      resultId: "lp03-no-diag",
      lpVersion: "lp03" as const,
      stage: "form_submitted" as const,
      // LP02 PreviewForm と同じ 4 項目
      lastName: String(fd.get("lastName") ?? "").trim(),
      firstName: String(fd.get("firstName") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      age: String(fd.get("age") ?? ""),
      birthdate: "",
      // 詳細項目は LP03 では収集しないため空文字 (スプシ列互換維持)
      location: "",
      timing: "",
      education: "",
      school: "",
      major: "",
      // 診断結果メタも空
      workplaceLabel: "",
      jobLabel: "",
      combinedLabel: "",
      subJobLabel1: "",
      subJobLabel2: "",
      salaryRange: "",
      // 広告流入元
      utm_source: utm.utm_source ?? "",
      utm_medium: utm.utm_medium ?? "",
      utm_campaign: utm.utm_campaign ?? "",
      utm_term: utm.utm_term ?? "",
      utm_content: utm.utm_content ?? "",
      utm_placement: utm.utm_placement ?? "",
    };

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
      router.push("/lp03/schedule");
    } catch {
      setError("送信に失敗しました。時間を置いて再度お試しください。");
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate={false}>
      <Field label="お名前" required>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            name="lastName"
            placeholder="姓"
            className={INPUT_CLS}
            required
            data-clarity-mask="true"
          />
          <input
            type="text"
            name="firstName"
            placeholder="名"
            className={INPUT_CLS}
            required
            data-clarity-mask="true"
          />
        </div>
      </Field>

      <Field label="電話番号" required>
        <input
          type="tel"
          name="phone"
          className={INPUT_CLS}
          required
          autoComplete="tel"
          inputMode="tel"
          data-clarity-mask="true"
        />
      </Field>

      <Field
        label="メールアドレス"
        required
        hint="カウンセリングのご案内に使用します"
      >
        <input
          type="email"
          name="email"
          className={INPUT_CLS}
          required
          autoComplete="email"
          data-clarity-mask="true"
        />
      </Field>

      <Field label="年齢" required>
        <select name="age" className={INPUT_CLS} required defaultValue="">
          <option value="" disabled>
            選択してください
          </option>
          {AGE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </Field>

      {/* 同意チェックボックスは廃止し、ボタンクリック = 同意 として扱う */}
      <p className="text-[11px] text-text-muted text-center leading-[1.6]">
        <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-primary underline"
        >
          個人情報取扱方針
        </a>
        に同意して、いますぐ無料で申し込む
      </p>

      <button
        type="submit"
        disabled={submitting}
        className="btn-cta-radar-orange group w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span className="relative z-10">
          {submitting ? "送信中…" : "いますぐ無料で申し込む"}
        </span>
        <span className="relative z-10 inline-block transition-transform group-hover:translate-x-1">
          ▶
        </span>
      </button>

      {error && (
        <p
          role="alert"
          className="text-accent-red text-[12px] text-center mt-2"
        >
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
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="inline-flex items-center gap-2 text-[13px] font-bold text-text-primary">
          {label}
          {required && (
            <span className="bg-accent-red text-white text-[10px] font-black px-1.5 py-0.5 rounded">
              必須
            </span>
          )}
        </span>
        {hint && (
          <span className="text-[11px] text-text-muted">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}
