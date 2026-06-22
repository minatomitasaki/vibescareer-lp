// LP06 申込フォームページ (/lp06/entry) — 白ベース(標準テーマ)
// LINE登録後の挨拶メッセージから誘導する入口。名前+メールを入力 → /lp06/schedule (カレンダー) へ。
import type { Metadata } from "next";
import { Lp06EntryForm } from "@/components/lp06/Lp06EntryForm";

export const metadata: Metadata = {
  title: "無料カウンセリングのお申し込み | VibesCareer",
  description:
    "VibesCareer の無料カウンセリングお申し込み。ご希望の日程でカレンダー予約まで進めます。",
};

const STEPS: { no: string; text: string; icon: React.ReactNode }[] = [
  {
    no: "01",
    text: "下のフォームから\n情報を入力",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect width="8" height="4" x="8" y="2" rx="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="M12 11h4" />
        <path d="M12 16h4" />
        <path d="M8 11h.01" />
        <path d="M8 16h.01" />
      </svg>
    ),
  },
  {
    no: "02",
    text: "ご希望の日時で\n日程を調整",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M3 10h18" />
        <path d="m9 16 2 2 4-4" />
      </svg>
    ),
  },
  {
    no: "03",
    text: "オリジナル診断の\n受検チケットを配布",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M2 9a3 3 0 1 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 1 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
        <path d="M13 5v2" />
        <path d="M13 11v2" />
        <path d="M13 17v2" />
      </svg>
    ),
  },
];

export default function Lp06EntryPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="lp-container">
        <section className="px-5 py-10">
          {/* 見出し */}
          <div className="text-center">
            <p className="text-[15px] font-bold text-text-secondary">
              カンタン申し込みで
            </p>
            <h1 className="mt-2 text-[21px] font-black leading-[1.5] text-text-primary">
              <span className="text-brand-primary">無料カウンセリング</span>
              ＋<span className="text-brand-primary">VibesRadar受検チケット</span>を
              <br />
              <span className="relative inline-block text-[27px] text-brand-primary">
                <span aria-hidden className="absolute inset-x-0 bottom-[2px] h-[10px] bg-brand-primary/15" />
                <span className="relative">プレゼント！</span>
              </span>
            </h1>
          </div>

          {/* STEP 01 / 02 / 03 */}
          <ol className="mt-7 grid grid-cols-3 divide-x divide-brand-primary/20">
            {STEPS.map((s) => (
              <li key={s.no} className="flex flex-col items-center px-2 text-center">
                <span className="text-[12.5px] font-black tracking-[0.05em] text-brand-primary underline decoration-1 underline-offset-[3px]">
                  STEP.{s.no}
                </span>
                <span className="mt-3 flex h-[58px] w-[58px] items-center justify-center rounded-[14px] bg-gradient-to-br from-brand-primary to-[#FF9A4D] text-white shadow-[0_4px_10px_-2px_rgba(255,107,0,0.35)]">
                  <span className="h-7 w-7">{s.icon}</span>
                </span>
                <p className="mt-3 whitespace-pre-line text-[13px] font-bold leading-[1.55] text-text-primary">
                  {s.text}
                </p>
              </li>
            ))}
          </ol>

          {/* フォーム (名前 + メール) */}
          <Lp06EntryForm />
        </section>
      </div>
    </main>
  );
}
