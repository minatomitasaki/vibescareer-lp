// 診断結果のラベル組み立てヘルパー
//
// 役割:
//   - 個人別 2 位 3 位の算出 (localStorage の jobDistances を使う)
//   - シート連携 (GAS) に送る日本語ラベルの組み立て
//
// EntryForm.tsx と OtherJobsList.tsx の両方から使うため、
// ロジックをここに集約して二重実装を避ける。

import {
  JOB_LABEL,
  JOB_OTHER_DESCRIPTION,
  RESULT_DATA,
  WORKPLACE_LABEL,
  type JobType,
  type ResultId,
} from "@/data/results";

// 距離タイブレーク順 (diagnosis-scoring.ts と同一)
// 距離が同点だった場合に、ここの並び順で先のものを優先する。
const TIEBREAK_ORDER: JobType[] = [
  "sales",
  "marketing",
  "planning",
  "support",
  "creative",
  "engineer",
];

/** localStorage["vc:diagnosis:answers"] の中身 (一部) */
export type StoredDiagnosis = {
  debug?: {
    jobDistances?: Partial<Record<JobType, number>>;
  };
};

/**
 * メイン職種以外で「距離が近い順」に 2 つ返す。
 * jobDistances が無い場合は results.ts に定義された defaults を返す。
 */
export function computePersonalizedOtherJobs(
  mainJob: JobType,
  jobDistances: Partial<Record<JobType, number>> | undefined,
  defaults: [JobType, JobType],
): [JobType, JobType] {
  if (!jobDistances) return defaults;
  const ranked = TIEBREAK_ORDER.filter((j) => j !== mainJob)
    .map((j) => ({
      job: j,
      dist: jobDistances[j] ?? Infinity,
      tiebreakIdx: TIEBREAK_ORDER.indexOf(j),
    }))
    .sort((a, b) => {
      if (a.dist !== b.dist) return a.dist - b.dist;
      return a.tiebreakIdx - b.tiebreakIdx;
    });
  if (ranked.length < 2) return defaults;
  return [ranked[0].job, ranked[1].job];
}

/** GAS へ送るシート用のラベル一式 */
export type ResultMetaForSheet = {
  workplaceLabel: string;
  jobLabel: string;
  /** C 列向け: "安定 / エンジニア職" のような合体表示 */
  combinedLabel: string;
  subJobLabel1: string;
  subJobLabel2: string;
  salaryRange: string;
};

/**
 * resultId と (任意で) jobDistances からシート用のラベルを組み立てる。
 * jobDistances を渡せばその人専用の 2 位 3 位、無ければ defaults が使われる。
 */
export function buildResultMetaForSheet(
  resultId: ResultId,
  jobDistances?: Partial<Record<JobType, number>>,
): ResultMetaForSheet {
  const data = RESULT_DATA[resultId];
  const workplaceLabel = WORKPLACE_LABEL[data.workplaceType];
  const jobLabel = JOB_LABEL[data.jobType];
  const [sub1, sub2] = computePersonalizedOtherJobs(
    data.jobType,
    jobDistances,
    data.otherJobs,
  );
  return {
    workplaceLabel,
    jobLabel,
    combinedLabel: `${workplaceLabel} / ${jobLabel}`,
    subJobLabel1: JOB_OTHER_DESCRIPTION[sub1].name,
    subJobLabel2: JOB_OTHER_DESCRIPTION[sub2].name,
    salaryRange: data.salaryRange,
  };
}

/** ResultId として有効な文字列か判定 (URL 直リンク対策) */
export function isValidResultId(s: string): s is ResultId {
  return s in RESULT_DATA;
}
