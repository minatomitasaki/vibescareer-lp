import Link from "next/link";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { Logo } from "@/components/Logo";
// 旧 SVG 版コンポーネント (参考表示用に末尾に残す)
import { LogoMonogram } from "@/components/logos/LogoMonogram";
import { LogoWave } from "@/components/logos/LogoWave";
import { LogoMinimal } from "@/components/logos/LogoMinimal";
import { LogoArrow } from "@/components/logos/LogoArrow";

// =====================================================
// ロゴ バリアント比較プレビューページ (/logo-preview)
//
// 本番 LP には影響なし。新ロゴは gpt-image-2 で生成した PNG。
//   生成元プロンプト: scripts/image-manifest.mjs の logo-* エントリ
//   再生成: npm run gen:images -- logo-monogram.png logo-wave.png logo-minimal.png logo-arrow.png
// =====================================================
export default function LogoPreviewPage() {
  const variants = [
    {
      id: "current",
      label: "現行",
      sub: "AI 生成 PNG (logo-vibescareer.png) — 縦バー×3 + 上昇矢印",
      src: "/images/logo-vibescareer.png",
      // 現行画像はロゴ中央配置・周囲白余白の 1024x1024。
      // h:w ≒ 1:3.6 で表示する想定 (Logo.tsx と同じ)
      aspectRatio: 160 / 44,
    },
    // --- 第 2 弾: 現行ワードマーク維持 + シンボルだけ別案 ---
    {
      id: "stairs",
      label: "E: 階段 + 上昇矢印",
      sub: "3 段の階段＋頂上にオレンジ矢印（FV と統一感）",
      src: "/images/logo-stairs.png",
      aspectRatio: 160 / 44,
    },
    {
      id: "flag",
      label: "F: 山頂の旗",
      sub: "2 つの山シルエット + 高い方の頂上に小さなオレンジ旗",
      src: "/images/logo-flag.png",
      aspectRatio: 160 / 44,
    },
    {
      id: "target",
      label: "G: ターゲット",
      sub: "同心円 (チャコール 2 重) + 中心のオレンジドット",
      src: "/images/logo-target.png",
      aspectRatio: 160 / 44,
    },
    {
      id: "spark",
      label: "H: スパーク / 閃き",
      sub: "中央ドット + 8 本の放射ライン (発見・気づき)",
      src: "/images/logo-spark.png",
      aspectRatio: 160 / 44,
    },
    // --- 第 1 弾: ワードマーク自体を変えた案 (参考) ---
    {
      id: "monogram",
      label: "A: モノグラム印章型",
      sub: "黒い円のなかに白 V + 頂上に小さなオレンジ上昇矢印",
      src: "/images/logo-monogram.png",
      aspectRatio: 160 / 44,
    },
    {
      id: "wave",
      label: "B: サウンドウェーブ型",
      sub: "上昇する 2 本の波線 + 統一色ワードマーク",
      src: "/images/logo-wave.png",
      aspectRatio: 160 / 44,
    },
    {
      id: "minimal",
      label: "C: ミニマル・タイポのみ",
      sub: "vibes · career (小文字・字間広め・ドットがオレンジ)",
      src: "/images/logo-minimal.png",
      aspectRatio: 200 / 44,
    },
    {
      id: "arrow",
      label: "D: 矢印アクセント (i ドット置換)",
      sub: "「i」 のドットを ▲ に置き換える賢いタイポ",
      src: "/images/logo-arrow.png",
      aspectRatio: 200 / 44,
    },
  ];

  const svgComponents: Record<string, React.ComponentType<{ height?: number }>> = {
    monogram: LogoMonogram,
    wave: LogoWave,
    minimal: LogoMinimal,
    arrow: LogoArrow,
  };

  return (
    <main className="min-h-screen bg-white px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-16">
        <header>
          <h1 className="text-2xl font-black mb-2">ロゴ パターン比較 (AI 生成版)</h1>
          <p className="text-sm text-text-muted leading-relaxed">
            本番 LP には影響なし。各案は gpt-image-2 で生成した PNG。
            <br />
            末尾には参考として SVG 版も併載しています。
          </p>
          <nav className="mt-4 flex flex-wrap gap-2 text-xs">
            {variants.map((v) => (
              <a key={v.id} href={`#${v.id}`} className="px-2 py-1 bg-bg-subtle rounded text-text-secondary hover:bg-orange-100">
                {v.label}
              </a>
            ))}
          </nav>
        </header>

        {variants.map((v) => (
          <section key={v.id} id={v.id} className="scroll-mt-8 space-y-6">
            <div>
              <h2 className="text-lg font-black pb-2 border-b border-orange-200">{v.label}</h2>
              <p className="text-xs text-text-muted mt-2">{v.sub}</p>
            </div>

            {/* 4 サイズ並べ */}
            <div className="space-y-5 bg-white border border-border-default rounded-lg p-6">
              {[24, 36, 48, 72].map((h) => (
                <div key={h} className="flex items-center gap-6">
                  <span className="text-[10px] font-mono text-text-muted w-12 shrink-0">
                    h={h}px
                  </span>
                  <div className="flex-1">
                    <LogoAi src={v.src} height={h} aspectRatio={v.aspectRatio} alt={v.label} />
                  </div>
                </div>
              ))}
            </div>

            {/* ヘッダーシミュレーション */}
            <div>
              <p className="text-xs font-bold text-text-muted mb-2">ヘッダー設置イメージ</p>
              <div className="relative px-4 py-3 flex items-center justify-start bg-white border border-border-default rounded-lg">
                <LogoAi src={v.src} height={44} aspectRatio={v.aspectRatio} alt={v.label} />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent opacity-50" />
              </div>
            </div>

            {/* ダーク背景 */}
            <div>
              <p className="text-xs font-bold text-text-muted mb-2">ダーク背景での視認性</p>
              <div className="px-6 py-5 bg-[#1a1a1a] rounded-lg">
                <LogoAi src={v.src} height={44} aspectRatio={v.aspectRatio} alt={v.label} />
              </div>
            </div>

            {/* SVG 版 (現行以外) — 比較参考 */}
            {svgComponents[v.id] && (
              <div className="pt-4">
                <p className="text-xs font-bold text-text-muted mb-2">
                  参考: SVG 版 (h=44)
                </p>
                <div className="px-4 py-3 bg-bg-subtle rounded-lg">
                  {(() => {
                    const SvgComp = svgComponents[v.id];
                    return <SvgComp height={44} />;
                  })()}
                </div>
              </div>
            )}
          </section>
        ))}

        <footer className="pt-8 border-t border-orange-100 text-center">
          <Link href="/" className="text-sm text-brand-primary font-bold underline">
            ← 本番 LP に戻る
          </Link>
        </footer>
      </div>
    </main>
  );
}

// =====================================================
// AI 生成 PNG ロゴ表示用ヘルパー
// 元画像は 1024×1024 でロゴが中央配置・周囲白余白。
// 表示時は height を固定し、aspectRatio から width を逆算して
// object-cover で中央部のロゴ帯だけを拡大切り抜き表示する。
// (Logo.tsx と同じ思想)
// =====================================================
function LogoAi({
  src,
  height,
  aspectRatio,
  alt,
}: {
  src: string;
  height: number;
  aspectRatio: number;
  alt: string;
}) {
  const width = Math.round(height * aspectRatio);
  return (
    <div className="relative overflow-hidden" style={{ width, height }}>
      <ImagePlaceholder
        src={src}
        alt={alt}
        label={alt}
        width={1024}
        height={1024}
        className="absolute inset-0 !w-full !h-full object-cover"
      />
    </div>
  );
}
