"use client";

// 結果 LP の特典 CTA セクション (Section 5 / 9 / 15 で再利用)。
//
// A/B バリアント:
//   - "a" (デフォルト): VibesRadar 無料チケット ¥3,300 → ¥0 訴求
//       variant ごとにリボン文言の焼き込み画像を切替:
//         primary / secondary → result-radar-bonus.png
//         tertiary             → result-radar-bonus-self.png
//   - "b" (?v=b でアクティブ): 個別キャリア面談 ¥9,980 → ¥0 訴求
//       全 variant 共通で result-meeting-bonus.png (1 枚)
//
// 切替は URL クエリ `?v=b` で行う (useSearchParams)。

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

type Props = {
  variant: "primary" | "secondary" | "tertiary";
};

export function RadarBonusSection({ variant }: Props) {
  const searchParams = useSearchParams();
  const version: "a" | "b" = searchParams.get("v") === "b" ? "b" : "a";

  if (version === "b") {
    return (
      <section className="px-4 pt-8 pb-10 bg-[#FFF7ED]">
        <div className="flex justify-center">
          <Image
            src="/images/result-meeting-bonus.png"
            alt="本来 9,980 円の個別キャリア面談を、本ページからのお申込み限定で無料でご案内。プロのキャリアアドバイザーが 1 対 1 で伴走。"
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
            <span className="relative z-10">個別面談を予約する</span>
            <span className="relative z-10 inline-block transition-transform group-hover:translate-x-1">
              ▶
            </span>
          </Link>
        </div>
      </section>
    );
  }

  // A 版 (既存ロジックを踏襲)
  const isSelfAnalysis = variant === "tertiary";
  const imageSrc = isSelfAnalysis
    ? "/images/result-radar-bonus-self.png"
    : "/images/result-radar-bonus.png";
  const altText = isSelfAnalysis
    ? "まずは VibesRadar で自己分析。次世代型パーソナルWeb診断で 8 つのポテンシャルタイプ・全 48 項目・ネガティブアラート 5 つを可視化。"
    : "15秒診断を受けた方限定で無料配布。VibesRadar の無料チケット ¥3,300 → ¥0。次世代型パーソナルWeb診断で 8 つのポテンシャルタイプ・全 48 項目・ネガティブアラート 5 つを可視化。";

  return (
    // 画像と CTA を 1 つの CTA セクションとして、画像の背景色 (#ECFDF3) と
    // 同じミント緑で section 全体を塗って白い間隙を消す。
    <section className="px-4 pt-8 pb-10 bg-[#ECFDF3]">
      <div className="flex justify-center">
        <Image
          src={imageSrc}
          alt={altText}
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
          <span className="relative z-10">無料チケットを受け取る</span>
          <span className="relative z-10 inline-block transition-transform group-hover:translate-x-1">
            ▶
          </span>
        </Link>
      </div>
    </section>
  );
}
