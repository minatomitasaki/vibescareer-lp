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

async function publicFileExists(srcPath: string): Promise<boolean> {
  try {
    // srcPath は "/images/foo.png" の形 → "public/images/foo.png" を見る
    const cleaned = srcPath.startsWith("/") ? srcPath.slice(1) : srcPath;
    const abs = path.join(process.cwd(), "public", cleaned);
    await access(abs, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// ファイルの mtime (更新時刻) を unix ミリ秒で返す。失敗時は 0。
// これを ?v= クエリに付けることで、画像を上書きしたら URL が変わり
// ブラウザ・CDN・Next.js Image Optimizer すべてのキャッシュを破棄できる。
async function publicFileMtime(srcPath: string): Promise<number> {
  try {
    const cleaned = srcPath.startsWith("/") ? srcPath.slice(1) : srcPath;
    const abs = path.join(process.cwd(), "public", cleaned);
    const s = await stat(abs);
    return s.mtimeMs | 0; // 整数化（クエリ文字列を短く）
  } catch {
    return 0;
  }
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
    // ファイル更新時刻をクエリに付与してキャッシュバスティング
    const mtime = await publicFileMtime(src);
    const versionedSrc = mtime > 0 ? `${src}?v=${mtime}` : src;
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
