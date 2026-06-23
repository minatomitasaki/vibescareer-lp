#!/usr/bin/env node
/**
 * パートナー企業ロゴの正規化スクリプト。
 * 白背景の JPG/PNG を「白→透過」「余白trim」「マーキー枠(120x56)比率の箱に contain」で
 * 整え、public/images/<out>.png として保存する。他ロゴと体裁を揃える用途。
 *
 * 使い方:
 *   node scripts/normalize-logo.mjs <入力パス> <出力名(拡張子なし)>
 *   例) node scripts/normalize-logo.mjs C:/Users/.../Desktop/secom.jpg partner-logo-secom
 *
 * 白判定の閾値:
 *   min(r,g,b) >= HI → 完全透過 / <= LO → 完全不透明 / 間は線形フェザー。
 *   薄グレーのロゴ(WA等)を消さないよう LO を高めに取る。
 */
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "images");

const LO = 238; // これ以下の min(r,g,b) は不透明(ロゴ本体として残す)
const HI = 250; // これ以上は透明(白背景)
const BOX_W = 240; // 表示枠 120x56 の 2倍
const BOX_H = 112;

async function main() {
  const [input, outName] = process.argv.slice(2);
  if (!input || !outName) {
    console.error("Usage: node scripts/normalize-logo.mjs <input> <outName(no ext)>");
    process.exit(1);
  }

  // 1) 白→透過 (raw ピクセル操作)
  const base = sharp(input).ensureAlpha();
  const { data, info } = await base
    .raw()
    .toBuffer({ resolveWithObject: true });
  const ch = info.channels; // 4
  for (let i = 0; i < data.length; i += ch) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const mn = Math.min(r, g, b);
    let a;
    if (mn >= HI) a = 0;
    else if (mn <= LO) a = 255;
    else a = Math.round((255 * (HI - mn)) / (HI - LO));
    // 既存のalphaと掛け合わせ(元が透過なら維持)
    data[i + 3] = Math.round((data[i + 3] * a) / 255);
  }

  // 2) trim(透過フチ除去) → 3) 枠比率に contain(透過パディング)
  const out = path.join(OUT_DIR, outName + ".png");
  await sharp(data, { raw: { width: info.width, height: info.height, channels: ch } })
    .png()
    .trim({ threshold: 10 })
    .resize(BOX_W, BOX_H, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(out);

  const m = await sharp(out).metadata();
  console.log(`✓ ${outName}.png  ${m.width}x${m.height}  → ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
