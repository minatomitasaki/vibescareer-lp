// CTA ボタンに付ける「相談だけでもOK」吹き出しの 3 案を縦並べで比較するページ。
// 本番 LP には影響なし。/cta-bubble-preview で確認用。
// ベースの CTA は globals.css の .btn-cta-radar (LP02 Bonus セクションで使用) を流用。

import Link from "next/link";

export default function CtaBubblePreviewPage() {
  return (
    <main className="min-h-screen bg-[#ECFDF3] px-4 py-12">
      <div className="max-w-md mx-auto space-y-24">
        <header className="text-center">
          <h1 className="text-2xl font-black mb-2 text-text-default">
            CTA 吹き出し 3 案
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            「相談だけでもOK」を CTA ボタンに添える 3 案を比較。
            <br />
            既存 CTA の緑グラデ + pulse + ring アニメはそのまま。
          </p>
        </header>

        {/* ============================================================
            案A: クリーム吹き出し + 下三角 tail (王道・ふわふわ揺れ)
            ============================================================ */}
        <section>
          <p className="text-center text-xs font-bold text-brand-primary mb-1">
            案A
          </p>
          <h2 className="text-center text-lg font-black mb-6 text-text-default">
            クリーム吹き出し + tail
          </h2>
          <div className="flex flex-col items-center">
            {/* 吹き出し本体 — CTA と同じ cta-radar-pulse (1.4s) で同期 */}
            <div className="relative inline-block bubble-a-sync">
              <div className="relative inline-block bg-[#FFFAF2] border-2 border-brand-primary text-brand-primary font-black text-[14px] leading-none px-4 py-2 rounded-full shadow-[0_4px_10px_rgba(255,107,0,0.15)]">
                相談だけでもOK
                {/* 下向き三角 tail (枠線付き) */}
                <span
                  className="absolute left-1/2 -translate-x-1/2 -bottom-[10px] block"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderTop: "10px solid #ff6b00",
                  }}
                />
                <span
                  className="absolute left-1/2 -translate-x-1/2 -bottom-[7px] block"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "6px solid transparent",
                    borderRight: "6px solid transparent",
                    borderTop: "8px solid #FFFAF2",
                  }}
                />
              </div>
            </div>
            {/* CTA 本体 */}
            <div className="mt-3 w-full max-w-[420px] flex justify-center">
              <Link href="#" className="btn-cta-radar w-full">
                <span className="relative z-10">無料カウンセリングを申し込む</span>
                <span className="relative z-10">▶</span>
              </Link>
            </div>
          </div>
          <p className="mt-6 text-xs text-text-muted leading-relaxed">
            ✅ 緑 CTA と補色のオレンジで視認性◎、ブランドの warm tone と統一<br />
            ✅ ふわふわ揺れ (3s 周期) で pulse/ring と非同期に動く<br />
            ⚠️ 主張は控えめ — 「安心感」寄り
          </p>
        </section>

        {/* ============================================================
            案B: 黄色マーカー風 + 下矢印
            ============================================================ */}
        <section>
          <p className="text-center text-xs font-bold text-brand-primary mb-1">
            案B
          </p>
          <h2 className="text-center text-lg font-black mb-6 text-text-default">
            黄色マーカー + 下矢印
          </h2>
          <div className="flex flex-col items-center">
            <div className="text-center mb-3">
              <span
                className="inline-block text-[18px] font-black text-text-default leading-tight px-1"
                style={{
                  background:
                    "linear-gradient(transparent 55%, #FFE066 55%, #FFE066 92%, transparent 92%)",
                  letterSpacing: "0.02em",
                }}
              >
                相談だけでもOK
              </span>
              <div className="mt-1 text-brand-primary font-black text-[20px] leading-none bubble-b-arrow">
                ▼
              </div>
            </div>
            <div className="w-full max-w-[420px] flex justify-center">
              <Link href="#" className="btn-cta-radar w-full">
                <span className="relative z-10">無料カウンセリングを申し込む</span>
                <span className="relative z-10">▶</span>
              </Link>
            </div>
          </div>
          <p className="mt-6 text-xs text-text-muted leading-relaxed">
            ✅ 一番注目される、CV 直撃狙い<br />
            ✅ tarushiru 系の手書きマーカー手法、第二新卒層に効きやすい<br />
            ⚠️ Section 5 / 9 / 15 で 3 回出ると主張過多リスク
          </p>
        </section>

        {/* ============================================================
            案C: 左上斜めタグ
            ============================================================ */}
        <section>
          <p className="text-center text-xs font-bold text-brand-primary mb-1">
            案C
          </p>
          <h2 className="text-center text-lg font-black mb-6 text-text-default">
            左上 斜めタグ
          </h2>
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[420px]">
              {/* 斜めタグ (絶対配置で CTA に被せる) */}
              <div
                className="absolute -top-3 -left-1 z-20"
                style={{
                  transform: "rotate(-8deg)",
                  transformOrigin: "left bottom",
                }}
              >
                <div className="inline-flex items-center gap-1 bg-[#FFFAF2] border-2 border-brand-primary text-brand-primary font-black text-[12px] leading-none px-3 py-[6px] rounded-full shadow-[0_3px_8px_rgba(255,107,0,0.18)]">
                  <span>★</span>
                  <span>相談だけでもOK</span>
                </div>
              </div>
              <Link href="#" className="btn-cta-radar w-full relative">
                <span className="relative z-10">無料カウンセリングを申し込む</span>
                <span className="relative z-10">▶</span>
              </Link>
            </div>
          </div>
          <p className="mt-6 text-xs text-text-muted leading-relaxed">
            ✅ おしゃれ + 手作り感、競合 LP と差別化<br />
            ✅ ボタンの上下スペースを圧迫しない (横に逃げる)<br />
            ⚠️ 真上配置より読み飛ばされるリスク
          </p>
        </section>

        <footer className="pt-8 pb-4 text-center">
          <p className="text-xs text-text-muted">
            気に入った案 (A / B / C) を教えてください。
            <br />
            本番 (Lp02BonusSection) に組み込みます。
          </p>
        </footer>
      </div>

      {/* このページ専用のキーフレーム */}
      <style>{`
        /* 案A: CTA ボタンの cta-radar-pulse と同じ周期・カーブで scale 同期 */
        .bubble-a-sync {
          animation: cta-radar-pulse 1.4s ease-in-out infinite;
          transform-origin: center bottom;
        }
        @keyframes bubble-b-arrow {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(3px); }
        }
        .bubble-b-arrow {
          animation: bubble-b-arrow 1.2s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
