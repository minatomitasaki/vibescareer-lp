// サンクスページ (/thanks)
//
// /schedule の TimeRex 予約完了時に onBookingComplete から遷移してくる。
// 「ご予約ありがとうございます」 / 今後の流れ 3 STEP / LINE 登録 CTA を表示。
//
// LINE 公式アカウントの登録 URL は本番値を取得し次第差し替える。
import type { Metadata } from "next";
import Image from "next/image";
import { Logo } from "@/components/Logo";

const LINE_REGISTER_URL = "https://line.me/ti/p/Qugul-H8lv";

export const metadata: Metadata = {
  title: "ご予約ありがとうございます | VibesCareer",
  description:
    "初回カウンセリングのご予約ありがとうございます。VibesRadar の受検 URL は登録メールアドレス宛にお送りします。",
};

const STEPS = [
  {
    label: "STEP.01",
    title: "VibesRadar を受検",
    desc: "ご登録メールアドレスに受検URLをお送りします。所要時間は約15分です。",
    icon: "/images/thanks-icon-inbox.svg",
    iconAlt: "受検URLを受け取るアイコン",
    current: true,
  },
  {
    label: "STEP.02",
    title: "初回カウンセリング",
    desc: "VibesRadar の診断結果をもとに、専属アドバイザーが一緒に振り返ります。",
    icon: "/images/thanks-icon-chat.svg",
    iconAlt: "カウンセリングのアイコン",
  },
  {
    label: "STEP.03",
    title: "自己分析とキャリア設計",
    desc: "強みと志向を整理し、あなたに合った進路をアドバイザーと描いていきます。",
    icon: "/images/thanks-icon-rocket.svg",
    iconAlt: "キャリア設計のアイコン",
  },
] as const;

export default function ThanksPage() {
  return (
    <main className="lp-container bg-white">
      {/* ヘッダー */}
      <header className="relative px-4 py-3 flex items-center justify-start bg-white">
        <Logo width={160} height={44} priority />
        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent" />
      </header>

      {/* 完了見出し: ヒーロー化 */}
      <section className="thanks-hero px-4 pt-12 pb-10 text-center">
        {/* 背景ドット装飾 */}
        <span
          className="service-intro-decor-dot"
          style={{ width: 60, height: 60, top: 24, left: -16, opacity: 0.55 }}
          aria-hidden
        />
        <span
          className="service-intro-decor-dot"
          style={{ width: 28, height: 28, top: 70, right: 20, opacity: 0.7 }}
          aria-hidden
        />
        <span
          className="service-intro-decor-dot"
          style={{ width: 18, height: 18, bottom: 30, left: 30, opacity: 0.7 }}
          aria-hidden
        />
        <span
          className="service-intro-decor-dot"
          style={{ width: 40, height: 40, bottom: 10, right: -10, opacity: 0.5 }}
          aria-hidden
        />

        {/* 紙吹雪 */}
        <span
          className="thanks-confetti text-brand-primary"
          style={{ top: 30, left: "18%", fontSize: 14, transform: "rotate(-15deg)" }}
          aria-hidden
        >
          ★
        </span>
        <span
          className="thanks-confetti"
          style={{ top: 18, right: "22%", fontSize: 10, color: "#ffb380", transform: "rotate(20deg)" }}
          aria-hidden
        >
          ●
        </span>
        <span
          className="thanks-confetti text-brand-primary"
          style={{ top: 60, right: "8%", fontSize: 12, transform: "rotate(12deg)" }}
          aria-hidden
        >
          ✦
        </span>
        <span
          className="thanks-confetti"
          style={{ bottom: 50, left: "10%", fontSize: 11, color: "#ffb380", transform: "rotate(-22deg)" }}
          aria-hidden
        >
          ★
        </span>

        {/* チェックマーク (アニメ付き) */}
        <div className="relative z-10 thanks-check-circle mb-6">
          <svg viewBox="0 0 52 52" aria-hidden="true">
            <path d="M14 27 l9 9 l16 -18" />
          </svg>
        </div>

        {/* eyebrow + 見出し + サブ */}
        <div className="section-eyebrow-block relative z-10">
          <span className="en">THANK YOU</span>
          <h1 className="ja">
            ご予約<span className="marker">ありがとうございます</span>
          </h1>
          <span className="sub">
            初回カウンセリングのご予約を受け付けました
          </span>
        </div>

        {/* 補足: 受検URL案内 */}
        <div className="relative z-10 mt-6 mx-auto max-w-[340px] bg-white/80 backdrop-blur rounded-2xl border border-brand-primary/20 px-5 py-4 shadow-sm">
          <p className="text-[13.5px] leading-[1.85] text-text-secondary">
            このあとすぐに、ご登録の
            <br />
            メールアドレス宛に
            <br />
            <strong className="text-brand-primary">
              VibesRadar の受検 URL
            </strong>
            をお送りします。
          </p>
          <p className="mt-3 text-[12px] leading-[1.85] text-text-muted">
            お手数ですが初回カウンセリングまでに
            <br />
            受検をお済ませください。
          </p>
        </div>
      </section>

      {/* 今後の流れ: ロードマップカード */}
      <section className="px-4 pt-2 pb-10">
        <div className="section-eyebrow-block mb-5">
          <span className="en">ROADMAP</span>
          <h2 className="ja text-[20px]">
            今後の<span className="marker">流れ</span>
          </h2>
        </div>

        <ol className="space-y-0">
          {STEPS.map((step, idx) => (
            <li key={step.label}>
              <div
                className={`thanks-step-card ${
                  "current" in step && step.current ? "is-current" : ""
                }`}
              >
                <div className="flex gap-3 items-start">
                  <span className="thanks-step-icon">
                    <Image
                      src={step.icon}
                      alt={step.iconAlt}
                      width={30}
                      height={30}
                    />
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="thanks-step-label">{step.label}</span>
                    <p className="text-[14.5px] font-black text-text-primary leading-[1.5]">
                      {step.title}
                    </p>
                    <p className="text-[12px] text-text-secondary leading-[1.75] mt-1.5">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="thanks-step-connector" aria-hidden />
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* LINE 登録 CTA */}
      <section className="px-4 pb-12 thanks-line-section">
        <div className="section-eyebrow-block mb-4">
          <span className="en">DIRECT LINE</span>
          <h2 className="ja text-[20px]">
            代表との<span className="marker">直通 LINE</span>
          </h2>
          <span className="sub">
            登録された方には優先対応いたします
          </span>
        </div>

        <div className="thanks-line-card">
          {/* 優先対応バッジ */}
          <span className="thanks-priority-badge" aria-hidden>
            ★ PRIORITY
          </span>

          {/* 代表アバター + フキダシ */}
          <div className="flex items-start gap-3">
            <div className="thanks-line-avatar">
              <Image
                src="/images/advisor-watanabe.webp"
                alt="VibesCareer 代表・渡邉"
                width={72}
                height={72}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="thanks-line-bubble">
              <p className="text-[12.5px] font-bold text-text-primary leading-[1.6]">
                VibesCareer 代表・渡邉
              </p>
              <p className="text-[13px] leading-[1.8] text-text-secondary mt-1">
                不明点や進路の相談、いつでも
                <br />
                気軽にメッセージしてください！
              </p>
            </div>
          </div>

          {/* 説明 */}
          <p className="mt-4 text-[12.5px] leading-[1.85] text-text-secondary text-center">
            LINE 登録いただいた方より
            <strong className="text-brand-primary">優先的に対応</strong>します。
            <br />
            ぜひこの機会にご登録ください。
          </p>

          {/* LINE ボタン (pulse アニメ付き) */}
          <a
            href={LINE_REGISTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="thanks-line-btn group"
          >
            <span className="thanks-line-btn-icon" aria-hidden>
              <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                <path d="M12 3C6.477 3 2 6.59 2 11c0 2.557 1.512 4.83 3.86 6.281-.143.527-.916 3.213-1.05 3.74-.16.642.234.633.49.46.2-.135 3.184-2.165 4.47-3.04.722.103 1.466.157 2.23.157 5.523 0 10-3.59 10-8s-4.477-8-10-8Zm-3.39 9.66h-2.07c-.297 0-.54-.24-.54-.54V8.9c0-.299.243-.54.54-.54.296 0 .54.241.54.54v2.68h1.53c.297 0 .54.24.54.54 0 .299-.243.54-.54.54Zm2.07-.54c0 .299-.243.54-.54.54-.296 0-.54-.241-.54-.54V8.9c0-.299.244-.54.54-.54.297 0 .54.241.54.54v3.22Zm5.18 0c0 .232-.149.439-.369.515-.058.02-.119.025-.18.025-.166 0-.327-.077-.428-.214l-2.14-2.918v2.591c0 .299-.244.54-.54.54-.297 0-.54-.241-.54-.54V8.9c0-.232.148-.438.369-.515.058-.02.118-.025.179-.025.166 0 .328.078.428.215l2.14 2.917V8.9c0-.299.244-.54.54-.54.297 0 .54.241.54.54v3.22Zm3.36-2.13c.297 0 .54.241.54.54 0 .298-.243.54-.54.54h-1.53v.59h1.53c.296 0 .54.242.54.54 0 .299-.244.54-.54.54h-2.07c-.296 0-.54-.241-.54-.54V8.9c0-.299.244-.54.54-.54h2.07c.296 0 .54.241.54.54 0 .298-.244.54-.54.54h-1.53v.59h1.53Z" />
              </svg>
            </span>
            <span className="thanks-line-btn-label">LINE で友だち追加</span>
            <span className="thanks-line-btn-arrow" aria-hidden>›</span>
          </a>

          <p className="mt-3 text-[10.5px] text-text-muted text-center leading-[1.6]">
            ※ LINE アプリが開きます。お持ちでない場合はインストール後にご登録ください。
          </p>
        </div>
      </section>
    </main>
  );
}
