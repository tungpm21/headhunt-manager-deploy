import Link from "next/link";
import { Prisma, JobCandidateStage, SubmissionResult } from "@prisma/client";
import {
  Briefcase,
  ChevronRight,
  Search,
  SendHorizonal,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { requireViewerScope } from "@/lib/authz";
import { withJobAccess } from "@/lib/access-scope";
import { prisma } from "@/lib/prisma";
import { PIPELINE_RESULTS, PIPELINE_STAGES } from "@/lib/job-pipeline";
import {
  SubmissionResultSelect,
  SubmissionStageSelect,
} from "./submission-inline-controls";

export const metadata = { title: "Submissions - Headhunt Manager" };

type SearchParams = {
  q?: string;
  stage?: string;
  result?: string;
  sort?: string;
  page?: string;
  pageSize?: string;
};

const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;
const STAGE_VALUES = new Set<string>(Object.values(JobCandidateStage));
const RESULT_VALUES = new Set<string>(Object.values(SubmissionResult));

function normalizePageSize(value: string | undefined) {
  const parsed = Number(value);
  return PAGE_SIZE_OPTIONS.includes(parsed as (typeof PAGE_SIZE_OPTIONS)[number])
    ? parsed
    : 20;
}

function getOrderBy(sort: string): Prisma.JobCandidateOrderByWithRelationInput {
  switch (sort) {
    case "updated-asc":
      return { updatedAt: "asc" };
    case "candidate-asc":
      return { candidate: { fullName: "asc" } };
    case "job-asc":
      return { jobOrder: { title: "asc" } };
    default:
      return { updatedAt: "desc" };
  }
}

function buildSubmissionsHref(
  current: {
    q: string;
    stage: string;
    result: string;
    sort: string;
    pageSize: number;
  },
  overrides: Partial<SearchParams>
) {
  const params = new URLSearchParams();
  const next = {
    q: current.q,
    stage: current.stage,
    result: current.result,
    sort: current.sort,
    pageSize: String(current.pageSize),
    ...overrides,
  };

  if (next.q) params.set("q", next.q);
  if (next.stage && next.stage !== "ALL") params.set("stage", next.stage);
  if (next.result && next.result !== "ALL") params.set("result", next.result);
  if (next.sort && next.sort !== "updated-desc") params.set("sort", next.sort);
  if (next.pageSize && next.pageSize !== "20") params.set("pageSize", next.pageSize);
  if (next.page && next.page !== "1") params.set("page", next.page);

  const query = params.toString();
  return query ? `/submissions?${query}` : "/submissions";
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const scope = await requireViewerScope();
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const stageFilter =
    params.stage && STAGE_VALUES.has(params.stage) ? params.stage : "ALL";
  const resultFilter =
    params.result && RESULT_VALUES.has(params.result) ? params.result : "ALL";
  const sort = params.sort ?? "updated-desc";
  const pageSize = normalizePageSize(params.pageSize);
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * pageSize;
  const baseJobAccess = withJobAccess({}, scope);

  const where: Prisma.JobCandidateWhereInput = {
    jobOrder: baseJobAccess,
  };

  if (stageFilter !== "ALL") {
    where.stage = stageFilter as JobCandidateStage;
  }

  if (resultFilter !== "ALL") {
    where.result = resultFilter as SubmissionResult;
  }

  if (query) {
    where.OR = [
      { candidate: { fullName: { contains: query, mode: "insensitive" } } },
      { candidate: { email: { contains: query, mode: "insensitive" } } },
      { candidate: { phone: { contains: query, mode: "insensitive" } } },
      { candidate: { currentPosition: { contains: query, mode: "insensitive" } } },
      { jobOrder: { title: { contains: query, mode: "insensitive" } } },
      { jobOrder: { client: { companyName: { contains: query, mode: "insensitive" } } } },
    ];
  }

  const [submissions, total, stageCounts] = await Promise.all([
    prisma.jobCandidate.findMany({
      where,
      orderBy: getOrderBy(sort),
      skip,
      take: pageSize,
      include: {
        candidate: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            currentPosition: true,
          },
        },
        jobOrder: {
          select: {
            id: true,
            title: true,
            client: { select: { companyName: true } },
          },
        },
      },
    }),
    prisma.jobCandidate.count({ where }),
    prisma.jobCandidate.groupBy({
      by: ["stage"],
      where: { jobOrder: baseJobAccess },
      _count: true,
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);
  const stageCountMap: Record<string, number> = {};
  let totalAll = 0;
  for (const sc of stageCounts) {
    stageCountMap[sc.stage] = sc._count;
    totalAll += sc._count;
  }

  const stageLabel = (stage: string) =>
    PIPELINE_STAGES.find((item) => item.value === stage)?.label ?? stage;
  const resultLabel = (result: string) =>
    PIPELINE_RESULTS.find((item) => item.value === result)?.label ?? result;
  const currentQuery = { q: query, stage: stageFilter, result: resultFilter, sort, pageSize };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <SendHorizonal className="h-6 w-6 text-primary" />
            Submissions
          </h1>
          <p className="mt-1 text-sm text-muted">
            Theo dõi tiến trình gửi hồ sơ ứng viên đến khách hàng.
          </p>
        </div>
        <div className="text-sm text-muted">
          Tổng cộng <span className="font-semibold text-foreground">{totalAll}</span> submissions
        </div>
      </div>

      <form
        action="/submissions"
        className="grid gap-3 rounded-xl border border-border bg-surface p-3 lg:grid-cols-[1fr_170px_170px_170px_120px_auto]"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Tìm ứng viên, job, công ty..."
            className="min-h-10 w-full rounded-lg border border-border bg-background px-3 py-2 pl-10 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/25"
          />
        </div>
        <select name="stage" defaultValue={stageFilter} className="min-h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground">
          <option value="ALL">Tất cả stage</option>
          {PIPELINE_STAGES.map((stage) => (
            <option key={stage.value} value={stage.value}>
              {stage.label}
            </option>
          ))}
        </select>
        <select name="result" defaultValue={resultFilter} className="min-h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground">
          <option value="ALL">Tất cả kết quả</option>
          {PIPELINE_RESULTS.map((result) => (
            <option key={result.value} value={result.value}>
              {result.label}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={sort} className="min-h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground">
          <option value="updated-desc">Mới cập nhật</option>
          <option value="updated-asc">Cũ nhất</option>
          <option value="candidate-asc">Tên ứng viên A-Z</option>
          <option value="job-asc">Job A-Z</option>
        </select>
        <select name="pageSize" defaultValue={pageSize} className="min-h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground">
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}/page
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Lọc
        </button>
      </form>

      <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-surface p-2">
        <Link
          href={buildSubmissionsHref(currentQuery, { stage: "ALL", page: "1" })}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            stageFilter === "ALL"
              ? "bg-primary text-white shadow-sm"
              : "text-muted hover:bg-background hover:text-foreground"
          }`}
        >
          Tất cả ({totalAll})
        </Link>
        {PIPELINE_STAGES.map((stage) => {
          const count = stageCountMap[stage.value] ?? 0;

          return (
            <Link
              key={stage.value}
              href={buildSubmissionsHref(currentQuery, { stage: stage.value, page: "1" })}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                stageFilter === stage.value
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:bg-background hover:text-foreground"
              }`}
            >
              {stage.label} ({count})
            </Link>
          );
        })}
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
          <Users className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-3 text-sm text-muted">
            Chưa có submission nào khớp bộ lọc hiện tại.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b border-border bg-background text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Ứng viên</th>
                  <th className="px-4 py-3">Job Order</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Kết quả</th>
                  <th className="px-4 py-3">Cập nhật</th>
                  <th className="px-4 py-3 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="transition hover:bg-background/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/candidates/${sub.candidate.id}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {sub.candidate.fullName}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted">
                        {sub.candidate.currentPosition ?? sub.candidate.email ?? sub.candidate.phone ?? "Không có liên hệ"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/jobs/${sub.jobOrder.id}`}
                        className="flex items-center gap-1 text-foreground hover:text-primary"
                      >
                        <Briefcase className="h-3.5 w-3.5 text-muted" />
                        <span className="truncate">{sub.jobOrder.title}</span>
                      </Link>
                      <p className="mt-0.5 text-xs text-muted">{sub.jobOrder.client.companyName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <SubmissionStageSelect
                        id={sub.id}
                        stage={sub.stage}
                      />
                      <span className="sr-only">{stageLabel(sub.stage)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <SubmissionResultSelect
                        id={sub.id}
                        result={sub.result}
                        interviewDate={sub.interviewDate?.toISOString() ?? null}
                        notes={sub.notes}
                      />
                      <span className="sr-only">{resultLabel(sub.result)}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {new Date(sub.updatedAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/jobs/${sub.jobOrder.id}`}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        Xem pipeline
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            Hiển thị {skip + 1}-{Math.min(skip + pageSize, total)} / {total}
          </p>
          <div className="flex gap-2">
            <Link
              href={buildSubmissionsHref(currentQuery, { page: String(Math.max(1, page - 1)) })}
              aria-disabled={page <= 1}
              className={`rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium transition ${
                page <= 1
                  ? "pointer-events-none opacity-50"
                  : "text-foreground hover:bg-surface"
              }`}
            >
              Trước
            </Link>
            <Link
              href={buildSubmissionsHref(currentQuery, { page: String(Math.min(totalPages, page + 1)) })}
              aria-disabled={page >= totalPages}
              className={`rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium transition ${
                page >= totalPages
                  ? "pointer-events-none opacity-50"
                  : "text-foreground hover:bg-surface"
              }`}
            >
              Sau
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
