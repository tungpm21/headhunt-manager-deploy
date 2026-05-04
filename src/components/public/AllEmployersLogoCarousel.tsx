"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HomepageEmployer } from "@/lib/public-actions";
import { LogoImage } from "@/components/public/LogoImage";
import { useElasticPageDrag } from "@/components/public/useElasticPageDrag";

const EMPLOYERS_PER_PAGE = 15;

type AllEmployersLogoCarouselProps = {
  employers: HomepageEmployer[];
};

type SlideDirection = "previous" | "next";

function wrapPage(page: number, pageCount: number) {
  return ((page % pageCount) + pageCount) % pageCount;
}

export function AllEmployersLogoCarousel({ employers }: AllEmployersLogoCarouselProps) {
  const [page, setPage] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [dragPaused, setDragPaused] = useState(false);
  const pageCount = Math.max(1, Math.ceil(employers.length / EMPLOYERS_PER_PAGE));
  const activePage = wrapPage(page, pageCount);
  const previousPage = wrapPage(activePage - 1, pageCount);
  const nextPage = wrapPage(activePage + 1, pageCount);
  const paused = hoverPaused || dragPaused;

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

  useEffect(() => {
    if (paused || pageCount <= 1) return;

    const id = setInterval(() => slideTo("next"), 5200);
    return () => clearInterval(id);
  }, [pageCount, paused, slideTo]);

  if (employers.length === 0) return null;

  const getPageEmployers = (pageIndex: number) => {
    const visibleCount = Math.min(EMPLOYERS_PER_PAGE, employers.length);
    const startIndex = pageIndex * EMPLOYERS_PER_PAGE;
    return Array.from({ length: visibleCount }, (_, index) => employers[(startIndex + index) % employers.length]);
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

  const renderEmployerPage = (pageIndex: number, isCurrent: boolean, slot: string) => (
    <div key={`${slot}-${pageIndex}`} aria-hidden={!isCurrent} className="min-w-full">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {getPageEmployers(pageIndex).map((employer, index) => (
          <Link
            key={`${pageIndex}-${employer.id}-${index}`}
            href={`/cong-ty/${employer.slug}`}
            aria-label={isCurrent ? `Xem trang công ty ${employer.companyName}` : undefined}
            title={employer.companyName}
            tabIndex={isCurrent ? 0 : -1}
            draggable={false}
            onDragStart={(event) => event.preventDefault()}
            onClick={(event) => {
              if (!isCurrent || shouldIgnoreClick()) {
                event.preventDefault();
              }
            }}
            className="group flex aspect-[3/2] cursor-pointer items-center justify-center rounded-xl border border-[#D6E2E7] bg-white p-6 shadow-[0_14px_34px_-32px_rgba(7,26,47,0.36)] transition-[border-color,box-shadow,transform] duration-300 ease-[var(--ease-fdi)] hover:-translate-y-0.5 hover:border-[#A9C4CE] hover:shadow-[0_20px_46px_-36px_rgba(7,26,47,0.48)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/35"
          >
            <LogoImage
              src={employer.logo}
              alt={employer.companyName}
              className="h-auto w-auto max-h-full max-w-full object-contain"
              iconSize="h-9 w-9 text-[var(--color-fdi-primary)]"
            />
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <section
      className="bg-[#F7FAFB] py-10 lg:py-12"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocus={() => setHoverPaused(true)}
      onBlur={() => setHoverPaused(false)}
      aria-label="Tất cả doanh nghiệp"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2
              className="text-2xl font-black tracking-normal text-[var(--color-fdi-ink)] sm:text-3xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Tất cả doanh nghiệp
            </h2>
            <p className="mt-1.5 text-sm font-medium text-[var(--color-fdi-text-secondary)]">
              Khám phá các doanh nghiệp FDI đang có hồ sơ tuyển dụng trên FDIWork
            </p>
          </div>

          <Link
            href="/cong-ty"
            className="inline-flex min-h-9 shrink-0 cursor-pointer items-center border-b border-[var(--color-fdi-primary)]/30 text-sm font-bold text-[var(--color-fdi-primary)] transition-[border-color,color] duration-300 ease-[var(--ease-fdi)] hover:border-[var(--color-fdi-primary-hover)] hover:text-[var(--color-fdi-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/35"
          >
            Xem tất cả
          </Link>

          {pageCount > 1 ? (
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => slideTo("previous")}
                aria-label="Xem doanh nghiệp trước"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-[#BFDCE4] bg-[#EAF7FA] text-[var(--color-fdi-primary)] shadow-[0_12px_24px_-20px_rgba(7,26,47,0.5)] transition-[background-color,border-color,transform] duration-300 ease-[var(--ease-fdi)] hover:-translate-y-0.5 hover:border-[#91BFCD] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/35"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => slideTo("next")}
                aria-label="Xem doanh nghiệp tiếp theo"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-[#BFDCE4] bg-[#EAF7FA] text-[var(--color-fdi-primary)] shadow-[0_12px_24px_-20px_rgba(7,26,47,0.5)] transition-[background-color,border-color,transform] duration-300 ease-[var(--ease-fdi)] hover:-translate-y-0.5 hover:border-[#91BFCD] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/35"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>

        {pageCount > 1 ? (
          <div className="overflow-hidden">
            <div
              className="flex cursor-grab touch-pan-y select-none active:cursor-grabbing"
              style={trackStyle}
              {...dragHandlers}
            >
              {renderEmployerPage(previousPage, false, "previous")}
              {renderEmployerPage(activePage, true, "current")}
              {renderEmployerPage(nextPage, false, "next")}
            </div>
          </div>
        ) : (
          renderEmployerPage(activePage, true, "current")
        )}

        {pageCount > 1 ? (
          <div className="mt-5 flex items-center justify-center gap-2">
            {Array.from({ length: pageCount }, (_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Trang doanh nghiệp ${index + 1}`}
                aria-current={index === activePage}
                onClick={() => goToPageIndex(index)}
                className="flex h-7 w-8 cursor-pointer items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/35"
              >
                <span className={`h-2 rounded-full transition-[background-color,width] duration-300 ${index === activePage ? "w-8 bg-[var(--color-fdi-primary)]" : "w-3 bg-[#C9D9DE]"}`} />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
