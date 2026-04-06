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
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
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
              Khám phá cơ hội việc làm theo lĩnh vực
            </p>
          </div>

          {industries.length > 1 ? (
            <div className="hidden items-center gap-2 sm:flex">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Cuộn ngành nghề sang trái"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-[var(--color-fdi-text)] shadow-sm transition-colors hover:border-[var(--color-fdi-accent-orange)] hover:text-[var(--color-fdi-accent-orange)] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Cuộn ngành nghề sang phải"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-[var(--color-fdi-text)] shadow-sm transition-colors hover:border-[var(--color-fdi-accent-orange)] hover:text-[var(--color-fdi-accent-orange)] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto rounded-2xl border border-gray-100 bg-white p-4 shadow-lg scrollbar-hide sm:p-6"
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
                <div className="flex h-full w-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 transition-all duration-300 hover:border-[var(--color-fdi-primary)]/30 hover:shadow-lg sm:w-[240px] lg:w-[248px]">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#F2F8FF] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#E8F3FF]">
                    <Icon className="h-10 w-10 text-[#005A9E]" />
                  </div>
                  <div className="text-center">
                    <p className="flex min-h-[2.5rem] items-center justify-center text-base font-bold uppercase leading-snug text-[var(--color-fdi-text)] transition-colors group-hover:text-[var(--color-fdi-accent-orange)]">
                      {item.industry}
                    </p>
                    <p className="mt-2 whitespace-nowrap text-sm font-medium text-gray-500">
                      {item.count} việc làm
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/viec-lam"
            className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-[var(--color-fdi-primary)] hover:underline"
          >
            Khám phá thêm
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
