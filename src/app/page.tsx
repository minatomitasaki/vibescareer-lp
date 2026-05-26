import { redirect } from "next/navigation";

// `career.vibesradar.ai/` は将来の公式サイト用に開けてあるが、
// 公式実体がまだ無いため暫定で /lp01/ (現行 LP) にリダイレクトする。
// 公式サイト着手時にこのファイルを差し替える。
//
// 重要: 広告流入 (?utm_source=meta&...) のクエリパラメータを引き継いで
// /lp01 にリダイレクトする。引き継がないと LP 側の captureUtmFromUrl()
// が UTM を取得できず、流入計測が壊れる。
export default async function RootPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      query.set(key, value);
    } else if (Array.isArray(value)) {
      for (const v of value) query.append(key, v);
    }
  }
  const search = query.toString();
  redirect(search ? `/lp01?${search}` : "/lp01");
}
