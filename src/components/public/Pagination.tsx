"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
};

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    router.push(`/viec-lam?${params.toString()}`);
  }

  // Generate page numbers to display
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-[var(--color-fdi-text-secondary)] transition-colors hover:bg-[var(--color-fdi-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
        aria-label="Trang trước"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {pages.map((page, idx) =>
        page === "..." ? (
          <span key={`dots-${idx}`} className="px-2 text-sm text-gray-400">
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`h-11 min-w-11 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25 cursor-pointer ${
              page === currentPage
                ? "bg-[var(--color-fdi-primary)] text-white shadow-sm"
                : "text-[var(--color-fdi-text-secondary)] hover:bg-[var(--color-fdi-surface)]"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-[var(--color-fdi-text-secondary)] transition-colors hover:bg-[var(--color-fdi-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
        aria-label="Trang sau"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </nav>
  );
}
