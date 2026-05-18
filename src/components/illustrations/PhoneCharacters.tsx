// Section 2: スマホ枠 + 男女2人キャラクター（驚き表情）
type Props = { className?: string };

export function PhoneCharacters({ className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 320 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* 中央: スマホ枠 */}
      <g transform="translate(120, 20)">
        {/* スマホ外枠 */}
        <rect x="0" y="0" width="80" height="160" rx="12" fill="#1A1A1A" />
        {/* 画面 */}
        <rect x="4" y="14" width="72" height="132" rx="2" fill="#FFFFFF" />
        {/* ノッチ */}
        <rect x="32" y="6" width="16" height="4" rx="2" fill="#1A1A1A" />
        {/* ホームインジケータ */}
        <rect x="30" y="151" width="20" height="2" rx="1" fill="#FFFFFF" />
        {/* 画面の中身（VibesRadarっぽい円グラフ風） */}
        <circle cx="40" cy="60" r="20" fill="#FFE5D1" />
        <circle cx="40" cy="60" r="20" fill="none" stroke="#FF6B00" strokeWidth="6" strokeDasharray="80 60" transform="rotate(-90 40 60)" />
        <text x="40" y="65" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#FF6B00">75%</text>
        <rect x="14" y="92" width="52" height="4" rx="2" fill="#E5E5E5" />
        <rect x="14" y="100" width="40" height="4" rx="2" fill="#E5E5E5" />
        <rect x="14" y="108" width="46" height="4" rx="2" fill="#E5E5E5" />
        <rect x="14" y="125" width="52" height="14" rx="7" fill="#FF6B00" />
        <text x="40" y="135" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#FFFFFF">START</text>
      </g>

      {/* 左: 男性キャラ（驚き表情） */}
      <g transform="translate(20, 60)">
        {/* 体 */}
        <path d="M 15 70 Q 15 60 22 56 L 38 56 Q 45 60 45 70 L 45 110 L 15 110 Z" fill="#1A2845" />
        {/* 首 */}
        <rect x="26" y="48" width="8" height="10" fill="#F5C9A5" />
        {/* 顔 */}
        <ellipse cx="30" cy="36" rx="14" ry="16" fill="#FFD9B5" />
        {/* 髪 */}
        <path d="M 16 30 Q 16 18 30 16 Q 44 18 44 30 L 44 26 Q 38 22 30 22 Q 22 22 18 26 Z" fill="#3D2817" />
        {/* 目（驚き：丸い大きな目） */}
        <circle cx="24" cy="38" r="2.5" fill="#1A1A1A" />
        <circle cx="36" cy="38" r="2.5" fill="#1A1A1A" />
        {/* 口（驚きの O） */}
        <ellipse cx="30" cy="46" rx="2.5" ry="3.5" fill="#3D2817" />
        {/* びっくりマーク */}
        <text x="6" y="20" fontSize="22" fontWeight="900" fill="#FF6B00">!</text>
      </g>

      {/* 右: 女性キャラ（驚き喜び表情） */}
      <g transform="translate(220, 60)">
        {/* 体（黄色系） */}
        <path d="M 15 70 Q 15 60 22 56 L 38 56 Q 45 60 45 70 L 45 110 L 15 110 Z" fill="#F5B842" />
        {/* 首 */}
        <rect x="26" y="48" width="8" height="10" fill="#F5C9A5" />
        {/* 顔 */}
        <ellipse cx="30" cy="36" rx="14" ry="16" fill="#FFD9B5" />
        {/* 髪（ロング） */}
        <path d="M 14 32 Q 14 16 30 14 Q 46 16 46 32 L 48 56 L 44 56 L 44 32 Q 44 22 30 22 Q 16 22 16 32 L 16 56 L 12 56 Z" fill="#5C3A1F" />
        {/* 目 */}
        <circle cx="24" cy="38" r="2" fill="#1A1A1A" />
        <circle cx="36" cy="38" r="2" fill="#1A1A1A" />
        {/* 笑顔 */}
        <path d="M 25 44 Q 30 50 35 44" stroke="#3D2817" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* キラキラ */}
        <path d="M 50 16 L 52 11 L 54 16 L 59 18 L 54 20 L 52 25 L 50 20 L 45 18 Z" fill="#FFD700" />
      </g>

      {/* 下部の装飾（影） */}
      <ellipse cx="160" cy="190" rx="100" ry="6" fill="#000000" opacity="0.08" />
    </svg>
  );
}
