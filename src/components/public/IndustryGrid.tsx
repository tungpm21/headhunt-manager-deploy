"use client";

import { useCallback, useEffect, useState, type ElementType } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  CircuitBoard,
  Cpu,
  Factory,
  FlaskConical,
  HardHat,
  Truck,
  Wrench,
} from "lucide-react";
import type { HomepageData, IndustryCount } from "@/lib/public-actions";
import { useElasticPageDrag } from "@/components/public/useElasticPageDrag";

const INDUSTRIES_PER_PAGE = 5;

const industryIcons: Record<string, ElementType> = {
  "IT / Phần mềm": Cpu,
  "Sản xuất": Factory,
  "Điện tử": CircuitBoard,
  "Cơ khí": Wrench,
  "Hóa chất": FlaskConical,
  Logistics: Truck,
  "Quản lý": BriefcaseBusiness,
  "Xây dựng": HardHat,
};

type IndustryGridProps = {
  industries: IndustryCount[];
  stats: HomepageData["stats"];
};

type SlideDirection = "previous" | "next";

function wrapPage(page: number, pageCount: number) {
  return ((page % pageCount) + pageCount) % pageCount;
}

export function IndustryGrid({ industries, stats: _stats }: IndustryGridProps) {
  void _stats;

  const [page, setPage] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [dragPaused, setDragPaused] = useState(false);
  const pageCount = Math.max(1, Math.ceil(industries.length / INDUSTRIES_PER_PAGE));
  const activePage = wrapPage(page, pageCount);
  const previousPage = wrapPage(activePage - 1, pageCount);
  const nextPage = wrapPage(activePage + 1, pageCount);
  const paused = hoverPaused || dragPaused;

  const goToPage = useCallback(
    (direction: SlideDirection) => {
      if (pageCount <= 1) return;
      setPage((current) => {
        if (direction === "previous") {
          return wrapPage(current - 1, pageCount);
        }

        return wrapPage(current + 1, pageCount);
      });
    },
    [pageCount],
  );

  const elasticDrag = useElasticPageDrag({
    enabled: pageCount > 1,
    threshold: 48,
    pageGap: 20,
    onNext: () => goToPage("next"),
    onPrevious: () => goToPage("previous"),
    onDragStart: () => setDragPaused(true),
    onDragEnd: () => setDragPaused(false),
  });
  const { dragHandlers, shouldIgnoreClick, slideTo, trackStyle } = elasticDrag;

  useEffect(() => {
    if (paused || pageCount <= 1) return;

    const id = setInterval(() => slideTo("next"), 5600);
    return () => clearInterval(id);
  }, [pageCount, paused, slideTo]);

  if (industries.length === 0) return null;

  const visibleCount = Math.min(INDUSTRIES_PER_PAGE, industries.length);

  const getPageIndustries = (pageIndex: number) => {
    const startIndex = pageIndex * INDUSTRIES_PER_PAGE;
    return Array.from({ length: visibleCount }, (_, index) => industries[(startIndex + index) % industries.length]);
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

  const renderIndustryPage = (pageIndex: number, isCurrent: boolean, slot: string) => (
    <div key={`${slot}-${pageIndex}`} aria-hidden={!isCurrent} className="min-w-full">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
        {getPageIndustries(pageIndex).map((item, index) => {
          const Icon = industryIcons[item.industry] || BriefcaseBusiness;

          return (
            <Link
              key={`${pageIndex}-${item.industry}-${index}`}
              href={`/viec-lam?industry=${encodeURIComponent(item.industry)}`}
              tabIndex={isCurrent ? 0 : -1}
              draggable={false}
              onDragStart={(event) => event.preventDefault()}
              onClick={(event) => {
                if (!isCurrent || shouldIgnoreClick()) {
                  event.preventDefault();
                }
              }}
              className="group block cursor-pointer"
            >
              <div className="relative flex min-h-[232px] w-full flex-col justify-between overflow-hidden rounded-xl border border-[#D6E2E7] bg-white p-5 shadow-[0_16px_38px_-34px_rgba(7,26,47,0.34)] transition-[background-color,border-color,box-shadow,transform] duration-500 ease-[var(--ease-fdi)] hover:-translate-y-1 hover:border-[#A9C4CE] hover:shadow-[0_24px_52px_-40px_rgba(7,26,47,0.48)]">
                <div className="absolute inset-x-0 top-0 h-1 bg-[var(--color-fdi-primary)]" />
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-[#DCE8EC] bg-[#F7FCFD] transition-[background-color,transform] duration-500 ease-[var(--ease-fdi)] group-hover:scale-105 group-hover:bg-[#EAF7FA]">
                  <Icon className="h-8 w-8 text-[var(--color-fdi-primary)]" />
                </div>
                <div className="mt-6 text-left">
                  <p className="flex min-h-[2.5rem] items-center text-base font-black leading-snug text-[var(--color-fdi-ink)] transition-colors group-hover:text-[var(--color-fdi-primary)]">
                    {item.industry}
                  </p>
                  <p className="mt-2 inline-flex rounded-md bg-[#EAF7FA] px-3 py-1.5 text-sm font-bold text-[var(--color-fdi-primary)]">
                    {item.count} việc làm
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <section
      className="bg-[#F7FAFB] py-10 lg:py-10"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocus={() => setHoverPaused(true)}
      onBlur={() => setHoverPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="text-center sm:text-left">
            <h2
              className="text-2xl font-black tracking-normal text-[var(--color-fdi-ink)] sm:text-3xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Ngành nghề nổi bật
            </h2>
            <p
              className="mt-1.5 text-sm font-medium text-[var(--color-fdi-text-secondary)]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Khám phá cơ hội theo các nhóm ngành đang tuyển mạnh
            </p>
          </div>

          {pageCount > 1 ? (
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => slideTo("previous")}
                aria-label="Xem nhóm ngành nghề trước"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-[#BFDCE4] bg-[#EAF7FA] text-[var(--color-fdi-primary)] shadow-[0_12px_24px_-20px_rgba(7,26,47,0.5)] transition-[background-color,border-color,transform] duration-300 ease-[var(--ease-fdi)] hover:-translate-y-0.5 hover:border-[#91BFCD] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/35"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => slideTo("next")}
                aria-label="Xem nhóm ngành nghề tiếp theo"
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
              className="flex cursor-grab gap-5 touch-pan-y select-none active:cursor-grabbing"
              style={trackStyle}
              {...dragHandlers}
            >
              {renderIndustryPage(previousPage, false, "previous")}
              {renderIndustryPage(activePage, true, "current")}
              {renderIndustryPage(nextPage, false, "next")}
            </div>
          </div>
        ) : (
          renderIndustryPage(activePage, true, "current")
        )}

        <div className="hidden">
          <Link
            href="/viec-lam"
            className="inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-lg border border-[var(--color-fdi-primary)] bg-[var(--color-fdi-primary)] px-5 text-sm font-bold text-white shadow-[0_18px_34px_-26px_rgba(10,111,157,0.72)] transition-[background-color,border-color,transform] duration-300 ease-[var(--ease-fdi)] hover:-translate-y-0.5 hover:border-[var(--color-fdi-primary-hover)] hover:bg-[var(--color-fdi-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/35"
          >
            Khám phá thêm
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {pageCount > 1 ? (
          <div className="mt-5 flex items-center justify-center gap-2">
            {Array.from({ length: pageCount }, (_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Trang ngành nghề ${index + 1}`}
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
