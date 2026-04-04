import { getPendingJobPostings } from "@/lib/moderation-actions";
import Link from "next/link";
import { ShieldCheck, Eye, Clock, FileText, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { ModerationActions } from "./moderation-actions-ui";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700" },
  APPROVED: { label: "Đã duyệt", className: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Đã từ chối", className: "bg-red-100 text-red-700" },
  PAUSED: { label: "Tạm ẩn", className: "bg-blue-100 text-blue-600" },
  EXPIRED: { label: "Hết hạn", className: "bg-gray-100 text-gray-500" },
};

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status || "PENDING";
  const page = parseInt(params.page || "1");
  const data = await getPendingJobPostings(status, page);

  const filters = [
    { value: "PENDING", label: "Chờ duyệt" },
    { value: "APPROVED", label: "Đã duyệt" },
    { value: "REJECTED", label: "Đã từ chối" },
    { value: "ALL", label: "Tất cả" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-primary" />
          Duyệt bài đăng FDIWork
        </h1>
        <p className="text-muted mt-1">{data.total} tin tổng cộng</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={`/moderation?status=${f.value}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              status === f.value
                ? "bg-primary text-white shadow-sm"
                : "bg-surface text-muted border border-border hover:border-primary/30 hover:text-foreground"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Job List */}
      {data.jobs.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <ShieldCheck className="h-12 w-12 text-muted/30 mx-auto mb-4" />
          <p className="text-muted">Không có tin nào ở trạng thái này.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.jobs.map((job: {
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
            createdAt: Date;
            employer: {
              companyName: string;
              email: string;
            };
          }) => {
            const statusCfg = STATUS_CONFIG[job.status] ?? { label: job.status, className: "bg-gray-100 text-gray-600" };
            return (
              <div
                key={job.id}
                className="bg-surface rounded-xl border border-border p-6 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground text-lg">{job.title}</h3>
                    <div className="flex items-center gap-3 mt-1.5 text-sm text-muted">
                      <span className="font-medium text-primary">
                        {job.employer.companyName}
                      </span>
                      <span>•</span>
                      <span>{job.employer.email}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: vi })}
                      </span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusCfg.className}`}>
                    {statusCfg.label}
                  </span>
                </div>

                {/* Preview */}
                <div className="bg-background rounded-lg border border-border/50 p-4 mb-4 space-y-3">
                  {job.description && (
                    <div>
                      <p className="text-xs font-semibold text-muted uppercase mb-1">Mô tả</p>
                      <p className="text-sm text-foreground whitespace-pre-line line-clamp-4">{job.description}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4 text-xs text-muted">
                    {job.location && <span>📍 {job.location}</span>}
                    {job.salaryDisplay && <span>💰 {job.salaryDisplay}</span>}
                    {job.industry && <span>🏭 {job.industry}</span>}
                    {job.workType && <span>⏰ {job.workType}</span>}
                    <span>👥 {job.quantity} người</span>
                  </div>
                </div>

                {/* Rejected reason */}
                {job.status === "REJECTED" && job.rejectReason && (
                  <div className="rounded-lg bg-red-50 border border-red-100 p-3 mb-4 text-sm text-red-700">
                    ❌ Lý do: {job.rejectReason}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-background px-3 py-1 text-xs font-medium text-muted">
                      <Eye className="h-3.5 w-3.5" />
                      {job.viewCount} lượt xem
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-background px-3 py-1 text-xs font-medium text-muted">
                      <FileText className="h-3.5 w-3.5" />
                      {job.applyCount} lượt ứng tuyển
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {job.status === "APPROVED" ? (
                      <Link
                        href={`/viec-lam/${job.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/15"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Xem trên FDIWork
                      </Link>
                    ) : (
                      <span
                        className="inline-flex items-center rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted"
                        title={`/viec-lam/${job.slug}`}
                      >
                        Chưa public trên FDIWork
                      </span>
                    )}

                    {job.status === "PENDING" && (
                      <ModerationActions jobId={job.id} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/moderation?status=${status}&page=${p}`}
              className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                p === page
                  ? "bg-primary text-white"
                  : "bg-surface border border-border text-muted hover:border-primary/30"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
