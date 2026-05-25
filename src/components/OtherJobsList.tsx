"use client";

// その他の適職リスト (結果LP Section 4)
//
// 動作:
//   1. SSR/初期描画は ResultData にプリセットされた defaults (デフォルト 2 位 3 位) を表示
//   2. クライアント側で localStorage の診断結果 (jobDistances) を読み、
//      その人のメイン以外で距離が近い順に 2 位 3 位 を算出して差し替える
//
// localStorage が無いケース (URL 直リンクや別ブラウザ) は defaults のまま表示する。

import { useEffect, useState } from "react";
import { JOB_OTHER_DESCRIPTION, type JobType } from "@/data/results";
import {
  computePersonalizedOtherJobs,
  type StoredDiagnosis,
} from "@/lib/result-meta";

const STORAGE_KEY = "vc:diagnosis:answers";

export function OtherJobsList({
  defaults,
  mainJob,
}: {
  defaults: [JobType, JobType];
  mainJob: JobType;
}) {
  const [jobs, setJobs] = useState<[JobType, JobType]>(defaults);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as StoredDiagnosis;
      const distances = parsed?.debug?.jobDistances;
      if (!distances) return;
      setJobs(computePersonalizedOtherJobs(mainJob, distances, defaults));
    } catch {
      /* localStorage が無効でも defaults のまま表示 */
    }
  }, [mainJob, defaults]);

  return (
    <div className="flex flex-col gap-4 mt-3">
      {jobs.map((j) => {
        const info = JOB_OTHER_DESCRIPTION[j];
        return (
          <div key={j} className="result-other-card">
            <span className="job-name">{info.name}</span>
            <p className="job-desc">{info.description}</p>
          </div>
        );
      })}
    </div>
  );
}
