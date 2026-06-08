"use client";

// 結果ページの申込フォーム (client component)
// フォーム入力を Google Apps Script の Web App エンドポイントに POST して
// Google スプレッドシートに記録した後、/schedule に遷移する。
//
// CORS 回避のため Content-Type: text/plain で送る。GAS 側で JSON.parse する。
// GAS から opaque response が返るが、ネットワークエラーがなければ成功扱い。

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

// 診断結果が保存される localStorage キー (lp01/diagnosis/page.tsx と同一)
const DIAGNOSIS_STORAGE_KEY = "vc:diagnosis:answers";

/**
 * シート連携用に「個人別 2 位 3 位」を含む日本語ラベル一式を組み立てる。
 * localStorage に jobDistances があればその人専用の 2 位 3 位、無ければ
 * results.ts に定義された defaults が使われる。
 */
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
    /* localStorage が無効でも defaults で続行 */
  }
  return buildResultMetaForSheet(resultId, distances);
}

const INPUT_CLS =
  "w-full border-2 border-border-default rounded-lg px-3 py-2.5 text-[14px] focus:border-brand-primary focus:outline-none bg-white";

export function EntryForm({ resultId }: { resultId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const fd = new FormData(event.currentTarget);
    // 個人別 2位3位 + 日本語ラベル一式 (シート連携用)
    // localStorage に診断結果があればその人専用、無ければ defaults。
    const sheetMeta = buildSheetMeta(resultId);
    // 広告流入元 (localStorage に保存された UTM パラメータ)
    const utm = getStoredUtm();
    // stage: GAS 側で「フォーム送信のみで離脱」と「予約完了」を区別するためのフラグ。
    // - "form_submitted": ここで送信される (このフォームを送信した時点)
    // - "booking_confirmed": /api/calendar/book で送信される (予約成立時)
    // 2026-06-08 簡素化: フォームの入力項目を 3 種類 (名前 / メール / 電話) に絞った。
    // 削除した項目は GAS シート互換維持のため空文字列で payload を埋める
    // (AGENTS.md の「新規フォーム作成チェックリスト」に従い、payload 構造は固定)。
    //
    // 重要: キー順は LP02 (PreviewForm / DetailsForm) と完全一致させる必要がある。
    // GAS 側はスプシのヘッダー列順に対応した形で書き込むため、age / birthdate /
    // location / timing / education / school / major の並びがズレるとヘッダーと
    // データ行の対応が崩れる (2026-06-08 のズレ事故の原因)。
    const payload = {
      resultId,
      lpVersion: "lp01" as const,
      stage: "form_submitted" as const,
      lastName: String(fd.get("lastName") ?? ""),
      firstName: String(fd.get("firstName") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      // LP01 では age (年齢レンジ) は収集しないが、LP02 とキー順を揃えるため空送信。
      age: "",
      birthdate: "",
      location: "",
      timing: "",
      education: "",
      school: "",
      major: "",
      // シート C 列〜向け: 日本語化済みラベル
      workplaceLabel: sheetMeta?.workplaceLabel ?? "",
      jobLabel: sheetMeta?.jobLabel ?? "",
      combinedLabel: sheetMeta?.combinedLabel ?? "",
      subJobLabel1: sheetMeta?.subJobLabel1 ?? "",
      subJobLabel2: sheetMeta?.subJobLabel2 ?? "",
      salaryRange: sheetMeta?.salaryRange ?? "",
      // シート U 列〜向け: 広告流入元 (UTM パラメータ)
      utm_source: utm.utm_source ?? "",
      utm_medium: utm.utm_medium ?? "",
      utm_campaign: utm.utm_campaign ?? "",
      utm_term: utm.utm_term ?? "",
      utm_content: utm.utm_content ?? "",
      utm_placement: utm.utm_placement ?? "",
    };

    // /schedule ページが SchedulePicker から再利用できるように sessionStorage に保存
    try {
      sessionStorage.setItem("vc:entry", JSON.stringify(payload));
    } catch {
      /* ignore: storage が使えない環境でも遷移は続ける */
    }

    try {
      // GAS スプシ + Slack 通知 (リード捕捉) を並行送信。
      // どちらも best-effort で、Slack 失敗は遷移を妨げない。
      await Promise.allSettled([
        fetch(GAS_ENDPOINT, {
          method: "POST",
          mode: "no-cors",
          // Content-Type: text/plain で CORS preflight を回避
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
        }),
        fetch("/api/lead-notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
      ]);
      // no-cors なので GAS の response は opaque (読み取れない)。
      // ネットワークエラーが出なければ送信成功とみなして遷移する。
      router.push("/lp01/schedule");
    } catch {
      setError("送信に失敗しました。時間を置いて再度お試しください。");
      setSubmitting(false);
    }
  }

  return (
    // data-clarity-mask: Microsoft Clarity にフォーム値を録画させない
    // (操作・フォーカス・クリックは記録され、入力値だけ ★ で伏せられる)
    <form
      className="mt-6 space-y-4"
      onSubmit={onSubmit}
      noValidate={false}
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
        hint="カウンセリングのご案内時に使用します"
      >
        <input type="email" name="email" className={INPUT_CLS} required />
      </Field>

      <Field
        label="電話番号"
        required
        hint="カウンセリングのご案内時に使用します"
      >
        <input type="tel" name="phone" className={INPUT_CLS} required />
      </Field>

      {/* 同意チェックボックスは廃止し、ボタンクリック = 同意 として扱う。
          リーガル説明文をボタン上に小さく明示。 */}
      <p className="text-[11px] text-text-muted text-center leading-[1.6]">
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
        className="btn-cta-radar-orange group w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span className="relative z-10">
          {submitting ? "送信中…" : "次へ進む"}
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

// =====================================================
// フィールド共通ラッパー
// ラベル + 必須バッジ (左) / hint (右寄せ)
// =====================================================
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
          <span className="text-[10.5px] text-text-muted text-right leading-tight">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
