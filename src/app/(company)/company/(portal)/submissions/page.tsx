import {
  JobCandidateStage,
  Prisma,
  SubmissionResult,
} from "@prisma/client";
import { Send } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import {
  CompanySubmissionsInbox,
  type CompanySubmissionItem,
  type CompanySubmissionsFilters,
  type CompanySubmissionsJobOption,
} from "@/components/company/CompanySubmissionsInbox";
import { requireCompanyPortalSession } from "@/lib/company-portal-auth";
import { prisma } from "@/lib/prisma";
import { withWorkspaceSubmissionAccess } from "@/lib/workspace";

export const metadata = { title: "Submissions - Company Portal" };

const PAGE_SIZE = 25;
const STAGE_VALUES = new Set<string>(Object.values(JobCandidateStage));
const RESULT_VALUES = new Set<string>(Object.values(SubmissionResult));

interface PageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    stage?: string;
    result?: string;
    job?: string;
    feedback?: string;
    selected?: string;
  }>;
}

function parsePositiveInt(value: string | undefined) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function buildSubmissionWhere(
  workspaceId: number,
  filters: CompanySubmissionsFilters
) {
  const and: Prisma.JobCandidateWhereInput[] = [
    withWorkspaceSubmissionAccess(workspaceId),
  ];

  if (filters.stage && filters.stage !== "ALL" && STAGE_VALUES.has(filters.stage)) {
    and.push({ stage: filters.stage as JobCandidateStage });
  }

  if (
    filters.result &&
    filters.result !== "ALL" &&
    RESULT_VALUES.has(filters.result)
  ) {
    and.push({ result: filters.result as SubmissionResult });
  }

  const jobOrderId = parsePositiveInt(filters.job);
  if (jobOrderId) {
    and.push({ jobOrderId });
  }

  const keyword = filters.q.trim();
  if (keyword) {
    and.push({
      OR: [
        { candidate: { fullName: { contains: keyword, mode: "insensitive" } } },
        { candidate: { email: { contains: keyword, mode: "insensitive" } } },
        { candidate: { phone: { contains: keyword, mode: "insensitive" } } },
        {
          candidate: {
            currentPosition: { contains: keyword, mode: "insensitive" },
          },
        },
        { jobOrder: { title: { contains: keyword, mode: "insensitive" } } },
      ],
    });
  }

  if (filters.feedback === "with") {
    and.push({ feedback: { some: { workspaceId } } });
  } else if (filters.feedback === "without") {
    and.push({ feedback: { none: { workspaceId } } });
  }

  return { AND: and } satisfies Prisma.JobCandidateWhereInput;
}

export default async function CompanySubmissionsPage({
  searchParams,
}: PageProps) {
  const session = await requireCompanyPortalSession();

  if (!session.capabilities.client) {
    return (
      <div className="rounded-xl border border-border bg-surface p-12 text-center text-muted">
        <Send className="mx-auto mb-3 h-10 w-10 opacity-40" />
        <p className="text-lg font-medium text-foreground">
          Workspace chưa liên kết Client
        </p>
        <p className="mt-1 text-sm">
          Liên hệ admin để bật tính năng review submissions.
        </p>
      </div>
    );
  }

  const params = await searchParams;
  const page = Math.max(1, parsePositiveInt(params.page) ?? 1);
  const filters: CompanySubmissionsFilters = {
    q: params.q?.trim() ?? "",
    stage:
      params.stage && (params.stage === "ALL" || STAGE_VALUES.has(params.stage))
        ? params.stage
        : "ALL",
    result:
      params.result && (params.result === "ALL" || RESULT_VALUES.has(params.result))
        ? params.result
        : "ALL",
    job: params.job ?? "",
    feedback:
      params.feedback === "with" || params.feedback === "without"
        ? params.feedback
        : "",
    selected: params.selected ?? "",
  };

  const where = buildSubmissionWhere(session.workspaceId, filters);
  const accessWhere = withWorkspaceSubmissionAccess(session.workspaceId);

  const [submissions, total, jobs, groupedStages] = await Promise.all([
    prisma.jobCandidate.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        stage: true,
        result: true,
        interviewDate: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        candidate: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            currentPosition: true,
            currentCompany: true,
            industry: true,
            yearsOfExp: true,
            location: true,
            level: true,
            skills: true,
            cvFileUrl: true,
            cvFileName: true,
          },
        },
        jobOrder: {
          select: {
            id: true,
            title: true,
            status: true,
            industry: true,
            location: true,
          },
        },
        feedback: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            decision: true,
            message: true,
            createdAt: true,
            authorPortalUser: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    }),
    prisma.jobCandidate.count({ where }),
    prisma.jobOrder.findMany({
      where: {
        client: {
          workspace: { id: session.workspaceId },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        title: true,
        status: true,
        _count: { select: { candidates: true } },
      },
    }),
    prisma.jobCandidate.groupBy({
      by: ["stage"],
      where: accessWhere,
      _count: { _all: true },
    }),
  ]);

  const serializedSubmissions: CompanySubmissionItem[] = submissions.map(
    (submission) => ({
      ...submission,
      stage: submission.stage,
      result: submission.result,
      interviewDate: submission.interviewDate?.toISOString() ?? null,
      createdAt: submission.createdAt.toISOString(),
      updatedAt: submission.updatedAt.toISOString(),
      feedback: submission.feedback.map((feedback) => ({
        ...feedback,
        decision: feedback.decision,
        createdAt: feedback.createdAt.toISOString(),
      })),
    })
  );

  const jobOptions: CompanySubmissionsJobOption[] = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    status: job.status,
    submissions: job._count.candidates,
  }));

  const stageCounts = Object.fromEntries(
    groupedStages.map((item) => [item.stage, item._count._all])
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold text-foreground">
          <Send className="h-7 w-7 text-primary" />
          Submissions
        </h1>
        <p className="mt-1 text-sm text-muted">
          Xem hồ sơ đã gửi cho công ty và phản hồi cho đội tuyển dụng.
        </p>
      </div>

      <CompanySubmissionsInbox
        submissions={serializedSubmissions}
        jobs={jobOptions}
        filters={filters}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        stageCounts={stageCounts}
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
