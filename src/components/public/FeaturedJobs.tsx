import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JobCard } from "./JobCard";
import type { HomepageJob } from "@/lib/public-actions";

type FeaturedJobsProps = {
  jobs: HomepageJob[];
};

export function FeaturedJobs({ jobs }: FeaturedJobsProps) {
  if (jobs.length === 0) return null;

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2
              className="text-2xl sm:text-3xl font-bold text-[var(--color-fdi-text)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Việc làm mới nhất
            </h2>
            <p
              className="mt-2 text-sm text-[var(--color-fdi-text-secondary)]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Các cơ hội việc làm hấp dẫn từ doanh nghiệp FDI
            </p>
          </div>
          <Link
            href="/viec-lam"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[var(--color-fdi-primary)] hover:text-[var(--color-fdi-primary-hover)] transition-colors cursor-pointer"
          >
            Xem tất cả
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/viec-lam"
            className="inline-flex items-center gap-1 px-5 py-2.5 rounded-full bg-[var(--color-fdi-primary)] text-white text-sm font-semibold hover:bg-[var(--color-fdi-primary-hover)] transition-colors cursor-pointer"
          >
            Xem tất cả việc làm
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
