"use client";

// LP03 ページのマウント直後にスクロール位置を強制リセット。
// globals.css の `html { scroll-behavior: smooth }` が効いていると、
// /lp03/article から /lp03 へクライアント遷移したとき Next.js の自動 top スクロールが
// アニメーション化されてしまい、ヘッダーが「スーッと現れる」見え方になる。
//
// W3C 仕様上 `behavior: "auto"` は CSS の scroll-behavior に従うため上書き不可。
// 強制的に瞬時で飛ばすには `behavior: "instant"` を明示する必要がある (過去コミット 304e945 参照)。

import { useLayoutEffect } from "react";

export function Lp03ScrollReset() {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, []);
  return null;
}
