// ロゴ案 C: ミニマル・タイポグラフィのみ
//
// 方向性:
//   - アイコン無し、文字組みだけで成立させる
//   - 小文字 + 中央のドットで区切る (Linear / Stripe / Vercel 系の高級ミニマル)
//   - "vibes·career" のドットだけブランドオレンジでアクセント
//   - 字間広め (tracking) で空気感を出す
//   - 余計な装飾を一切排して "信頼" と "洗練" を前面に
//
// サイズ感: 高さ 44px 基準

type Props = { height?: number; className?: string };

export function LogoMinimal({ height = 44, className = "" }: Props) {
  return (
    <div
      className={`inline-flex items-center ${className}`}
      style={{ height }}
    >
      <span
        className="font-light leading-none lowercase"
        style={{
          fontSize: height * 0.50,
          color: "#1A1A1A",
          letterSpacing: "0.04em",
        }}
      >
        vibes
      </span>
      <span
        className="inline-flex items-center justify-center font-black leading-none"
        style={{
          fontSize: height * 0.7,
          color: "#FF6B00",
          margin: `0 ${height * 0.18}px`,
          lineHeight: 0,
          transform: "translateY(-0.06em)",
        }}
      >
        ·
      </span>
      <span
        className="font-black leading-none lowercase"
        style={{
          fontSize: height * 0.50,
          color: "#1A1A1A",
          letterSpacing: "0.04em",
        }}
      >
        career
      </span>
    </div>
  );
}
