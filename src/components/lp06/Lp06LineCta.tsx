"use client";

// LP06 専用の LINE 登録 CTA。
//
// LP06 は「日本一ズル賢い転職」LP。LINE 友だち追加 (エルメ) へ誘導する。
// 計測は他LPと区別するため dataLayer イベントを `lp06_line_cta_click` にする
// (GTM の「LINE登録ボタンクリック」トリガー → Meta カスタムCV「LP06_LINE登録」用)。
//
// ※ ページ (lp06/page.tsx) は metadata を持つサーバーコンポーネントなので、
//   onClick を扱うこの CTA だけをクライアントコンポーネントとして分離している。

const LP06_LINE_URL =
  "https://s.lmes.jp/landing-qr/2010430660-JaImwgX3?uLand=xJhGY8";

/** GTM 連携用 dataLayer push (LP06 のクリックを他LPと区別して計測) */
function pushLineClick(source: string) {
  try {
    const w = window as unknown as { dataLayer?: Array<Record<string, unknown>> };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event: "lp06_line_cta_click", source });
  } catch {
    /* ignore */
  }
}

// =============================================================================
// CTA ボタン (黒地に映える緑グラデのピル)
// =============================================================================
export function Lp06CtaButton({
  label = "LINEで申し込む",
  source = "body",
}: {
  label?: string;
  source?: string;
}) {
  return (
    <div className="flex flex-col items-center">
      {/* 希少性の煽り (＼ … ／ 明滅) */}
      <div className="lp06-blink mb-3 flex items-center gap-2.5 text-[19px] font-black text-[#E8C766]">
        <span aria-hidden>＼</span>
        枠が埋まる前に、今すぐ
        <span aria-hidden>／</span>
      </div>

      {/* パルスリング + 上下フロート のラッパー */}
      <div className="lp06-cta-ring lp06-cta-float relative w-full max-w-[340px] rounded-full">
        <a
          href={LP06_LINE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => pushLineClick(source)}
          className="lp06-cta-shine group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-b from-[#27D873] to-[#06C755] px-6 py-4 text-center text-[18px] font-black text-white shadow-[0_8px_26px_rgba(6,199,85,0.5)] transition-transform active:scale-[0.97]"
        >
          <LineIcon />
          <span className="relative z-10">{label}</span>
          <span className="lp06-cta-arrow relative z-10 inline-block">▶</span>
        </a>
      </div>

      {/* 補助テキスト */}
      <p className="mt-4 text-[12px] tracking-wider text-white/55">
        相談・診断はすべて無料／全国どこでもオンライン対応
      </p>
    </div>
  );
}

// =============================================================================
// LINE アイコン (吹き出しシルエット)
// =============================================================================
function LineIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`${className} flex-shrink-0 text-white`}
      aria-hidden
    >
      <path d="M12 2C6.48 2 2 5.74 2 10.5c0 4.27 3.56 7.84 8.37 8.52.33.07.77.22.88.5.1.26.07.66.03.92l-.13.85c-.04.25-.2 1 .88.55 1.08-.46 5.81-3.42 7.93-5.86C21.34 14.18 22 12.46 22 10.5 22 5.74 17.52 2 12 2Zm-3.4 11.18H6.94a.45.45 0 0 1-.45-.45V9.3a.45.45 0 0 1 .9 0v2.98h1.21a.45.45 0 0 1 0 .9Zm1.86-.45a.45.45 0 0 1-.9 0V9.3a.45.45 0 0 1 .9 0v3.43Zm4.13 0a.45.45 0 0 1-.31.43h-.14a.45.45 0 0 1-.36-.18l-1.76-2.39v2.14a.45.45 0 0 1-.9 0V9.3a.45.45 0 0 1 .31-.43h.14a.45.45 0 0 1 .36.18l1.76 2.39V9.3a.45.45 0 0 1 .9 0v3.43Zm2.9-2.17a.45.45 0 0 1 0 .9h-1.21v.77h1.21a.45.45 0 0 1 0 .9h-1.66a.45.45 0 0 1-.45-.45V9.3a.45.45 0 0 1 .45-.45h1.66a.45.45 0 0 1 0 .9h-1.21v.78h1.21Z" />
    </svg>
  );
}
