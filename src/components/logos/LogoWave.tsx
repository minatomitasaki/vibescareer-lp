// ロゴ案 B: サウンドウェーブ型
//
// 方向性:
//   - 「Vibes」=振動・響き というブランド名のメタファーを音波で表現
//   - 上昇する 2 本の波線で「キャリア成長」 もダブルミーニング
//   - シンボルはオレンジのグラデーション (#FF8533 → #FF6B00)
//   - ワードマークはダーク基調で統一感を出す
//   - モダン・テック感・親しみやすさのバランス
//
// サイズ感: 高さ 44px 基準

type Props = { height?: number; className?: string };

export function LogoWave({ height = 44, className = "" }: Props) {
  const gradientId = "logo-wave-grad";

  return (
    <div
      className={`inline-flex items-center gap-2.5 ${className}`}
      style={{ height }}
    >
      <svg
        viewBox="0 0 56 40"
        style={{ height: "100%", width: "auto" }}
        aria-hidden
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF8533" />
            <stop offset="100%" stopColor="#FF6B00" />
          </linearGradient>
        </defs>

        {/* 上昇する波線 1 (メイン、太め) */}
        <path
          d="M2 28 Q 9 20 16 26 T 30 18 T 46 6"
          stroke={`url(#${gradientId})`}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* 上昇する波線 2 (薄く奥に重ねる) */}
        <path
          d="M2 34 Q 11 28 18 32 T 32 26 T 50 16"
          stroke={`url(#${gradientId})`}
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.45"
        />
        {/* 終端に小さな円 (波の到達点を示唆) */}
        <circle cx="46" cy="6" r="3" fill={`url(#${gradientId})`} />
      </svg>

      {/* ワードマーク: 統一色のジオメトリックサンセリフ */}
      <span
        className="font-black leading-none tracking-tight"
        style={{ fontSize: height * 0.42, color: "#1A1A1A" }}
      >
        VibesCareer
      </span>
    </div>
  );
}
