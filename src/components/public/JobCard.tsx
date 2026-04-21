import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import type { HomepageJob } from "@/lib/public-actions";
import { LogoImage } from "@/components/public/LogoImage";

const LANGUAGE_LABELS: Record<string, string> = {
  Japanese: "Tiếng Nhật",
  Korean: "Tiếng Hàn",
  English: "Tiếng Anh",
  Chinese: "Tiếng Trung",
  German: "Tiếng Đức",
  French: "Tiếng Pháp",
};

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
      <article className="relative p-6 sm:p-7 h-full min-h-[170px] hover:bg-blue-50/30 transition-colors">
        {/* Hot badge */}
        {job.isFeatured && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-red-500 text-white text-[10px] font-bold shadow-sm z-10">
            Hot
          </div>
        )}

        {/* Main content: Logo + Info */}
        <div className="flex items-start gap-4">
          {/* Logo — VietnamWorks size */}
          <div className="h-16 w-16 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
            <LogoImage
              src={job.employer.logo}
              alt={job.employer.companyName}
              className="max-h-[52px] max-w-[52px] object-contain"
              iconSize="h-9 w-9"
            />
          </div>

          {/* Text content */}
          <div className="min-w-0 flex-1">
            <h3
              className="text-base font-bold text-[var(--color-fdi-text)] line-clamp-1 group-hover:text-[var(--color-fdi-accent-orange)] transition-colors leading-snug"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {job.title}
            </h3>
            <p className="text-sm text-[var(--color-fdi-text-secondary)] line-clamp-1 mt-1">
              {job.employer.companyName}
            </p>

            {/* Meta row: salary + location + workType */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-sm">
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
                <span className="text-blue-600 font-semibold">
                  {job.workType}
                </span>
              )}
            </div>
          </div>
        </div>

        {job.requiredLanguages.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5 pl-20">
            {job.requiredLanguages.map((lang) => (
              <span
                key={lang}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#0077B6]/10 text-[#0077B6]"
              >
                🌐 {LANGUAGE_LABELS[lang] ?? lang}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center text-xs text-gray-400 mt-3 pl-20">
          <Clock className="h-3 w-3 mr-1" />
          {timeAgo(job.publishedAt)}
        </div>
      </article>
    </Link>
  );
}
