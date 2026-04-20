import { Suspense } from "react";
import { Briefcase, SearchX } from "lucide-react";
import {
  getPublicJobs,
  type HomepageJob,
  type JobFilters as JobFiltersType,
} from "@/lib/public-actions";
import { JobCard } from "@/components/public/JobCard";
import { JobFilters } from "@/components/public/JobFilters";
import { Pagination } from "@/components/public/Pagination";

export const metadata = {
  title: "Việc làm FDI",
  description:
    "Tìm kiếm hàng ngàn cơ hội việc làm chất lượng cao tại các doanh nghiệp FDI tại Việt Nam.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function JobListingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters: JobFiltersType = {
    q: typeof params.q === "string" ? params.q : undefined,
    industry: typeof params.industry === "string" ? params.industry : undefined,
    location: typeof params.location === "string" ? params.location : undefined,
    workType: typeof params.workType === "string" ? params.workType : undefined,
    language: typeof params.language === "string" ? params.language : undefined,
    industrialZone: typeof params.industrialZone === "string" ? params.industrialZone : undefined,
    visaSupport: typeof params.visaSupport === "string" ? params.visaSupport : undefined,
    shiftType: typeof params.shiftType === "string" ? params.shiftType : undefined,
    sort: (params.sort as JobFiltersType["sort"]) || "newest",
    page: params.page ? Number(params.page) : 1,
  };

  const result = await getPublicJobs(filters);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[var(--color-fdi-surface)] flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-[var(--color-fdi-primary)]" />
            </div>
            <div>
              <h1
                className="text-xl sm:text-2xl font-bold text-[var(--color-fdi-text)]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {filters.q ? `Kết quả cho "${filters.q}"` : "Tất cả việc làm"}
              </h1>
              <p className="text-sm text-[var(--color-fdi-text-secondary)] mt-0.5">
                {result.total} việc làm {filters.industry ? `trong ${filters.industry}` : ""}
                {filters.location ? ` tại ${filters.location}` : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-56 shrink-0">
            <div className="lg:sticky lg:top-24 bg-white rounded-xl border border-gray-100 p-5">
              <Suspense>
                <JobFilters
                  industries={result.filters.industries}
                  locations={result.filters.locations}
                  workTypes={result.filters.workTypes}
                  languages={result.filters.languages}
                  industrialZones={result.filters.industrialZones}
                />
              </Suspense>
            </div>
          </div>

          {/* Job Grid */}
          <div className="flex-1">
            {result.jobs.length === 0 ? (
              <div className="text-center py-20">
                <SearchX className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p
                  className="text-lg font-semibold text-[var(--color-fdi-text)]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Không tìm thấy việc làm
                </p>
                <p className="text-sm text-[var(--color-fdi-text-secondary)] mt-1">
                  Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {result.jobs.map((job: HomepageJob) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
                <Suspense>
                  <Pagination
                    currentPage={result.page}
                    totalPages={result.totalPages}
                  />
                </Suspense>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
