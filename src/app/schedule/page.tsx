// 初回カウンセリング日程調整ページ (/schedule)
//
// フロー: /result/[id] のフォーム送信後にここへ遷移する。
// TimeRex の予約ウィジェットを iframe で埋め込み、予約完了後は
// TimeRex 側の設定で /thanks へリダイレクトする想定。
//
// TimeRex の埋め込み URL は本番接続時にユーザーから取得 → 下の
// TIMEREX_EMBED_URL を差し替えて運用。
import type { Metadata } from "next";
import { Logo } from "@/components/Logo";

const TIMEREX_EMBED_URL =
  "https://timerex.net/s/minato_mitasaki_7fd9/fb6f1caa";

export const metadata: Metadata = {
  title: "初回カウンセリング日程調整 | VibesCareer",
  description:
    "VibesCareer の初回キャリアカウンセリングの日程を調整してください。",
};

export default function SchedulePage() {
  return (
    <main className="lp-container bg-white">
      {/* ヘッダー */}
      <header className="relative px-4 py-3 flex items-center justify-start bg-white">
        <Logo width={160} height={44} priority />
        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent" />
      </header>

      {/* ページ見出し */}
      <section className="px-4 pt-8 pb-4">
        <div className="section-eyebrow-block">
          <span className="en">SCHEDULE</span>
          <h1 className="ja text-[20px]">
            初回カウンセリングの<br />
            <span className="marker">日程調整</span>
          </h1>
        </div>

        <p className="mt-4 text-center text-[13.5px] leading-[1.95] text-text-secondary">
          大変ご好評いただいており、リスケジュールが難しいため
          <br />
          <strong className="text-brand-primary">
            確実に参加できる日程
          </strong>
          を選択ください。
        </p>
      </section>

      {/* TimeRex 予約ウィジェット (iframe 埋め込み) */}
      <section className="px-4 pb-10">
        <div className="schedule-iframe-frame">
          <iframe
            src={TIMEREX_EMBED_URL}
            title="VibesCareer 初回カウンセリング日程調整"
            className="w-full"
            style={{ height: 720, border: 0 }}
            loading="lazy"
            allow="clipboard-write"
          />
        </div>

        <p className="mt-3 text-center text-[11px] text-text-muted">
          ※ 予約完了後、ご登録のメールアドレス宛に VibesRadar 受検 URL をお送りします。
        </p>
      </section>
    </main>
  );
}
