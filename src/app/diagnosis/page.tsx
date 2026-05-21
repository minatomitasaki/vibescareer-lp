"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { computeDiagnosis } from "@/lib/diagnosis-scoring";

// =====================================================
// 診断ページ (/diagnosis) — モダン・ミニマル版
// 仕様: design/SPEC.md セクション 2
// 仕掛け:
//   - オフホワイト + 薄オレンジドットテクスチャ背景 (.diagnosis-bg)
//   - PROGRESS バーを sticky で常時表示 (半透明 + backdrop-blur)
//   - ステップドット型プログレス (8 個)
//   - 初回回答時に次の質問へカスタムイージングで滑らかにスクロール
//   - リッカート円のサイズ差 (両端大・中央小)
// =====================================================

type Axis = "job" | "workplace";

type Question = {
  id: number;
  axis: Axis; // "job"=職種軸 / "workplace"=職場軸
  text: string;
  left: string;
  right: string;
};

// 設問データ
const QUESTIONS: Question[] = [
  { id: 1, axis: "job",       text: "あなたが仕事で大切にしたいのは？",     left: "スキルを身につける",     right: "人を笑顔・感動させる" },
  { id: 2, axis: "job",       text: "仕事のやりがいとして近いのは？",       left: "会社・組織の発展",       right: "物事の探究・分析" },
  { id: 3, axis: "workplace", text: "仕事のスタイルはどちらに近い？",       left: "戦略的に考える",         right: "感覚的に動く" },
  { id: 4, axis: "workplace", text: "オフの日の過ごし方はどちらに近い？",   left: "ひとりで静かに",         right: "多くの人と賑やかに" },
  { id: 5, axis: "job",       text: "人間関係で意識することは？",           left: "自分の軸を作る",         right: "周囲の意見を聞く" },
  { id: 6, axis: "job",       text: "物事の捉え方はどちらに近い？",         left: "自分の考え方を信じる",   right: "多様な知識を取り入れる" },
  { id: 7, axis: "workplace", text: "感情の出し方はどちらに近い？",         left: "正直に表に出す",         right: "冷静に伝える" },
  { id: 8, axis: "workplace", text: "仕事の進め方はどちらに近い？",         left: "柔軟に動く",             right: "計画的に準備する" },
];

const TOTAL = QUESTIONS.length;
const STORAGE_KEY = "vc:diagnosis:answers";

// リッカート円の直径 (px): 5-4-3-4-5 でサイズ差をつける
const CIRCLE_SIZES = [56, 48, 40, 48, 56] as const;

// sticky プログレスバーの高さぶんのオフセット (px)。手動スクロール時に被らないように引く。
const STICKY_OFFSET_PX = 96;
// 次の質問へスクロールする際のアニメーション時間 (ms)
const SCROLL_DURATION_MS = 520;
// 選択アニメを見せてからスクロール開始するまでの遅延 (ms)
const SCROLL_START_DELAY_MS = 180;

// easeInOutCubic: 中盤で速く、両端でゆっくりの自然な曲線
const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// 指定 Y 座標までブラウザの scrollTo を rAF で滑らかに繋いで実行する。
// 標準の behavior:"smooth" は距離に応じて速度が変動するため、手応えを揃えるには自前で書く必要がある。
const smoothScrollTo = (targetY: number, duration: number): void => {
  const startY = window.scrollY;
  const distance = targetY - startY;
  if (Math.abs(distance) < 1) return;
  const startTime = performance.now();
  const step = (now: number) => {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(t);
    window.scrollTo(0, startY + distance * eased);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

export default function DiagnosisPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  // 各質問 li への参照（自動スクロール用）
  const questionRefs = useRef<Array<HTMLLIElement | null>>([]);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === TOTAL;

  const handleSelect = (qid: number, value: number, index: number) => {
    // 初回回答かどうかは setState する前の answers で判定
    const isFirstAnswerForThisQ = !(qid in answers);
    setAnswers((prev) => ({ ...prev, [qid]: value }));

    if (isFirstAnswerForThisQ && index < QUESTIONS.length - 1) {
      // 選択アニメを軽く見せてから、自前のカスタムイージングで次の質問へ滑らかにスクロール
      window.setTimeout(() => {
        const next = questionRefs.current[index + 1];
        if (!next) return;
        const targetY =
          next.getBoundingClientRect().top + window.scrollY - STICKY_OFFSET_PX;
        smoothScrollTo(targetY, SCROLL_DURATION_MS);
      }, SCROLL_START_DELAY_MS);
    }
  };

  const handleSubmit = () => {
    if (!allAnswered) return;
    // 診断ロジック (src/lib/diagnosis-scoring.ts) で 12 パターンの resultId を導出
    const diagnosis = computeDiagnosis(answers);
    const payload = {
      answers,
      resultId: diagnosis.resultId,
      job: diagnosis.job,
      workplace: diagnosis.workplace,
      // デバッグ用: 各職種への距離と stable 合計も残す
      debug: {
        jobDistances: diagnosis.jobDistances,
        stableSum: diagnosis.stableSum,
      },
      answeredAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // localStorage が無効な環境ではスキップ
    }
    router.push("/analyzing");
  };

  return (
    <main className="lp-container diagnosis-bg min-h-screen pb-12 relative">
      {/* === ヘッダー (モダン・ミニマル / 画像なし・テキスト主役) === */}
      <header className="px-6 pt-14 pb-6 text-center relative">
        <p className="text-[10px] tracking-[0.32em] text-text-muted font-semibold mb-2">
          DIAGNOSIS
        </p>
        <h1 className="text-text-primary text-[20px] font-semibold tracking-wider">
          適職<span className="text-brand-primary mx-1 font-bold">×</span>適正年収診断
        </h1>
        {/* 中央寄せの細いオレンジ下線 */}
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-px bg-brand-primary/50" />
      </header>

      {/* === ステップドット型プログレス (sticky top で常時表示) === */}
      <section className="sticky top-0 z-40 px-6 pt-3 pb-3 bg-white/75 backdrop-blur-md border-b border-border-default/60">
        <div className="flex items-center justify-between text-[10px] tracking-[0.22em] text-text-muted font-semibold mb-2">
          <span>PROGRESS</span>
          <span className="tabular-nums text-text-secondary">
            {String(answeredCount).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
          </span>
        </div>
        <ol
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={TOTAL}
          aria-valuenow={answeredCount}
          className="flex items-center"
        >
          {QUESTIONS.map((q, i) => {
            const isAnswered = q.id in answers;
            const isCurrent = !isAnswered && i === answeredCount;
            return (
              <li key={q.id} className="flex items-center flex-1 last:flex-none">
                {/* dot 本体 */}
                <span
                  className={
                    isAnswered
                      ? "block w-2.5 h-2.5 rounded-full bg-brand-primary transition-all duration-300"
                      : isCurrent
                      ? "block w-2.5 h-2.5 rounded-full bg-white border-[1.5px] border-brand-primary ring-2 ring-brand-primary/15 transition-all duration-300"
                      : "block w-1.5 h-1.5 rounded-full bg-border-default transition-all duration-300"
                  }
                />
                {/* dot 間の細線 (最後のドット以外) */}
                {i < QUESTIONS.length - 1 && (
                  <span
                    className={
                      isAnswered
                        ? "flex-1 h-px bg-brand-primary/40 mx-1.5 transition-colors duration-300"
                        : "flex-1 h-px bg-border-default mx-1.5 transition-colors duration-300"
                    }
                  />
                )}
              </li>
            );
          })}
        </ol>
      </section>

      {/* === 質問リスト === */}
      {/* sticky PROGRESS の高さぶん scroll-mt で確保（auto-scroll 時の被り防止） */}
      <ol className="px-5 pt-8 space-y-4">
        {QUESTIONS.map((q, i) => (
          <li
            key={q.id}
            ref={(el) => {
              questionRefs.current[i] = el;
            }}
            className="scroll-mt-24"
          >
            <QuestionCard
              index={i + 1}
              question={q}
              selected={answers[q.id]}
              onSelect={(v) => handleSelect(q.id, v, i)}
            />
          </li>
        ))}
      </ol>

      {/* === CTA (常設・全問前は disabled) === */}
      <div className="px-5 pt-10 flex flex-col items-center">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allAnswered}
          aria-disabled={!allAnswered}
          className={
            allAnswered
              ? "group w-full max-w-[320px] py-4 rounded-full bg-brand-primary text-white font-bold text-[16px] tracking-wide shadow-cta hover:bg-brand-primary-dark transition-colors inline-flex items-center justify-center gap-2"
              : "w-full max-w-[320px] py-4 rounded-full bg-white/70 backdrop-blur-sm text-text-muted font-bold text-[16px] tracking-wide border border-border-default inline-flex items-center justify-center gap-2 cursor-not-allowed"
          }
        >
          診断結果を見る
          <span
            className={
              allAnswered
                ? "text-[14px] transition-transform group-hover:translate-x-0.5"
                : "text-[14px]"
            }
          >
            →
          </span>
        </button>
        {!allAnswered && (
          <p className="text-[11px] text-text-muted mt-3">
            残り <span className="text-brand-primary font-bold tabular-nums">{TOTAL - answeredCount}</span> 問
          </p>
        )}
      </div>
    </main>
  );
}

// =====================================================
// 質問カード (1問分)
// - 白カード + 極薄ボーダー + soft shadow + 大きめ角丸
// - Q.NN を小さく letter-spaced で
// - 5円リッカート (サイズ差 5-4-3-4-5)
// =====================================================
function QuestionCard({
  index,
  question,
  selected,
  onSelect,
}: {
  index: number;
  question: Question;
  selected: number | undefined;
  onSelect: (value: number) => void;
}) {
  return (
    <div className="bg-white border border-border-default/70 rounded-2xl px-5 pt-5 pb-6 shadow-card">
      {/* ナンバリング + ヘアライン */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[11px] tracking-[0.04em] text-brand-primary font-bold">
          Q.{String(index).padStart(2, "0")}
        </span>
        <span className="flex-1 h-px bg-border-default/60" />
      </div>

      {/* 質問文 */}
      <h2 className="text-text-primary text-[15px] font-semibold text-center mb-6 leading-relaxed">
        {question.text}
      </h2>

      {/* 両端の極性ラベル */}
      <div className="flex justify-between text-[10px] text-text-muted mb-2 px-1">
        <span className="max-w-[42%] leading-tight">{question.left}</span>
        <span className="max-w-[42%] leading-tight text-right">{question.right}</span>
      </div>

      {/* 5段階リッカート (サイズ差あり) */}
      <div
        role="radiogroup"
        aria-label={question.text}
        className="flex items-center justify-between"
      >
        {[1, 2, 3, 4, 5].map((v, i) => {
          const size = CIRCLE_SIZES[i];
          const isSelected = selected === v;
          return (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${question.text} ${v}/5`}
              onClick={() => onSelect(v)}
              style={{ width: size, height: size }}
              className={
                isSelected
                  ? "rounded-full bg-brand-primary border-2 border-brand-primary flex items-center justify-center text-white transition-all duration-200 shadow-[0_4px_16px_rgba(255,107,0,0.35)] scale-[1.04]"
                  : "rounded-full bg-white border-[1.5px] border-border-default hover:border-brand-primary/50 transition-all duration-200 active:scale-95"
              }
            >
              {isSelected && (
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="w-1/2 h-1/2"
                  aria-hidden="true"
                >
                  <path
                    d="M5 10.5L8.5 14L15 7"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}