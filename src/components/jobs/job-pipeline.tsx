"use client";
/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowRight,
  Calendar,
  GripVertical,
  Trash2,
  UserCircle,
  UserX,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PipelineDetailPanel } from "@/components/jobs/pipeline-detail-panel";
import {
  formatPipelineDate,
  getNextStage,
  getResultMeta,
  getStageMeta,
  PIPELINE_STAGES,
} from "@/lib/job-pipeline";
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

function SortableCandidateCard({
  jobCandidate,
  isPending,
  isSelected,
  onSelect,
}: {
  jobCandidate: SerializedJobCandidateWithRelations;
  isPending: boolean;
  isSelected: boolean;
  onSelect: (jobCandidateId: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: `jc-${jobCandidate.id}`,
      disabled: isPending,
    });

  const resultMeta = getResultMeta(jobCandidate.result);

  return (
    <div
      ref={setNodeRef}
      role="button"
      tabIndex={0}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      onClick={() => onSelect(jobCandidate.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(jobCandidate.id);
        }
      }}
      className={`rounded-2xl border border-border bg-background p-4 text-left shadow-sm transition ${isSelected
        ? "ring-2 ring-primary/30"
        : "hover:border-primary/30 hover:bg-surface"
        } ${isDragging ? "opacity-70" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/candidates/${jobCandidate.candidate.id}`}
            onClick={(event) => event.stopPropagation()}
            className="truncate text-sm font-semibold text-foreground transition hover:text-primary"
          >
            {jobCandidate.candidate.fullName}
          </Link>
          <p className="mt-1 truncate text-xs text-muted">
            {jobCandidate.candidate.currentPosition || "Chưa cập nhật vị trí"}
            {jobCandidate.candidate.currentCompany
              ? ` • ${jobCandidate.candidate.currentCompany}`
              : ""}
          </p>
        </div>

        <button
          type="button"
          className="rounded-lg p-1 text-muted transition hover:bg-surface hover:text-foreground"
          aria-label="Di chuyển thẻ ứng viên"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {jobCandidate.candidate.level ? (
          <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {jobCandidate.candidate.level}
          </span>
        ) : null}

        {jobCandidate.result !== "PENDING" ? (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${resultMeta.className}`}
          >
            {resultMeta.label}
          </span>
        ) : null}
      </div>

      {jobCandidate.candidate.skills.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {jobCandidate.candidate.skills.slice(0, 4).map((skill: string) => (
            <span
              key={skill}
              className="rounded-full bg-surface px-2 py-0.5 text-[11px] text-muted"
            >
              {skill}
            </span>
          ))}
          {jobCandidate.candidate.skills.length > 4 ? (
            <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] text-muted">
              +{jobCandidate.candidate.skills.length - 4}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
        {jobCandidate.interviewDate ? (
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatPipelineDate(jobCandidate.interviewDate)}
          </span>
        ) : null}

        {jobCandidate.candidate.expectedSalary ? (
          <span>{jobCandidate.candidate.expectedSalary.toLocaleString("vi-VN")} tr</span>
        ) : null}
      </div>
    </div>
  );
}

function StageColumn({
  stage,
  candidates,
  selectedId,
  isPending,
  onSelect,
}: {
  stage: (typeof PIPELINE_STAGES)[number];
  candidates: SerializedJobCandidateWithRelations[];
  selectedId: number | null;
  isPending: boolean;
  onSelect: (jobCandidateId: number) => void;
}) {
  const { setNodeRef } = useDroppable({ id: stage.value });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[430px] min-w-[280px] flex-col rounded-3xl border p-4 ${stage.columnClassName}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{stage.label}</p>
          <p className="text-xs text-muted">{candidates.length} ứng viên</p>
        </div>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${stage.badgeClassName}`}
        >
          {stage.shortLabel}
        </span>
      </div>

      <div className="mt-4 flex-1 space-y-3">
        <SortableContext
          items={candidates.map((candidate) => `jc-${candidate.id}`)}
          strategy={verticalListSortingStrategy}
        >
          {candidates.length === 0 ? (
            <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-border bg-background/70 text-sm text-muted">
              Chưa có ứng viên
            </div>
          ) : (
            candidates.map((candidate) => (
              <SortableCandidateCard
                key={candidate.id}
                jobCandidate={candidate}
                isPending={isPending}
                isSelected={selectedId === candidate.id}
                onSelect={onSelect}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}

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
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const groupedCandidates = useMemo(
    () =>
      PIPELINE_STAGES.map((stage) => ({
        stage,
        candidates: candidates.filter((candidate) => candidate.stage === stage.value),
      })),
    [candidates]
  );

  const selectedCandidate =
    candidates.find((candidate) => candidate.id === selectedId) ?? null;
  const nextStage = selectedCandidate ? getNextStage(selectedCandidate.stage) : null;

  const resolveStageFromOverId = (overId: string) => {
    const matchedStage = PIPELINE_STAGES.find((stage) => stage.value === overId);
    if (matchedStage) {
      return matchedStage.value;
    }

    const matchedCandidate = candidates.find((candidate) => `jc-${candidate.id}` === overId);
    return matchedCandidate?.stage ?? null;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!event.over) {
      return;
    }

    const activeId = String(event.active.id);
    const overId = String(event.over.id);
    const jobCandidateId = Number(activeId.replace("jc-", ""));
    const currentCandidate = candidates.find((candidate) => candidate.id === jobCandidateId);
    const destinationStage = resolveStageFromOverId(overId);

    if (!currentCandidate || !destinationStage || destinationStage === currentCandidate.stage) {
      return;
    }

    await onStageChange(jobCandidateId, destinationStage);
  };

  const handleRemove = async () => {
    if (!selectedCandidate) {
      return;
    }

    const confirmed = window.confirm(
      "Gỡ ứng viên này khỏi job? Lịch sử pipeline của job này sẽ bị xóa."
    );

    if (!confirmed) {
      return;
    }

    const removed = await onRemove(
      selectedCandidate.id,
      selectedCandidate.candidate.id
    );

    if (removed) {
      setSelectedId(null);
    }
  };

  if (candidates.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-background px-6 py-12 text-center">
        <p className="text-sm font-medium text-foreground">Job này chưa có ứng viên nào.</p>
        <p className="mt-1 text-sm text-muted">
          Dùng nút "Gán ứng viên" để đưa hồ sơ vào pipeline.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max gap-4">
            {groupedCandidates.map(({ stage, candidates: stageCandidates }) => (
              <StageColumn
                key={stage.value}
                stage={stage}
                candidates={stageCandidates}
                selectedId={selectedId}
                isPending={isPending}
                onSelect={setSelectedId}
              />
            ))}
          </div>
        </div>
      </DndContext>

      {selectedCandidate ? (
        <div className="rounded-3xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                  <UserCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {selectedCandidate.candidate.fullName}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {selectedCandidate.candidate.currentPosition || "Chưa cập nhật vị trí"}
                    {selectedCandidate.candidate.currentCompany
                      ? ` • ${selectedCandidate.candidate.currentCompany}`
                      : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStageMeta(
                        selectedCandidate.stage
                      ).badgeClassName}`}
                    >
                      {getStageMeta(selectedCandidate.stage).label}
                    </span>
                    {selectedCandidate.result !== "PENDING" ? (
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getResultMeta(
                          selectedCandidate.result
                        ).className}`}
                      >
                        {getResultMeta(selectedCandidate.result).label}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedCandidate.stage}
                  disabled={isPending}
                  onChange={(event) => {
                    void onStageChange(
                      selectedCandidate.id,
                      event.target.value as JobCandidateStage
                    );
                  }}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                    onClick={() => {
                      void onStageChange(selectedCandidate.id, nextStage);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-surface disabled:opacity-60"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Chuyen sang {getStageMeta(nextStage).shortLabel}
                  </button>
                ) : null}

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    void onStageChange(selectedCandidate.id, "REJECTED", "REJECTED");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-danger/20 bg-danger/10 px-3 py-2 text-sm font-medium text-danger transition hover:bg-danger/15 disabled:opacity-60"
                >
                  <XCircle className="h-4 w-4" />
                  Tu choi
                </button>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    void onStageChange(selectedCandidate.id, "REJECTED", "WITHDRAWN");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-warning/20 bg-warning/10 px-3 py-2 text-sm font-medium text-warning transition hover:bg-warning/15 disabled:opacity-60"
                >
                  <UserX className="h-4 w-4" />
                  Rut lui
                </button>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    void handleRemove();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-muted transition hover:bg-danger/10 hover:text-danger disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  Go khoi job
                </button>
              </div>
            </div>
          </div>

          <PipelineDetailPanel
            key={selectedCandidate.id}
            jobCandidate={selectedCandidate}
            isPending={isPending}
            onSave={onPipelineSave}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-background px-6 py-8 text-center">
          <p className="text-sm font-medium text-foreground">
            Chọn một ứng viên để xem chi tiết pipeline.
          </p>
          <p className="mt-1 text-sm text-muted">
            Bạn có thể kéo thẻ sang cột mới hoặc nhấn vào thẻ để cập nhật interview, kết quả và ghi chú.
          </p>
        </div>
      )}
    </div>
  );
}
