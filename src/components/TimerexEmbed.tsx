"use client";

// TimeRex 予約ウィジェットの公式埋め込みコードを React で扱う client component。
//   https://asset.timerex.net/js/embed.js を読み込み、
//   #timerex_calendar 要素の data-url の TimeRex 予約ページを iframe で展開する。
//
// onBookingCompleteRedirect を渡すと、TimerexCalendar({ onBookingComplete: ... })
// にコールバックを登録し、予約完了時にその URL へ遷移する。
//
// 同ページに 1 つしか置けない (#timerex_calendar の id を使うため)。

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    TimerexCalendar?: (options?: { onBookingComplete?: () => void }) => void;
  }
}

type Props = {
  url: string;
  /** 予約完了後に遷移させたい URL (例: "/thanks") */
  onBookingCompleteRedirect?: string;
};

export function TimerexEmbed({ url, onBookingCompleteRedirect }: Props) {
  // 初期化関数。Script onLoad と useEffect の両方から呼ばれるが、TimerexCalendar 側で
  // 多重初期化されないよう作られている前提 (公式コードの方式)。
  function initTimerex() {
    if (typeof window === "undefined" || !window.TimerexCalendar) return;
    window.TimerexCalendar({
      onBookingComplete: onBookingCompleteRedirect
        ? () => {
            window.location.href = onBookingCompleteRedirect;
          }
        : undefined,
    });
  }

  // Script onLoad より後にこの component が再マウントされた場合のフォールバック
  useEffect(() => {
    initTimerex();
    // initTimerex は安定 (props 依存) なので依存配列は意図的にこの値だけ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onBookingCompleteRedirect]);

  return (
    <>
      <div id="timerex_calendar" data-url={url} />
      <Script
        id="timerex_embed"
        src="https://asset.timerex.net/js/embed.js"
        strategy="afterInteractive"
        onLoad={initTimerex}
      />
    </>
  );
}
