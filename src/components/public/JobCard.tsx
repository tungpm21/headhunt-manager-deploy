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
        className={`relative bg-white rounded-xl border p-5 transition-all duration-300 ease-out hover:shadow-lg hover:border-[var(--color-fdi-accent-orange)]/40 ${job.isFeatured
            ? "border-orange-200"
            : "border-gray-200"
          }`}
      >
        {/* Hot badge */}
        {job.isFeatured && (
          <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500 text-white text-[10px] font-bold shadow-md z-10">
            Hot
          </div>
        )}

        {/* Main content: Logo + Info */}
        <div className="flex items-start gap-4">
          {/* Logo with clear frame */}
          <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shrink-0 overflow-hidden border-2 border-gray-200 shadow-sm">
            <LogoImage
              src={job.employer.logo}
              alt={job.employer.companyName}
              className="max-h-full max-w-full object-contain p-1"
              iconSize="h-6 w-6"
            />
          </div>

          {/* Text content */}
          <div className="min-w-0 flex-1">
            <h3
              className="text-sm font-bold text-[var(--color-fdi-text)] line-clamp-1 group-hover:text-[var(--color-fdi-accent-orange)] transition-colors leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {job.title}
            </h3>
            <p className="text-xs text-[var(--color-fdi-text-secondary)] line-clamp-1 mt-1">
              {job.employer.companyName}
            </p>

            {/* Meta row: salary + location inline */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs">
              {job.salaryDisplay && (
                <span className="font-bold text-[var(--color-fdi-accent-orange)]">
                  {job.salaryDisplay}
                </span>
              )}
              {job.location && (
                <span className="inline-flex items-center gap-1 text-gray-500">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                </span>
              )}
              {job.workType && (
                <span className="text-blue-600 font-medium">
                  {job.workType}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center text-[11px] text-gray-400 mt-3 pl-16">
          <Clock className="h-3 w-3 mr-1" />
          {timeAgo(job.publishedAt)}
        </div>
      </article>
    </Link>
  );
}
