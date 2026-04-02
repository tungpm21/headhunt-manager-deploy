"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Columns3, List } from "lucide-react";
import {
  removeCandidateAction,
  updateCandidatePipelineAction,
  updateCandidateStageAction,
} from "@/lib/job-actions";
import {
  JobCandidateStage,
  SerializedJobCandidateWithRelations,
  SubmissionResult,
} from "@/types/job";
import { JobPipeline } from "@/components/jobs/job-pipeline";
import { PipelineKanban } from "@/components/jobs/pipeline-kanban";
import { AssignCandidateModal } from "@/components/jobs/assign-candidate-modal";

type PipelineView = "list" | "kanban";

type PipelineSaveInput = {
  result: SubmissionResult;
  interviewDate: string | null;
  notes: string | null;
};

export function PipelineViewSwitcher({
  jobId,
  candidates,
}: {
  jobId: number;
  candidates: SerializedJobCandidateWithRelations[];
}) {
  const [view, setView] = useState<PipelineView>("list");
  const [items, setItems] = useState(candidates);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setItems(candidates);
  }, [candidates]);

  useEffect(() => {
    const storedView = window.localStorage.getItem("pipeline-view");
    if (storedView === "list" || storedView === "kanban") {
      setView(storedView);
    }
  }, []);

  const handleViewChange = (nextView: PipelineView) => {
    setView(nextView);
    window.localStorage.setItem("pipeline-view", nextView);
  };

  const handleStageChange = async (
    jobCandidateId: number,
    stage: JobCandidateStage
  ) => {
    const previousItems = items;

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === jobCandidateId ? { ...item, stage } : item
      )
    );
    setIsPending(true);

    const result = await updateCandidateStageAction(jobCandidateId, stage);

    if (!result.success) {
      setItems(previousItems);
      setErrorMessage(result.message ?? "Không thể cập nhật trạng thái ứng tuyển.");
      setIsPending(false);
      return false;
    }

    setErrorMessage(null);
    setIsPending(false);
    return true;
  };

  const handlePipelineSave = async (
    jobCandidateId: number,
    data: PipelineSaveInput
  ) => {
    setIsPending(true);

    const result = await updateCandidatePipelineAction(jobCandidateId, data);

    if (!result.success) {
      setErrorMessage(result.message ?? "Không thể cập nhật thông tin pipeline.");
      setIsPending(false);
      return false;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === jobCandidateId
          ? {
              ...item,
              result: data.result,
              interviewDate: data.interviewDate,
              notes: data.notes ?? null,
            }
          : item
      )
    );
    setErrorMessage(null);
    setIsPending(false);
    return true;
  };

  const handleRemove = async (jobCandidateId: number, candidateId: number) => {
    const previousItems = items;

    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== jobCandidateId)
    );
    setIsPending(true);

    const result = await removeCandidateAction(jobId, candidateId);

    if (!result.success) {
      setItems(previousItems);
      setErrorMessage(result.message ?? "Không thể gỡ ứng viên khỏi Job.");
      setIsPending(false);
      return false;
    }

    setErrorMessage(null);
    setIsPending(false);
    return true;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-border pb-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Pipeline ứng viên</h2>
          <p className="mt-0.5 text-xs text-muted">
            Đang có {items.length} hồ sơ được gán
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-background p-1">
            <button
              type="button"
              onClick={() => handleViewChange("list")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                view === "list"
                  ? "bg-primary text-white"
                  : "text-muted hover:bg-surface hover:text-foreground"
              }`}
            >
              <List className="h-4 w-4" />
              Danh sách
            </button>
            <button
              type="button"
              onClick={() => handleViewChange("kanban")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                view === "kanban"
                  ? "bg-primary text-white"
                  : "text-muted hover:bg-surface hover:text-foreground"
              }`}
            >
              <Columns3 className="h-4 w-4" />
              Kanban
            </button>
          </div>

          <AssignCandidateModal jobId={jobId} />
        </div>
      </div>

      {errorMessage ? (
        <div className="flex items-start gap-2 rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      {view === "list" ? (
        <JobPipeline
          candidates={items}
          isPending={isPending}
          onStageChange={handleStageChange}
          onPipelineSave={handlePipelineSave}
          onRemove={handleRemove}
        />
      ) : (
        <PipelineKanban
          candidates={items}
          isPending={isPending}
          onStageChange={handleStageChange}
          onPipelineSave={handlePipelineSave}
        />
      )}
    </div>
  );
}
