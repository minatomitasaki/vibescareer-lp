"use client";

// LP04 variant B (/lp04-b/preview/[id]) 専用の CTA 群。
//
// (1) Lp04bUnlockBadge: モザイク部分に重ねる「🔒 ○○を見る」バッジ。
//     クリックで resultId に対応する LINE 友だち追加 URL (別タブ) を開く。
// (2) Lp04bStickyCta: 下部固定 CTA。オレンジ丸「10秒で完了！」+ 緑 LINE ボタン
//     (立体感 + 入口LP と同じ波動リングで視線誘導。.lp04b-line-cta クラス)。
//
// LINE URL 解決は variant A と共有 (Lp04LineCta の resolveLp04LineUrl)。

import { useEffect } from "react";
import { resolveLp04LineUrl } from "./Lp04LineCta";

/** GTM 連携用 dataLayer push + result ページ計測連動のための resultId 保存 */
function pushLineClick(resultId: string, source: "badge" | "sticky") {
  try {
    const w = window as unknown as { dataLayer?: Array<Record<string, unknown>> };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({
      event: "lp04_line_cta_click",
      variant: "b",
      source,
      resultId,
    });
    sessionStorage.setItem("vc:lp04:resultId", resultId);
  } catch {
    /* ignore */
  }
}

function ArrowRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="13 6 19 12 13 18" />
    </svg>
  );
}

/** モザイク部分に重ねる「🔒 ○○を見る」バッジ。クリックで LINE URL を別タブで開く。 */
export function Lp04bUnlockBadge({
  resultId,
  size = "md",
  label = "続きを見る",
}: {
  resultId: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const url = resolveLp04LineUrl(resultId);
  if (!url) return null;

  const cls =
    size === "lg"
      ? "px-4 py-2 text-[15px]"
      : size === "sm"
        ? "px-3 py-1.5 text-[12px]"
        : "px-3.5 py-1.5 text-[13.5px]";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => pushLineClick(resultId, "badge")}
      aria-label={label}
      className="group/badge absolute inset-0 flex items-center justify-center cursor-pointer"
    >
      <span
        className={`bg-white/90 backdrop-blur-sm rounded-full font-black text-brand-primary border border-brand-primary/45 shadow-md inline-flex items-center gap-1.5 transition-transform group-hover/badge:scale-105 group-active/badge:scale-95 ${cls}`}
      >
        <span aria-hidden>🔒</span>
        {label}
        <ArrowRightIcon className="transition-transform group-hover/badge:translate-x-0.5" />
      </span>
    </a>
  );
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

export function Lp04bStickyCta({ resultId }: { resultId: string }) {
  const url = resolveLp04LineUrl(resultId);

  useEffect(() => {
    try {
      sessionStorage.setItem("vc:lp04:resultId", resultId);
    } catch {
      /* ignore */
    }
  }, [resultId]);

  if (!url) return null;

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[480px] px-4 pt-8 pb-[calc(env(safe-area-inset-bottom)+26px)] bg-gradient-to-t from-white via-white/95 to-transparent">
      {/* ボタン幅に合わせた中央寄せラッパー。オレンジ丸はこのボタン左上に重ねる。 */}
      <div className="relative mx-auto w-[86%] max-w-[330px]">
        {/* 緑の LINE ボタン (立体 + パルス: .lp04b-line-cta) */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => pushLineClick(resultId, "sticky")}
          className="lp04b-line-cta flex items-center justify-center gap-1.5 w-full px-4 py-[15px] text-white font-black text-[18px] leading-none whitespace-nowrap no-underline"
        >
          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-white/20">
            <LineGlyph className="!h-5 !w-5" />
          </span>
          <span>LINEで詳しい結果を見る</span>
        </a>

        {/* オレンジ丸「10秒で完了！」: ボタン左上にかぶせる */}
        <div className="absolute -top-5 -left-1 z-10 flex h-[46px] w-[46px] flex-col items-center justify-center rounded-full bg-brand-primary text-white shadow-md leading-none border-2 border-white">
          <span className="text-[13px] font-black">10秒</span>
          <span className="mt-[1px] text-[8.5px] font-bold">で完了！</span>
        </div>
      </div>
    </div>
  );
}
