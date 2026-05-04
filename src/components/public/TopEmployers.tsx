"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { HomepageEmployer } from "@/lib/public-actions";
import { LogoImage } from "@/components/public/LogoImage";
import { useElasticPageDrag } from "@/components/public/useElasticPageDrag";

type TopEmployersProps = {
  employers: HomepageEmployer[];
};

type SlideDirection = "previous" | "next";

const EMPLOYERS_PER_PAGE = 5;

function wrapPage(page: number, pageCount: number) {
  return ((page % pageCount) + pageCount) % pageCount;
}

export function TopEmployers({ employers }: TopEmployersProps) {
  const [page, setPage] = useState(0);
  const [dragPaused, setDragPaused] = useState(false);
  const pageCount = Math.max(1, Math.ceil(employers.length / EMPLOYERS_PER_PAGE));
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
    pageGap: 16,
    onNext: () => goToPage("next"),
    onPrevious: () => goToPage("previous"),
    onDragStart: () => setDragPaused(true),
    onDragEnd: () => setDragPaused(false),
  });
  const { dragHandlers, shouldIgnoreClick, slideTo, trackStyle } = elasticDrag;

  if (employers.length === 0) return null;

  const visibleCount = Math.min(EMPLOYERS_PER_PAGE, employers.length);

  const getPageEmployers = (pageIndex: number) => {
    const startIndex = pageIndex * EMPLOYERS_PER_PAGE;
    return Array.from({ length: visibleCount }, (_, index) => employers[(startIndex + index) % employers.length]!);
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
    <div key={`${slot}-${pageIndex}`} aria-hidden={!isCurrent} inert={!isCurrent ? true : undefined} className="min-w-full">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
        {getPageEmployers(pageIndex).map((employer, index) => {
          const jobCount = employer._count?.jobPostings ?? 0;

          return (
            <Link
              key={`${slot}-${employer.id}-${index}`}
              href={`/cong-ty/${employer.slug}`}
              draggable={false}
              tabIndex={isCurrent ? 0 : -1}
              onDragStart={(event) => event.preventDefault()}
              onClick={(event) => {
                if (!isCurrent || shouldIgnoreClick()) {
                  event.preventDefault();
                }
              }}
              className="group block h-full cursor-pointer"
            >
              <div className="flex min-h-[312px] h-full flex-col overflow-hidden rounded-xl border border-[#D6E2E7] bg-white shadow-[0_18px_44px_-36px_rgba(7,26,47,0.42)] transition-[border-color,box-shadow,transform] duration-300 ease-[var(--ease-fdi)] hover:-translate-y-1 hover:border-[#A9C4CE] hover:shadow-[0_26px_58px_-42px_rgba(7,26,47,0.52)]">
                <div className="h-1 bg-[var(--color-fdi-primary)]" />
                <div className="flex h-[150px] items-center justify-center border-b border-[#E3ECEF] bg-[#F8FBFC] p-4 sm:h-[158px] lg:h-[154px]">
                  <div className="flex h-24 w-full items-center justify-center rounded-lg bg-white ring-1 ring-[#DDE8EA] sm:h-28">
                    <LogoImage
                      src={employer.logo}
                      alt={employer.companyName}
                      className="h-auto w-auto max-h-24 max-w-[86%] object-contain"
                      iconSize="h-14 w-14"
                    />
                  </div>
                </div>

                <div className="flex flex-1 flex-col bg-white p-4 text-center sm:p-5 lg:p-4">
                  <p className="flex min-h-[2.55rem] items-center justify-center text-xs font-black leading-tight text-[var(--color-fdi-ink)] transition-colors group-hover:text-[var(--color-fdi-primary)] sm:text-sm">
                    {employer.companyName}
                  </p>
                  <p className="mt-2 line-clamp-1 min-h-5 text-xs font-semibold text-[var(--color-fdi-text-secondary)]">
                    {employer.industry ?? "Doanh nghiệp FDI"}
                  </p>

                  <div className="mt-auto pt-4">
                    <span className="inline-block rounded-md bg-[var(--color-fdi-primary)] px-3 py-1.5 text-[11px] font-bold text-white shadow-[0_10px_22px_-18px_rgba(10,111,157,0.72)] transition-colors group-hover:bg-[var(--color-fdi-primary-hover)]">
                      {jobCount > 0 ? `${jobCount} VIỆC MỚI` : "VIỆC MỚI"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <section className="relative z-10 overflow-hidden bg-[#F3F7F8] py-12 sm:py-14 lg:py-16">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col">
          <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6 lg:mb-7">
            <div>
              <p className="hidden">Đối tác tuyển dụng</p>
              <h2
                className="text-2xl font-black tracking-normal text-[var(--color-fdi-ink)] sm:text-3xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Nhà tuyển dụng hàng đầu
              </h2>
              <p
                className="mt-1.5 text-sm font-medium text-[var(--color-fdi-text-secondary)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Các doanh nghiệp FDI uy tín đang tuyển dụng
              </p>
            </div>

            {pageCount > 1 ? (
              <div className="hidden items-center gap-2 sm:flex">
                <button
                  type="button"
                  onClick={() => slideTo("previous")}
                  aria-label="Nhà tuyển dụng trước"
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-[#BFDCE4] bg-[#EAF7FA] text-[var(--color-fdi-primary)] shadow-[0_12px_24px_-20px_rgba(7,26,47,0.5)] transition-[background-color,border-color,transform] duration-300 ease-[var(--ease-fdi)] hover:-translate-y-0.5 hover:border-[#91BFCD] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/35"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => slideTo("next")}
                  aria-label="Nhà tuyển dụng tiếp theo"
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
                className={`flex gap-4 touch-pan-y select-none ${dragPaused ? "cursor-grabbing" : "cursor-grab"}`}
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
                  aria-label={`Trang nhà tuyển dụng ${index + 1}`}
                  aria-current={index === activePage}
                  onClick={() => goToPageIndex(index)}
                  className="flex h-7 w-8 cursor-pointer items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/35"
                >
                  <span className={`h-2 rounded-full transition-[background-color,width] duration-300 ${index === activePage ? "w-8 bg-[var(--color-fdi-primary)]" : "w-3 bg-[#C9D9DE]"}`} />
                </button>
              ))}
            </div>
          ) : null}

          <div className="hidden">
            <Link
              href="/cong-ty"
              className="inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-lg border border-[var(--color-fdi-primary)] bg-[var(--color-fdi-primary)] px-5 text-sm font-bold text-white shadow-[0_18px_34px_-26px_rgba(10,111,157,0.72)] transition-[background-color,border-color,transform] duration-300 ease-[var(--ease-fdi)] hover:-translate-y-0.5 hover:border-[var(--color-fdi-primary-hover)] hover:bg-[var(--color-fdi-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25"
            >
              Khám phá thêm
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
