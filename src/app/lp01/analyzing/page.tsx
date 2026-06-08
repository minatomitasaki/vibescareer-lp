"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// =====================================================
// 分析中ページ (/analyzing)
// 仕様: design/SPEC.md セクション 3 + 案 3 (ニューラルネット風)
//   - 中央: SVG ネットワーク図。すべての動きを SMIL <animate> で実装。
//     CSS transform は SVG 要素では transform-box/origin の挙動が不安定なため、
//     SVG ネイティブの属性アニメ (r, fill, stroke-dashoffset, opacity) に統一する。
//   - 下部: 「分析中...」 + 残り秒数、英字 eyebrow「CONNECTING YOUR TRAITS」
//   - 3 秒カウントダウン後に /result/[id] へ自動遷移
// =====================================================

const STORAGE_KEY = "vc:diagnosis:answers";
const COUNTDOWN_SECONDS = 3;

// ノード座標 (周囲 4 個 + 中央 1 個)
const NODES = [
  { cx: 100, cy: 30,  delay: "0s"   },
  { cx: 170, cy: 100, delay: "0.6s" },
  { cx: 100, cy: 170, delay: "1.2s" },
  { cx: 30,  cy: 100, delay: "1.8s" },
];

// エッジ (放射 4 本 + ループ 4 本)。begin 値を少しずつズラしてパルスを波打たせる。
const EDGES = [
  // 中央↔周囲
  { x1: 100, y1: 100, x2: 100, y2: 30,  begin: "0s"    },
  { x1: 100, y1: 100, x2: 170, y2: 100, begin: "0.22s" },
  { x1: 100, y1: 100, x2: 100, y2: 170, begin: "0.44s" },
  { x1: 100, y1: 100, x2: 30,  y2: 100, begin: "0.66s" },
  // 周囲↔周囲 (ループ)
  { x1: 100, y1: 30,  x2: 170, y2: 100, begin: "0.88s" },
  { x1: 170, y1: 100, x2: 100, y2: 170, begin: "1.10s" },
  { x1: 100, y1: 170, x2: 30,  y2: 100, begin: "1.32s" },
  { x1: 30,  y1: 100, x2: 100, y2: 30,  begin: "1.54s" },
];

export default function AnalyzingPage() {
  const router = useRouter();
  const [remaining, setRemaining] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    // localStorage から resultId を取得
    let resultId: string | null = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { resultId?: string };
        if (parsed?.resultId) resultId = parsed.resultId;
      }
    } catch {
      // JSON 破損などは無視
    }

    // resultId が無ければ診断やり直しに戻す (2026-06-08 統合で診断は /lp01 内に移動)
    if (!resultId) {
      router.replace("/lp01#lp01-diagnosis-questions");
      return;
    }

    const tickId = window.setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const doneId = window.setTimeout(() => {
      router.replace(`/lp01/result/${resultId}`);
    }, COUNTDOWN_SECONDS * 1000);

    return () => {
      window.clearInterval(tickId);
      window.clearTimeout(doneId);
    };
  }, [router]);

  return (
    <main className="lp-container min-h-screen bg-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* === ニューラルネット SVG (全アニメは SMIL で実装) === */}
      <div className="relative w-[260px] h-[260px] mb-10">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          role="img"
          aria-label="分析中"
        >
          {/* 走査リング 2 枚 (中央から広がる円波) */}
          <circle
            cx="100"
            cy="100"
            r="35"
            fill="none"
            stroke="#FF6B00"
            strokeWidth="1"
            opacity="0.5"
          >
            <animate
              attributeName="r"
              values="35;95;35"
              dur="2.4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.55;0;0.55"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </circle>
          <circle
            cx="100"
            cy="100"
            r="35"
            fill="none"
            stroke="#FF6B00"
            strokeWidth="1"
            opacity="0.5"
          >
            <animate
              attributeName="r"
              values="35;95;35"
              dur="2.4s"
              begin="1.2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.55;0;0.55"
              dur="2.4s"
              begin="1.2s"
              repeatCount="indefinite"
            />
          </circle>

          {/* 静的ベースエッジ (薄いガイド線) */}
          {EDGES.map((e, i) => (
            <line
              key={`base-${i}`}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              stroke="#FF6B00"
              strokeOpacity="0.15"
              strokeWidth="1"
            />
          ))}

          {/* パルスエッジ (dashoffset で流れる光) */}
          {EDGES.map((e, i) => (
            <line
              key={`pulse-${i}`}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              stroke="#FF6B00"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="18 90"
              strokeDashoffset="108"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="108"
                to="-90"
                dur="1.6s"
                begin={e.begin}
                repeatCount="indefinite"
              />
            </line>
          ))}

          {/* 周囲ノード (順次点滅) */}
          {NODES.map((n, i) => (
            <circle
              key={`node-${i}`}
              cx={n.cx}
              cy={n.cy}
              r="7"
              fill="#FFE5D1"
              stroke="#FF6B00"
              strokeWidth="1.5"
            >
              <animate
                attributeName="r"
                values="7;9.5;7"
                dur="2.4s"
                begin={n.delay}
                repeatCount="indefinite"
              />
              <animate
                attributeName="fill"
                values="#FFE5D1;#FF6B00;#FFE5D1"
                dur="2.4s"
                begin={n.delay}
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-width"
                values="1.5;2.5;1.5"
                dur="2.4s"
                begin={n.delay}
                repeatCount="indefinite"
              />
            </circle>
          ))}

          {/* 中央ハブ (常時脈動・濃いオレンジ) */}
          <circle cx="100" cy="100" r="11" fill="#FF6B00">
            <animate
              attributeName="r"
              values="11;13.5;11"
              dur="1.6s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="fill-opacity"
              values="1;0.85;1"
              dur="1.6s"
              repeatCount="indefinite"
            />
          </circle>
          {/* ハブ内側の白点 */}
          <circle cx="100" cy="100" r="4" fill="#FFFFFF" />
        </svg>
      </div>

      {/* === メッセージ === */}
      <p className="text-text-muted text-[10px] tracking-[0.32em] font-semibold mb-3">
        CONNECTING YOUR TRAITS
      </p>
      <h1 className="text-text-primary text-[28px] font-bold tracking-wide mb-4 text-center">
        分析中<span className="text-brand-primary">...</span>
      </h1>
      <p className="text-text-secondary text-[13px] text-center">
        残り{" "}
        <span className="text-brand-primary font-bold tabular-nums text-[18px]">
          {remaining}
        </span>{" "}
        秒で完了します。
      </p>
    </main>
  );
}
