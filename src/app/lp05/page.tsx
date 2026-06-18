import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

// LP05 入口LP
// 導線: 入口LP → 診断 → 診断中 → 詳細結果ページ (CTA は LINE 登録)
// 入口/診断/診断中は LP04 と同一構成。結果ページのみフル表示 + LINE CTA。
export default function Home() {
  return (
    <main className="lp-container bg-white">
      {/* ヘッダー: ロゴを左寄せ */}
      <header className="relative px-4 py-3 flex items-center justify-start bg-white">
        <Logo width={160} height={44} priority />
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

      {/* === Section 2: 15秒診断でわかること === */}
      <ImageSection
        src="/images/section2-full.png"
        label="Section 2: 15秒診断でわかること"
        alt="15秒診断でわかること。ABOUT。3ステップ：①適職と適正年収が分かる、②具体的な手順がわかる、③マッチした求人を知れる。"
        imageHeight={1456}
        ctaTrustLine="診断後、嬉しいプレゼントをご用意しています！"
        ctaWithPulse
      />

      {/* === Section 3: 権威性訴求 === */}
      <ImageSection
        src="/images/section3-full.png"
        label="Section 3: 権威性訴求"
        alt="AUTHORITY。利用者数77万人を誇る事業会社が開発した2026年最新の適性診断。3つの強み：①統計学の専門家集団が全面監修、②2,400以上の学術論文をもとに構築、③欧米を中心とした世界各国のビッグデータ解析。"
        imageHeight={1406}
        ctaTrustLine="転職を成功させた第２新卒が最初に受けています！"
        ctaWithPulse
      />

      {/* フッター */}
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
      {trustLine && (
        <div className="slash-headline mb-4">
          <span className="slash">＼</span>
          <span className="text-[13.5px] sm:text-[14.5px] font-black text-text-primary leading-tight">
            {trustLine}
          </span>
          <span className="slash">／</span>
        </div>
      )}
      <div className="cta-radar-stack max-w-[300px]">
        <div className="relative bg-white border-2 border-brand-primary rounded-full px-5 py-1.5 text-[12px] font-black text-brand-primary mb-[-14px] z-10 shadow-md">
          いますぐ無料で
          <span className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-brand-primary rotate-45" />
        </div>
        <Link
          href="/lp05/diagnosis"
          className="btn-cta-radar-orange group w-full text-center"
        >
          <span className="relative z-10">診断START！</span>
          <span className="relative z-10 inline-block transition-transform group-hover:translate-x-1">
            ▶
          </span>
        </Link>
      </div>
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7.5v5l3 2" />
          </svg>
        )}
        {icon === "money" && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M7 4l5 8 5-8" />
            <path d="M12 12v8" />
            <path d="M7 14h10" />
            <path d="M7 18h10" />
          </svg>
        )}
        {icon === "check" && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12l5 5L20 7" />
          </svg>
        )}
      </span>
      {children}
    </span>
  );
}
