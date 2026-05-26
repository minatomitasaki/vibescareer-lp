"use client";

// UTM パラメータを localStorage に保存するための小さな副作用コンポーネント。
// layout.tsx に置くことで全ページの初回マウント時に発火する。
// 何も描画しない (return null)。

import { useEffect } from "react";
import { captureUtmFromUrl } from "@/lib/utm";

export function UtmCapture() {
  useEffect(() => {
    captureUtmFromUrl();
  }, []);
  return null;
}
