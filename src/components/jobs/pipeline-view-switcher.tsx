"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Columns3, List } from "lucide-react";
import {
  EmailTemplateStage,
  shouldOpenEmailTemplate,
} from "@/lib/email-templates";
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
import { EmailTemplateModal } from "@/components/jobs/email-template-modal";

type PipelineView = "list" | "kanban";

type PipelineSaveInput = {
  result: SubmissionResult;
  interviewDate: string | null;
  notes: string | null;
};

type EmailModalState = {
  stage: EmailTemplateStage;
  candidateName: string;
  candidateEmail: string | null;
  interviewDate?: string | null;
};

const PENDING_EMAIL_MODAL_KEY = "pipeline-email-modal";

function getOptimisticResult(
  stage: JobCandidateStage,
  resultOverride?: SubmissionResult
): SubmissionResult {
  if (resultOverride) {
    return resultOverride;
  }

  if (stage === "PLACED") {
    return "HIRED";
  }

  if (stage === "REJECTED") {
    return "REJECTED";
  }

  return "PENDING";
}

function parseEmailModalState(value: string | null): EmailModalState | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      (parsed.stage !== "CONTACTED" &&
        parsed.stage !== "INTERVIEW" &&
        parsed.stage !== "OFFER" &&
        parsed.stage !== "REJECTED") ||
      typeof parsed.candidateName !== "string"
    ) {
      return null;
    }

    return {
      stage: parsed.stage,
      candidateName: parsed.candidateName,
      candidateEmail:
        typeof parsed.candidateEmail === "string" ? parsed.candidateEmail : null,
      interviewDate:
        typeof parsed.interviewDate === "string" ? parsed.interviewDate : null,
    };
  } catch {
    return null;
  }
}

export function PipelineViewSwitcher({
  jobId,
  jobTitle,
  companyName,
  candidates,
}: {
  jobId: number;
  jobTitle: string;
  companyName: string;
  candidates: SerializedJobCandidateWithRelations[];
}) {
  const [view, setView] = useState<PipelineView>("list");
  const [items, setItems] = useState(candidates);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailModal, setEmailModal] = useState<EmailModalState | null>(null);
  const [pendingEmailModal, setPendingEmailModal] =
    useState<EmailModalState | null>(null);

  useEffect(() => {
    setItems(candidates);
  }, [candidates]);

  useEffect(() => {
    const storedView = window.localStorage.getItem("pipeline-view");
    if (storedView === "list" || storedView === "kanban") {
      setView(storedView);
    }
  }, []);

  useEffect(() => {
    const storedEmailModal = parseEmailModalState(
      window.sessionStorage.getItem(PENDING_EMAIL_MODAL_KEY)
    );

    if (!storedEmailModal) {
      window.sessionStorage.removeItem(PENDING_EMAIL_MODAL_KEY);
      return;
    }

    setPendingEmailModal((current) => current ?? storedEmailModal);
  }, []);

  useEffect(() => {
    if (!pendingEmailModal || emailModal) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setEmailModal(pendingEmailModal);
      setPendingEmailModal(null);
      window.sessionStorage.removeItem(PENDING_EMAIL_MODAL_KEY);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [emailModal, pendingEmailModal]);

  const handleViewChange = (nextView: PipelineView) => {
    setView(nextView);
    window.localStorage.setItem("pipeline-view", nextView);
  };

  const queueEmailModal = (nextModal: EmailModalState) => {
    window.sessionStorage.setItem(
      PENDING_EMAIL_MODAL_KEY,
      JSON.stringify(nextModal)
    );
    setPendingEmailModal(nextModal);
  };

  const handleStageChange = async (
    jobCandidateId: number,
    stage: JobCandidateStage,
    resultOverride?: SubmissionResult
  ) => {
    const previousItems = items;
    const selectedCandidate = items.find((item) => item.id === jobCandidateId);
    const nextResult = getOptimisticResult(stage, resultOverride);

    if (!selectedCandidate) {
      return false;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === jobCandidateId
          ? {
              ...item,
              stage,
              result: nextResult,
            }
          : item
      )
    );
    setIsPending(true);

    const result = await updateCandidateStageAction(
      jobCandidateId,
      stage,
      resultOverride
    );

    if (!result.success) {
      setItems(previousItems);
      setErrorMessage(result.message ?? "Không thể cập nhật trạng thái ứng tuyển.");
      setIsPending(false);
      return false;
    }

    setErrorMessage(null);
    if (shouldOpenEmailTemplate(stage, nextResult)) {
      queueEmailModal({
        stage,
        candidateName: selectedCandidate.candidate.fullName,
        candidateEmail: selectedCandidate.candidate.email,
        interviewDate: selectedCandidate.interviewDate,
      });
    }
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

      {emailModal ? (
        <EmailTemplateModal
          candidateName={emailModal.candidateName}
          candidateEmail={emailModal.candidateEmail}
          jobTitle={jobTitle}
          companyName={companyName}
          stage={emailModal.stage}
          interviewDate={emailModal.interviewDate}
          onClose={() => {
            window.sessionStorage.removeItem(PENDING_EMAIL_MODAL_KEY);
            setEmailModal(null);
          }}
        />
      ) : null}
    </div>
  );
}
