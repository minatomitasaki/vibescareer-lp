import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

// 入口LP
// 仕様: design/SPEC.md セクション1
// 方針: FV / Section2 / Section3 はすべて 1枚画像 (AI 生成) に焼き込み済み。
//       CTA ボタンのみ押下可能性を保つため HTML で独立配置している。
export default function Home() {
  return (
    <main className="lp-container bg-white">
      {/* ヘッダー: ロゴを左寄せ */}
      <header className="relative px-4 py-3 flex items-center justify-start bg-white">
        <Logo width={160} height={44} priority />
        {/* 下端に薄いオレンジのライン（境界線をリッチに） */}
        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent" />
      </header>

      {/* === Section 1: ヒーロー (FV) === */}
      <ImageSection
        src="/images/fv-full.png"
        label="FV: 適職・適正年収 15秒診断"
        alt="適職・適正年収 15秒診断 — え！？私ってこんなポテンシャルあったの！？ 2,400以上の論文・5,000以上の企業データをもとに開発した独自アルゴリズムで、最適な職種と適正な年収がすぐわかる。たった8問15秒で完了。統計学のプロ集団が開発。未経験から年収100万円UPを実現。"
        ctaTrustLine="転職を成功させた第２新卒が最初に受けています！"
        ctaWithPulse
        priority
      />

      {/* === Section 2: 15秒診断でわかること ===
          画像はトラストライン部分をクロップ済み (1024x1456、下端 80px カット)。
          トラストラインは ctaTrustLine で HTML 側に表示する。
          画像自体に背景色が入っているのでセクション背景は白で揃える。 */}
      <ImageSection
        src="/images/section2-full.png"
        label="Section 2: 15秒診断でわかること"
        alt="15秒診断でわかること。ABOUT。3ステップ：①適職と適正年収が分かる、②具体的な手順がわかる、③マッチした求人を知れる。"
        imageHeight={1456}
        ctaTrustLine="診断後、嬉しいプレゼントをご用意しています！"
        ctaWithPulse
      />

      {/* === Section 3: 権威性訴求 ===
          画像はトラストライン部分をクロップ済み (1024x1406、下端 130px カット)。
          トラストラインは ctaTrustLine で HTML 側に表示する。 */}
      <ImageSection
        src="/images/section3-full.png"
        label="Section 3: 権威性訴求"
        alt="AUTHORITY。利用者数77万人を誇る事業会社が開発した2026年最新の適性診断。3つの強み：①統計学の専門家集団が全面監修、②2,400以上の学術論文をもとに構築、③欧米を中心とした世界各国のビッグデータ解析。"
        imageHeight={1406}
        ctaTrustLine="転職を成功させた第２新卒が最初に受けています！"
        ctaWithPulse
      />

      {/* フッター: VibesCareer ロゴを中央配置
          本番リリース時には下記の法的情報のリンク追加が必要：
          - 特定商取引法に基づく表記
          - プライバシーポリシー
          - 会社概要 / 利用規約
          人材紹介事業のため特に上記の整備は必須。 */}
      <footer className="relative px-4 py-9 flex flex-col items-center gap-3 bg-white">
        <span
          aria-hidden
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent"
        />
        <Logo width={140} height={40} />
        <p className="text-[11px] text-text-muted tracking-wider">
          © VibesCareer
        </p>
      </footer>
    </main>
  );
}

// =====================================================
// 共通: 1枚画像 + CTAボタンで構成されるセクション
// FV / Section2 / Section3 すべてこのパターン
// CTAの上にオプションでトラストライン（＼…／）を出せる
//
// height は画像の実寸縦サイズ。Section 2 はトラストライン部分をクロップ済み
// (1024x1426) なのでデフォルトの 1536 と異なる値を渡す必要がある。
// =====================================================
function ImageSection({
  src,
  label,
  alt,
  background = "bg-white",
  ctaWithPulse = false,
  ctaTrustLine,
  priority = false,
  imageHeight = 1536,
}: {
  src: string;
  label: string;
  alt: string;
  background?: string;
  ctaWithPulse?: boolean;
  ctaTrustLine?: string;
  priority?: boolean;
  imageHeight?: number;
}) {
  return (
    <section className={`relative pt-2 pb-12 ${background} overflow-hidden`}>
      <div className="flex justify-center">
        <ImagePlaceholder
          src={src}
          label={label}
          alt={alt}
          width={1024}
          height={imageHeight}
          className="w-full h-auto max-w-[480px]"
          priority={priority}
        />
      </div>
      <div className="mt-6 px-4">
        <CtaButton withPulse={ctaWithPulse} trustLine={ctaTrustLine} />
      </div>
    </section>
  );
}

// =====================================================
// 共通: CTA ボタン
// trustLine: ボタンの上に「＼ メッセージ ／」 を表示するための文字列
// withPulse: 旧 props (cta-pulse-ring 用) — 現在は btn-cta-radar が
//   内蔵のリングアニメーションを持つため未使用 (後方互換のためだけ残す)
// =====================================================
function CtaButton({
  withPulse: _withPulse = false,
  trustLine,
}: {
  withPulse?: boolean;
  trustLine?: string;
}) {
  return (
    <div className="flex flex-col items-center">
      {/* トラストライン（＼…／）。FV のCTA直前で使う想定 */}
      {trustLine && (
        <div className="slash-headline mb-4">
          <span className="slash">＼</span>
          <span className="text-[13.5px] sm:text-[14.5px] font-black text-text-primary leading-tight">
            {trustLine}
          </span>
          <span className="slash">／</span>
        </div>
      )}
      {/* ピル + メインCTA をひと塊として連動アニメさせる (cta-radar-stack) */}
      <div className="cta-radar-stack max-w-[300px]">
        {/* 上の「いますぐ無料で」ピル (ブランドオレンジ) */}
        <div className="relative bg-white border-2 border-brand-primary rounded-full px-5 py-1.5 text-[12px] font-black text-brand-primary mb-[-14px] z-10 shadow-md">
          いますぐ無料で
          {/* 下向き三角の小さな矢印 (ピルからボタンへ繋がる印象) */}
          <span className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-brand-primary rotate-45" />
        </div>
        {/* メインCTAボタン (btn-cta-radar と同構造、色はブランドオレンジ) */}
        <Link
          href="/diagnosis"
          className="btn-cta-radar-orange group w-full text-center"
        >
          <span className="relative z-10">診断START！</span>
          <span className="relative z-10 inline-block transition-transform group-hover:translate-x-1">
            ▶
          </span>
        </Link>
      </div>
      {/* 補助テキスト（丸い立体オレンジバッジ + アイコン + ダークテキスト） */}
      <div className="flex items-center justify-center gap-x-3.5 gap-y-2 mt-5 flex-wrap px-2">
        <CtaFeaturePill icon="clock">15秒で完了</CtaFeaturePill>
        <CtaFeaturePill icon="money">完全無料</CtaFeaturePill>
        <CtaFeaturePill icon="check">登録不要</CtaFeaturePill>
      </div>
    </div>
  );
}

// =====================================================
// CTAボタン直下のフィーチャー表示
// 丸い立体オレンジバッジ（白アイコン）+ 太字ダークテキスト
// =====================================================
function CtaFeaturePill({
  icon,
  children,
}: {
  icon: "clock" | "check" | "money";
  children: React.ReactNode;
}) {
  return (
    <span className="cta-feature-pill">
      <span className="cta-feature-icon">
        {icon === "clock" && (
          // 時計（所要時間）
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7.5v5l3 2" />
          </svg>
        )}
        {icon === "money" && (
          // 円マーク（完全無料）
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M7 4l5 8 5-8" />
            <path d="M12 12v8" />
            <path d="M7 14h10" />
            <path d="M7 18h10" />
          </svg>
        )}
        {icon === "check" && (
          // チェックマーク（登録不要）
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12l5 5L20 7" />
          </svg>
        )}
      </span>
      {children}
    </span>
  );
}
