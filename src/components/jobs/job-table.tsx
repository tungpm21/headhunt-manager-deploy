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
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-xl border border-dashed">
        <Briefcase className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium">Không tìm thấy yêu cầu tuyển dụng nào</p>
        <p className="text-sm text-gray-400 mt-1">Hãy tạo đơn hàng mới để bắt đầu.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-900">
                Vị trí tuyển dụng
              </th>
              <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-900">
                Khách hàng
              </th>
              <th scope="col" className="px-6 py-4 text-left font-semibold text-gray-900">
                Deadline
              </th>
              <th scope="col" className="px-6 py-4 text-center font-semibold text-gray-900">
                Trạng thái
              </th>
              <th scope="col" className="px-6 py-4 text-center font-semibold text-gray-900">
                Ứng viên
              </th>
              <th scope="col" className="relative px-6 py-4">
                <span className="sr-only">Hành động</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{job.title}</div>
                      <div className="text-gray-500 text-xs mt-0.5">
                        {job.quantity && job.quantity > 1 ? `Số lượng: ${job.quantity} | ` : ""}
                        Lương: {job.salaryMin && job.salaryMax ? `${job.salaryMin}M - ${job.salaryMax}M` : job.salaryMin ? `Từ ${job.salaryMin}M` : job.salaryMax ? `Đến ${job.salaryMax}M` : "Thỏa thuận"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center text-gray-900 font-medium">
                    <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                    {job.client.companyName}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {job.deadline ? (
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      {new Date(job.deadline).toLocaleDateString("vi-VN")}
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-center">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${STATUS_LABELS[job.status].color}`}>
                    {STATUS_LABELS[job.status].label}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-center">
                  <div className="inline-flex items-center justify-center min-w-[2.5rem] bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium border">
                    <Users className="h-3.5 w-3.5 mr-1" />
                    {job._count?.candidates || 0}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="inline-flex items-center justify-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition"
                  >
                    Chi tiết <ChevronRight className="h-4 w-4 ml-1 -mr-1 text-gray-400" />
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
