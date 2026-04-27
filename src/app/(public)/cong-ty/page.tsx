import { Suspense } from "react";
import { Building2, SearchX } from "lucide-react";
import { getPublicCompanies, type PublicCompany } from "@/lib/public-actions";
import { CompanyCard } from "@/components/public/CompanyCard";
import { Pagination } from "@/components/public/Pagination";

export const metadata = {
  title: "Doanh nghiệp FDI",
  description: "Danh sách các doanh nghiệp FDI uy tín đang tuyển dụng tại Việt Nam.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CompanyListingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const industry = typeof params.industry === "string" ? params.industry : undefined;
  const page = params.page ? Number(params.page) : 1;

  const result = await getPublicCompanies({ q, industry, page });

  return (
    <div id="main-content" className="min-h-screen bg-[var(--color-fdi-mist)]">
      {/* Page Header */}
      <div className="bg-white border-b border-[var(--color-fdi-mist)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[var(--color-fdi-surface)] flex items-center justify-center">
              <Building2 className="h-5 w-5 text-[var(--color-fdi-primary)]" />
            </div>
            <div>
              <h1
                className="text-xl sm:text-2xl font-bold text-[var(--color-fdi-text)]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {q ? `Kết quả cho "${q}"` : "Doanh nghiệp FDI"}
              </h1>
              <p className="text-sm text-[var(--color-fdi-text-secondary)] mt-0.5">
                {result.total} doanh nghiệp
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {result.companies.length === 0 ? (
          <div className="text-center py-20">
            <SearchX className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p
              className="text-lg font-semibold text-[var(--color-fdi-text)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Không tìm thấy doanh nghiệp
            </p>
            <p className="text-sm text-[var(--color-fdi-text-secondary)] mt-1">
              Hãy thử từ khóa khác
            </p>
          </div>
        ) : (
          <>
            <h2 className="sr-only">Danh sách công ty</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {result.companies.map((company: PublicCompany, index: number) => (
                <CompanyCard key={company.id} company={company} imagePriority={index < 3} />
              ))}
            </div>
            <Suspense>
              <Pagination currentPage={result.page} totalPages={result.totalPages} basePath="/cong-ty" />
            </Suspense>
          </>
        )}
      </div>
    </div>
  );
}
