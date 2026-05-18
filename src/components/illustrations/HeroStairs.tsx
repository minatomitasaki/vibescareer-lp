// ヒーローセクション下部: 階段を上るビジネスマン（成長表現）
// 階段 + 上昇矢印 + ビジネスパーソン
type Props = { className?: string };

export function HeroStairs({ className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 280 160"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* 階段（5段） */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={20 + i * 45}
          y={140 - i * 22}
          width="50"
          height={20 + i * 22}
          fill={i % 2 === 0 ? "#4A6FB5" : "#3D5A99"}
          rx="2"
        />
      ))}

      {/* 上昇矢印 */}
      <path
        d="M 30 130 Q 130 100 240 30"
        stroke="#FF6B00"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="0"
      />
      <path
        d="M 240 30 L 232 38 L 244 28 L 240 30 Z M 245 25 L 235 35 L 235 22 Z"
        fill="#FF6B00"
      />

      {/* 上のビジネスマン */}
      <g transform="translate(220, 30)">
        {/* 体 */}
        <path
          d="M -8 30 Q -8 22 -3 19 L 7 19 Q 12 22 12 30 L 12 50 L -8 50 Z"
          fill="#1A2845"
        />
        {/* オレンジネクタイ */}
        <rect x="0" y="22" width="3" height="14" fill="#FF6B00" />
        {/* 首 */}
        <rect x="-3" y="14" width="8" height="6" fill="#F5C9A5" />
        {/* 顔 */}
        <circle cx="2" cy="9" r="9" fill="#FFD9B5" />
        {/* 髪 */}
        <path d="M -7 6 Q -7 -2 2 -2 Q 11 -2 11 6 L 11 4 Q 8 0 2 0 Q -4 0 -7 4 Z" fill="#3D2817" />
        {/* 腕（ガッツポーズ） */}
        <line x1="-8" y1="22" x2="-15" y2="10" stroke="#1A2845" strokeWidth="5" strokeLinecap="round" />
        <line x1="12" y1="22" x2="20" y2="10" stroke="#1A2845" strokeWidth="5" strokeLinecap="round" />
      </g>

      {/* キラキラ */}
      <g fill="#FFD700">
        <path d="M 200 20 L 202 14 L 204 20 L 210 22 L 204 24 L 202 30 L 200 24 L 194 22 Z" />
        <path d="M 250 60 L 251 56 L 252 60 L 256 61 L 252 62 L 251 66 L 250 62 L 246 61 Z" />
      </g>
    </svg>
  );
}
