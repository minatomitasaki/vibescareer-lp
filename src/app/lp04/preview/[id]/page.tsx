// LP04 結果プレビューページ (/lp04/preview/[id])
//
// 2026-06-15: A/B テストの variant B デザインを本番 (A) に反映した。
//   旧 A デザインのバックアップ: docs/backups/lp04-preview-A.original.2026-06-15.tsx.bak
//   (戻したい場合はこの .bak を本ファイルに上書きで復元)
//
// デザイン仕様 (旧 variant B):
//   1. CTA は「下部固定バー (Lp04bStickyCta)」で常時表示。
//      オレンジ丸「10秒で完了！」+ 緑 LINE ボタン。
//   2. 「あなたの持ち味」「プロからのアドバイス」の本文を "全文モザイク" にする。
//   3. モザイク部分に「🔒 ○○を見る」バッジを重ね、クリックで LINE 友だち追加 URL に飛ばす。
//
// LINE 誘導先 URL は resultId ごとの既存シナリオ (resolveLp04LineUrl) を流用。

import { notFound } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { Lp04bUnlockBadge, Lp04bStickyCta } from "@/components/lp04/Lp04bCta";
import { PotentialRankBanner } from "@/components/lp02/PotentialRankBanner";
import { RESULT_DATA, type ResultData } from "@/data/results";
import { LP04_RESULT_IDS, isLp04ResultId } from "@/lib/lp04-diagnosis-mapper";

export function generateStaticParams() {
  // LP04 は 3 パターンのみ
  return LP04_RESULT_IDS.map((id) => ({ id }));
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isLp04ResultId(id)) notFound();
  const data = RESULT_DATA[id];

  return (
    // 下部固定 CTA バーに隠れないよう、本文末尾に十分な余白 (pb-32) を確保。
    <main className="lp-container bg-white pb-32">
      {/* ヘッダー */}
      <header className="relative px-4 py-3 flex items-center justify-start bg-white">
        <Logo width={160} height={44} priority />
        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent" />
      </header>

      {/* === Section 1: 診断結果ヒーロー (適正年収はモザイク) === */}
      <PreviewResultHeader data={data} />

      {/* === Section 2: 持ち味 / アドバイス / その他の適職 (本文すべてモザイク) === */}
      <PreviewInsightSection data={data} />

      {/* === 心理ブースター: 上位 N% のポテンシャル === */}
      <PotentialRankBanner />

      {/* === 下部固定 CTA: LINE 登録で鍵を解放 (常時表示) === */}
      <Lp04bStickyCta resultId={data.id} />
    </main>
  );
}

// =============================================================================
// 診断結果ヒーロー (適正年収の金額だけモザイク + 大きめ UnlockBadge)
// =============================================================================
function PreviewResultHeader({ data }: { data: ResultData }) {
  return (
    <section className="result-hero">
      <div className="relative pt-4 pb-2 flex flex-col items-center">
        <div className="relative w-full max-w-[360px] bg-[#FFFAF5] border-2 border-brand-primary/25 rounded-3xl shadow-[0_8px_24px_rgba(255,107,0,0.08)] overflow-hidden">
          {data.jobType === "sales" && (
            <div aria-hidden className="w-full h-12" />
          )}
          <ImagePlaceholder
            src={`/images/result-hero-${data.jobType}.png`}
            label={`Section 1: ${data.jobLabel} ヒーロー画像`}
            alt={`${data.jobLabel}として活躍する若手ビジネスパーソン2人`}
            width={1024}
            height={1536}
            priority
            className="w-full h-auto block"
          />

          <div className="absolute inset-x-0 top-0 h-[45%] flex flex-col items-center justify-center px-3 gap-2.5">
            <h1 className="result-eyebrow">
              <span className="side-spark left">✦</span>
              <span className="label">診断結果</span>
              <span className="side-spark right">✦</span>
            </h1>
            <p className="result-lead-copy">あなたは</p>
            <div className="result-job-frame w-full max-w-[320px]">
              <span className="sub">{data.workplaceSubLabel}</span>
              <span className="main">{data.jobLabel}</span>
            </div>
            <p className="result-lead-copy">に向いています。</p>
          </div>
        </div>

        {/* 適正年収カード: 見出しは見せて金額は blur + 大きめ UnlockBadge */}
        <div className="mt-8 w-full max-w-[320px] result-salary-card relative">
          <span className="label">適正年収</span>
          <span
            className="value select-none"
            aria-hidden
            style={{ filter: "blur(8px)", color: "#FF6B00" }}
          >
            {data.salaryRange}
          </span>
          <Lp04bUnlockBadge resultId={data.id} size="lg" label="適正年収を見る" />
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// 持ち味 / アドバイス / その他の適職 (本文をすべて blur で隠す)
// =============================================================================
function PreviewInsightSection({ data }: { data: ResultData }) {
  return (
    <section className="px-4 pt-6 pb-8">
      <div className="result-insight-block">
        {/* あなたの持ち味: 見出しのみ表示、本文は全文 blur + UnlockBadge */}
        <div className="result-insight-item">
          <h3 className="result-insight-heading">
            <span className="result-insight-en">YOUR STRENGTHS</span>
            <span className="result-insight-ja">あなたの持ち味</span>
          </h3>
          <div className="relative mt-1">
            <p
              className="result-insight-text select-none"
              aria-hidden
              style={{ filter: "blur(4.5px)" }}
            >
              {data.strength}
            </p>
            <Lp04bUnlockBadge resultId={data.id} label="持ち味を見る" />
          </div>
        </div>

        <div className="result-insight-divider" aria-hidden />

        {/* プロからのアドバイス: 見出しのみ表示、本文は全文 blur + UnlockBadge */}
        <div className="result-insight-item">
          <h3 className="result-insight-heading">
            <span className="result-insight-en">PROFESSIONAL ADVICE</span>
            <span className="result-insight-ja">プロからのアドバイス</span>
          </h3>
          <div className="relative mt-1">
            <p
              className="result-insight-text select-none"
              aria-hidden
              style={{ filter: "blur(4.5px)" }}
            >
              {data.advice}
            </p>
            <Lp04bUnlockBadge resultId={data.id} label="続きを見る" />
          </div>
        </div>

        <div className="result-insight-divider" aria-hidden />

        {/* その他の適職: 見出しのみ表示、カード 2 枚は blur + 全体に UnlockBadge */}
        <div className="result-insight-item">
          <h3 className="result-insight-heading">
            <span className="result-insight-en">OTHER POSSIBILITIES</span>
            <span className="result-insight-ja">その他の適職</span>
          </h3>
          <div className="relative mt-3">
            <div className="space-y-3">
              <MosaicOtherJobCard
                title="サポート職"
                body="人の声に耳を傾け、組織と人のあいだに立ちながら、安心して働ける環境を整える職種。人事・労務などが該当します。"
              />
              <MosaicOtherJobCard
                title="マーケティング職"
                body="市場とユーザーを読み解き、数字と感覚の両方を行き来しながら、商品やサービスの届け方を設計する職種。"
              />
            </div>
            <Lp04bUnlockBadge resultId={data.id} label="続きを見る" />
          </div>
        </div>
      </div>
    </section>
  );
}

// その他の適職カード (LP01 の OtherJobsList と同じ緑系カード)
// 実テキスト (ダミー職種・説明) を入れた上で blur で隠す。
function MosaicOtherJobCard({ title, body }: { title: string; body: string }) {
  return (
    <div
      className="relative bg-[#F0FDF4] border border-[#86EFAC] rounded-2xl px-4 py-3 overflow-hidden select-none"
      aria-hidden
    >
      <div className="text-center mb-2" style={{ filter: "blur(4.5px)" }}>
        <span className="inline-block text-[14px] font-black text-text-primary">
          ★ {title}
        </span>
      </div>
      <p
        className="text-[12px] leading-[1.7] text-text-primary"
        style={{ filter: "blur(4.5px)" }}
      >
        {body}
      </p>
    </div>
  );
}
