"use client";

// LP02 リードフォーム (preview ページの最下部に置く)。
// 4 項目: 氏名 / 電話 / メール / 生年月日 (任意)
// 送信先:
//   - GAS Web App に stage="preview_unlocked" / lpVersion="lp02" で POST
//     (シートは LP01 と同じ、別タブで集計)
//   - sessionStorage("vc:entry") に同じ payload を保存 (詳細結果ページの
//     最下部 DetailsForm がここで埋めた値を引き継いで使う)
//   - /lp02/result/{resultId} に遷移して詳細結果ページを「解放」

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  buildResultMetaForSheet,
  isValidResultId,
  type StoredDiagnosis,
} from "@/lib/result-meta";
import { getStoredUtm } from "@/lib/utm";

const GAS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxdh39Lxmv0mQ55xzBU41OpZWykbVgq7pUouU83ieXMv9SzXQNWhBOxBiZ8kqeRqlZP/exec";

const DIAGNOSIS_STORAGE_KEY = "vc:diagnosis:answers";

const INPUT_CLS =
  "w-full border-2 border-border-default rounded-lg px-3 py-2.5 text-[14px] focus:border-brand-primary focus:outline-none bg-white";

// 年齢レンジの選択肢 (LP02 第1段リードフォーム用)。
// 第二新卒 (20代前半〜半ば) を中心としつつ、上下のレンジも収集対象に含める。
// シート / Slack には文字列として送られる (例: "23〜25歳")。
const AGE_OPTIONS = [
  "19歳以下",
  "20〜22歳",
  "23〜25歳",
  "26〜27歳",
  "28〜29歳",
  "30〜35歳",
  "36歳以上",
] as const;

function buildSheetMeta(resultId: string) {
  if (!isValidResultId(resultId)) return null;
  let distances;
  try {
    const raw = window.localStorage.getItem(DIAGNOSIS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredDiagnosis;
      distances = parsed?.debug?.jobDistances;
    }
  } catch {
    /* defaults で続行 */
  }
  return buildResultMetaForSheet(resultId, distances);
}

export function PreviewForm({ resultId }: { resultId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const fd = new FormData(event.currentTarget);
    const sheetMeta = buildSheetMeta(resultId);
    // 広告流入元 (UtmCapture が localStorage に保存した値)。
    // ここで取得して payload に含めないと、preview から後段の DetailsForm /
    // book/route.ts / GAS / Slack まで全部「流入元: 直接」になってしまう。
    const utm = getStoredUtm();

    const payload = {
      resultId,
      lpVersion: "lp02" as const,
      stage: "preview_unlocked" as const,
      lastName: String(fd.get("lastName") ?? ""),
      firstName: String(fd.get("firstName") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      // LP02 では生年月日を廃止し、年齢レンジに変更 (任意)。
      // 既存スプシ列との互換のため birthdate キーは空文字で送信。
      age: String(fd.get("age") ?? ""),
      birthdate: "",
      // 詳細結果ページの DetailsForm で埋める想定 (preview 時点では空)
      location: "",
      timing: "",
      education: "",
      school: "",
      // LP02 ではフォーム項目から除外
      major: "",
      // シート用日本語ラベル
      workplaceLabel: sheetMeta?.workplaceLabel ?? "",
      jobLabel: sheetMeta?.jobLabel ?? "",
      combinedLabel: sheetMeta?.combinedLabel ?? "",
      subJobLabel1: sheetMeta?.subJobLabel1 ?? "",
      subJobLabel2: sheetMeta?.subJobLabel2 ?? "",
      salaryRange: sheetMeta?.salaryRange ?? "",
      // 広告流入元 (UTM パラメータ) — Slack 通知 / GAS シート両方で使う
      utm_source: utm.utm_source ?? "",
      utm_medium: utm.utm_medium ?? "",
      utm_campaign: utm.utm_campaign ?? "",
      utm_term: utm.utm_term ?? "",
      utm_content: utm.utm_content ?? "",
      utm_placement: utm.utm_placement ?? "",
    };

    // /lp02/result/[id] と最下部 DetailsForm が再利用するため保存
    try {
      sessionStorage.setItem("vc:entry", JSON.stringify(payload));
    } catch {
      /* ignore */
    }

    try {
      // GAS スプシ + Slack 通知 (リード捕捉 1段目) を並行送信。
      // どちらも best-effort、Slack 失敗は遷移を妨げない。
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
      router.push(`/lp02/result/${resultId}`);
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
          data-clarity-mask="true"
        />
      </Field>

      <Field
        label="メールアドレス"
        required
        hint="診断結果のご案内に使用します"
      >
        <input
          type="email"
          name="email"
          className={INPUT_CLS}
          required
          data-clarity-mask="true"
        />
      </Field>

      <Field label="年齢" required>
        <select
          name="age"
          className={INPUT_CLS}
          required
          defaultValue=""
        >
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

      {/* 同意チェックボックスは廃止し、ボタンクリック = 同意 として扱う。
          リーガル説明文をボタン上に小さく明示 (privacy へのリンクのみ強調)。 */}
      <p className="text-[11px] text-text-muted text-center leading-[1.6]">
        <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-primary underline"
        >
          個人情報取扱方針
        </a>
        に同意にして、診断結果を見る
      </p>

      <button
        type="submit"
        disabled={submitting}
        className="btn-cta-radar-orange group w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span className="relative z-10">
          {submitting ? "解放中…" : "詳細な診断結果を見る"}
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
