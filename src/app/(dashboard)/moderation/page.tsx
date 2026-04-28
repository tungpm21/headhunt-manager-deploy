import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { getPendingJobPostings } from "@/lib/moderation-actions";
import { ModerationActions } from "./moderation-actions-ui";

const LANGUAGE_LABELS: Record<string, string> = {
  Japanese: "Tiếng Nhật",
  Korean: "Tiếng Hàn",
  English: "Tiếng Anh",
  Chinese: "Tiếng Trung",
  German: "Tiếng Đức",
  French: "Tiếng Pháp",
};

const SHIFT_LABELS: Record<string, string> = {
  NIGHT: "Ca đêm",
  ROTATING: "Xoay ca",
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700" },
  APPROVED: { label: "Đã duyệt", className: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Đã từ chối", className: "bg-red-100 text-red-700" },
  PAUSED: { label: "Tạm ẩn", className: "bg-blue-100 text-blue-600" },
  EXPIRED: { label: "Hết hạn", className: "bg-gray-100 text-gray-500" },
};

function getDescriptionPreview(description: string | null) {
  if (!description) {
    return "";
  }

  return description
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status || "ALL";
  const page = parseInt(params.page || "1", 10);
  const data = await getPendingJobPostings(status, page);

  const filters = [
    { value: "PENDING", label: "Chờ duyệt" },
    { value: "APPROVED", label: "Đã duyệt" },
    { value: "PAUSED", label: "Tạm ẩn" },
    { value: "REJECTED", label: "Đã từ chối" },
    { value: "EXPIRED", label: "Hết hạn" },
    { value: "ALL", label: "Tất cả" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-foreground">
            <ShieldCheck className="h-7 w-7 text-primary" />
            Quản lý bài đăng FDIWork
          </h1>
          <p className="mt-1 text-muted">
            {data.total} tin {status === "ALL" ? "trong hệ thống" : "ở trạng thái hiện tại"}
          </p>
        </div>

        <Link
          href="/moderation/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Thêm mới bài đăng
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Link
            key={filter.value}
            href={`/moderation?status=${filter.value}`}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              status === filter.value
                ? "bg-primary text-white shadow-sm"
                : "border border-border bg-surface text-muted hover:border-primary/30 hover:text-foreground"
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {data.jobs.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-muted/30" />
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
            industrialZone: string | null;
            requiredLanguages: string[];
            shiftType: string | null;
            createdAt: Date;
            employer: {
              companyName: string;
              email: string;
            };
          }) => {
            const statusCfg = STATUS_CONFIG[job.status] ?? {
              label: job.status,
              className: "bg-gray-100 text-gray-600",
            };

            return (
              <div
                key={job.id}
                className="rounded-xl border border-border bg-surface p-6 transition-shadow hover:shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-muted">
                      <span className="font-medium text-primary">
                        {job.employer.companyName}
                      </span>
                      <span>•</span>
                      <span>{job.employer.email}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(job.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </span>
                    </div>
                    {(job.requiredLanguages.length > 0 ||
                      job.industrialZone ||
                      (job.shiftType && job.shiftType !== "DAY")) && (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {job.requiredLanguages.map((lang: string) => (
                          <span
                            key={lang}
                            className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700"
                          >
                            🌐 {LANGUAGE_LABELS[lang] ?? lang}
                          </span>
                        ))}
                        {job.industrialZone && (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                            🏭 {job.industrialZone}
                          </span>
                        )}
                        {job.shiftType && job.shiftType !== "DAY" && (
                          <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                            🕐 {SHIFT_LABELS[job.shiftType] ?? job.shiftType}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusCfg.className}`}
                  >
                    {statusCfg.label}
                  </span>
                </div>

                <div className="mb-4 space-y-3 rounded-lg border border-border/50 bg-background p-4">
                  {job.description ? (
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase text-muted">Mô tả</p>
                      <p className="line-clamp-4 whitespace-pre-line text-sm text-foreground">
                        {getDescriptionPreview(job.description)}
                      </p>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-4 text-xs text-muted">
                    {job.location ? <span>📍 {job.location}</span> : null}
                    {job.salaryDisplay ? <span>💰 {job.salaryDisplay}</span> : null}
                    {job.industry ? <span>🏭 {job.industry}</span> : null}
                    {job.workType ? <span>⏰ {job.workType}</span> : null}
                    <span>👥 {job.quantity} người</span>
                  </div>
                </div>

                {job.status === "REJECTED" && job.rejectReason ? (
                  <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                    ❌ Lý do: {job.rejectReason}
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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

                    <ModerationActions
                      jobId={job.id}
                      jobTitle={job.title}
                      status={job.status}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {data.totalPages > 1 ? (
        <div className="flex justify-center gap-2">
          {Array.from({ length: data.totalPages }, (_, index) => index + 1).map((p) => (
            <Link
              key={p}
              href={`/moderation?status=${status}&page=${p}`}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                p === page
                  ? "bg-primary text-white"
                  : "border border-border bg-surface text-muted hover:border-primary/30"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
