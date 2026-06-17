import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// OpenNext for Cloudflare の構成。
// Cloudflare Workers 上で Next.js 16 を動かすためのアダプタ設定。
// 詳細: https://opennext.js.org/cloudflare
const config = defineCloudflareConfig({});

// ビルドを webpack に固定する。
// Next.js 16 は `next build` がデフォルトで Turbopack を使うが、
// Turbopack 出力は OpenNext/Cloudflare(workerd) 上で正しくロードできず、
// 全ページが ChunkLoadError / "ComponentMod.handler is not a function" で
// 500 になる事故が発生した。webpack 出力なら OpenNext が確実に実行できる。
// (OpenNext は実行時に NEXT_PRIVATE_STANDALONE=true を立てるため
//  next.config 側に output: "standalone" を書く必要はない)
config.buildCommand = "next build --webpack";

export default config;
