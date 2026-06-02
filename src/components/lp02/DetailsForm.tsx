"use client";

// LP02 詳細フォーム (result ページの最下部に置く)。
// 4 項目: 希望勤務地 / 希望転職時期 / 最終学歴 / 学校名
// 前提:
//   - PreviewForm が sessionStorage("vc:entry") に氏名・電話・メール・生年月日を
//     保存している (LP02 の正常な動線を踏んでいれば必ず存在)
//   - sessionStorage が空の場合は preview から始めるよう案内
// 送信:
//   - GAS Web App に stage="form_submitted" / lpVersion="lp02" で POST
//   - sessionStorage("vc:entry") に詳細 4 項目をマージして保存
//   - /lp02/schedule に遷移して日程選択へ

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";

const GAS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxdh39Lxmv0mQ55xzBU41OpZWykbVgq7pUouU83ieXMv9SzXQNWhBOxBiZ8kqeRqlZP/exec";

const INPUT_CLS =
  "w-full border-2 border-border-default rounded-lg px-3 py-2.5 text-[14px] focus:border-brand-primary focus:outline-none bg-white";

type PreviewPayload = {
  resultId: string;
  lpVersion?: string;
  lastName?: string;
  firstName?: string;
  email?: string;
  phone?: string;
  birthdate?: string;
  workplaceLabel?: string;
  jobLabel?: string;
  combinedLabel?: string;
  subJobLabel1?: string;
  subJobLabel2?: string;
  salaryRange?: string;
};

export function DetailsForm({ resultId }: { resultId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMissing, setPreviewMissing] = useState(false);

  // preview ページで集めたフォーム値の有無を初回チェック
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("vc:entry");
      if (!raw) {
        setPreviewMissing(true);
        return;
      }
      const parsed = JSON.parse(raw) as PreviewPayload;
      if (!parsed.email) setPreviewMissing(true);
    } catch {
      setPreviewMissing(true);
    }
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    let previewPayload: PreviewPayload = { resultId };
    try {
      const raw = sessionStorage.getItem("vc:entry");
      if (raw) previewPayload = JSON.parse(raw) as PreviewPayload;
    } catch {
      /* fallback */
    }

    const fd = new FormData(event.currentTarget);
    const merged = {
      ...previewPayload,
      resultId,
      lpVersion: "lp02" as const,
      stage: "form_submitted" as const,
      location: String(fd.get("location") ?? ""),
      timing: String(fd.get("timing") ?? ""),
      education: String(fd.get("education") ?? ""),
      school: String(fd.get("school") ?? ""),
      // LP02 では major は収集しない
      major: previewPayload && "major" in previewPayload
        ? (previewPayload as Record<string, unknown>).major ?? ""
        : "",
    };

    try {
      sessionStorage.setItem("vc:entry", JSON.stringify(merged));
    } catch {
      /* ignore */
    }

    try {
      await fetch(GAS_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(merged),
      });
      router.push("/lp02/schedule");
    } catch {
      setError("送信に失敗しました。時間を置いて再度お試しください。");
      setSubmitting(false);
    }
  }

  if (previewMissing) {
    return (
      <div className="bg-white border border-brand-primary/30 rounded-2xl p-6 text-center">
        <p className="text-[14px] text-text-secondary leading-[1.8]">
          診断結果ページの解放情報が見つかりませんでした。
          <br />
          お手数ですがプレビューページから再度フォームを送信してください。
        </p>
      </div>
    );
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate={false}>
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
