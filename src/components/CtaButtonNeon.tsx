import Link from "next/link";

// =====================================================
// CTA バリアント B: ネオン・ダーク・ハイテク調
//
// 方向性:
//   - 反転発想で背景をダーク化、ネオンオレンジで発光させる
//   - AI / Tech 文脈を匂わせて「最先端のアルゴリズム」感を演出
//   - 矢印を 3 連で連続フラッシュさせて視線誘導
//   - 下のミニピル (FREE / 15s / AI) はモノスペース風でデータ感
// =====================================================
export function CtaButtonNeon({
  withPulse = false,
  trustLine,
}: {
  withPulse?: boolean;
  trustLine?: string;
}) {
  return (
    <div className="flex flex-col items-center">
      {trustLine && (
        <div className="slash-headline mb-4">
          <span className="slash">＼</span>
          <span className="text-[13px] font-black text-text-primary leading-tight">
            {trustLine}
          </span>
          <span className="slash">／</span>
        </div>
      )}

      {/* 上の AI チップ — グラデで先進性を出す */}
      <div className="relative rounded-full px-4 py-1 text-[11px] font-black text-white mb-3 z-10 tracking-[0.18em] shadow-lg"
           style={{ background: "linear-gradient(90deg, #a855f7 0%, #ec4899 50%, #ff6b00 100%)" }}>
        ✦ AI 即診断 ✦
      </div>

      {/* メインボタン */}
      <div className={withPulse ? "cta-pulse-ring" : undefined}>
        <Link
          href="/lp01/diagnosis"
          className="cta-neon group relative w-[330px] py-5 px-6 inline-flex flex-col items-center justify-center"
        >
          <span className="relative z-10 text-[22px] font-black tracking-wider"
                style={{ textShadow: "0 0 12px rgba(255,138,51,0.65), 0 0 24px rgba(255,107,0,0.35)" }}>
            診断 START
          </span>
          <span className="relative z-10 mt-1 cta-neon-arrows text-[18px] font-black flex gap-1 text-[#ff8a33]">
            <span>▶</span>
            <span>▶</span>
            <span>▶</span>
          </span>
        </Link>
      </div>

      {/* 下のミニピル: モノスペース調のデータ感 */}
      <div className="flex items-center gap-2 mt-4 text-[10px] font-mono">
        <span className="px-2 py-0.5 border border-[#ff8a33]/60 rounded text-[#ff8a33]">FREE</span>
        <span className="text-text-muted">·</span>
        <span className="px-2 py-0.5 border border-[#ff8a33]/60 rounded text-[#ff8a33]">15s</span>
        <span className="text-text-muted">·</span>
        <span className="px-2 py-0.5 border border-[#ff8a33]/60 rounded text-[#ff8a33]">NO LOGIN</span>
      </div>
    </div>
  );
}
