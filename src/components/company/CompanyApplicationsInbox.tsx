"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileText,
  Inbox,
  Mail,
  Phone,
  Search,
  Send,
  UserRound,
  XCircle,
} from "lucide-react";
import { updateCompanyApplicationStatusAction } from "@/lib/company-application-actions";
import { cn } from "@/lib/utils";

type ApplicationStatusValue =
  | "NEW"
  | "REVIEWED"
  | "SHORTLISTED"
  | "REJECTED"
  | "IMPORTED";

export type CompanyApplicationItem = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  coverLetter: string | null;
  cvFileUrl: string | null;
  cvFileName: string | null;
  status: ApplicationStatusValue;
  candidateId: number | null;
  createdAt: string;
  updatedAt: string;
  jobPosting: {
    id: number;
    title: string;
    slug: string;
    status: string;
  };
};

export type CompanyApplicationsJobOption = {
  id: number;
  title: string;
  status: string;
  applications: number;
};

export type CompanyApplicationsFilters = {
  q: string;
  status: string;
  job: string;
  cv: string;
  imported: string;
  from: string;
  to: string;
  selected: string;
};

const statusMeta: Record<
  ApplicationStatusValue,
  { label: string; className: string; icon: React.ElementType }
> = {
  NEW: {
    label: "Mới",
    className: "bg-blue-50 text-blue-700 border-blue-100",
    icon: Inbox,
  },
  REVIEWED: {
    label: "Đã xem",
    className: "bg-slate-100 text-slate-700 border-slate-200",
    icon: Eye,
  },
  SHORTLISTED: {
    label: "Shortlist",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Từ chối",
    className: "bg-red-50 text-red-700 border-red-100",
    icon: XCircle,
  },
  IMPORTED: {
    label: "Imported",
    className: "bg-violet-50 text-violet-700 border-violet-100",
    icon: Send,
  },
};

const statusOptions = [
  { value: "ALL", label: "Tất cả" },
  { value: "NEW", label: "Mới" },
  { value: "REVIEWED", label: "Đã xem" },
  { value: "SHORTLISTED", label: "Shortlist" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "IMPORTED", label: "Imported" },
];

const statusActions: { status: ApplicationStatusValue; label: string }[] = [
  { status: "REVIEWED", label: "Đã xem" },
  { status: "SHORTLISTED", label: "Shortlist" },
  { status: "REJECTED", label: "Từ chối" },
  { status: "IMPORTED", label: "Đánh dấu imported" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function StatusBadge({ status }: { status: ApplicationStatusValue }) {
  const meta = statusMeta[status];
  const Icon = meta.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
        meta.className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
}

export function CompanyApplicationsInbox({
  applications,
  jobs,
  filters,
  total,
  page,
  pageSize,
  statusCounts,
}: {
  applications: CompanyApplicationItem[];
  jobs: CompanyApplicationsJobOption[];
  filters: CompanyApplicationsFilters;
  total: number;
  page: number;
  pageSize: number;
  statusCounts: Partial<Record<ApplicationStatusValue, number>>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const selectedApplication = useMemo(() => {
    const selectedId = Number(filters.selected);
    return (
      applications.find((application) => application.id === selectedId) ??
      applications[0] ??
      null
    );
  }, [applications, filters.selected]);

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  function selectApplication(applicationId: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("selected", String(applicationId));
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilters() {
    router.push(pathname);
  }

  function updateStatus(applicationId: number, status: ApplicationStatusValue) {
    setActionMessage(null);
    startTransition(async () => {
      const result = await updateCompanyApplicationStatusAction(applicationId, status);
      setActionMessage(result.message);
      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <form className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1fr]">
          <label className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Từ khóa
            </span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                name="q"
                defaultValue={filters.q}
                placeholder="Tên, email, số điện thoại, tin tuyển dụng"
                className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary"
              />
            </div>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Tin tuyển dụng
            </span>
            <select
              name="job"
              defaultValue={filters.job}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
            >
              <option value="">Tất cả tin</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} ({job.applications})
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Trạng thái
            </span>
            <select
              name="status"
              defaultValue={filters.status}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              CV
            </span>
            <select
              name="cv"
              defaultValue={filters.cv}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
            >
              <option value="">Tất cả</option>
              <option value="with">Có CV</option>
              <option value="without">Chưa có CV</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Import
            </span>
            <select
              name="imported"
              defaultValue={filters.imported}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
            >
              <option value="">Tất cả</option>
              <option value="imported">Đã imported</option>
              <option value="not-imported">Chưa imported</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Từ ngày
            </span>
            <input
              name="from"
              type="date"
              defaultValue={filters.from}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Đến ngày
            </span>
            <input
              name="to"
              type="date"
              defaultValue={filters.to}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
            />
          </label>

          <div className="flex items-end gap-2 lg:col-span-3">
            <button
              type="submit"
              className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-sm transition hover:bg-primary-hover"
            >
              Lọc hồ sơ
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="h-10 rounded-lg border border-border px-4 text-sm font-medium text-muted transition hover:border-primary/40 hover:text-foreground"
            >
              Xóa lọc
            </button>
          </div>
        </form>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.9fr)]">
        <section className="min-w-0 rounded-xl border border-border bg-surface shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Hồ sơ ứng tuyển
              </h2>
              <p className="text-sm text-muted">
                Hiển thị {from}-{to} / {total} hồ sơ
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {Object.entries(statusMeta).map(([status, meta]) => (
                <span
                  key={status}
                  className="rounded-full border border-border px-2 py-1 text-muted"
                >
                  {meta.label}:{" "}
                  <strong className="text-foreground">
                    {statusCounts[status as ApplicationStatusValue] ?? 0}
                  </strong>
                </span>
              ))}
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
              <Inbox className="h-12 w-12 text-muted/40" />
              <p className="mt-3 text-base font-medium text-foreground">
                Chưa có hồ sơ phù hợp
              </p>
              <p className="mt-1 max-w-md text-sm text-muted">
                Thử xóa bớt bộ lọc hoặc chọn tin tuyển dụng khác để xem hồ sơ.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    <th className="px-4 py-3">Ứng viên</th>
                    <th className="px-4 py-3">Tin tuyển dụng</th>
                    <th className="px-4 py-3">Liên hệ</th>
                    <th className="px-4 py-3">Ngày nộp</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">CV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {applications.map((application) => {
                    const isSelected =
                      selectedApplication?.id === application.id;
                    return (
                      <tr
                        key={application.id}
                        className={cn(
                          "cursor-pointer transition hover:bg-muted/20",
                          isSelected && "bg-primary/5"
                        )}
                        onClick={() => selectApplication(application.id)}
                      >
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            className="text-left font-medium text-foreground hover:text-primary"
                          >
                            {application.fullName}
                          </button>
                          <p className="mt-0.5 text-xs text-muted">
                            Cập nhật {formatDate(application.updatedAt)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">
                            {application.jobPosting.title}
                          </p>
                          <p className="mt-0.5 text-xs text-muted">
                            {application.jobPosting.status}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-muted">
                          <p>{application.email}</p>
                          <p className="mt-0.5 text-xs">
                            {application.phone || "Chưa có số điện thoại"}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {formatDate(application.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={application.status} />
                        </td>
                        <td className="px-4 py-3">
                          {application.cvFileUrl ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                              <FileText className="h-3.5 w-3.5" />
                              Có CV
                            </span>
                          ) : (
                            <span className="text-xs text-muted">Không có</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="rounded-xl border border-border bg-surface shadow-sm">
          {!selectedApplication ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
              <UserRound className="h-12 w-12 text-muted/40" />
              <p className="mt-3 text-base font-medium text-foreground">
                Chọn một hồ sơ để xem preview
              </p>
            </div>
          ) : (
            <div className="space-y-5 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Preview hồ sơ
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-foreground">
                    {selectedApplication.fullName}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {selectedApplication.jobPosting.title}
                  </p>
                </div>
                <StatusBadge status={selectedApplication.status} />
              </div>

              {actionMessage && (
                <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted">
                  {actionMessage}
                </div>
              )}

              <div className="grid gap-2 text-sm">
                <a
                  href={`mailto:${selectedApplication.email}`}
                  className="flex items-center gap-2 text-muted hover:text-primary"
                >
                  <Mail className="h-4 w-4" />
                  {selectedApplication.email}
                </a>
                <div className="flex items-center gap-2 text-muted">
                  <Phone className="h-4 w-4" />
                  {selectedApplication.phone || "Chưa có số điện thoại"}
                </div>
                <div className="flex items-center gap-2 text-muted">
                  <Clock3 className="h-4 w-4" />
                  Nộp lúc {formatDate(selectedApplication.createdAt)}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">CV</p>
                {selectedApplication.cvFileUrl ? (
                  <a
                    href={selectedApplication.cvFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/50 hover:text-primary"
                  >
                    <Download className="h-4 w-4" />
                    {selectedApplication.cvFileName || "Tải CV"}
                  </a>
                ) : (
                  <p className="rounded-lg bg-muted/20 px-3 py-2 text-sm text-muted">
                    Ứng viên chưa đính kèm CV.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  Thư giới thiệu
                </p>
                <div className="max-h-56 overflow-auto rounded-lg border border-border bg-background p-3 text-sm leading-6 text-muted">
                  {selectedApplication.coverLetter ||
                    "Ứng viên chưa nhập thư giới thiệu."}
                </div>
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <p className="text-sm font-semibold text-foreground">
                  Cập nhật trạng thái
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {statusActions.map((action) => (
                    <button
                      key={action.status}
                      type="button"
                      disabled={
                        isPending || selectedApplication.status === action.status
                      }
                      onClick={() =>
                        updateStatus(selectedApplication.id, action.status)
                      }
                      className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted">
                  Imported hiện chỉ là đánh dấu trạng thái, chưa tạo CRM Candidate.
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
