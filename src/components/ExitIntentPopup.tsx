"use client";

// 離脱 POP (exit-intent モーダル)
//
// 発火条件:
//   - PC: マウスがブラウザ上端を超えて出た瞬間 (mouseleave to viewport top)
//   - モバイル:
//       1) ページを開いてから 2 分経過
//       2) 別タブ・別アプリから戻った瞬間 (visibilitychange: hidden → visible)
//       3) ブラウザ「戻る」ボタンを押した瞬間 (history.pushState ダミー + popstate)
//
// セッション中は 1 回だけ表示。閉じた後は再発火しない (sessionStorage で抑制)。
// クリックすると #form (申込フォームセクション) にスムーズスクロールしてモーダルを閉じる。
//
// A/B バリアント:
//   - "a" : VibesRadar 受検チケット ¥3,300 → ¥0 訴求 (デフォルト)
//   - "b" : 個別キャリア面談 ¥9,980 → ¥0 訴求 (?v=b 経由)

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "vc:exit-popup:shown";
const MOBILE_TIMEOUT_MS = 2 * 60 * 1000; // 2 分

function isMobileUA(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function alreadyShown(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markShown(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* sessionStorage が無効でも続行 */
  }
}

export function ExitIntentPopup() {
  const searchParams = useSearchParams();
  const version: "a" | "b" = searchParams.get("v") === "b" ? "b" : "a";
  const [open, setOpen] = useState(false);
  const firedRef = useRef(false); // 多重発火防止 (cleanup 待たずに同期で弾く)

  const fire = useCallback(() => {
    if (firedRef.current) return;
    if (alreadyShown()) return;
    firedRef.current = true;
    markShown();
    setOpen(true);
  }, []);

  // PC: マウスが上端を超えた時に発火
  useEffect(() => {
    if (isMobileUA()) return;
    const handler = (e: MouseEvent) => {
      // relatedTarget が null かつ Y 座標が小さい時のみ (= viewport 上端から離脱)
      if (e.clientY <= 0 && e.relatedTarget === null) {
        fire();
      }
    };
    document.addEventListener("mouseout", handler);
    return () => document.removeEventListener("mouseout", handler);
  }, [fire]);

  // モバイル: 2 分経過で発火
  useEffect(() => {
    if (!isMobileUA()) return;
    const id = window.setTimeout(fire, MOBILE_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [fire]);

  // モバイル: 別タブから戻った瞬間 (visibilitychange: hidden → visible)
  useEffect(() => {
    if (!isMobileUA()) return;
    let wasHidden = document.visibilityState === "hidden";
    const handler = () => {
      if (document.visibilityState === "hidden") {
        wasHidden = true;
      } else if (document.visibilityState === "visible" && wasHidden) {
        wasHidden = false;
        fire();
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [fire]);

  // モバイル: ブラウザ「戻る」ボタン捕捉
  // ページ表示時にダミー履歴を 1 件積み、popstate (= 戻ろうとした瞬間) を捕まえる。
  // 捕捉後、もう一度 pushState で履歴を補充し、ユーザーが再度「戻る」を押せば
  // 本当に前のページに戻れるようにする (= 1 回だけ引き止める振る舞い)。
  useEffect(() => {
    if (!isMobileUA()) return;
    const stamp = `vc-exit-${Date.now()}`;
    history.pushState({ stamp }, "", location.href);
    const handler = () => {
      fire();
      // POP を出した後、即座に履歴を補充しても良いが、補充するとさらに
      // 「戻る」を押し続けても抜けられなくなるため、補充は 1 回のみ。
      // ここでは追加補充しない (= 2 回目の戻るで実際に前のページへ行ける)。
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [fire]);

  // モーダルを閉じる
  const close = useCallback(() => setOpen(false), []);

  // CTA クリック: #form へスクロール + 閉じる
  const onCtaClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      close();
      const target = document.getElementById("form");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [close],
  );

  if (!open) return null;

  const imageSrc =
    version === "b" ? "/images/exit-popup-b.png" : "/images/exit-popup-a.png";
  const altText =
    version === "b"
      ? "個別キャリア面談 + VibesRadar の 2 つを無料でセット (合計 ¥6,600 相当)"
      : "ちょっと待って！VibesRadar 受検チケット ¥3,300 が失効する前に受け取る";
  const ctaLabel =
    version === "b" ? "個別面談を予約する" : "無料チケットを受け取る";
  // 画像は A 版が縦長 (1024x1536)、B 版が正方形 (1024x1024)
  const imageHeight = version === "b" ? 1024 : 1536;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="特典のご案内"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
      onClick={close}
    >
      <div
        className="relative w-full max-w-[360px] bg-white rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン (背景・境界線・影でコントラストを高め視認性向上) */}
        <button
          type="button"
          onClick={close}
          aria-label="閉じる"
          className="absolute top-2.5 right-2.5 z-10 w-9 h-9 rounded-full bg-white text-text-primary flex items-center justify-center text-xl leading-none shadow-md border border-border-default hover:bg-gray-50"
        >
          ✕
        </button>

        {/* メインビジュアル (A 版: 1024x1536 縦長 / B 版: 1024x1024 正方形)
            画像内 reassurance line は削除済み。HTML 側で画像の真下に
            reassurance line + CTA を通常配置 (absolute 重ね配置だと画像内の
            価格カード等と被るため、ノーマルフローで密接配置に変更) */}
        <Image
          src={imageSrc}
          alt={altText}
          width={1024}
          height={imageHeight}
          priority
          className="w-full h-auto block"
        />
        {version === "a" && (
          <p className="px-4 pt-2 text-center text-[13px] font-semibold text-text-primary leading-snug">
            まずは、
            <span className="bg-brand-primary/15 px-1 rounded-sm">
              2026年最新の適性検査
            </span>
            で自己分析！
          </p>
        )}
        <div className="px-4 pt-2 pb-4">
          <a
            href="#form"
            onClick={onCtaClick}
            className="btn-cta-radar group w-full text-center"
          >
            <span className="relative z-10">{ctaLabel}</span>
            <span className="relative z-10 inline-block transition-transform group-hover:translate-x-1">
              ▶
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
