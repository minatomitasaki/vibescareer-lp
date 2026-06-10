"use client";

// LP03 用の特典 CTA セクション (Section 9 / 15 で再利用)。
// Lp02BonusSection と中身は同じだが、画像 lp02-bonus-y2-salary.png の
// 上部 (約 9%) に「15秒診断を受けた方限定！」バッジが焼き込まれており、
// LP03 では 15秒診断を経由しないため不適切。CSS でバッジ部分だけクロップする。

import Image from "next/image";
import Link from "next/link";

// 画像高 1536px のうち上部 230px (≒ 15%) がバッジ + 上部余白 (緑系装飾) 部分。
// aspect-ratio で表示域を狭めて、画像を上にネガティブオフセットしてバッジを画面外に追いやる。
const BADGE_OFFSET_PCT = 15;
const ASPECT_W = 1024;
const ASPECT_H_CROPPED = 1536 - 230; // = 1306

export function Lp03BonusSection() {
  return (
    <section className="px-4 pt-8 pb-10 bg-[#ECFDF3]">
      <div className="mx-auto w-full max-w-[480px]">
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: `${ASPECT_W} / ${ASPECT_H_CROPPED}` }}
        >
          <Image
            src="/images/lp02-bonus-y2-salary.png"
            alt="VibesCareer の個別キャリア面談で適職×適正年収を実現。さらに VibesRadar 受検チケット (¥3,300 相当) も無料でプレゼント。"
            width={1024}
            height={1536}
            className="absolute inset-x-0 w-full h-auto block"
            style={{ top: `-${BADGE_OFFSET_PCT}%` }}
          />
        </div>
      </div>
      <div className="mt-2 flex flex-col items-center px-2">
        <div className="mb-3">
          <span className="cta-bubble-tip">相談だけでもOK</span>
        </div>
        <Link
          href="#form"
          className="btn-cta-radar group w-full max-w-[420px]"
        >
          <span className="relative z-10">無料カウンセリングを申し込む</span>
          <span className="relative z-10 inline-block transition-transform group-hover:translate-x-1">
            ▶
          </span>
        </Link>
      </div>
    </section>
  );
}
