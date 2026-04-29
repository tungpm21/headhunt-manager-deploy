"use client";
/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
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
  Columns3,
  GripVertical,
  ListChecks,
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
  PIPELINE_RESULTS,
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

type PipelineView = "list" | "kanban";

function toDateInputValue(value: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function QuickStageActions({
  jobCandidate,
  isPending,
  onStageChange,
}: {
  jobCandidate: SerializedJobCandidateWithRelations;
  isPending: boolean;
  onStageChange: (
    jobCandidateId: number,
    stage: JobCandidateStage,
    resultOverride?: SubmissionResult
  ) => Promise<boolean>;
}) {
  const nextStage = getNextStage(jobCandidate.stage);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {nextStage ? (
        <button
          type="button"
          disabled={isPending}
          onClick={(event) => {
            event.stopPropagation();
            void onStageChange(jobCandidate.id, nextStage);
          }}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-background px-2 text-xs font-semibold text-foreground transition hover:bg-surface disabled:opacity-60"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          {getStageMeta(nextStage).shortLabel}
        </button>
      ) : null}
      <button
        type="button"
        disabled={isPending}
        onClick={(event) => {
          event.stopPropagation();
          void onStageChange(jobCandidate.id, "REJECTED", "REJECTED");
        }}
        className="inline-flex h-8 items-center gap-1 rounded-lg border border-danger/20 bg-danger/10 px-2 text-xs font-semibold text-danger transition hover:bg-danger/15 disabled:opacity-60"
      >
        <XCircle className="h-3.5 w-3.5" />
        Từ chối
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={(event) => {
          event.stopPropagation();
          void onStageChange(jobCandidate.id, "REJECTED", "WITHDRAWN");
        }}
        className="inline-flex h-8 items-center gap-1 rounded-lg border border-warning/20 bg-warning/10 px-2 text-xs font-semibold text-warning transition hover:bg-warning/15 disabled:opacity-60"
      >
        <UserX className="h-3.5 w-3.5" />
        Rút
      </button>
    </div>
  );
}

function SortableCandidateCard({
  jobCandidate,
  isPending,
  isSelected,
  onSelect,
  onStageChange,
}: {
  jobCandidate: SerializedJobCandidateWithRelations;
  isPending: boolean;
  isSelected: boolean;
  onSelect: (jobCandidateId: number) => void;
  onStageChange: (
    jobCandidateId: number,
    stage: JobCandidateStage,
    resultOverride?: SubmissionResult
  ) => Promise<boolean>;
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
      className={`rounded-xl border border-border bg-background p-3 text-left shadow-sm transition ${
        isSelected ? "ring-2 ring-primary/30" : "hover:border-primary/30 hover:bg-surface"
      } ${isDragging ? "scale-[0.98] opacity-25 blur-[1px]" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/candidates/${jobCandidate.candidate.id}`}
            onClick={(event) => event.stopPropagation()}
            className="block truncate text-sm font-semibold text-foreground transition hover:text-primary"
          >
            {jobCandidate.candidate.fullName}
          </Link>
          <p className="mt-1 line-clamp-2 text-xs text-muted">
            {jobCandidate.candidate.currentPosition || "Chưa cập nhật vị trí"}
            {jobCandidate.candidate.currentCompany
              ? ` · ${jobCandidate.candidate.currentCompany}`
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

      <div className="mt-3 flex flex-wrap gap-1.5">
        {jobCandidate.candidate.level ? (
          <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            {jobCandidate.candidate.level}
          </span>
        ) : null}

        {jobCandidate.result !== "PENDING" ? (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${resultMeta.className}`}
          >
            {resultMeta.label}
          </span>
        ) : null}

        {jobCandidate.interviewDate ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[11px] text-muted">
            <Calendar className="h-3 w-3" />
            {formatPipelineDate(jobCandidate.interviewDate)}
          </span>
        ) : null}
      </div>

      {jobCandidate.candidate.skills.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {jobCandidate.candidate.skills.slice(0, 3).map((skill: string) => (
            <span
              key={skill}
              className="rounded-full bg-surface px-2 py-0.5 text-[11px] text-muted"
            >
              {skill}
            </span>
          ))}
          {jobCandidate.candidate.skills.length > 3 ? (
            <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] text-muted">
              +{jobCandidate.candidate.skills.length - 3}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3">
        <QuickStageActions
          jobCandidate={jobCandidate}
          isPending={isPending}
          onStageChange={onStageChange}
        />
      </div>
    </div>
  );
}

function CandidateDragPreview({
  jobCandidate,
}: {
  jobCandidate: SerializedJobCandidateWithRelations;
}) {
  const stageMeta = getStageMeta(jobCandidate.stage);

  return (
    <div className="w-[276px] rounded-2xl border border-primary/30 bg-surface p-3 text-left shadow-2xl ring-4 ring-primary/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {jobCandidate.candidate.fullName}
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-muted">
            {jobCandidate.candidate.currentPosition || "Chưa cập nhật vị trí"}
            {jobCandidate.candidate.currentCompany
              ? ` · ${jobCandidate.candidate.currentCompany}`
              : ""}
          </p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${stageMeta.badgeClassName}`}>
          {stageMeta.shortLabel}
        </span>
      </div>
      <div className="mt-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary">
        Kéo sang cột mới để chuyển trạng thái
      </div>
    </div>
  );
}

function StageColumn({
  stage,
  candidates,
  isDragTarget,
  selectedId,
  isPending,
  onSelect,
  onStageChange,
}: {
  stage: (typeof PIPELINE_STAGES)[number];
  candidates: SerializedJobCandidateWithRelations[];
  isDragTarget: boolean;
  selectedId: number | null;
  isPending: boolean;
  onSelect: (jobCandidateId: number) => void;
  onStageChange: (
    jobCandidateId: number,
    stage: JobCandidateStage,
    resultOverride?: SubmissionResult
  ) => Promise<boolean>;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.value });
  const showDropHint = isDragTarget || isOver;

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[440px] max-h-[620px] min-w-[276px] flex-col rounded-2xl border transition ${
        showDropHint ? "scale-[1.01] ring-2 ring-primary/35" : ""
      } ${stage.columnClassName}`}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 rounded-t-2xl border-b border-border/70 bg-inherit px-3 py-3 backdrop-blur">
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

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {showDropHint ? (
          <div className="mb-3 rounded-xl border border-dashed border-primary/40 bg-primary/10 px-3 py-2 text-center text-xs font-semibold text-primary shadow-sm animate-pulse">
            Chuyển sang đây
          </div>
        ) : null}
        <SortableContext
          items={candidates.map((candidate) => `jc-${candidate.id}`)}
          strategy={verticalListSortingStrategy}
        >
          {candidates.length === 0 ? (
            <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-border bg-background/70 text-sm text-muted">
              Chưa có ứng viên
            </div>
          ) : (
            <div className="space-y-3">
              {candidates.map((candidate) => (
                <SortableCandidateCard
                  key={candidate.id}
                  jobCandidate={candidate}
                  isPending={isPending}
                  isSelected={selectedId === candidate.id}
                  onSelect={onSelect}
                  onStageChange={onStageChange}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}

function PipelineList({
  candidates,
  selectedId,
  isPending,
  onSelect,
  onStageChange,
  onPipelineSave,
}: {
  candidates: SerializedJobCandidateWithRelations[];
  selectedId: number | null;
  isPending: boolean;
  onSelect: (jobCandidateId: number) => void;
  onStageChange: (
    jobCandidateId: number,
    stage: JobCandidateStage,
    resultOverride?: SubmissionResult
  ) => Promise<boolean>;
  onPipelineSave: (
    jobCandidateId: number,
    data: PipelineSaveInput
  ) => Promise<boolean>;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] text-sm">
          <thead className="border-b border-border bg-background text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Ứng viên</th>
              <th className="px-4 py-3 text-left font-semibold">Stage</th>
              <th className="px-4 py-3 text-left font-semibold">Kết quả</th>
              <th className="px-4 py-3 text-left font-semibold">Lịch phỏng vấn</th>
              <th className="px-4 py-3 text-left font-semibold">Thông tin nhanh</th>
              <th className="px-4 py-3 text-right font-semibold">Chuyển nhanh</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {candidates.map((candidate) => {
              const stageMeta = getStageMeta(candidate.stage);
              const resultMeta = getResultMeta(candidate.result);

              return (
                <tr
                  key={candidate.id}
                  className={`cursor-pointer transition hover:bg-background/70 ${
                    selectedId === candidate.id ? "bg-primary/5" : ""
                  }`}
                  onClick={() => onSelect(candidate.id)}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/candidates/${candidate.candidate.id}`}
                      onClick={(event) => event.stopPropagation()}
                      className="font-semibold text-foreground transition hover:text-primary"
                    >
                      {candidate.candidate.fullName}
                    </Link>
                    <p className="mt-1 max-w-[260px] truncate text-xs text-muted">
                      {candidate.candidate.currentPosition || "Chưa cập nhật vị trí"}
                      {candidate.candidate.currentCompany
                        ? ` · ${candidate.candidate.currentCompany}`
                        : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={candidate.stage}
                      disabled={isPending}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => {
                        void onStageChange(
                          candidate.id,
                          event.target.value as JobCandidateStage
                        );
                      }}
                      className={`h-9 rounded-lg border border-border px-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/25 disabled:opacity-60 ${stageMeta.badgeClassName}`}
                    >
                      {PIPELINE_STAGES.map((stage) => (
                        <option key={stage.value} value={stage.value}>
                          {stage.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={candidate.result}
                      disabled={isPending}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => {
                        void onPipelineSave(candidate.id, {
                          result: event.target.value as SubmissionResult,
                          interviewDate: candidate.interviewDate,
                          notes: candidate.notes ?? null,
                        });
                      }}
                      className={`h-9 rounded-lg border border-border px-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/25 disabled:opacity-60 ${resultMeta.className}`}
                    >
                      {PIPELINE_RESULTS.map((result) => (
                        <option key={result.value} value={result.value}>
                          {result.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="date"
                      value={toDateInputValue(candidate.interviewDate)}
                      disabled={isPending}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => {
                        void onPipelineSave(candidate.id, {
                          result: candidate.result,
                          interviewDate: event.target.value || null,
                          notes: candidate.notes ?? null,
                        });
                      }}
                      className="h-9 rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/25 disabled:opacity-60"
                    />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    <div className="max-w-[260px] truncate">
                      {candidate.candidate.email || candidate.candidate.phone || "Chưa có liên hệ"}
                    </div>
                    {candidate.candidate.skills.length > 0 ? (
                      <div className="mt-1 truncate">
                        {candidate.candidate.skills.slice(0, 4).join(", ")}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end">
                      <QuickStageActions
                        jobCandidate={candidate}
                        isPending={isPending}
                        onStageChange={onStageChange}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
  const [view, setView] = useState<PipelineView>("list");
  const [activeDragId, setActiveDragId] = useState<number | null>(null);
  const [overStage, setOverStage] = useState<JobCandidateStage | null>(null);

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
  const activeDragCandidate =
    candidates.find((candidate) => candidate.id === activeDragId) ?? null;
  const nextStage = selectedCandidate ? getNextStage(selectedCandidate.stage) : null;

  const resolveStageFromOverId = (overId: string) => {
    const matchedStage = PIPELINE_STAGES.find((stage) => stage.value === overId);
    if (matchedStage) {
      return matchedStage.value;
    }

    const matchedCandidate = candidates.find((candidate) => `jc-${candidate.id}` === overId);
    return matchedCandidate?.stage ?? null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const jobCandidateId = Number(String(event.active.id).replace("jc-", ""));
    setActiveDragId(Number.isFinite(jobCandidateId) ? jobCandidateId : null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (!event.over) {
      setOverStage(null);
      return;
    }

    setOverStage(resolveStageFromOverId(String(event.over.id)));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragId(null);
    setOverStage(null);

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
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Chế độ xem pipeline</p>
          <p className="mt-0.5 text-xs text-muted">
            List phù hợp để rà soát nhanh; Kanban dùng khi cần kéo thả.
          </p>
        </div>
        <div className="inline-flex rounded-xl border border-border bg-background p-1">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${
              view === "list" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            <ListChecks className="h-4 w-4" />
            List
          </button>
          <button
            type="button"
            onClick={() => setView("kanban")}
            className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${
              view === "kanban" ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            <Columns3 className="h-4 w-4" />
            Kanban
          </button>
        </div>
      </div>

      {view === "list" ? (
        <PipelineList
          candidates={candidates}
          selectedId={selectedId}
          isPending={isPending}
          onSelect={setSelectedId}
          onStageChange={onStageChange}
          onPipelineSave={onPipelineSave}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={() => {
            setActiveDragId(null);
            setOverStage(null);
          }}
        >
          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-max gap-4">
              {groupedCandidates.map(({ stage, candidates: stageCandidates }) => (
                <StageColumn
                  key={stage.value}
                  stage={stage}
                  candidates={stageCandidates}
                  isDragTarget={overStage === stage.value && activeDragId !== null}
                  selectedId={selectedId}
                  isPending={isPending}
                  onSelect={setSelectedId}
                  onStageChange={onStageChange}
                />
              ))}
            </div>
          </div>
          <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.2, 0, 0, 1)" }}>
            {activeDragCandidate ? (
              <CandidateDragPreview jobCandidate={activeDragCandidate} />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

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
                      ? ` · ${selectedCandidate.candidate.currentCompany}`
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
                    Chuyển sang {getStageMeta(nextStage).shortLabel}
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
                  Từ chối
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
                  Rút lui
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
                  Gỡ khỏi job
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
            Dùng list để cập nhật nhanh hoặc chuyển sang Kanban khi cần kéo thả.
          </p>
        </div>
      )}
    </div>
  );
}
