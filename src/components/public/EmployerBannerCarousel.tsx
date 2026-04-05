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
      {/* Banner — fixed aspect ratio: ~3:1 desktop, ~2:1 mobile */}
      <div className="relative aspect-[2/1] sm:aspect-[3/1] lg:aspect-[3.5/1] max-h-[420px] overflow-hidden">
        {/* Background image — full bleed */}
        {employer.coverImage ? (
          <img
            src={employer.coverImage}
            alt={employer.companyName}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-fdi-dark)] via-[#005A9E] to-[var(--color-fdi-primary)]" />
        )}

        {/* Overlay gradient — stronger from bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/5" />

        {/* Content — contained width */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
            <div className="flex items-end justify-between gap-4">
              {/* Company info — logo + text grouped tightly */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-white shadow-lg flex items-center justify-center shrink-0 overflow-hidden">
                  <LogoImage
                    src={employer.logo}
                    alt={employer.companyName}
                    className="h-full w-full object-contain p-1.5"
                    iconSize="h-7 w-7"
                  />
                </div>
                <div>
                  <p className="text-white/60 text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-0.5">
                    Đối tác tuyển dụng
                  </p>
                  <h2 className="text-white text-lg sm:text-xl lg:text-2xl font-bold line-clamp-1 drop-shadow-sm">
                    {employer.companyName}
                  </h2>
                  {employer.industry && (
                    <p className="text-white/70 text-xs sm:text-sm mt-0.5">{employer.industry}</p>
                  )}
                </div>
              </div>

              {/* CTA button */}
              <Link
                href={`/cong-ty/${employer.slug}`}
                className="shrink-0 hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[var(--color-fdi-primary)] font-semibold text-sm hover:bg-gray-50 transition-colors shadow-lg cursor-pointer"
              >
                Xem công ty
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Mobile CTA */}
            <Link
              href={`/cong-ty/${employer.slug}`}
              className="mt-3 sm:hidden inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[var(--color-fdi-primary)] font-semibold text-sm shadow-lg cursor-pointer"
            >
              Xem công ty
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Prev / Next arrows */}
        {total > 1 && (
          <>
            <button
              onClick={goPrev}
              aria-label="Banner trước"
              className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goNext}
              aria-label="Banner tiếp theo"
              className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Dot indicators — integrated, no extra blue bar */}
      {total > 1 && (
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1.5 pb-2 pointer-events-none"
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
              className={`pointer-events-auto h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === safeIndex
                ? "w-6 bg-white"
                : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
