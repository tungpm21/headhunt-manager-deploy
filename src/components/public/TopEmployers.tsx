"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
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
    <section className="relative z-10 -mt-8 bg-[linear-gradient(180deg,rgba(243,247,248,0)_0%,#F8FBFA_22%,#FFFFFB_100%)] pb-12 pt-0 sm:pb-14 lg:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[#D8E7EA] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FCFC_100%)] p-4 shadow-[0_28px_72px_-56px_rgba(7,26,47,0.42)] sm:p-5 lg:p-6">
        {/* Heading + nav arrows */}
        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
          <div>
            <p className="mb-2 inline-flex rounded-full border border-[#BFDCE4] bg-[#EAF7FA] px-3 py-1 text-[10px] font-bold uppercase text-[var(--color-fdi-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              Hiring partners
            </p>
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

          {/* Arrow controls */}
          <div className="hidden items-center gap-2 sm:flex">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Cuộn trái"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#BFDCE4] bg-[#EAF7FA] text-[var(--color-fdi-primary)] shadow-[0_12px_24px_-20px_rgba(7,26,47,0.5)] transition-[background-color,border-color,transform] duration-500 ease-[var(--ease-fdi)] hover:-translate-y-0.5 hover:border-[#91BFCD] hover:bg-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Cuộn phải"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#BFDCE4] bg-[#EAF7FA] text-[var(--color-fdi-primary)] shadow-[0_12px_24px_-20px_rgba(7,26,47,0.5)] transition-[background-color,border-color,transform] duration-500 ease-[var(--ease-fdi)] hover:-translate-y-0.5 hover:border-[#91BFCD] hover:bg-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Horizontal scroll track — single row */}
        <div
          ref={scrollRef}
          className="grid auto-cols-[190px] grid-flow-col gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory sm:auto-cols-[220px] sm:gap-4 lg:auto-cols-[calc((100%_-_64px)/5)]"
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
                <div className="min-h-[224px] overflow-hidden rounded-2xl border border-[#D6E5E9] bg-white shadow-[0_20px_44px_-36px_rgba(7,26,47,0.48)] transition-[border-color,box-shadow,transform] duration-500 ease-[var(--ease-fdi)] hover:-translate-y-1 hover:border-[#A9CED8] hover:shadow-[0_30px_58px_-38px_rgba(7,26,47,0.58)]">
                  <div className="h-1 bg-[linear-gradient(90deg,#0A6F9D_0%,#5CC3D9_100%)]" />
                  {/* Logo zone — full bleed */}
                  <div className="flex h-[112px] items-center justify-center border-b border-[#E3ECEF] bg-[linear-gradient(180deg,#F7FCFD_0%,#FFFFFF_100%)] p-4 sm:h-[120px] lg:h-[118px]">
                    <div className="flex h-20 w-full items-center justify-center rounded-2xl bg-white shadow-[inset_0_0_0_1px_rgba(216,231,234,0.72)] sm:h-24">
                      <LogoImage
                        src={employer.logo}
                        alt={employer.companyName}
                        className="h-auto w-auto max-h-20 max-w-[86%] object-contain"
                        iconSize="h-14 w-14"
                      />
                    </div>
                  </div>

                  {/* Text zone — white background */}
                  <div className="bg-white p-3.5 text-center sm:p-4 lg:p-3.5">
                    <p className="flex min-h-[2.55rem] items-center justify-center text-xs font-black uppercase leading-tight text-[var(--color-fdi-ink)] transition-colors group-hover:text-[var(--color-fdi-primary)] sm:text-sm">
                      {employer.companyName}
                    </p>

                    {/* VIỆC MỚI badge */}
                    <div className="mt-2">
                      <span className="inline-block rounded-full bg-[var(--color-fdi-primary)] px-3 py-1.5 text-[11px] font-bold uppercase text-white shadow-[0_10px_22px_-18px_rgba(10,111,157,0.88)] transition-colors group-hover:bg-[var(--color-fdi-primary-hover)]">
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
            className="inline-flex min-h-11 items-center gap-1 rounded-full border border-[var(--color-fdi-primary)] bg-[var(--color-fdi-primary)] px-5 text-sm font-bold text-white shadow-[0_18px_34px_-26px_rgba(10,111,157,0.72)] transition-[background-color,border-color,transform] duration-500 ease-[var(--ease-fdi)] hover:-translate-y-0.5 hover:border-[var(--color-fdi-primary-hover)] hover:bg-[var(--color-fdi-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25 cursor-pointer"
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
