"use client";

// LP04 詳細フォーム (result ページの最下部に置く)。
// LP02 と違って preview 段で個人情報を取らない (LINE 登録のみ) ため、
// result ページで氏名・電話・メール・年齢 + 希望勤務地 + 希望転職時期 +
// 最終学歴 + 学校名 を 1 段で全部入力させる。
//
// 送信:
//   - GAS Web App に stage="form_submitted" / lpVersion="lp04" で POST
//   - sessionStorage("vc:entry") に保存
//   - /lp04/schedule に遷移して日程選択へ

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getStoredUtm } from "@/lib/utm";

const GAS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxdh39Lxmv0mQ55xzBU41OpZWykbVgq7pUouU83ieXMv9SzXQNWhBOxBiZ8kqeRqlZP/exec";

const INPUT_CLS =
  "w-full border-2 border-border-default rounded-lg px-3 py-2.5 text-[14px] focus:border-brand-primary focus:outline-none bg-white";

const AGE_OPTIONS = [
  "19歳以下",
  "20〜22歳",
  "23〜25歳",
  "26〜27歳",
  "28〜29歳",
  "30〜35歳",
  "36歳以上",
] as const;

export function Lp04DetailsForm({ resultId }: { resultId: string }) {
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
      resultId,
      lpVersion: "lp04" as const,
      stage: "form_submitted" as const,
      lastName: String(fd.get("lastName") ?? "").trim(),
      firstName: String(fd.get("firstName") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      age: String(fd.get("age") ?? ""),
      birthdate: "",
      location: String(fd.get("location") ?? ""),
      timing: String(fd.get("timing") ?? ""),
      education: String(fd.get("education") ?? ""),
      school: String(fd.get("school") ?? "").trim(),
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
      router.push("/lp04/schedule");
    } catch {
      setError("送信に失敗しました。時間を置いて再度お試しください。");
      setSubmitting(false);
    }
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate={false}>
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

      <Field label="希望勤務地" required>
        <select name="location" className={INPUT_CLS} required defaultValue="">
          <option value="" disabled>
            選択してください
          </option>
          <option>全国どこでも</option>
          <option>関東(東京・神奈川・千葉・埼玉)</option>
          <option>関西(大阪・京都・兵庫・奈良)</option>
          <option>中部・東海(愛知・静岡・岐阜)</option>
          <option>北海道・東北</option>
          <option>中国・四国</option>
          <option>九州・沖縄</option>
          <option>海外</option>
          <option>未定・相談したい</option>
        </select>
      </Field>

      <Field label="希望転職時期" required>
        <select name="timing" className={INPUT_CLS} required defaultValue="">
          <option value="" disabled>
            選択してください
          </option>
          <option>すぐにでも転職したい</option>
          <option>3ヶ月以内</option>
          <option>半年以内</option>
          <option>1年以内</option>
          <option>まだ決めていない</option>
        </select>
      </Field>

      <Field label="最終学歴" required>
        <select name="education" className={INPUT_CLS} required defaultValue="">
          <option value="" disabled>
            選択してください
          </option>
          <option value="高卒">高卒</option>
          <option value="短大卒">短大卒</option>
          <option value="専門学校卒">専門学校卒</option>
          <option value="大学卒">大学卒</option>
          <option value="大学院卒">大学院卒</option>
          <option value="その他">その他</option>
        </select>
      </Field>

      <Field label="学校名" required>
        <input
          type="text"
          name="school"
          placeholder="例:○○大学"
          className={INPUT_CLS}
          required
          data-clarity-mask="true"
        />
      </Field>

      <p className="text-[11px] text-text-muted text-center leading-[1.6]">
        <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-primary underline"
        >
          個人情報取扱方針
        </a>
        に同意して、次へ
      </p>

      <button
        type="submit"
        disabled={submitting}
        className="btn-cta-radar-orange group w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span className="relative z-10">
          {submitting ? "送信中…" : "次へ"}
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
