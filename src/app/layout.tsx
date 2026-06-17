import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { UtmCapture } from "@/components/UtmCapture";
import "./globals.css";

// Google Tag Manager コンテナ ID
const GTM_ID = "GTM-NLBK2344";

// GTM を読み込むかどうか (本番ビルドのみ true)。
// ローカル `npm run dev` (NODE_ENV=development) では発火させず、
// 計測データに開発時アクセスが混ざらないようにする。
const enableGtm = process.env.NODE_ENV === "production";

// =====================================================
// フォントはセルフホスト (next/font/local)。
// 以前は next/font/google を使っていたが、ビルド時に Google Fonts へ
// 取得しに行く設計のため、ネットワークが不安定だと Turbopack が
// 壊れたバンドルを生成し本番が全ページ 500 になる事故が発生した。
// woff2 (latin サブセット) を src/app/fonts/ に同梱し、ビルドを
// ネット非依存・決定的にしている。subsets は従来通り latin のみ
// (日本語グリフはフォールスバックフォントで表示)。
// =====================================================

// 本文用 (latin サブセットの可変フォント。1ファイルで全ウェイトをカバー)
const notoSansJP = localFont({
  src: "./fonts/noto-sans-jp-latin.woff2",
  variable: "--font-noto-sans-jp",
  weight: "400 900",
  display: "swap",
});

// 英字用のスタイリッシュなジオメトリックサンセリフ (可変フォント)
const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  variable: "--font-inter",
  weight: "500 800",
  display: "swap",
});

// アドバイザーキャッチコピー用 (角に少し丸みがある柔らかいゴシック)
const zenKakuGothicAntique = localFont({
  src: [
    { path: "./fonts/zen-kaku-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/zen-kaku-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/zen-kaku-900.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-zen-kaku",
  display: "swap",
});

// ラストメッセージ用 (上品な手書き風日本語フォント、ペン書き感)
const kleeOne = localFont({
  src: [
    { path: "./fonts/klee-one-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/klee-one-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-handwritten",
  display: "swap",
});

export const metadata: Metadata = {
  title: "適職・適正年収 15秒診断 | VibesCareer",
  description:
    "2,400以上の論文・5,000以上の企業データをもとに開発した独自アルゴリズムで、最適な職種と適正年収がすぐわかる。第二新卒向けキャリア診断。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${inter.variable} ${zenKakuGothicAntique.variable} ${kleeOne.variable}`}
    >
      <head>
        {/* Google Tag Manager (head 上部に配置するため layout.tsx 内 <head> に直書き) */}
        {enableGtm && (
          <Script id="gtm-init" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
        )}
      </head>
      <body className="min-h-screen bg-white">
        {/* Google Tag Manager (noscript) — body 開始直後に配置 */}
        {enableGtm && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        {/* URL の UTM パラメータを localStorage に保存 (last paid touch attribution) */}
        <UtmCapture />
        {children}
      </body>
    </html>
  );
}
