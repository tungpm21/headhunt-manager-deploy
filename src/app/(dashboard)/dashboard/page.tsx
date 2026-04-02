import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowRight,
  Briefcase,
  Building2,
  FileDown,
  FileSpreadsheet,
  UserPlus,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  getNewApplicationsCount,
  getRecentApplications,
} from "@/lib/moderation-actions";
import { PipelineSummary } from "@/components/dashboard/pipeline-summary";

export const metadata = { title: "Dashboard — Headhunt Manager" };

export default async function DashboardPage() {
  const [
    candidateCount,
    clientCount,
    openJobCount,
    newAppCount,
    recentJobs,
    recentCandidates,
    recentApps,
    pipelineStageCounts,
  ] = await Promise.all([
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
    prisma.jobCandidate.groupBy({
      by: ["stage"],
      _count: { id: true },
      where: {
        jobOrder: {
          status: "OPEN",
        },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-gradient-to-r from-primary to-blue-600 p-6 text-white shadow-sm sm:flex-row sm:items-center sm:p-10">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Chào mừng trở lại!</h1>
          <p className="mt-2 max-w-xl text-white/80">
            Tổng quan công việc hệ thống Headhunt Manager hôm nay. Có {openJobCount} vị
            trí đang cần tuyển dụng.
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <Link
            href="/import"
            className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2.5 text-sm font-medium transition hover:bg-white/30"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Import Data
          </Link>
          <Link
            href="/jobs/new"
            className="inline-flex items-center gap-2 rounded-lg bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-background"
          >
            <Briefcase className="h-4 w-4" />
            Tạo Job Mới
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="flex items-center gap-4 rounded-xl border bg-surface p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted">Tổng ứng viên</p>
            <p className="text-2xl font-bold text-foreground">{candidateCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border bg-surface p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-green-600">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted">Doanh nghiệp KH</p>
            <p className="text-2xl font-bold text-foreground">{clientCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border bg-surface p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted">Job đang mở</p>
            <p className="text-2xl font-bold text-foreground">{openJobCount}</p>
          </div>
        </div>

        <Link
          href="/moderation/applications"
          className="group flex items-center gap-4 rounded-xl border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            <FileDown className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted">CV mới (FDIWork)</p>
            <p className="text-2xl font-bold text-foreground">{newAppCount}</p>
          </div>
        </Link>
      </div>

      <PipelineSummary
        stageData={pipelineStageCounts.map((item) => ({
          stage: item.stage,
          count: item._count.id,
        }))}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col overflow-hidden rounded-xl border bg-surface shadow-sm">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold text-foreground">Job gần đây</h2>
            <Link href="/jobs" className="flex items-center text-sm text-primary hover:underline">
              Xem tất cả <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          <div className="m-0 flex-1 divide-y p-0">
            {recentJobs.length === 0 ? (
              <p className="flex flex-col items-center gap-2 p-6 text-center text-sm text-muted">
                <Briefcase className="h-8 w-8 text-muted/20" />
                Chưa có job nào —
                <Link href="/jobs/new" className="text-primary hover:underline">
                  tạo job mới
                </Link>
              </p>
            ) : (
              recentJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block p-4 transition hover:bg-background"
                >
                  <div className="truncate text-sm font-medium text-foreground">
                    {job.title}
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="flex items-center text-xs text-muted">
                      <Building2 className="mr-1 inline h-3 w-3" />
                      {job.client.companyName}
                    </span>
                    <span className="text-xs text-muted/60">
                      {formatDistanceToNow(new Date(job.createdAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col overflow-hidden rounded-xl border bg-surface shadow-sm">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold text-foreground">Ứng viên mới</h2>
            <Link
              href="/candidates"
              className="flex items-center text-sm text-primary hover:underline"
            >
              Xem tất cả <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          <div className="m-0 flex-1 divide-y p-0">
            {recentCandidates.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted">Chưa có ứng viên nào</p>
            ) : (
              recentCandidates.map((candidate) => (
                <Link
                  key={candidate.id}
                  href={`/candidates/${candidate.id}`}
                  className="block p-4 transition hover:bg-background"
                >
                  <div className="flex items-center text-sm font-medium text-foreground">
                    <UserPlus className="mr-1.5 h-3.5 w-3.5 text-muted/60" />
                    {candidate.fullName}
                  </div>
                  <div className="ml-5 mt-1 flex items-center justify-between">
                    <span className="text-xs text-muted">
                      {candidate.currentPosition || "Chưa rõ"} • {candidate.industry}
                    </span>
                    <span className="text-xs text-muted/60">
                      {formatDistanceToNow(new Date(candidate.createdAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col overflow-hidden rounded-xl border bg-surface shadow-sm">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="flex items-center gap-2 font-semibold text-foreground">
              <FileDown className="h-4 w-4 text-teal-600" />
              CV từ FDIWork
            </h2>
            <Link
              href="/moderation/applications"
              className="flex items-center text-sm text-primary hover:underline"
            >
              Xem tất cả <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          <div className="m-0 flex-1 divide-y p-0">
            {recentApps.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted">Chưa có đơn nào</p>
            ) : (
              recentApps.map((app) => (
                <Link
                  key={app.id}
                  href="/moderation/applications"
                  className="block p-4 transition hover:bg-background"
                >
                  <div className="truncate text-sm font-medium text-foreground">
                    {app.fullName}
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="max-w-[70%] truncate text-xs text-muted">
                      {app.jobPosting.title} • {app.jobPosting.employer.companyName}
                    </span>
                    <span className="text-xs text-muted/60">
                      {formatDistanceToNow(new Date(app.createdAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
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
