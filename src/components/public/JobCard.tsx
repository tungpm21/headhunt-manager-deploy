import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import type { HomepageJob } from "@/lib/public-actions";
import { LogoImage } from "@/components/public/LogoImage";

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
      <article
        className={`relative bg-white rounded-xl border p-4 transition-all duration-300 ease-out hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 hover:border-[var(--color-fdi-accent-orange)]/30 ${job.isFeatured
          ? "border-amber-200 border-l-[3px] border-l-amber-400"
          : "border-gray-100"
          }`}
      >
        {/* Hot badge */}
        {job.isFeatured && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-bold shadow-sm">
            Hot
          </div>
        )}

        {/* Employer info */}
        <div className="flex items-start gap-3 mb-3">
          <div className="h-14 w-14 rounded-xl bg-[var(--color-fdi-surface)] flex items-center justify-center shrink-0 overflow-hidden border border-gray-50">
            <LogoImage src={job.employer.logo} alt={job.employer.companyName} className="max-h-full max-w-full object-contain p-1.5" iconSize="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <h3
              className="text-base font-bold text-[var(--color-fdi-text)] line-clamp-1 group-hover:text-[var(--color-fdi-accent-orange)] transition-colors"
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
