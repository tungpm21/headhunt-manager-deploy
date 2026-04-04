"use client";

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
import { Calendar, GripVertical, UserCircle } from "lucide-react";
import { useMemo, useState } from "react";
import {
  JobCandidateStage,
  SerializedJobCandidateWithRelations,
} from "@/types/job";
import {
  formatPipelineDate,
  getResultMeta,
  getStageMeta,
  PIPELINE_STAGES,
} from "@/lib/job-pipeline";
import { PipelineDetailPanel } from "@/components/jobs/pipeline-detail-panel";

type PipelineSaveInput = {
  result: SerializedJobCandidateWithRelations["result"];
  interviewDate: string | null;
  notes: string | null;
};

function SortableCard({
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

  const stageMeta = getStageMeta(jobCandidate.stage);
  const resultMeta = getResultMeta(jobCandidate.result);

  return (
    <button
      type="button"
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`w-full rounded-xl border border-border bg-surface p-4 text-left shadow-sm transition ${
        isSelected ? "ring-2 ring-primary/30" : "hover:border-primary/30 hover:bg-background"
      } ${isDragging ? "opacity-70" : ""}`}
      onClick={() => onSelect(jobCandidate.id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {jobCandidate.candidate.fullName}
          </p>
          <p className="mt-1 text-xs text-muted">
            {jobCandidate.candidate.currentPosition || "Chưa rõ vị trí"}
          </p>
        </div>
        <span
          className="mt-0.5 cursor-grab rounded-lg p-1 text-muted hover:bg-background"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${stageMeta.badgeClassName}`}
        >
          {stageMeta.shortLabel}
        </span>
        {jobCandidate.result !== "PENDING" ? (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${resultMeta.className}`}
          >
            {resultMeta.label}
          </span>
        ) : null}
      </div>

      {jobCandidate.interviewDate ? (
        <p className="mt-3 flex items-center gap-1 text-xs text-muted">
          <Calendar className="h-3.5 w-3.5" />
          {formatPipelineDate(jobCandidate.interviewDate)}
        </p>
      ) : null}
    </button>
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
      className={`flex min-h-[420px] min-w-[260px] flex-col rounded-2xl border p-4 ${stage.columnClassName}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{stage.label}</p>
          <p className="text-xs text-muted">{candidates.length} ứng viên</p>
        </div>
      </div>

      <div className="mt-4 flex-1 space-y-3">
        <SortableContext
          items={candidates.map((candidate) => `jc-${candidate.id}`)}
          strategy={verticalListSortingStrategy}
        >
          {candidates.length === 0 ? (
            <div className="flex h-full min-h-[180px] items-center justify-center rounded-xl border border-dashed border-border bg-surface/70 text-sm text-muted">
              Chưa có ứng viên
            </div>
          ) : (
            candidates.map((candidate) => (
              <SortableCard
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

export function PipelineKanban({
  candidates,
  isPending,
  onStageChange,
  onPipelineSave,
}: {
  candidates: SerializedJobCandidateWithRelations[];
  isPending: boolean;
  onStageChange: (
    jobCandidateId: number,
    stage: JobCandidateStage,
    resultOverride?: SerializedJobCandidateWithRelations["result"]
  ) => Promise<boolean>;
  onPipelineSave: (
    jobCandidateId: number,
    data: PipelineSaveInput
  ) => Promise<boolean>;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const grouped = useMemo(() => {
    return PIPELINE_STAGES.map((stage) => ({
      stage,
      candidates: candidates.filter((candidate) => candidate.stage === stage.value),
    }));
  }, [candidates]);

  const selectedCandidate =
    candidates.find((candidate) => candidate.id === selectedId) ?? null;

  const resolveStageFromOverId = (overId: string) => {
    const matchedStage = PIPELINE_STAGES.find((stage) => stage.value === overId);
    if (matchedStage) {
      return matchedStage.value;
    }

    const matchedCandidate = candidates.find((candidate) => `jc-${candidate.id}` === overId);
    return matchedCandidate?.stage ?? null;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!event.over) return;

    const activeId = String(event.active.id);
    const overId = String(event.over.id);
    const jobCandidateId = Number(activeId.replace("jc-", ""));
    const currentCandidate = candidates.find((candidate) => candidate.id === jobCandidateId);
    const nextStage = resolveStageFromOverId(overId);

    if (!currentCandidate || !nextStage || nextStage === currentCandidate.stage) {
      return;
    }

    await onStageChange(jobCandidateId, nextStage);
  };

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max gap-4">
            {grouped.map(({ stage, candidates: stageCandidates }) => (
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
        <div className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <UserCircle className="h-4 w-4 text-muted" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {selectedCandidate.candidate.fullName}
              </p>
              <p className="text-xs text-muted">
                Cập nhật interview date, kết quả và ghi chú
              </p>
            </div>
          </div>
          <PipelineDetailPanel
            key={selectedCandidate.id}
            jobCandidate={selectedCandidate}
            isPending={isPending}
            onSave={onPipelineSave}
          />
        </div>
      ) : null}
    </div>
  );
}
