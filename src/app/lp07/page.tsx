// LP07 広告直リンク LP (/lp07)
//
// 診断ファネルを持たない単一ページ。広告クリックで直接ここに着地し、
// LINE 登録で「20代転職ガイド」(ホワイトペーパー) を配布する。
// 中身は LP05 結果ページから「上位N%バナー / 診断結果ヒーロー /
// 持ち味・アドバイス・その他の適職」を外し、冒頭に広告向け FV を置いたもの。
import Image from "next/image";
import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { RoadmapScrollProgress } from "@/components/RoadmapScrollProgress";
import { Lp07StickyCta, Lp07GuideCta } from "@/components/lp07/Lp07LineCta";
import {
  ADVISORS,
  PARTNER_LOGOS,
  SUCCESS_CASES,
  type Advisor,
  type SuccessCase,
} from "@/data/landing";

export const metadata: Metadata = {
  title: "採用のプロが明かす「20代転職ガイド」無料プレゼント | VibesCareer",
};

export default function Lp07Page() {
  return (
    // 下部固定 CTA バーに隠れないよう本文末尾に余白 (pb-40) を確保。
    <main className="lp-container bg-white pb-40">
      {/* ヘッダー */}
      <header className="relative px-4 py-3 flex items-center justify-start bg-white">
        <Logo width={160} height={44} priority />
        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent" />
      </header>

      {/* 0. FV (広告向けヒーロー: ホワイトペーパー無料プレゼント訴求) */}
      <FvSection />

      {/* 2. CONCERNS */}
      <ConcernsSection />

      {/* 2.5 そんなあなたへ！ + 特典ガイド LINE CTA */}
      <GuideBonusSection />

      {/* 2.7 「20代転職ガイド」ってどんなもの？ */}
      <GuideAboutSection />

      {/* 2.8 ブリッジ: このガイドを読んで転職成功 → 成功事例へ誘導 */}
      <GuideToSuccessBridge />

      {/* 3. SUCCESS STORIES */}
      <SuccessCasesSection />

      {/* 短縮CTA (転職成功事例の下・背景は成功事例と同色で密着) */}
      <GuideShortCta bg="bg-bg-subtle" />

      {/* 4. CAREER ADVISORS */}
      <AdvisorsSection />

      {/* 4.5 PARTNER COMPANIES (企業ロゴ 横スクロール・他LPと共通) */}
      <PartnersSection />

      {/* 短縮CTA (企業ロゴの下・背景は白で密着) */}
      <GuideShortCta bg="bg-white" />

      {/* ABOUT US + ROADMAP (LP01 結果ページからそのまま移植) */}
      <ServiceIntroSection />

      {/* 5. FAQ */}
      <FaqSection />

      {/* 6. LAST MESSAGE */}
      <LastMessageSection />

      {/* 7. 末尾: 特典CTAセクション (「そんなあなたへ！」は非表示) */}
      <GuideBonusSection showHeadline={false} />

      {/* 下部固定 CTA: LINE 登録 (常時表示) */}
      <Lp07StickyCta />
    </main>
  );
}

// =============================================================================
// 0: FV (広告向けヒーロー)
//   診断が無い広告直リンク用。ホワイトペーパー「20代転職ガイド」を訴求し、
//   最初の LINE CTA を置く。
// =============================================================================
function FvSection() {
  return (
    <section className="bg-white pb-9">
      {/* FV メインビジュアル (コピーは画像に焼き込み済み・文字主役) */}
      <ImagePlaceholder
        src="/images/lp07-fv-v2.png"
        label="エージェントは教えてくれない。採用のプロが明かす「20代転職ガイド」をLINE登録で無料プレゼント"
        alt="エージェントは教えてくれない。採用のプロが明かす「20代転職ガイド」。“採用する側”がこっそり教える受かり方・選び方を、LINE登録で無料プレゼント。"
        width={1024}
        height={1536}
        priority
        className="w-full h-auto block"
      />

      {/* 1st CTA */}
      <div className="cta-radar-stack max-w-[330px] mx-auto mt-6 px-4">
        <div className="relative bg-white border-2 border-[#06C755] rounded-full px-5 py-1.5 text-[12px] font-black text-[#06A648] mb-[-14px] z-10 shadow-md">
          LINE登録者限定
          <span className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-[#06C755] rotate-45" />
        </div>
        <Lp07GuideCta source="fv">
          「20代転職ガイド」を
          <br />
          いますぐ受け取る！
        </Lp07GuideCta>
      </div>
    </section>
  );
}

// =============================================================================
// 2: CONCERNS (悩み訴求)
// =============================================================================
type Concern = {
  body: React.ReactNode;
};

const CONCERNS: Concern[] = [
  { body: <>今の会社が自分に合っているとは思えない。やりがいを感じられない。</> },
  { body: <>このまま今の仕事を続けていても、成長できるイメージが持てない。</> },
  { body: <>頑張りや成績に見合うだけの評価や年収が欲しい。</> },
  { body: <>もっと自分本来の力を発揮できる会社で働きたい。</> },
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
          label="Section: 悩み訴求イメージ"
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
// 2.5: そんなあなたへ！ + 特典プレゼント + CTA
//   3 パートに分割:
//     (a) 「そんなあなたへ！」見出し … HTML
//     (b) 「診断を受けた方限定 〜 特別プレゼント！」… 1 枚画像 (lp05-guide-present.png)
//         書影は添付 PDF 表紙『採用のプロが明かす 20代転職の本音』に合わせて生成。
//     (c) 「LINE登録者限定」+ CTA ボタン … HTML (Lp05GuideCta)
//   配色はグリーン基調。
// =============================================================================
function GuideBonusSection({
  showHeadline = true,
}: {
  showHeadline?: boolean;
}) {
  return (
    <section className="bg-gradient-to-b from-[#F0FDF4] to-[#DCFCE7] px-4 pt-8 pb-10">
      {/* (a) そんな [あなた] へ！ — HTML (あなた は矢印風リボン背景)。
          showHeadline=false で非表示 (末尾の再掲CTAなどで使用) */}
      {showHeadline && (
        <p className="text-center text-[26px] font-black text-[#15803D] tracking-wide mb-6">
          そんな
          <span
            className="inline-block mx-1 px-4 py-1 bg-gradient-to-r from-[#2BC0A6] to-[#16A34A] text-white align-middle"
            style={{
              clipPath:
                "polygon(0% 50%, 12px 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 12px 100%)",
            }}
          >
            あなた
          </span>
          へ！
        </p>
      )}

      {/* (b) 特典ビジュアル (画像: 〜特別プレゼント！まで) */}
      <div className="flex justify-center">
        <ImagePlaceholder
          src="/images/lp07-guide-present.png"
          label="採用のプロが明かす20代転職ガイド 特別プレゼント"
          alt="あなたらしいキャリアを叶えるための『採用のプロが明かす 20代転職ガイド』を特別プレゼント。"
          width={1024}
          height={1024}
          className="w-full h-auto max-w-[440px] block"
        />
      </div>

      {/* (c) LINE登録者限定 + CTA ボタン — 入口LP と同じ radar デザイン (LINE緑) */}
      <div className="cta-radar-stack max-w-[330px] mx-auto mt-4">
        {/* 上の「LINE登録者限定」ピル (白地 + 緑枠 + 下向き三角) */}
        <div className="relative bg-white border-2 border-[#06C755] rounded-full px-5 py-1.5 text-[12px] font-black text-[#06A648] mb-[-14px] z-10 shadow-md">
          LINE登録者限定
          <span className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-[#06C755] rotate-45" />
        </div>
        <Lp07GuideCta>
          「20代転職ガイド」を
          <br />
          いますぐ受け取る！
        </Lp07GuideCta>
      </div>
    </section>
  );
}

// =============================================================================
// 2.7: 「20代転職ガイド」ってどんなもの？ (特典の中身紹介)
//   参考デザイン: オレンジ基調の「○○ってどんなもの？」見出し + 白カード
//   (リード文 + オレンジマーカー + チェックリスト)。
// =============================================================================
function GuideAboutSection() {
  const items: React.ReactNode[] = [
    <>
      面接官が見ているのは「実績」ではなく
      <span className="text-brand-primary font-black">「〇〇」</span>
    </>,
    <>
      「優秀なのに落ちる人」に共通する
      <span className="text-brand-primary font-black">たった1つのこと</span>
    </>,
    <>
      いまの企業は「確実に〇〇な人」を
      <span className="text-brand-primary font-black">100％採用</span>
      する
    </>,
    <>
      理想の転職を実現する
      <span className="text-brand-primary font-black">最強の方程式</span>
    </>,
  ];

  return (
    <section className="px-4 py-10 bg-[#FFF7ED]">
      <h2 className="text-center text-[24px] font-black text-brand-primary leading-[1.5] mb-6">
        「20代転職ガイド」って
        <br />
        どんなもの
        <span className="text-[28px] align-middle">？</span>
      </h2>

      <div className="bg-white rounded-3xl shadow-md px-5 py-7 max-w-[420px] mx-auto">
        {/* リード文 (マーカー強調) */}
        <p className="text-center text-[15.5px] font-bold text-text-primary leading-[1.95] mb-5">
          これから転職活動を始める方に向けて、
          <span className="bg-brand-primary text-white px-1 rounded-[2px] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
            納得のいく会社・仕事を見つける
          </span>
          ための採用のプロの視点を集めています
        </p>

        {/* チェックリスト (オレンジ丸チェック + 点線区切り) */}
        <ul>
          {items.map((node, i) => (
            <li
              key={i}
              className={`flex items-start gap-3 py-3 ${
                i > 0 ? "border-t border-dashed border-border-default" : ""
              }`}
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center mt-0.5">
                <svg
                  viewBox="0 0 24 24"
                  className="w-3 h-3"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </span>
              <span className="text-[14.5px] font-bold text-text-primary leading-[1.6]">
                {node}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// =============================================================================
// 2.8: ブリッジ (このガイドを読んで転職成功 → 成功事例へ誘導)
//   ガイド紹介と成功事例の橋渡し。矢印で次セクションへ自然に流す。
//   ※ 景表法配慮: 数値や因果の断定は避け、「実践した方が続々」「こんな声が
//      届いています」という示唆的な表現にとどめる。
// =============================================================================
function GuideToSuccessBridge() {
  return (
    <section className="px-4 pt-6 pb-9 bg-[#FFF7ED] text-center">
      {/* メインコピー (短く。… で次の成功事例へ繋ぐ) */}
      <p className="text-[22px] font-black text-text-primary leading-[1.6]">
        <span className="relative inline-block">
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-[2px] h-[10px] bg-brand-primary/20 rounded-[1px]"
          />
          <span className="relative">この転職ガイドを実践して</span>
        </span>
        …
      </p>

      {/* 下向き矢印 (バウンド) で SUCCESS STORIES へ誘導 */}
      <div className="mt-5 flex justify-center">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-primary text-white shadow-md animate-bounce">
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </div>
    </section>
  );
}

// =============================================================================
// 3: SUCCESS STORIES (転職成功事例)
// =============================================================================
function SuccessCasesSection() {
  return (
    // 下に短縮CTAを密着させるため pb を詰める
    <section className="px-4 pt-10 pb-3 bg-bg-subtle">
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
          label={`Section: ${caseData.name} (${caseData.age}歳) 写真`}
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
          label={`Section: ${caseData.name} の年収アップ ${caseData.beforeCompany} ¥${caseData.beforeAmount}万 → ${caseData.afterCompany} ¥${caseData.afterAmount}万 (+${caseData.salaryUpAmount}万UP)`}
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
// 4: CAREER ADVISORS (アドバイザー紹介)
// =============================================================================
function AdvisorsSection() {
  return (
    // 下に短縮CTAを密着させるため pb を詰める
    <section className="px-4 pt-10 pb-3 bg-white">
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
// 4.5: PARTNER COMPANIES (取り扱い企業ロゴ 横スクロール・他LPと共通)
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

      {/* 上下 2 行で逆方向に流れる無限マーキー */}
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
// ABOUT US + ROADMAP (LP01 結果ページからそのまま移植)
// =============================================================================
function ServiceIntroSection() {
  return (
    <section className="service-intro-section relative px-4 py-10">
      {/* 上部の巨大ブランド名マーキー (背景装飾) */}
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

        {/* ロードマップ見出し (同セクション内に統合) */}
        <div className="section-eyebrow-block mt-12">
          <span className="en">ROADMAP</span>
          <h2 className="ja">
            <span className="marker">転職成功までのロードマップ</span>
          </h2>
        </div>

        {/* STEP カード (sticky 進捗バー + スクロール演出) */}
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

// =============================================================================
// 5: FAQ
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
// 6: LAST MESSAGE (代表メッセージ)
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
            label="Section: ラストメッセージイメージ"
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
          <p>世の中には、たくさんの転職支援サービスがあります。</p>
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
          <p>あなたの人生を変える一歩を、私たちと一緒に踏み出してみませんか。</p>
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
// 短縮CTA — 特典画像なしのコンパクト版。
//   お知らせ + 「LINE登録者限定」ピル + 緑 radar ボタン。
//   転職成功事例の下 / アドバイザー紹介の下 などで再利用する。
// =============================================================================
function GuideShortCta({
  bg = "bg-white",
}: {
  bg?: string;
}) {
  return (
    // 上の余白を詰める (pt-2) + 背景色は呼び出し側で上のセクションに合わせる
    <section className={`px-4 pt-2 pb-9 ${bg}`}>
      <div className="max-w-[420px] mx-auto text-center">
        {/* ＼ 7月30日までの特別なご案内 ／ (大きめ) */}
        <div className="flex items-center justify-center gap-2 text-[#15803D] font-bold text-[17px] mb-3">
          <span className="text-[22px] leading-none text-[#22C55E]">＼</span>
          <span>
            <span className="text-brand-primary text-[21px] font-black">7月30日</span>
            までの特別なご案内
          </span>
          <span className="text-[22px] leading-none text-[#22C55E]">／</span>
        </div>

        {/* LINE登録者限定ピル + 緑 radar ボタン (入口LP と同じデザイン) */}
        <div className="cta-radar-stack max-w-[330px] mx-auto">
          <div className="relative bg-white border-2 border-[#06C755] rounded-full px-5 py-1.5 text-[12px] font-black text-[#06A648] mb-[-14px] z-10 shadow-md">
            LINE登録者限定
            <span className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-[#06C755] rotate-45" />
          </div>
          <Lp07GuideCta>
            「20代転職ガイド」を
            <br />
            いますぐ受け取る！
          </Lp07GuideCta>
        </div>
      </div>
    </section>
  );
}
