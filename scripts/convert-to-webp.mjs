#!/usr/bin/env node
/**
 * public/images 配下の PNG を WebP に一括変換するスクリプト。
 * 元 PNG は残す (gen:images で再生成されるソースとして温存)。
 *
 * 画像種別に応じて品質を変える:
 *   - ロゴ (logo-*.png / vibes-radar-logo.png)
 *       → lossless (完全に劣化なし、PNG より 20-30% 削減)
 *   - 文字焼き込み大画像 (fv-full / section2-full / section3-full)
 *       → lossy q=95 (日本語文字のエッジを保護)
 *   - その他写真・イラスト全般
 *       → lossy q=90 (PNG とほぼ見分けつかない、70-80% 削減)
 *
 * バックアップ / 旧版 (*.backup.png, *-old.png, *-original.png) は
 * 視覚的参考用なので変換しない。
 *
 * 使い方:
 *   node scripts/convert-to-webp.mjs           # 通常 (既存 webp はスキップ)
 *   node scripts/convert-to-webp.mjs --force   # 強制再生成
 *   node scripts/convert-to-webp.mjs <name>    # 単一ファイル変換
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, "..", "public", "images");

const args = process.argv.slice(2);
const force = args.includes("--force");
const targetFile = args.find((a) => !a.startsWith("--"));

// バックアップ・旧版はソースとして残すので変換しない
const SKIP_PATTERNS = [/\.backup\.png$/, /-old\.png$/, /-original\.png$/];

// 文字を焼き込んだ大画像 → lossy q=95 (エッジ保護)
const HIGH_QUALITY_PATTERNS = [
  /^fv-full\.png$/,
  /^section2-full(\.with-trustline)?\.png$/,
  /^section3-full(\.with-trustline)?\.png$/,
];

// ロゴ系 → lossless
const LOSSLESS_PATTERNS = [/^logo-.*\.png$/, /^vibes-radar-logo\.png$/];

function classify(filename) {
  for (const p of LOSSLESS_PATTERNS) {
    if (p.test(filename)) return { mode: "lossless" };
  }
  for (const p of HIGH_QUALITY_PATTERNS) {
    if (p.test(filename)) return { mode: "lossy", quality: 95 };
  }
  return { mode: "lossy", quality: 90 };
}

function shouldSkip(filename) {
  return SKIP_PATTERNS.some((p) => p.test(filename));
}

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

async function convertOne(png) {
  const pngPath = path.join(IMAGES_DIR, png);
  const webpName = png.replace(/\.png$/, ".webp");
  const webpPath = path.join(IMAGES_DIR, webpName);

  const pngStat = await fs.stat(pngPath);
  const pngSize = pngStat.size;

  if (!force) {
    try {
      await fs.access(webpPath);
      return { png, skipped: true, pngSize };
    } catch {
      /* 存在しないので変換する */
    }
  }

  const cfg = classify(png);
  const options =
    cfg.mode === "lossless"
      ? { lossless: true, effort: 6 }
      : { quality: cfg.quality, effort: 6 };

  await sharp(pngPath).webp(options).toFile(webpPath);
  const webpSize = (await fs.stat(webpPath)).size;
  return { png, webpName, pngSize, webpSize, cfg };
}

async function main() {
  let targets;
  if (targetFile) {
    targets = [targetFile.endsWith(".png") ? targetFile : `${targetFile}.png`];
  } else {
    const entries = await fs.readdir(IMAGES_DIR);
    targets = entries
      .filter((f) => f.endsWith(".png") && !shouldSkip(f))
      .sort();
  }

  let totalBefore = 0;
  let totalAfter = 0;
  let converted = 0;
  let skipped = 0;

  for (const png of targets) {
    try {
      const r = await convertOne(png);
      if (r.skipped) {
        skipped++;
        continue;
      }
      const reduction = ((1 - r.webpSize / r.pngSize) * 100).toFixed(1);
      const label =
        r.cfg.mode === "lossless"
          ? "lossless"
          : `q=${r.cfg.quality}`;
      console.log(
        `✓ ${r.png} ${formatBytes(r.pngSize).padStart(9)} → ${r.webpName} ${formatBytes(r.webpSize).padStart(9)}  -${reduction.padStart(4)}%  [${label}]`,
      );
      totalBefore += r.pngSize;
      totalAfter += r.webpSize;
      converted++;
    } catch (err) {
      console.error(`✗ ${png}: ${err.message}`);
    }
  }

  console.log("");
  console.log(
    `変換: ${converted} 枚 / スキップ (既存 webp): ${skipped} 枚`,
  );
  if (converted > 0) {
    const totalReduction = ((1 - totalAfter / totalBefore) * 100).toFixed(1);
    console.log(
      `合計: ${formatBytes(totalBefore)} → ${formatBytes(totalAfter)}  -${totalReduction}%`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
