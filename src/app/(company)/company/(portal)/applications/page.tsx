import { ApplicationStatus, Prisma } from "@prisma/client";
import { Mail } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import {
  CompanyApplicationsInbox,
  type CompanyApplicationItem,
  type CompanyApplicationsFilters,
  type CompanyApplicationsJobOption,
} from "@/components/company/CompanyApplicationsInbox";
import { requireCompanyPortalSession } from "@/lib/company-portal-auth";
import { prisma } from "@/lib/prisma";
import { withWorkspaceApplicationAccess } from "@/lib/workspace";

export const metadata = { title: "Ứng tuyển - Company Portal" };

const PAGE_SIZE = 25;
const STATUS_VALUES = new Set<string>(Object.values(ApplicationStatus));

interface PageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
    job?: string;
    cv?: string;
    imported?: string;
    from?: string;
    to?: string;
    selected?: string;
  }>;
}

function parsePositiveInt(value: string | undefined) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseDateStart(value: string | undefined) {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00.000`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseDateEnd(value: string | undefined) {
  if (!value) return null;
  const parsed = new Date(`${value}T23:59:59.999`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildApplicationWhere(
  workspaceId: number,
  filters: CompanyApplicationsFilters
) {
  const and: Prisma.ApplicationWhereInput[] = [
    withWorkspaceApplicationAccess(workspaceId),
  ];

  if (filters.status && filters.status !== "ALL" && STATUS_VALUES.has(filters.status)) {
    and.push({ status: filters.status as ApplicationStatus });
  }

  const jobPostingId = parsePositiveInt(filters.job);
  if (jobPostingId) {
    and.push({ jobPostingId });
  }

  const keyword = filters.q.trim();
  if (keyword) {
    and.push({
      OR: [
        { fullName: { contains: keyword, mode: "insensitive" } },
        { email: { contains: keyword, mode: "insensitive" } },
        { phone: { contains: keyword, mode: "insensitive" } },
        {
          jobPosting: {
            title: { contains: keyword, mode: "insensitive" },
          },
        },
      ],
    });
  }

  if (filters.cv === "with") {
    and.push({ cvFileUrl: { not: null } });
  } else if (filters.cv === "without") {
    and.push({ cvFileUrl: null });
  }

  if (filters.imported === "imported") {
    and.push({
      OR: [{ status: "IMPORTED" }, { candidateId: { not: null } }],
    });
  } else if (filters.imported === "not-imported") {
    and.push({
      status: { not: "IMPORTED" },
      candidateId: null,
    });
  }

  const from = parseDateStart(filters.from);
  const to = parseDateEnd(filters.to);
  if (from || to) {
    and.push({
      createdAt: {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      },
    });
  }

  return { AND: and } satisfies Prisma.ApplicationWhereInput;
}

export default async function CompanyApplicationsPage({
  searchParams,
}: PageProps) {
  const session = await requireCompanyPortalSession();

  if (!session.capabilities.employer) {
    return (
      <div className="rounded-xl border border-border bg-surface p-12 text-center text-muted">
        <Mail className="mx-auto mb-3 h-10 w-10 opacity-40" />
        <p className="text-lg font-medium text-foreground">
          Workspace chưa liên kết Employer
        </p>
        <p className="mt-1 text-sm">
          Liên hệ admin để bật tính năng quản lý ứng tuyển.
        </p>
      </div>
    );
  }

  const params = await searchParams;
  const page = Math.max(1, parsePositiveInt(params.page) ?? 1);
  const filters: CompanyApplicationsFilters = {
    q: params.q?.trim() ?? "",
    status: params.status && (params.status === "ALL" || STATUS_VALUES.has(params.status))
      ? params.status
      : "ALL",
    job: params.job ?? "",
    cv: params.cv === "with" || params.cv === "without" ? params.cv : "",
    imported:
      params.imported === "imported" || params.imported === "not-imported"
        ? params.imported
        : "",
    from: params.from ?? "",
    to: params.to ?? "",
    selected: params.selected ?? "",
  };

  const where = buildApplicationWhere(session.workspaceId, filters);
  const accessWhere = withWorkspaceApplicationAccess(session.workspaceId);

  const [applications, total, jobs, groupedStatuses] = await Promise.all([
    prisma.application.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        coverLetter: true,
        cvFileUrl: true,
        cvFileName: true,
        status: true,
        candidateId: true,
        createdAt: true,
        updatedAt: true,
        jobPosting: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
          },
        },
      },
    }),
    prisma.application.count({ where }),
    prisma.jobPosting.findMany({
      where: {
        employer: {
          workspace: { id: session.workspaceId },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        title: true,
        status: true,
        _count: { select: { applications: true } },
      },
    }),
    prisma.application.groupBy({
      by: ["status"],
      where: accessWhere,
      _count: { _all: true },
    }),
  ]);

  const serializedApplications: CompanyApplicationItem[] = applications.map(
    (application) => ({
      ...application,
      status: application.status,
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString(),
    })
  );

  const jobOptions: CompanyApplicationsJobOption[] = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    status: job.status,
    applications: job._count.applications,
  }));

  const statusCounts = Object.fromEntries(
    groupedStatuses.map((item) => [item.status, item._count._all])
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold text-foreground">
          <Mail className="h-7 w-7 text-primary" />
          Hồ sơ ứng tuyển
        </h1>
        <p className="mt-1 text-sm text-muted">
          Quản lý hồ sơ ứng viên theo inbox, lọc nhanh và cập nhật trạng thái rõ ràng.
        </p>
      </div>

      <CompanyApplicationsInbox
        applications={serializedApplications}
        jobs={jobOptions}
        filters={filters}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        statusCounts={statusCounts}
      />

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          total={total}
          pageSize={PAGE_SIZE}
        />
      )}
    </div>
  );
}
