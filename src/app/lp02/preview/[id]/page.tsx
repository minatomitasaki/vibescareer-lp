// LP02 結果プレビューページ (/lp02/preview/[id])
//
// LP01 の結果LPの Section 1 (診断結果ヒーロー) と Section 2 (持ち味 / アドバイス
// / その他の適職) と同じデザインをそのまま再現しつつ、以下だけをモザイクで隠す:
//
//   ▼ 見せる
//     - 「診断結果」「あなたは」 + 職場サブラベル + 職種ラベル + 「に向いています」
//     - 「適正年収」見出し
//     - 「あなたの持ち味」見出し + 1 文目だけ
//     - 「プロからのアドバイス」見出し
//     - 「その他の適職」見出し
//
//   ▼ モザイク (blur-[2px] の薄帯で隠す)
//     - 適正年収の金額
//     - 持ち味の 2 文目以降
//     - プロからのアドバイス本文
//     - その他の適職カードの中身
//
// 最下部に解放 CTA + PreviewForm を置き、フォーム送信で /lp02/result/[id] に遷移。

import { notFound } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { PreviewForm } from "@/components/lp02/PreviewForm";
import { RESULT_DATA, allResultIds, isResultId, type ResultData } from "@/data/results";

export function generateStaticParams() {
  return allResultIds().map((id) => ({ id }));
}

/** 「。」までを最初の 1 文として取り出す。句点がなければ先頭 60 字。 */
function firstSentence(text: string): string {
  const m = text.match(/^[^。]*。/);
  return m ? m[0] : text.slice(0, 60);
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isResultId(id)) notFound();
  const data = RESULT_DATA[id];

  return (
    <main className="lp-container bg-white">
      {/* ヘッダー (LP01 結果ページと同じ) */}
      <header className="relative px-4 py-3 flex items-center justify-start bg-white">
        <Logo width={160} height={44} priority />
        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent" />
      </header>

      {/* === Section 1: 診断結果ヒーロー (LP01 と同じ) ただし適正年収はモザイク === */}
      <PreviewResultHeader data={data} />

      {/* === Section 2: 持ち味 / アドバイス / その他の適職 (LP01 と同じデザイン、テキストはモザイク) === */}
      <PreviewInsightSection data={data} />

      {/* === 解放 CTA + リードフォーム === */}
      <section className="px-4 py-10 bg-bg-form">
        <div className="bg-white rounded-3xl p-5 shadow-md">
          <div className="text-center">
            <p className="text-[15px] font-bold text-text-secondary leading-[1.85]">
              下記フォームを入力するだけで
            </p>
            <p className="mt-2 text-[22px] font-black leading-[1.45] text-text-primary">
              <span className="relative inline-block">
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-[1px] h-[9px] bg-brand-primary/15 rounded-[1px]"
                />
                <span className="relative">詳細な診断結果</span>
              </span>
              が見れます！
            </p>
            <p className="mt-1 text-[12px] text-text-muted">
              所要時間およそ 30 秒・完全無料
            </p>
          </div>

          <div className="mt-6">
            <PreviewForm resultId={data.id} />
          </div>
        </div>
      </section>
    </main>
  );
}

// =============================================================================
// 診断結果ヒーロー (LP01 ResultHeader の複製 + 適正年収モザイク)
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

        {/* 適正年収カード: 見出しは見せて金額はモザイク */}
        <div className="mt-8 w-full max-w-[320px] result-salary-card relative">
          <span className="label">適正年収</span>
          <span
            className="value select-none"
            aria-hidden
            style={{ filter: "blur(7px)", color: "#FF6B00" }}
          >
            ???〜???万円
          </span>
          <span
            className="absolute inset-x-4 top-1/2 -translate-y-1/2 text-center text-[10px] text-brand-primary font-bold pointer-events-none"
            style={{ opacity: 0.85 }}
          >
            🔒 フォーム入力で表示
          </span>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// 持ち味 / アドバイス / その他の適職 (LP01 InsightSection の複製 + モザイク)
// =============================================================================
function PreviewInsightSection({ data }: { data: ResultData }) {
  return (
    <section className="px-4 pt-6 pb-8">
      <div className="result-insight-block">
        {/* あなたの持ち味: 1 文目だけ表示、残りモザイク */}
        <div className="result-insight-item">
          <h3 className="result-insight-heading">
            <span className="result-insight-en">YOUR STRENGTHS</span>
            <span className="result-insight-ja">あなたの持ち味</span>
          </h3>
          <p className="result-insight-text">{firstSentence(data.strength)}</p>
          <div className="mt-2 space-y-1.5">
            <div className="h-3 rounded bg-text-muted/25 blur-[2px]" />
            <div className="h-3 rounded bg-text-muted/25 blur-[2px] w-[94%]" />
            <div className="h-3 rounded bg-text-muted/25 blur-[2px] w-[82%]" />
            <div className="h-3 rounded bg-text-muted/25 blur-[2px] w-[88%]" />
          </div>
        </div>

        <div className="result-insight-divider" aria-hidden />

        {/* プロからのアドバイス: 本文全体モザイク */}
        <div className="result-insight-item">
          <h3 className="result-insight-heading">
            <span className="result-insight-en">PROFESSIONAL ADVICE</span>
            <span className="result-insight-ja">プロからのアドバイス</span>
          </h3>
          <div className="mt-1 space-y-1.5">
            <div className="h-3 rounded bg-text-muted/25 blur-[2px]" />
            <div className="h-3 rounded bg-text-muted/25 blur-[2px] w-[92%]" />
            <div className="h-3 rounded bg-text-muted/25 blur-[2px] w-[86%]" />
            <div className="h-3 rounded bg-text-muted/25 blur-[2px] w-[78%]" />
            <div className="h-3 rounded bg-text-muted/25 blur-[2px] w-[90%]" />
          </div>
        </div>

        <div className="result-insight-divider" aria-hidden />

        {/* その他の適職: 見出しのみ表示、適職カード 2 枚はタイトル含めて全部モザイク */}
        <div className="result-insight-item">
          <h3 className="result-insight-heading">
            <span className="result-insight-en">OTHER POSSIBILITIES</span>
            <span className="result-insight-ja">その他の適職</span>
          </h3>
          <div className="mt-3 space-y-3">
            <MosaicOtherJobCard />
            <MosaicOtherJobCard />
          </div>
        </div>
      </div>
    </section>
  );
}

// 「サポート職」「マーケティング職」等の他の適職カードを丸ごとモザイク化。
// LP01 の OtherJobsList と同じ緑系カード枠を使い、内容だけ blur 帯に置換。
function MosaicOtherJobCard() {
  return (
    <div className="relative bg-[#F0FDF4] border border-[#86EFAC] rounded-2xl px-4 py-3 overflow-hidden">
      {/* タイトル帯 (中身を blur) */}
      <div className="text-center mb-2">
        <div
          className="inline-block h-4 w-32 rounded bg-text-muted/30 blur-[2.5px]"
          aria-hidden
        />
      </div>
      {/* 説明テキスト 2 行を blur */}
      <div className="space-y-1.5">
        <div className="h-2.5 rounded bg-text-muted/25 blur-[2px]" />
        <div className="h-2.5 rounded bg-text-muted/25 blur-[2px] w-[90%]" />
      </div>
      {/* ロック印 */}
      <span
        className="absolute top-2 right-2 text-[14px] opacity-60"
        aria-hidden
      >
        🔒
      </span>
    </div>
  );
}
