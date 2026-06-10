// LP03 漫画記事 — 広告から流入したユーザーが最初に着地するページ。
// ヘッダー画像 → 33 コマ漫画 (1-30 + 12b/12c/27b 挿入、13 は 12c に統合) → CTA。
// コマ間に補足テキスト (3 箇所) と時間経過ドット (6 箇所) を挿入。

import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { SUCCESS_CASES, type SuccessCase } from "@/data/landing";
import Link from "next/link";

export const metadata = {
  title: "僕がたった10分の診断で、転職を決めた話 | VibesCareer",
  description:
    "新卒2年目で「自分に合ってない…」と悩んでいた僕が、たった10分の適性検査で人生が変わった話。",
};

// 表示アイテム — type ごとに render を分岐
type Item =
  | { type: "panel"; file: string; alt?: string }
  | { type: "dots" }
  | { type: "info"; icon: string; title: string; body: React.ReactNode }
  | { type: "about-vibescareer" }
  | { type: "radar-cta" }
  | { type: "success-cases" }
  | { type: "final-cta-story" };

const ITEMS: Item[] = [
  { type: "panel", file: "lp03-manga-01.png" },
  { type: "panel", file: "lp03-manga-02.png" },
  // ① 統計データ + 円グラフ
  {
    type: "info",
    icon: "💡",
    title: "実はコレ、よくある悩みなんです！",
    body: (
      <div className="flex items-center gap-4">
        {/* 58% ドーナツ円グラフ */}
        <div
          className="relative shrink-0 w-24 h-24 rounded-full"
          style={{
            background:
              "conic-gradient(var(--color-brand-primary) 0% 58%, #E5E5E5 58% 100%)",
          }}
        >
          <div className="absolute inset-[10px] rounded-full bg-white flex items-center justify-center">
            <span className="text-2xl font-black text-brand-primary leading-none">
              58<span className="text-sm">%</span>
            </span>
          </div>
        </div>
        {/* 解説テキスト */}
        <div className="flex-1 min-w-0">
          新卒〜3年目で「この会社、自分に合ってないかも…」と感じる人は、
          <b className="text-brand-primary">約 58%</b>。
          <br />
          その多くが、転職か継続かで悩み続けています。
          <br />
          <span className="text-text-muted text-[10px]">
            出典: マイナビ若手社員意識調査
          </span>
        </div>
      </div>
    ),
  },
  { type: "panel", file: "lp03-manga-03.png" },
  { type: "panel", file: "lp03-manga-04.png" }, // 4+5 統合: 葛藤
  { type: "panel", file: "lp03-manga-06.png" },
  { type: "panel", file: "lp03-manga-07.png" },
  { type: "panel", file: "lp03-manga-08.png" },
  // 時間経過: スマホ通知 → 数日後の居酒屋
  { type: "dots" },
  { type: "panel", file: "lp03-manga-09.png" },
  { type: "panel", file: "lp03-manga-10.png" },
  { type: "panel", file: "lp03-manga-11.png" },
  { type: "panel", file: "lp03-manga-12.png" },
  { type: "panel", file: "lp03-manga-12b.png" },
  { type: "panel", file: "lp03-manga-12c.png" },
  // ② VibesCareer 概要 (LP本体 = LP02 と同じスタイル + ロゴ画像)
  { type: "about-vibescareer" },
  { type: "panel", file: "lp03-manga-14.png" },
  // ③ VibesRadar 詳細 (LP01 風 CTA バナー型)
  { type: "radar-cta" },
  { type: "panel", file: "lp03-manga-15.png" },
  { type: "panel", file: "lp03-manga-16.png" }, // 16+17 統合: 10分 + 計算ナシ
  { type: "panel", file: "lp03-manga-18.png" },
  { type: "panel", file: "lp03-manga-19.png" },
  { type: "panel", file: "lp03-manga-20.png" },
  { type: "panel", file: "lp03-manga-21.png" },
  { type: "panel", file: "lp03-manga-22.png" },
  // LP02 から流用: 転職成功者の実績セクション (D さん / N さん / E さん の 3 件)
  { type: "success-cases" },
  { type: "panel", file: "lp03-manga-23.png" },
  { type: "panel", file: "lp03-manga-24.png" },
  // 時間経過: 受検 → 数日後の面談
  { type: "dots" },
  { type: "panel", file: "lp03-manga-25.png" },
  { type: "panel", file: "lp03-manga-26.png" },
  { type: "panel", file: "lp03-manga-26b.png" }, // 新規: アドバイザーの意気込み
  // 時間経過: 面談 → 2ヶ月後の新職場
  { type: "dots" },
  { type: "panel", file: "lp03-manga-27.png" },
  { type: "panel", file: "lp03-manga-27b.png" },
  { type: "panel", file: "lp03-manga-27c.png" }, // 決め台詞: プロに相談することが大事
  { type: "panel", file: "lp03-manga-30.png" }, // 最終 CTA — 主人公 + アドバイザーが読者に語りかける
  { type: "final-cta-story" }, // 最終クロージング: 1日5名限定の訴求
];

// 時間経過ドット (3 つの灰色丸を縦並び、順次パルスアニメ)
function TimeDots() {
  return (
    <div className="flex flex-col items-center justify-center py-5 gap-1.5">
      <span className="lp03-time-dot block w-3 h-3 rounded-full bg-gray-500" />
      <span className="lp03-time-dot block w-3 h-3 rounded-full bg-gray-500" />
      <span className="lp03-time-dot block w-3 h-3 rounded-full bg-gray-500" />
    </div>
  );
}

// ② VibesCareer 紹介 — LP本体スタイル + アドバイザー写真風イラスト (ABOUT US ラベルは削除)
function AboutVibesCareer() {
  return (
    <aside className="px-4 py-6 bg-white">
      <div className="section-eyebrow-block">
        <h2 className="ja service-intro-title">
          <span className="marker">VibesCareer</span>とは？
        </h2>
      </div>
      <div className="flex justify-center mt-3 mb-2">
        <img
          src="/images/logo-vibescareer-new.jpg"
          alt="VibesCareer"
          className="h-auto w-full max-w-[300px]"
        />
      </div>
      <p className="service-intro-lead">
        20代・第二新卒のための
        <br />
        パーソナル型 転職支援サービスです。
      </p>
      <p className="mt-6 text-[15.5px] leading-[1.95] text-text-secondary">
        一般的な転職支援は、最初から転職前提で求人の大量紹介やスピーディーな決断を求められがち。VibesCareerでは{" "}
        <strong>「本当に自分に合う仕事は何か」</strong>{" "}
        を見極めることを最優先に、まずは <strong>自己分析からスタート</strong>{" "}
        します。
      </p>
    </aside>
  );
}

// ③ VibesRadar — 緑グラデCTAカードに、result-radar-bonus.png の上半分 (リボン+ロゴ+PC+SP+チケット) を組み込む
function RadarCta() {
  return (
    <aside className="px-3 py-2">
      <div
        className="rounded-2xl p-4 shadow-[0_8px_24px_rgba(13,148,136,0.22)]"
        style={{
          background:
            "linear-gradient(135deg, #22c55e 0%, #14b8a6 55%, #06b6d4 100%)",
        }}
      >
        {/* 上部: VibesRadar 新ビジュアル (ロゴ + PC + SP)、白カードに包んで表示 */}
        <div className="mb-4 rounded-xl bg-white overflow-hidden">
          <img
            src="/images/lp03-radar-visual.webp"
            alt="VibesRadar — 次世代型パーソナル Web 診断"
            className="w-full h-auto block"
          />
        </div>
        {/* 下部: 3 特徴 (タイトル/サブタイトル削除) */}
        <ul className="space-y-2.5">
          <li className="bg-white rounded-xl p-3 flex items-start gap-3">
            <span className="text-3xl leading-none mt-0.5">💎</span>
            <div className="flex-1 min-w-0">
              <div className="font-black text-base text-text-default mb-1">
                8つのポテンシャルタイプ
              </div>
              <div className="text-xs text-text-default/80 leading-relaxed">
                あなたが潜在的に秘めている 8 つの「ポテンシャルタイプ」を可視化！
              </div>
            </div>
          </li>
          <li className="bg-white rounded-xl p-3 flex items-start gap-3">
            <span className="text-3xl leading-none mt-0.5">📊</span>
            <div className="flex-1 min-w-0">
              <div className="font-black text-base text-text-default mb-1">
                全48項目を測定
              </div>
              <div className="text-xs text-text-default/80 leading-relaxed">
                性格・価値観・志向性・ストレス耐性など全 48 項目を漏れなく測定！
              </div>
            </div>
          </li>
          <li className="bg-white rounded-xl p-3 flex items-start gap-3">
            <span className="text-3xl leading-none mt-0.5">🔍</span>
            <div className="flex-1 min-w-0">
              <div className="font-black text-base text-text-default mb-1">
                5つのネガティブアラート
              </div>
              <div className="text-xs text-text-default/80 leading-relaxed">
                あなたの弱点もすべて丸わかり！5 つの「ネガティブアラート」で自己理解を深める！
              </div>
            </div>
          </li>
        </ul>
      </div>
    </aside>
  );
}

// 最終クロージング: 1日5名限定の訴求ストーリー
function FinalCtaStory() {
  // 訴求画像 (実画像)
  const StoryImage = ({ src, alt }: { src: string; alt: string }) => (
    <div className="my-5 rounded-xl overflow-hidden bg-white">
      <img src={src} alt={alt} className="w-full h-auto block" />
    </div>
  );

  return (
    <section className="px-4 py-10 bg-white">
      {/* 大見出し */}
      <div className="mb-7 text-center">
        <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-black rounded-full mb-3 tracking-widest">
          ⚠ 重要なお知らせ
        </span>
        <h2 className="text-2xl font-black text-text-default leading-snug">
          ここまで読んでいただいたあなたに、
          <br />
          <span className="text-red-600">重要なお知らせです！！</span>
        </h2>
      </div>

      {/* 説明 1 */}
      <p className="text-base leading-[1.95] text-text-default mb-2">
        <strong className="text-brand-primary text-lg">
          『VibesCareer』
        </strong>
        では、
        <br />
        全国各地の20代・第2新卒の転職支援を
        <strong>強化しております！</strong>
      </p>

      <StoryImage
        src="/images/lp03-cta-map.webp"
        alt="VibesCareer は全国どこでも対応"
      />

      {/* 説明 2 — 殺到 (背景枠なし) */}
      <p className="text-base leading-[1.95] text-text-default my-5">
        その結果、
        <br />
        予想を大幅に超える
        <br />
        <strong className="text-brand-primary text-xl">
          希望者よりお申込みが殺到中！
        </strong>
      </p>

      <StoryImage
        src="/images/lp03-cta-graph.webp"
        alt="お申込み数が急増中"
      />

      {/* 説明 3 — 制限 */}
      <p className="text-base leading-[1.95] text-text-default mb-5">
        なのですが、
        <br />
        一人ひとりと真剣に向き合い、時間を割くため
        <br />
        <strong>1日に対応できる人数に制限が…</strong>
      </p>

      {/* 1日5名限定 強調ブロック */}
      <div className="my-7 rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 text-white px-5 py-6 text-center shadow-[0_10px_30px_rgba(220,38,38,0.35)]">
        <p className="text-sm mb-2 font-bold">そのため、無料でのご対応は</p>
        <div className="flex items-center justify-center gap-2 my-1">
          <span className="text-5xl font-black leading-none">1日</span>
          <span className="text-7xl font-black leading-none text-yellow-300 mx-1">
            5
          </span>
          <span className="text-3xl font-black leading-none">名</span>
        </div>
        <p className="text-xl font-black tracking-wider mt-1">限定</p>
        <p className="text-xs mt-3 font-bold text-white/90">
          とさせていただきます。
        </p>
      </div>

      <p className="text-base leading-[1.95] text-text-default mb-2">
        <strong className="text-red-600">完全先着順</strong>となりますので、
        <br />
        枠が埋まってしまう前に！
      </p>

      <p className="text-base font-bold leading-[1.95] text-text-default mb-5">
        今すぐ下のボタンから
        <br />
        無料でお申込みください！
      </p>

      {/* CTA 直上の訴求 */}
      <p className="text-center text-xs font-medium text-gray-500 mt-3 mb-2 leading-snug">
        本来 3,000 円の VibesRadar が、
        <br />
        いまなら完全無料！
      </p>
      {/* CTA ボタン (1) */}
      <div className="mt-2 mb-6 px-2">
        <Link href="/lp03" className="btn-cta-radar w-full">
          <span className="relative z-10">今すぐ無料で申し込む</span>
          <span className="relative z-10">▶</span>
        </Link>
      </div>

      {/* 安心メッセージ (背景枠なし) */}
      <p className="my-7 text-base leading-[1.95] text-text-default">
        もちろん、
        <br />
        無料診断後に無理な転職や
        <br />
        <strong>しつこい電話をすることはございません。</strong>
      </p>

      <StoryImage
        src="/images/lp03-cta-safety.webp"
        alt="無理な転職はさせません、軽い相談でも歓迎"
      />

      {/* OK な動機例 */}
      <ul className="space-y-2.5 my-6">
        <li className="bg-orange-50 rounded-lg p-3 text-sm font-bold text-text-default border-l-4 border-brand-primary">
          「とりあえず適性検査だけ受けてみたい！」
        </li>
        <li className="bg-orange-50 rounded-lg p-3 text-sm font-bold text-text-default border-l-4 border-brand-primary">
          「自己分析だけ一緒にやってほしい！」
        </li>
        <li className="bg-orange-50 rounded-lg p-3 text-sm font-bold text-text-default border-l-4 border-brand-primary">
          「転職について、軽く相談してみたい！」
        </li>
      </ul>

      <p className="text-base font-bold leading-[1.95] text-center text-brand-primary mb-6">
        こういった気持ちでの
        <br />
        申込も大歓迎です！
      </p>

      {/* 最終 CTA メッセージ */}
      <p className="text-base leading-[1.95] text-text-default text-center my-6">
        あなたの人生に本気で向き合い
        <br />
        <strong>誠実に対応します</strong>ので、
      </p>

      <p className="text-base leading-[1.95] text-text-default text-center mb-5">
        <strong className="text-red-600 text-lg">「1日5名限定」</strong>
        <br />
        枠が埋まる前に
        <br />
        下のボタンから無料でお申込みください！
      </p>

      {/* 本日残りわずか — 最終 CTA の直前 */}
      <div className="text-center mt-6 mb-3">
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-black">
          <span className="animate-pulse">🔥</span>
          本日、残りわずか
        </span>
      </div>
      {/* CTA 直上の訴求 */}
      <p className="text-center text-xs font-medium text-gray-500 mt-2 mb-2 leading-snug">
        本来 3,000 円の VibesRadar が、
        <br />
        いまなら完全無料！
      </p>
      {/* CTA ボタン (2) */}
      <div className="mt-2 mb-6 px-2">
        <Link href="/lp03" className="btn-cta-radar w-full">
          <span className="relative z-10">今すぐ無料で申し込む</span>
          <span className="relative z-10">▶</span>
        </Link>
      </div>
    </section>
  );
}

// LP02 流用 — 転職成功事例 (D / N / E さんの 3 件のみ)
function SuccessCases() {
  const cases = SUCCESS_CASES.filter(
    (c) => c.id === "case2" || c.id === "case3" || c.id === "case4"
  );
  return (
    <section className="px-4 py-10 bg-bg-subtle">
      <div className="section-eyebrow-block">
        <span className="en">SUCCESS STORIES</span>
        <h2 className="ja">
          第２新卒の
          <br />
          <span className="marker">転職成功者、多数！</span>
        </h2>
        <span className="sub">
          あなたと同じ境遇から転職を成功させた
          <br />
          先輩のお声を紹介します。
        </span>
      </div>
      <div>
        {cases.map((c) => (
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
          label={`${caseData.name} (${caseData.age}歳) 写真`}
          alt={`${caseData.name} (${caseData.age}歳) のカウンセリングシーン`}
          width={1024}
          height={640}
          className="success-case-photo-img"
        />
        <span className="success-case-name-tag">
          {caseData.name}（{caseData.age}歳）
        </span>
      </div>
      {/* BEFORE→AFTER + UP バッジを 1 枚に統合したインフォグラフィック画像 */}
      <div className="success-case-salary-infographic">
        <ImagePlaceholder
          src={caseData.salaryInfographic}
          label={`${caseData.name} の年収アップ ${caseData.beforeCompany} ¥${caseData.beforeAmount}万 → ${caseData.afterCompany} ¥${caseData.afterAmount}万 (+${caseData.salaryUpAmount}万UP)`}
          alt={`${caseData.beforeCompany} 年収¥${caseData.beforeAmount}万 から ${caseData.afterCompany} 年収¥${caseData.afterAmount}万 へ。+${caseData.salaryUpAmount}万円UP。`}
          width={1536}
          height={864}
          className="w-full h-auto block"
        />
      </div>
      {/* タイトル */}
      <h3 className="success-case-title">{caseData.title}</h3>
      {/* 本文 */}
      <p className="success-case-body">{caseData.body}</p>
    </article>
  );
}

// ヘッダー直下: 「3分で読めます」バッジ + 下矢印 (ふわふわアニメ)
function ScrollHintArrow() {
  return (
    <div className="flex flex-col items-center py-6 gap-4">
      {/* warm orange バッジ (ふわふわアニメ) */}
      <div className="lp03-scroll-hint inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-brand-primary text-white shadow-[0_8px_24px_rgba(255,107,0,0.32)]">
        <svg
          className="w-7 h-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15 14" />
        </svg>
        <span className="font-black text-xl tracking-[0.04em]">
          この記事は{" "}
          <span className="text-yellow-200 text-2xl">3分</span> で読めます
        </span>
      </div>
      {/* 下矢印 (大きく、ふわふわ) */}
      <svg
        className="lp03-scroll-hint w-12 h-12 text-brand-primary"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}

// 補足情報カード (大きく目立つように、オレンジ枠線+影、文字大きめ)
function InfoCard({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <aside className="px-3 py-3">
      <div className="bg-white rounded-2xl border-[3px] border-brand-primary shadow-[0_6px_20px_rgba(255,107,0,0.18)] p-5">
        <div className="flex items-start gap-3">
          <span className="text-4xl leading-none mt-0.5">{icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-xl text-brand-primary mb-2.5 leading-tight">
              {title}
            </h3>
            <div className="text-base text-text-default leading-relaxed">
              {body}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function Lp03ArticlePage() {
  // ノート風背景: 参考 LP と同じ方眼紙 PNG をリピート
  const noteBackgroundStyle = {
    backgroundColor: "#F4F4F4",
    backgroundImage: "url('/images/lp03-note-bg.png')",
    backgroundRepeat: "repeat",
  } as const;

  // コマのインデックス (ヘッダーを除く)
  let panelIndex = 0;

  return (
    <main className="min-h-screen" style={noteBackgroundStyle}>
      <div className="max-w-[480px] mx-auto flex flex-col gap-[10px] pt-[10px] pb-[10px]">
        {/* ヘッダー画像 */}
        <ImagePlaceholder
          src="/images/lp03-manga-header.webp"
          alt="未経験職種に転職で年収が大幅アップ。20代・第2新卒特化型転職支援サービスが凄すぎる！"
          label="ヘッダー"
          width={1024}
          height={683}
          className="w-full h-auto block"
          priority
        />
        {/* ヘッダー直下のふわふわ下矢印 (スクロール誘導) */}
        <ScrollHintArrow />
        {/* コマ・ドット・補足を順次レンダリング */}
        {ITEMS.map((item, i) => {
          if (item.type === "panel") {
            panelIndex += 1;
            const idx = panelIndex;
            const isPanel01 = item.file === "lp03-manga-01.png";
            const panelImage = (
              <ImagePlaceholder
                src={`/images/${item.file}`}
                alt={item.alt ?? `漫画コマ ${idx}`}
                label={`コマ ${idx}`}
                width={1024}
                height={1536}
                className="w-full h-auto block"
                priority={idx <= 2}
              />
            );
            if (!isPanel01) {
              return (
                <div key={`panel-${item.file}`}>{panelImage}</div>
              );
            }
            // コマ 01: 主人公の名前テロップを左腕あたりに重ねる
            return (
              <div
                key={`panel-${item.file}`}
                className="relative"
              >
                {panelImage}
                <div className="absolute bottom-[10%] right-[5%] flex items-center gap-3 px-5 py-3 rounded-lg bg-black/85 text-white shadow-xl backdrop-blur-sm">
                  <span className="w-[5px] h-8 bg-brand-primary rounded-sm" />
                  <span className="font-black text-2xl tracking-wide leading-none">
                    吉田拓海
                  </span>
                  <span className="text-lg text-white/90 leading-none">
                    （23）
                  </span>
                </div>
              </div>
            );
          }
          if (item.type === "dots") {
            return <TimeDots key={`dots-${i}`} />;
          }
          if (item.type === "about-vibescareer") {
            return <AboutVibesCareer key={`about-${i}`} />;
          }
          if (item.type === "radar-cta") {
            return <RadarCta key={`radar-${i}`} />;
          }
          if (item.type === "success-cases") {
            return <SuccessCases key={`success-${i}`} />;
          }
          if (item.type === "final-cta-story") {
            return <FinalCtaStory key={`final-cta-${i}`} />;
          }
          // info
          return (
            <InfoCard
              key={`info-${i}`}
              icon={item.icon}
              title={item.title}
              body={item.body}
            />
          );
        })}
      </div>

    </main>
  );
}
