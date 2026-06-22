// LP06 「日本一ズル賢い エスカレーター式・転職成功術」入口LP
//
// コンセプト: 原稿「人材_Newコンセプト」(ラクしてホワイト企業へ転職 / 日本一ズル賢い)
// トンマナ: B案 黒×金「フィクサー」路線 (ダーク・シネマティック・重厚)
// 方針:
//   - ヘッダー(FV)は全画像 (public/images/lp06-header-fixer.png)
//   - コピーは原稿の文言・並び順を厳守 (改変禁止)
//   - 既存LP(warm orange)とは別テーマなので、このページ内でダーク配色を完結させる
import type { Metadata } from "next";
import Image from "next/image";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import {
  SUCCESS_CASES,
  type SuccessCase,
  PARTNER_LOGOS,
  ADVISORS,
  type Advisor,
} from "@/data/landing";

export const metadata: Metadata = {
  title: "日本一ズル賢い エスカレーター式・転職成功術 | VibesCareer",
  description:
    "まるで裏口入学！？20代だけが使える、日本一ズル賢いエスカレーター式・転職成功術。サクッとホワイト企業へ転職しませんか？",
};

export default function Lp06Page() {
  return (
    <main className="bg-[#0A0A0A] text-white min-h-screen">
      <div className="lp-container">
      {/* === ヘッダー (FV): 全画像 === */}
      <section className="relative bg-[#0A0A0A]">
        <Image
          src="/images/lp06-header-escalator.png"
          alt="え！？ホワイト企業への転職ってこんなにカンタンだったの？ まるで裏口入学！？20代のいまだけ使える 日本一ズル賢い エスカレーター式・転職成功術 VibesCareer あなたもサクッとホワイト企業へ転職しませんか？"
          width={1024}
          height={1536}
          priority
          className="w-full h-auto block"
        />
      </section>

      {/* === お知らせ (1日3名様限定) + CTA === */}
      <NoticeCtaSection />

      {/* === セクション2: 諦めの声 → こっそり抜け駆け訴求 (全画像) === */}
      <section className="relative bg-[#0A0A0A]">
        <Image
          src="/images/lp06-section2-v8.png"
          alt="僕にはたいした学歴がないから… まだ2年目だし、知識もスキルもないし… 転職したところで、どうせ次もうまくいかない気がする… みんなが転職を諦める中、こっそりと抜け駆けしてあなただけが内定を次々と勝ち取る不思議な感覚にきっと衝撃を受けるでしょう。"
          width={1024}
          height={1536}
          className="block h-auto w-full"
        />
      </section>

      {/* === セクション3: 「もっと早く知りたかった」リアル女性の声 (全画像) === */}
      <section className="relative bg-[#0A0A0A]">
        <Image
          src="/images/lp06-section3-v5.png"
          alt="こんな確実なやり方があったなら、もっと早く知りたかった…！"
          width={1536}
          height={1024}
          className="block h-auto w-full"
        />
      </section>

      {/* === セクション4: VibesCareerだけが提供できる2つの武器 (全画像) === */}
      <section className="relative bg-[#0A0A0A]">
        <Image
          src="/images/lp06-section4-v6.png"
          alt="その秘密は… VibesCareerだけが提供できる2つの武器 潜在的なポテンシャルを数値化するオリジナル診断『VibesRadar』を使った自己分析 ”内定のカラクリ”を熟知し、年間1万人の転職者をアテンドした専門アドバイザーによる完全伴走サポート 残念ながら、他の転職支援サービス・転職エージェントでは”絶対に”提供できません。"
          width={1024}
          height={1536}
          className="block h-auto w-full"
        />
      </section>

      {/* === セクション5: 提供物リスト (シークレット機密ファイル風) === */}
      <section className="relative bg-[#0A0A0A]">
        <Image
          src="/images/lp06-section5-v2.png"
          alt="知識、スキル、学歴は一切不問。 ◆ホワイト企業の求人リスト（シークレット） ◆通過率を3倍UPする書類記述テクニック ◆「こいつが欲しい！」と思わせる面接必勝法 必要な情報は、すべて我々が揃えています。"
          width={1024}
          height={1536}
          className="block h-auto w-full"
        />
      </section>

      {/* === セクション6: エスカレーターでスイスイ → 内定の嵐へ (全画像) === */}
      <section className="relative bg-[#0A0A0A]">
        <Image
          src="/images/lp06-section6-v4.png"
          alt="あなたはただ、エスカレーターに乗っているような感覚でスイスイ進むだけで気づけばホワイト企業から内定の嵐へ！"
          width={1024}
          height={1536}
          className="block h-auto w-full"
        />
      </section>

      {/* === セクション7: クロージング行動喚起 (光が差す夜明け) === */}
      <section className="relative bg-[#0A0A0A]">
        <Image
          src="/images/lp06-section7-v3.png"
          alt="さあ、あとはあなたが行動するだけです。 私たちと一緒に、ストレスフリーな転職を実現しませんか？"
          width={1024}
          height={1536}
          className="block h-auto w-full"
        />
      </section>

      {/* === スペシャル特典: VibesRadar受検チケット無料プレゼント (全画像) === */}
      <section className="relative bg-[#0A0A0A]">
        <Image
          src="/images/lp06-bonus-v2.png"
          alt="＜スペシャル特典＞ このページからのお申込み限定！ 話題沸騰の自己分析診断『VibesRadar』の受検チケットを無料プレゼント 3300円→0円"
          width={1024}
          height={1536}
          className="block h-auto w-full"
        />
      </section>

      {/* === スペシャル特典の下: CTA (お知らせ + LINE登録) 2回目 === */}
      <NoticeCtaSection />

      {/* === 実績: 転職成功事例 (黒金版・全4件) === */}
      <SuccessCasesSection />

      {/* === 求人多数: パートナー企業ロゴ マーキー (黒金) === */}
      <PartnersSection />

      {/* === 求人多数の下: CTA (お知らせ + LINE登録) === */}
      <NoticeCtaSection />

      {/* === 悩みブレット (lp04流用・黒金) === */}
      <ConcernsSection />

      {/* === 解決策: VibesCareer概要 (差別化 + ラクして内定) === */}
      <SolutionSection />

      {/* === カンタン3ステップ === */}
      <ThreeStepsSection />

      {/* === 3ステップの下: CTA (お知らせ + LINE登録) === */}
      <NoticeCtaSection />

      {/* === キャリアアドバイザー紹介 (流用・黒金) === */}
      <AdvisorsSection />

      {/* === QA (lp04と同じ内容・黒金) === */}
      <FaqSection />

      {/* === 最後のCTA (お知らせ + LINE登録) === */}
      <NoticeCtaSection />
      </div>
    </main>
  );
}

// =============================================================================
// お知らせ + CTA
// 原稿のヘッダー直後ブロック:
//   ※お知らせ※
//   大変ご好評につき、
//   面談は1日3名様限定としております。
//   希望枠が埋まる前に、どうか急いでお申込みだけでもお済ませください。
//   CTA
// =============================================================================
function NoticeCtaSection() {
  return (
    <section className="relative px-5 pt-0 pb-12 bg-[#0A0A0A] overflow-hidden">
      {/* 背景の金色のうっすらした光 (重厚感) */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.12),transparent_70%)]"
      />

      {/* お知らせカード (画像) */}
      <Image
        src="/images/lp06-notice.png"
        alt="※お知らせ※ 大変ご好評につき、面談は1日3名様限定としております。希望枠が埋まる前に、どうか急いでお申込みだけでもお済ませください。"
        width={1536}
        height={1024}
        className="block h-auto w-full"
      />

      {/* CTA */}
      <div className="mt-7">
        <Lp06CtaButton />
      </div>
    </section>
  );
}

// =============================================================================
// CTA ボタン (黒地に映える金グラデのピル)
// 注: ボタン文言・遷移先は原稿に明示がないため暫定。
//     遷移先 (LINE登録 / フォーム等) が確定したら href を差し替える。
// =============================================================================
function Lp06CtaButton({ label = "LINEで申し込む" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center">
      {/* 希少性の煽り (＼ … ／ 明滅) */}
      <div className="lp06-blink mb-3 flex items-center gap-2.5 text-[19px] font-black text-[#E8C766]">
        <span aria-hidden>＼</span>
        枠が埋まる前に、今すぐ
        <span aria-hidden>／</span>
      </div>

      {/* パルスリング + 上下フロート のラッパー */}
      <div className="lp06-cta-ring lp06-cta-float relative w-full max-w-[340px] rounded-full">
        <a
          href="https://s.lmes.jp/landing-qr/2010430660-JaImwgX3?uLand=xJhGY8"
          target="_blank"
          rel="noopener noreferrer"
          className="lp06-cta-shine group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-b from-[#27D873] to-[#06C755] px-6 py-4 text-center text-[18px] font-black text-white shadow-[0_8px_26px_rgba(6,199,85,0.5)] transition-transform active:scale-[0.97]"
        >
          <LineIcon />
          <span className="relative z-10">{label}</span>
          <span className="lp06-cta-arrow relative z-10 inline-block">▶</span>
        </a>
      </div>

      {/* 補助テキスト */}
      <p className="mt-4 text-[12px] tracking-wider text-white/55">
        相談・診断はすべて無料／全国どこでもオンライン対応
      </p>
    </div>
  );
}

// =============================================================================
// LINE アイコン (吹き出しシルエット)
// 注: 正式リリース時は LINE 公式の「友だち追加」ボタン素材への差し替えを推奨
//     (ロゴ・ボタンは LINE のbrand guidelines に従う)。
// =============================================================================
function LineIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`${className} flex-shrink-0 text-white`}
      aria-hidden
    >
      <path d="M12 2C6.48 2 2 5.74 2 10.5c0 4.27 3.56 7.84 8.37 8.52.33.07.77.22.88.5.1.26.07.66.03.92l-.13.85c-.04.25-.2 1 .88.55 1.08-.46 5.81-3.42 7.93-5.86C21.34 14.18 22 12.46 22 10.5 22 5.74 17.52 2 12 2Zm-3.4 11.18H6.94a.45.45 0 0 1-.45-.45V9.3a.45.45 0 0 1 .9 0v2.98h1.21a.45.45 0 0 1 0 .9Zm1.86-.45a.45.45 0 0 1-.9 0V9.3a.45.45 0 0 1 .9 0v3.43Zm4.13 0a.45.45 0 0 1-.31.43h-.14a.45.45 0 0 1-.36-.18l-1.76-2.39v2.14a.45.45 0 0 1-.9 0V9.3a.45.45 0 0 1 .31-.43h.14a.45.45 0 0 1 .36.18l1.76 2.39V9.3a.45.45 0 0 1 .9 0v3.43Zm2.9-2.17a.45.45 0 0 1 0 .9h-1.21v.77h1.21a.45.45 0 0 1 0 .9h-1.66a.45.45 0 0 1-.45-.45V9.3a.45.45 0 0 1 .45-.45h1.66a.45.45 0 0 1 0 .9h-1.21v.78h1.21Z" />
    </svg>
  );
}

// =============================================================================
// 実績: 転職成功事例 (LP05 の SuccessCasesSection を流用)
// =============================================================================
function SuccessCasesSection() {
  return (
    <section className="px-4 pt-10 pb-10 bg-[#ECECEC]">
      {/* 見出し (グレー背景に合わせ濃色 + ダークゴールド) */}
      <div className="text-center">
        <span className="text-[13px] font-bold tracking-[0.25em] text-[#B8860B]">
          SUCCESS STORIES
        </span>
        <h2 className="mt-2 text-[24px] font-black leading-[1.5] text-[#1A1A1A]">
          第２新卒の
          <br />
          <span className="text-[#B8860B]">転職成功者、多数！</span>
        </h2>
        <p className="mt-3 text-[13.5px] leading-[1.8] text-[#555]">
          あなたと同じ境遇から転職を成功させた
          <br />
          先輩のお声を紹介します。
        </p>
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
    <article className="mt-7 overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-b from-[#161310] to-[#0B0A09] shadow-[0_0_28px_rgba(212,175,55,0.15)]">
      {/* 写真 + 名前タグ */}
      <div className="relative">
        <ImagePlaceholder
          src={caseData.photo}
          label={`実績: ${caseData.name} (${caseData.age}歳) 写真`}
          alt={`${caseData.name} (${caseData.age}歳) のカウンセリングシーン`}
          width={1024}
          height={640}
          className="block h-auto w-full"
        />
        <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2.5 py-1 text-[13px] font-bold text-[#F0D879] backdrop-blur-sm">
          {caseData.name}（{caseData.age}歳）
        </span>
      </div>

      {/* 年収アップ インフォグラフィック */}
      <div className="border-y border-[#D4AF37]/20">
        <ImagePlaceholder
          src={`/images/lp06-success-${caseData.id}-salary.png`}
          label={`実績: ${caseData.name} の年収アップ ${caseData.beforeCompany} ¥${caseData.beforeAmount}万 → ${caseData.afterCompany} ¥${caseData.afterAmount}万 (+${caseData.salaryUpAmount}万UP) (黒金版)`}
          alt={`${caseData.beforeCompany} 年収¥${caseData.beforeAmount}万 から ${caseData.afterCompany} 年収¥${caseData.afterAmount}万 へ。年収+${caseData.salaryUpAmount}万円UP。`}
          width={1536}
          height={1024}
          className="block h-auto w-full"
        />
      </div>

      {/* 声 (とにかく簡単・サクサク・頼りっぱなし を訴求) */}
      <div className="px-4 py-4">
        <h3 className="text-[17px] font-black leading-[1.5] text-[#F0D879]">
          {caseData.title}
        </h3>
        <p className="mt-2.5 text-[14px] leading-[1.85] text-white/80">
          {caseData.body}
        </p>
      </div>
    </article>
  );
}

// =============================================================================
// 求人多数: パートナー企業ロゴ マーキー (lp04 流用・黒金トンマナ)
// =============================================================================
function PartnersSection() {
  return (
    <section className="px-4 py-10 bg-[#ECECEC] overflow-hidden">
      {/* 見出し (グレー背景に合わせ濃色 + ダークゴールド) */}
      <div className="text-center">
        <span className="text-[13px] font-bold tracking-[0.25em] text-[#B8860B]">
          PARTNER COMPANIES
        </span>
        <div className="mt-2 flex items-center justify-center gap-1 text-[22px] font-black text-[#1A1A1A]">
          <span className="text-[#B8860B]">＼</span>
          <span>
            紹介企業は、
            <span className="inline-block align-baseline text-[30px] text-[#B8860B]">
              10,000社以上！
            </span>
          </span>
          <span className="text-[#B8860B]">／</span>
        </div>
        <p className="mt-2 text-[13.5px] text-[#555]">
          あなたに適した職場が、必ず見つかる
        </p>
      </div>

      {/* 上下 2 行で逆方向に流れる無限マーキー */}
      <div className="partners-marquee-wrap mt-6">
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
// 悩みブレット (lp04 ConcernsSection 流用・黒金トンマナ)
// =============================================================================
function ConcernsSection() {
  const concerns = [
    "上司が厳しくて、もう会社をやめたい…",
    "残業ばかりで毎日へとへと。心も体もきつい…",
    "給料は上がらないのに、仕事量だけ増えていく…",
    "今の職場から、とにかく早く逃げ出したい…",
    "そもそも面接が苦手で、うまく話せない…",
    "どうやって転職すればいいのか、わからない…",
    "面接を受けても、全然受からない…",
    "自分の強みがわからず、自己分析ができない…",
  ];
  return (
    <section className="px-4 py-10 bg-[#ECECEC]">
      <div className="text-center">
        <span className="text-[13px] font-bold tracking-[0.25em] text-[#B8860B]">
          CONCERNS
        </span>
        <h2 className="mt-2 text-[21px] font-black leading-[1.5] text-[#1A1A1A]">
          <span className="text-[#B8860B]">こんな悩み</span>をよく聞きます
        </h2>
      </div>

      {/* 画像 (サブヘッドとブレットの間) */}
      <div className="mx-auto mt-6 flex max-w-[440px] justify-center">
        <ImagePlaceholder
          src="/images/lp06-concerns.png"
          label="悩み訴求イメージ (黒金)"
          alt="今の仕事に悩み、疲れている若手社会人"
          width={1536}
          height={1024}
          rounded
          className="w-full h-auto"
        />
      </div>

      {/* 1 つの大枠に 8 項目 */}
      <div className="mx-auto mt-6 max-w-[440px] rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-b from-[#161310] to-[#0B0A09] px-5 py-4">
        <ul>
          {concerns.map((body, i) => (
            <li
              key={i}
              className={`flex items-start gap-3 py-3 ${
                i > 0 ? "border-t border-[#D4AF37]/15" : ""
              }`}
            >
              <span className="mt-0.5 flex-shrink-0 text-[15px] font-black text-[#F0D879]">
                ✓
              </span>
              <span className="text-[15.5px] leading-[1.7] text-white/90">{body}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// =============================================================================
// 解決策: VibesCareer 概要 (他社との差別化 + ラクして内定)
// =============================================================================
function SolutionSection() {
  return (
    <section className="relative overflow-hidden bg-[#0A0A0A] px-4 pt-16 pb-12">
      {/* 背景: VibesCareer 横スライド (薄金) — 見出しより上に配置 */}
      <div className="lp06-bg-marquee-wrap" aria-hidden>
        <div className="lp06-bg-marquee">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i}>VibesCareer</span>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="text-center">
          <span className="text-[13px] font-bold tracking-[0.25em] text-[#D4AF37]">
            ABOUT US
          </span>
          <h2 className="mt-2 text-[22px] font-black leading-[1.5] text-white">
            その悩み、
            <span className="text-[#F0D879]">VibesCareer</span>が
            <br />
            すべて解決します
          </h2>
        </div>

        <div className="mx-auto mt-7 max-w-[440px]">
          {/* 一般的な転職支援 (ネガ・色褪せ) */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5">
            <p className="mb-1.5 text-[11px] font-bold tracking-wider text-white/35">
              一般的な転職支援は…
            </p>
            <p className="text-[14.5px] leading-[2] text-white/55">
              アドバイザーと何度も面談しながら自己分析や面接対策を行い、ライバルたちと競争しながら
              <span className="font-bold text-white/75">苦労して</span>
              内定を勝ち取る。
            </p>
          </div>

          {/* VibesCareer (主役・金強調) */}
          <p className="mt-6 text-[15px] leading-[2.05] text-white/90">
            <span className="font-black text-[#F0D879]">VibesCareer</span>
            では、
            <span className="font-bold text-[#F0D879]">とある仕組み</span>
            を導入することで、20代が
            <span className="relative inline-block font-black text-[#F0D879]">
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-[1px] h-[7px] bg-[#D4AF37]/25"
              />
              <span className="relative">ストレスなく・ラクして</span>
            </span>
            ホワイト企業の内定を勝ち取るための、
          </p>
          <p className="mt-3 text-center text-[20px] font-black leading-[1.5] text-[#F5D87A]">
            日本一ズル賢い
            <br className="sm:hidden" />
            転職支援サービスです。
          </p>
          <p className="mt-4 text-[15px] leading-[2.05] text-white/90">
            まるで
            <span className="font-bold text-white">エスカレーターに乗るように</span>
            、努力をすることなく
            <span className="font-black text-[#F0D879]">スムーズに内定まで伴走</span>
            します。
          </p>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// カンタン3ステップ
// =============================================================================
function ThreeStepsSection() {
  const steps = [
    {
      label: "LINEに登録する",
      img: "/images/LINE_Brand_icon.png",
      alt: "LINE（LINEに登録する）",
    },
    {
      label: "オリジナル診断で自己分析",
      img: "/images/lp06-step2.png",
      alt: "オリジナル診断VibesRadarで自己分析",
    },
    {
      label: "アドバイザーと一緒にキャリア面談",
      img: "/images/lp06-step3.png",
      alt: "アドバイザーと一緒にキャリア面談",
    },
  ];
  return (
    <section className="px-4 py-10 bg-[#0A0A0A]">
      <h2 className="text-center text-[21px] font-black leading-[1.5] text-white">
        日本一ズル賢い
        <br />
        エスカレーター式・転職術は
        <br />
        <span className="text-[#F0D879]">3ステップで完了！</span>
      </h2>

      {/* 3 ステップ (①②③) */}
      <div className="mx-auto mt-7 grid max-w-[440px] grid-cols-3 gap-2.5">
        {steps.map((s, i) => (
          <div
            key={i}
            className="relative flex flex-col items-center rounded-xl border border-[#D4AF37]/40 bg-gradient-to-b from-[#161310] to-[#0B0A09] px-2 py-4 text-center"
          >
            {i === 0 && (
              <div className="absolute -top-5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#06C755] px-4 py-1 text-[14px] font-black text-white shadow-lg">
                いまココ！
                <span
                  aria-hidden
                  className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-[#06C755]"
                />
              </div>
            )}
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-[#F5D87A] to-[#C9A227] text-[16px] font-black text-[#1A1303]">
              {i + 1}
            </span>
            <div className="mt-2.5 w-full">
              {i === 0 ? (
                // LINEアイコンは余白入りなので、緑が枠いっぱいになるよう拡大してstep2/3と見た目サイズを揃える
                <div className="aspect-square w-full overflow-hidden rounded-2xl">
                  <Image
                    src="/images/LINE_Brand_icon.png"
                    alt={s.alt}
                    width={480}
                    height={480}
                    className="h-full w-full scale-[1.32] object-cover"
                  />
                </div>
              ) : (
                <ImagePlaceholder
                  src={s.img}
                  label={`STEP ${i + 1} イメージ`}
                  alt={s.alt}
                  width={1024}
                  height={1024}
                  rounded
                  className="block h-auto w-full"
                />
              )}
            </div>
            <p className="mt-2 text-[13.5px] font-bold leading-[1.55] text-white/90">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-8 max-w-[440px] space-y-4 text-[15px] leading-[1.9] text-white/80">
        <p>
          ここまでくれば、あとはカンタン。あなたに最適なホワイト企業へ応募して、内定を待つだけ。
        </p>
        <p>
          もちろん、書類作成、面接対策まで精鋭のキャリアアドバイザーが伴走サポートいたします。
        </p>
      </div>
    </section>
  );
}

// =============================================================================
// キャリアアドバイザー紹介 (lp04/lp05 流用・黒金トンマナ)
// =============================================================================
function AdvisorsSection() {
  return (
    <section className="px-4 py-10 bg-[#0A0A0A]">
      <div className="text-center">
        <span className="text-[13px] font-bold tracking-[0.25em] text-[#D4AF37]">
          CAREER ADVISORS
        </span>
        <h2 className="mt-2 text-[22px] font-black leading-[1.5] text-white">
          <span className="text-[#F0D879]">キャリアアドバイザー</span>
        </h2>
        <p className="mt-3 text-[13.5px] leading-[1.8] text-white/65">
          会社役員・人事部長などで経験を積んだ
          <br />
          百戦錬磨のキャリアアドバイザーのみ起用しています。
        </p>
      </div>

      <div className="mx-auto mt-7 max-w-[440px] space-y-5">
        {ADVISORS.map((a) => (
          <AdvisorCard key={a.id} advisor={a} />
        ))}
      </div>
    </section>
  );
}

function AdvisorCard({ advisor }: { advisor: Advisor }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-b from-[#161310] to-[#0B0A09]">
      {/* 金グラデ帯: 顔写真 + 役職 + 名前 */}
      <header className="flex items-center gap-3 border-b border-[#D4AF37]/25 bg-gradient-to-r from-[#1f1a12] to-[#2c2417] px-4 py-3.5">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border-2 border-[#D4AF37]/60">
          <Image
            src={`/images/advisor-${advisor.id}.png`}
            alt={`${advisor.name}の肖像`}
            width={200}
            height={200}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          {advisor.role && (
            <span className="block text-[11px] font-bold text-[#D4AF37]">
              {advisor.role}
            </span>
          )}
          <p className="text-[18px] font-black text-white">{advisor.name}</p>
        </div>
      </header>

      {/* 本文: キャッチフレーズ + 経歴 */}
      <div className="px-4 py-4">
        <h3 className="flex gap-2 text-[16px] font-bold leading-[1.65] text-[#F0D879]">
          <span aria-hidden className="mt-1 h-4 w-1 flex-shrink-0 bg-[#D4AF37]" />
          <span>{advisor.catchphrase}</span>
        </h3>

        <div className="mt-3 rounded-lg border border-[#D4AF37]/20 bg-black/30 p-3">
          <p className="text-[11px] font-bold text-[#D4AF37]">経歴</p>
          <ul className="mt-1.5 space-y-1.5">
            {advisor.bio.map((line, i) => (
              <li
                key={i}
                className="flex gap-1.5 text-[13.5px] leading-[1.65] text-white/80"
              >
                <span aria-hidden className="flex-shrink-0 text-[#D4AF37]">
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
// QA (lp04 と同じ内容・色だけ黒金)
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
    <section className="px-4 py-10 bg-[#0A0A0A]">
      <div className="text-center">
        <span className="text-[13px] font-bold tracking-[0.25em] text-[#D4AF37]">
          FAQ
        </span>
        <h2 className="mt-2 text-[22px] font-black leading-[1.5] text-white">
          <span className="text-[#F0D879]">よくある</span>ご質問
        </h2>
      </div>

      <ul className="mx-auto mt-6 max-w-[440px] space-y-3">
        {FAQ_ITEMS.map((item, i) => (
          <li
            key={i}
            className="overflow-hidden rounded-xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#161310] to-[#0B0A09]"
          >
            <div className="flex gap-2.5 border-b border-[#D4AF37]/15 bg-[#D4AF37]/[0.06] px-4 py-3">
              <span className="text-[18px] font-black leading-none text-[#F0D879]">
                Q.
              </span>
              <p className="text-[14.5px] font-bold leading-[1.6] text-white">
                {item.q}
              </p>
            </div>
            <div className="flex gap-2.5 px-4 py-3">
              <span className="text-[18px] font-black leading-none text-white/50">
                A.
              </span>
              <p className="text-[14px] leading-[1.85] text-white/80">
                {item.a}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
