"use client";

// LP04 preview ページに表示する LINE 登録 CTA。
// 診断結果 (12 パターン) に応じてエルメで発行した「シナリオ別友だち追加 URL」を出し分ける。
//
// 動線:
//   ユーザーが LP04 preview ページでこのボタンをタップ
//   → エルメの該当シナリオで LINE 友だち追加
//   → エルメから自動応答で「あなたの詳細結果はこちら → /lp04/result/[id]」が届く
//   → ユーザーがその URL をタップして詳細結果ページへ
//
// LINE_URLS_BY_RESULT は初期はプレースホルダーで、エルメ側で 12 シナリオの
// 友だち追加 URL を発行したら順次置き換えていく。未設定の resultId は
// FALLBACK_URL (公式 LINE のシナリオ未指定の URL) に飛ばす。

import { useEffect } from "react";
import type { ResultId } from "@/data/results";

// 12 シナリオ別 友だち追加 URL (エルメ管理画面で発行 → ここに貼り付け)
// プレースホルダーのうちは FALLBACK_URL に強制フォールバック。
const LINE_URLS_BY_RESULT: Record<ResultId, string> = {
  "creative-speed":  "PLACEHOLDER_creative-speed",
  "creative-stable": "PLACEHOLDER_creative-stable",
  "support-speed":   "PLACEHOLDER_support-speed",
  "support-stable":  "PLACEHOLDER_support-stable",
  "marketing-speed": "PLACEHOLDER_marketing-speed",
  "marketing-stable":"PLACEHOLDER_marketing-stable",
  "planning-speed":  "PLACEHOLDER_planning-speed",
  "planning-stable": "PLACEHOLDER_planning-stable",
  "engineer-speed":  "PLACEHOLDER_engineer-speed",
  "engineer-stable": "PLACEHOLDER_engineer-stable",
  "sales-speed":     "PLACEHOLDER_sales-speed",
  "sales-stable":    "PLACEHOLDER_sales-stable",
};

// プレースホルダー段階や未登録 resultId 用のフォールバック
// (公式 LINE のメインアカウント追加 URL に飛ばす想定)。
const FALLBACK_URL = "https://line.me/R/ti/p/@vibescareer";

function resolveUrl(resultId: string): string {
  const url = LINE_URLS_BY_RESULT[resultId as ResultId];
  if (!url || url.startsWith("PLACEHOLDER")) return FALLBACK_URL;
  return url;
}

export function Lp04LineCta({ resultId }: { resultId: string }) {
  const url = resolveUrl(resultId);

  // 計測用 dataLayer push (GTM「LINE登録ボタンクリック」トリガーで使う)
  useEffect(() => {
    // sessionStorage に resultId を保存して、後で result ページに来たときの計測連動に使う
    try {
      sessionStorage.setItem("vc:lp04:resultId", resultId);
    } catch {
      /* ignore */
    }
  }, [resultId]);

  function onClick() {
    try {
      const w = window as unknown as { dataLayer?: Array<Record<string, unknown>> };
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({
        event: "lp04_line_cta_click",
        resultId,
      });
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-3">
      {/* LINE 緑ブランド色のボタン */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="group flex items-center justify-center gap-2 w-full px-6 py-4 rounded-2xl bg-[#06C755] hover:bg-[#05B14B] text-white font-black text-[17px] leading-none shadow-[0_4px_12px_rgba(6,199,85,0.3)] transition-all"
      >
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M12 3C6.477 3 2 6.59 2 11c0 2.557 1.512 4.83 3.86 6.281-.143.527-.916 3.213-1.05 3.74-.16.642.234.633.49.46.2-.135 3.184-2.165 4.47-3.04.722.103 1.466.157 2.23.157 5.523 0 10-3.59 10-8s-4.477-8-10-8Zm-3.39 9.66h-2.07c-.297 0-.54-.24-.54-.54V8.9c0-.299.243-.54.54-.54.296 0 .54.241.54.54v2.68h1.53c.297 0 .54.24.54.54 0 .299-.243.54-.54.54Zm2.07-.54c0 .299-.243.54-.54.54-.296 0-.54-.241-.54-.54V8.9c0-.299.244-.54.54-.54.297 0 .54.241.54.54v3.22Zm5.18 0c0 .232-.149.439-.369.515-.058.02-.119.025-.18.025-.166 0-.327-.077-.428-.214l-2.14-2.918v2.591c0 .299-.244.54-.54.54-.297 0-.54-.241-.54-.54V8.9c0-.232.148-.438.369-.515.058-.02.118-.025.179-.025.166 0 .328.078.428.215l2.14 2.917V8.9c0-.299.244-.54.54-.54.297 0 .54.241.54.54v3.22Zm3.36-2.13c.297 0 .54.241.54.54 0 .298-.243.54-.54.54h-1.53v.59h1.53c.296 0 .54.242.54.54 0 .299-.244.54-.54.54h-2.07c-.296 0-.54-.241-.54-.54V8.9c0-.299.244-.54.54-.54h2.07c.296 0 .54.241.54.54 0 .298-.244.54-.54.54h-1.53v.59h1.53Z" />
        </svg>
        <span>LINE で診断結果を受け取る</span>
        <span className="inline-block transition-transform group-hover:translate-x-1">
          ▶
        </span>
      </a>

      {/* 補足説明 */}
      <p className="text-center text-[11px] text-text-muted leading-[1.7]">
        友だち追加後、すぐに詳細結果のメッセージが届きます
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
