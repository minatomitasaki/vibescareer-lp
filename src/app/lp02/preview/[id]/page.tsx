// LP02 結果プレビューページ (/lp02/preview/[id])
//
// 役割: analyzing 直後に表示する「結果ちょっとだけ見せ + リードフォーム」ページ。
//   - 上部: タイプ名 (jobLabel) と冒頭 1-2 行の説明だけ表示
//   - 中央: 4 つの結果カード (あなたの強み / 向いてる仕事 / 会社選びのポイント /
//          働き方の特徴) を「タイトルだけ + 中身モザイク」で見せる
//   - 下部: 「フォーム入力で詳細を見れます」CTA + PreviewForm (4 項目)
//
// フォーム送信成功 → /lp02/result/[id] に遷移 → 詳細結果ページが解放される。

import { notFound } from "next/navigation";
import { Logo } from "@/components/Logo";
import { PreviewForm } from "@/components/lp02/PreviewForm";
import { RESULT_DATA, allResultIds, isResultId } from "@/data/results";

// /lp02/preview/[id] も 12 パターンとも static prerender 対象
export function generateStaticParams() {
  return allResultIds().map((id) => ({ id }));
}

const PREVIEW_CARDS = [
  { title: "あなたの強み" },
  { title: "向いてる仕事" },
  { title: "会社選びのポイント" },
  { title: "働き方の特徴" },
];

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isResultId(id)) notFound();
  const data = RESULT_DATA[id];

  return (
    <main className="lp-container bg-bg-cream min-h-screen">
      {/* ヘッダー */}
      <header className="relative px-4 py-3 flex items-center justify-start bg-white">
        <Logo width={160} height={44} priority />
        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent" />
      </header>

      {/* タイプ名: チラ見せ */}
      <section className="px-4 pt-6 pb-4 bg-white">
        <p className="text-[14px] text-text-secondary font-bold">
          気になる診断結果は…！
        </p>
        <h1 className="mt-2 text-[26px] font-black leading-[1.3] text-brand-primary">
          あなたは{data.jobLabel}
        </h1>
        <p className="mt-1 text-[13px] text-text-muted">
          {data.workplaceSubLabel}
        </p>
      </section>

      {/* タイプ説明: 冒頭 80 字だけ表示、その下にモザイク帯 */}
      <section className="px-4 pb-6 bg-white">
        <div className="rounded-2xl border border-brand-primary/30 bg-bg-form p-4">
          <p className="text-[13px] leading-[1.85] text-text-primary">
            {data.strength.slice(0, 80)}…
          </p>
          {/* モザイク帯 3 行分 */}
          <div className="mt-2 space-y-1.5">
            <div className="h-3 rounded bg-gradient-to-r from-text-muted/30 to-text-muted/20 blur-[2px]" />
            <div className="h-3 rounded bg-gradient-to-r from-text-muted/30 to-text-muted/20 blur-[2px] w-[92%]" />
            <div className="h-3 rounded bg-gradient-to-r from-text-muted/30 to-text-muted/20 blur-[2px] w-[78%]" />
          </div>
        </div>
      </section>

      {/* 4 カード: タイトル表示 + 中身モザイク */}
      <section className="px-4 pb-8 bg-bg-cream">
        <div className="grid grid-cols-2 gap-3">
          {PREVIEW_CARDS.map((card) => (
            <article
              key={card.title}
              className="bg-white rounded-2xl border border-border-default p-3 relative overflow-hidden"
            >
              {/* タイトル帯 */}
              <div className="-mx-3 -mt-3 mb-2 px-3 py-2 bg-brand-primary-light text-text-primary text-[13px] font-bold text-center">
                {card.title}
              </div>
              {/* 中身モザイク (擬似テキストブロックを blur) */}
              <div className="space-y-1.5 select-none pointer-events-none">
                <div className="h-2.5 rounded bg-text-muted/30 blur-[2.5px]" />
                <div className="h-2.5 rounded bg-text-muted/30 blur-[2.5px] w-[90%]" />
                <div className="h-2.5 rounded bg-text-muted/30 blur-[2.5px] w-[85%]" />
                <div className="h-2.5 rounded bg-text-muted/30 blur-[2.5px] w-[78%]" />
                <div className="h-2.5 rounded bg-text-muted/30 blur-[2.5px] w-[88%]" />
                <div className="h-2.5 rounded bg-text-muted/30 blur-[2.5px] w-[72%]" />
              </div>
              {/* 「🔒」アイコンを右上に浮かせる */}
              <span
                className="absolute top-2 right-2 text-[16px] opacity-60"
                aria-hidden
              >
                🔒
              </span>
            </article>
          ))}
        </div>
      </section>

      {/* 解放 CTA + リードフォーム */}
      <section className="px-4 py-8 bg-bg-form">
        <div className="bg-white rounded-3xl p-5 shadow-md">
          <div className="text-center">
            <p className="text-[15px] font-bold text-text-secondary">
              下記フォームを入力するだけで
            </p>
            <p className="mt-2 text-[22px] font-black leading-[1.45] text-text-primary">
              詳細な
              <span className="relative inline-block">
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-[1px] h-[9px] bg-brand-primary/15 rounded-[1px]"
                />
                <span className="relative">診断結果</span>
              </span>
              が見れます！
            </p>
            <p className="mt-1 text-[12px] text-text-muted">
              所要時間およそ 30 秒・完全無料
            </p>
          </div>

          <div className="mt-6">
            <PreviewForm resultId={data.id} />
          </div>
        </div>
      </section>
    </main>
  );
}
