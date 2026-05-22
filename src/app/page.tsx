import { redirect } from "next/navigation";

// `career.vibesradar.ai/` は将来の公式サイト用に開けてあるが、
// 公式実体がまだ無いため暫定で /lp01/ (現行 LP) にリダイレクトする。
// 公式サイト着手時にこのファイルを差し替える。
export default function RootPage() {
  redirect("/lp01");
}
