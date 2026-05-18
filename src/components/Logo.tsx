// VibesCareer ロゴ
// AI 画像生成 (gpt-image-2) で作ったロゴ画像を表示する。
//
// 採用案: F「山頂の旗」(logo-flag.png) — 2 つの山シルエット + 高い方の頂上に
//          オレンジの旗。/logo-preview で全案見比べ可能。
//          再生成: npm run gen:images -- logo-flag.png
//
// 注: ロゴ画像 (1024x1024) は画像中央にロゴが小さく配置され、周囲に
//     大きな白の余白がある。そのまま高さ固定で表示するとロゴが極端に
//     小さく見える。そこで親要素に幅と高さを与え、object-cover で
//     画像の中央部分（ロゴ部分）を拡大切り抜き表示する。
//
// 画像未生成時は ImagePlaceholder が自動的にプレースホルダー枠を出す。
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

type LogoProps = {
  /** 表示する幅 (px) */
  width?: number;
  /** 表示する高さ (px) */
  height?: number;
  className?: string;
  priority?: boolean;
};

export function Logo({
  width = 160,
  height = 44,
  className = "",
  priority = false,
}: LogoProps) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      <ImagePlaceholder
        src="/images/logo-flag.png"
        alt="VibesCareer"
        label="VibesCareer ロゴ"
        width={1024}
        height={1024}
        priority={priority}
        className="absolute inset-0 !w-full !h-full object-cover"
      />
    </div>
  );
}
