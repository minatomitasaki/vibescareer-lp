import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // 開発時のみ、ブラウザ・中間キャッシュを無効化して
  // 「F5 で必ず最新版が表示される」状態にする。
  // 本番ビルドでは headers() は呼ばれない（NODE_ENV !== "development"）。
  async headers() {
    if (!isDev) return [];
    return [
      {
        // すべてのパスに対して no-store / no-cache を返す
        source: "/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
          { key: "Surrogate-Control", value: "no-store" },
        ],
      },
    ];
  },

  // 開発時は next/image の最適化キャッシュ (.next/cache/images) を経由しないようにする。
  // これにより public/images/*.png を上書き再生成しても、即座にブラウザに反映される。
  // 本番ビルドでは最適化を有効化（パフォーマンス維持のため）。
  //
  // 本番ビルド側では ImagePlaceholder が「?v=<mtime>」のクエリを付けるため
  // images.localPatterns で /images/** の任意の search を許可しておく。
  images: {
    unoptimized: isDev,
    localPatterns: [
      { pathname: "/images/**", search: "" },
      { pathname: "/images/**", search: "?v=*" },
    ],
  },
};

export default nextConfig;
