import Link from "next/link";

// =====================================================
// CTA ボタン (パターン A: 超大型・サブ情報内蔵型)
//
// 現行 CtaButton との違い:
//   - ボタン本体が 1サイズ大きい (330 × 約90px)
//   - 「所要時間 約15秒・完全無料・登録不要」 をボタン外部からボタン内部に移動
//   - 上段「診断START！」/ 仕切り線 / 下段「無料・15秒・登録不要」の 3段構成
//   - 立体感・キラリ反射・パルスリング・トラストライン仕様は現行と同じ
// =====================================================
export function CtaButtonLarge({
  withPulse = false,
  trustLine,
}: {
  withPulse?: boolean;
  trustLine?: string;
}) {
  return (
    <div className="flex flex-col items-center">
      {/* トラストライン（＼…／） */}
      {trustLine && (
        <div className="slash-headline mb-4">
          <span className="slash">＼</span>
          <span className="text-[13px] font-black text-text-primary leading-tight">
            {trustLine}
          </span>
          <span className="slash">／</span>
        </div>
      )}

      {/* 上の「いますぐ無料で」ピル (現行と同じ) */}
      <div className="relative bg-white border-2 border-brand-primary rounded-full px-5 py-1.5 text-[12px] font-black text-brand-primary mb-[-14px] z-10 shadow-md">
        いますぐ無料で
        <span className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-brand-primary rotate-45" />
      </div>

      {/* 超大型ボタン: 上段 (メインCTA) / 仕切り線 / 下段 (サブベネフィット) */}
      <div className={withPulse ? "cta-pulse-ring" : undefined}>
        <Link
          href="/lp01#lp01-diagnosis-questions"
          className="btn-3d-orange group relative w-[330px] inline-flex flex-col items-center justify-center py-4 px-6"
        >
          {/* 上段: メインCTA */}
          <span className="relative z-10 text-[24px] font-black flex items-center gap-2 leading-none">
            診断START！
            <span className="inline-block transition-transform group-hover:translate-x-1">
              ▶
            </span>
          </span>

          {/* 上段と下段を分ける半透明ライン */}
          <span className="relative z-10 w-[80%] h-px bg-white/40 my-2.5" />

          {/* 下段: サブベネフィット (3点) — 現行で外に出していた補助テキストを内包 */}
          <span className="relative z-10 text-[12px] font-bold flex items-center gap-2 leading-none">
            <span>無料</span>
            <span className="inline-block w-1 h-1 rounded-full bg-white/60" />
            <span>15秒</span>
            <span className="inline-block w-1 h-1 rounded-full bg-white/60" />
            <span>登録不要</span>
          </span>

          {/* 上部キラリ反射 (現行と同じ装飾) */}
          <span className="absolute top-2 left-8 right-8 h-2 bg-white/40 rounded-full blur-[2px] z-[1]" />
        </Link>
      </div>
    </div>
  );
}
