"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Eye,
  FileText,
  GripVertical,
  Inbox,
  Loader2,
  Mail,
  Phone,
  Send,
  XCircle,
} from "lucide-react";
import {
  useMemo,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { updateApplicationPipelineStatusAction } from "@/lib/employer-actions";

type ApplicationStatusValue =
  | "NEW"
  | "REVIEWED"
  | "SHORTLISTED"
  | "REJECTED"
  | "IMPORTED";

type PipelineApplication = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  coverLetter: string | null;
  cvFileUrl: string | null;
  cvFileName: string | null;
  status: ApplicationStatusValue;
  createdAt: string;
  updatedAt: string;
  jobPosting: {
    id: number;
    title: string;
    slug: string;
    status: string;
  };
};

type PipelineJob = {
  id: number;
  title: string;
  status: string;
  applicationsCount: number;
};

const STAGES: Array<{
  value: ApplicationStatusValue;
  label: string;
  shortLabel: string;
  columnClassName: string;
  badgeClassName: string;
  icon: ElementType;
}> = [
  {
    value: "NEW",
    label: "Hồ sơ mới",
    shortLabel: "Mới",
    columnClassName: "border-blue-100 bg-blue-50/50",
    badgeClassName: "border-blue-100 bg-blue-100 text-blue-700",
    icon: Inbox,
  },
  {
    value: "REVIEWED",
    label: "Đã xem",
    shortLabel: "Đã xem",
    columnClassName: "border-slate-100 bg-slate-50/70",
    badgeClassName: "border-slate-200 bg-slate-100 text-slate-700",
    icon: Eye,
  },
  {
    value: "SHORTLISTED",
    label: "Shortlist",
    shortLabel: "Chọn",
    columnClassName: "border-teal-100 bg-teal-50/50",
    badgeClassName: "border-teal-100 bg-teal-100 text-teal-700",
    icon: CheckCircle2,
  },
  {
    value: "REJECTED",
    label: "Từ chối",
    shortLabel: "Từ chối",
    columnClassName: "border-red-100 bg-red-50/50",
    badgeClassName: "border-red-100 bg-red-100 text-red-700",
    icon: XCircle,
  },
  {
    value: "IMPORTED",
    label: "Đã import CRM",
    shortLabel: "CRM",
    columnClassName: "border-violet-100 bg-violet-50/50",
    badgeClassName: "border-violet-100 bg-violet-100 text-violet-700",
    icon: Send,
  },
];

const QUICK_ACTIONS: Array<{ status: ApplicationStatusValue; label: string }> = [
  { status: "REVIEWED", label: "Đã xem" },
  { status: "SHORTLISTED", label: "Shortlist" },
  { status: "REJECTED", label: "Từ chối" },
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function resolveStage(overId: string, applications: PipelineApplication[]) {
  const stage = STAGES.find((item) => item.value === overId);
  if (stage) return stage.value;

  const application = applications.find((item) => `app-${item.id}` === overId);
  return application?.status ?? null;
}

function getStageMeta(status: ApplicationStatusValue) {
  return STAGES.find((stage) => stage.value === status) ?? STAGES[0];
}

function StatusBadge({ status }: { status: ApplicationStatusValue }) {
  const meta = getStageMeta(status);
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.badgeClassName}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {meta.shortLabel}
    </span>
  );
}

function StatusSelect({
  value,
  disabled,
  onChange,
}: {
  value: ApplicationStatusValue;
  disabled: boolean;
  onChange: (status: ApplicationStatusValue) => void;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as ApplicationStatusValue)}
      className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs font-medium text-gray-700 outline-none transition focus:border-teal-500 disabled:cursor-wait disabled:opacity-60"
      aria-label="Cập nhật trạng thái hồ sơ"
    >
      {STAGES.map((stage) => (
        <option key={stage.value} value={stage.value}>
          {stage.label}
        </option>
      ))}
    </select>
  );
}

function ApplicationCard({
  application,
  isPending,
  isSelected,
  dragHandle,
  onSelect,
  onStatusChange,
}: {
  application: PipelineApplication;
  isPending: boolean;
  isSelected: boolean;
  dragHandle?: ReactNode;
  onSelect: (applicationId: number) => void;
  onStatusChange: (applicationId: number, status: ApplicationStatusValue) => void;
}) {
  const visibleActions = QUICK_ACTIONS.filter(
    (action) => action.status !== application.status
  );

  return (
    <article
      className={`rounded-xl border bg-white p-4 text-left shadow-sm transition ${
        isSelected
          ? "border-teal-300 ring-2 ring-teal-100"
          : "border-gray-100 hover:border-teal-200"
      } ${isPending ? "opacity-75" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="max-w-[220px] truncate text-sm font-semibold text-gray-900">
              {application.fullName}
            </p>
            <StatusBadge status={application.status} />
          </div>
          <Link
            href={`/employer/job-postings/${application.jobPosting.id}`}
            className="mt-1 line-clamp-2 text-xs font-medium text-teal-700 hover:underline"
          >
            {application.jobPosting.title}
          </Link>
        </div>
        {dragHandle}
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-gray-500">
        <p className="flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{application.email}</span>
        </p>
        {application.phone ? (
          <p className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{application.phone}</span>
          </p>
        ) : null}
        <p className="flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5 shrink-0" />
          Nộp ngày {formatDate(application.createdAt)}
        </p>
      </div>

      {application.coverLetter ? (
        <p className="mt-3 line-clamp-3 rounded-lg bg-gray-50 px-3 py-2 text-xs leading-5 text-gray-600">
          {application.coverLetter}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onSelect(application.id)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-teal-200 hover:text-teal-700"
        >
          Xem hồ sơ
        </button>
        {application.cvFileUrl ? (
          <a
            href={application.cvFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-teal-700 transition hover:border-teal-200"
          >
            <FileText className="h-3.5 w-3.5" />
            CV
          </a>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
        <StatusSelect
          value={application.status}
          disabled={isPending}
          onChange={(status) => onStatusChange(application.id, status)}
        />
        {visibleActions.slice(0, 2).map((action) => (
          <button
            key={action.status}
            type="button"
            disabled={isPending}
            onClick={() => onStatusChange(application.id, action.status)}
            className="rounded-lg bg-gray-50 px-2.5 py-2 text-xs font-semibold text-gray-700 transition hover:bg-teal-50 hover:text-teal-700 disabled:cursor-wait disabled:opacity-60"
          >
            {action.label}
          </button>
        ))}
        {isPending ? <Loader2 className="h-4 w-4 animate-spin text-teal-600" /> : null}
      </div>
    </article>
  );
}

function SortableApplicationCard({
  application,
  isPending,
  isSelected,
  onSelect,
  onStatusChange,
}: {
  application: PipelineApplication;
  isPending: boolean;
  isSelected: boolean;
  onSelect: (applicationId: number) => void;
  onStatusChange: (applicationId: number, status: ApplicationStatusValue) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: `app-${application.id}`,
      disabled: isPending,
    });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={isDragging ? "opacity-70" : undefined}
    >
      <ApplicationCard
        application={application}
        isPending={isPending}
        isSelected={isSelected}
        onSelect={onSelect}
        onStatusChange={onStatusChange}
        dragHandle={
          <button
            type="button"
            disabled={isPending}
            className="touch-none rounded-lg p-1 text-gray-400 transition hover:bg-gray-50 hover:text-gray-700 disabled:cursor-wait disabled:opacity-40"
            aria-label="Kéo hồ sơ sang cột khác"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        }
      />
    </div>
  );
}

function StageColumn({
  stage,
  applications,
  pendingApplicationIds,
  selectedApplicationId,
  onSelect,
  onStatusChange,
}: {
  stage: (typeof STAGES)[number];
  applications: PipelineApplication[];
  pendingApplicationIds: Set<number>;
  selectedApplicationId: number | null;
  onSelect: (applicationId: number) => void;
  onStatusChange: (applicationId: number, status: ApplicationStatusValue) => void;
}) {
  const { setNodeRef } = useDroppable({ id: stage.value });

  return (
    <section
      ref={setNodeRef}
      className={`flex min-h-[520px] min-w-[310px] flex-col rounded-xl border p-4 ${stage.columnClassName}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{stage.label}</h2>
          <p className="text-xs text-gray-500">{applications.length} ứng viên</p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${stage.badgeClassName}`}>
          {stage.shortLabel}
        </span>
      </div>

      <div className="mt-4 flex-1 space-y-3">
        <SortableContext
          items={applications.map((application) => `app-${application.id}`)}
          strategy={verticalListSortingStrategy}
        >
          {applications.length === 0 ? (
            <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white/60 px-4 text-center text-sm text-gray-400">
              Chưa có hồ sơ
            </div>
          ) : (
            applications.map((application) => (
              <SortableApplicationCard
                key={application.id}
                application={application}
                isPending={pendingApplicationIds.has(application.id)}
                isSelected={selectedApplicationId === application.id}
                onSelect={onSelect}
                onStatusChange={onStatusChange}
              />
            ))
          )}
        </SortableContext>
      </div>
    </section>
  );
}

function ApplicationDetailPanel({
  application,
  isPending,
  onStatusChange,
}: {
  application: PipelineApplication | null;
  isPending: boolean;
  onStatusChange: (applicationId: number, status: ApplicationStatusValue) => void;
}) {
  if (!application) {
    return (
      <aside className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
        <Inbox className="mx-auto mb-3 h-8 w-8 text-gray-300" />
        Chọn một hồ sơ để xem nhanh thông tin ứng viên.
      </aside>
    );
  }

  return (
    <aside className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-gray-400">Preview hồ sơ</p>
          <h2 className="mt-1 truncate text-lg font-bold text-gray-900">
            {application.fullName}
          </h2>
          <Link
            href={`/employer/job-postings/${application.jobPosting.id}`}
            className="mt-1 block truncate text-sm font-medium text-teal-700 hover:underline"
          >
            {application.jobPosting.title}
          </Link>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="mt-5 space-y-3 text-sm text-gray-600">
        <p className="flex items-center gap-2">
          <Mail className="h-4 w-4 shrink-0 text-gray-400" />
          <span className="truncate">{application.email}</span>
        </p>
        {application.phone ? (
          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0 text-gray-400" />
            <span className="truncate">{application.phone}</span>
          </p>
        ) : null}
        <p className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 shrink-0 text-gray-400" />
          Nộp ngày {formatDate(application.createdAt)}
        </p>
      </div>

      {application.coverLetter ? (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase text-gray-400">Thư ứng tuyển</p>
          <p className="mt-2 max-h-48 overflow-y-auto rounded-lg bg-gray-50 px-3 py-2 text-sm leading-6 text-gray-700">
            {application.coverLetter}
          </p>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {application.cvFileUrl ? (
          <a
            href={application.cvFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            <FileText className="h-4 w-4" />
            Xem CV
          </a>
        ) : null}
        <Link
          href={`/employer/job-postings/${application.jobPosting.id}`}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-teal-200 hover:text-teal-700"
        >
          Mở tin tuyển dụng
        </Link>
      </div>

      <div className="mt-5 border-t border-gray-100 pt-4">
        <p className="text-xs font-semibold uppercase text-gray-400">Cập nhật trạng thái</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {STAGES.map((stage) => (
            <button
              key={stage.value}
              type="button"
              disabled={isPending || application.status === stage.value}
              onClick={() => onStatusChange(application.id, stage.value)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:cursor-default ${
                application.status === stage.value
                  ? stage.badgeClassName
                  : "border-gray-200 bg-white text-gray-700 hover:border-teal-200 hover:text-teal-700"
              } ${isPending ? "opacity-60" : ""}`}
            >
              {stage.shortLabel}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function EmployerPipelineBoard({
  initialApplications,
  jobs,
  selectedJobId,
}: {
  initialApplications: PipelineApplication[];
  jobs: PipelineJob[];
  selectedJobId: number | null;
}) {
  const router = useRouter();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } })
  );
  const [applications, setApplications] = useState(initialApplications);
  const [pendingApplicationIds, setPendingApplicationIds] = useState<Set<number>>(
    () => new Set()
  );
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(
    initialApplications[0]?.id ?? null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const grouped = useMemo(
    () =>
      STAGES.map((stage) => ({
        stage,
        applications: applications.filter((application) => application.status === stage.value),
      })),
    [applications]
  );

  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? null;
  const selectedApplication =
    applications.find((application) => application.id === selectedApplicationId) ??
    applications[0] ??
    null;

  function handleJobChange(jobId: string) {
    if (!jobId) {
      router.push("/employer/pipeline");
      return;
    }

    router.push(`/employer/pipeline?job=${jobId}`);
  }

  async function commitStatusChange(
    applicationId: number,
    nextStatus: ApplicationStatusValue
  ) {
    const currentApplication = applications.find(
      (application) => application.id === applicationId
    );

    if (
      !currentApplication ||
      currentApplication.status === nextStatus ||
      pendingApplicationIds.has(applicationId)
    ) {
      return;
    }

    const previousStatus = currentApplication.status;
    setErrorMessage(null);
    setPendingApplicationIds((current) => {
      const next = new Set(current);
      next.add(applicationId);
      return next;
    });
    setApplications((current) =>
      current.map((application) =>
        application.id === applicationId
          ? { ...application, status: nextStatus, updatedAt: new Date().toISOString() }
          : application
      )
    );

    const result = await updateApplicationPipelineStatusAction(applicationId, nextStatus);

    if (!result.success) {
      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId
            ? { ...application, status: previousStatus }
            : application
        )
      );
      setErrorMessage(result.message ?? "Không thể cập nhật pipeline.");
    }

    setPendingApplicationIds((current) => {
      const next = new Set(current);
      next.delete(applicationId);
      return next;
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    if (!event.over) return;

    const activeId = String(event.active.id);
    const overId = String(event.over.id);
    const applicationId = Number(activeId.replace("app-", ""));
    const nextStatus = resolveStage(overId, applications);

    if (!Number.isInteger(applicationId) || !nextStatus) {
      return;
    }

    await commitStatusChange(applicationId, nextStatus);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-gray-900">Tin tuyển dụng đang xử lý</p>
            <p className="mt-1 text-xs text-gray-500">
              Chọn một tin để mở Kanban. Các thao tác chính có thể làm bằng nút hoặc dropdown, không bắt buộc kéo thả.
            </p>
          </div>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-400">
              Lọc theo tin
            </span>
            <select
              value={selectedJobId ?? ""}
              onChange={(event) => handleJobChange(event.target.value)}
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 outline-none transition focus:border-teal-500"
            >
              <option value="">Chọn tin tuyển dụng</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} ({job.applicationsCount})
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {errorMessage ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      {!selectedJobId ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6">
          <div className="max-w-2xl">
            <p className="text-base font-semibold text-gray-900">
              Chọn một tin tuyển dụng để mở pipeline
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Board chỉ tải hồ sơ của một tin tại một thời điểm để tránh lag và tránh các tag trùng tên gây nhiễu.
            </p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {jobs.length === 0 ? (
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-5 text-sm text-gray-500">
                Chưa có tin tuyển dụng nào.
              </div>
            ) : (
              jobs.slice(0, 9).map((job) => (
                <Link
                  key={job.id}
                  href={`/employer/pipeline?job=${job.id}`}
                  className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 transition hover:border-teal-200 hover:bg-teal-50/50"
                >
                  <p className="line-clamp-2 text-sm font-semibold text-gray-900">
                    {job.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {job.applicationsCount} hồ sơ • {job.status}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-sm font-semibold text-gray-800">
            Chưa có ứng viên trong pipeline này.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {selectedJob
              ? `Tin "${selectedJob.title}" chưa có hồ sơ ứng tuyển.`
              : "Tin tuyển dụng đã chọn không có hồ sơ hoặc không còn tồn tại."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedJob?.title ?? "Pipeline tuyển dụng"}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {applications.length} hồ sơ trong tin này
                  </p>
                </div>
                <span className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600">
                  Kanban theo tin
                </span>
              </div>
            </div>

            <div className="lg:hidden">
              <div className="space-y-3">
                {applications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    isPending={pendingApplicationIds.has(application.id)}
                    isSelected={selectedApplicationId === application.id}
                    onSelect={setSelectedApplicationId}
                    onStatusChange={commitStatusChange}
                  />
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <div className="overflow-x-auto pb-2">
                  <div className="flex min-w-max gap-4">
                    {grouped.map(({ stage, applications: stageApplications }) => (
                      <StageColumn
                        key={stage.value}
                        stage={stage}
                        applications={stageApplications}
                        pendingApplicationIds={pendingApplicationIds}
                        selectedApplicationId={selectedApplicationId}
                        onSelect={setSelectedApplicationId}
                        onStatusChange={commitStatusChange}
                      />
                    ))}
                  </div>
                </div>
              </DndContext>
            </div>
          </div>

          <div className="xl:sticky xl:top-24 xl:self-start">
            <ApplicationDetailPanel
              application={selectedApplication}
              isPending={
                selectedApplication
                  ? pendingApplicationIds.has(selectedApplication.id)
                  : false
              }
              onStatusChange={commitStatusChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
