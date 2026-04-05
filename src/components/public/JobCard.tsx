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
        className={`relative bg-white rounded-xl border p-5 sm:p-6 transition-all duration-300 ease-out hover:shadow-lg hover:border-[var(--color-fdi-accent-orange)]/40 ${job.isFeatured ? "border-orange-200" : "border-gray-200"
          }`}
      >
        {/* Hot badge */}
        {job.isFeatured && (
          <div className="absolute -top-2.5 -right-2.5 flex items-center gap-1 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold shadow-md z-10">
            Hot
          </div>
        )}

        {/* Main content: Logo + Info */}
        <div className="flex items-start gap-4">
          {/* Logo with clear frame — BIGGER */}
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-white flex items-center justify-center shrink-0 overflow-hidden border-2 border-gray-200 shadow-sm">
            <LogoImage
              src={job.employer.logo}
              alt={job.employer.companyName}
              className="max-h-full max-w-full object-contain p-1.5"
              iconSize="h-8 w-8"
            />
          </div>

          {/* Text content — BIGGER */}
          <div className="min-w-0 flex-1">
            <h3
              className="text-base sm:text-lg font-bold text-[var(--color-fdi-text)] line-clamp-1 group-hover:text-[var(--color-fdi-accent-orange)] transition-colors leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {job.title}
            </h3>
            <p className="text-sm text-[var(--color-fdi-text-secondary)] line-clamp-1 mt-1">
              {job.employer.companyName}
            </p>

            {/* Meta row: salary + location + workType inline */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-xs sm:text-sm">
              {job.salaryDisplay && (
                <span className="font-bold text-[var(--color-fdi-accent-orange)]">
                  {job.salaryDisplay}
                </span>
              )}
              {job.location && (
                <span className="inline-flex items-center gap-1 text-gray-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.location}
                </span>
              )}
              {job.workType && (
                <span className="text-blue-600 font-semibold">
                  {job.workType}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer — aligned with text content */}
        <div className="flex items-center text-xs text-gray-400 mt-3 pl-[72px] sm:pl-20">
          <Clock className="h-3 w-3 mr-1" />
          {timeAgo(job.publishedAt)}
        </div>
      </article>
    </Link>
  );
}
