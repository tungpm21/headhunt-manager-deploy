"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Loader2,
  Pause,
  Play,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import type { JobPostingLinkState } from "@/lib/moderation";
import {
  bulkAdminJobPostingModeration,
  linkAdminJobPostingJobOrder,
  updateAdminJobPostingStatus,
} from "@/lib/admin-job-posting-actions";
import { JobPostingModerationActions } from "@/components/jobs/job-posting-moderation-actions";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đang public" },
  { value: "PAUSED", label: "Tạm ẩn" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "EXPIRED", label: "Hết hạn" },
  { value: "DRAFT", label: "Nháp" },
];

const LINK_OPTIONS: Array<{ value: JobPostingLinkState; label: string }> = [
  { value: "ALL", label: "Tất cả liên kết" },
  { value: "LINKED", label: "Đã link JobOrder" },
  { value: "UNLINKED", label: "Chưa link CRM" },
];

const QUICK_STATUS_OPTIONS = STATUS_OPTIONS.filter((option) => option.value !== "ALL");
const PAGE_SIZE_OPTIONS = [25, 50, 100];

const STATUS_CONFIG: Record<string, { label: string; className: string; dot: string }> = {
  DRAFT: {
    label: "Nháp",
    className: "bg-slate-100 text-slate-700 ring-slate-200",
    dot: "bg-slate-400",
  },
  PENDING: {
    label: "Chờ duyệt",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
  },
  APPROVED: {
    label: "Đang public",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  PAUSED: {
    label: "Tạm ẩn",
    className: "bg-blue-50 text-blue-700 ring-blue-200",
    dot: "bg-blue-500",
  },
  REJECTED: {
    label: "Từ chối",
    className: "bg-red-50 text-red-700 ring-red-200",
    dot: "bg-red-500",
  },
  EXPIRED: {
    label: "Hết hạn",
    className: "bg-zinc-100 text-zinc-600 ring-zinc-200",
    dot: "bg-zinc-400",
  },
};

type ModerationJobPosting = {
  id: number;
  title: string;
  slug: string;
  status: string;
  description: string | null;
  location: string | null;
  salaryDisplay: string | null;
  industry: string | null;
  workType: string | null;
  quantity: number;
  rejectReason: string | null;
  viewCount: number;
  applyCount: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  publishedAt: string | Date | null;
  expiresAt: string | Date | null;
  jobOrderId: number | null;
  employer: {
    id: number;
    slug: string;
    companyName: string;
    email: string;
    logo: string | null;
    workspace: { id: number } | null;
  };
  jobOrder: {
    id: number;
    title: string;
    client: { companyName: string };
  } | null;
  _count?: { applications: number };
};

type JobOrderLinkOption = {
  id: number;
  title: string;
  status: string;
  client: { companyName: string };
};

type JobPostingModerationData = {
  jobs: ModerationJobPosting[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  stats: {
    total: number;
    byStatus: Record<string, number>;
    views: number;
    applications: number;
  };
};

type BulkAction = "approve" | "reject" | "pause" | "resume" | "delete";

function getStatusConfig(status: string) {
  return (
    STATUS_CONFIG[status] ?? {
      label: status,
      className: "bg-slate-100 text-slate-700 ring-slate-200",
      dot: "bg-slate-400",
    }
  );
}

function formatDate(value: Date | string | null) {
  if (!value) {
    return "Chưa có";
  }

  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function buildPageHref({
  page,
  status,
  search,
  linkState,
  pageSize,
}: {
  page: number;
  status: string;
  search: string;
  linkState: JobPostingLinkState;
  pageSize: number;
}) {
  const params = new URLSearchParams({
    tab: "posts",
    postPage: String(page),
    postPageSize: String(pageSize),
  });

  if (status && status !== "ALL") {
    params.set("postStatus", status);
  }
  if (search.trim()) {
    params.set("postSearch", search.trim());
  }
  if (linkState !== "ALL") {
    params.set("postLink", linkState);
  }

  return `/jobs?${params.toString()}`;
}

function PaginationLinks({
  data,
  status,
  search,
  linkState,
}: {
  data: JobPostingModerationData;
  status: string;
  search: string;
  linkState: JobPostingLinkState;
}) {
  if (data.totalPages <= 1) {
    return null;
  }

  const from = (data.page - 1) * data.pageSize + 1;
  const to = Math.min(data.page * data.pageSize, data.total);

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted">
        Hiển thị <span className="font-semibold text-foreground">{from}-{to}</span> /{" "}
        <span className="font-semibold text-foreground">{data.total}</span> bài đăng
      </p>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: data.totalPages }, (_, index) => index + 1).map((page) => (
          <Link
            key={page}
            href={buildPageHref({
              page,
              status,
              search,
              linkState,
              pageSize: data.pageSize,
            })}
            className={
              page === data.page
                ? "flex h-8 min-w-8 items-center justify-center rounded-md bg-primary px-2.5 text-xs font-semibold text-white"
                : "flex h-8 min-w-8 items-center justify-center rounded-md border border-border bg-white px-2.5 text-xs font-semibold text-muted transition hover:border-primary/40 hover:text-primary"
            }
          >
            {page}
          </Link>
        ))}
      </div>
    </div>
  );
}

function ShortJobMeta({ job }: { job: ModerationJobPosting }) {
  const parts = [job.location, job.salaryDisplay, job.workType].filter(Boolean);

  if (parts.length === 0) {
    return <span className="text-xs text-muted">Chưa có metadata</span>;
  }

  return (
    <span className="block max-w-[280px] truncate text-xs text-muted">
      {parts.join(" · ")}
    </span>
  );
}

function buildCompanyHref(job: ModerationJobPosting) {
  return job.employer.workspace
    ? `/companies/${job.employer.workspace.id}`
    : `/companies?role=employer&search=${job.employer.id}`;
}

function QuickStatusSelect({ job }: { job: ModerationJobPosting }) {
  const router = useRouter();
  const [value, setValue] = useState(job.status);
  const [isPending, startTransition] = useTransition();

  function handleChange(nextValue: string) {
    if (nextValue === value) {
      return;
    }
    if (nextValue === "REJECTED" && !window.confirm("Từ chối nhanh bài đăng này?")) {
      return;
    }

    const previousValue = value;
    setValue(nextValue);
    startTransition(async () => {
      const result = await updateAdminJobPostingStatus(job.id, nextValue);
      if (!result.success) {
        alert(result.message);
        setValue(previousValue);
        return;
      }
      router.refresh();
    });
  }

  return (
    <select
      value={value}
      disabled={isPending}
      onChange={(event) => handleChange(event.target.value)}
      className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs font-semibold text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15 disabled:opacity-60"
      title="Đổi trạng thái bài đăng"
    >
      {QUICK_STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function QuickJobOrderSelect({
  job,
  options,
}: {
  job: ModerationJobPosting;
  options: JobOrderLinkOption[];
}) {
  const router = useRouter();
  const [value, setValue] = useState(job.jobOrderId ? String(job.jobOrderId) : "");
  const [isPending, startTransition] = useTransition();

  function handleChange(nextValue: string) {
    if (nextValue === value) {
      return;
    }

    const previousValue = value;
    setValue(nextValue);
    startTransition(async () => {
      const result = await linkAdminJobPostingJobOrder(
        job.id,
        nextValue ? Number(nextValue) : null
      );
      if (!result.success) {
        alert(result.message);
        setValue(previousValue);
        return;
      }
      router.refresh();
    });
  }

  return (
    <select
      value={value}
      disabled={isPending}
      onChange={(event) => handleChange(event.target.value)}
      className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs font-semibold text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15 disabled:opacity-60"
      title="Link hoặc bỏ link JobOrder"
    >
      <option value="">Chưa link CRM</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          #{option.id} · {option.title} · {option.client.companyName}
        </option>
      ))}
    </select>
  );
}

function BulkToolbar({
  selectedCount,
  disabled,
  onRun,
  onClear,
}: {
  selectedCount: number;
  disabled: boolean;
  onRun: (action: BulkAction) => void;
  onClear: () => void;
}) {
  if (selectedCount === 0) {
    return null;
  }

  const baseButton =
    "inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-slate-50 px-4 py-2">
      <div className="text-xs font-semibold text-foreground">
        Đã chọn <span className="text-primary">{selectedCount}</span> bài đăng
      </div>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onRun("approve")}
          disabled={disabled}
          className={`${baseButton} border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Duyệt
        </button>
        <button
          type="button"
          onClick={() => onRun("pause")}
          disabled={disabled}
          className={`${baseButton} border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100`}
        >
          <Pause className="h-3.5 w-3.5" />
          Tạm ẩn
        </button>
        <button
          type="button"
          onClick={() => onRun("resume")}
          disabled={disabled}
          className={`${baseButton} border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100`}
        >
          <Play className="h-3.5 w-3.5" />
          Hiện lại
        </button>
        <button
          type="button"
          onClick={() => onRun("reject")}
          disabled={disabled}
          className={`${baseButton} border-red-200 bg-white text-red-600 hover:bg-red-50`}
        >
          <XCircle className="h-3.5 w-3.5" />
          Từ chối
        </button>
        <button
          type="button"
          onClick={() => onRun("delete")}
          disabled={disabled}
          className={`${baseButton} border-red-200 bg-white text-red-600 hover:bg-red-50`}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Xóa
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={disabled}
          className={`${baseButton} border-border bg-white text-muted hover:text-foreground`}
        >
          Bỏ chọn
        </button>
      </div>
    </div>
  );
}

export function JobPostingModerationPanel({
  data,
  status,
  search,
  linkState,
  jobOrderOptions,
}: {
  data: JobPostingModerationData;
  status: string;
  search: string;
  linkState: JobPostingLinkState;
  jobOrderOptions: JobOrderLinkOption[];
}) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const visibleIds = useMemo(() => data.jobs.map((job) => job.id), [data.jobs]);
  const selectedCount = selectedIds.size;
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  const statCards = [
    {
      label: "Tổng bài",
      value: data.stats.total,
      icon: FileText,
      className: "bg-slate-50 text-slate-700",
    },
    {
      label: "Chờ duyệt",
      value: data.stats.byStatus.PENDING ?? 0,
      icon: Clock3,
      className: "bg-amber-50 text-amber-700",
    },
    {
      label: "Đang public",
      value: data.stats.byStatus.APPROVED ?? 0,
      icon: CheckCircle2,
      className: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Views",
      value: data.stats.views,
      icon: Eye,
      className: "bg-blue-50 text-blue-700",
    },
    {
      label: "Applications",
      value: data.stats.applications,
      icon: Users,
      className: "bg-violet-50 text-violet-700",
    },
  ];

  function toggleAllVisible() {
    setFeedback(null);
    setSelectedIds((current) => {
      const next = new Set(current);

      if (allVisibleSelected) {
        visibleIds.forEach((id) => next.delete(id));
        return next;
      }

      visibleIds.forEach((id) => next.add(id));
      return next;
    });
  }

  function toggleOne(id: number) {
    setFeedback(null);
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function runBulkAction(action: BulkAction) {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      return;
    }

    let reason: string | undefined;
    if (action === "reject") {
      reason = window.prompt("Lý do từ chối cho các bài đã chọn:") ?? undefined;
      if (!reason?.trim()) {
        return;
      }
    }

    if (action === "delete" && !window.confirm(`Xóa ${ids.length} bài đăng đã chọn?`)) {
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      const result = await bulkAdminJobPostingModeration(ids, action, reason);
      setFeedback(result.message);
      if (result.success) {
        setSelectedIds(new Set());
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-lg border border-border bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{card.label}</p>
              <span className={`flex h-8 w-8 items-center justify-center rounded-md ${card.className}`}>
                <card.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-white p-3 shadow-sm">
        <form action="/jobs" className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_160px_170px_130px_auto_auto]">
          <input type="hidden" name="tab" value="posts" />
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              name="postSearch"
              defaultValue={search}
              placeholder="Tìm tiêu đề, công ty, email, JobOrder..."
              className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <select
            name="postStatus"
            defaultValue={status}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            name="postLink"
            defaultValue={linkState}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
          >
            {LINK_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            name="postPageSize"
            defaultValue={data.pageSize}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}/trang
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center rounded-md bg-foreground px-4 text-sm font-semibold text-white transition hover:bg-foreground/90"
          >
            Lọc
          </button>

          <Link
            href="/moderation/new"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Thêm bài
          </Link>
        </form>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border bg-white px-4 py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Bài đăng FDIWork
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                Duyệt trạng thái public và kiểm tra liên kết với JobOrder CRM.
              </p>
            </div>
            <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted">
              {data.total} kết quả · {data.pageSize}/trang
            </span>
          </div>
        </div>

        <BulkToolbar
          selectedCount={selectedCount}
          disabled={isPending}
          onRun={runBulkAction}
          onClear={() => setSelectedIds(new Set())}
        />

        {feedback ? (
          <div className="border-b border-border bg-primary/5 px-4 py-2 text-xs font-semibold text-primary">
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Đang xử lý...
              </span>
            ) : (
              feedback
            )}
          </div>
        ) : null}

        {data.jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <ShieldCheck className="mb-3 h-10 w-10 text-muted/30" />
            <p className="font-semibold text-foreground">Không có bài đăng phù hợp</p>
            <p className="mt-1 max-w-md text-sm text-muted">
              Thử đổi trạng thái, tìm kiếm hoặc bộ lọc liên kết JobOrder.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto 2xl:block">
              <table className="w-full min-w-[1120px] table-fixed text-sm">
                <thead className="bg-slate-50">
                  <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                    <th className="w-10 px-3 py-2">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleAllVisible}
                        aria-label="Chọn tất cả bài trên trang"
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                      />
                    </th>
                    <th className="w-[300px] px-3 py-2">Bài đăng</th>
                    <th className="w-[220px] px-3 py-2">Công ty</th>
                    <th className="w-[180px] px-3 py-2">JobOrder</th>
                    <th className="w-[130px] px-3 py-2">Trạng thái</th>
                    <th className="w-[110px] px-3 py-2 text-center">Hiệu quả</th>
                    <th className="w-[120px] px-3 py-2">Ngày</th>
                    <th className="w-[96px] px-3 py-2 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.jobs.map((job) => {
                    const applicationCount = job._count?.applications ?? job.applyCount;
                    const isSelected = selectedIds.has(job.id);

                    return (
                      <tr
                        key={job.id}
                        className={isSelected ? "bg-primary/[0.04]" : "transition hover:bg-slate-50/70"}
                      >
                        <td className="px-3 py-2 align-middle">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleOne(job.id)}
                            aria-label={`Chọn ${job.title}`}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                          />
                        </td>
                        <td className="px-3 py-2 align-middle">
                          <div className="min-w-0">
                            <Link
                              href={`/viec-lam/${job.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block truncate font-semibold leading-5 text-foreground transition hover:text-primary hover:underline"
                            >
                              {job.title}
                            </Link>
                            <ShortJobMeta job={job} />
                          </div>
                        </td>
                        <td className="px-3 py-2 align-middle">
                          <Link
                            href={buildCompanyHref(job)}
                            className="block truncate font-semibold text-foreground transition hover:text-primary hover:underline"
                          >
                            {job.employer.companyName}
                          </Link>
                          <p className="truncate text-xs text-muted">{job.employer.email}</p>
                        </td>
                        <td className="px-3 py-2 align-middle">
                          <QuickJobOrderSelect job={job} options={jobOrderOptions} />
                        </td>
                        <td className="px-3 py-2 align-middle">
                          <QuickStatusSelect job={job} />
                        </td>
                        <td className="px-3 py-2 text-center align-middle">
                          <div className="inline-flex overflow-hidden rounded-md border border-border bg-background text-xs">
                            <span className="border-r border-border px-2 py-1">
                              <strong className="text-foreground">{job.viewCount}</strong> view
                            </span>
                            <span className="px-2 py-1">
                              <strong className="text-foreground">{applicationCount}</strong> CV
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 align-middle text-xs text-muted">
                          <p>Tạo: {formatDate(job.createdAt)}</p>
                          <p>Sửa: {formatDate(job.updatedAt)}</p>
                        </td>
                        <td className="px-3 py-2 align-middle text-right">
                          <JobPostingModerationActions
                            jobId={job.id}
                            jobTitle={job.title}
                            status={job.status}
                            slug={job.slug}
                            compact
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-border 2xl:hidden">
              {data.jobs.map((job) => {
                const statusConfig = getStatusConfig(job.status);
                const applicationCount = job._count?.applications ?? job.applyCount;
                const isSelected = selectedIds.has(job.id);

                return (
                  <article key={job.id} className={isSelected ? "space-y-3 bg-primary/[0.04] p-3" : "space-y-3 p-3"}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(job.id)}
                          aria-label={`Chọn ${job.title}`}
                          className="mt-1 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary/30"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">{job.title}</p>
                          <p className="mt-0.5 truncate text-sm text-muted">{job.employer.companyName}</p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusConfig.className}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded-md bg-slate-50 p-2">
                        <p className="font-semibold uppercase text-muted">Views</p>
                        <p className="font-bold text-foreground">{job.viewCount}</p>
                      </div>
                      <div className="rounded-md bg-slate-50 p-2">
                        <p className="font-semibold uppercase text-muted">CV</p>
                        <p className="font-bold text-foreground">{applicationCount}</p>
                      </div>
                      <div className="rounded-md bg-slate-50 p-2">
                        <p className="font-semibold uppercase text-muted">Ngày tạo</p>
                        <p className="font-bold text-foreground">{formatDate(job.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {job.jobOrder ? (
                        <Link
                          href={`/jobs/${job.jobOrder.id}`}
                          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs font-semibold text-primary"
                        >
                          JobOrder #{job.jobOrder.id}
                        </Link>
                      ) : (
                        <span className="inline-flex rounded-md border border-dashed border-border px-2 py-1 text-xs font-semibold text-muted">
                          Chưa link CRM
                        </span>
                      )}
                      <JobPostingModerationActions
                        jobId={job.id}
                        jobTitle={job.title}
                        status={job.status}
                        slug={job.slug}
                        compact
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        <PaginationLinks data={data} status={status} search={search} linkState={linkState} />
      </div>
    </div>
  );
}
