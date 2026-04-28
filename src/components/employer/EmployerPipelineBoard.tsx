"use client";

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
  AlertCircle,
  Briefcase,
  FileText,
  GripVertical,
  Mail,
  Phone,
} from "lucide-react";
import { useMemo, useState } from "react";
import { updateApplicationPipelineStatusAction } from "@/lib/employer-actions";

type ApplicationStatusValue = "NEW" | "REVIEWED" | "SHORTLISTED" | "REJECTED" | "IMPORTED";

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
}> = [
  {
    value: "NEW",
    label: "Hồ sơ mới",
    shortLabel: "Mới",
    columnClassName: "border-blue-100 bg-blue-50/60",
    badgeClassName: "bg-blue-100 text-blue-700",
  },
  {
    value: "REVIEWED",
    label: "Đã xem",
    shortLabel: "Đã xem",
    columnClassName: "border-slate-100 bg-slate-50/70",
    badgeClassName: "bg-slate-100 text-slate-700",
  },
  {
    value: "SHORTLISTED",
    label: "Shortlist",
    shortLabel: "Chọn",
    columnClassName: "border-teal-100 bg-teal-50/60",
    badgeClassName: "bg-teal-100 text-teal-700",
  },
  {
    value: "REJECTED",
    label: "Từ chối",
    shortLabel: "Từ chối",
    columnClassName: "border-red-100 bg-red-50/50",
    badgeClassName: "bg-red-100 text-red-700",
  },
  {
    value: "IMPORTED",
    label: "Đã import CRM",
    shortLabel: "CRM",
    columnClassName: "border-violet-100 bg-violet-50/50",
    badgeClassName: "bg-violet-100 text-violet-700",
  },
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

function ApplicationCard({
  application,
  isPending,
}: {
  application: PipelineApplication;
  isPending: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: `app-${application.id}`,
      disabled: isPending,
    });

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:border-teal-200 ${
        isDragging ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">{application.fullName}</p>
          <Link
            href={`/employer/job-postings/${application.jobPosting.id}`}
            className="mt-1 line-clamp-2 text-xs font-medium text-teal-700 hover:underline"
          >
            {application.jobPosting.title}
          </Link>
        </div>
        <button
          type="button"
          className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-50 hover:text-gray-700"
          aria-label="Di chuyển hồ sơ"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-gray-500">
        <p className="flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5" />
          <span className="truncate">{application.email}</span>
        </p>
        {application.phone ? (
          <p className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" />
            {application.phone}
          </p>
        ) : null}
        <p className="flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5" />
          Nộp ngày {formatDate(application.createdAt)}
        </p>
      </div>

      {application.coverLetter ? (
        <p className="mt-3 line-clamp-3 rounded-xl bg-gray-50 px-3 py-2 text-xs leading-5 text-gray-600">
          {application.coverLetter}
        </p>
      ) : null}

      {application.cvFileUrl ? (
        <a
          href={application.cvFileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline"
        >
          <FileText className="h-3.5 w-3.5" />
          {application.cvFileName || "Xem CV"}
        </a>
      ) : null}
    </article>
  );
}

function StageColumn({
  stage,
  applications,
  isPending,
}: {
  stage: (typeof STAGES)[number];
  applications: PipelineApplication[];
  isPending: boolean;
}) {
  const { setNodeRef } = useDroppable({ id: stage.value });

  return (
    <section
      ref={setNodeRef}
      className={`flex min-h-[520px] min-w-[280px] flex-col rounded-2xl border p-4 ${stage.columnClassName}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{stage.label}</h2>
          <p className="text-xs text-gray-500">{applications.length} ứng viên</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${stage.badgeClassName}`}>
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
              <ApplicationCard
                key={application.id}
                application={application}
                isPending={isPending}
              />
            ))
          )}
        </SortableContext>
      </div>
    </section>
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
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [applications, setApplications] = useState(initialApplications);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const grouped = useMemo(
    () =>
      STAGES.map((stage) => ({
        stage,
        applications: applications.filter((application) => application.status === stage.value),
      })),
    [applications]
  );

  async function handleDragEnd(event: DragEndEvent) {
    if (!event.over) return;

    const activeId = String(event.active.id);
    const overId = String(event.over.id);
    const applicationId = Number(activeId.replace("app-", ""));
    const currentApplication = applications.find((application) => application.id === applicationId);
    const nextStatus = resolveStage(overId, applications);

    if (!currentApplication || !nextStatus || nextStatus === currentApplication.status) {
      return;
    }

    const previousApplications = applications;
    setApplications((current) =>
      current.map((application) =>
        application.id === applicationId ? { ...application, status: nextStatus } : application
      )
    );
    setIsPending(true);

    const result = await updateApplicationPipelineStatusAction(applicationId, nextStatus);
    if (!result.success) {
      setApplications(previousApplications);
      setErrorMessage(result.message ?? "Không thể cập nhật pipeline.");
      setIsPending(false);
      return;
    }

    setErrorMessage(null);
    setIsPending(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Lọc theo tin tuyển dụng</p>
          <p className="mt-0.5 text-xs text-gray-500">
            Kéo hồ sơ giữa các cột để cập nhật trạng thái tuyển dụng.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/employer/pipeline"
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              selectedJobId === null
                ? "bg-teal-600 text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:text-teal-700"
            }`}
          >
            Tất cả
          </Link>
          {jobs.slice(0, 12).map((job) => (
            <Link
              key={job.id}
              href={`/employer/pipeline?job=${job.id}`}
              className={`max-w-[240px] truncate rounded-lg px-3 py-2 text-sm font-semibold transition ${
                selectedJobId === job.id
                  ? "bg-teal-600 text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:text-teal-700"
              }`}
              title={job.title}
            >
              {job.title} ({job.applicationsCount})
            </Link>
          ))}
        </div>
      </div>

      {errorMessage ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      {applications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
          <p className="text-sm font-semibold text-gray-800">Chưa có ứng viên trong pipeline này.</p>
          <p className="mt-1 text-sm text-gray-500">
            Khi có hồ sơ ứng tuyển, ứng viên sẽ xuất hiện tại đây để bạn phân loại.
          </p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-max gap-4">
              {grouped.map(({ stage, applications: stageApplications }) => (
                <StageColumn
                  key={stage.value}
                  stage={stage}
                  applications={stageApplications}
                  isPending={isPending}
                />
              ))}
            </div>
          </div>
        </DndContext>
      )}
    </div>
  );
}
