// Section 3: 4人のビジネスパーソン笑顔（権威性訴求）
type Props = { className?: string };

export function TeamFour({ className = "" }: Props) {
  // 4人の色違い設定（Figmaの黄色系トーンを再現）
  const people = [
    { suit: "#F5B842", hair: "#3D2817", skin: "#FFD9B5", isWoman: false },
    { suit: "#1A2845", hair: "#5C3A1F", skin: "#FFD9B5", isWoman: true },
    { suit: "#F5B842", hair: "#3D2817", skin: "#F5C9A5", isWoman: false },
    { suit: "#1A2845", hair: "#5C3A1F", skin: "#FFD9B5", isWoman: false },
  ];

  return (
    <svg
      viewBox="0 0 400 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* 背景の薄い黄色アクセント */}
      <ellipse cx="200" cy="120" rx="190" ry="80" fill="#FFF8E7" />

      {people.map((p, i) => (
        <g key={i} transform={`translate(${30 + i * 95}, 30)`}>
          {/* 体（スーツ） */}
          <path d="M 5 80 Q 5 65 18 60 L 52 60 Q 65 65 65 80 L 65 160 L 5 160 Z" fill={p.suit} />
          {/* 白シャツ */}
          <path d="M 27 60 L 35 78 L 43 60 Z" fill="#FFFFFF" />
          {/* オレンジネクタイ（女性以外） */}
          {!p.isWoman && (
            <path d="M 32 65 L 38 65 L 40 90 L 35 96 L 30 90 Z" fill="#FF6B00" />
          )}
          {/* 首 */}
          <rect x="30" y="48" width="10" height="14" fill={p.skin} />
          {/* 顔 */}
          <ellipse cx="35" cy="32" rx="20" ry="22" fill={p.skin} />
          {/* 髪 */}
          {p.isWoman ? (
            <path d="M 15 28 Q 15 8 35 6 Q 55 8 55 28 L 58 60 L 52 60 L 52 28 Q 52 14 35 14 Q 18 14 18 28 L 18 60 L 12 60 Z" fill={p.hair} />
          ) : (
            <path d="M 15 26 Q 15 8 35 6 Q 55 8 55 26 L 55 22 Q 48 16 35 16 Q 22 16 18 24 Z" fill={p.hair} />
          )}
          {/* 目 */}
          <circle cx="27" cy="34" r="2" fill="#1A1A1A" />
          <circle cx="43" cy="34" r="2" fill="#1A1A1A" />
          {/* 笑顔 */}
          <path d="M 26 42 Q 35 50 44 42" stroke="#3D2817" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* グッドサインの腕（一部だけ） */}
          {(i === 0 || i === 3) && (
            <g>
              <line x1="5" y1="75" x2="-5" y2="55" stroke={p.suit} strokeWidth="8" strokeLinecap="round" />
              <circle cx="-5" cy="50" r="6" fill={p.skin} />
              <text x="-8" y="54" fontSize="10" fontWeight="900" fill="#FF6B00">👍</text>
            </g>
          )}
        </g>
      ))}

      {/* キラキラ装飾 */}
      <g fill="#FFD700">
        <path d="M 30 30 L 33 22 L 36 30 L 44 33 L 36 36 L 33 44 L 30 36 L 22 33 Z" />
        <path d="M 370 30 L 372 24 L 374 30 L 380 32 L 374 34 L 372 40 L 370 34 L 364 32 Z" />
        <path d="M 200 12 L 202 6 L 204 12 L 210 14 L 204 16 L 202 22 L 200 16 L 194 14 Z" />
      </g>
    </svg>
  );
}
