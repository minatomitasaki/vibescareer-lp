"use client";

// TimeRex 予約ウィジェットの公式埋め込みコードを React で扱う client component。
//   https://asset.timerex.net/js/embed.js を読み込み、
//   #timerex_calendar 要素の data-url の TimeRex 予約ページを iframe で展開する。
//
// 同ページに 1 つしか置けない (#timerex_calendar の id を使うため)。

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    TimerexCalendar?: () => void;
  }
}

export function TimerexEmbed({ url }: { url: string }) {
  // 何らかの理由で Script の onLoad より後にこの component が再マウントされた場合のために、
  // 既にロード済みの TimerexCalendar() を再実行できるようにしておく。
  useEffect(() => {
    if (typeof window !== "undefined" && window.TimerexCalendar) {
      window.TimerexCalendar();
    }
  }, []);

  return (
    <>
      <div id="timerex_calendar" data-url={url} />
      <Script
        id="timerex_embed"
        src="https://asset.timerex.net/js/embed.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== "undefined" && window.TimerexCalendar) {
            window.TimerexCalendar();
          }
        }}
      />
    </>
  );
}
