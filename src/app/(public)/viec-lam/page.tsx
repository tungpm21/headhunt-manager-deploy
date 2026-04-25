import { Suspense } from "react";
import { Briefcase, Search, SearchX, SlidersHorizontal } from "lucide-react";
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
    shiftType: typeof params.shiftType === "string" ? params.shiftType : undefined,
    sort: (params.sort as JobFiltersType["sort"]) || "newest",
    page: params.page ? Number(params.page) : 1,
  };

  const result = await getPublicJobs(filters);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Page Header */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[var(--color-fdi-surface)] flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-[var(--color-fdi-primary)]" aria-hidden="true" />
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
            <form action="/viec-lam" className="flex w-full max-w-2xl items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-1.5 lg:bg-white" role="search" aria-label="Tìm việc làm">
              <Search className="ml-3 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
              <input
                type="text"
                name="q"
                defaultValue={filters.q ?? ""}
                placeholder="Tìm vị trí, công ty…"
                autoComplete="off"
                className="min-h-11 flex-1 bg-transparent text-sm text-[var(--color-fdi-text)] placeholder:text-gray-400 focus:outline-none"
              />
              {filters.industry && <input type="hidden" name="industry" value={filters.industry} />}
              {filters.location && <input type="hidden" name="location" value={filters.location} />}
              {filters.workType && <input type="hidden" name="workType" value={filters.workType} />}
              {filters.language && <input type="hidden" name="language" value={filters.language} />}
              {filters.industrialZone && <input type="hidden" name="industrialZone" value={filters.industrialZone} />}
              {filters.shiftType && <input type="hidden" name="shiftType" value={filters.shiftType} />}
              {filters.sort && <input type="hidden" name="sort" value={filters.sort} />}
              <button
                type="submit"
                className="min-h-11 rounded-xl bg-[var(--color-fdi-accent-orange)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#E65C00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-accent-orange)]/40"
              >
                Tìm
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-5 lg:hidden">
          <details className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-[var(--color-fdi-text)]">
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[var(--color-fdi-primary)]" aria-hidden="true" />
                Bộ lọc việc làm
              </span>
              <span className="text-xs text-[var(--color-fdi-primary)]">Mở</span>
            </summary>
            <div className="border-t border-gray-100 p-4">
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
          </details>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Filters */}
          <div className="hidden shrink-0 lg:block lg:w-64">
            <div className="lg:sticky lg:top-24 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
