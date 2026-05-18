// ロゴ案 D: 矢印アクセント (i のドットを上向き三角に置換)
//
// 方向性:
//   - 「VibesCareer」 の "i" のドットを ▲ (上昇矢印) に置き換える
//   - これだけで「キャリア上昇」 の暗喩を効かせる
//   - 主張は控えめだが、見た人が気づくとブランドの賢さを感じる
//   - dotless i (ı) を使ってベース文字を描画し、上に三角を重ねる方式
//   - 全体はクリーンなジオメトリックサンセリフ
//
// サイズ感: 高さ 44px 基準

type Props = { height?: number; className?: string };

export function LogoArrow({ height = 44, className = "" }: Props) {
  const fontSize = height * 0.5;
  return (
    <div
      className={`inline-flex items-center ${className}`}
      style={{ height }}
    >
      <span
        className="font-black leading-none tracking-tight"
        style={{ fontSize, color: "#1A1A1A" }}
      >
        V
      </span>

      {/* 「i」 の代わりに dotless i (ı) + 上に三角矢印 */}
      <span
        className="relative inline-block font-black leading-none tracking-tight"
        style={{ fontSize, color: "#1A1A1A" }}
      >
        {"ı"/* U+0131 = LATIN SMALL LETTER DOTLESS I (大文字風サンセリフでも縦線として描画される) */}
        <span
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 leading-none"
          style={{
            top: `-${fontSize * 0.36}px`,
            fontSize: fontSize * 0.42,
            color: "#FF6B00",
          }}
        >
          ▲
        </span>
      </span>

      <span
        className="font-black leading-none tracking-tight"
        style={{ fontSize, color: "#1A1A1A" }}
      >
        besCareer
      </span>
    </div>
  );
}
