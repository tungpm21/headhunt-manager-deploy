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
      className="w-full pb-2 pt-2 sm:pb-3 sm:pt-3 lg:pb-4 lg:pt-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-label="Nhà tuyển dụng đối tác nổi bật"
    >
      {/* Centered container — equal padding on both sides */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Banner card — rounded, overflow hidden */}
        <div className="relative rounded-[2rem] border border-white/16 bg-white/[0.08] p-1.5 shadow-[0_28px_74px_-58px_rgba(0,0,0,0.72)]">
          <div className="relative overflow-hidden rounded-[calc(2rem-0.375rem)] bg-[#061D38] ring-1 ring-white/14">
          {/* Image area — aspect ratio controlled */}
          <div className="relative h-[250px] w-full sm:h-[350px] lg:h-[420px] xl:h-[470px]">
            {employer.coverImage ? (
              <Image
                src={employer.coverImage}
                alt={employer.companyName}
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 1280px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_30%,rgba(125,211,252,0.35),transparent_34%),linear-gradient(135deg,#DDF3FF_0%,#F8FDFF_46%,#B9E7FF_100%)]" />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,29,56,0.62)_0%,rgba(3,29,56,0.24)_48%,rgba(3,29,56,0.06)_100%),linear-gradient(180deg,rgba(3,29,56,0.04)_0%,rgba(3,29,56,0.68)_100%)]" />
            <div className="absolute left-4 top-4 rounded-full border border-white/16 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase text-white/88 backdrop-blur-md sm:left-6 sm:top-6">
              Featured employer
            </div>
            <div className="absolute bottom-6 left-5 hidden max-w-2xl sm:block lg:bottom-8 lg:left-8">
              <p className="text-xs font-bold uppercase text-sky-100/74">Paid employer spotlight</p>
              <h2
                aria-hidden="true"
                className="mt-2 text-3xl font-black leading-tight text-white lg:text-5xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {employer.companyName}
              </h2>
              <p className="mt-3 max-w-xl text-base font-medium text-sky-100/82">
                {employer.industry ? `${employer.industry} đang mở cơ hội cho ứng viên FDI chất lượng cao.` : "Doanh nghiệp FDI nổi bật đang tuyển dụng trên FDIWork."}
              </p>
            </div>

            {/* Prev / Next arrows */}
            {total > 1 && (
              <>
                <button
                  onClick={goPrev}
                  aria-label="Banner trước"
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/26 bg-white/14 text-white backdrop-blur-md transition-[background-color,border-color,transform] duration-500 ease-[var(--ease-fdi)] hover:-translate-y-[calc(50%+2px)] hover:border-white/42 hover:bg-white/22 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={goNext}
                  aria-label="Banner tiếp theo"
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/26 bg-white/14 text-white backdrop-blur-md transition-[background-color,border-color,transform] duration-500 ease-[var(--ease-fdi)] hover:-translate-y-[calc(50%+2px)] hover:border-white/42 hover:bg-white/22 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Info bar — below image, inside the card */}
          <div className="flex flex-col gap-4 bg-[linear-gradient(90deg,#062746_0%,#0A3A5D_58%,#062746_100%)] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
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
                <h2 className="text-base sm:text-lg font-bold text-white truncate">
                  {employer.companyName}
                </h2>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  {employer.industry && (
                    <p className="text-xs sm:text-sm text-sky-100/75 truncate">
                      {employer.industry}
                    </p>
                  )}
                  <span className="rounded-full border border-white/12 bg-white/[0.07] px-2.5 py-1 text-[11px] font-bold uppercase text-sky-100/82">
                    {(employer._count?.jobPostings ?? 0) > 0 ? `${employer._count?.jobPostings} open roles` : "Hiring signal"}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA button */}
            <Link
              href={`/cong-ty/${employer.slug}`}
              className="group inline-flex min-h-11 shrink-0 items-center justify-center gap-3 rounded-full border border-white/20 bg-white/[0.08] py-1.5 pl-5 pr-1.5 text-sm font-bold text-white transition-[background-color,border-color,box-shadow,transform] duration-500 ease-[var(--ease-fdi)] hover:-translate-y-0.5 hover:border-white/44 hover:bg-white/14 hover:shadow-[0_16px_34px_-24px_rgba(255,255,255,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 cursor-pointer"
            >
              <span className="hidden sm:inline">Khám phá ngay</span>
              <span className="sm:hidden">Xem</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/16 transition-transform duration-500 ease-[var(--ease-fdi)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
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
                className="flex h-7 w-9 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 cursor-pointer"
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
