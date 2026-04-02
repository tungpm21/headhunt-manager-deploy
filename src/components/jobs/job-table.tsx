import Link from "next/link";
import { Briefcase, Building2, Users, ChevronRight, Clock } from "lucide-react";
import { JobOrderWithRelations, JobStatus } from "@/types/job";

const STATUS_LABELS: Record<JobStatus, { label: string; color: string }> = {
  OPEN: { label: "Đang tuyển", color: "bg-green-100 text-green-700" },
  PAUSED: { label: "Tạm dừng", color: "bg-yellow-100 text-yellow-700" },
  FILLED: { label: "Đã tuyển", color: "bg-blue-100 text-blue-700" },
  CANCELLED: { label: "Đã hủy", color: "bg-gray-100 text-gray-700" },
};

export function JobTable({ jobs }: { jobs: JobOrderWithRelations[] }) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-4 py-12">
        <Briefcase className="mb-4 h-12 w-12 text-muted/40" />
        <p className="font-medium text-foreground">Không tìm thấy yêu cầu tuyển dụng nào</p>
        <p className="mt-1 text-sm text-muted">Hãy tạo đơn hàng mới để bắt đầu.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] divide-y divide-border text-sm">
          <thead className="bg-background">
            <tr>
              <th scope="col" className="px-6 py-4 text-left font-semibold text-foreground">
                Vị trí tuyển dụng
              </th>
              <th scope="col" className="px-6 py-4 text-left font-semibold text-foreground">
                Khách hàng
              </th>
              <th scope="col" className="hidden px-6 py-4 text-left font-semibold text-foreground lg:table-cell">
                Deadline
              </th>
              <th scope="col" className="px-6 py-4 text-center font-semibold text-foreground">
                Trạng thái
              </th>
              <th scope="col" className="px-6 py-4 text-center font-semibold text-foreground">
                Ứng viên
              </th>
              <th scope="col" className="relative px-6 py-4">
                <span className="sr-only">Hành động</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {jobs.map((job) => (
              <tr key={job.id} className="transition-colors hover:bg-background/60">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{job.title}</div>
                      <div className="mt-0.5 text-xs text-muted">
                        {job.quantity && job.quantity > 1 ? `Số lượng: ${job.quantity} | ` : ""}
                        Lương: {job.salaryMin && job.salaryMax ? `${job.salaryMin}M - ${job.salaryMax}M` : job.salaryMin ? `Từ ${job.salaryMin}M` : job.salaryMax ? `Đến ${job.salaryMax}M` : "Thỏa thuận"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center font-medium text-foreground">
                    <Building2 className="mr-2 h-4 w-4 text-muted" />
                    {job.client.companyName}
                  </div>
                </td>
                <td className="hidden whitespace-nowrap px-6 py-4 lg:table-cell">
                  {job.deadline ? (
                    <div className="flex items-center text-muted">
                      <Clock className="mr-2 h-4 w-4 text-muted" />
                      {new Date(job.deadline).toLocaleDateString("vi-VN")}
                    </div>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-center">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${STATUS_LABELS[job.status].color}`}>
                    {STATUS_LABELS[job.status].label}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-center">
                  <div className="inline-flex min-w-[2.5rem] items-center justify-center rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted">
                    <Users className="mr-1 h-3.5 w-3.5" />
                    {job._count?.candidates || 0}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-background"
                  >
                    Chi tiết <ChevronRight className="ml-1 -mr-1 h-4 w-4 text-muted" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
