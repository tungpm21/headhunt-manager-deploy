"use client";

import { useCallback, useEffect, useState } from "react";
import type { KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { HomepageEmployer } from "@/lib/public-actions";
import { LogoImage } from "@/components/public/LogoImage";
import { useElasticPageDrag } from "@/components/public/useElasticPageDrag";

type EmployerBannerCarouselProps = {
  employers: HomepageEmployer[];
};

export function EmployerBannerCarousel({ employers }: EmployerBannerCarouselProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [dragPaused, setDragPaused] = useState(false);

  const total = employers.length;
  const safeIndex = total > 0 ? activeIndex % total : 0;
  const previousIndex = total > 0 ? (safeIndex - 1 + total) % total : 0;
  const nextIndex = total > 0 ? (safeIndex + 1) % total : 0;
  const paused = hoverPaused || dragPaused;

  const goNext = useCallback(() => {
    if (total === 0) return;
    setActiveIndex((i) => (i + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    if (total === 0) return;
    setActiveIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const elasticDrag = useElasticPageDrag({
    enabled: total > 1,
    threshold: 56,
    onNext: goNext,
    onPrevious: goPrev,
    onDragStart: () => setDragPaused(true),
    onDragEnd: () => setDragPaused(false),
  });
  const { dragHandlers, shouldIgnoreClick, slideTo, trackStyle } = elasticDrag;

  useEffect(() => {
    if (paused || total <= 1) return;
    const id = setInterval(() => slideTo("next"), 5000);
    return () => clearInterval(id);
  }, [paused, slideTo, total]);

  const employer = employers[safeIndex];

  if (!employer) return null;

  const employerHref = `/cong-ty/${employer.slug}`;

  const openEmployer = () => {
    router.push(employerHref);
  };

  const handleBannerClick = () => {
    if (shouldIgnoreClick()) return;
    openEmployer();
  };

  const handleBannerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openEmployer();
  };

  const goToIndex = (index: number) => {
    if (index === safeIndex) return;
    if (index === nextIndex) {
      slideTo("next");
      return;
    }
    if (index === previousIndex) {
      slideTo("previous");
      return;
    }
    setActiveIndex(index);
  };

  const renderBannerPanel = (panelEmployer: HomepageEmployer, isCurrent: boolean, slot: string) => {
    const bannerImage = panelEmployer.bannerImage ?? panelEmployer.coverImage;
    const bannerPositionX = panelEmployer.bannerPositionX ?? 50;
    const bannerPositionY = panelEmployer.bannerPositionY ?? 50;
    const bannerZoom = panelEmployer.bannerZoom ?? 100;
    const panelHref = `/cong-ty/${panelEmployer.slug}`;

    return (
      <div key={`${slot}-${panelEmployer.id}`} aria-hidden={!isCurrent} className="min-w-full overflow-hidden bg-white">
        <div
          className="relative h-[280px] w-full cursor-pointer touch-pan-y select-none sm:h-[360px] lg:h-[430px] xl:h-[470px]"
          role={isCurrent ? "link" : undefined}
          tabIndex={isCurrent ? 0 : -1}
          aria-label={isCurrent ? `Xem trang cong ty ${panelEmployer.companyName}` : undefined}
          onClick={isCurrent ? handleBannerClick : undefined}
          onKeyDown={isCurrent ? handleBannerKeyDown : undefined}
        >
          {bannerImage ? (
            <Image
              src={bannerImage}
              alt={panelEmployer.companyName}
              fill
              priority={isCurrent}
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
              className="max-w-[520px] text-2xl font-black leading-tight text-white drop-shadow-[0_2px_18px_rgba(15,23,42,0.28)] lg:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {panelEmployer.companyName}
            </h2>
            <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-sky-50/82 lg:text-[15px]">
              {panelEmployer.industry
                ? `${panelEmployer.industry} đang mở cơ hội cho ứng viên FDI chất lượng cao.`
                : "Doanh nghiệp FDI nổi bật đang tuyển dụng trên FDIWork."}
            </p>
          </div>
        </div>

        <div className="relative flex flex-col gap-4 border-t border-white/12 bg-[#063B5D] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div className="relative flex min-w-0 items-center gap-4">
            <div className="relative z-10 flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E1EAF0] bg-white shadow-[0_18px_34px_-24px_rgba(15,23,42,0.48)] sm:h-20 sm:w-20">
              <LogoImage
                src={panelEmployer.logo}
                alt={panelEmployer.companyName}
                className="h-auto w-auto max-h-full max-w-full object-contain p-2.5"
                iconSize="h-8 w-8 text-[var(--color-fdi-primary)] sm:h-12 sm:w-12"
              />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-white/92 sm:text-base">{panelEmployer.companyName}</h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {panelEmployer.industry ? <p className="truncate text-xs text-sky-100/78 sm:text-sm">{panelEmployer.industry}</p> : null}
                <span className="rounded-md border border-white/24 bg-white/12 px-2.5 py-1 text-[11px] font-bold uppercase text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                  {(panelEmployer._count?.jobPostings ?? 0) > 0 ? `${panelEmployer._count?.jobPostings} vị trí đang mở` : "Đang tuyển dụng"}
                </span>
              </div>
            </div>
          </div>

          <Link
            href={panelHref}
            tabIndex={isCurrent ? 0 : -1}
            onClick={(event) => {
              if (!isCurrent || shouldIgnoreClick()) {
                event.preventDefault();
              }
              event.stopPropagation();
            }}
            className="group inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-3 rounded-lg border border-white bg-white py-1.5 pl-5 pr-1.5 text-sm font-bold text-[#063B5D] shadow-[0_14px_30px_-24px_rgba(15,23,42,0.42)] transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-fdi)] hover:-translate-y-0.5 hover:border-[#D9F1F8] hover:bg-[#F1FAFD] hover:shadow-[0_18px_34px_-26px_rgba(15,23,42,0.52)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <span className="hidden sm:inline">Xem vị trí đang tuyển</span>
            <span className="sm:hidden">Xem việc</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-fdi-primary)] text-white transition-transform duration-300 ease-[var(--ease-fdi)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <section
      className="w-full pb-2 pt-0 sm:pb-3 lg:pb-4"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocus={() => setHoverPaused(true)}
      onBlur={() => setHoverPaused(false)}
      aria-label="Nhà tuyển dụng đối tác nổi bật"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-xl bg-white shadow-[0_28px_70px_-54px_rgba(7,26,47,0.56),0_12px_32px_-30px_rgba(7,26,47,0.24)]">
          {total > 1 ? (
            <div
              className="flex cursor-grab touch-pan-y select-none active:cursor-grabbing"
              style={trackStyle}
              {...dragHandlers}
            >
              {renderBannerPanel(employers[previousIndex], false, "previous")}
              {renderBannerPanel(employer, true, "current")}
              {renderBannerPanel(employers[nextIndex], false, "next")}
            </div>
          ) : (
            renderBannerPanel(employer, true, "current")
          )}

          {total > 1 ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  slideTo("previous");
                }}
                aria-label="Banner trước"
                className="absolute left-3 top-[140px] z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg border border-white/30 bg-white/16 text-white backdrop-blur-md transition-[background-color,border-color,transform] duration-300 ease-[var(--ease-fdi)] hover:-translate-y-[calc(50%+2px)] hover:border-white/50 hover:bg-white/24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:top-[180px] lg:top-[215px] xl:top-[235px]"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  slideTo("next");
                }}
                aria-label="Banner tiếp theo"
                className="absolute right-3 top-[140px] z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg border border-white/30 bg-white/16 text-white backdrop-blur-md transition-[background-color,border-color,transform] duration-300 ease-[var(--ease-fdi)] hover:-translate-y-[calc(50%+2px)] hover:border-white/50 hover:bg-white/24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:top-[180px] lg:top-[215px] xl:top-[235px]"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}
        </div>

        {total > 1 ? (
          <div className="flex items-center justify-center gap-1.5 pt-2" role="tablist" aria-label="Chuyển banner">
            {employers.map((_, idx) => (
              <button
                key={idx}
                role="tab"
                aria-selected={idx === safeIndex}
                aria-label={`Banner ${idx + 1}`}
                onClick={() => goToIndex(idx)}
                className="flex h-7 w-9 cursor-pointer items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/35"
              >
                <span
                  className={`h-2 rounded-full transition-[background-color,width] duration-300 ${
                    idx === safeIndex ? "w-8 bg-[var(--color-fdi-primary)]" : "w-8 bg-[#C9D9DE] hover:bg-[#9FB9C2]"
                  }`}
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
