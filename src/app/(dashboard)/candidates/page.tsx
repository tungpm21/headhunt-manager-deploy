import Link from "next/link";
import { Suspense } from "react";
import { Archive, UserPlus } from "lucide-react";
import { requireViewerScope } from "@/lib/authz";
import { getCandidateFilterOptions, getCandidates } from "@/lib/candidates";
import { getAllTags } from "@/lib/tags";
import { CandidateTableWrapper } from "@/components/candidates/candidate-table-wrapper";
import { CandidateFiltersPanel } from "@/components/candidates/candidate-filters";
import { Pagination } from "@/components/ui/pagination";
import { CandidateStatus, CandidateSeniority, CandidateSortBy } from "@/types/candidate";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    level?: string;
    language?: string;
    skills?: string;
    location?: string;
    industry?: string;
    minSalary?: string;
    maxSalary?: string;
    tagId?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: "Ứng viên — Headhunt Manager",
};

export default async function CandidatesPage({ searchParams }: PageProps) {
  const scope = await requireViewerScope();
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);

  const [result, allTags, filterOptions] = await Promise.all([
    getCandidates({
      search: sp.search,
      status: sp.status as CandidateStatus | undefined,
      level: sp.level as CandidateSeniority | undefined,
      language: sp.language,
      skills: sp.skills ? sp.skills.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      location: sp.location,
      industry: sp.industry,
      minSalary: sp.minSalary ? Number(sp.minSalary) : undefined,
      maxSalary: sp.maxSalary ? Number(sp.maxSalary) : undefined,
      tagIds: sp.tagId ? [Number(sp.tagId)] : undefined,
      sortBy: sp.sortBy as CandidateSortBy | undefined,
      sortOrder: sp.sortOrder as "asc" | "desc" | undefined,
      page,
      pageSize: 20,
    }, scope),
    getAllTags(),
    getCandidateFilterOptions(scope),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ứng viên</h1>
          <p className="mt-1 text-sm text-muted">
            {result.total > 0
              ? `${result.total} ứng viên trong hệ thống`
              : "Chưa có ứng viên nào"}
          </p>
        </div>
        <Link
          href="/candidates/trash"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface hover:text-foreground"
        >
          <Archive className="h-4 w-4" />
          Thùng rác
        </Link>
        <Link
          href="/candidates/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover shadow-sm transition"
        >
          <UserPlus className="h-4 w-4" />
          Thêm ứng viên
        </Link>
      </div>

      {/* Filters */}
      <Suspense>
        <CandidateFiltersPanel
          allTags={allTags}
          locations={filterOptions.locations}
          industries={filterOptions.industries}
          skills={filterOptions.skills}
        />
      </Suspense>

      {/* Table */}
      <CandidateTableWrapper candidates={result.candidates} allTags={allTags} />

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
