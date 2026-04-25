"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HomepageEmployer } from "@/lib/public-actions";
import { LogoImage } from "@/components/public/LogoImage";

type TopEmployersProps = {
  employers: HomepageEmployer[];
};

export function TopEmployers({ employers }: TopEmployersProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const hasEmployers = employers.length > 0;

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.clientWidth;
    el.scrollBy({ left: direction === "left" ? -distance : distance, behavior: "smooth" });
  };

  if (!hasEmployers) return null;

  return (
    <section className="py-8 sm:py-9 lg:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading + nav arrows */}
        <div className="mb-5 flex items-end justify-between sm:mb-6">
          <div>
            <h2
              className="text-xl font-bold text-white sm:text-2xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Nhà tuyển dụng hàng đầu
            </h2>
            <p
              className="mt-1.5 text-sm text-sky-100/[0.78]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Các doanh nghiệp FDI uy tín đang tuyển dụng
            </p>
          </div>

          {/* Arrow controls */}
          <div className="hidden items-center gap-2 sm:flex">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Cuộn trái"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-white/[0.08] text-white shadow-sm transition-[background-color,border-color] hover:border-white/45 hover:bg-white/[0.14] cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Cuộn phải"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-white/[0.08] text-white shadow-sm transition-[background-color,border-color] hover:border-white/45 hover:bg-white/[0.14] cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Horizontal scroll track — single row */}
        <div
          ref={scrollRef}
          className="grid auto-cols-[168px] grid-flow-col gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory sm:auto-cols-[190px] sm:gap-4 lg:auto-cols-[calc((100%_-_64px)/5)]"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {employers.map((employer) => {
            const jobCount = employer._count?.jobPostings ?? 0;

            return (
              <Link
                key={employer.id}
                href={`/cong-ty/${employer.slug}`}
                className="group block cursor-pointer snap-start"
              >
                <div className="overflow-hidden rounded-xl border border-white/30 bg-[#FFFFFB] shadow-[0_18px_42px_-34px_rgba(0,0,0,0.8)] transition-[border-color,box-shadow,transform] duration-300 ease-out hover:-translate-y-1 hover:border-white/60 hover:shadow-[0_26px_54px_-34px_rgba(0,0,0,0.82)]">
                  {/* Logo zone — full bleed */}
                  <div className="flex h-[118px] items-center justify-center border-b border-[#E6EBEF] bg-[#FFFFFB] sm:h-[132px] lg:h-[128px]">
                    <LogoImage
                      src={employer.logo}
                      alt={employer.companyName}
                      className="h-full w-full object-contain p-3"
                      iconSize="h-16 w-16"
                    />
                  </div>

                  {/* Text zone — white background */}
                  <div className="bg-[#FFFFFB] p-3 text-center sm:p-4 lg:p-3.5">
                    <p className="flex min-h-[2.5rem] items-center justify-center text-xs font-bold uppercase leading-tight text-[var(--color-fdi-text)] transition-colors group-hover:text-[var(--color-fdi-primary)] sm:text-sm">
                      {employer.companyName}
                    </p>

                    {/* VIỆC MỚI badge */}
                    <div className="mt-2">
                      <span className="inline-block rounded-md bg-[#E8F5F7] px-3 py-1.5 text-[11px] font-bold uppercase text-[var(--color-fdi-primary)] transition-colors group-hover:bg-[var(--color-fdi-accent-orange)] group-hover:text-white">
                        {jobCount > 0 ? `${jobCount} VIỆC MỚI` : "VIỆC MỚI"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/cong-ty"
            className="inline-flex min-h-11 items-center gap-1 rounded-full border border-[#C7DCE4] bg-white px-4 text-sm font-semibold text-[var(--color-fdi-primary)] shadow-[0_18px_34px_-28px_rgba(17,24,39,0.45)] transition-[background-color,border-color,color] hover:border-[#9CC4D1] hover:bg-[#F6FBFC] hover:text-[var(--color-fdi-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 cursor-pointer"
          >
            Khám phá thêm →
          </Link>
        </div>
      </div>
    </section>
  );
}
