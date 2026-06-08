import Link from "next/link";

// =====================================================
// CTA バリアント C: ポップ・手描き吹き出し型
//
// 方向性:
//   - 白背景 + 太い黒線 + 影 (オフセット) でステッカー / シール感
//   - 上に「やってみる？」吹き出し
//   - 右上に「無料！」赤丸スタンプ (傾き付き)
//   - ホバーでわずかに傾けてカジュアル感を出す
//   - 絵文字「♪」「🎯」「✨」で SNS / 若年層親和性
// =====================================================
export function CtaButtonPop({
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

      {/* 上の吹き出し */}
      <div className="cta-pop-bubble">
        やってみる？ ✨
      </div>

      {/* メインボタン (右上スタンプ用に position:relative なラッパー) */}
      <div className={`relative ${withPulse ? "cta-pulse-ring" : ""}`}>
        {/* 右上の赤丸スタンプ */}
        <span className="cta-pop-stamp">無料！</span>

        <Link
          href="/lp01#lp01-diagnosis-questions"
          className="cta-pop group relative w-[300px] py-5 px-6 inline-flex flex-col items-center justify-center"
        >
          <span className="text-[22px] font-black flex items-center gap-2 leading-none">
            <span>🎯</span>
            <span>診断START</span>
            <span className="transition-transform group-hover:translate-x-1">♪</span>
          </span>
          <span className="text-[12px] font-bold mt-2 text-text-secondary">
            8 つの質問 · 約 15 秒
          </span>
        </Link>
      </div>

      {/* 下の手描き風アンダーライン */}
      <svg className="mt-3" width="180" height="10" viewBox="0 0 180 10" fill="none">
        <path d="M2 7 C 30 1, 60 9, 90 5 S 150 1, 178 7"
              stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
      <p className="text-[11px] font-black text-text-primary mt-1">
        サクッと診断 ✨
      </p>
    </div>
  );
}
