import Link from "next/link";
import { CtaButtonLarge } from "@/components/CtaButtonLarge";
import { CtaButtonNeon } from "@/components/CtaButtonNeon";
import { CtaButtonPop } from "@/components/CtaButtonPop";
import { CtaButtonTicket } from "@/components/CtaButtonTicket";

// =====================================================
// CTA ボタンのバリアント比較プレビューページ
// 本番 LP には影響なし。/cta-preview でアクセスして見比べる用。
//
// 比較対象:
//   - 現行       (page.tsx の CtaButton と同じ実装をこのファイル内に再掲)
//   - B: ネオン    (CtaButtonNeon) — 暗色背景 + ネオン発光
//   - C: ポップ    (CtaButtonPop) — 太線白背景 + スタンプ感
//   - D: チケット (CtaButtonTicket) — 切符型 + リボン + 期限
//   - A: 超大型    (CtaButtonLarge) — 前回試行、参考のため末尾に
// =====================================================
export default function CtaPreviewPage() {
  const trust = "転職を成功させた第２新卒が最初に受けています！";

  return (
    <main className="min-h-screen bg-white px-4 py-12">
      <div className="max-w-md mx-auto space-y-20">
        <header>
          <h1 className="text-2xl font-black mb-2">CTA ボタン パターン比較</h1>
          <p className="text-sm text-text-muted leading-relaxed">
            本番 LP には影響なし。下にスクロールして見比べてください。
          </p>
          <nav className="mt-4 flex flex-wrap gap-2 text-xs">
            {[
              ["#current", "現行"],
              ["#neon", "B ネオン"],
              ["#pop", "C ポップ"],
              ["#ticket", "D チケット"],
              ["#large", "A 超大型 (参考)"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="px-2 py-1 bg-bg-subtle rounded text-text-secondary hover:bg-orange-100">
                {label}
              </a>
            ))}
          </nav>
        </header>

        {/* 現行 */}
        <section id="current" className="scroll-mt-8">
          <Heading label="現行" sub="補助テキストを下に分離" />
          <CtaButtonCurrent withPulse trustLine={trust} />
        </section>

        {/* B: ネオン */}
        <section id="neon" className="scroll-mt-8">
          <Heading label="B: ネオン・ダーク・ハイテク調" sub="暗色背景 + ネオン発光 + AI 感" />
          <CtaButtonNeon withPulse trustLine={trust} />
        </section>

        {/* C: ポップ */}
        <section id="pop" className="scroll-mt-8">
          <Heading label="C: ポップ・手描き吹き出し型" sub="太線白背景 + スタンプ感 + カジュアル絵文字" />
          <CtaButtonPop withPulse trustLine={trust} />
        </section>

        {/* D: チケット */}
        <section id="ticket" className="scroll-mt-8">
          <Heading label="D: チケット・特典・期限型" sub="切符型 + リボン + カウントダウン" />
          <CtaButtonTicket withPulse trustLine={trust} />
        </section>

        {/* A: 超大型 (参考) */}
        <section id="large" className="scroll-mt-8 opacity-90">
          <Heading label="A: 超大型・サブ情報内蔵 (参考)" sub="前回試行、現行の延長線上" />
          <CtaButtonLarge withPulse trustLine={trust} />
        </section>

        <footer className="pt-8 border-t border-orange-100 text-center">
          <Link href="/" className="text-sm text-brand-primary font-bold underline">
            ← 本番 LP に戻る
          </Link>
        </footer>
      </div>
    </main>
  );
}

// 共通の見出し
function Heading({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-black pb-2 border-b border-orange-200">{label}</h2>
      <p className="text-xs text-text-muted mt-2">{sub}</p>
    </div>
  );
}

// =====================================================
// 比較用の現行 CtaButton (page.tsx の CtaButton と同じ実装をここに再掲)
// =====================================================
function CtaButtonCurrent({
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
      <div className="relative bg-white border-2 border-brand-primary rounded-full px-5 py-1.5 text-[12px] font-black text-brand-primary mb-[-14px] z-10 shadow-md">
        いますぐ無料で
        <span className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-brand-primary rotate-45" />
      </div>
      <div className={withPulse ? "cta-pulse-ring" : undefined}>
        <Link
          href="/diagnosis"
          className="btn-3d-orange group relative w-[300px] text-center text-[22px] py-5 inline-flex items-center justify-center gap-2"
        >
          <span className="relative z-10">診断START！</span>
          <span className="relative z-10 inline-block transition-transform group-hover:translate-x-1">
            ▶
          </span>
          <span className="absolute top-1.5 left-8 right-8 h-2 bg-white/40 rounded-full blur-[2px] z-[1]" />
        </Link>
      </div>
      <p className="text-[10px] text-text-muted mt-3 font-medium flex items-center gap-1.5">
        <span>所要時間 約15秒</span>
        <span className="inline-block w-1 h-1 rounded-full bg-text-muted/50" />
        <span>完全無料</span>
        <span className="inline-block w-1 h-1 rounded-full bg-text-muted/50" />
        <span>登録不要</span>
      </p>
    </div>
  );
}
