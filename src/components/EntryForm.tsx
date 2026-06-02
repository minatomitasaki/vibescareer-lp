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

// 生年月日入力のデフォルト値。第二新卒 (23〜26歳) の中央値である 24 歳の
// 生年に合わせる。月日は 1/1 固定にすることで「デフォルト値」と一目で
// わかるようにし、ユーザーが必ず自分の誕生日に書き換えるよう促す。
const DEFAULT_BIRTHDATE = `${new Date().getFullYear() - 24}-01-01`;

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
    const payload = {
      resultId,
      lpVersion: "lp01" as const,
      stage: "form_submitted" as const,
      lastName: String(fd.get("lastName") ?? ""),
      firstName: String(fd.get("firstName") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      location: String(fd.get("location") ?? ""),
      timing: String(fd.get("timing") ?? ""),
      birthdate: String(fd.get("birthdate") ?? ""),
      education: String(fd.get("education") ?? ""),
      school: String(fd.get("school") ?? ""),
      major: String(fd.get("major") ?? ""),
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
        hint="VibesRadarのご案内時に使用します"
      >
        <input type="email" name="email" className={INPUT_CLS} required />
      </Field>

      <Field
        label="電話番号"
        required
        hint="VibesRadarのご案内時に使用します"
      >
        <input type="tel" name="phone" className={INPUT_CLS} required />
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

      <Field label="生年月日" required>
        {/* iOS Safari の input[type=date] は -webkit-appearance の最小コンテンツ幅で
            親をはみ出すため、appearance-none と min-w-0 で width:100% を効かせる */}
        <input
          type="date"
          name="birthdate"
          defaultValue={DEFAULT_BIRTHDATE}
          className={`${INPUT_CLS} appearance-none min-w-0`}
          required
        />
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
        />
      </Field>

      <Field label="専攻学科" required>
        <input
          type="text"
          name="major"
          placeholder="例:経済学部 経営学科"
          className={INPUT_CLS}
          required
        />
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
