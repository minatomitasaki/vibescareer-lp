// ヒーローセクション: 虫眼鏡を持つビジネスマン
// フラットデザイン風、紺スーツ + ベージュ肌 + 茶髪
type Props = { className?: string };

export function HeroBusinessman({ className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 200 220"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* 背景の薄いオレンジ円（装飾） */}
      <circle cx="100" cy="110" r="95" fill="#FFE5D1" opacity="0.5" />

      {/* 体（紺スーツ） */}
      <path
        d="M 60 130 Q 60 115 75 110 L 125 110 Q 140 115 140 130 L 140 220 L 60 220 Z"
        fill="#1A2845"
      />
      {/* 白シャツ襟元 */}
      <path d="M 90 110 L 100 130 L 110 110 Z" fill="#FFFFFF" />
      {/* オレンジネクタイ */}
      <path d="M 95 115 L 105 115 L 108 145 L 100 155 L 92 145 Z" fill="#FF6B00" />

      {/* 首 */}
      <rect x="92" y="92" width="16" height="20" fill="#F5C9A5" />
      {/* 顔 */}
      <ellipse cx="100" cy="78" rx="28" ry="32" fill="#FFD9B5" />
      {/* 髪 */}
      <path
        d="M 72 70 Q 72 45 100 42 Q 128 45 128 70 L 128 60 Q 120 52 100 52 Q 80 52 76 62 Z"
        fill="#3D2817"
      />
      {/* 眉 */}
      <path d="M 85 72 Q 90 70 95 72" stroke="#3D2817" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 105 72 Q 110 70 115 72" stroke="#3D2817" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* 目 */}
      <circle cx="90" cy="80" r="2" fill="#1A1A1A" />
      <circle cx="110" cy="80" r="2" fill="#1A1A1A" />
      {/* 口 */}
      <path d="M 94 92 Q 100 96 106 92" stroke="#3D2817" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* 虫眼鏡（左手で持つ） */}
      {/* 取っ手 */}
      <line
        x1="20"
        y1="180"
        x2="50"
        y2="150"
        stroke="#5A3015"
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* レンズ枠 */}
      <circle cx="60" cy="140" r="25" fill="#FFFFFF" fillOpacity="0.4" stroke="#1A1A1A" strokeWidth="5" />
      {/* 反射ハイライト */}
      <path d="M 48 130 Q 52 125 58 124" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* 腕（左） */}
      <path
        d="M 60 130 Q 50 135 55 145 L 60 165"
        stroke="#1A2845"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
      />

      {/* キラキラ装飾 */}
      <g fill="#FFD700">
        <path d="M 165 60 L 170 50 L 175 60 L 185 65 L 175 70 L 170 80 L 165 70 L 155 65 Z" />
        <path d="M 30 70 L 33 64 L 36 70 L 42 73 L 36 76 L 33 82 L 30 76 L 24 73 Z" />
        <path d="M 175 130 L 178 124 L 181 130 L 187 133 L 181 136 L 178 142 L 175 136 L 169 133 Z" />
      </g>
    </svg>
  );
}
