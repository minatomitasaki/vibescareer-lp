#!/usr/bin/env node
// 漫画コマの吹き出し・ナレーション枠だけをインペイント (部分再描画) するための
// マスク画像を生成する。
//
// マスク仕様 (OpenAI gpt-image-2 images.edit API):
//   - 透明領域 (alpha = 0) が再描画される
//   - 不透明領域 (alpha = 255) は元画像が保持される
// よって「吹き出し / ナレ枠 = 透明」「キャラ・背景 = 不透明」となる PNG を作る。
//
// サイズはコマ画像 (1024x1536) と一致させる必要がある。

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "public", "images");

const CANVAS_W = 1024;
const CANVAS_H = 1536;

// 各コマの透明化したい矩形 (x, y, width, height) ピクセル単位。
// 現状の生成結果を目視で確認して bbox を保守的に大きめに取っている。
const MASKS = {
  "lp03-manga-01-mask.png": [
    [430, 15, 580, 170], // ナレ枠 (右上) — 横 580x縦 170 に拡大
    [25, 50, 580, 380], // 吹き出し (左上) — 横 580x縦 380 に拡大
  ],
  "lp03-manga-02-mask.png": [
    [430, 15, 580, 150], // ナレ枠 (右上)
    [25, 50, 480, 290], // 心の声 A (左上)
    [310, 200, 540, 320], // 心の声 B (中央右)
  ],
  "lp03-manga-03-mask.png": [
    [430, 15, 570, 180], // ナレ枠 (右上)
    [25, 50, 460, 290], // 楕円 A (左、同僚A)
    [400, 80, 530, 290], // 楕円 B (中央、同僚B)
  ],
  "lp03-manga-04-mask.png": [
    [30, 20, 950, 420], // 心の声 (上部、長文)
  ],
  "lp03-manga-05-mask.png": [
    [430, 15, 580, 170], // ナレ枠削除用 (オフィス背景で埋める)
    [25, 50, 800, 500], // 心の声 (拡大、左上から大きく)
  ],
  "lp03-manga-06-mask.png": [
    [430, 15, 580, 200], // ナレ枠 (右上)
    [25, 50, 580, 380], // 心の声 (左上)
  ],
  "lp03-manga-07-mask.png": [
    [430, 15, 580, 220], // ナレ枠 (右上)
    [25, 50, 580, 400], // 心の声 (左上、長文)
  ],
  // 章 2 (コマ 8-12)
  "lp03-manga-08-mask.png": [
    [580, 15, 420, 220], // ナレ枠 (右上)
    [25, 50, 420, 280], // 心の声 (左上)
    [400, 580, 470, 380], // スマホ画面の通知エリア (大きく書き直し)
  ],
  "lp03-manga-09-mask.png": [
    [580, 15, 420, 180], // ナレ枠 (右上)
    [25, 50, 420, 280], // 発話 (左上、ダイスケ)
    [530, 200, 470, 320], // 心の声 (中央右)
  ],
  "lp03-manga-10-mask.png": [
    [560, 15, 440, 180], // ナレ枠削除用 (居酒屋背景で埋める)
    [25, 50, 530, 280], // 発話 (左上、ダイスケ、長文)
    [540, 200, 460, 180], // 発話 (中央右、主人公、新規)
    [540, 400, 460, 200], // 心の声 (中央右下、主人公、新規)
  ],
  "lp03-manga-11-mask.png": [
    [40, 25, 940, 340], // 発話 (上部全体、長文)
  ],
  "lp03-manga-12-mask.png": [
    [580, 15, 420, 240], // ナレ枠 (右上、長文)
    [25, 50, 530, 340], // 発話 (左上、ダイスケ、長文)
    [320, 250, 350, 200], // 心の声 (中央)
  ],
  // 章 3 (コマ 13-22)
  "lp03-manga-13-mask.png": [
    [25, 50, 530, 290], // 発話 A (左上、ダイスケ)
    [430, 280, 570, 270], // 発話 B (中央右、主人公)
  ],
  "lp03-manga-14-mask.png": [
    [25, 25, 970, 400], // 発話 (上部全体、長文)
  ],
  "lp03-manga-15-mask.png": [
    [25, 50, 480, 280], // 発話 (左上、主人公)
    [500, 80, 500, 320], // 心の声 (右上)
  ],
  "lp03-manga-16-mask.png": [
    [25, 25, 970, 330], // 発話 (上部全体)
  ],
  "lp03-manga-17-mask.png": [
    [25, 25, 970, 370], // 発話 (上部全体、長文)
  ],
  "lp03-manga-18-mask.png": [
    [25, 50, 530, 290], // 発話 A (左上、ダイスケ)
    [430, 240, 570, 280], // 発話 B (中央右、主人公)
  ],
  "lp03-manga-19-mask.png": [
    [25, 25, 970, 430], // 発話 (上部全体、長文)
  ],
  "lp03-manga-20-mask.png": [
    [25, 50, 530, 310], // 発話 (左上、ダイスケ)
    [550, 100, 450, 320], // 心の声 (右上)
  ],
  "lp03-manga-21-mask.png": [
    [430, 15, 580, 180], // ナレ枠 (右上)
    [25, 50, 580, 360], // 発話 (左上、ダイスケ、長文)
  ],
  "lp03-manga-22-mask.png": [
    [25, 25, 970, 340], // 発話 (上部全体)
  ],
  // 章 4 (コマ 23-27)
  "lp03-manga-23-mask.png": [
    [25, 25, 970, 280], // 発話 (上部全体、主人公)
  ],
  "lp03-manga-24-mask.png": [
    [430, 15, 580, 150], // ナレ枠 (右上)
    [25, 50, 540, 340], // 心の声 (左上、長文)
  ],
  "lp03-manga-25-mask.png": [
    [430, 15, 580, 150], // ナレ枠 (右上)
    [25, 50, 510, 340], // 発話 (左上、アドバイザー、長文)
    [450, 300, 550, 320], // 心の声 (中央右)
  ],
  "lp03-manga-26-mask.png": [
    [25, 25, 540, 380], // 発話 A (左上、アドバイザー、長文)
    [500, 320, 500, 320], // 発話 B (中央右、主人公)
  ],
  "lp03-manga-27-mask.png": [
    [430, 15, 580, 160], // ナレ枠 (右上)
    [25, 50, 540, 320], // 発話 A (左上、主人公)
    [550, 200, 450, 280], // 発話 B (中央右、上司)
  ],
};

async function makeMask(filename, rects) {
  const channels = 4;
  const buf = Buffer.alloc(CANVAS_W * CANVAS_H * channels);
  // 初期: 全ピクセル不透明黒 (alpha = 255) — 元画像が保持される領域
  for (let i = 0; i < CANVAS_W * CANVAS_H; i++) {
    buf[i * 4] = 0;
    buf[i * 4 + 1] = 0;
    buf[i * 4 + 2] = 0;
    buf[i * 4 + 3] = 255;
  }
  // 各 rect を透明 (alpha = 0) にする — その領域が再描画される
  for (const [x, y, w, h] of rects) {
    for (let yy = y; yy < y + h; yy++) {
      if (yy < 0 || yy >= CANVAS_H) continue;
      for (let xx = x; xx < x + w; xx++) {
        if (xx < 0 || xx >= CANVAS_W) continue;
        buf[(yy * CANVAS_W + xx) * 4 + 3] = 0;
      }
    }
  }
  const outPath = path.join(OUTPUT_DIR, filename);
  await sharp(buf, {
    raw: { width: CANVAS_W, height: CANVAS_H, channels },
  })
    .png()
    .toFile(outPath);
  console.log(`✅ ${filename} (${rects.length} rect)`);
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const args = process.argv.slice(2);
  const targets = args.length
    ? Object.fromEntries(
        Object.entries(MASKS).filter(([name]) => args.includes(name))
      )
    : MASKS;
  for (const [name, rects] of Object.entries(targets)) {
    await makeMask(name, rects);
  }
  console.log(`\n✨ 完了: ${Object.keys(targets).length} 件`);
}

main().catch((err) => {
  console.error("💥 エラー:", err);
  process.exit(1);
});
