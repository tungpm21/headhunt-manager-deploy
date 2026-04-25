import Link from "next/link";
import { ArrowUpRight, Clock, Languages, MapPin } from "lucide-react";
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
  compact?: boolean;
};

export function JobCard({ job, compact = false }: JobCardProps) {
  return (
    <Link
      href={`/viec-lam/${job.slug}`}
      className="group block h-full cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-accent-orange)]/60"
      style={{ touchAction: "manipulation" }}
    >
      <article
        className={`relative flex h-full flex-col rounded-xl border border-[#DCE4EA] bg-[#FFFFFB] shadow-[0_14px_34px_-30px_rgba(17,24,39,0.48)] transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:border-[#BFD6DF] group-hover:bg-white group-hover:shadow-[0_22px_46px_-32px_rgba(17,24,39,0.58)] ${compact ? "min-h-[128px] p-3" : "min-h-[164px] p-4"}`}
      >
        {job.isFeatured && (
          <div
            className="absolute right-4 top-4 z-10 rounded-full bg-[var(--color-fdi-accent-orange)] px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow-[0_10px_22px_-16px_rgba(242,92,36,0.9)]"
            aria-label="Việc làm nổi bật"
          >
            Hot
          </div>
        )}

        <div className={`flex items-start pr-11 ${compact ? "gap-2.5" : "gap-3"}`}>
          <div
            className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#DEE7EC] bg-white ${compact ? "h-10 w-10" : "h-12 w-12"}`}
            aria-hidden="true"
          >
            <LogoImage
              src={job.employer.logo}
              alt=""
              className={compact ? "max-h-8 max-w-8 object-contain" : "max-h-10 max-w-10 object-contain"}
              iconSize={compact ? "h-6 w-6" : "h-7 w-7"}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3
              className={`line-clamp-2 font-bold leading-snug text-[var(--color-fdi-text)] transition-colors group-hover:text-[var(--color-fdi-primary)] ${compact ? "text-sm" : "text-[15px]"}`}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {job.title}
            </h3>
            <p className={`mt-0.5 line-clamp-1 text-[var(--color-fdi-text-secondary)] ${compact ? "text-[13px]" : "text-sm"}`}>
              {job.employer.companyName}
            </p>
          </div>
        </div>

        {job.salaryDisplay && (
          <div className={`font-bold tabular-nums text-[var(--color-fdi-accent-orange)] ${compact ? "mt-2 text-sm" : "mt-3 text-[15px]"}`}>
            {job.salaryDisplay}
          </div>
        )}

        <div className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[#687789] ${compact ? "mt-1.5 text-xs" : "mt-2.5 text-sm"}`}>
          {job.location && (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{job.location}</span>
            </span>
          )}
          {job.workType && (
            <span className="rounded-full bg-[#E9F5F7] px-2 py-1 text-xs font-semibold text-[#0A6F9D]">
              {job.workType}
            </span>
          )}
        </div>

        {job.requiredLanguages.length > 0 && (
          <div className={`flex flex-wrap gap-1.5 ${compact ? "mt-2" : "mt-3"}`}>
            {job.requiredLanguages.map((lang) => (
              <span
                key={lang}
                className="inline-flex items-center gap-1 rounded-full bg-[#E8F5F7] px-2 py-1 text-[10px] font-semibold text-[#0A6F9D]"
              >
                <Languages className="h-3 w-3" aria-hidden="true" />
                {LANGUAGE_LABELS[lang] ?? lang}
              </span>
            ))}
          </div>
        )}

        <div className={`mt-auto flex items-center justify-between text-xs text-[#8A98A8] ${compact ? "pt-2" : "pt-3"}`}>
          <span className="inline-flex items-center">
            <Clock className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            <time dateTime={job.publishedAt ? new Date(job.publishedAt).toISOString() : undefined}>
              {timeAgo(job.publishedAt)}
            </time>
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-[var(--color-fdi-primary)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Xem chi tiết
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>
      </article>
    </Link>
  );
}
