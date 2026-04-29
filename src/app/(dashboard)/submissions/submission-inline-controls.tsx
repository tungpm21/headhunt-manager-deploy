"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateCandidatePipelineAction,
  updateCandidateStageAction,
} from "@/lib/job-actions";
import { PIPELINE_RESULTS, PIPELINE_STAGES, getResultMeta, getStageMeta } from "@/lib/job-pipeline";
import type { JobCandidateStage, SubmissionResult } from "@/types/job";

export function SubmissionStageSelect({
  id,
  stage,
}: {
  id: number;
  stage: JobCandidateStage;
}) {
  const router = useRouter();
  const [value, setValue] = useState(stage);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(nextValue: JobCandidateStage) {
    if (nextValue === value || saving) return;
    const previous = value;
    setValue(nextValue);
    setSaving(true);
    setError(null);

    const result = await updateCandidateStageAction(id, nextValue);
    if (!result.success) {
      setValue(previous);
      setError(result.message ?? "Không thể cập nhật stage.");
    } else {
      router.refresh();
    }

    setSaving(false);
  }

  return (
    <div className="space-y-1">
      <select
        value={value}
        disabled={saving}
        onChange={(event) => handleChange(event.target.value as JobCandidateStage)}
        className={`h-8 rounded-lg border border-border px-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/25 disabled:opacity-60 ${getStageMeta(value).badgeClassName}`}
      >
        {PIPELINE_STAGES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-[11px] text-red-600">{error}</p> : null}
    </div>
  );
}

export function SubmissionResultSelect({
  id,
  result,
  interviewDate,
  notes,
}: {
  id: number;
  result: SubmissionResult;
  interviewDate: string | null;
  notes: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(result);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(nextValue: SubmissionResult) {
    if (nextValue === value || saving) return;
    const previous = value;
    setValue(nextValue);
    setSaving(true);
    setError(null);

    const response = await updateCandidatePipelineAction(id, {
      result: nextValue,
      interviewDate,
      notes,
    });
    if (!response.success) {
      setValue(previous);
      setError(response.message ?? "Không thể cập nhật kết quả.");
    } else {
      router.refresh();
    }

    setSaving(false);
  }

  return (
    <div className="space-y-1">
      <select
        value={value}
        disabled={saving}
        onChange={(event) => handleChange(event.target.value as SubmissionResult)}
        className={`h-8 rounded-lg border border-border px-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/25 disabled:opacity-60 ${getResultMeta(value).className}`}
      >
        {PIPELINE_RESULTS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-[11px] text-red-600">{error}</p> : null}
    </div>
  );
}
