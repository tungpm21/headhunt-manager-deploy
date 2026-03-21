import { getEmployerDashboardData } from "@/lib/employer-actions";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  Users,
  UserPlus,
  BarChart3,
  FileText,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export default async function EmployerDashboardPage() {
  const data = await getEmployerDashboardData();
  const { stats, recentJobs, recentApplications, employer } = data;

  const statCards = [
    {
      label: "Tổng tin đăng",
      value: stats.totalJobs,
      icon: Briefcase,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      label: "Đang chờ duyệt",
      value: stats.pendingJobs,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Đang hiển thị",
      value: stats.approvedJobs,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Ứng viên mới",
      value: stats.newApplicants,
      icon: UserPlus,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Xin chào, {employer.companyName} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Đây là tổng quan tuyển dụng của bạn hôm nay.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quota Progress */}
      {stats.quotaTotal > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">Quota đăng tin</h2>
              <p className="text-sm text-gray-500">
                Đã dùng {stats.quotaUsed}/{stats.quotaTotal} tin
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((stats.quotaUsed / stats.quotaTotal) * 100, 100)}%`,
              }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Còn lại {Math.max(stats.quotaTotal - stats.quotaUsed, 0)} tin
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <FileText className="h-5 w-5 text-teal-600" />
            <h2 className="font-semibold text-gray-800">Tin tuyển dụng gần đây</h2>
          </div>
          {recentJobs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Chưa có tin nào. Bắt đầu đăng tin tuyển dụng!
            </p>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {job.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {job._count.applications} ứng viên
                    </p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <Users className="h-5 w-5 text-teal-600" />
            <h2 className="font-semibold text-gray-800">Ứng viên mới nhất</h2>
          </div>
          {recentApplications.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Chưa có ứng viên nào nộp hồ sơ.
            </p>
          ) : (
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {app.fullName}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {app.jobPosting.title}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-3">
                    {formatDistanceToNow(new Date(app.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    DRAFT: { label: "Nháp", className: "bg-gray-100 text-gray-600" },
    PENDING: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700" },
    APPROVED: { label: "Đang hiển thị", className: "bg-emerald-100 text-emerald-700" },
    REJECTED: { label: "Bị từ chối", className: "bg-red-100 text-red-700" },
    EXPIRED: { label: "Hết hạn", className: "bg-gray-100 text-gray-500" },
    PAUSED: { label: "Tạm ẩn", className: "bg-blue-100 text-blue-600" },
  };

  const { label, className } = config[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-600",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
