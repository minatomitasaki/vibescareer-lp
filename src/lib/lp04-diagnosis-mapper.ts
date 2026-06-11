// LP04 専用: 12 パターンの診断結果を 3 パターン (sales-stable / marketing-stable / planning-stable)
// に集約するためのマッパー。
//
// エルメ フリープランの QRコードアクション枠が 3 つしか作れないため、
// LP04 では 6 職種を 3 つに集約 + 職場タイプ (speed/stable) は強制的に stable に固定する。
//
// 集約ルール (近い性質の職種を同じ枠にまとめる):
//   sales    + support  → sales      (対人系)
//   marketing+ creative → marketing  (発想系)
//   planning + engineer → planning   (思考系)

import type { JobType } from "@/data/results";

export type Lp04ResultId = "sales-stable" | "marketing-stable" | "planning-stable";

/** LP04 で取り扱う 3 つの結果 ID (preview / result の generateStaticParams で使用) */
export const LP04_RESULT_IDS: Lp04ResultId[] = [
  "sales-stable",
  "marketing-stable",
  "planning-stable",
];

const JOB_MAPPING: Record<JobType, "sales" | "marketing" | "planning"> = {
  sales: "sales",
  support: "sales",
  marketing: "marketing",
  creative: "marketing",
  planning: "planning",
  engineer: "planning",
};

/** 12 パターンのうちの 1 つの職種 → LP04 用の 3 つの結果 ID のいずれかに変換 */
export function mapJobToLp04ResultId(job: JobType): Lp04ResultId {
  return `${JOB_MAPPING[job]}-stable` as Lp04ResultId;
}

/** preview / result ページの notFound チェック用 */
export function isLp04ResultId(id: string): id is Lp04ResultId {
  return (LP04_RESULT_IDS as string[]).includes(id);
}

/** LP04 で運用しないパターンも文字列としては受け入れる必要があるとき用 */
export function lp04CollapsedJobOf(resultId: Lp04ResultId): "sales" | "marketing" | "planning" {
  return resultId.split("-")[0] as "sales" | "marketing" | "planning";
}
