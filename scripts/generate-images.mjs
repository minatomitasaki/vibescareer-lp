#!/usr/bin/env node
// OpenAI gpt-image-2 (ChatGPT Images 2.0 / 2026年4月リリース) を使用して
// LP 用イラストを生成し public/images/ に保存する
//
// 使い方:
//   1. .env.local に OPENAI_API_KEY を設定
//   2. npm run gen:images           ... 未生成の画像のみを生成
//      npm run gen:images -- --force ... 既存ファイルを上書きして再生成
//      npm run gen:images -- hero-businessman.png ... 特定ファイルのみ生成
//
// 依存追加なし: Node.js 18+ の組み込み fetch / fs / path のみを使用

import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { IMAGES } from "./image-manifest.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "public", "images");
const ENV_FILE = path.join(PROJECT_ROOT, ".env.local");
// 参照画像なしのテキスト→画像生成
const OPENAI_GEN_ENDPOINT = "https://api.openai.com/v1/images/generations";
// 参照画像を使ったスタイル転送 / 編集
const OPENAI_EDIT_ENDPOINT = "https://api.openai.com/v1/images/edits";

// ---------------------------------------------------------------------------
// .env.local を読み込んで process.env に反映する簡易ローダー
// (Next.js のビルド時には自動で読まれるが、このスクリプトは単独実行のため自前ロード)
// ---------------------------------------------------------------------------
async function loadDotEnv(filePath) {
  try {
    const text = await readFile(filePath, "utf8");
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      // 先頭末尾のクォートを剥がす
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
    // .env.local が無くてもエラーにしない (環境変数で渡されているケースのため)
  }
}

// ---------------------------------------------------------------------------
// 既存ファイル存在チェック
// ---------------------------------------------------------------------------
async function fileExists(p) {
  try {
    await access(p, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// gpt-image-2 (ChatGPT Images 2.0) で 1枚生成し base64 を返す
// references が指定されていれば /v1/images/edits を使い、それらの画像を
// スタイル参照として渡す。指定がなければ /v1/images/generations を使う。
// ---------------------------------------------------------------------------
async function generateImage({
  apiKey,
  prompt,
  size,
  quality,
  background,
  references, // optional: 参照画像ファイル名の配列 (public/images/ 配下のファイル名)
  mask,       // optional: マスク画像ファイル名 (public/images/ 配下)
              //           透明領域 (alpha=0) のみが再描画され、不透明領域は image[0] が保持される。
              //           OpenAI の仕様上、mask は image[] の先頭画像にのみ適用される。
}) {
  // === 参照画像あり: /v1/images/edits を使う (multipart/form-data) ===
  if (references && references.length > 0) {
    const form = new FormData();
    form.append("model", "gpt-image-2");
    form.append("prompt", prompt);
    form.append("size", size);
    form.append("quality", quality);
    form.append("n", "1");
    if (background) form.append("background", background);

    // 参照画像を image[] として複数回 append (Python SDK の image=[...] と同等)
    for (const refName of references) {
      const absPath = path.join(OUTPUT_DIR, refName);
      const buf = await readFile(absPath);
      // Node 18+ の Blob は global で利用可能
      const blob = new Blob([buf], { type: "image/png" });
      form.append("image[]", blob, refName);
    }

    // インペイント用マスクを渡すと image[0] の透明部分だけが再描画される。
    // mask は references[0] と同じピクセル寸法であることが必須 (scripts/make-mask.mjs で生成)。
    if (mask) {
      const maskPath = path.join(OUTPUT_DIR, mask);
      const maskBuf = await readFile(maskPath);
      const maskBlob = new Blob([maskBuf], { type: "image/png" });
      form.append("mask", maskBlob, mask);
    }

    const res = await fetch(OPENAI_EDIT_ENDPOINT, {
      method: "POST",
      headers: {
        // Content-Type は FormData が boundary 付きで自動設定するので指定しない
        Authorization: `Bearer ${apiKey}`,
      },
      body: form,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "(本文取得失敗)");
      throw new Error(
        `OpenAI API (edits) エラー status=${res.status} body=${errText.slice(
          0,
          500
        )}`
      );
    }

    const json = await res.json();
    const b64 = json?.data?.[0]?.b64_json;
    if (!b64) {
      throw new Error(
        `レスポンスに b64_json が含まれていません: ${JSON.stringify(json).slice(
          0,
          300
        )}`
      );
    }
    return Buffer.from(b64, "base64");
  }

  // === 参照画像なし: /v1/images/generations を使う (従来通り JSON) ===
  const body = {
    model: "gpt-image-2",
    prompt,
    size,
    quality,
    n: 1,
    // 注: gpt-image-2 は response_format パラメータ非対応 (常に b64_json で返却)
  };
  if (background) body.background = background;

  const res = await fetch(OPENAI_GEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "(本文取得失敗)");
    throw new Error(
      `OpenAI API エラー status=${res.status} body=${errText.slice(0, 500)}`
    );
  }

  const json = await res.json();
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error(
      `レスポンスに b64_json が含まれていません: ${JSON.stringify(json).slice(
        0,
        300
      )}`
    );
  }
  return Buffer.from(b64, "base64");
}

// ---------------------------------------------------------------------------
// メイン
// ---------------------------------------------------------------------------
async function main() {
  await loadDotEnv(ENV_FILE);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error(
      "❌ OPENAI_API_KEY が設定されていません。.env.local を確認してください。"
    );
    process.exit(1);
  }

  // 引数解析
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const onlyTargets = args.filter((a) => !a.startsWith("--"));

  await mkdir(OUTPUT_DIR, { recursive: true });

  const targets = IMAGES.filter(
    (img) => onlyTargets.length === 0 || onlyTargets.includes(img.file)
  );

  if (targets.length === 0) {
    console.warn("⚠️ 対象の画像がマニフェスト内に見つかりませんでした。");
    return;
  }

  console.log(
    `📦 生成対象: ${targets.length} 件 / 保存先: ${path.relative(
      PROJECT_ROOT,
      OUTPUT_DIR
    )}\n`
  );

  let okCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const img of targets) {
    const outPath = path.join(OUTPUT_DIR, img.file);

    if (!force && (await fileExists(outPath))) {
      console.log(`⏭️  ${img.file} は既に存在します (--force で上書き)`);
      skipCount++;
      continue;
    }

    const refLabel = img.references?.length
      ? ` [refs: ${img.references.join(", ")}]`
      : "";
    const maskLabel = img.mask ? ` [mask: ${img.mask}]` : "";
    process.stdout.write(
      `🎨 ${img.file} 生成中 (${img.size}/${img.quality})${refLabel}${maskLabel}…`
    );
    try {
      const buf = await generateImage({
        apiKey,
        prompt: img.prompt,
        size: img.size,
        quality: img.quality,
        background: img.background,
        references: img.references,
        mask: img.mask,
      });
      await writeFile(outPath, buf);
      console.log(` ✅ ${(buf.byteLength / 1024).toFixed(1)} KB`);
      okCount++;
    } catch (err) {
      console.log(" ❌");
      console.error(`   → ${err.message}`);
      failCount++;
    }
  }

  console.log(
    `\n✨ 完了: 成功 ${okCount} / スキップ ${skipCount} / 失敗 ${failCount}`
  );
  if (failCount > 0) process.exit(1);
}

main().catch((err) => {
  console.error("💥 予期せぬエラー:", err);
  process.exit(1);
});
