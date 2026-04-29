import Link from "next/link";
import { JobPostingStatus } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Briefcase,
  Clock,
  Eye,
  FileText,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { requireCompanyPortalSession } from "@/lib/company-portal-auth";
import { getEmployerJobPostingsForPortal } from "@/lib/employers";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Tin tuyển dụng - Company Portal" };

const STATUS_CONFIG: Record<JobPostingStatus, { label: string; className: string }> = {
  DRAFT: { label: "Nháp", className: "bg-gray-100 text-gray-600" },
  PENDING: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700" },
  APPROVED: { label: "Đang hiển thị", className: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Bị từ chối", className: "bg-red-100 text-red-700" },
  EXPIRED: { label: "Hết hạn", className: "bg-gray-100 text-gray-500" },
  PAUSED: { label: "Tạm ẩn", className: "bg-blue-100 text-blue-600" },
};

const FILTERS: Array<{ value: "ALL" | JobPostingStatus; label: string }> = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đang hiển thị" },
  { value: "REJECTED", label: "Bị từ chối" },
  { value: "PAUSED", label: "Tạm ẩn" },
  { value: "EXPIRED", label: "Hết hạn" },
];

interface PageProps {
  searchParams: Promise<{
    status?: string;
    page?: string;
  }>;
}

function parsePositiveInt(value: string | undefined) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalizeStatus(value: string | undefined) {
  if (!value || value === "ALL") return "ALL";
  return Object.values(JobPostingStatus).includes(value as JobPostingStatus)
    ? (value as JobPostingStatus)
    : "ALL";
}

function capabilityEmptyState() {
  return (
    <div className="rounded-xl border border-border bg-surface p-12 text-center text-muted">
      <FileText className="mx-auto mb-3 h-10 w-10 opacity-40" />
      <p className="text-lg font-medium text-foreground">
        Workspace chưa liên kết Employer
      </p>
      <p className="mt-1 text-sm">
        Liên hệ admin để bật tính năng quản lý tin tuyển dụng.
      </p>
    </div>
  );
}

export default async function CompanyJobPostingsPage({
  searchParams,
}: PageProps) {
  const session = await requireCompanyPortalSession();

  if (!session.capabilities.employer) {
    return capabilityEmptyState();
  }

  const params = await searchParams;
  const status = normalizeStatus(params.status);
  const page = Math.max(1, parsePositiveInt(params.page) ?? 1);

  const workspace = await prisma.companyWorkspace.findUnique({
    where: { id: session.workspaceId },
    select: {
      employerId: true,
      employer: { select: { companyName: true } },
    },
  });

  if (!workspace?.employerId) {
    return capabilityEmptyState();
  }

  const data = await getEmployerJobPostingsForPortal(
    workspace.employerId,
    status,
    page
  );

  const totalApplications = data.jobs.reduce(
    (sum, job) => sum + job._count.applications,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-foreground">
            <Briefcase className="h-7 w-7 text-primary" />
            Tin tuyển dụng
          </h1>
          <p className="mt-1 text-sm text-muted">
            Quản lý danh sách tin của {workspace.employer?.companyName ?? "công ty"}.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <SummaryCard label="Tổng tin" value={data.total} />
            <SummaryCard label="Trang này" value={data.jobs.length} />
            <SummaryCard label="Ứng viên" value={totalApplications} />
          </div>
          <Link
            href="/company/job-postings/new"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Đăng tin
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <Link
              key={filter.value}
              href={`/company/job-postings?status=${filter.value}`}
              className={`inline-flex min-h-10 items-center rounded-lg px-4 text-sm font-semibold transition ${
                status === filter.value
                  ? "bg-primary text-white"
                  : "border border-border bg-white text-muted hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {filter.label}
            </Link>
          ))}
        </div>
      </div>

      {data.jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center">
          <Search className="mx-auto mb-3 h-10 w-10 text-muted" />
          <p className="text-base font-semibold text-foreground">
            Không có tin tuyển dụng phù hợp
          </p>
          <p className="mt-1 text-sm text-muted">
            Thử đổi bộ lọc trạng thái hoặc kiểm tra lại sau khi admin duyệt tin.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.jobs.map((job) => {
            const statusConfig = STATUS_CONFIG[job.status];
            return (
              <article
                key={job.id}
                className="rounded-xl border border-border bg-surface p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusConfig.className}`}
                      >
                        {statusConfig.label}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDistanceToNow(new Date(job.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </span>
                    </div>
                    <h2 className="mt-3 truncate text-lg font-semibold text-foreground">
                      {job.title}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted">
                      {job.location ? <span>{job.location}</span> : null}
                      {job.industry ? <span>{job.industry}</span> : null}
                      {job.salaryDisplay ? <span>{job.salaryDisplay}</span> : null}
                    </div>
                    {job.status === "REJECTED" && job.rejectReason ? (
                      <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                        Lý do từ chối: {job.rejectReason}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
                    <div className="flex items-center gap-4 text-sm text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <Eye className="h-4 w-4" />
                        {job.viewCount}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        {job._count.applications}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/company/job-postings/${job.id}`}
                        className="inline-flex min-h-9 items-center rounded-lg border border-border bg-white px-3 text-sm font-semibold text-foreground transition hover:border-primary/40"
                      >
                        Chi tiết
                      </Link>
                      <Link
                        href={`/company/applications?job=${job.id}`}
                        className="inline-flex min-h-9 items-center rounded-lg border border-border bg-white px-3 text-sm font-semibold text-foreground transition hover:border-primary/40"
                      >
                        Hồ sơ ứng tuyển
                      </Link>
                      <Link
                        href={`/viec-lam/${job.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-9 items-center rounded-lg bg-primary px-3 text-sm font-semibold text-white transition hover:bg-primary/90"
                      >
                        Preview
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {data.totalPages > 1 ? (
        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            Trang <span className="font-semibold text-foreground">{page}</span> /{" "}
            <span className="font-semibold text-foreground">{data.totalPages}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: data.totalPages }, (_, index) => index + 1).map(
              (pageNumber) => (
                <Link
                  key={pageNumber}
                  href={`/company/job-postings?status=${status}&page=${pageNumber}`}
                  className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition ${
                    pageNumber === page
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white text-foreground hover:border-primary/40"
                  }`}
                >
                  {pageNumber}
                </Link>
              )
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}
