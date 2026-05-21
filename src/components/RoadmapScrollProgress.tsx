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
 * ロードマップ用の sticky 進捗バー + 各カードのフェード/ライズ in 演出。
 * - 左の進捗バーは sticky で画面に追従し、画面中央付近のカードに対応する
 *   ステップをハイライト
 * - 各 STEP カードは画面に入った時点で opacity 0 + translateY → 0 で浮き
 *   上がる (aixinc.co.jp の .ps-layer 風アニメーション)
 */
export function RoadmapScrollProgress({ steps, children }: Props) {
  const items = Children.toArray(children);
  const [activeStep, setActiveStep] = useState(steps[0]?.step ?? 1);
  const [revealed, setRevealed] = useState<boolean[]>(() =>
    items.map(() => false),
  );
  const refs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (refs.current.length === 0) return;

    // 進捗バーの active 切替: scroll に応じて画面 45% 位置に最も近いカードを active
    let rafId = 0;
    const update = () => {
      const target = window.innerHeight * 0.45;
      let closestIdx = 0;
      let closestDist = Infinity;
      refs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0) return;
        const dist = Math.abs(rect.top - target);
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

    // 各カードに「画面に入ったら revealed=true」を IntersectionObserver で付与
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = refs.current.findIndex((el) => el === entry.target);
          if (idx < 0) return;
          setRevealed((prev) => {
            if (prev[idx]) return prev;
            const next = [...prev];
            next[idx] = true;
            return next;
          });
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 },
    );
    refs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer.disconnect();
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
            className={
              "roadmap-card-rise" + (revealed[i] ? " is-revealed" : "")
            }
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
