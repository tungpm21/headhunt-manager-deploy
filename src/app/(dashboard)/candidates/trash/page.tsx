import Link from "next/link";
import { ArrowLeft, ArchiveRestore, Search } from "lucide-react";
import { getDeletedCandidates } from "@/lib/candidates";
import { requireAdmin } from "@/lib/authz";
import { Pagination } from "@/components/ui/pagination";
import { RestoreCandidateButton } from "@/components/candidates/restore-candidate-button";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: "Thung rac ung vien - Headhunt Manager",
};

export default async function CandidatesTrashPage({ searchParams }: PageProps) {
  await requireAdmin();

  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const search = sp.search?.trim();

  const result = await getDeletedCandidates({
    search,
    page: Number.isNaN(page) ? 1 : page,
    pageSize: 20,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/candidates"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lai danh sach ung vien
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Thung rac ung vien</h1>
          <p className="mt-1 text-sm text-muted">
            {result.total > 0
              ? `${result.total} ung vien dang nam trong thung rac`
              : "Kh\u00f4ng c\u00f3 \u1ee9ng vi\u00ean n\u00e0o \u0111\u00e3 x\u00f3a"}
          </p>
        </div>

        <form className="flex w-full gap-2 sm:max-w-sm">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              name="search"
              defaultValue={search ?? ""}
              placeholder="Tim theo ten, email, SDT..."
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:bg-background"
          >
            Tim
          </button>
        </form>
      </div>

      {result.candidates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ArchiveRestore className="h-7 w-7" />
          </div>
          <p className="mt-4 font-medium text-foreground">Thung rac dang trong</p>
          <p className="mt-1 text-sm text-muted">
            Khi xoa mem ung vien, ban co the khoi phuc lai tu trang nay.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-background">
          <div className="divide-y divide-border">
            {result.candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-base font-semibold text-foreground">
                      {candidate.fullName}
                    </p>
                    <span className="rounded-full bg-surface px-2.5 py-1 text-xs text-muted">
                      #{candidate.id}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                    <span>{candidate.email || "Khong co email"}</span>
                    <span>{candidate.phone || "Khong co SDT"}</span>
                    <span>{candidate.currentPosition || "Chua co vi tri hien tai"}</span>
                    <span>{candidate.location || "Chua co khu vuc"}</span>
                  </div>

                  <p className="mt-2 text-xs text-muted">
                    Da xoa luc {candidate.updatedAt.toLocaleString("vi-VN")}
                  </p>
                </div>

                <RestoreCandidateButton candidateId={candidate.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      <Pagination
        currentPage={result.page}
        totalPages={result.totalPages}
        total={result.total}
        pageSize={result.pageSize}
      />
    </div>
  );
}
