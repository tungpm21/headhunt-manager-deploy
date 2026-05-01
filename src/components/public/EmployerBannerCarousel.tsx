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
  const bannerImage = employer.bannerImage ?? employer.coverImage;
  const bannerPositionX = employer.bannerPositionX ?? 50;
  const bannerPositionY = employer.bannerPositionY ?? 50;
  const bannerZoom = employer.bannerZoom ?? 100;

  return (
    <section
      className="w-full pb-2 pt-0 sm:pb-3 sm:pt-1 lg:pb-4 lg:pt-1"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-label="Nhà tuyển dụng đối tác nổi bật"
    >
      {/* Centered container — equal padding on both sides */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Banner card — rounded, overflow hidden */}
        <div className="relative rounded-xl border border-[#CFE0EA] bg-white p-1.5 shadow-[0_36px_90px_-60px_rgba(7,26,47,0.72)]">
          <div className="relative overflow-hidden rounded-lg bg-[#F7FBFC] ring-1 ring-[#D8E7EA]/80">
          {/* Image area — aspect ratio controlled */}
          <div className="relative h-[280px] w-full sm:h-[360px] lg:h-[430px] xl:h-[470px]">
            {bannerImage ? (
              <Image
                src={bannerImage}
                alt={employer.companyName}
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 1280px"
                className="object-cover"
                style={{
                  objectPosition: `${bannerPositionX}% ${bannerPositionY}%`,
                  transform: `scale(${bannerZoom / 100})`,
                  transformOrigin: `${bannerPositionX}% ${bannerPositionY}%`,
                }}
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_30%,rgba(125,211,252,0.35),transparent_34%),linear-gradient(135deg,#DDF3FF_0%,#F8FDFF_46%,#B9E7FF_100%)]" />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,38,72,0.70)_0%,rgba(4,38,72,0.48)_32%,rgba(4,38,72,0.12)_58%,rgba(4,38,72,0)_78%),linear-gradient(180deg,rgba(4,38,72,0)_0%,rgba(4,38,72,0.18)_100%)]" />
            <div className="absolute left-4 top-4 rounded-lg border border-white/26 bg-white/14 px-3 py-1.5 text-[10px] font-bold uppercase text-white/90 backdrop-blur-md sm:left-6 sm:top-6">
              Nhà tuyển dụng nổi bật
            </div>
            <div className="absolute bottom-9 left-5 hidden max-w-[520px] sm:block lg:left-8">
              <h2
                aria-hidden="true"
                className="max-w-[520px] text-2xl font-black leading-tight text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.28)] lg:text-4xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {employer.companyName}
              </h2>
              <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-sky-50/82 lg:text-[15px]">
                {employer.industry ? `${employer.industry} đang mở cơ hội cho ứng viên FDI chất lượng cao.` : "Doanh nghiệp FDI nổi bật đang tuyển dụng trên FDIWork."}
              </p>
            </div>

            {/* Prev / Next arrows */}
            {total > 1 && (
              <>
                <button
                  onClick={goPrev}
                  aria-label="Banner trước"
                  className="absolute left-3 top-[37%] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg border border-white/30 bg-white/16 text-white backdrop-blur-md transition-[background-color,border-color,transform] duration-300 ease-[var(--ease-fdi)] hover:-translate-y-[calc(50%+2px)] hover:border-white/50 hover:bg-white/24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={goNext}
                  aria-label="Banner tiếp theo"
                  className="absolute right-3 top-[37%] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg border border-white/30 bg-white/16 text-white backdrop-blur-md transition-[background-color,border-color,transform] duration-300 ease-[var(--ease-fdi)] hover:-translate-y-[calc(50%+2px)] hover:border-white/50 hover:bg-white/24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Info bar — below image, inside the card */}
          <div className="flex flex-col gap-4 border-t border-white/70 bg-white/[0.92] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
            {/* Logo + Company info */}
            <div className="flex items-end gap-4 min-w-0 relative">
              <div className="relative z-10 -mt-10 flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white bg-[#FFFFFB] shadow-[0_18px_34px_-24px_rgba(0,0,0,0.75)] sm:-mt-14 sm:h-24 sm:w-24">
                <LogoImage
                  src={employer.logo}
                  alt={employer.companyName}
                  className="h-auto w-auto max-h-full max-w-full object-contain p-2"
                  iconSize="h-8 w-8 sm:h-12 sm:w-12"
                />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-[var(--color-fdi-ink)] truncate">
                  {employer.companyName}
                </h2>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  {employer.industry && (
                    <p className="text-xs sm:text-sm text-[var(--color-fdi-text-secondary)] truncate">
                      {employer.industry}
                    </p>
                  )}
                  <span className="rounded-md border border-[#CBE0E6] bg-[#EEF7FA] px-2.5 py-1 text-[11px] font-bold uppercase text-[var(--color-fdi-primary)]">
                    {(employer._count?.jobPostings ?? 0) > 0 ? `${employer._count?.jobPostings} vị trí đang mở` : "Đang tuyển dụng"}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA button */}
            <Link
              href={`/cong-ty/${employer.slug}`}
              className="group inline-flex min-h-11 shrink-0 items-center justify-center gap-3 rounded-lg border border-[var(--color-fdi-primary)] bg-[var(--color-fdi-primary)] py-1.5 pl-5 pr-1.5 text-sm font-bold text-white transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-fdi)] hover:-translate-y-0.5 hover:border-[var(--color-fdi-primary-hover)] hover:bg-[var(--color-fdi-primary-hover)] hover:shadow-[0_16px_34px_-24px_rgba(10,111,157,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/35 cursor-pointer"
            >
              <span className="hidden sm:inline">Xem vị trí đang tuyển</span>
              <span className="sm:hidden">Xem</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/16 transition-transform duration-300 ease-[var(--ease-fdi)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
          </div>
        </div>

        {/* Dot indicators — centered below the card */}
        {total > 1 && (
          <div
            className="flex items-center justify-center gap-1.5 pt-2"
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
                className="flex h-7 w-9 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/35 cursor-pointer"
              >
                <span
                  className={`h-2 rounded-full transition-[background-color,width] duration-300 ${idx === safeIndex
                    ? "w-8 bg-[var(--color-fdi-primary)]"
                    : "w-8 bg-[#C9D9DE] hover:bg-[#9FB9C2]"
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
