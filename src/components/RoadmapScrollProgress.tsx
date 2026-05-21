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
 * ロードマップ用の pin + フェード切替演出。
 * セクション全体の高さを伸ばし、内側を sticky でビューポートに張り付ける。
 * ページのスクロール量に応じて active step を更新し、対応する STEP カードを
 * フェードイン/アウトで切替表示する。aixinc.co.jp 風の挙動。
 */
export function RoadmapScrollProgress({ steps, children }: Props) {
  const items = Children.toArray(children);
  const [activeStep, setActiveStep] = useState(steps[0]?.step ?? 1);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || steps.length === 0) return;

    let rafId = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const sectionHeight = el.offsetHeight;
      const viewportHeight = window.innerHeight;
      const scrollableRange = Math.max(1, sectionHeight - viewportHeight);
      // -rect.top はピン留め範囲内でスクロールした量
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(0.999, scrolled / scrollableRange));
      const idx = Math.min(steps.length - 1, Math.floor(progress * steps.length));
      setActiveStep(steps[idx]?.step ?? steps[0]?.step ?? 1);
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
    <div
      ref={sectionRef}
      className="roadmap-pin-section"
      style={{ height: `${steps.length * 90}vh` }}
    >
      <div className="roadmap-pin-inner">
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
        <div className="roadmap-stage">
          {items.map((child, i) => {
            const isActive = activeStep === steps[i]?.step;
            return (
              <div
                key={steps[i]?.step ?? i}
                className={"roadmap-card-slide" + (isActive ? " is-active" : "")}
                aria-hidden={!isActive}
              >
                {child}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
