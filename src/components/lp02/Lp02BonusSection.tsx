"use client";

// LP02 result/[id] 用の特典 CTA セクション (Section 5 / 9 / 15 で再利用)。
// LP01 の RadarBonusSection (VibesRadar 単体訴求) と違い、メイン訴求は
// VibesCareer の個別キャリア面談 (「適職×適正年収を実現する」)、
// 補足で VibesRadar 無料チケットも特典として併載する Y2 案。
//
// 画像は public/images/lp02-bonus-y2-salary.png (1024x1536 緑系) 固定。
// クリックで #form (LP02 では DetailsForm = 詳細フォーム) にスムーズスクロール。

import Image from "next/image";
import Link from "next/link";

export function Lp02BonusSection() {
  return (
    <section className="px-4 pt-8 pb-10 bg-[#ECFDF3]">
      <div className="flex justify-center">
        <Image
          src="/images/lp02-bonus-y2-salary.png"
          alt="VibesCareer の個別キャリア面談で適職×適正年収を実現。さらに VibesRadar 受検チケット (¥3,300 相当) も無料でプレゼント。"
          width={1024}
          height={1536}
          className="w-full h-auto max-w-[480px] block"
        />
      </div>
      <div className="mt-2 flex justify-center px-2">
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
