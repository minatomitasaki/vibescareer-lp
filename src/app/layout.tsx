import type { Metadata } from "next";
import { Noto_Sans_JP, Inter, Zen_Kaku_Gothic_Antique, Klee_One } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Google Tag Manager コンテナ ID
const GTM_ID = "GTM-NLBK2344";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

// 英字用のスタイリッシュなジオメトリックサンセリフ
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

// アドバイザーキャッチコピー用 (角に少し丸みがある柔らかいゴシック)
const zenKakuGothicAntique = Zen_Kaku_Gothic_Antique({
  variable: "--font-zen-kaku",
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  display: "swap",
});

// ラストメッセージ用 (上品な手書き風日本語フォント、ペン書き感)
const kleeOne = Klee_One({
  variable: "--font-handwritten",
  subsets: ["latin"],
  weight: ["400", "600"],
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
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      </head>
      <body className="min-h-screen bg-white">
        {/* Google Tag Manager (noscript) — body 開始直後に配置 */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
