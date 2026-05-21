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
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = refs.current.findIndex((el) => el === entry.target);
          if (idx >= 0) setActiveStep(steps[idx].step);
        }
      },
      {
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0,
      },
    );

    refs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
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
