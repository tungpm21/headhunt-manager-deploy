import Link from "next/link";
import { getMyJobPostings } from "@/lib/employer-actions";
import { Plus, Briefcase, Eye, Users, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Nháp", className: "bg-gray-100 text-gray-600" },
  PENDING: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700" },
  APPROVED: { label: "Đang hiển thị", className: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Bị từ chối", className: "bg-red-100 text-red-700" },
  EXPIRED: { label: "Hết hạn", className: "bg-gray-100 text-gray-500" },
  PAUSED: { label: "Tạm ẩn", className: "bg-blue-100 text-blue-600" },
};

export default async function JobPostingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status || "ALL";
  const page = parseInt(params.page || "1");
  const data = await getMyJobPostings(status, page);

  const filters = [
    { value: "ALL", label: "Tất cả" },
    { value: "PENDING", label: "Chờ duyệt" },
    { value: "APPROVED", label: "Đang hiển thị" },
    { value: "REJECTED", label: "Bị từ chối" },
    { value: "PAUSED", label: "Tạm ẩn" },
    { value: "EXPIRED", label: "Hết hạn" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Briefcase className="h-7 w-7 text-teal-600" />
            Tin tuyển dụng
          </h1>
          <p className="text-gray-500 mt-1">Quản lý {data.total} tin đã đăng</p>
        </div>
        <Link
          href="/employer/job-postings/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-all shadow-lg shadow-teal-200 text-sm"
        >
          <Plus className="h-4 w-4" />
          Đăng tin mới
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={`/employer/job-postings?status=${f.value}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              status === f.value
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-white text-gray-500 border border-gray-200 hover:border-teal-300 hover:text-teal-600"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* List */}
      {data.jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Briefcase className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500">
            {status === "ALL"
              ? "Chưa có tin nào. Bắt đầu đăng tin tuyển dụng!"
              : "Không có tin nào ở trạng thái này."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.jobs.map((job) => {
            const statusCfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.DRAFT;
            return (
              <Link
                key={job.id}
                href={`/employer/job-postings/${job.id}`}
                className="block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-teal-200 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-800 group-hover:text-teal-600 transition-colors truncate">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      {job.location && (
                        <span className="flex items-center gap-1">📍 {job.location}</span>
                      )}
                      {job.salaryDisplay && (
                        <span className="flex items-center gap-1">💰 {job.salaryDisplay}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(job.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {job.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {job._count.applications}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.className}`}
                    >
                      {statusCfg.label}
                    </span>
                  </div>
                </div>

                {job.status === "REJECTED" && job.rejectReason && (
                  <div className="mt-3 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600">
                    ❌ Lý do từ chối: {job.rejectReason}
                  </div>
                )}
              </Link>
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
              href={`/employer/job-postings?status=${status}&page=${p}`}
              className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                p === page
                  ? "bg-teal-600 text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-teal-300"
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
