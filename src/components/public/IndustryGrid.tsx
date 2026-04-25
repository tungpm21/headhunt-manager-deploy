"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ElementType,
} from "react";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  CircuitBoard,
  Cpu,
  Factory,
  FlaskConical,
  HardHat,
  Truck,
  Wrench,
} from "lucide-react";
import type { IndustryCount } from "@/lib/public-actions";

const industryIcons: Record<string, ElementType> = {
  "IT / Phần mềm": Cpu,
  "Sản xuất": Factory,
  "Điện tử": CircuitBoard,
  "Cơ khí": Wrench,
  "Hóa chất": FlaskConical,
  Logistics: Truck,
  "Quản lý": BriefcaseBusiness,
  "Xây dựng": HardHat,
};

type IndustryGridProps = {
  industries: IndustryCount[];
};

export function IndustryGrid({ industries }: IndustryGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 4);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 4
    );
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    updateScrollState();
    container.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      container.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;

    container.scrollBy({
      left: direction === "left" ? -560 : 560,
      behavior: "smooth",
    });
  };

  if (industries.length === 0) return null;

  return (
    <section className="bg-[linear-gradient(180deg,#F6F8FA_0%,#FFFFFF_100%)] py-8 lg:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div className="text-center sm:text-left">
            <h2
              className="text-2xl font-bold text-[var(--color-fdi-text)] sm:text-3xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Ngành nghề nổi bật
            </h2>
            <p
              className="mt-2 text-sm text-[var(--color-fdi-text-secondary)]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Khám phá cơ hội theo các nhóm ngành đang tuyển mạnh
            </p>
          </div>

          {industries.length > 1 ? (
            <div className="hidden items-center gap-2 sm:flex">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Cuộn ngành nghề sang trái"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D9E4EA] bg-[#FFFFFB] text-[var(--color-fdi-text)] shadow-sm transition-colors hover:border-[var(--color-fdi-accent-orange)] hover:text-[var(--color-fdi-accent-orange)] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Cuộn ngành nghề sang phải"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D9E4EA] bg-[#FFFFFB] text-[var(--color-fdi-text)] shadow-sm transition-colors hover:border-[var(--color-fdi-accent-orange)] hover:text-[var(--color-fdi-accent-orange)] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto rounded-[20px] border border-[#D9E4EA] bg-[#FDFBF5] p-4 shadow-[0_22px_56px_-48px_rgba(17,24,39,0.58)] scrollbar-hide sm:gap-5 sm:p-5"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {industries.map((item) => {
            const Icon = industryIcons[item.industry] || BriefcaseBusiness;

            return (
              <Link
                key={item.industry}
                href={`/viec-lam?industry=${encodeURIComponent(item.industry)}`}
                className="group block shrink-0 cursor-pointer"
              >
                <div className="flex h-full w-[220px] flex-col items-center justify-center gap-3 rounded-xl border border-[#DCE8EC] bg-[#F5FAFB] p-5 transition-[background-color,border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-[#BFD6DF] hover:bg-white hover:shadow-[0_18px_40px_-32px_rgba(17,24,39,0.55)] sm:w-[220px] lg:w-[216px] xl:w-[224px]">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-[#DCE8EC] bg-white transition-[background-color,transform] duration-300 group-hover:scale-105 group-hover:bg-[#EFF9FA]">
                    <Icon className="h-10 w-10 text-[var(--color-fdi-primary)]" />
                  </div>
                  <div className="text-center">
                    <p className="flex min-h-[2.5rem] items-center justify-center text-base font-bold uppercase leading-snug text-[var(--color-fdi-text)] transition-colors group-hover:text-[var(--color-fdi-primary)]">
                      {item.industry}
                    </p>
                    <p className="mt-2 whitespace-nowrap text-sm font-medium text-[var(--color-fdi-text-secondary)]">
                      {item.count} việc làm
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-7 text-center">
          <Link
            href="/viec-lam"
            className="inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-[var(--color-fdi-primary)] transition-colors hover:text-[var(--color-fdi-primary-hover)]"
          >
            Khám phá thêm
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
