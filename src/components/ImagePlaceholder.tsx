// 画像プレースホルダー
// イラスト/写真をユーザーが用意する想定。
// public/{src} が存在すればそれを <Image> で表示、
// 存在しない or src未指定なら装飾的な枠＋ラベルを表示する。
//
// 注: サーバーコンポーネントとして実装し、build 時 / リクエスト時に
//     ファイルシステムで存在チェックを行う。これにより未生成画像で
//     "broken image" アイコンが出ることを防ぎ、開発体験を改善する。
//     さらに、ファイルの mtime (更新時刻) をクエリパラメータに付与して
//     画像を上書き再生成したときに自動でキャッシュバスティングする。
import Image from "next/image";
import { access, stat } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";

type Props = {
  src?: string;
  alt: string;
  label: string;
  width: number;
  height: number;
  className?: string;
  rounded?: boolean;
  /** above-the-fold 画像なら true を渡して LCP 最適化 */
  priority?: boolean;
};

// 開発時のみファイル存在チェックと mtime キャッシュバスティングを行う。
// 本番 (Vercel など) の serverless runtime からは public/ への fs アクセスが
// できないため、本番では fs を呼ばずに「画像はある」「クエリは付けない」と扱う。
const IS_DEV = process.env.NODE_ENV === "development";

async function publicFileExists(srcPath: string): Promise<boolean> {
  if (!IS_DEV) return true;
  try {
    const cleaned = srcPath.startsWith("/") ? srcPath.slice(1) : srcPath;
    const abs = path.join(process.cwd(), "public", cleaned);
    await access(abs, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// ファイルの mtime を unix ミリ秒で返す (開発時のキャッシュバスティング用)。
// 本番では 0 を返し、Image URL に ?v= を付けない。
async function publicFileMtime(srcPath: string): Promise<number> {
  if (!IS_DEV) return 0;
  try {
    const cleaned = srcPath.startsWith("/") ? srcPath.slice(1) : srcPath;
    const abs = path.join(process.cwd(), "public", cleaned);
    const s = await stat(abs);
    return s.mtimeMs | 0;
  } catch {
    return 0;
  }
}

// .png で渡された src を .webp に置換する (転送量削減用)。
// 開発時は .webp が無ければ .png にフォールバックし、AI 生成の最新 PNG を
// その場で確認できるようにする。本番は scripts/convert-to-webp.mjs で
// 事前生成済みである前提で常に .webp を返す。
async function resolveWebpSrc(src: string): Promise<string> {
  if (!src.endsWith(".png")) return src;
  const webpSrc = src.replace(/\.png$/, ".webp");
  if (IS_DEV) {
    return (await publicFileExists(webpSrc)) ? webpSrc : src;
  }
  return webpSrc;
}

export async function ImagePlaceholder({
  src,
  alt,
  label,
  width,
  height,
  className = "",
  rounded = false,
  priority = false,
}: Props) {
  // src が指定され、かつファイルが実在する場合のみ <Image> を返す
  if (src && (await publicFileExists(src))) {
    // .png は .webp に置換して転送量を削減 (約 1/10 程度)
    const resolvedSrc = await resolveWebpSrc(src);
    // ファイル更新時刻をクエリに付与してキャッシュバスティング
    const mtime = await publicFileMtime(resolvedSrc);
    const versionedSrc =
      mtime > 0 ? `${resolvedSrc}?v=${mtime}` : resolvedSrc;
    return (
      <Image
        src={versionedSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={`${rounded ? "rounded-2xl" : ""} ${className}`}
      />
    );
  }
  // フォールバック: 装飾的なプレースホルダー枠
  return (
    <div
      className={`relative flex items-center justify-center bg-gradient-to-br from-brand-primary-light/40 via-white to-brand-primary-light/30 border-2 border-dashed border-brand-primary/40 ${
        rounded ? "rounded-2xl" : ""
      } ${className}`}
      style={{ aspectRatio: `${width}/${height}`, maxWidth: width }}
    >
      <div className="text-center px-3">
        <div className="text-2xl mb-1">🖼️</div>
        <p className="text-[10px] text-brand-primary font-bold leading-tight">
          {label}
        </p>
        <p className="text-[9px] text-text-muted mt-0.5">画像差し替え予定</p>
      </div>
    </div>
  );
}
