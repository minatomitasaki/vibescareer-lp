// LP03 本体 (/lp03)
//
// 漫画記事 (/lp03/article) からの CTA で着地する LP。
// LP02 result ページから Section 1-4 (診断結果) を除いた構成。
// 診断を経由しないので Section 5-18 のうち固定コンテンツを流用、
// フォームは LP03 専用の 1 段フォーム (Lp03Form) を使う。
import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { Lp03Form } from "@/components/lp03/Lp03Form";
import { RoadmapScrollProgress } from "@/components/RoadmapScrollProgress";
import { Lp03BonusSection } from "@/components/lp03/Lp03BonusSection";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";
import {
  ADVISORS,
  PARTNER_LOGOS,
  SUCCESS_CASES,
  type Advisor,
  type SuccessCase,
} from "@/data/landing";

export const metadata: Metadata = {
  title: "“未経験”からでも適正年収で転職成功へ | VibesCareer",
  description:
    "20代・第二新卒のためのパーソナル型転職支援サービス VibesCareer。履歴書・面接対策・内定獲得まで、プロのアドバイザーが伴走します。",
};

export default function Lp03Page() {
  return (
    <main className="lp-container bg-white">
      {/* ヘッダー: 入口LPと統一 */}
      <header className="relative px-4 py-3 flex items-center justify-start bg-white">
        <Logo width={160} height={44} priority />
        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent" />
      </header>

      {/* === Section 1: ヒーロー画像 (LP03 専用) ===
          1024x1536 の派手ポップヘッダーをそのまま全画面表示。
          下部のタグライン + VibesCareer ロゴまで含めて見せる。 */}
      <section className="pt-2 pb-4">
        <ImagePlaceholder
          src="/images/lp03-header.png"
          label="LP03 ヘッダー画像"
          alt="未経験からでも適正年収で転職成功へ — VibesCareer"
          width={1024}
          height={1536}
          priority
          className="w-full h-auto block"
        />
      </section>

      {/* === Section 5: 1 つ目の CTA (ヒーロー直後・吹き出し付きボタンのみ) ===
          ファーストビュー直下はシンプルに、吹き出し「相談だけでもOK」+ 緑グラデのボタン 1 個に絞る。
          特典画像は 2/3 個目 (Lp03BonusSection) で訴求する。 */}
      <section className="px-4 pt-6 pb-8 bg-white">
        <div className="flex flex-col items-center">
          <div className="mb-3">
            <span className="cta-bubble-tip">相談だけでもOK</span>
          </div>
          <Link
            href="#form"
            className="btn-cta-radar group w-full max-w-[420px]"
          >
            <span className="relative z-10">今すぐ無料で申し込む</span>
            <span className="relative z-10 inline-block transition-transform group-hover:translate-x-1">
              ▶
            </span>
          </Link>
        </div>
      </section>

      {/* === Section 6: キャリアアドバイザー === */}
      <AdvisorsSection />

      {/* === Section 7: 転職成功事例 === */}
      <SuccessCasesSection />

      {/* === Section 8: 取り扱い企業 === */}
      <PartnersSection />

      {/* === Section 9: VibesRadar 特典カード (2 回目) === */}
      <Suspense fallback={null}>
        <Lp03BonusSection />
      </Suspense>

      {/* === Section 10: 悩み訴求 === */}
      <ConcernsSection />

      {/* === Section 11: 早期離職 === */}
      <CausesSection />

      {/* === Section 13-14: サービス紹介 + ロードマップ === */}
      <ServiceIntroSection />

      {/* === Section 15: VibesRadar 特典カード (3 回目) === */}
      <Suspense fallback={null}>
        <Lp03BonusSection />
      </Suspense>

      {/* === Section 16: FAQ === */}
      <FaqSection />

      {/* === Section 17: ラストメッセージ === */}
      <LastMessageSection />

      {/* === Section 18: フォーム === */}
      <FormSection />

      {/* 離脱 POP */}
      <Suspense fallback={null}>
        <ExitIntentPopup />
      </Suspense>
    </main>
  );
}

// =============================================================================
// Section 6: アドバイザー紹介 (LP02 完全流用)
// =============================================================================
function AdvisorsSection() {
  return (
    <section className="px-4 py-10 bg-white">
      <div className="section-eyebrow-block">
        <span className="en">CAREER ADVISORS</span>
        <h2 className="ja">
          適職 × 適正年収へ導く<br />
          <span className="marker">キャリアアドバイザー</span>
        </h2>
        <span className="sub">
          会社役員・人事部長などで経験を積んだ<br />
          百戦錬磨のキャリアアドバイザーのみ起用しています。
        </span>
      </div>

      <div>
        {ADVISORS.map((a) => (
          <AdvisorCard key={a.id} advisor={a} />
        ))}
      </div>
    </section>
  );
}

function AdvisorCard({ advisor }: { advisor: Advisor }) {
  return (
    <article className="advisor-card">
      <header className="advisor-card-head">
        <div className="advisor-photo">
          <Image
            src={`/images/advisor-${advisor.id}.png`}
            alt={`${advisor.name}の肖像`}
            width={200}
            height={200}
            className="advisor-photo-img"
          />
        </div>
        <div className="advisor-name-block">
          {advisor.role && (
            <span className="advisor-role">{advisor.role}</span>
          )}
          <p className="advisor-name">{advisor.name}</p>
        </div>
      </header>

      <div className="advisor-card-body">
        <h3 className="advisor-catchphrase">
          <span className="advisor-catch-bar" aria-hidden />
          <span>{advisor.catchphrase}</span>
        </h3>

        <div className="advisor-bio-box">
          <p className="advisor-bio-label">経歴</p>
          <ul className="advisor-bio-list">
            {advisor.bio.map((line, i) => (
              <li key={i}>
                <span className="advisor-bio-bullet" aria-hidden>
                  ▶
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

// =============================================================================
// Section 7: 転職成功事例 (LP02 完全流用)
// =============================================================================
function SuccessCasesSection() {
  return (
    <section className="px-4 py-10 bg-bg-subtle">
      <div className="section-eyebrow-block">
        <span className="en">SUCCESS STORIES</span>
        <h2 className="ja">
          第２新卒の<br />
          <span className="marker">転職成功者、多数！</span>
        </h2>
        <span className="sub">
          あなたと同じ境遇から転職を成功させた<br />
          先輩のお声を紹介します。
        </span>
      </div>

      <div>
        {SUCCESS_CASES.map((c) => (
          <SuccessCaseCard key={c.id} caseData={c} />
        ))}
      </div>
    </section>
  );
}

function SuccessCaseCard({ caseData }: { caseData: SuccessCase }) {
  return (
    <article className="success-case-card">
      <div className="success-case-photo-wrap">
        <ImagePlaceholder
          src={caseData.photo}
          label={`Section 7: ${caseData.name} (${caseData.age}歳) 写真`}
          alt={`${caseData.name} (${caseData.age}歳) のカウンセリングシーン`}
          width={1024}
          height={640}
          className="success-case-photo-img"
        />
        <span className="success-case-name-tag">
          {caseData.name}（{caseData.age}歳）
        </span>
      </div>

      <div className="success-case-salary-infographic">
        <ImagePlaceholder
          src={caseData.salaryInfographic}
          label={`Section 7: ${caseData.name} の年収アップ ${caseData.beforeCompany} ¥${caseData.beforeAmount}万 → ${caseData.afterCompany} ¥${caseData.afterAmount}万 (+${caseData.salaryUpAmount}万UP)`}
          alt={`${caseData.beforeCompany} 年収¥${caseData.beforeAmount}万 から ${caseData.afterCompany} 年収¥${caseData.afterAmount}万 へ。+${caseData.salaryUpAmount}万円UP。`}
          width={1536}
          height={864}
          className="w-full h-auto block"
        />
      </div>

      <h3 className="success-case-title">{caseData.title}</h3>
      <p className="success-case-body">{caseData.body}</p>
    </article>
  );
}

// =============================================================================
// Section 8: 取り扱い企業 (LP02 完全流用)
// =============================================================================
function PartnersSection() {
  return (
    <section className="px-4 py-10 bg-white overflow-hidden">
      <div className="section-eyebrow-block">
        <span className="en">PARTNER COMPANIES</span>
        <div className="partners-headline">
          <span className="slash">＼</span>
          <span>
            紹介企業は、
            <span className="text-brand-primary text-[30px] inline-block align-baseline">10,000社以上！</span>
          </span>
          <span className="slash">／</span>
        </div>
        <span className="sub">あなたに適した職場が、必ず見つかる</span>
      </div>

      <div className="partners-marquee-wrap">
        <div className="partners-marquee-row">
          <div className="partners-marquee-track partners-marquee-left">
            {[...PARTNER_LOGOS.slice(0, 5), ...PARTNER_LOGOS.slice(0, 5)].map(
              (logo, i) => (
                <div key={`r1-${i}`} className="partners-marquee-cell">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logo.file}
                    alt={`${logo.name} ロゴ`}
                    className="partners-marquee-img"
                    loading="lazy"
                  />
                </div>
              ),
            )}
          </div>
        </div>
        <div className="partners-marquee-row">
          <div className="partners-marquee-track partners-marquee-right">
            {[...PARTNER_LOGOS.slice(5), ...PARTNER_LOGOS.slice(5)].map(
              (logo, i) => (
                <div key={`r2-${i}`} className="partners-marquee-cell">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logo.file}
                    alt={`${logo.name} ロゴ`}
                    className="partners-marquee-img"
                    loading="lazy"
                  />
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// Section 10: 悩み訴求 (LP02 完全流用)
// =============================================================================
type Concern = {
  body: React.ReactNode;
};

const CONCERNS: Concern[] = [
  {
    body: (
      <>
        今の会社が自分に合っているとは思えない。
        やりがいを感じられない。
      </>
    ),
  },
  {
    body: (
      <>
        このまま今の仕事を続けていても、
        成長できるイメージが持てない。
      </>
    ),
  },
  {
    body: (
      <>
        頑張りや成績に見合うだけの
        評価や年収が欲しい。
      </>
    ),
  },
  {
    body: (
      <>
        もっと
        自分本来の力を発揮できる会社
        で働きたい。
      </>
    ),
  },
];

function ConcernsSection() {
  return (
    <section className="px-4 py-10 bg-white">
      <div className="section-eyebrow-block">
        <span className="en">CONCERNS</span>
        <h2 className="ja">
          第2新卒の転職希望者から<br />
          <span className="marker">こんな悩み</span>をよく相談されます
        </h2>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-3">
        {CONCERNS.map((c, i) => (
          <li key={i} className="concern-card">
            <div className="concern-case-label">
              CASE.{String(i + 1).padStart(2, "0")}
            </div>
            <p className="concern-text">{c.body}</p>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex justify-center">
        <ImagePlaceholder
          src="/images/result-concerns-faces.png"
          label="Section 10: 悩み訴求イメージ"
          alt="若手ビジネスパーソンが転職について悩んでいる様子"
          width={1536}
          height={1024}
          className="w-full h-auto max-w-[440px]"
        />
      </div>
    </section>
  );
}

// =============================================================================
// Section 11: 早期離職 (LP02 完全流用)
// =============================================================================
function CausesSection() {
  return (
    <section className="px-4 py-10 bg-white">
      <div className="section-eyebrow-block">
        <span className="en">ROOT CAUSE</span>
        <h2 className="ja">
          事実、<span className="marker">3人に1人</span>が<br />
          早期離職している...
        </h2>
      </div>

      <div className="mt-6 space-y-4 text-[15.5px] leading-[1.95] text-text-secondary">
        <p>
          厚生労働省の公表データによると、新卒3年以内の離職率は約30%。つまり、
          <strong className="text-brand-primary">3人に1人が早期離職している</strong>
          という事実があります。
        </p>

        <div className="flex justify-center py-2">
          <ImagePlaceholder
            src="/images/result-headache-three.png"
            label="Section 11: 悩みの原因イメージ"
            alt="3 人に 1 人が早期離職している様子: 若手社会人と棒人間ピクトグラムのイラスト"
            width={1536}
            height={1024}
            className="w-full h-auto max-w-[440px]"
          />
        </div>

        <p>
          その背景には「将来やりたいことがわからない」「目標がないまま、なんとなく働いている」といった、悩みが隠れていることが大半。
        </p>
        <p>
          自己分析が十分にできていないまま働くことで、モヤモヤや不安を抱える人はたくさんいます。
        </p>
        <p>
          だからこそ、ここで一度立ち止まって、
          <strong>自分でも気づいていない長所や短所、あなただけが秘めているポテンシャル</strong>
          を可視化して、自己理解に努める必要があります。
        </p>
      </div>
    </section>
  );
}

// =============================================================================
// Section 13-14: サービス紹介 + ロードマップ (LP02 完全流用)
// =============================================================================
const ROADMAP_STEPS = [
  {
    step: 1,
    title:
      "パーソナル適性診断『VibesRadar』で、まずは“本当の自分”を知る",
    body: "転職で後悔しないために、まずは自分を正しく理解することが最優先。VibesRadarは、強み・思考のクセ・ストレス耐性・成長度合いまで多角的に可視化する次世代型のパーソナル適性診断です。本来有料の診断を、本ページからのお申込み限定で完全無料でご案内します。",
    callout: { ratio: "7", text: "がココで決まる！" },
    image: "/images/result-roadmap-step1.png" as string | null,
    imageAlt: "スマホとノートPCでVibesRadarの適性診断を受ける男女",
  },
  {
    step: 2,
    title:
      "専属のキャリアアドバイザーが一緒に自己分析し、キャリア設計を構築",
    body: "VibesRadarの結果をもとに、プロのキャリアアドバイザーが自己分析を深めます。希望条件だけでなく、経験・悩み・将来像まで整理し、\n・どんな環境なら力を発揮できるか\n・どんな働き方なら納得感を持てるか\nまで伴走しながら、あなただけのキャリア設計を構築します。",
    callout: { ratio: "9", text: "がココで決まる！" },
    image: "/images/result-roadmap-step2.png" as string | null,
    imageAlt: "モニター画面越しに笑顔でアドバイスする男性キャリアアドバイザー",
  },
  {
    step: 3,
    title:
      "“最適な職場”に“適正年収”で転職できるよう支援",
    body: "キャリア設計を終えたら、あなたに合う企業を厳選してご紹介。「存分に力を発揮できるか」「納得して働き続けられるか」まで考えた選択肢を提案します。応募書類・面接対策・企業のリアルな情報・内定後の相談まで、最後まで伴走します。",
    callout: null as null | { ratio: string; text: string },
    image: "/images/result-roadmap-step3.png" as string | null,
    imageAlt: "アドバイザーと一緒に求人カードを見比べる応募者、おすすめカードには年収UPバッジ",
  },
];

function ServiceIntroSection() {
  return (
    <section className="service-intro-section relative px-4 py-10">
      <div className="service-intro-marquee" aria-hidden>
        <div className="service-intro-marquee-track">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="service-intro-marquee-text">
              VibesCareer
            </span>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="section-eyebrow-block">
          <span className="en">ABOUT US</span>
          <h2 className="ja service-intro-title">
            <span className="marker">VibesCareer</span>とは？
          </h2>
        </div>

        <p className="service-intro-lead">
          20代・第二新卒のための<br />
          パーソナル型 転職支援サービスです。
        </p>

        <p className="mt-6 text-[15.5px] leading-[1.95] text-text-secondary">
          一般的な転職支援は、最初から転職前提で求人の大量紹介やスピーディーな決断を求められがち。
          VibesCareerでは <strong>「本当に自分に合う仕事は何か」</strong> を見極めることを最優先に、
          まずは <strong>自己分析からスタート</strong> します。
        </p>

        <div className="section-eyebrow-block mt-12">
          <span className="en">ROADMAP</span>
          <h2 className="ja">
            <span className="marker">転職成功までのロードマップ</span>
          </h2>
        </div>

        <RoadmapScrollProgress
          steps={ROADMAP_STEPS.map((s) => ({
            step: s.step,
            label: String(s.step).padStart(2, "0"),
          }))}
        >
          {ROADMAP_STEPS.map((s) => (
            <div key={s.step} className="service-point-card">
              {s.callout && (
                <div className="service-point-callout" aria-label={`転職成功の${s.callout.ratio}割${s.callout.text}`}>
                  <span className="callout-prefix">転職成功の</span>
                  <span className="callout-ratio">{s.callout.ratio}</span>
                  <span className="callout-unit">割</span>
                  <span className="callout-suffix">{s.callout.text}</span>
                </div>
              )}
              <div className="service-point-label">
                STEP {String(s.step).padStart(2, "0")}
              </div>
              <h3 className="service-point-title">{s.title}</h3>
              {s.image && (
                <div className="service-point-image">
                  <ImagePlaceholder
                    src={s.image}
                    label={`STEP ${s.step} イメージ`}
                    alt={s.imageAlt}
                    width={1536}
                    height={1024}
                    className="w-full h-auto block rounded-2xl"
                  />
                </div>
              )}
              <p className="service-point-body whitespace-pre-line">{s.body}</p>
            </div>
          ))}
        </RoadmapScrollProgress>

        <div className="mt-7 flex justify-center">
          <span className="service-free-badge">
            <span className="service-free-badge-icon" aria-hidden>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12l5 5L20 7" />
              </svg>
            </span>
            サービスはすべて無料で受けられます
          </span>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// Section 16: FAQ (LP02 完全流用)
// =============================================================================
const FAQ_ITEMS = [
  {
    q: "VibesCareerは、懇切丁寧に伴走してもらえると聞いていますが、利用料金は発生しますか？",
    a: "すべてのサービスを、完全無料でご利用いただけます。パーソナルWeb診断「VibesRadar」に関して、本来であれば有料ですが、このページからのお申込みに限り無料でご案内させていただきます。",
  },
  {
    q: "まだ転職するか決まっていないのですが、相談しても大丈夫ですか？",
    a: "はい、もちろん大丈夫です。「転職すべきか迷っている」「まずは話だけ聞いてみたい」という段階でも問題ありません。今後のキャリアの方向性を一緒に整理するところからサポートいたします。",
  },
  {
    q: "今の仕事が忙しくて、転職活動にあまり時間を割けないかもしれませんが、それでも利用できますか？",
    a: "はい、ご利用いただけます。お仕事終わりや土日など、できる限りご都合に合わせて面談日程を調整いたします。忙しい方でも無理なく進められるようサポートします。",
  },
  {
    q: "自分に合う求人がわからないのですが、大丈夫ですか？",
    a: "VibesRadarによる自己分析と、これまでのご経験やご希望を丁寧に伺いながら、あなたの強みや価値観に合う求人をご提案します。「何が向いているかわからない」という方も安心してご相談ください。",
  },
  {
    q: "未経験の業界・職種にも挑戦できますか？",
    a: "はい、可能です。未経験歓迎の求人も多数揃えています。利用者の半数以上が未経験業種・職種に挑戦できていますので、ご安心ください。",
  },
  {
    q: "応募書類や面接に自信がないのですが、サポートしてもらえますか？",
    a: "はい、サポートいたします。履歴書・職務経歴書の添削はもちろん、面接対策や想定質問の整理など、内定獲得に向けて丁寧に伴走します。",
  },
  {
    q: "相談したら必ず転職しないといけませんか？",
    a: "いいえ、必ず転職する必要はありません。ご相談の結果、「今は転職しない」という選択になることもあります。大切なのは無理に転職することではなく、あなたにとって納得できる選択をすることだと考えています。",
  },
];

function FaqSection() {
  return (
    <section className="px-4 py-10 bg-bg-subtle">
      <div className="section-eyebrow-block">
        <span className="en">FAQ</span>
        <h2 className="ja">
          <span className="marker">よくある</span>ご質問
        </h2>
      </div>

      <ul className="mt-6 space-y-3">
        {FAQ_ITEMS.map((item, i) => (
          <li
            key={i}
            className="bg-white rounded-2xl border border-border-default shadow-sm overflow-hidden"
          >
            <div className="bg-brand-primary/5 px-4 py-3 flex gap-3 border-b border-brand-primary/10">
              <span className="text-brand-primary text-[18px] font-black leading-none flex-shrink-0">
                Q.
              </span>
              <p className="text-[15px] font-bold text-text-primary leading-[1.6]">
                {item.q}
              </p>
            </div>
            <div className="px-4 py-3 flex gap-3">
              <span className="text-text-muted text-[18px] font-black leading-none flex-shrink-0">
                A.
              </span>
              <p className="text-[14.5px] text-text-secondary leading-[1.8]">
                {item.a}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// =============================================================================
// Section 17: ラストメッセージ (LP02 完全流用)
// =============================================================================
function LastMessageSection() {
  return (
    <section className="last-message-section px-4 py-12">
      <div className="last-message-letter-label" aria-hidden>
        <span className="label-rule" />
        <span className="label-text">LAST MESSAGE</span>
        <span className="label-rule" />
      </div>

      <div className="last-message-card">
      <div className="section-eyebrow-block">
        <h2 className="ja">
          転職を迷っている<br />
          <span className="marker">あなたへ。</span>
        </h2>
      </div>

      <div className="mt-2 flex justify-center">
        <ImagePlaceholder
          src="/images/result-last-message.png"
          label="Section 17: ラストメッセージイメージ"
          alt="分かれ道に立ち、朝焼け方向を見つめる若手ビジネスパーソンの後ろ姿"
          width={1536}
          height={1024}
          rounded
          className="w-full h-auto"
        />
      </div>

      <div className="mt-6 space-y-4 text-[15.5px] leading-[1.95] text-text-secondary">
        <p>
          最後までページをご覧いただき、ありがとうございます。
          <br />
          VibesCareer代表の渡邉です。
        </p>
        <p>
          ここまで読み進めてくださったあなたは、
          <br />
          きっと今、現状に少なからず不満があったり、
          <br />
          転職について迷いを感じているのではないでしょうか。
        </p>
        <p>
          世の中には、たくさんの転職支援サービスがあります。
        </p>
        <p>
          しかしその中には、あなた自身のことを深く理解しないまま、
          <br />
          多くの求人を紹介し、とにかく転職を進めようとするサービスも少なくありません。
        </p>
        <p>
          けれど、十分に自分を理解しないまま転職先を決めてしまうと、「思っていた環境と違った」「やっぱり自分には合わなかった」と後悔につながります。
          <br />
          そして数か月後には、また次の転職を考え始めてしまう。
          <br />
          そんな負の連鎖に入ってしまう人も、数多く存在します。
        </p>
        <p>
          だからこそ、私たちはまず<strong>自己分析</strong>を大切にしています。
          <br />
          あなたの強み、価値観、理想の働き方を一緒に整理しながら、あなたが本当に力を発揮できる環境を見つけていく。
          <br />
          それが、納得できる転職への第一歩だと考えているからです。
        </p>
        <p>
          あなたが輝ける職場。
          <br />
          本来のポテンシャルを発揮できる仕事。
          <br />
          そして、その努力や成果に見合った評価や年収。
          <br />
          そうした未来は、決して特別な人だけのものではありません。
        </p>
        <p>
          <strong>朝起きるのが楽しくなる仕事</strong>が必ず見つかる。
          <br />
          想像するだけでも、ワクワクしてきませんか？
        </p>
        <p>
          20代の転職は、これからの人生を大きく左右する失敗できない選択です。
          <br />
          だからこそ私たちは、<strong>1対1で本気</strong>であなたと向き合います。
        </p>
        <p>
          あなたの人生を変える一歩を、私たちと一緒に踏み出してみませんか。
        </p>
      </div>

      <p className="mt-8 text-right text-[19px] text-text-muted">
        VibesCareer 代表
        <br />
        <span className="text-[23px] font-black text-text-primary tracking-wider">
          渡邉 大典
        </span>
      </p>
      </div>
    </section>
  );
}

// =============================================================================
// Section 18: フォーム (LP03 専用 / LP01 後期の VibesRadar 訴求スタイル)
// 上部は「カンタン申し込み＆カウンセリング予約で VibesRadar の 無料チケット を プレゼント！」
// + 横並び 3 STEP ボックス (SVG アイコン + 縦書きキャプション) + 4 項目フォーム。
// =============================================================================
function FormSection() {
  return (
    <section id="form" className="px-4 py-10 bg-bg-form">
      <div className="bg-white rounded-3xl p-5 shadow-md">
        <div className="text-center py-1">
          <p className="text-[13px] font-bold text-text-secondary leading-[1.85]">
            カンタン申し込み＆カウンセリング予約で
          </p>
          <p className="mt-2.5 text-[22px] font-black leading-[1.45] text-text-primary">
            <span className="text-brand-primary">VibesRadar</span>の
            <span className="relative inline-block">
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-[1px] h-[9px] bg-brand-primary/15 rounded-[1px]"
              />
              <span className="relative">無料チケット</span>
            </span>
            を
          </p>
          <p className="mt-1 text-[24px] font-black text-brand-primary tracking-wide">
            プレゼント！
          </p>
        </div>

        <ol className="mt-6 grid grid-cols-3 divide-x divide-brand-primary/20">
          {[
            {
              step: 1,
              text: "下のフォームから情報を入力",
              icon: (
                <svg
                  width={28}
                  height={28}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <path d="M12 11h4" />
                  <path d="M12 16h4" />
                  <path d="M8 11h.01" />
                  <path d="M8 16h.01" />
                </svg>
              ),
            },
            {
              step: 2,
              text: "ご希望の日時で日程を調整",
              icon: (
                <svg
                  width={28}
                  height={28}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M8 2v4" />
                  <path d="M16 2v4" />
                  <rect width="18" height="18" x="3" y="4" rx="2" />
                  <path d="M3 10h18" />
                  <path d="m9 16 2 2 4-4" />
                </svg>
              ),
            },
            {
              step: 3,
              text: "VibesRadarの受検チケット送信",
              icon: (
                <svg
                  width={28}
                  height={28}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M2 9a3 3 0 1 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 1 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                  <path d="M13 5v2" />
                  <path d="M13 11v2" />
                  <path d="M13 17v2" />
                </svg>
              ),
            },
          ].map((s) => (
            <li
              key={s.step}
              className="px-2 flex flex-col items-center text-center"
            >
              <span className="text-[10.5px] font-black text-brand-primary tracking-[0.05em] underline underline-offset-[3px] decoration-1">
                STEP.{String(s.step).padStart(2, "0")}
              </span>
              <span className="mt-3 w-[58px] h-[58px] rounded-[14px] bg-gradient-to-br from-brand-primary to-[#FF9A4D] shadow-[0_4px_10px_-2px_rgba(255,107,0,0.35)] flex items-center justify-center text-white">
                {s.icon}
              </span>
              <p className="mt-3 text-[11px] font-bold text-text-primary leading-[1.55]">
                {s.text}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-6">
          <Lp03Form />
        </div>
      </div>
    </section>
  );
}
