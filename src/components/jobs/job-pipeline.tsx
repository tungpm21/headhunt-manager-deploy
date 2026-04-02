"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight as ChevronStage,
  ChevronRight,
  ChevronUp,
  Trash2,
  UserX,
  XCircle,
} from "lucide-react";
import {
  formatPipelineDate,
  getNextStage,
  getResultMeta,
  getStageMeta,
  PIPELINE_STAGES,
} from "@/lib/job-pipeline";
import { PipelineDetailPanel } from "@/components/jobs/pipeline-detail-panel";
import {
  JobCandidateStage,
  SerializedJobCandidateWithRelations,
  SubmissionResult,
} from "@/types/job";

type PipelineSaveInput = {
  result: SubmissionResult;
  interviewDate: string | null;
  notes: string | null;
};

export function JobPipeline({
  candidates,
  isPending,
  onStageChange,
  onPipelineSave,
  onRemove,
}: {
  candidates: SerializedJobCandidateWithRelations[];
  isPending: boolean;
  onStageChange: (
    jobCandidateId: number,
    stage: JobCandidateStage,
    resultOverride?: SubmissionResult
  ) => Promise<boolean>;
  onPipelineSave: (
    jobCandidateId: number,
    data: PipelineSaveInput
  ) => Promise<boolean>;
  onRemove: (jobCandidateId: number, candidateId: number) => Promise<boolean>;
}) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const handleRemove = async (jobCandidateId: number, candidateId: number) => {
    const confirmed = window.confirm(
      "Gỡ ứng viên này khỏi Job Order? Dữ liệu lịch sử cho job này sẽ bị xóa."
    );

    if (!confirmed) {
      return;
    }

    await onRemove(jobCandidateId, candidateId);
  };

  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background py-10">
        <CheckCircle2 className="mb-3 h-10 w-10 text-muted/30" />
        <p className="text-sm text-muted">Job này chưa có ứng viên nào.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      {candidates.map((jobCandidate) => {
        const candidate = jobCandidate.candidate;
        const isExpanded = expanded === jobCandidate.id;
        const resultMeta = getResultMeta(jobCandidate.result);
        const stageMeta = getStageMeta(jobCandidate.stage);
        const nextStage = getNextStage(jobCandidate.stage);
        const canReject =
          jobCandidate.stage !== "REJECTED" || jobCandidate.result !== "REJECTED";
        const canWithdraw =
          jobCandidate.stage !== "REJECTED" || jobCandidate.result !== "WITHDRAWN";

        return (
          <div
            key={jobCandidate.id}
            className="border-b border-border last:border-b-0 transition hover:bg-surface/80"
          >
            <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/candidates/${candidate.id}`}
                  className="flex items-center text-sm font-semibold text-foreground transition hover:text-primary"
                >
                  {candidate.fullName}
                  <ChevronRight className="ml-1 h-3.5 w-3.5 text-muted" />
                </Link>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span>
                    {candidate.currentPosition || "Chưa rõ vị trí"}
                    {candidate.currentCompany ? ` • ${candidate.currentCompany}` : ""}
                  </span>

                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${stageMeta.badgeClassName}`}
                  >
                    {stageMeta.label}
                  </span>

                  {jobCandidate.result !== "PENDING" ? (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${resultMeta.className}`}
                    >
                      {resultMeta.label}
                    </span>
                  ) : null}

                  {jobCandidate.interviewDate ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                      <Calendar className="h-3 w-3" />
                      PV: {formatPipelineDate(jobCandidate.interviewDate)}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={jobCandidate.stage}
                  disabled={isPending}
                  onChange={(event) =>
                    onStageChange(jobCandidate.id, event.target.value as JobCandidateStage)
                  }
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {PIPELINE_STAGES.map((stage) => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>

                {nextStage ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => onStageChange(jobCandidate.id, nextStage)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition hover:bg-background disabled:opacity-60"
                  >
                    <ChevronStage className="h-4 w-4" />
                    Chuyển → {getStageMeta(nextStage).shortLabel}
                  </button>
                ) : null}

                {canReject ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => onStageChange(jobCandidate.id, "REJECTED", "REJECTED")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-sm font-medium text-danger transition hover:bg-danger/15 disabled:opacity-60"
                  >
                    <XCircle className="h-4 w-4" />
                    Từ chối
                  </button>
                ) : null}

                {canWithdraw ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => onStageChange(jobCandidate.id, "REJECTED", "WITHDRAWN")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-warning/20 bg-warning/10 px-3 py-2 text-sm font-medium text-warning transition hover:bg-warning/15 disabled:opacity-60"
                  >
                    <UserX className="h-4 w-4" />
                    Rút lui
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : jobCandidate.id)}
                  className="rounded-lg border border-border bg-surface p-2 text-muted transition hover:bg-background hover:text-foreground"
                  title="Chi tiết pipeline"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleRemove(jobCandidate.id, candidate.id)}
                  className="rounded-lg border border-border bg-surface p-2 text-muted transition hover:bg-danger/10 hover:text-danger disabled:opacity-60"
                  title="Gỡ ứng viên"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {isExpanded ? (
              <PipelineDetailPanel
                jobCandidate={jobCandidate}
                isPending={isPending}
                onSave={onPipelineSave}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
