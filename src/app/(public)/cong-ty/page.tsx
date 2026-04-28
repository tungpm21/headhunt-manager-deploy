import Link from "next/link";
import { Suspense } from "react";
import { Building2, Filter, Search, SearchX, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { getPublicCompanies, type CompanySort, type PublicCompany } from "@/lib/public-actions";
import { CompanyCard } from "@/components/public/CompanyCard";
import { Pagination } from "@/components/public/Pagination";

export const metadata = {
  title: "Doanh nghiệp FDI",
  description: "Danh sách các doanh nghiệp FDI uy tín đang tuyển dụng tại Việt Nam.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const SORT_LABELS: Record<CompanySort, string> = {
  priority: "Ưu tiên hiển thị",
  jobs: "Nhiều vị trí đang tuyển",
  name: "Tên A-Z",
};

function getStringParam(params: Record<string, string | string[] | undefined>, key: string): string | undefined {
  const value = params[key];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function getPageParam(params: Record<string, string | string[] | undefined>): number {
  const value = Number(getStringParam(params, "page") ?? 1);
  return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1;
}

function getCompanySort(value: string | undefined): CompanySort {
  if (value === "jobs" || value === "name") return value;
  return "priority";
}

function isPriorityCompany(company: PublicCompany): boolean {
  return company.subscription?.tier === "VIP" || company.subscription?.tier === "PREMIUM";
}

export default async function CompanyListingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = getStringParam(params, "q");
  const industry = getStringParam(params, "industry");
  const location = getStringParam(params, "location");
  const industrialZone = getStringParam(params, "industrialZone");
  const priority = getStringParam(params, "priority") === "1";
  const hiring = getStringParam(params, "hiring") === "1";
  const sort = getCompanySort(getStringParam(params, "sort"));
  const page = getPageParam(params);

  const result = await getPublicCompanies({ q, industry, location, industrialZone, priority, hiring, sort, page });
  const featuredCompany = result.page === 1 ? result.companies.find(isPriorityCompany) : undefined;
  const priorityCompanies = result.companies.filter(
    (company) => company.id !== featuredCompany?.id && isPriorityCompany(company)
  );
  const standardCompanies = result.companies.filter(
    (company) => company.id !== featuredCompany?.id && !isPriorityCompany(company)
  );
  const hasActiveFilters = Boolean(q || industry || location || industrialZone || priority || hiring || sort !== "priority");

  return (
    <div id="main-content" className="min-h-screen bg-[var(--color-fdi-mist)]">
      <section className="border-b border-[var(--color-fdi-border)] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-fdi-surface)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--color-fdi-primary)]">
                <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                Danh bạ doanh nghiệp FDI
              </div>
              <h1
                className="max-w-3xl text-3xl font-bold leading-tight text-[var(--color-fdi-text)] sm:text-4xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {q ? `Kết quả cho "${q}"` : "Khám phá công ty FDI đang tuyển dụng"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-fdi-text-secondary)] sm:text-base">
                Tìm kiếm đối tác tuyển dụng theo ngành nghề, trạng thái tuyển dụng và mức độ hiển thị ưu tiên trên FDIWork.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-[var(--color-fdi-border)] bg-[var(--color-fdi-paper)] p-4 shadow-[0_18px_44px_-36px_rgba(7,26,47,0.5)]">
              <div>
                <p className="text-2xl font-bold tabular-nums text-[var(--color-fdi-text)]">{result.total}</p>
                <p className="mt-1 text-xs font-medium text-[var(--color-fdi-text-secondary)]">doanh nghiệp phù hợp</p>
              </div>
              <div>
                <p className="text-base font-bold leading-snug text-[var(--color-fdi-primary)] sm:text-lg">
                  {SORT_LABELS[sort]}
                </p>
                <p className="mt-1 text-xs font-medium text-[var(--color-fdi-text-secondary)]">sắp xếp hiện tại</p>
              </div>
            </div>
          </div>

          <form action="/cong-ty" className="mt-8 rounded-2xl border border-[var(--color-fdi-border)] bg-white p-4 shadow-[0_18px_44px_-38px_rgba(7,26,47,0.55)]">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(260px,1.35fr)_repeat(6,minmax(135px,1fr))]">
              <div className="sm:col-span-2 lg:col-span-1">
                <label htmlFor="company-search" className="mb-1.5 block text-xs font-bold text-[var(--color-fdi-text)]">
                  Tìm công ty
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-fdi-text-secondary)]" aria-hidden="true" />
                  <input
                    id="company-search"
                    name="q"
                    type="search"
                    defaultValue={q ?? ""}
                    placeholder="Tên công ty, ví dụ Samsung"
                    className="min-h-11 w-full rounded-lg border border-[var(--color-fdi-border)] bg-white py-2 pl-10 pr-3 text-sm text-[var(--color-fdi-text)] placeholder:text-[var(--color-fdi-text-secondary)]/70 transition-colors focus:border-[var(--color-fdi-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="company-industry" className="mb-1.5 block text-xs font-bold text-[var(--color-fdi-text)]">
                  Ngành nghề
                </label>
                <select
                  id="company-industry"
                  name="industry"
                  defaultValue={industry ?? ""}
                  className="min-h-11 w-full rounded-lg border border-[var(--color-fdi-border)] bg-white px-3 py-2 text-sm text-[var(--color-fdi-text)] transition-colors focus:border-[var(--color-fdi-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25 cursor-pointer"
                >
                  <option value="">Tất cả ngành nghề</option>
                  {result.filters.industries.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="company-location" className="mb-1.5 block text-xs font-bold text-[var(--color-fdi-text)]">
                  Khu vực
                </label>
                <select
                  id="company-location"
                  name="location"
                  defaultValue={location ?? ""}
                  className="min-h-11 w-full cursor-pointer rounded-lg border border-[var(--color-fdi-border)] bg-white px-3 py-2 text-sm text-[var(--color-fdi-text)] transition-colors focus:border-[var(--color-fdi-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25"
                >
                  <option value="">Tất cả khu vực</option>
                  {result.filters.locations.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="company-industrial-zone" className="mb-1.5 block text-xs font-bold text-[var(--color-fdi-text)]">
                  Khu công nghiệp
                </label>
                <select
                  id="company-industrial-zone"
                  name="industrialZone"
                  defaultValue={industrialZone ?? ""}
                  className="min-h-11 w-full cursor-pointer rounded-lg border border-[var(--color-fdi-border)] bg-white px-3 py-2 text-sm text-[var(--color-fdi-text)] transition-colors focus:border-[var(--color-fdi-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25"
                >
                  <option value="">Tất cả KCN</option>
                  {result.filters.industrialZones.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="company-priority" className="mb-1.5 block text-xs font-bold text-[var(--color-fdi-text)]">
                  Hiển thị
                </label>
                <select
                  id="company-priority"
                  name="priority"
                  defaultValue={priority ? "1" : ""}
                  className="min-h-11 w-full rounded-lg border border-[var(--color-fdi-border)] bg-white px-3 py-2 text-sm text-[var(--color-fdi-text)] transition-colors focus:border-[var(--color-fdi-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25 cursor-pointer"
                >
                  <option value="">Tất cả hiển thị</option>
                  <option value="1">Đối tác ưu tiên</option>
                </select>
              </div>

              <div>
                <label htmlFor="company-hiring" className="mb-1.5 block text-xs font-bold text-[var(--color-fdi-text)]">
                  Tuyển dụng
                </label>
                <select
                  id="company-hiring"
                  name="hiring"
                  defaultValue={hiring ? "1" : ""}
                  className="min-h-11 w-full rounded-lg border border-[var(--color-fdi-border)] bg-white px-3 py-2 text-sm text-[var(--color-fdi-text)] transition-colors focus:border-[var(--color-fdi-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25 cursor-pointer"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="1">Đang tuyển</option>
                </select>
              </div>

              <div>
                <label htmlFor="company-sort" className="mb-1.5 block text-xs font-bold text-[var(--color-fdi-text)]">
                  Sắp xếp
                </label>
                <select
                  id="company-sort"
                  name="sort"
                  defaultValue={sort}
                  className="min-h-11 w-full rounded-lg border border-[var(--color-fdi-border)] bg-white px-3 py-2 text-sm text-[var(--color-fdi-text)] transition-colors focus:border-[var(--color-fdi-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25 cursor-pointer"
                >
                  <option value="priority">Ưu tiên hiển thị</option>
                  <option value="jobs">Nhiều vị trí</option>
                  <option value="name">Tên A-Z</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-[var(--color-fdi-primary)] px-5 py-2.5 text-sm font-bold text-white transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-fdi-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/35"
              >
                <Filter className="h-4 w-4" aria-hidden="true" />
                Áp dụng
              </button>
              {hasActiveFilters && (
                <Link
                  href="/cong-ty"
                  className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-[var(--color-fdi-border)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--color-fdi-text)] transition-colors hover:border-[var(--color-fdi-primary)]/30 hover:bg-[var(--color-fdi-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Xóa lọc
                </Link>
              )}
            </div>
          </form>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {result.companies.length === 0 ? (
          <div className="rounded-2xl border border-[var(--color-fdi-border)] bg-white px-6 py-16 text-center shadow-[0_18px_44px_-38px_rgba(7,26,47,0.55)]">
            <SearchX className="mx-auto mb-4 h-12 w-12 text-[var(--color-fdi-text-secondary)]/45" aria-hidden="true" />
            <p
              className="text-lg font-bold text-[var(--color-fdi-text)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Không tìm thấy doanh nghiệp
            </p>
            <p className="mt-2 text-sm text-[var(--color-fdi-text-secondary)]">
              Hãy thử từ khóa rộng hơn hoặc bỏ bớt bộ lọc.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2
                  className="text-xl font-bold text-[var(--color-fdi-text)]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Danh sách công ty
                </h2>
                <p className="mt-1 text-sm text-[var(--color-fdi-text-secondary)]">
                  Hiển thị {result.companies.length} trong {result.total} doanh nghiệp phù hợp.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[var(--color-fdi-primary)] shadow-[0_12px_28px_-24px_rgba(7,26,47,0.6)]">
                <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                {SORT_LABELS[sort]}
              </span>
            </div>

            {featuredCompany && (
              <section className="mb-8" aria-labelledby="featured-company-heading">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[var(--color-fdi-accent-orange)]" aria-hidden="true" />
                  <h2
                    id="featured-company-heading"
                    className="text-lg font-bold text-[var(--color-fdi-text)]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Đối tác nổi bật
                  </h2>
                </div>
                <CompanyCard company={featuredCompany} imagePriority variant="featured" />
              </section>
            )}

            {priorityCompanies.length > 0 && (
              <section className="mb-8" aria-labelledby="priority-company-heading">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2
                    id="priority-company-heading"
                    className="text-lg font-bold text-[var(--color-fdi-text)]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Ưu tiên hiển thị
                  </h2>
                  <p className="text-sm text-[var(--color-fdi-text-secondary)]">
                    {priorityCompanies.length} công ty được đặt nổi bật trong kết quả.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {priorityCompanies.map((company, index) => (
                    <CompanyCard
                      key={company.id}
                      company={company}
                      imagePriority={!featuredCompany && index < 2}
                      variant="priority"
                    />
                  ))}
                </div>
              </section>
            )}

            {standardCompanies.length > 0 && (
              <section aria-labelledby="company-grid-heading">
                <h2
                  id="company-grid-heading"
                  className="mb-4 text-lg font-bold text-[var(--color-fdi-text)]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Doanh nghiệp phù hợp
                </h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {standardCompanies.map((company, index) => (
                    <CompanyCard
                      key={company.id}
                      company={company}
                      imagePriority={!featuredCompany && priorityCompanies.length === 0 && index < 3}
                      variant="standard"
                    />
                  ))}
                </div>
              </section>
            )}

            <Suspense>
              <Pagination currentPage={result.page} totalPages={result.totalPages} basePath="/cong-ty" />
            </Suspense>
          </>
        )}
      </main>
    </div>
  );
}
