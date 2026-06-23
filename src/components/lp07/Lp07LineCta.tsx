"use client";

// LP07 専用の LINE 登録 CTA 群。
//
// LP07 は診断ファネルを持たず、広告クリックで直接ランディングする 1 枚 LP。
// LINE 登録で「20代転職ガイド」(ホワイトペーパー) を配布する導線は LP05 と共通。
// 計測は LP05 と区別するため dataLayer イベントを `lp07_line_cta_click` にする
// (Meta カスタムコンバージョン「LP07_LINE登録」用)。
//
// LINE URL は結果パターンに依らず単一 (LP05 と同じ友だち追加 URL)。

import { useEffect } from "react";

const LP07_LINE_URL = "https://line.me/R/ti/p/%40328atbsd";

/** GTM 連携用 dataLayer push (LP07 のクリックを LP05 等と区別して計測) */
function pushLineClick(source: "fv" | "guide" | "sticky") {
  try {
    const w = window as unknown as { dataLayer?: Array<Record<string, unknown>> };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event: "lp07_line_cta_click", source });
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
// (1) 本文用 CTA ボタン (入口LP風 radar デザイン・LINE緑)。ラベル可変。
// =====================================================
export function Lp07GuideCta({
  children,
  source = "guide",
}: {
  children: React.ReactNode;
  source?: "fv" | "guide";
}) {
  return (
    <a
      href={LP07_LINE_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => pushLineClick(source)}
      className="btn-cta-radar-line"
    >
      <span className="flex items-center justify-center h-7 w-7 rounded-full bg-white/25 shrink-0">
        <LineGlyph className="!h-5 !w-5" />
      </span>
      <span>{children}</span>
    </a>
  );
}

// =====================================================
// (2) 下部固定 CTA (常時表示)。LINE登録者限定ピル + 緑 radar ボタン。
// =====================================================
export function Lp07StickyCta() {
  useEffect(() => {
    /* 表示計測などが必要になればここで */
  }, []);

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[480px] px-4 pt-7 pb-[calc(env(safe-area-inset-bottom)+16px)] bg-gradient-to-t from-white via-white/95 to-transparent">
      <div className="cta-radar-stack max-w-[330px] mx-auto">
        <div className="relative bg-white border-2 border-[#06C755] rounded-full px-5 py-1 text-[12px] font-black text-[#06A648] mb-[-13px] z-10 shadow-md">
          LINE登録者限定
          <span className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-[#06C755] rotate-45" />
        </div>
        <a
          href={LP07_LINE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => pushLineClick("sticky")}
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
