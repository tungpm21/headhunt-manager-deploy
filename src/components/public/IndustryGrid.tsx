"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
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

const INDUSTRIES_PER_PAGE = 5;

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
  const [page, setPage] = useState(0);
  const [transition, setTransition] = useState<"idle" | "previous" | "next">("idle");
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageCount = Math.max(1, Math.ceil(industries.length / INDUSTRIES_PER_PAGE));

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  if (industries.length === 0) return null;

  const activePage = Math.min(page, pageCount - 1);
  const visibleCount = Math.min(INDUSTRIES_PER_PAGE, industries.length);
  const startIndex = activePage * INDUSTRIES_PER_PAGE;
  const visibleIndustries = Array.from({ length: visibleCount }, (_, index) => {
    return industries[(startIndex + index) % industries.length];
  });

  const goToPage = (direction: "previous" | "next") => {
    if (pageCount <= 1 || transition !== "idle") return;

    setTransition(direction);

    transitionTimeoutRef.current = setTimeout(() => {
      setPage((current) => {
      if (direction === "previous") {
        return current === 0 ? pageCount - 1 : current - 1;
      }

      return current === pageCount - 1 ? 0 : current + 1;
      });

      window.requestAnimationFrame(() => setTransition("idle"));
    }, 150);
  };

  return (
    <section className="bg-[#F7FAFB] py-10 lg:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-9 grid gap-4 border-y border-[#D8E7EA] bg-white/62 py-5 sm:py-6 lg:grid-cols-[1.15fr_0.85fr_0.85fr_0.85fr]">
          <div className="lg:pr-6">
            <p className="inline-flex rounded-md border border-[#CFE0EA] bg-white px-3 py-1 text-xs font-semibold text-[var(--color-fdi-primary)]">
              Tín hiệu thị trường
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
          <div className="rounded-xl border border-[#DDE8EA] bg-white p-5 shadow-[0_12px_30px_-28px_rgba(7,26,47,0.34)]">
            <p className="text-4xl font-black tabular-nums text-[var(--color-fdi-ink)]">{stats.totalJobs.toLocaleString("vi-VN")}+</p>
            <p className="mt-2 text-sm font-bold text-[var(--color-fdi-primary)]">Việc đang mở</p>
            <p className="mt-1 text-xs font-medium text-[var(--color-fdi-text-secondary)]">Cập nhật từ các tin FDI đang active</p>
          </div>
          <div className="rounded-xl border border-[#DDE8EA] bg-white p-5 shadow-[0_12px_30px_-28px_rgba(7,26,47,0.34)]">
            <p className="text-4xl font-black tabular-nums text-[var(--color-fdi-ink)]">{stats.totalEmployers.toLocaleString("vi-VN")}+</p>
            <p className="mt-2 text-sm font-bold text-[var(--color-fdi-primary)]">Doanh nghiệp FDI</p>
            <p className="mt-1 text-xs font-medium text-[var(--color-fdi-text-secondary)]">Có hồ sơ công ty và vai trò tuyển dụng</p>
          </div>
          <div className="rounded-xl border border-[#DDE8EA] bg-white p-5 shadow-[0_12px_30px_-28px_rgba(7,26,47,0.34)]">
            <p className="text-4xl font-black tabular-nums text-[var(--color-fdi-ink)]">1</p>
            <p className="mt-2 text-sm font-bold text-[var(--color-fdi-primary)]">Bước ứng tuyển</p>
            <p className="mt-1 text-xs font-medium text-[var(--color-fdi-text-secondary)]">Luồng tìm kiếm đến chi tiết việc làm gọn hơn</p>
          </div>
        </div>

        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="mb-2 inline-flex rounded-md border border-[#CFE0EA] bg-white px-3 py-1 text-[11px] font-semibold text-[var(--color-fdi-primary)]">
              Nhóm ngành
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

          {pageCount > 1 ? (
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => goToPage("previous")}
                aria-label="Xem nhóm ngành nghề trước"
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#BFDCE4] bg-[#EAF7FA] text-[var(--color-fdi-primary)] shadow-[0_12px_24px_-20px_rgba(7,26,47,0.5)] transition-[background-color,border-color,transform] duration-300 ease-[var(--ease-fdi)] hover:-translate-y-0.5 hover:border-[#91BFCD] hover:bg-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => goToPage("next")}
                aria-label="Xem nhóm ngành nghề tiếp theo"
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#BFDCE4] bg-[#EAF7FA] text-[var(--color-fdi-primary)] shadow-[0_12px_24px_-20px_rgba(7,26,47,0.5)] transition-[background-color,border-color,transform] duration-300 ease-[var(--ease-fdi)] hover:-translate-y-0.5 hover:border-[#91BFCD] hover:bg-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>

        <div
          className={`grid grid-cols-1 gap-4 transition-[opacity,transform] duration-300 ease-[var(--ease-fdi)] motion-reduce:transition-none sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-5 ${
            transition === "next"
              ? "-translate-x-4 opacity-0"
              : transition === "previous"
                ? "translate-x-4 opacity-0"
                : "translate-x-0 opacity-100"
          }`}
        >
          {visibleIndustries.map((item, index) => {
            const Icon = industryIcons[item.industry] || BriefcaseBusiness;

            return (
              <Link
                key={`${activePage}-${item.industry}-${index}`}
                href={`/viec-lam?industry=${encodeURIComponent(item.industry)}`}
                className="group block cursor-pointer"
              >
                <div className="relative flex min-h-[232px] w-full flex-col justify-between overflow-hidden rounded-xl border border-[#D6E2E7] bg-white p-5 shadow-[0_16px_38px_-34px_rgba(7,26,47,0.34)] transition-[background-color,border-color,box-shadow,transform] duration-500 ease-[var(--ease-fdi)] hover:-translate-y-1 hover:border-[#A9C4CE] hover:shadow-[0_24px_52px_-40px_rgba(7,26,47,0.48)]">
                  <div className="absolute inset-x-0 top-0 h-1 bg-[var(--color-fdi-primary)]" />
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-[#DCE8EC] bg-[#F7FCFD] transition-[background-color,transform] duration-500 ease-[var(--ease-fdi)] group-hover:scale-105 group-hover:bg-[#EAF7FA]">
                    <Icon className="h-8 w-8 text-[var(--color-fdi-primary)]" />
                  </div>
                  <div className="mt-6 text-left">
                    <p className="flex min-h-[2.5rem] items-center text-base font-black leading-snug text-[var(--color-fdi-ink)] transition-colors group-hover:text-[var(--color-fdi-primary)]">
                      {item.industry}
                    </p>
                    <p className="mt-2 inline-flex rounded-md bg-[#EAF7FA] px-3 py-1.5 text-sm font-bold text-[var(--color-fdi-primary)]">
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
            className="inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-lg border border-[var(--color-fdi-primary)] bg-[var(--color-fdi-primary)] px-5 text-sm font-bold text-white shadow-[0_18px_34px_-26px_rgba(10,111,157,0.72)] transition-[background-color,border-color,transform] duration-300 ease-[var(--ease-fdi)] hover:-translate-y-0.5 hover:border-[var(--color-fdi-primary-hover)] hover:bg-[var(--color-fdi-primary-hover)]"
          >
            Khám phá thêm
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
