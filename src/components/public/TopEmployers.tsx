"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Crown, Briefcase } from "lucide-react";
import type { HomepageEmployer } from "@/lib/public-actions";
import { LogoImage } from "@/components/public/LogoImage";

const tierBadge: Record<string, { label: string; className: string }> = {
  VIP: { label: "VIP", className: "bg-amber-100 text-amber-700" },
  PREMIUM: { label: "Premium", className: "bg-purple-100 text-purple-700" },
  STANDARD: { label: "Standard", className: "bg-blue-100 text-blue-700" },
  BASIC: { label: "Basic", className: "bg-gray-100 text-gray-600" },
};

type TopEmployersProps = {
  employers: HomepageEmployer[];
};

export function TopEmployers({ employers }: TopEmployersProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  if (employers.length === 0) return null;

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
    const cardWidth = 220;
    const gap = 20;
    const distance = (cardWidth + gap) * 2;
    el.scrollBy({ left: direction === "left" ? -distance : distance, behavior: "smooth" });
  };

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-[#EDF5FF] to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading + nav arrows */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2
              className="text-2xl sm:text-3xl font-bold text-[var(--color-fdi-text)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Nhà tuyển dụng hàng đầu
            </h2>
            <p
              className="mt-2 text-sm text-[var(--color-fdi-text-secondary)]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Các doanh nghiệp FDI uy tín đang tuyển dụng
            </p>
          </div>

          {/* Arrow controls */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Cuộn trái"
              className="h-9 w-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-[var(--color-fdi-accent-orange)] hover:text-[var(--color-fdi-accent-orange)] transition-colors cursor-pointer shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Cuộn phải"
              className="h-9 w-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-[var(--color-fdi-accent-orange)] hover:text-[var(--color-fdi-accent-orange)] transition-colors cursor-pointer shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Horizontal scroll track — single row */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {employers.map((employer) => {
            const badge = employer.subscription
              ? tierBadge[employer.subscription.tier]
              : null;
            const jobCount = employer._count?.jobPostings ?? 0;

            return (
              <Link
                key={employer.id}
                href={`/cong-ty/${employer.slug}`}
                className="group block cursor-pointer snap-start shrink-0"
              >
                <div className="w-[200px] sm:w-[220px] rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 hover:border-[var(--color-fdi-primary)] bg-white">
                  {/* Logo zone — full bleed */}
                  <div className="h-[140px] sm:h-[160px] bg-white flex items-center justify-center border-b border-gray-100">
                    <LogoImage
                      src={employer.logo}
                      alt={employer.companyName}
                      className="h-full w-full object-contain p-3"
                      iconSize="h-16 w-16"
                    />
                  </div>

                  {/* Text zone — white background */}
                  <div className="p-4 text-center bg-white">
                    <p className="text-sm font-bold text-[var(--color-fdi-text)] line-clamp-2 group-hover:text-[var(--color-fdi-primary)] transition-colors uppercase leading-tight min-h-[2.5rem]">
                      {employer.companyName}
                    </p>

                    {/* VIỆC MỚI badge */}
                    <div className="mt-3">
                      <span className="inline-block px-5 py-2 bg-[#E8F3FF] text-[var(--color-fdi-accent-orange)] group-hover:bg-[var(--color-fdi-accent-orange)] group-hover:text-white transition-all text-xs font-bold rounded-lg uppercase">
                        {jobCount > 0 ? `${jobCount} VIỆC MỚI` : "VIỆC MỚI"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-6">
          <Link
            href="/cong-ty"
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-fdi-primary)] hover:underline cursor-pointer"
          >
            Khám phá thêm →
          </Link>
        </div>
      </div>
    </section>
  );
}
