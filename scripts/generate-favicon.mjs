#!/usr/bin/env node
/**
 * VibesCareer のロゴ画像 (logo-flag.png) から
 * 山シンボル + 旗の部分だけを切り出して、ファビコン用 PNG を生成する。
 *
 * 出力先:
 *   - src/app/icon.png         (32x32, Next.js App Router 規約)
 *   - src/app/apple-icon.png   (180x180, iOS / Android)
 *
 * 元 PNG は「山 (オレンジ) + 旗 (オレンジ + 黒い支柱) + VibesCareer ワードマーク」が
 * 中央配置されたレイアウト。山と V が極めて近接しているため、固定座標による
 * クロップでは V が映り込みやすい。そこで:
 *   1. 画像左半分のオレンジピクセル (= 山 + 旗本体) のバウンディングを走査
 *   2. その上端を少し拡張して旗の支柱 (黒) を含める
 *   3. 周囲に均等な余白 (12%) を入れて正方形にトリミング
 * これで V を含めずに山+旗だけを自動抽出する。
 *
 * 出力時は白背景を透過化 (alpha=0) してダークモードでも違和感を抑える。
 *
 * 使い方:
 *   node scripts/generate-favicon.mjs
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = path.join(
  __dirname,
  "..",
  "public",
  "images",
  "logo-flag.png",
);
const APP_DIR = path.join(__dirname, "..", "src", "app");

// 山+旗のオレンジ色を判定するしきい値
function isOrange(r, g, b) {
  return r >= 200 && g >= 60 && g <= 180 && b <= 90;
}

// 白背景判定 (近-白を透明化するため)
const WHITE_THRESHOLD = 240;

// シンボルの周囲に入れる余白の比率 (シンボルの幅に対する)
const PADDING_RATIO = 0.12;

// 旗の支柱 (黒い細線) を含めるため、オレンジバウンディングの上に追加するピクセル
const FLAGPOLE_EXTRA_TOP = 35;

async function detectSymbolBounds() {
  // 画像左半分のみ走査して、オレンジピクセルのバウンディングを取得
  // (右半分にあるワードマークの V「Career」のオレンジ部分は除外する)
  const { data, info } = await sharp(SOURCE)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const scanRight = Math.floor(width * 0.42); // 左 42% だけ走査

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let orangeCount = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < scanRight; x++) {
      const i = (y * width + x) * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (isOrange(r, g, b)) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        orangeCount++;
      }
    }
  }

  if (orangeCount === 0) {
    throw new Error("オレンジピクセルが見つかりません");
  }

  // 旗の支柱を含めるため上に少し拡張
  minY = Math.max(0, minY - FLAGPOLE_EXTRA_TOP);

  return { minX, minY, maxX, maxY, orangeCount };
}

async function extractAndCenter(bounds) {
  const { minX, minY, maxX, maxY } = bounds;
  const symbolWidth = maxX - minX + 1;
  const symbolHeight = maxY - minY + 1;
  const longestSide = Math.max(symbolWidth, symbolHeight);
  const padding = Math.round(longestSide * PADDING_RATIO);
  const cropSize = longestSide + padding * 2;

  // ワードマーク (V) の左端がシンボル右端の極めて近くにあるため、
  // 右側の余白は最小限 (5px) に固定し、その分を左の余白に寄せる。
  // こうすると V を絶対に含めず、かつシンボル全体が画像内に収まる。
  const rightMargin = 5;
  const cropLeft = Math.max(0, maxX + rightMargin - cropSize + 1);
  const centerY = Math.round((minY + maxY) / 2);
  const cropTop = Math.max(0, centerY - Math.round(cropSize / 2));

  console.log(
    `bounds: x=[${minX}..${maxX}] y=[${minY}..${maxY}] (${symbolWidth}x${symbolHeight})`,
  );
  console.log(
    `crop:   left=${cropLeft} top=${cropTop} size=${cropSize}x${cropSize}`,
  );

  const cropped = sharp(SOURCE).extract({
    left: cropLeft,
    top: cropTop,
    width: cropSize,
    height: cropSize,
  });

  const { data, info } = await cropped
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // 白背景を透明化
  for (let i = 0; i < data.length; i += 4) {
    if (
      data[i] >= WHITE_THRESHOLD &&
      data[i + 1] >= WHITE_THRESHOLD &&
      data[i + 2] >= WHITE_THRESHOLD
    ) {
      data[i + 3] = 0;
    }
  }

  return { data, info };
}

async function writeIcon(rawData, info, size, outPath) {
  await sharp(rawData, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .resize(size, size, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  console.log(`✓ ${path.relative(process.cwd(), outPath)} (${size}x${size})`);
}

async function main() {
  const meta = await sharp(SOURCE).metadata();
  console.log(`source: logo-flag.png (${meta.width}x${meta.height})`);

  const bounds = await detectSymbolBounds();
  const { data, info } = await extractAndCenter(bounds);

  await writeIcon(data, info, 32, path.join(APP_DIR, "icon.png"));
  await writeIcon(data, info, 180, path.join(APP_DIR, "apple-icon.png"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
