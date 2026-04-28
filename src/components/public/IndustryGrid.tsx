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
import type { HomepageData, IndustryCount } from "@/lib/public-actions";

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
  stats: HomepageData["stats"];
};

export function IndustryGrid({ industries, stats }: IndustryGridProps) {
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
    <section className="bg-[linear-gradient(180deg,#F5F8FA_0%,#FFFFFB_100%)] py-10 lg:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-7 grid gap-4 rounded-[2rem] border border-[#D8E7EA] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FCFC_100%)] p-5 shadow-[0_28px_72px_-56px_rgba(7,26,47,0.42)] sm:p-6 lg:grid-cols-[1.15fr_0.85fr_0.85fr_0.85fr] lg:p-7">
          <div className="lg:pr-6">
            <p className="inline-flex rounded-full border border-[#BFDCE4] bg-[#EAF7FA] px-3 py-1 text-xs font-bold uppercase text-[var(--color-fdi-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              Market signal
            </p>
            <h2
              className="mt-3 text-2xl font-black text-[var(--color-fdi-ink)] sm:text-3xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              FDI hiring momentum
            </h2>
            <p className="mt-2 max-w-md text-sm font-medium leading-6 text-[var(--color-fdi-text-secondary)]">
              Tổng hợp nhanh quy mô cơ hội và số doanh nghiệp FDI đang tuyển dụng trên FDIWork.
            </p>
          </div>
          <div className="rounded-2xl border border-[#DDE8EA] bg-white p-5 shadow-[0_18px_42px_-38px_rgba(7,26,47,0.42)]">
            <p className="text-4xl font-black tabular-nums text-[var(--color-fdi-ink)]">{stats.totalJobs.toLocaleString("vi-VN")}+</p>
            <p className="mt-2 text-sm font-bold text-[var(--color-fdi-primary)]">Việc đang mở</p>
            <p className="mt-1 text-xs font-medium text-[var(--color-fdi-text-secondary)]">Cập nhật từ các tin FDI đang active</p>
          </div>
          <div className="rounded-2xl border border-[#DDE8EA] bg-white p-5 shadow-[0_18px_42px_-38px_rgba(7,26,47,0.42)]">
            <p className="text-4xl font-black tabular-nums text-[var(--color-fdi-ink)]">{stats.totalEmployers.toLocaleString("vi-VN")}+</p>
            <p className="mt-2 text-sm font-bold text-[var(--color-fdi-primary)]">Doanh nghiệp FDI</p>
            <p className="mt-1 text-xs font-medium text-[var(--color-fdi-text-secondary)]">Có hồ sơ công ty và vai trò tuyển dụng</p>
          </div>
          <div className="rounded-2xl border border-[#DDE8EA] bg-white p-5 shadow-[0_18px_42px_-38px_rgba(7,26,47,0.42)]">
            <p className="text-4xl font-black tabular-nums text-[var(--color-fdi-ink)]">1</p>
            <p className="mt-2 text-sm font-bold text-[var(--color-fdi-primary)]">Bước ứng tuyển</p>
            <p className="mt-1 text-xs font-medium text-[var(--color-fdi-text-secondary)]">Luồng tìm kiếm đến chi tiết việc làm gọn hơn</p>
          </div>
        </div>

        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="mb-2 inline-flex rounded-full border border-[#BFDCE4] bg-[#EAF7FA] px-3 py-1 text-[10px] font-bold uppercase text-[var(--color-fdi-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              Career fields
            </p>
            <h2
              className="text-2xl font-black tracking-normal text-[var(--color-fdi-ink)] sm:text-3xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Ngành nghề nổi bật
            </h2>
            <p
              className="mt-1.5 text-sm font-medium text-[var(--color-fdi-text-secondary)]"
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
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#BFDCE4] bg-[#EAF7FA] text-[var(--color-fdi-primary)] shadow-[0_12px_24px_-20px_rgba(7,26,47,0.5)] transition-[background-color,border-color,transform] duration-500 ease-[var(--ease-fdi)] hover:-translate-y-0.5 hover:border-[#91BFCD] hover:bg-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Cuộn ngành nghề sang phải"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#BFDCE4] bg-[#EAF7FA] text-[var(--color-fdi-primary)] shadow-[0_12px_24px_-20px_rgba(7,26,47,0.5)] transition-[background-color,border-color,transform] duration-500 ease-[var(--ease-fdi)] hover:-translate-y-0.5 hover:border-[#91BFCD] hover:bg-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto rounded-[24px] border border-[#D8E7EA] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FCFC_100%)] px-4 py-6 shadow-[0_28px_70px_-52px_rgba(7,26,47,0.46)] scrollbar-hide sm:gap-5 sm:px-5 sm:py-7"
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
                <div className="relative flex min-h-[232px] w-[220px] flex-col justify-between overflow-hidden rounded-2xl border border-[#D6E5E9] bg-white p-5 transition-[background-color,border-color,box-shadow,transform] duration-500 ease-[var(--ease-fdi)] hover:-translate-y-1.5 hover:border-[#A9CED8] hover:shadow-[0_32px_64px_-38px_rgba(7,26,47,0.58)] sm:w-[220px] lg:w-[216px] xl:w-[224px]">
                  <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#0A6F9D_0%,#5CC3D9_100%)]" />
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#DCE8EC] bg-[#F7FCFD] transition-[background-color,transform] duration-500 ease-[var(--ease-fdi)] group-hover:scale-105 group-hover:bg-[#EAF7FA]">
                    <Icon className="h-8 w-8 text-[var(--color-fdi-primary)]" />
                  </div>
                  <div className="mt-6 text-left">
                    <p className="flex min-h-[2.5rem] items-center text-base font-black uppercase leading-snug text-[var(--color-fdi-ink)] transition-colors group-hover:text-[var(--color-fdi-primary)]">
                      {item.industry}
                    </p>
                    <p className="mt-2 inline-flex rounded-full bg-[#EAF7FA] px-3 py-1.5 text-sm font-bold text-[var(--color-fdi-primary)]">
                      {item.count} việc làm
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-5 text-center">
          <Link
            href="/viec-lam"
            className="inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-full border border-[var(--color-fdi-primary)] bg-[var(--color-fdi-primary)] px-5 text-sm font-bold text-white shadow-[0_18px_34px_-26px_rgba(10,111,157,0.72)] transition-[background-color,border-color,transform] duration-500 ease-[var(--ease-fdi)] hover:-translate-y-0.5 hover:border-[var(--color-fdi-primary-hover)] hover:bg-[var(--color-fdi-primary-hover)]"
          >
            Khám phá thêm
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
