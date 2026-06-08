"use client";

// LP01 result/[id] 用の特典 CTA セクション (Section 5 / 9 / 15 で再利用)。
//
// 2026-06-08 統合: LP02 (Lp02BonusSection) と同じ見た目・文言に統一。
//   - 旧 A/B variant (radar チケット訴求 "a" / 個別面談訴求 "b") を廃止
//   - variant prop (primary/secondary/tertiary) も廃止 (画像/文言は全箇所共通に)
//   - 「相談だけでもOK」吹き出し付き CTA
//   - クリックで #form (EntryForm) にスムーズスクロール
//
// 旧画像 (result-radar-bonus.png / result-radar-bonus-self.png / result-meeting-bonus.png)
// はこの統合で使用しなくなるが、将来差し戻す可能性があるため public/images からは削除していない。

import Image from "next/image";
import Link from "next/link";

export function RadarBonusSection() {
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
