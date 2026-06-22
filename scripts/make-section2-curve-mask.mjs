#!/usr/bin/env node
// LP06 セクション2 用の「右肩上がり曲線」インペイントマスクを生成する。
//
// マスク仕様 (gpt-image-2 images.edit):
//   透明(alpha=0)=再描画 / 不透明(alpha=255)=元画像保持
// 上段(オフィス3声)を再描画、下段(見上げる主人公+リード)を保持。
// 境界は v2 の金ラインに合わせて右肩上がりの緩い曲線にする。

import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(
  __dirname,
  "..",
  "public",
  "images",
  "lp06-section2-mask-top-curve2.png"
);

const W = 1024;
const H = 1536;
const CH = 4;

const buf = Buffer.alloc(W * H * CH);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * CH;
    buf[i] = 0;
    buf[i + 1] = 0;
    buf[i + 2] = 0;
    const t = x / (W - 1); // 0(左)〜1(右)
    // 右肩上がり: 左端 y=735 → 右端 y=470。中央が下に膨らむ緩い曲線。
    const yb = 655 - 245 * t + 50 * Math.sin(t * Math.PI);
    buf[i + 3] = y < yb ? 0 : 255; // 境界より上 = 透明(再描画)
  }
}

await sharp(buf, { raw: { width: W, height: H, channels: CH } })
  .png()
  .toFile(OUT);
console.log("✅ lp06-section2-mask-top-curve.png (右肩上がり曲線マスク)");
