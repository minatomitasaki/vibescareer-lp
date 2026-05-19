// サンクスページ (/thanks)
//
// /schedule の TimeRex 予約完了時に onBookingComplete から遷移してくる。
// 「ご予約ありがとうございます」 / 今後の流れ 3 STEP / LINE 登録 CTA を表示。
//
// LINE 公式アカウントの登録 URL は本番値を取得し次第差し替える。
import type { Metadata } from "next";
import { Logo } from "@/components/Logo";

const LINE_REGISTER_URL = "https://line.me/R/ti/p/@vibescareer"; // TODO: 本番 URL に差し替え

export const metadata: Metadata = {
  title: "ご予約ありがとうございます | VibesCareer",
  description:
    "初回カウンセリングのご予約ありがとうございます。VibesRadar の受検 URL は登録メールアドレス宛にお送りします。",
};

export default function ThanksPage() {
  return (
    <main className="lp-container bg-white">
      {/* ヘッダー */}
      <header className="relative px-4 py-3 flex items-center justify-start bg-white">
        <Logo width={160} height={44} priority />
        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent" />
      </header>

      {/* 完了見出し */}
      <section className="px-4 pt-10 pb-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-primary/10 mb-4">
          <span className="text-brand-primary text-[28px]">✓</span>
        </div>
        <h1 className="text-[22px] font-black text-text-primary leading-[1.5]">
          ご予約ありがとうございます
        </h1>
        <p className="mt-4 text-[13.5px] leading-[1.95] text-text-secondary">
          このあとすぐに、ご登録いただいた
          <br />
          メールアドレス宛に
          <br />
          <strong className="text-brand-primary">
            VibesRadar の受検 URL
          </strong>
          をお送りします。
        </p>
        <p className="mt-3 text-[13px] leading-[1.9] text-text-secondary">
          お手数ですが初回カウンセリングまでに
          <br />
          受検をお済ませください。
        </p>
      </section>

      {/* 今後の流れ */}
      <section className="px-4 pb-10">
        <div className="bg-bg-form rounded-2xl border border-brand-primary/30 p-5">
          <h2 className="text-center text-[15px] font-black text-text-primary mb-4">
            ▼ 今後の流れ
          </h2>

          <ol className="space-y-4">
            {[
              {
                no: 1,
                title: "VibesRadar を受検",
                desc: "※ ご登録メールアドレスにお送りします",
              },
              {
                no: 2,
                title: "初回カウンセリングにて、\nVibesRadar の診断結果を発表",
              },
              {
                no: 3,
                title:
                  "キャリアアドバイザーと一緒に\n自己分析とキャリアを設計",
              },
            ].map((step, idx) => (
              <li key={step.no}>
                <div className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary text-white text-[14px] font-black flex items-center justify-center">
                    {step.no}
                  </span>
                  <div className="flex-1">
                    <p className="text-[13.5px] font-bold text-text-primary leading-[1.55] whitespace-pre-line">
                      {step.title}
                    </p>
                    {step.desc && (
                      <p className="text-[11px] text-text-muted mt-1">
                        {step.desc}
                      </p>
                    )}
                  </div>
                </div>
                {idx < 2 && (
                  <div className="flex justify-center my-2">
                    <span className="text-brand-primary text-[18px]">↓</span>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* LINE 登録 CTA */}
      <section className="px-4 pb-12">
        <div className="bg-white rounded-3xl border-2 border-line-green/40 p-5 shadow-md">
          <div className="text-center">
            <p className="inline-block bg-bg-subtle rounded-full px-3 py-1 text-[11.5px] font-bold text-text-secondary mb-3">
              不明点や質問はいつでも気軽にご相談ください!
            </p>
            <p className="text-[13.5px] leading-[1.85] text-text-secondary">
              VibesCareer 代表・渡邉との
              <br />
              <strong className="text-text-primary">"直通 LINE"</strong> を公開しています。
              <br />
              LINE 登録いただいた方より<strong>優先的に対応</strong>しますので、
              <br />
              ぜひこの機会にご登録ください。
            </p>
          </div>

          <a
            href={LINE_REGISTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex items-center justify-center gap-2 w-full bg-line-green text-white text-[18px] font-black py-4 rounded-full shadow-md hover:brightness-105 active:translate-y-[1px] transition"
          >
            <span aria-hidden>💬</span>
            LINE 登録はこちら
          </a>
        </div>
      </section>
    </main>
  );
}
