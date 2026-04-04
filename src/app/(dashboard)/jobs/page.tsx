import Link from "next/link";
import { Suspense } from "react";
import { Briefcase } from "lucide-react";
import { requireViewerScope } from "@/lib/authz";
import { getJobs } from "@/lib/jobs";
import { JobTable } from "@/components/jobs/job-table";
import { JobFiltersPanel } from "@/components/jobs/job-filters";
import { Pagination } from "@/components/ui/pagination";
import { JobCandidateStage, JobStatus } from "@/types/job";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    stage?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: "Yêu cầu tuyển dụng (Jobs) — Headhunt Manager",
};

export default async function JobsPage({ searchParams }: PageProps) {
  const scope = await requireViewerScope();
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);

  const result = await getJobs({
    search: sp.search,
    status: sp.status as JobStatus | undefined,
    stage: sp.stage as JobCandidateStage | undefined,
    page,
    pageSize: 20,
  }, scope);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Yêu cầu tuyển dụng (Jobs)
          </h1>
          <p className="mt-1 text-sm text-muted">
            {result.total > 0 ? `Đang có ${result.total} Job Orders` : "Chưa có Job Order nào"}
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-hover"
        >
          <Briefcase className="h-4 w-4" />
          Tạo Job Order
        </Link>
      </div>

      <Suspense>
        <JobFiltersPanel />
      </Suspense>

      <JobTable jobs={result.jobs} />

      <Suspense>
        <Pagination
          currentPage={result.page}
          totalPages={result.totalPages}
          total={result.total}
          pageSize={result.pageSize}
        />
      </Suspense>
    </div>
  );
}
