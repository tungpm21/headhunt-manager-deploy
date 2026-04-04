import Link from "next/link";
import { addDays, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Prisma } from "@prisma/client";
import {
  ArrowRight,
  BadgeDollarSign,
  BellRing,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileDown,
  FileSpreadsheet,
  Target,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { DeadlineAlerts } from "@/components/dashboard/deadline-alerts";
import { FollowUpReminders } from "@/components/dashboard/follow-up-reminders";
import { PipelineSummary } from "@/components/dashboard/pipeline-summary";
import { requireViewerScope } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { getUpcomingCandidateReminders } from "@/lib/reminders";
import { getDashboardRevenueSummary } from "@/lib/revenue";
import { expireSubscriptionsIfNeeded } from "@/lib/subscriptions";
import { formatVnd } from "@/lib/utils";
import { ViewerScope } from "@/lib/viewer-scope";

export const metadata = { title: "Dashboard - Headhunt Manager" };

type PipelineOverviewJob = {
  id: number;
  title: string;
  quantity: number;
  client: {
    companyName: string;
  };
  candidates: {
    stage: "SOURCED" | "CONTACTED" | "INTERVIEW" | "OFFER" | "PLACED" | "REJECTED";
  }[];
};

type RecentActivityLog = {
  id: number;
  type: string;
  entityId: number;
  metadata: unknown;
  createdAt: Date;
  user: {
    name: string | null;
  };
};

const stageLabelMap = {
  SOURCED: "Sourced",
  CONTACTED: "Contacted",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  PLACED: "Placed",
  REJECTED: "Rejected",
} as const;

const statusLabelMap = {
  AVAILABLE: "San sang",
  EMPLOYED: "Da co viec",
  INTERVIEWING: "Dang phong van",
  BLACKLIST: "Blacklist",
} as const;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function getString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function getNumber(value: unknown) {
  return typeof value === "number" ? value : undefined;
}

function withCandidateAccess(
  where: Prisma.CandidateWhereInput,
  scope: ViewerScope
): Prisma.CandidateWhereInput {
  if (scope.isAdmin) {
    return where;
  }

  return {
    AND: [where, { createdById: scope.userId }],
  };
}

function withClientAccess(
  where: Prisma.ClientWhereInput,
  scope: ViewerScope
): Prisma.ClientWhereInput {
  if (scope.isAdmin) {
    return where;
  }

  return {
    AND: [where, { createdById: scope.userId }],
  };
}

function withJobAccess(
  where: Prisma.JobOrderWhereInput,
  scope: ViewerScope
): Prisma.JobOrderWhereInput {
  if (scope.isAdmin) {
    return where;
  }

  return {
    AND: [
      where,
      {
        OR: [{ createdById: scope.userId }, { assignedToId: scope.userId }],
      },
    ],
  };
}

function mapActivityItems(recentActivityLogs: RecentActivityLog[]) {
  return recentActivityLogs.map((activity) => {
    const metadata = asRecord(activity.metadata);
    const candidateName = getString(metadata.candidateName) ?? `Ung vien #${activity.entityId}`;
    const jobTitle = getString(metadata.jobTitle);
    const jobOrderId = getNumber(metadata.jobOrderId);
    const actorName = activity.user.name ?? "He thong";

    if (activity.type === "STAGE_CHANGE") {
      const toStage = getString(metadata.to);
      return {
        id: String(activity.id),
        type: "STAGE_CHANGE" as const,
        actorName,
        title: `${candidateName} -> ${
          toStage && toStage in stageLabelMap
            ? stageLabelMap[toStage as keyof typeof stageLabelMap]
            : toStage ?? "Cap nhat stage"
        }`,
        subtitle: jobTitle ? `Job: ${jobTitle}` : undefined,
        href: jobOrderId ? `/jobs/${jobOrderId}` : `/candidates/${activity.entityId}`,
        timestamp: activity.createdAt,
      };
    }

    if (activity.type === "STATUS_CHANGE") {
      const toStatus = getString(metadata.to);
      return {
        id: String(activity.id),
        type: "STATUS_CHANGE" as const,
        actorName,
        title: `${candidateName} -> ${
          toStatus && toStatus in statusLabelMap
            ? statusLabelMap[toStatus as keyof typeof statusLabelMap]
            : toStatus ?? "Cap nhat trang thai"
        }`,
        subtitle: "Cap nhat trang thai ung vien",
        href: `/candidates/${activity.entityId}`,
        timestamp: activity.createdAt,
      };
    }

    if (
      activity.type === "REMINDER_CREATED" ||
      activity.type === "REMINDER_COMPLETED"
    ) {
      const reminderTitle = getString(metadata.reminderTitle) ?? "Nhac viec";
      const assignedTo = getString(metadata.assignedTo);

      return {
        id: String(activity.id),
        type: "REMINDER" as const,
        actorName,
        title:
          activity.type === "REMINDER_CREATED"
            ? `Tao nhac viec cho ${candidateName}: ${reminderTitle}`
            : `Hoan thanh nhac viec cho ${candidateName}: ${reminderTitle}`,
        subtitle:
          activity.type === "REMINDER_CREATED"
            ? assignedTo
              ? `Phu trach: ${assignedTo}`
              : "Da tao follow-up moi"
            : "Follow-up da duoc danh dau hoan thanh",
        href: `/candidates/${activity.entityId}`,
        timestamp: activity.createdAt,
      };
    }

    if (activity.type === "NOTE") {
      return {
        id: String(activity.id),
        type: "NOTE" as const,
        actorName,
        title: `Them ghi chu cho ${candidateName}`,
        subtitle: getString(metadata.preview),
        href: `/candidates/${activity.entityId}`,
        timestamp: activity.createdAt,
      };
    }

    return {
      id: String(activity.id),
      type: "IMPORT" as const,
      actorName,
      title: `Import ${candidateName} tu FDIWork`,
      subtitle: jobTitle ? `Nguon: ${jobTitle}` : "Ung vien duoc dua vao CRM",
      href: jobOrderId ? `/jobs/${jobOrderId}` : `/candidates/${activity.entityId}`,
      timestamp: activity.createdAt,
    };
  });
}

export default async function DashboardPage() {
  const scope = await requireViewerScope();
  await expireSubscriptionsIfNeeded();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const candidateWhere = withCandidateAccess({ isDeleted: false }, scope);
  const clientWhere = withClientAccess({ isDeleted: false }, scope);
  const openJobWhere = withJobAccess({ status: "OPEN" }, scope);
  const memberCandidateIds = scope.isAdmin
    ? []
    : (
        await prisma.candidate.findMany({
          where: candidateWhere,
          select: { id: true },
        })
      ).map((candidate) => candidate.id);

  const [
    candidateCount,
    clientCount,
    openJobCount,
    newAppCount,
    recentJobs,
    recentCandidates,
    recentApps,
    jobsClosingSoon,
    subscriptionsEndingSoon,
    placementsThisMonth,
    filledJobCount,
    closedJobCount,
    placedPipelineItems,
    pipelineOverviewJobs,
    upcomingReminders,
    recentActivityLogs,
    revenueSummary,
  ] = await Promise.all([
    prisma.candidate.count({ where: candidateWhere }),
    prisma.client.count({ where: clientWhere }),
    prisma.jobOrder.count({ where: openJobWhere }),
    scope.isAdmin
      ? prisma.application.count({ where: { status: "NEW" } })
      : Promise.resolve(0),
    prisma.jobOrder.findMany({
      where: withJobAccess({}, scope),
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { client: true },
    }),
    prisma.candidate.findMany({
      where: candidateWhere,
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        currentPosition: true,
        industry: true,
        createdAt: true,
      },
    }),
    scope.isAdmin
      ? prisma.application.findMany({
          where: { status: { in: ["NEW", "REVIEWED", "SHORTLISTED"] } },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            jobPosting: {
              select: { title: true, employer: { select: { companyName: true } } },
            },
          },
        })
      : Promise.resolve([]),
    prisma.jobOrder.findMany({
      where: withJobAccess(
        {
          status: "OPEN",
          deadline: {
            gte: now,
            lte: addDays(now, 7),
          },
        },
        scope
      ),
      select: {
        id: true,
        title: true,
        deadline: true,
        client: { select: { companyName: true } },
      },
      orderBy: { deadline: "asc" },
      take: 5,
    }),
    scope.isAdmin
      ? prisma.subscription.findMany({
          where: {
            status: "ACTIVE",
            endDate: {
              gte: now,
              lte: addDays(now, 14),
            },
          },
          select: {
            id: true,
            tier: true,
            endDate: true,
            employer: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
          orderBy: { endDate: "asc" },
          take: 5,
        })
      : Promise.resolve([]),
    prisma.jobCandidate.count({
      where: {
        stage: "PLACED",
        updatedAt: {
          gte: startOfMonth,
        },
        jobOrder: withJobAccess({}, scope),
      },
    }),
    prisma.jobOrder.count({
      where: withJobAccess(
        {
          status: "FILLED",
        },
        scope
      ),
    }),
    prisma.jobOrder.count({
      where: withJobAccess(
        {
          status: {
            in: ["FILLED", "CANCELLED"],
          },
        },
        scope
      ),
    }),
    prisma.jobCandidate.findMany({
      where: {
        stage: "PLACED",
        jobOrder: withJobAccess({}, scope),
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.jobOrder.findMany({
      where: openJobWhere,
      take: 6,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        quantity: true,
        client: { select: { companyName: true } },
        candidates: {
          select: {
            stage: true,
          },
        },
      },
    }),
    getUpcomingCandidateReminders(now, 8, scope),
    scope.isAdmin
      ? prisma.activityLog.findMany({
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        })
      : memberCandidateIds.length > 0
        ? prisma.activityLog.findMany({
            where: {
              entityType: "CANDIDATE",
              entityId: {
                in: memberCandidateIds,
              },
            },
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          })
        : Promise.resolve([]),
    getDashboardRevenueSummary(now, scope),
  ]);

  const pipelineJobs = (pipelineOverviewJobs as PipelineOverviewJob[]).map((job) => {
    const stageCounts = job.candidates.reduce(
      (acc, candidate) => {
        acc[candidate.stage] += 1;
        return acc;
      },
      {
        SOURCED: 0,
        CONTACTED: 0,
        INTERVIEW: 0,
        OFFER: 0,
        PLACED: 0,
        REJECTED: 0,
      }
    );

    return {
      id: job.id,
      title: job.title,
      companyName: job.client.companyName,
      quantity: job.quantity,
      totalCandidates: job.candidates.length,
      stageCounts,
    };
  });

  const activityItems = mapActivityItems(recentActivityLogs as RecentActivityLog[]);
  const fillRate =
    closedJobCount > 0 ? Math.round((filledJobCount / closedJobCount) * 100) : 0;
  const averageFillTime =
    placedPipelineItems.length > 0
      ? Math.round(
          placedPipelineItems.reduce((sum, item) => {
            const diffMs = item.updatedAt.getTime() - item.createdAt.getTime();
            return sum + diffMs / (1000 * 60 * 60 * 24);
          }, 0) / placedPipelineItems.length
        )
      : 0;
  const revenueThisMonth =
    revenueSummary.headhuntRevenueThisMonth + revenueSummary.subscriptionRevenueThisMonth;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-gradient-to-r from-primary to-blue-600 p-6 text-white shadow-sm sm:flex-row sm:items-center sm:p-10">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Chao mung tro lai!</h1>
          <p className="mt-2 max-w-xl text-white/80">
            Tong quan cong viec Headhunt Manager hom nay. Co {openJobCount} job dang
            mo trong scope cua ban.
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
            Tao Job Moi
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="flex items-center gap-4 rounded-xl border bg-surface p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted">Tong ung vien</p>
            <p className="text-2xl font-bold text-foreground">{candidateCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border bg-surface p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-green-600">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted">Doanh nghiep KH</p>
            <p className="text-2xl font-bold text-foreground">{clientCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border bg-surface p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted">Job dang mo</p>
            <p className="text-2xl font-bold text-foreground">{openJobCount}</p>
          </div>
        </div>

        {scope.isAdmin ? (
          <Link
            href="/moderation/applications"
            className="group flex items-center gap-4 rounded-xl border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <FileDown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">CV moi (FDIWork)</p>
              <p className="text-2xl font-bold text-foreground">{newAppCount}</p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-4 rounded-xl border bg-surface p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <BellRing className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Nhac viec sap den han</p>
              <p className="text-2xl font-bold text-foreground">{upcomingReminders.length}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Placements</p>
              <p className="text-2xl font-bold text-foreground">{placementsThisMonth}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            So ung vien da nhan viec trong thang nay.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Fill Rate</p>
              <p className="text-2xl font-bold text-foreground">{fillRate}%</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            Ty le job da lap tren tong so job da dong trong scope cua ban.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Avg Fill Time</p>
              <p className="text-2xl font-bold text-foreground">{averageFillTime} ngay</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            Trung binh tu luc gan ung vien den khi chuyen sang stage placed.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <BadgeDollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Tong doanh thu</p>
              <p className="text-2xl font-bold text-foreground">
                {formatVnd(revenueSummary.totalRevenue)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            Gom headhunt revenue da chot va gia tri subscription trong pham vi hien thi.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Headhunt da chot</p>
              <p className="text-2xl font-bold text-foreground">
                {formatVnd(revenueSummary.headhuntRevenueTotal)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            Doanh thu tu cac placement da chuyen sang stage PLACED.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Subscription active</p>
              <p className="text-2xl font-bold text-foreground">
                {formatVnd(revenueSummary.subscriptionRevenueActive)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            {revenueSummary.activeSubscriptionCount} goi dang hoat dong trong scope hien thi.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Doanh thu thang nay</p>
              <p className="text-2xl font-bold text-foreground">{formatVnd(revenueThisMonth)}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            {placementsThisMonth} placements va {revenueSummary.subscriptionsSoldThisMonthCount} goi moi trong thang.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <PipelineSummary jobs={pipelineJobs} />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <DeadlineAlerts
            jobs={jobsClosingSoon
              .filter((job) => job.deadline)
              .map((job) => ({
                id: job.id,
                title: job.title,
                deadline: job.deadline as Date,
                companyName: job.client.companyName,
              }))}
            subscriptions={(subscriptionsEndingSoon as Array<{
              id: number;
              tier: string;
              endDate: Date;
              employer: {
                id: number;
                companyName: string;
              };
            }>).map((subscription) => ({
              id: subscription.id,
              tier: subscription.tier,
              endDate: subscription.endDate,
              employerId: subscription.employer.id,
              companyName: subscription.employer.companyName,
            }))}
          />

          <FollowUpReminders items={upcomingReminders} />

          <ActivityFeed items={activityItems} />
        </div>
      </div>

      <div
        className={`grid grid-cols-1 gap-6 ${
          scope.isAdmin ? "xl:grid-cols-4" : "xl:grid-cols-3"
        }`}
      >
        <div className="flex flex-col overflow-hidden rounded-xl border bg-surface shadow-sm xl:col-span-1">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold text-foreground">Job gan day</h2>
            <Link href="/jobs" className="flex items-center text-sm text-primary hover:underline">
              Xem tat ca <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          <div className="m-0 flex-1 divide-y p-0">
            {recentJobs.length === 0 ? (
              <p className="flex flex-col items-center gap-2 p-6 text-center text-sm text-muted">
                <Briefcase className="h-8 w-8 text-muted/20" />
                Chua co job nao -
                <Link href="/jobs/new" className="text-primary hover:underline">
                  tao job moi
                </Link>
              </p>
            ) : (
              recentJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block p-4 transition hover:bg-background"
                >
                  <div className="truncate text-sm font-medium text-foreground">{job.title}</div>
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

        <div
          className={`flex flex-col overflow-hidden rounded-xl border bg-surface shadow-sm ${
            scope.isAdmin ? "xl:col-span-2" : "xl:col-span-2"
          }`}
        >
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold text-foreground">Ung vien moi</h2>
            <Link
              href="/candidates"
              className="flex items-center text-sm text-primary hover:underline"
            >
              Xem tat ca <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          <div className="m-0 flex-1 divide-y p-0">
            {recentCandidates.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted">Chua co ung vien nao</p>
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
                      {candidate.currentPosition || "Chua ro"} •{" "}
                      {candidate.industry || "Chua cap nhat"}
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

        {scope.isAdmin ? (
          <div className="flex flex-col overflow-hidden rounded-xl border bg-surface shadow-sm xl:col-span-1">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="flex items-center gap-2 font-semibold text-foreground">
                <FileDown className="h-4 w-4 text-teal-600" />
                CV tu FDIWork
              </h2>
              <Link
                href="/moderation/applications"
                className="flex items-center text-sm text-primary hover:underline"
              >
                Xem tat ca <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
            <div className="m-0 flex-1 divide-y p-0">
              {(recentApps as Array<{
                id: number;
                fullName: string;
                createdAt: Date;
                jobPosting: {
                  title: string;
                  employer: {
                    companyName: string;
                  };
                };
              }>).length === 0 ? (
                <p className="p-4 text-center text-sm text-muted">Chua co don nao</p>
              ) : (
                (recentApps as Array<{
                  id: number;
                  fullName: string;
                  createdAt: Date;
                  jobPosting: {
                    title: string;
                    employer: {
                      companyName: string;
                    };
                  };
                }>).map((app) => (
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
                        {app.jobPosting.title} - {app.jobPosting.employer.companyName}
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
        ) : null}
      </div>
    </div>
  );
}
