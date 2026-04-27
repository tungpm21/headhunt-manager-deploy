"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath?: string;
};

export function Pagination({ currentPage, totalPages, basePath = "/viec-lam" }: PaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function buildUrl(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
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

  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;
  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      <Link
        href={buildUrl(prevPage)}
        aria-disabled={isPrevDisabled}
        tabIndex={isPrevDisabled ? -1 : undefined}
        onClick={isPrevDisabled ? (event) => event.preventDefault() : undefined}
        aria-label="Trang trước"
        className={`flex h-11 w-11 items-center justify-center rounded-lg text-[var(--color-fdi-text-secondary)] transition-colors hover:bg-[var(--color-fdi-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25 ${
          isPrevDisabled ? "cursor-not-allowed opacity-30" : "cursor-pointer"
        }`}
      >
        <ChevronLeft className="h-5 w-5" />
      </Link>

      {pages.map((page, idx) =>
        page === "..." ? (
          <span key={`dots-${idx}`} className="px-2 text-sm text-gray-400">
            …
          </span>
        ) : (
          <Link
            key={page}
            href={buildUrl(page)}
            className={`h-11 min-w-11 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25 cursor-pointer flex items-center justify-center ${
              page === currentPage
                ? "bg-[var(--color-fdi-primary)] text-white shadow-sm"
                : "text-[var(--color-fdi-text-secondary)] hover:bg-[var(--color-fdi-surface)]"
            }`}
          >
            {page}
          </Link>
        )
      )}

      <Link
        href={buildUrl(nextPage)}
        aria-disabled={isNextDisabled}
        tabIndex={isNextDisabled ? -1 : undefined}
        onClick={isNextDisabled ? (event) => event.preventDefault() : undefined}
        aria-label="Trang sau"
        className={`flex h-11 w-11 items-center justify-center rounded-lg text-[var(--color-fdi-text-secondary)] transition-colors hover:bg-[var(--color-fdi-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25 ${
          isNextDisabled ? "cursor-not-allowed opacity-30" : "cursor-pointer"
        }`}
      >
        <ChevronRight className="h-5 w-5" />
      </Link>
    </nav>
  );
}
