import Link from "next/link";

// =====================================================
// CTA バリアント D: チケット・特典・期限型
//
// 方向性:
//   - 切符風シェイプ (左右切り欠き + 縦の破線で「控え」を分離)
//   - 上端に折り返しリボン「今だけ特典付」
//   - メイン部: 「無料診断スタート」+「Start Quiz ▶」
//   - 控え部: 「🎁 結果プレゼント有」+「⏰ 残り 12:34:56」(プレビュー用に静的表示)
//   - 限定性・お得感・期限の3点でコンバージョン圧を上げる
// =====================================================
export function CtaButtonTicket({
  withPulse = false,
  trustLine,
}: {
  withPulse?: boolean;
  trustLine?: string;
}) {
  return (
    <div className="flex flex-col items-center">
      {trustLine && (
        <div className="slash-headline mb-4">
          <span className="slash">＼</span>
          <span className="text-[13px] font-black text-text-primary leading-tight">
            {trustLine}
          </span>
          <span className="slash">／</span>
        </div>
      )}

      {/* チケット本体 (左右切り欠き + リボン) */}
      <div className={`relative ${withPulse ? "cta-pulse-ring" : ""}`} style={{ borderRadius: 14 }}>
        {/* 左上の折り返しリボン */}
        <span className="cta-ticket-ribbon">今だけ特典付</span>

        <Link
          href="/lp01#lp01-diagnosis-questions"
          className="cta-ticket group relative w-[330px] flex items-stretch overflow-hidden"
        >
          {/* メイン部: CTA */}
          <div className="flex-1 py-5 pl-7 pr-3 flex flex-col items-start justify-center">
            <span className="text-[11px] font-bold text-brand-primary-dark tracking-widest mb-1">
              FREE DIAGNOSIS
            </span>
            <span className="text-[20px] font-black text-text-primary leading-tight">
              無料診断スタート
            </span>
            <span className="text-[12px] font-bold text-text-secondary mt-1 flex items-center gap-1.5">
              <span>Start Quiz</span>
              <span className="text-brand-primary transition-transform group-hover:translate-x-1">▶</span>
            </span>
          </div>

          {/* 縦の破線 (perforation) */}
          <div className="cta-ticket-perforation" />

          {/* 控え部: 特典 + 期限 */}
          <div className="w-[110px] py-4 pr-5 flex flex-col items-center justify-center text-center">
            <span className="text-[18px] leading-none">🎁</span>
            <span className="text-[10px] font-black text-text-primary mt-1 leading-tight">
              結果<br />プレゼント有
            </span>
            <span className="text-[9px] font-bold text-accent-red mt-2 leading-none flex items-center gap-0.5">
              ⏰<span className="font-mono">12:34:56</span>
            </span>
          </div>
        </Link>
      </div>

      {/* 補助テキスト: 期限の根拠 */}
      <p className="text-[10px] text-text-muted mt-3 font-medium">
        ※ 期間限定キャンペーン (本日 23:59 まで)
      </p>
    </div>
  );
}
