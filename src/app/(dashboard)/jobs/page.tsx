import Link from "next/link";
import { Suspense } from "react";
import { Briefcase } from "lucide-react";
import { getJobs } from "@/lib/jobs";
import { JobTable } from "@/components/jobs/job-table";
import { JobFiltersPanel } from "@/components/jobs/job-filters";
import { Pagination } from "@/components/ui/pagination";
import { JobStatus } from "@/types/job";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: "Yêu cầu tuyển dụng (Jobs) — Headhunt Manager",
};

export default async function JobsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);

  const result = await getJobs({
    search: sp.search,
    status: sp.status as JobStatus | undefined,
    page,
    pageSize: 20,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Yêu cầu tuyển dụng (Jobs)</h1>
          <p className="mt-1 text-sm text-muted">
            {result.total > 0
              ? `Đang có ${result.total} Job Orders`
              : "Chưa có Job Order nào"}
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover shadow-sm transition"
        >
          <Briefcase className="h-4 w-4" />
          Tạo Job Order
        </Link>
      </div>

      {/* Filters */}
      <Suspense>
        <JobFiltersPanel />
      </Suspense>

      {/* Table */}
      <JobTable jobs={result.jobs} />

      {/* Pagination */}
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
