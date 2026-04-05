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
      className="w-full bg-gradient-to-b from-[var(--color-fdi-dark)] via-[#005A9E] to-[var(--color-fdi-primary)] py-10 sm:py-16 lg:py-20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-label="Nhà tuyển dụng đối tác nổi bật"
    >
      {/* Centered container — equal padding on both sides */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Banner card — rounded, overflow hidden */}
        <div className="relative rounded-2xl overflow-hidden bg-white shadow-2xl">
          {/* Image area — aspect ratio controlled */}
          <div className="relative h-[250px] sm:h-[350px] lg:h-[450px] xl:h-[500px] w-full">
            {employer.coverImage ? (
              <img
                src={employer.coverImage}
                alt={employer.companyName}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-fdi-dark)] via-[#005A9E] to-[var(--color-fdi-primary)]" />
            )}

            {/* Prev / Next arrows */}
            {total > 1 && (
              <>
                <button
                  onClick={goPrev}
                  aria-label="Banner trước"
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={goNext}
                  aria-label="Banner tiếp theo"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Info bar — below image, inside the card */}
          <div className="px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between gap-4">
            {/* Logo + Company info */}
            <div className="flex items-end gap-4 min-w-0 relative">
              <div className="h-20 w-20 sm:h-28 sm:w-28 rounded-xl bg-white border border-gray-100 shadow-md flex items-center justify-center shrink-0 overflow-hidden relative -mt-12 sm:-mt-20 z-10">
                <LogoImage
                  src={employer.logo}
                  alt={employer.companyName}
                  className="max-h-full max-w-full object-contain p-2"
                  iconSize="h-8 w-8 sm:h-12 sm:w-12"
                />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-[var(--color-fdi-text)] truncate">
                  {employer.companyName}
                </h2>
                {employer.industry && (
                  <p className="text-xs sm:text-sm text-[var(--color-fdi-text-secondary)] truncate">
                    {employer.industry}
                  </p>
                )}
              </div>
            </div>

            {/* CTA button */}
            <Link
              href={`/cong-ty/${employer.slug}`}
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--color-fdi-primary)] text-[var(--color-fdi-primary)] font-semibold text-sm hover:bg-[var(--color-fdi-primary)] hover:text-white transition-colors cursor-pointer"
            >
              <span className="hidden sm:inline">Khám phá ngay</span>
              <span className="sm:hidden">Xem</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Dot indicators — centered below the card */}
        {total > 1 && (
          <div
            className="flex items-center justify-center gap-1.5 pt-4"
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
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${idx === safeIndex
                  ? "w-6 bg-white"
                  : "w-2 bg-white/30 hover:bg-white/60"
                  }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
