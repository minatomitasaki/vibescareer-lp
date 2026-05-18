// ロゴ案 A: モノグラム印章型
//
// 方向性:
//   - 黒い円形シンボルに "V" を白抜き、内部に小さな上昇矢印
//   - シンボル色: dark charcoal、アクセント: warm orange
//   - 字間広めのジオメトリックサンセリフ
//   - "Vibes" は dark charcoal、"Career" は warm orange (現行と同じ色分け)
//   - クラシックで品のあるブランド感
//
// サイズ感: 高さ 44px 基準 (現行ヘッダーと同じ)

type Props = { height?: number; className?: string };

export function LogoMonogram({ height = 44, className = "" }: Props) {
  return (
    <div
      className={`inline-flex items-center gap-2.5 ${className}`}
      style={{ height }}
    >
      {/* 円形モノグラムシンボル */}
      <svg
        viewBox="0 0 40 40"
        style={{ height: "100%", width: "auto" }}
        aria-hidden
      >
        {/* 外枠の黒い円 */}
        <circle cx="20" cy="20" r="19" fill="#1A1A1A" />
        {/* 中心の "V" */}
        <path
          d="M11 12 L20 28 L29 12"
          stroke="#FFFFFF"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* V の頂点上部に小さな上昇矢印 (オレンジ) */}
        <path
          d="M20 6 L17 9 M20 6 L23 9 M20 6 L20 11"
          stroke="#FF6B00"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {/* ワードマーク */}
      <span
        className="font-black leading-none tracking-tight"
        style={{ fontSize: height * 0.42 }}
      >
        <span style={{ color: "#1A1A1A" }}>Vibes</span>
        <span style={{ color: "#FF6B00" }}>Career</span>
      </span>
    </div>
  );
}
