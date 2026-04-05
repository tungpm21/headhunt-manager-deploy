"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { JobCard } from "./JobCard";
import type { HomepageJob } from "@/lib/public-actions";

const JOBS_PER_PAGE = 9;

type FeaturedJobsProps = {
  jobs: HomepageJob[];
};

export function FeaturedJobs({ jobs }: FeaturedJobsProps) {
  const [page, setPage] = useState(0);

  if (jobs.length === 0) return null;

  const totalPages = Math.ceil(jobs.length / JOBS_PER_PAGE);
  const currentJobs = jobs.slice(
    page * JOBS_PER_PAGE,
    (page + 1) * JOBS_PER_PAGE
  );

  return (
    <section className="py-16 lg:py-20 bg-gray-50 border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="flex items-end justify-between mb-8">
          <div className="flex items-center gap-3">
            {/* VietnamWorks-style decorative icon */}
            <div className="hidden sm:block">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M4 28L16 4L28 28H4Z" fill="#FF6600" opacity="0.2" />
                <path d="M8 28L16 12L24 28H8Z" fill="#FF6600" opacity="0.4" />
                <path d="M12 28L16 20L20 28H12Z" fill="#FF6600" />
              </svg>
            </div>
            <div>
              <h2
                className="text-2xl sm:text-3xl font-extrabold text-[var(--color-fdi-text)] italic"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Việc Làm Tốt Nhất
              </h2>
              <p
                className="mt-1 text-sm text-[var(--color-fdi-text-secondary)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Các cơ hội việc làm hấp dẫn từ doanh nghiệp FDI
              </p>
            </div>
          </div>
          <Link
            href="/viec-lam"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-[var(--color-fdi-accent-orange)] hover:text-[#E65C00] transition-colors cursor-pointer uppercase"
          >
            XEM TẤT CẢ
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Card grid — uniform 3x3, bordered container like VietnamWorks */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-x divide-gray-100">
            {currentJobs.map((job, i) => (
              <div
                key={job.id}
                className={`${i >= 3 ? "border-t border-gray-100" : ""}`}
              >
                <JobCard job={job} />
              </div>
            ))}
          </div>
        </div>

        {/* Pagination dots + arrows */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="h-8 w-8 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-[var(--color-fdi-accent-orange)] hover:text-[var(--color-fdi-accent-orange)] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Trang trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${i === page
                      ? "w-6 bg-[var(--color-fdi-primary)]"
                      : "w-2.5 bg-gray-300 hover:bg-gray-400"
                    }`}
                  aria-label={`Trang ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="h-8 w-8 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-[var(--color-fdi-accent-orange)] hover:text-[var(--color-fdi-accent-orange)] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Trang sau"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Mobile CTA */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/viec-lam"
            className="inline-flex items-center gap-1 px-5 py-2.5 rounded-full bg-[var(--color-fdi-accent-orange)] text-white text-sm font-semibold hover:bg-[#E65C00] transition-colors cursor-pointer"
          >
            Xem tất cả việc làm
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
