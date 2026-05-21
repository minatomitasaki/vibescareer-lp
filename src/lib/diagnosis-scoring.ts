// 診断ロジック: Q1〜Q8 の回答 (1〜5) から 12 パターン (職種×職場) の結果 ID を導く純関数群。
//
// 設計方針:
//   - 職場軸 (speed | stable): Q3, Q4, Q7, Q8 の回答を「stable 度」に正規化して合計し、
//     中央 (12) を閾値に 2 分岐。
//   - 職種軸 (6 職種): 各職種に「理想の回答ベクトル」を持たせ、ユーザー回答との
//     L1 距離が最小のものを選ぶ。同点時はタイブレーク順 (対人・人気職種を優先) で解決。
//
// すべて純関数。React 非依存。テストしやすさ・可搬性を優先。

import type { JobType, WorkplaceType, ResultId } from "@/data/results";

/** 質問ID (1-8) → 回答値 (1-5) */
export type Answers = Record<number, number>;

// ===========================================================================
// 職種軸: 6 職種の期待値プロファイル
// ===========================================================================
//
// 各セルは「その職種にとって理想の回答値 (1-5)」。意味合いは以下の通り。
//   Q1: 1=技術を身につける ←→ 5=人を笑顔・感動する
//   Q2: 1=会社・組織の発展 ←→ 5=物事の探究・分析
//   Q5: 1=自分の軸を作る   ←→ 5=周囲の意見を聞く
//   Q6: 1=自分の考えを信じる ←→ 5=多様な知識を取り入れる
type JobProfile = { Q1: number; Q2: number; Q5: number; Q6: number };

const JOB_PROFILES: Record<JobType, JobProfile> = {
  // 独創性・多様性受容・自軸
  creative:  { Q1: 4, Q2: 5, Q5: 1, Q6: 5 },
  // 対人・他者起点 (Q2/Q6 を 4 にして中央回答 (3,3,3,3) から距離を取る)
  support:   { Q1: 5, Q2: 4, Q5: 5, Q6: 4 },
  // 分析・市場感度・他軸寄り
  marketing: { Q1: 2, Q2: 5, Q5: 4, Q6: 5 },
  // 組織貢献・確信寄り
  planning:  { Q1: 3, Q2: 1, Q5: 1, Q6: 2 },
  // 技術・探究・自軸・確信
  engineer:  { Q1: 1, Q2: 5, Q5: 1, Q6: 1 },
  // 対人・組織貢献
  sales:     { Q1: 5, Q2: 1, Q5: 5, Q6: 3 },
};

// 同点時のタイブレーク順
// sales / marketing / planning を優先し、support / creative / engineer を後ろに。
// 全 625 通りの分布が 営業/マーケ/企画 ≒ 多め、サポート/クリエ/エンジ ≒ 少なめ に揃う。
const JOB_TIEBREAK_ORDER: JobType[] = [
  "sales",
  "marketing",
  "planning",
  "support",
  "creative",
  "engineer",
];

// ===========================================================================
// 職場軸: 各設問が「stable 度」をどちら向きで表現するか
// ===========================================================================
//
//   Q3: 1=戦略的に考える (=stable) ←→ 5=相手や顧客を整理 (=speed)   → left-is-stable
//   Q4: 1=ひとりで静かに (=stable) ←→ 5=多くの人と賑やかに (=speed) → left-is-stable
//   Q7: 1=正直に表に出す (=speed)  ←→ 5=冷静に伝わる (=stable)      → right-is-stable
//   Q8: 1=柔軟に動く (=speed)      ←→ 5=計画的に準備する (=stable)  → right-is-stable

type Direction = "right-is-stable" | "left-is-stable";

const WORKPLACE_DIRECTIONS: Record<number, Direction> = {
  3: "left-is-stable",
  4: "left-is-stable",
  7: "right-is-stable",
  8: "right-is-stable",
};

// 生回答 (1-5) を「stable 度」(1-5、大きいほど stable) に正規化
function toStableScore(rawValue: number, dir: Direction): number {
  return dir === "right-is-stable" ? rawValue : 6 - rawValue;
}

// ===========================================================================
// 公開 API
// ===========================================================================

/** Q1, Q2, Q5, Q6 のプロファイルとの L1 距離が最小の職種を返す。 */
export function computeJob(answers: Answers): JobType {
  const q1 = answers[1];
  const q2 = answers[2];
  const q5 = answers[5];
  const q6 = answers[6];

  // タイブレーク順で走査することで、同点時は先頭優先になる
  let bestJob: JobType = JOB_TIEBREAK_ORDER[0];
  let bestDistance = Infinity;
  for (const job of JOB_TIEBREAK_ORDER) {
    const p = JOB_PROFILES[job];
    const d =
      Math.abs(q1 - p.Q1) +
      Math.abs(q2 - p.Q2) +
      Math.abs(q5 - p.Q5) +
      Math.abs(q6 - p.Q6);
    if (d < bestDistance) {
      bestJob = job;
      bestDistance = d;
    }
  }
  return bestJob;
}

/** Q3, Q4, Q7, Q8 の stable 度合計から speed | stable を返す。 */
export function computeWorkplace(answers: Answers): WorkplaceType {
  let stableSum = 0;
  for (const qid of [3, 4, 7, 8] as const) {
    stableSum += toStableScore(answers[qid], WORKPLACE_DIRECTIONS[qid]);
  }
  // 4-20 の合計。中央 12 を閾値に分岐 (13 以上で stable)
  return stableSum >= 13 ? "stable" : "speed";
}

/** 12 パターンの結果 ID "<job>-<workplace>" を返す。 */
export function computeResultId(answers: Answers): ResultId {
  return `${computeJob(answers)}-${computeWorkplace(answers)}`;
}

/**
 * デバッグ・分析用: 軸別の生スコアも合わせて返す。
 * - jobDistances は各職種への L1 距離 (小さいほど近い)。
 * - stableSum は Q3,Q4,Q7,Q8 の stable 度合計 (4-20)。
 */
export function computeDiagnosis(answers: Answers): {
  resultId: ResultId;
  job: JobType;
  workplace: WorkplaceType;
  jobDistances: Record<JobType, number>;
  stableSum: number;
} {
  const job = computeJob(answers);
  const workplace = computeWorkplace(answers);

  const jobDistances = {} as Record<JobType, number>;
  for (const j of JOB_TIEBREAK_ORDER) {
    const p = JOB_PROFILES[j];
    jobDistances[j] =
      Math.abs(answers[1] - p.Q1) +
      Math.abs(answers[2] - p.Q2) +
      Math.abs(answers[5] - p.Q5) +
      Math.abs(answers[6] - p.Q6);
  }

  let stableSum = 0;
  for (const qid of [3, 4, 7, 8] as const) {
    stableSum += toStableScore(answers[qid], WORKPLACE_DIRECTIONS[qid]);
  }

  return {
    resultId: `${job}-${workplace}` as ResultId,
    job,
    workplace,
    jobDistances,
    stableSum,
  };
}
