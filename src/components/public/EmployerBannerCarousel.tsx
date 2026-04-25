"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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

  const total = employers.length;
  const safeIndex = total > 0 ? activeIndex % total : 0;

  const goNext = useCallback(() => {
    if (total === 0) return;
    setActiveIndex((i) => (i + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    if (total === 0) return;
    setActiveIndex((i) => (i - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (paused || total <= 1) return;
    const id = setInterval(goNext, 5000);
    return () => clearInterval(id);
  }, [paused, goNext, total]);

  const employer = employers[safeIndex];

  if (!employer) return null;

  return (
    <section
      className="w-full pb-6 pt-4 sm:pb-7 sm:pt-5 lg:pb-8 lg:pt-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-label="Nhà tuyển dụng đối tác nổi bật"
    >
      {/* Centered container — equal padding on both sides */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Banner card — rounded, overflow hidden */}
        <div className="relative overflow-hidden rounded-2xl border border-white/14 bg-[#061D38] shadow-[0_34px_82px_-48px_rgba(0,0,0,0.95)] ring-1 ring-black/10">
          {/* Image area — aspect ratio controlled */}
          <div className="relative h-[220px] w-full sm:h-[310px] lg:h-[390px] xl:h-[405px]">
            {employer.coverImage ? (
              <Image
                src={employer.coverImage}
                alt={employer.companyName}
                fill
                loading="eager"
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 1280px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_30%,rgba(125,211,252,0.35),transparent_34%),linear-gradient(135deg,#DDF3FF_0%,#F8FDFF_46%,#B9E7FF_100%)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#061D38]/34 via-transparent to-transparent" />

            {/* Prev / Next arrows */}
            {total > 1 && (
              <>
                <button
                  onClick={goPrev}
                  aria-label="Banner trước"
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/12 bg-[#061D38]/50 text-white backdrop-blur-sm transition-[background-color,border-color] hover:border-white/28 hover:bg-[#061D38]/72 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={goNext}
                  aria-label="Banner tiếp theo"
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/12 bg-[#061D38]/50 text-white backdrop-blur-sm transition-[background-color,border-color] hover:border-white/28 hover:bg-[#061D38]/72 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Info bar — below image, inside the card */}
          <div className="flex items-center justify-between gap-4 bg-[linear-gradient(90deg,#061D38_0%,#082A4C_58%,#061D38_100%)] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-6 sm:py-5">
            {/* Logo + Company info */}
            <div className="flex items-end gap-4 min-w-0 relative">
              <div className="relative z-10 -mt-10 flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white bg-[#FFFFFB] shadow-[0_18px_34px_-24px_rgba(0,0,0,0.75)] sm:-mt-14 sm:h-24 sm:w-24">
                <LogoImage
                  src={employer.logo}
                  alt={employer.companyName}
                  className="max-h-full max-w-full object-contain p-2"
                  iconSize="h-8 w-8 sm:h-12 sm:w-12"
                />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-white truncate">
                  {employer.companyName}
                </h2>
                {employer.industry && (
                  <p className="text-xs sm:text-sm text-sky-100/75 truncate">
                    {employer.industry}
                  </p>
                )}
              </div>
            </div>

            {/* CTA button */}
            <Link
              href={`/cong-ty/${employer.slug}`}
              className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-white/28 bg-white/[0.03] px-5 py-2.5 text-sm font-semibold text-white transition-[background-color,border-color,box-shadow] hover:border-white/55 hover:bg-white/10 hover:shadow-[0_12px_28px_-22px_rgba(255,255,255,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 cursor-pointer"
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
                className="flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 cursor-pointer"
              >
                <span
                  className={`h-2 rounded-full transition-[background-color,width] duration-300 ${idx === safeIndex
                    ? "w-8 bg-white"
                    : "w-8 bg-white/25 hover:bg-white/45"
                    }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
