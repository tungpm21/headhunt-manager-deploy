import Link from "next/link";
import { Suspense } from "react";
import { Building2 } from "lucide-react";
import { getClients } from "@/lib/clients";
import { ClientTable } from "@/components/clients/client-table";
import { ClientFiltersPanel } from "@/components/clients/client-filters";
import { Pagination } from "@/components/ui/pagination";
import { CompanySize } from "@/types/client";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    industry?: string;
    companySize?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: "Doanh nghiệp — Headhunt Manager",
};

export default async function ClientsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);

  const result = await getClients({
    search: sp.search,
    industry: sp.industry,
    companySize: sp.companySize as CompanySize | undefined,
    page,
    pageSize: 20,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Doanh nghiệp</h1>
          <p className="mt-1 text-sm text-muted">
            {result.total > 0
              ? `${result.total} doanh nghiệp đối tác`
              : "Chưa có doanh nghiệp nào"}
          </p>
        </div>
        <Link
          href="/clients/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover shadow-sm transition"
        >
          <Building2 className="h-4 w-4" />
          Thêm doanh nghiệp
        </Link>
      </div>

      {/* Filters */}
      <Suspense>
        <ClientFiltersPanel />
      </Suspense>

      {/* Table */}
      <ClientTable clients={result.clients} />

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
