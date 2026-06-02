"use client";

// LP02 preview ページの「診断セクション」と「フォーム CTA」の間に挟む
// 心理ブースター。
//
//   「おめでとうございます！
//    あなたには同世代の上位 〇% の年収を狙えるポテンシャルがあります！」
//
// 〇% は 17〜23% の中からランダム。
// SSR と Client で hydration mismatch を起こさないため、SSR デフォルトを
// 20% にしておき、クライアントマウント後 useEffect で 17-23% の乱数に
// 置き換える (一瞬数字が変わるが許容範囲、ユーザー体験的にも「自分の値が
// 算出された」感が出る)。

import { useEffect, useState } from "react";

const MIN_RANK = 17;
const MAX_RANK = 23;

function randomRank(): number {
  return Math.floor(Math.random() * (MAX_RANK - MIN_RANK + 1)) + MIN_RANK;
}

export function PotentialRankBanner() {
  const [rank, setRank] = useState(20);
  useEffect(() => {
    setRank(randomRank());
  }, []);

  return (
    <section className="px-4 py-8 bg-bg-cream">
      <div className="relative rounded-3xl border-2 border-brand-primary/35 bg-white shadow-[0_8px_24px_rgba(255,107,0,0.10)] overflow-hidden">
        {/* 上端のオレンジ装飾帯 */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-primary-light via-brand-primary to-brand-primary-light" />

        {/* 装飾用の薄い ✦ スパークル (左上 / 右下) */}
        <span
          aria-hidden
          className="absolute top-3 left-3 text-brand-primary/30 text-[18px]"
        >
          ✦
        </span>
        <span
          aria-hidden
          className="absolute bottom-3 right-3 text-brand-primary/30 text-[18px]"
        >
          ✦
        </span>

        <div className="px-6 py-7 text-center">
          {/* おめでとうリード */}
          <p className="inline-flex items-center gap-1.5 text-[13px] font-black text-brand-primary tracking-wider">
            <span aria-hidden>🎉</span>
            <span>CONGRATULATIONS</span>
            <span aria-hidden>🎉</span>
          </p>
          <p className="mt-2 text-[17px] font-black text-text-primary">
            おめでとうございます！
          </p>

          {/* 上位 N% メインキャッチ */}
          <p className="mt-4 text-[14px] leading-[1.85] text-text-secondary">
            あなたには同世代の
          </p>
          <p className="mt-1 flex items-baseline justify-center gap-1">
            <span className="text-[15px] font-bold text-text-primary">上位</span>
            <span className="text-[56px] font-black text-brand-primary leading-none tracking-tight tabular-nums">
              {rank}
            </span>
            <span className="text-[28px] font-black text-brand-primary leading-none">
              %
            </span>
          </p>
          <p className="mt-2 text-[14px] leading-[1.85] text-text-secondary">
            の年収を狙えるポテンシャルがあります！
          </p>
        </div>
      </div>
    </section>
  );
}
