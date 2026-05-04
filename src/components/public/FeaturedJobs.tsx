"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { JobCard } from "./JobCard";
import type { HomepageJob } from "@/lib/public-actions";
import { useElasticPageDrag } from "@/components/public/useElasticPageDrag";

const JOBS_PER_PAGE = 6;

type FeaturedJobsProps = {
  jobs: HomepageJob[];
};

type SlideDirection = "previous" | "next";

function wrapPage(page: number, pageCount: number) {
  return ((page % pageCount) + pageCount) % pageCount;
}

export function FeaturedJobs({ jobs }: FeaturedJobsProps) {
  const [page, setPage] = useState(0);
  const [dragPaused, setDragPaused] = useState(false);
  const pageCount = Math.max(1, Math.ceil(jobs.length / JOBS_PER_PAGE));
  const activePage = wrapPage(page, pageCount);
  const previousPage = wrapPage(activePage - 1, pageCount);
  const nextPage = wrapPage(activePage + 1, pageCount);

  const goToPage = useCallback(
    (direction: SlideDirection) => {
      if (pageCount <= 1) return;
      setPage((current) => wrapPage(current + (direction === "next" ? 1 : -1), pageCount));
    },
    [pageCount],
  );

  const elasticDrag = useElasticPageDrag({
    enabled: pageCount > 1,
    threshold: 48,
    onNext: () => goToPage("next"),
    onPrevious: () => goToPage("previous"),
    onDragStart: () => setDragPaused(true),
    onDragEnd: () => setDragPaused(false),
  });
  const { dragHandlers, shouldIgnoreClick, slideTo, trackStyle } = elasticDrag;

  if (jobs.length === 0) return null;

  const visibleCount = Math.min(JOBS_PER_PAGE, jobs.length);

  const getPageJobs = (pageIndex: number) => {
    const startIndex = pageIndex * JOBS_PER_PAGE;
    return Array.from({ length: visibleCount }, (_, index) => jobs[(startIndex + index) % jobs.length]!);
  };

  const goToPageIndex = (pageIndex: number) => {
    if (pageIndex === activePage) return;
    if (pageIndex === nextPage) {
      slideTo("next");
      return;
    }
    if (pageIndex === previousPage) {
      slideTo("previous");
      return;
    }
    setPage(pageIndex);
  };

  const renderJobsPage = (pageIndex: number, isCurrent: boolean, slot: string) => (
    <div
      key={`${slot}-${pageIndex}`}
      aria-hidden={!isCurrent}
      inert={!isCurrent ? true : undefined}
      className="min-w-full"
      onClickCapture={(event) => {
        if (!isCurrent || shouldIgnoreClick()) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
      onDragStartCapture={(event) => event.preventDefault()}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {getPageJobs(pageIndex).map((job, index) => (
          <div key={`${slot}-${job.id}-${index}`} className="min-w-0">
            <JobCard job={job} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section className="relative bg-[#FFFFFB] py-10 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="hidden h-10 w-10 items-center justify-center rounded-xl border border-[#F4D9C9] bg-[#FFF1E8] sm:flex">
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path d="M5 27L16 5L27 27H5Z" fill="#F25C24" opacity="0.18" />
                <path d="M10 27L16 14L22 27H10Z" fill="#F25C24" opacity="0.72" />
                <path d="M16 14L22 27H16V14Z" fill="#0A6F9D" opacity="0.78" />
              </svg>
            </div>
            <div>
              <h2
                className="text-2xl font-black text-[var(--color-fdi-text)] sm:text-3xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Việc làm tốt nhất
              </h2>
              <p
                className="mt-0.5 text-sm text-[var(--color-fdi-text-secondary)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Cơ hội nổi bật từ các doanh nghiệp FDI uy tín
              </p>
            </div>
          </div>
          <Link
            href="/viec-lam"
            className="hidden min-h-11 cursor-pointer items-center gap-1 rounded-lg px-2 text-sm font-bold uppercase text-[var(--color-fdi-primary)] transition-colors hover:bg-[#EEF7FA] hover:text-[var(--color-fdi-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25 sm:inline-flex"
          >
            Xem tất cả
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {pageCount > 1 ? (
          <div className="overflow-hidden">
            <div
              className={`flex touch-pan-y select-none ${dragPaused ? "cursor-grabbing" : "cursor-grab"}`}
              style={trackStyle}
              {...dragHandlers}
            >
              {renderJobsPage(previousPage, false, "previous")}
              {renderJobsPage(activePage, true, "current")}
              {renderJobsPage(nextPage, false, "next")}
            </div>
          </div>
        ) : (
          renderJobsPage(activePage, true, "current")
        )}

        {pageCount > 1 ? (
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => slideTo("previous")}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-[#D9E4EA] bg-[#FFFFFB] text-[var(--color-fdi-text)] transition-colors hover:border-[var(--color-fdi-primary)] hover:bg-[#EEF7FA] hover:text-[var(--color-fdi-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25"
              aria-label="Việc làm trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: pageCount }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goToPageIndex(index)}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25"
                  aria-label={`Trang việc làm ${index + 1}`}
                  aria-current={index === activePage}
                >
                  <span
                    className={`h-2.5 rounded-full transition-[background-color,width] ${
                      index === activePage ? "w-6 bg-[var(--color-fdi-primary)]" : "w-2.5 bg-[#CBD5DC] hover:bg-[#AEBAC4]"
                    }`}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => slideTo("next")}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-[#D9E4EA] bg-[#FFFFFB] text-[var(--color-fdi-text)] transition-colors hover:border-[var(--color-fdi-primary)] hover:bg-[#EEF7FA] hover:text-[var(--color-fdi-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25"
              aria-label="Việc làm tiếp theo"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/viec-lam"
            className="inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-lg bg-[var(--color-fdi-primary)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-fdi-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25"
          >
            Xem tất cả việc làm
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
