import Link from "next/link";
import { MapPin, Clock, Building2, Sparkles } from "lucide-react";
import type { HomepageJob } from "@/lib/public-actions";

function timeAgo(date: Date | null): string {
  if (!date) return "";
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  return `${Math.floor(diffDays / 30)} tháng trước`;
}

type JobCardProps = {
  job: HomepageJob;
};

export function JobCard({ job }: JobCardProps) {
  return (
    <Link href={`/viec-lam/${job.slug}`} className="group block cursor-pointer">
      <article className="relative bg-white rounded-xl border border-gray-100 p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-[var(--color-fdi-primary)]/20">
        {/* Featured badge */}
        {job.isFeatured && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-xs font-medium">
            <Sparkles className="h-3 w-3" />
            Nổi bật
          </div>
        )}

        {/* Employer info */}
        <div className="flex items-start gap-3 mb-3">
          <div className="h-11 w-11 rounded-lg bg-[var(--color-fdi-surface)] flex items-center justify-center shrink-0 overflow-hidden">
            {job.employer.logo ? (
              <img
                src={job.employer.logo}
                alt={job.employer.companyName}
                className="h-full w-full object-cover"
              />
            ) : (
              <Building2 className="h-5 w-5 text-[var(--color-fdi-primary)]" />
            )}
          </div>
          <div className="min-w-0">
            <h3
              className="text-sm font-semibold text-[var(--color-fdi-text)] line-clamp-1 group-hover:text-[var(--color-fdi-primary)] transition-colors"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {job.title}
            </h3>
            <p className="text-sm font-medium text-[var(--color-fdi-text-secondary)] line-clamp-1 mt-0.5">
              {job.employer.companyName}
            </p>
          </div>
        </div>

        {/* Meta — Location first (FDI geography is primary filter), then Salary, WorkType */}
        <div className="flex flex-wrap gap-2 mb-3">
          {job.location && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-50 text-gray-600 text-xs">
              <MapPin className="h-3 w-3" />
              {job.location}
            </span>
          )}
          {job.salaryDisplay && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">
              {job.salaryDisplay}
            </span>
          )}
          {job.workType && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-xs">
              {job.workType}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center text-xs text-gray-400">
          <Clock className="h-3 w-3 mr-1" />
          {timeAgo(job.publishedAt)}
        </div>
      </article>
    </Link>
  );
}
