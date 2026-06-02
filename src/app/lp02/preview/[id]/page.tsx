// LP02 結果プレビューページ (/lp02/preview/[id])
//
// LP01 の結果LPの Section 1 (診断結果ヒーロー) と Section 2 (持ち味 / アドバイス
// / その他の適職) と同じデザインをそのまま再現しつつ、以下だけをモザイクで隠す:
//
//   ▼ 見せる
//     - 「診断結果」「あなたは」+ 職場サブラベル + 職種ラベル + 「に向いています」
//     - 「適正年収」見出し
//     - 「あなたの持ち味」見出し + 1 文目だけ
//     - 「プロからのアドバイス」見出し
//     - 「その他の適職」見出し
//
//   ▼ モザイク (実テキストを CSS filter blur で隠した上に「🔒 フォーム入力で表示」
//     のピル型バッジをオーバーレイ。完全に潰すのではなく「文字が書いてあること」が
//     うっすら分かるレベルにして、続きが気になる体験にする)
//     - 適正年収の金額
//     - 持ち味の 2 文目以降
//     - プロからのアドバイス本文
//     - その他の適職カードの中身 (タイトル含む)
//
// 診断セクションとフォーム CTA の間に、PotentialRankBanner (おめでとう！上位
// 17-23% のポテンシャルあります) を挟んで心理ブースト。

import { notFound } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { PreviewForm } from "@/components/lp02/PreviewForm";
import { PotentialRankBanner } from "@/components/lp02/PotentialRankBanner";
import { RESULT_DATA, allResultIds, isResultId, type ResultData } from "@/data/results";

export function generateStaticParams() {
  return allResultIds().map((id) => ({ id }));
}

/** 「。」までを最初の 1 文として取り出す。句点がなければ先頭 60 字。 */
function firstSentence(text: string): string {
  const m = text.match(/^[^。]*。/);
  return m ? m[0] : text.slice(0, 60);
}

/** 「。」までを除いた残りのテキスト (モザイクで隠すぶん) を返す */
function restAfterFirstSentence(text: string): string {
  const first = firstSentence(text);
  return text.slice(first.length).trim();
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
      {/* ヘッダー */}
      <header className="relative px-4 py-3 flex items-center justify-start bg-white">
        <Logo width={160} height={44} priority />
        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent" />
      </header>

      {/* === Section 1: 診断結果ヒーロー (LP01 と同じ) ただし適正年収はモザイク === */}
      <PreviewResultHeader data={data} />

      {/* === Section 2: 持ち味 / アドバイス / その他の適職 (LP01 と同じデザイン、テキスト一部モザイク) === */}
      <PreviewInsightSection data={data} />

      {/* === 心理ブースター: 上位 N% のポテンシャル === */}
      <PotentialRankBanner />

      {/* === 解放 CTA + リードフォーム === */}
      <section id="preview-form" className="px-4 py-10 bg-bg-form scroll-mt-4">
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
// 「🔒 フォーム入力で表示」のオーバーレイバッジ
// 親要素を relative にしてからこの要素を absolute で重ねる。
// 全面クリッカブルにして、クリックでフォームセクション (#preview-form) に
// スムーズスクロール。スクロール自体は globals.css の
// html { scroll-behavior: smooth } で実現。
// =============================================================================
function UnlockBadge({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const cls =
    size === "lg"
      ? "px-4 py-2 text-[15px]"
      : size === "sm"
        ? "px-3 py-1.5 text-[12px]"
        : "px-3.5 py-1.5 text-[13.5px]";
  return (
    <a
      href="#preview-form"
      aria-label="フォームへ移動"
      className="group/badge absolute inset-0 flex items-center justify-center cursor-pointer"
    >
      <span
        className={`bg-white/90 backdrop-blur-sm rounded-full font-black text-brand-primary border border-brand-primary/45 shadow-md inline-flex items-center gap-1 transition-transform group-hover/badge:scale-105 group-active/badge:scale-95 ${cls}`}
      >
        <span aria-hidden>🔒</span>
        フォーム入力で表示
      </span>
    </a>
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
          <UnlockBadge size="lg" />
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// 持ち味 / アドバイス / その他の適職 (LP01 InsightSection 複製 + 実テキスト blur)
// =============================================================================
function PreviewInsightSection({ data }: { data: ResultData }) {
  const rest = restAfterFirstSentence(data.strength);

  return (
    <section className="px-4 pt-6 pb-8">
      <div className="result-insight-block">
        {/* あなたの持ち味: 1 文目表示、続きは blur + UnlockBadge */}
        <div className="result-insight-item">
          <h3 className="result-insight-heading">
            <span className="result-insight-en">YOUR STRENGTHS</span>
            <span className="result-insight-ja">あなたの持ち味</span>
          </h3>
          <p className="result-insight-text">{firstSentence(data.strength)}</p>
          {rest && (
            <div className="relative mt-2">
              <p
                className="result-insight-text select-none"
                aria-hidden
                style={{ filter: "blur(4.5px)" }}
              >
                {rest}
              </p>
              <UnlockBadge />
            </div>
          )}
        </div>

        <div className="result-insight-divider" aria-hidden />

        {/* プロからのアドバイス: 本文全体 blur + UnlockBadge */}
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
            <UnlockBadge />
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
            <UnlockBadge />
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
      <div
        className="text-center mb-2"
        style={{ filter: "blur(4.5px)" }}
      >
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
