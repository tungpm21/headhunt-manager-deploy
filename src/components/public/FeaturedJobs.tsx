"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { JobCard } from "./JobCard";
import type { HomepageJob } from "@/lib/public-actions";

const JOBS_PER_PAGE = 6;

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
    <section className="relative bg-[linear-gradient(180deg,#FFFFFB_0%,#F5F8FA_100%)] py-10 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-0 flex items-end justify-between rounded-t-[24px] border border-b-0 border-[#D9E4EA] bg-white px-5 py-4 shadow-[0_16px_40px_-38px_rgba(17,24,39,0.46)] sm:px-6">
          <div className="flex items-center gap-3">
            <div className="hidden h-10 w-10 items-center justify-center rounded-xl border border-[#F4D9C9] bg-[#FFF1E8] sm:flex">
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path d="M5 27L16 5L27 27H5Z" fill="#F25C24" opacity="0.18" />
                <path d="M10 27L16 14L22 27H10Z" fill="#F25C24" opacity="0.72" />
                <path d="M16 14L22 27H16V14Z" fill="#0A6F9D" opacity="0.78" />
              </svg>
            </div>
            <div>
              <h2
                className="text-xl font-extrabold italic text-[var(--color-fdi-text)] sm:text-2xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Việc làm tốt nhất
              </h2>
              <p
                className="mt-0.5 text-sm text-[var(--color-fdi-text-secondary)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Cơ hội nổi bật từ các doanh nghiệp FDI uy tín
              </p>
            </div>
          </div>
          <Link
            href="/viec-lam"
            className="hidden min-h-11 items-center gap-1 rounded-full px-2 text-sm font-bold uppercase text-[var(--color-fdi-primary)] transition-colors hover:text-[var(--color-fdi-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25 sm:inline-flex cursor-pointer"
          >
            Xem tất cả
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-b-[24px] border border-[#D9E4EA] bg-white p-4 shadow-[0_24px_60px_-48px_rgba(17,24,39,0.56)] sm:p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {currentJobs.map((job) => (
              <div key={job.id} className="min-w-0">
                <JobCard job={job} />
              </div>
            ))}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D9E4EA] bg-[#FFFFFB] text-[var(--color-fdi-text)] transition-colors hover:border-[var(--color-fdi-primary)] hover:text-[var(--color-fdi-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Trang trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className="flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25 cursor-pointer"
                  aria-label={`Trang ${i + 1}`}
                >
                  <span
                    className={`h-2.5 rounded-full transition-[background-color,width] ${i === page
                      ? "w-6 bg-[var(--color-fdi-primary)]"
                      : "w-2.5 bg-[#CBD5DC] hover:bg-[#AEBAC4]"
                    }`}
                  />
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D9E4EA] bg-[#FFFFFB] text-[var(--color-fdi-text)] transition-colors hover:border-[var(--color-fdi-primary)] hover:text-[var(--color-fdi-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Trang sau"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/viec-lam"
            className="inline-flex min-h-11 items-center gap-1 rounded-full bg-[var(--color-fdi-primary)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-fdi-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/25 cursor-pointer"
          >
            Xem tất cả việc làm
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
