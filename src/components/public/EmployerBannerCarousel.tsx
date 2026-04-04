"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import type { HomepageEmployer } from "@/lib/public-actions";
import { LogoImage } from "@/components/public/LogoImage";

type EmployerBannerCarouselProps = {
  employers: HomepageEmployer[];
};

export function EmployerBannerCarousel({ employers }: EmployerBannerCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  if (employers.length === 0) return null;

  const total = employers.length;
  const safeIndex = activeIndex % total;

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (paused || total <= 1) return;
    const id = setInterval(goNext, 5000);
    return () => clearInterval(id);
  }, [paused, goNext, total]);

  const employer = employers[safeIndex];

  return (
    <section
      className="relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-label="Nhà tuyển dụng đối tác nổi bật"
    >
      {/* Banner slide */}
      <div className="relative h-[280px] sm:h-[360px] overflow-hidden">
        {employer.coverImage ? (
          <img
            src={employer.coverImage}
            alt={employer.companyName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[var(--color-fdi-dark)] via-[#005A9E] to-[var(--color-fdi-primary)]" />
        )}

        {/* Overlay gradient for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-8 sm:px-12 sm:pb-10">
          <div className="flex items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0 overflow-hidden">
                <LogoImage src={employer.logo} alt={employer.companyName} className="h-full w-full object-contain p-1" iconSize="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-0.5">
                  Đối tác tuyển dụng
                </p>
                <h2 className="text-white text-xl sm:text-2xl font-bold line-clamp-2 drop-shadow-sm">
                  {employer.companyName}
                </h2>
                {employer.industry && (
                  <p className="text-white/80 text-sm mt-0.5">{employer.industry}</p>
                )}
              </div>
            </div>

            {/* CTA */}
            <Link
              href={`/cong-ty/${employer.slug}`}
              className="shrink-0 hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[var(--color-fdi-primary)] font-semibold text-sm hover:bg-[var(--color-fdi-surface)] transition-colors shadow-lg cursor-pointer"
            >
              Xem công ty
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile CTA */}
          <Link
            href={`/cong-ty/${employer.slug}`}
            className="mt-4 sm:hidden flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white text-[var(--color-fdi-primary)] font-semibold text-sm shadow-lg cursor-pointer w-fit"
          >
            Xem công ty
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Prev / Next — only if multiple banners */}
        {total > 1 && (
          <>
            <button
              onClick={goPrev}
              aria-label="Banner trước"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goNext}
              aria-label="Banner tiếp theo"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {total > 1 && (
        <div
          className="flex items-center justify-center gap-1.5 py-3 bg-[var(--color-fdi-dark)]"
          role="tablist"
          aria-label="Chuyển banner"
        >
          {employers.map((_, idx) => (
            <button
              key={idx}
              role="tab"
              aria-selected={idx === safeIndex}
              aria-label={`Banner ${idx + 1}`}
              onClick={() => setActiveIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === safeIndex
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/30 hover:bg-white/60"
                }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
