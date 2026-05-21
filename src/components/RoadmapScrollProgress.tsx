"use client";

import {
  Children,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type StepMeta = {
  step: number;
  /** 丸ラベルに表示する文字 (例: "01") */
  label: string;
};

type Props = {
  steps: StepMeta[];
  children: ReactNode;
};

/**
 * ロードマップ用タイムライン演出:
 * - 各 STEP カードの横に丸数字 (01/02/03) を固定配置
 * - その間を縦線で繋ぎ、スクロール進捗に応じて線が下に向かって濃く塗られる
 * - 現在位置に点 (ドット) が走り、現在地を示す
 */
export function RoadmapScrollProgress({ steps, children }: Props) {
  const items = Children.toArray(children);
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let rafId = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // セクション top が画面 70% 位置から、セクション bottom が画面 30% 位置まで
      // 動く間で 0 → 1 の進捗にする
      const start = vh * 0.7;
      const end = -el.offsetHeight + vh * 0.3;
      const span = start - end;
      if (span <= 0) return;
      const raw = (start - rect.top) / span;
      const p = Math.max(0, Math.min(1, raw));
      setProgress(p);
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
  }, []);

  const style = {
    "--progress": `${progress * 100}%`,
  } as CSSProperties;

  return (
    <div ref={sectionRef} className="roadmap-timeline" style={style}>
      <div className="roadmap-timeline-line" aria-hidden>
        <div className="roadmap-timeline-line-fill" />
        <div className="roadmap-timeline-dot" />
      </div>
      <ol className="roadmap-timeline-cards">
        {items.map((child, i) => (
          <li
            key={steps[i]?.step ?? i}
            className="roadmap-timeline-row"
          >
            <div className="roadmap-timeline-num">{steps[i]?.label}</div>
            <div className="roadmap-timeline-card-content">{child}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}
