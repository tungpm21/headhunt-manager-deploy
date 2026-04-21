import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getJobPostingDetail,
  getJobApplicants,
} from "@/lib/employer-actions";
import { ArrowLeft, Eye, Users, Clock, MapPin, Briefcase, DollarSign, Calendar, FileText, Pencil } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { JobActionButtons } from "./actions";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Nháp", className: "bg-gray-100 text-gray-600" },
  PENDING: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700" },
  APPROVED: { label: "Đang hiển thị", className: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Bị từ chối", className: "bg-red-100 text-red-700" },
  EXPIRED: { label: "Hết hạn", className: "bg-gray-100 text-gray-500" },
  PAUSED: { label: "Tạm ẩn", className: "bg-blue-100 text-blue-600" },
};

export default async function JobPostingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const jobId = parseInt(id);
  if (isNaN(jobId)) notFound();

  const [job, applicantsData] = await Promise.all([
    getJobPostingDetail(jobId),
    getJobApplicants(jobId),
  ]);

  if (!job) notFound();

  const statusCfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.DRAFT;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            href="/employer/job-postings"
            className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors mt-1"
          >
            <ArrowLeft className="h-4 w-4 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{job.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.className}`}>
                {statusCfg.label}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: vi })}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/employer/job-postings/${job.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 transition-all"
          >
            <Pencil className="h-4 w-4" />
            Chỉnh sửa
          </Link>
          <JobActionButtons jobId={job.id} status={job.status} />
        </div>
      </div>

      {/* Rejected reason */}
      {job.status === "REJECTED" && job.rejectReason && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm font-medium text-red-700">❌ Lý do từ chối:</p>
          <p className="text-sm text-red-600 mt-1">{job.rejectReason}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job details */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
            <Section title="Mô tả công việc" content={job.description} />
            {job.requirements && <Section title="Yêu cầu ứng viên" content={job.requirements} />}
            {job.benefits && <Section title="Phúc lợi" content={job.benefits} />}
          </div>

          {/* Applicants */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-teal-600" />
              Ứng viên đã nộp ({applicantsData?.applicants.length ?? 0})
            </h2>

            {!applicantsData?.applicants.length ? (
              <p className="text-sm text-gray-400 text-center py-6">Chưa có ứng viên nào nộp hồ sơ.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">SĐT</th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">CV</th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">Ngày nộp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicantsData.applicants.map((app: {
                      id: number;
                      fullName: string;
                      email: string;
                      phone: string | null;
                      cvFileUrl: string | null;
                      cvFileName: string | null;
                      createdAt: Date;
                    }) => (
                      <tr key={app.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="py-3 px-2 font-medium text-gray-800">{app.fullName}</td>
                        <td className="py-3 px-2 text-gray-500">{app.email}</td>
                        <td className="py-3 px-2 text-gray-500">{app.phone || "—"}</td>
                        <td className="py-3 px-2">
                          {app.cvFileUrl ? (
                            <a href={app.cvFileUrl} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5" />
                              {app.cvFileName || "Xem CV"}
                            </a>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-gray-400">
                          {format(new Date(app.createdAt), "dd/MM/yyyy", { locale: vi })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Thông tin</h3>
            <InfoRow icon={Eye} label="Lượt xem" value={job.viewCount.toString()} />
            <InfoRow icon={Users} label="Ứng viên" value={job._count.applications.toString()} />
            {job.location && <InfoRow icon={MapPin} label="Khu vực" value={job.location} />}
            {job.industry && <InfoRow icon={Briefcase} label="Ngành" value={job.industry} />}
            {job.salaryDisplay && <InfoRow icon={DollarSign} label="Lương" value={job.salaryDisplay} />}
            {job.workType && <InfoRow icon={Briefcase} label="Hình thức" value={job.workType} />}
            {job.position && <InfoRow icon={Users} label="Cấp bậc" value={job.position} />}
            <InfoRow icon={Briefcase} label="Số lượng" value={`${job.quantity} người`} />
            {job.publishedAt && (
              <InfoRow
                icon={Calendar}
                label="Ngày đăng"
                value={format(new Date(job.publishedAt), "dd/MM/yyyy", { locale: vi })}
              />
            )}
            {job.expiresAt && (
              <InfoRow
                icon={Calendar}
                label="Hết hạn"
                value={format(new Date(job.expiresAt), "dd/MM/yyyy", { locale: vi })}
              />
            )}
          </div>

          {job.skills.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Kỹ năng</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill: string, i: number) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
      <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
        {content}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="flex items-center gap-2 text-sm text-gray-500">
        <Icon className="h-4 w-4 text-gray-400" />
        {label}
      </span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
  );
}
