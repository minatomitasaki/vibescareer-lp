// 診断結果LP (/result/[id])
//
// 仕様: design/SPEC.md セクション 4 をベースに、視覚的なリッチさを優先したリデザイン版。
// ワイヤーフレームに縛られず、結果発表らしい祝祭感を出す。
//
// id 形式: "<job>-<workplace>" の 12 パターン
//   (creative|support|marketing|planning|engineer|sales) × (speed|stable)
//
// Phase 1: 可変ブロック (Section 1-4)
// 残りの Section 5-18 は後続フェーズで追加。
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { EntryForm } from "@/components/EntryForm";
import {
  RESULT_DATA,
  allResultIds,
  isResultId,
  type ResultData,
} from "@/data/results";
import {
  ADVISORS,
  PARTNER_COMPANIES,
  SUCCESS_CASES,
  type Advisor,
  type SuccessCase,
} from "@/data/landing";

// -----------------------------------------------------------------------------
// 静的生成: 12 パターン全部を build 時に生成
// -----------------------------------------------------------------------------
export function generateStaticParams() {
  return allResultIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isResultId(id)) return { title: "診断結果 | VibesCareer" };
  const data = RESULT_DATA[id];
  return {
    title: `あなたは${data.jobLabel}に向いています | VibesCareer 診断結果`,
  };
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isResultId(id)) notFound();
  const data = RESULT_DATA[id];

  return (
    <main className="lp-container bg-white">
      {/* ヘッダー: 入口LPと統一 */}
      <header className="relative px-4 py-3 flex items-center justify-start bg-white">
        <Logo width={160} height={44} priority />
        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent" />
      </header>

      {/* === 可変ブロック (Section 1-4) === */}
      <ResultHeader data={data} />
      <InsightSection data={data} />

      {/* === 固定ブロック前半 (Section 5-9) === */}
      <RadarBonusSection variant="primary" />
      <AdvisorsSection />
      <SuccessCasesSection />
      <PartnersSection />
      <RadarBonusSection variant="secondary" />

      {/* === 固定ブロック後半 (Section 10-18) === */}
      <ConcernsSection />
      <CausesSection />
      <DeterminationSection />
      <ServiceIntroSection />
      <RoadmapSection />
      <RadarBonusSection variant="tertiary" />
      <FaqSection />
      <LastMessageSection />
      <FormSection resultId={data.id} />
    </main>
  );
}

// =============================================================================
// Section 1: 診断結果ヒーロー
// オレンジグラデ背景 + 装飾 + 賞状風青枠 + プライスタグ風適正年収
// =============================================================================
function ResultHeader({ data }: { data: ResultData }) {
  return (
    <section className="result-hero">
      <div className="relative pt-4 pb-2 flex flex-col items-center">
        {/* 職種別ヒーロー全体を 1 つのカード枠で囲う */}
        <div className="relative w-full max-w-[360px] bg-[#FFFAF5] border-2 border-brand-primary/25 rounded-3xl shadow-[0_8px_24px_rgba(255,107,0,0.08)] overflow-hidden">
          {/* sales はキャラ位置が高めで「に向いています。」と被るため、画像上部にクリーム余白を挟む */}
          {data.jobType === "sales" && (
            <div aria-hidden className="w-full h-12" />
          )}
          <ImagePlaceholder
            src={`/images/result-hero-${data.jobType}.png`}
            label={`Section 1: ${data.jobLabel} ヒーロー画像`}
            alt={`${data.jobLabel}として活躍する若手ビジネスパーソン2人`}
            width={1024}
            height={1536}
            priority
            className="w-full h-auto block"
          />

          {/* 画像の上 45% にテキスト群を絶対配置 (画像生成時に余白を確保済み) */}
          <div className="absolute inset-x-0 top-0 h-[45%] flex flex-col items-center justify-center px-3 gap-2.5">
            {/* ヘッダー: 「診断結果」+ サイドの星 */}
            <h1 className="result-eyebrow">
              <span className="side-spark left">✦</span>
              <span className="label">診断結果</span>
              <span className="side-spark right">✦</span>
            </h1>

            {/* 「あなたは...」リード */}
            <p className="result-lead-copy">あなたは</p>

            {/* シンプル枠ボックス */}
            <div className="result-job-frame w-full max-w-[320px]">
              <span className="sub">{data.workplaceSubLabel}</span>
              <span className="main">{data.jobLabel}</span>
            </div>

            {/* 「に向いています。」 */}
            <p className="result-lead-copy">に向いています。</p>
          </div>
        </div>

        {/* 適正年収カード */}
        <div className="mt-8 w-full max-w-[320px] result-salary-card">
          <span className="label">適正年収</span>
          <span className="value">{data.salaryRange}</span>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// Section 2-4: 持ち味 / アドバイス / その他の適職 を 1 つの白ボックスに統合
// =============================================================================
function InsightSection({ data }: { data: ResultData }) {
  return (
    <section className="px-4 pt-6 pb-8">
      <div className="result-insight-block">
        {/* あなたの持ち味 */}
        <div className="result-insight-item">
          <h3 className="result-insight-heading">
            <span className="result-insight-en">YOUR STRENGTHS</span>
            <span className="result-insight-ja">あなたの持ち味</span>
          </h3>
          <p className="result-insight-text">{data.strength}</p>
        </div>

        <div className="result-insight-divider" aria-hidden />

        {/* プロからのアドバイス */}
        <div className="result-insight-item">
          <h3 className="result-insight-heading">
            <span className="result-insight-en">PROFESSIONAL ADVICE</span>
            <span className="result-insight-ja">プロからのアドバイス</span>
          </h3>
          <p className="result-insight-text">{data.advice}</p>
        </div>

        <div className="result-insight-divider" aria-hidden />

        {/* その他の適職 */}
        <div className="result-insight-item">
          <h3 className="result-insight-heading">
            <span className="result-insight-en">OTHER POSSIBILITIES</span>
            <span className="result-insight-ja">その他の適職</span>
          </h3>
          <div className="flex flex-col gap-4 mt-3">
            {data.otherJobs.map((job) => (
              <div key={job.name} className="result-other-card">
                <span className="job-name">{job.name}</span>
                <p className="job-desc">{job.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// Section 5 / 9 / 15: VibesRadar 特典カード (再利用コンポーネント)
// variant: primary (1回目) / secondary (2回目) / tertiary (3回目)
// 装飾は同じ、ラベルだけ少し変える
// =============================================================================
function RadarBonusSection({
  variant: _variant,
}: {
  variant: "primary" | "secondary" | "tertiary";
}) {
  return (
    // 画像と CTA を 1 つの CTA セクションとして、画像の背景色 (#ECFDF3) と
    // 同じミント緑で section 全体を塗って白い間隙を消す。
    <section className="px-4 pt-8 pb-10 bg-[#ECFDF3]">
      <div className="flex justify-center">
        <ImagePlaceholder
          src="/images/result-radar-bonus.png"
          label="VibesRadar 無料チケット特典"
          alt="15秒診断を受けた方限定で無料配布。VibesRadar の無料チケット ¥3,300 → ¥0。次世代型パーソナルWeb診断で 8 つのポテンシャルタイプ・全 48 項目・ネガティブアラート 5 つを可視化。"
          width={1024}
          height={1536}
          className="w-full h-auto max-w-[480px] block"
        />
      </div>
      <div className="mt-2 flex justify-center px-2">
        <Link
          href="#form"
          className="btn-cta-radar group w-full max-w-[420px]"
        >
          <span className="relative z-10">いますぐチケットを受け取る</span>
          <span className="relative z-10 inline-block transition-transform group-hover:translate-x-1">
            ▶
          </span>
        </Link>
      </div>
    </section>
  );
}

// =============================================================================
// Section 6: アドバイザー紹介
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
      {/* オレンジグラデのヘッダー帯: 顔写真 + 役職 + 名前 */}
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
          <span className="advisor-role">{advisor.role}</span>
          <p className="advisor-name">{advisor.name}</p>
        </div>
      </header>

      {/* 本文 */}
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
// Section 7: 転職成功事例 (実績)
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
      {/* 上部: 大きな写真 + 名前・年齢オーバーレイ */}
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

      {/* BEFORE / AFTER の 2 列ボックス */}
      <div className="success-case-ba">
        <div className="success-case-ba-col before">
          <span className="success-case-ba-label">BEFORE</span>
          <span className="success-case-ba-job">{caseData.beforeCompany}</span>
          <span className="success-case-ba-salary">
            年収{caseData.beforeSalary}
          </span>
        </div>
        <span className="success-case-ba-arrow" aria-hidden>
          ▶
        </span>
        <div className="success-case-ba-col after">
          <span className="success-case-ba-label">AFTER</span>
          <span className="success-case-ba-job">{caseData.afterCompany}</span>
          <span className="success-case-ba-salary">
            年収{caseData.afterSalary}
          </span>
        </div>
      </div>

      {/* +XX万円UP バッジ */}
      <div className="success-case-up-badge">
        年収 +{caseData.salaryUp}円 UP ↗
      </div>

      {/* タイトル */}
      <h3 className="success-case-title">{caseData.title}</h3>

      {/* 本文 */}
      <p className="success-case-body">{caseData.body}</p>
    </article>
  );
}

// =============================================================================
// Section 8: 取り扱い企業 (横スクロール)
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
            <span className="text-brand-primary">5,000社以上！</span>
          </span>
          <span className="slash">／</span>
        </div>
        <span className="sub">あなたに適した職場が、必ず見つかる</span>
      </div>

      <div className="partners-scroll">
        {PARTNER_COMPANIES.map((name) => (
          <div key={name} className="partners-chip">
            {name}
          </div>
        ))}
      </div>
      <p className="text-center text-[10px] text-text-muted mt-4">
        ※ ロゴは本番差し替え予定
      </p>
    </section>
  );
}

// =============================================================================
// Section 10: 悩み訴求
// 見出し + 悩み顔ビジュアル + 悩みカード × 4
// =============================================================================
const CONCERNS = [
  "今の会社が自分に合っているとは思えない。やりがいを感じられない。",
  "このまま今の仕事を続けていても、成長できるイメージが持てない。",
  "頑張りや成績に見合うだけの評価や年収が欲しい。",
  "もっと自分本来の力を発揮できる会社で働きたい。",
];

function ConcernsSection() {
  return (
    <section className="px-4 py-10 bg-bg-subtle">
      <div className="section-eyebrow-block">
        <span className="en">CONCERNS</span>
        <h2 className="ja">
          第2新卒の転職希望者から<br />
          <span className="marker">こんな悩み</span>をよく相談されます
        </h2>
      </div>

      {/* ビジュアル: 男女の悩み顔 (IMAGE2.0 生成) */}
      <div className="mt-2 flex justify-center">
        <ImagePlaceholder
          src="/images/result-concerns-faces.png"
          label="Section 10: 悩み訴求イメージ"
          alt="若手ビジネスパーソンが転職について悩んでいる様子"
          width={1024}
          height={1024}
          rounded
          className="w-full h-auto max-w-[320px]"
        />
      </div>

      {/* 悩みカード × 4 */}
      <ul className="mt-6 space-y-3">
        {CONCERNS.map((c, i) => (
          <li
            key={i}
            className="relative bg-white rounded-2xl border-2 border-brand-primary/20 pl-14 pr-4 py-3.5 shadow-[0_2px_8px_rgba(255,107,0,0.06)]"
          >
            <span className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-brand-primary text-white text-[14px] font-black flex items-center justify-center shadow-md">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-[13.5px] leading-[1.7] text-text-secondary font-bold">
              {c}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

// =============================================================================
// Section 11: 悩みの原因 — 3人に1人が早期離職
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

      <div className="mt-2 flex justify-center">
        <ImagePlaceholder
          src="/images/result-headache-three.png"
          label="Section 11: 悩みの原因イメージ"
          alt="頭を抱える3人の若手社会人"
          width={1536}
          height={1024}
          rounded
          className="w-full h-auto max-w-[420px]"
        />
      </div>

      <div className="mt-6 space-y-4 text-[13.5px] leading-[1.95] text-text-secondary">
        <p>
          厚生労働省の公表データによると、新卒3年以内の離職率は約30%。つまり、
          <strong className="text-brand-primary">3人に1人が早期離職している</strong>
          という事実があります。
        </p>
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
// Section 12: 意気込みコピー — オレンジ全面の宣言ブロック
// =============================================================================
function DeterminationSection() {
  return (
    <section className="px-6 py-12 bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white text-center">
      <p className="text-[15px] leading-[1.95] font-bold">
        我々、
        <span className="block text-[22px] my-2 tracking-wide">
          VibesCareer（バイブスキャリア）
        </span>
        にすべてお任せください。
      </p>
      <p className="mt-4 text-[18px] font-black leading-[1.5]">
        あなたの転職を
        <br />
        <span className="text-accent-yellow">成功させてみせます。</span>
      </p>
    </section>
  );
}

// =============================================================================
// Section 13: サービス紹介
// =============================================================================
function ServiceIntroSection() {
  return (
    <section className="px-4 py-10 bg-bg-subtle">
      <div className="section-eyebrow-block">
        <span className="en">OUR SOLUTION</span>
        <h2 className="ja">
          VibesCareerは<br />
          <span className="marker">どんなサービス？</span>
        </h2>
        <span className="sub">
          「適職×適正年収」を約束する<br />
          第２新卒特化型の転職支援サービスです。
        </span>
      </div>

      <div className="mt-2 flex justify-center">
        <ImagePlaceholder
          src="/images/result-service-hero.png"
          label="Section 13: サービス紹介イメージ"
          alt="アドバイザーと相談者の面談シーン"
          width={1536}
          height={1024}
          rounded
          className="w-full h-auto max-w-[420px]"
        />
      </div>

      <div className="mt-6 space-y-4 text-[13.5px] leading-[1.95] text-text-secondary">
        <p>
          一般的な転職支援では、はじめから転職を前提に、多くの求人紹介や短期間での意思決定を求められがちです。
        </p>
        <p>
          VibesCareerでは「本当に自分に合う仕事は何か」を見極めるため、
          <strong className="text-brand-primary">
            あなたに本気で向き合うパーソナルカウンセリングを徹底
          </strong>
          します。
        </p>
        <p>
          さらに、次世代型パーソナルWeb診断「VibesRadar」を受検いただき、統計学に基づいた自己分析を実施。
          <strong>&quot;最適な職種&quot;へ&quot;適正年収&quot;での転職支援</strong>
          をお約束します。
        </p>
        <p className="text-[11px] text-text-muted">
          ※サービスはすべて無料で受けられます
        </p>
      </div>
    </section>
  );
}

// =============================================================================
// Section 14: 転職成功までのロードマップ (3 STEP)
// =============================================================================
const ROADMAP_STEPS = [
  {
    step: 1,
    title:
      "パーソナル適性診断『VibesRadar』で、まずは“本当の自分”を知る",
    body: "転職で後悔しないために最も大切なのは、求人を見ることではなく、まずは自分自身を正しく理解すること。VibesRadarは、一般的な適性検査をさらに発展させた、よりパーソナルな傾向を分析できる次世代型のWeb診断サービスです。あなたの特性や強みはもちろん、これまで自分でも気づいていなかった思考のクセや秘められたポテンシャル、ストレス耐性や入社後の成長度合いまで、多角的に可視化。なお、本来有料でのご案内ですが、本ページからの申請で完全無料で受検いただけます。",
    callout: { ratio: "6", text: "がココで決まる！" },
  },
  {
    step: 2,
    title:
      "専属のキャリアアドバイザーが一緒に自己分析し、キャリア設計を構築",
    body: "VibesRadarの結果をもとに、プロのキャリアアドバイザーがあなたと一緒に自己分析を深めていきます。表面的な希望条件だけでなく、これまでの経験や現在の悩み、将来の理想像まで丁寧に整理しながら、あなたに本当に合ったキャリアの方向性を明確にしていきます。\n・どんな環境なら力を発揮できるのか\n・どんな働き方なら納得感を持てるのか\nまで伴走して考えることで、転職の解像度を引き上げながらあなただけのキャリア設計を構築します。",
    callout: { ratio: "8", text: "がココで決まる！" },
  },
  {
    step: 3,
    title:
      "“最適な職場”に“適正年収”で転職できるよう支援",
    body: "自己分析とキャリア設計を終えたら、次はあなたに合う企業を厳選してご紹介します。ここで大切にしているのは、あなたがその会社で存分に力を発揮できるか、納得して働き続けられるか。そこまで考えたうえで、最適な選択肢をご提案します。応募や面接のサポートはもちろん、企業ごとのリアルな情報提供や内定後の相談まで、最後までしっかり伴走します。",
    callout: null as null | { ratio: string; text: string },
  },
];

function RoadmapSection() {
  return (
    <section className="px-4 py-10 bg-white">
      <div className="section-eyebrow-block">
        <span className="en">ROADMAP</span>
        <h2 className="ja">
          【<span className="marker">転職成功までのロードマップ</span>】
        </h2>
      </div>

      <div className="mt-2 flex justify-center">
        <ImagePlaceholder
          src="/images/result-roadmap.png"
          label="Section 14: ロードマップイメージ"
          alt="3 STEP で上昇していくロードマップ"
          width={1536}
          height={1024}
          rounded
          className="w-full h-auto max-w-[440px]"
        />
      </div>

      <ol className="mt-8 space-y-6">
        {ROADMAP_STEPS.map((s) => (
          <li
            key={s.step}
            className="relative bg-bg-subtle rounded-2xl border-2 border-brand-primary/15 p-5 pt-7 shadow-sm"
          >
            <span className="absolute -top-3 left-4 bg-brand-primary text-white text-[12px] font-black px-3 py-1 rounded-full shadow-md tracking-wider">
              STEP {s.step}
            </span>
            <h3 className="text-[14.5px] font-black text-text-primary leading-[1.55] mb-3">
              {s.title}
            </h3>
            <p className="text-[12.5px] leading-[1.85] text-text-secondary whitespace-pre-line">
              {s.body}
            </p>
            {s.callout && (
              <div className="mt-4 inline-flex items-center bg-brand-primary text-white rounded-full pl-3 pr-4 py-1.5 shadow-md">
                <span className="text-[10.5px] mr-1">転職成功の</span>
                <span className="text-[24px] font-black mx-0.5 leading-none">
                  {s.callout.ratio}
                </span>
                <span className="text-[13px] font-black mr-1">割</span>
                <span className="text-[10.5px]">{s.callout.text}</span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

// =============================================================================
// Section 16: FAQ — 7 問
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
              <p className="text-[13px] font-bold text-text-primary leading-[1.6]">
                {item.q}
              </p>
            </div>
            <div className="px-4 py-3 flex gap-3">
              <span className="text-text-muted text-[18px] font-black leading-none flex-shrink-0">
                A.
              </span>
              <p className="text-[12.5px] text-text-secondary leading-[1.8]">
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
// Section 17: ラストメッセージ — 山頂ビジュアル + 渡邉氏署名
// =============================================================================
function LastMessageSection() {
  return (
    <section className="px-4 py-10 bg-white">
      <div className="section-eyebrow-block">
        <span className="en">LAST MESSAGE</span>
        <h2 className="ja">
          転職を迷っている<br />
          <span className="marker">あなたへ。</span>
        </h2>
      </div>

      <div className="mt-2 flex justify-center">
        <ImagePlaceholder
          src="/images/result-last-message.png"
          label="Section 17: ラストメッセージイメージ"
          alt="山頂から朝焼けを見下ろすビジネスパーソン"
          width={1024}
          height={1536}
          rounded
          className="w-full h-auto max-w-[320px]"
        />
      </div>

      <div className="mt-6 space-y-4 text-[13.5px] leading-[1.95] text-text-secondary">
        <p>最後までページをご覧いただき、ありがとうございます。</p>
        <p>
          「<strong>朝起きるのが楽しくなる仕事</strong>」が必ず見つかる。想像するだけでも、ワクワクしてきませんか？
        </p>
        <p>
          あなたの人生を変える一歩を、私たちと一緒に踏み出してみませんか。
        </p>
      </div>

      <p className="mt-8 text-right text-[12.5px] text-text-muted">
        VibesCareer 代表
        <br />
        <span className="text-[18px] font-black text-text-primary tracking-wider">
          渡邉 大典
        </span>
      </p>
    </section>
  );
}

// =============================================================================
// Section 18: フォーム — 結果LPに内包
// フォーム本体は src/components/EntryForm.tsx (client component) に分離。
// 送信時に GAS の Web App エンドポイントへ POST → /schedule へ遷移する。
// =============================================================================
function FormSection({ resultId }: { resultId: string }) {
  return (
    <section id="form" className="px-4 py-10 bg-bg-form">
      <div className="bg-white rounded-3xl p-5 shadow-md">
        <p className="text-center text-[14px] font-black text-text-primary leading-[1.7]">
          カンタン申し込み＆<br />
          カウンセリング予約で<br />
          <span className="text-brand-primary text-[16px]">
            VibesRadarの無料チケット
          </span>
          を<br />
          プレゼント！
        </p>

        <ol className="mt-6 space-y-2.5">
          {[
            { step: 1, icon: "📱", text: "下記フォームから必要情報を入力" },
            { step: 2, icon: "📅", text: "ご希望の日時で初回カウンセリング日程を調整" },
            { step: 3, icon: "🎫", text: "VibesRadarの受検チケットを送信" },
          ].map((s) => (
            <li
              key={s.step}
              className="flex items-center gap-3 bg-bg-subtle rounded-xl px-3 py-2.5"
            >
              <span className="w-10 h-10 flex-shrink-0 rounded-full bg-brand-primary text-white font-black flex flex-col items-center justify-center leading-none">
                <span className="text-[8px] tracking-wider">STEP</span>
                <span className="text-[13px] mt-0.5">{s.step}</span>
              </span>
              <span className="text-[22px]">{s.icon}</span>
              <p className="text-[12.5px] font-bold text-text-primary leading-[1.5]">
                {s.text}
              </p>
            </li>
          ))}
        </ol>

        <EntryForm resultId={resultId} />
      </div>
    </section>
  );
}

// =============================================================================
// 装飾: 紙吹雪風の星マークをヒーローに散らす
// =============================================================================
function Sparkles() {
  // 位置・サイズはランダム感を出しつつ固定
  const sparkles = [
    { top: "8%",  left: "8%",  size: 14, color: "#FF8533", rot: -10 },
    { top: "14%", left: "92%", size: 12, color: "#1E73FF", rot: 20 },
    { top: "26%", left: "5%",  size: 10, color: "#FFD700", rot: 5 },
    { top: "5%",  left: "62%", size: 16, color: "#FF6B00", rot: 30 },
    { top: "22%", left: "78%", size: 14, color: "#FF8533", rot: -20 },
    { top: "38%", left: "92%", size: 10, color: "#FFD700", rot: 10 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      {sparkles.map((s, i) => (
        <span
          key={i}
          className="absolute font-black"
          style={{
            top: s.top,
            left: s.left,
            fontSize: s.size,
            color: s.color,
            transform: `translate(-50%, -50%) rotate(${s.rot}deg)`,
            textShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}
