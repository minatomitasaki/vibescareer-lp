"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";

type StepMeta = {
  step: number;
  /** 進捗バー上に表示するラベル (例: "01") */
  label: string;
};

type Props = {
  steps: StepMeta[];
  children: ReactNode;
};

/**
 * ロードマップ用の sticky 進捗バー + スクロール演出ラッパー。
 * children に各 STEP カードを順番に渡すと、左の番号バーが sticky で固定され
 * 画面中央付近にあるカードの番号がハイライトされる。
 */
export function RoadmapScrollProgress({ steps, children }: Props) {
  const items = Children.toArray(children);
  const [activeStep, setActiveStep] = useState(steps[0]?.step ?? 1);
  const refs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (refs.current.length === 0) return;

    let rafId = 0;
    const update = () => {
      const center = window.innerHeight * 0.45;
      let closestIdx = 0;
      let closestDist = Infinity;
      refs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // カードの可視範囲が画面上部に来る前は最初の STEP に固定
        if (rect.bottom < 0) return;
        const cardTop = rect.top;
        const dist = Math.abs(cardTop - center);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      });
      setActiveStep(steps[closestIdx]?.step ?? steps[0]?.step ?? 1);
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        update();
      });
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [steps]);

  const first = steps[0]?.step ?? 1;
  const span = Math.max(1, steps.length - 1);
  const fillPct = ((activeStep - first) / span) * 100;

  return (
    <div className="roadmap-scrollwrap">
      <aside className="roadmap-progress" aria-hidden>
        <div className="roadmap-progress-track">
          <div
            className="roadmap-progress-fill"
            style={{ height: `${fillPct}%` }}
          />
        </div>
        <ul className="roadmap-progress-steps">
          {steps.map((s) => (
            <li
              key={s.step}
              className={
                "roadmap-progress-step" +
                (activeStep >= s.step ? " is-active" : "")
              }
            >
              <span>{s.label}</span>
            </li>
          ))}
        </ul>
      </aside>
      <div className="roadmap-cards">
        {items.map((child, i) => (
          <div
            key={steps[i]?.step ?? i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className="roadmap-card-wrap"
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
