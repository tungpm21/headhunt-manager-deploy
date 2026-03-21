import { prisma } from "@/lib/prisma";
import { getNewApplicationsCount, getRecentApplications } from "@/lib/moderation-actions";
import Link from "next/link";
import { Users, Building2, Briefcase, ArrowRight, UserPlus, FileSpreadsheet, FileDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export const metadata = { title: "Dashboard — Headhunt Manager" };

export default async function DashboardPage() {
  const [candidateCount, clientCount, openJobCount, newAppCount, recentJobs, recentCandidates, recentApps] = await Promise.all([
    prisma.candidate.count(),
    prisma.client.count({ where: { isDeleted: false } }),
    prisma.jobOrder.count({ where: { status: "OPEN" } }),
    getNewApplicationsCount(),
    prisma.jobOrder.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { client: true },
    }),
    prisma.candidate.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    getRecentApplications(5),
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-6 sm:p-10 shadow-sm text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Chào mừng trở lại!</h1>
          <p className="mt-2 text-white/80 max-w-xl">
            Tổng quan công việc hệ thống Headhunt Manager hôm nay. Có {openJobCount} vị trí đang cần tuyển dụng.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link href="/import" className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 transition px-4 py-2.5 rounded-lg text-sm font-medium">
            <FileSpreadsheet className="h-4 w-4" /> Import Data
          </Link>
          <Link href="/jobs/new" className="inline-flex items-center gap-2 bg-white text-primary hover:bg-gray-50 transition px-4 py-2.5 rounded-lg text-sm font-medium">
            <Briefcase className="h-4 w-4" /> Tạo Job Mới
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-xl border p-6 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tổng ứng viên</p>
            <p className="text-2xl font-bold text-gray-900">{candidateCount}</p>
          </div>
        </div>
        
        {/* Card 2 */}
        <div className="bg-white rounded-xl border p-6 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-green-600">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Doanh nghiệp KH</p>
            <p className="text-2xl font-bold text-gray-900">{clientCount}</p>
          </div>
        </div>
        
        {/* Card 3 */}
        <div className="bg-white rounded-xl border p-6 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Job đang mở</p>
            <p className="text-2xl font-bold text-gray-900">{openJobCount}</p>
          </div>
        </div>

        {/* Card 4 — FDIWork Applications */}
        <Link href="/moderation/applications" className="bg-white rounded-xl border p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow group">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            <FileDown className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">CV mới (FDIWork)</p>
            <p className="text-2xl font-bold text-gray-900">{newAppCount}</p>
          </div>
        </Link>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Jobs */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Job gần đây</h2>
            <Link href="/jobs" className="text-sm text-primary hover:underline flex items-center">
              Xem tất cả <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <div className="divide-y p-0 m-0 flex-1">
            {recentJobs.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">Chưa có job nào</p>
            ) : (
              recentJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="block p-4 hover:bg-gray-50 transition">
                  <div className="font-medium text-gray-900 text-sm truncate">{job.title}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500 flex items-center"><Building2 className="h-3 w-3 mr-1 inline"/> {job.client.companyName}</span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: vi })}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Candidates */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Ứng viên mới</h2>
            <Link href="/candidates" className="text-sm text-primary hover:underline flex items-center">
              Xem tất cả <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <div className="divide-y p-0 m-0 flex-1">
            {recentCandidates.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">Chưa có ứng viên nào</p>
            ) : (
              recentCandidates.map((c) => (
                <Link key={c.id} href={`/candidates/${c.id}`} className="block p-4 hover:bg-gray-50 transition">
                  <div className="font-medium text-gray-900 text-sm flex items-center">
                    <UserPlus className="h-3.5 w-3.5 mr-1.5 text-gray-400" /> {c.fullName}
                  </div>
                  <div className="flex items-center justify-between mt-1 ml-5">
                    <span className="text-xs text-gray-500">{c.currentPosition || "Chưa rõ"} • {c.industry}</span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true, locale: vi })}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* FDIWork Applications */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <FileDown className="h-4 w-4 text-teal-600" />
              CV từ FDIWork
            </h2>
            <Link href="/moderation/applications" className="text-sm text-primary hover:underline flex items-center">
              Xem tất cả <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <div className="divide-y p-0 m-0 flex-1">
            {recentApps.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">Chưa có đơn nào</p>
            ) : (
              recentApps.map((app) => (
                <Link key={app.id} href="/moderation/applications" className="block p-4 hover:bg-gray-50 transition">
                  <div className="font-medium text-gray-900 text-sm truncate">{app.fullName}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500 truncate max-w-[70%]">
                      {app.jobPosting.title} • {app.jobPosting.employer.companyName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true, locale: vi })}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
