"use client";

// LP05 専用の LINE 登録 CTA 群。
//
// LP05 の動線:
//   入口LP → 診断 → 診断中 → 詳細結果ページ(フル表示) → ここの LINE CTA で友だち追加
//
// LP04 と違い結果はモザイク(鍵)にせず全文表示する。CTA はあくまで
// 「LINE 登録して continued な情報/カウンセリングを受け取る」ための導線。
//
// LINE URL 解決は LP04 と共有 (resolveLp04LineUrl)。エルメ フリープランの
// QRコードアクション枠 (3 つ) を LP04 と共用しているため、当面は同じシナリオに
// 流入する。LP05 専用シナリオを発行したら resolveLp04LineUrl 側を差し替える。

import { useEffect } from "react";

// LP05 は結果パターン (12 種) に依らず単一の LINE 友だち追加 URL を使う。
// エルメのシナリオ別 URL ではなく 1 本に統一しているため、結果ページを 12 パターン
// 全てに展開できる。正式な LP05 用 URL に変わったら、ここだけ差し替える。
const LP05_LINE_URL = "https://line.me/R/ti/p/%40328atbsd";

/** GTM 連携用 dataLayer push (LP05 のクリックを LP04 と区別して計測) */
function pushLineClick(resultId: string, source: "inline" | "sticky" | "guide") {
  try {
    const w = window as unknown as { dataLayer?: Array<Record<string, unknown>> };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({
      event: "lp05_line_cta_click",
      source,
      resultId,
    });
    sessionStorage.setItem("vc:lp05:resultId", resultId);
  } catch {
    /* ignore */
  }
}

function LineGlyph({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 3C6.477 3 2 6.59 2 11c0 2.557 1.512 4.83 3.86 6.281-.143.527-.916 3.213-1.05 3.74-.16.642.234.633.49.46.2-.135 3.184-2.165 4.47-3.04.722.103 1.466.157 2.23.157 5.523 0 10-3.59 10-8s-4.477-8-10-8Zm-3.39 9.66h-2.07c-.297 0-.54-.24-.54-.54V8.9c0-.299.243-.54.54-.54.296 0 .54.241.54.54v2.68h1.53c.297 0 .54.24.54.54 0 .299-.243.54-.54.54Zm2.07-.54c0 .299-.243.54-.54.54-.296 0-.54-.241-.54-.54V8.9c0-.299.244-.54.54-.54.297 0 .54.241.54.54v3.22Zm5.18 0c0 .232-.149.439-.369.515-.058.02-.119.025-.18.025-.166 0-.327-.077-.428-.214l-2.14-2.918v2.591c0 .299-.244.54-.54.54-.297 0-.54-.241-.54-.54V8.9c0-.232.148-.438.369-.515.058-.02.118-.025.179-.025.166 0 .328.078.428.215l2.14 2.917V8.9c0-.299.244-.54.54-.54.297 0 .54.241.54.54v3.22Zm3.36-2.13c.297 0 .54.241.54.54 0 .298-.243.54-.54.54h-1.53v.59h1.53c.296 0 .54.242.54.54 0 .299-.244.54-.54.54h-2.07c-.296 0-.54-.241-.54-.54V8.9c0-.299.244-.54.54-.54h2.07c.296 0 .54.241.54.54 0 .298-.244.54-.54.54h-1.53v.59h1.53Z" />
    </svg>
  );
}

// =====================================================
// (1) ページ内 LINE CTA (結果ページ末尾セクションに配置)
//     大きな緑ボタン + 補足説明。
// =====================================================
export function Lp05InlineLineCta({ resultId }: { resultId: string }) {
  const url = LP05_LINE_URL;
  if (!url) return null;

  return (
    <div className="space-y-3">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => pushLineClick(resultId, "inline")}
        className="group flex items-center justify-center gap-2 w-full px-4 py-4 rounded-2xl bg-[#06C755] hover:bg-[#05B14B] text-white font-black text-[16px] sm:text-[18px] leading-none whitespace-nowrap shadow-[0_4px_12px_rgba(6,199,85,0.3)] transition-all"
      >
        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-white/20">
          <LineGlyph className="!h-5 !w-5" />
        </span>
        <span>LINE で無料相談を受け取る</span>
        <span className="inline-block transition-transform group-hover:translate-x-1">
          ▶
        </span>
      </a>

      <p className="text-center text-[11px] text-text-muted leading-[1.7]">
        友だち追加後、すぐにメッセージが届きます
        <br />
        <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-primary underline"
        >
          個人情報取扱方針
        </a>
        に同意の上、LINE で受け取る
      </p>
    </div>
  );
}

// =====================================================
// (2) 下部固定 LINE CTA (常時表示)
//     LP04 variant B (Lp04bStickyCta) と同じ見た目。
// =====================================================
// =====================================================
// (3) ガイド特典セクション用 CTA ボタン (ラベル可変)。
//     緑グラデの大きめ角丸ボタン + LINE アイコン。特典画像の下に独立配置する。
// =====================================================
export function Lp05GuideCta({
  resultId,
  children,
}: {
  resultId: string;
  children: React.ReactNode;
}) {
  const url = LP05_LINE_URL;
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => pushLineClick(resultId, "guide")}
      className="btn-cta-radar-line"
    >
      <span className="flex items-center justify-center h-7 w-7 rounded-full bg-white/25 shrink-0">
        <LineGlyph className="!h-5 !w-5" />
      </span>
      <span>{children}</span>
    </a>
  );
}

export function Lp05StickyCta({ resultId }: { resultId: string }) {
  const url = LP05_LINE_URL;

  useEffect(() => {
    try {
      sessionStorage.setItem("vc:lp05:resultId", resultId);
    } catch {
      /* ignore */
    }
  }, [resultId]);

  if (!url) return null;

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[480px] px-4 pt-7 pb-[calc(env(safe-area-inset-bottom)+16px)] bg-gradient-to-t from-white via-white/95 to-transparent">
      {/* LINE登録者限定ピル + 緑 radar ボタン (入口LP と同じデザイン) */}
      <div className="cta-radar-stack max-w-[330px] mx-auto">
        <div className="relative bg-white border-2 border-[#06C755] rounded-full px-5 py-1 text-[12px] font-black text-[#06A648] mb-[-13px] z-10 shadow-md">
          LINE登録者限定
          <span className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-[#06C755] rotate-45" />
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => pushLineClick(resultId, "sticky")}
          className="btn-cta-radar-line"
        >
          <span className="flex items-center justify-center h-7 w-7 rounded-full bg-white/25 shrink-0">
            <LineGlyph className="!h-5 !w-5" />
          </span>
          <span>
            「20代転職ガイド」を
            <br />
            いますぐ受け取る！
          </span>
        </a>
      </div>
    </div>
  );
}
