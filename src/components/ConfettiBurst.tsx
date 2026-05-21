"use client";

// 結果ページの遷移演出 — 紙吹雪エフェクト
// マウント直後に左右 + 中央から 3 連発で発火、約 1.5 秒で消える。
// canvas-confetti は body 直下に <canvas> を生やして描画する (DOM 構造には影響しない)。

import { useEffect } from "react";
import confetti from "canvas-confetti";

// ブランドカラー (warm orange + gold + clean white)
const BRAND_COLORS = ["#FF6B00", "#FF8533", "#FFD700", "#FFFFFF", "#FFE5D1"];

export function ConfettiBurst() {
  useEffect(() => {
    // 左から右上に向けて
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0, y: 0.4 },
      angle: 60,
      colors: BRAND_COLORS,
      startVelocity: 55,
    });
    // 右から左上に向けて
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 1, y: 0.4 },
      angle: 120,
      colors: BRAND_COLORS,
      startVelocity: 55,
    });
    // 少し遅れて中央から広がる追い打ち
    const t = window.setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 110,
        origin: { x: 0.5, y: 0.45 },
        colors: BRAND_COLORS,
        startVelocity: 45,
      });
    }, 250);
    return () => window.clearTimeout(t);
  }, []);
  return null;
}
