"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HomepageEmployer } from "@/lib/public-actions";
import { LogoImage } from "@/components/public/LogoImage";

type EmployerCarouselProps = {
  employers: HomepageEmployer[];
};

export function EmployerCarousel({ employers }: EmployerCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = employers.length;
  const safeIndex = total > 0 ? activeIndex % total : 0;

  const goNext = useCallback(() => {
    if (total < 2) return;
    setActiveIndex((i) => (i + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    if (total < 2) return;
    setActiveIndex((i) => (i - 1 + total) % total);
  }, [total]);

  // Auto-rotate timer — 4s, pauses on hover/focus
  useEffect(() => {
    if (paused || total < 2) return;
    const id = setInterval(goNext, 4000);
    return () => clearInterval(id);
  }, [paused, goNext, total]);

  if (total < 2) return null;

  return (
    <section
      className="py-16 lg:py-20 bg-[var(--color-fdi-surface)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-label="Nhà tuyển dụng nổi bật"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-10">
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

        {/* Mobile: 2-col static grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:hidden">
          {employers.map((emp) => (
            <EmployerCard key={emp.id} employer={emp} />
          ))}
        </div>

        {/* Desktop: Carousel */}
        <div className="hidden md:block" aria-live="off">
          <div className="flex items-center gap-6">
            {/* Prev button */}
            <button
              onClick={goPrev}
              aria-label="Nhà tuyển dụng trước"
              className="flex-shrink-0 h-10 w-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-[var(--color-fdi-primary)] hover:text-[var(--color-fdi-primary)] transition-colors cursor-pointer shadow-sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Carousel track — show 4 at a time */}
            <div className="flex-1 grid grid-cols-4 xl:grid-cols-5 gap-4 overflow-hidden">
              {Array.from({ length: Math.min(5, total) }, (_, offset) => {
                const idx = (safeIndex + offset) % total;
                return (
                  <div key={employers[idx].id} className={offset >= 4 ? "hidden xl:block" : ""}>
                    <EmployerCard employer={employers[idx]} />
                  </div>
                );
              })}
            </div>

            {/* Next button */}
            <button
              onClick={goNext}
              aria-label="Nhà tuyển dụng tiếp theo"
              className="flex-shrink-0 h-10 w-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-[var(--color-fdi-primary)] hover:text-[var(--color-fdi-primary)] transition-colors cursor-pointer shadow-sm"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-1.5 mt-6" role="tablist" aria-label="Chuyển trang">
            {employers.map((_, idx) => (
              <button
                key={idx}
                role="tab"
                aria-selected={idx === safeIndex}
                aria-label={`Trang ${idx + 1}`}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-[background-color,width] duration-200 cursor-pointer ${idx === safeIndex
                  ? "w-6 bg-[var(--color-fdi-primary)]"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function EmployerCard({ employer }: { employer: HomepageEmployer }) {
  const jobCount = employer._count?.jobPostings ?? 0;

  return (
    <Link href={`/cong-ty/${employer.slug}`} className="group block cursor-pointer">
      <div className="bg-white rounded-xl p-5 text-center transition-[box-shadow,transform,border-color] duration-200 hover:shadow-md hover:-translate-y-1 border border-gray-100">
        {/* Logo */}
        <div className="mx-auto h-20 w-20 rounded-xl bg-[var(--color-fdi-surface)] flex items-center justify-center overflow-hidden mb-3 border border-gray-50">
          <LogoImage src={employer.logo} alt={employer.companyName} className="h-full w-full object-contain p-2" iconSize="h-8 w-8" />
        </div>

        {/* Name */}
        <p className="text-xs font-semibold text-[var(--color-fdi-text)] line-clamp-2 mb-1 group-hover:text-[var(--color-fdi-primary)] transition-colors">
          {employer.companyName}
        </p>

        {/* Industry */}
        {employer.industry && (
          <p className="text-[10px] text-[var(--color-fdi-text-secondary)] line-clamp-1 mb-2">
            {employer.industry}
          </p>
        )}

        {/* Job count CTA */}
        {jobCount > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[var(--color-fdi-surface)] text-[10px] font-medium text-[var(--color-fdi-primary)]">
            {jobCount} việc làm
          </span>
        )}
      </div>
    </Link>
  );
}
