import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Briefcase, Building2, MapPin, Sparkles, UsersRound } from "lucide-react";
import type { PublicCompany } from "@/lib/public-actions";
import { LogoImage } from "@/components/public/LogoImage";

export type CompanyCardVariant = "featured" | "priority" | "standard";

type CompanyCardProps = {
  company: PublicCompany;
  imagePriority?: boolean;
  variant?: CompanyCardVariant;
};

const COMPANY_SIZE_LABELS: Record<string, string> = {
  SMALL: "1-50 nhân sự",
  MEDIUM: "51-200 nhân sự",
  LARGE: "201-1.000 nhân sự",
  ENTERPRISE: "1.000+ nhân sự",
};

function getCompanySizeLabel(size: string | null): string | null {
  if (!size) return null;
  return COMPANY_SIZE_LABELS[size] ?? size;
}

function getJobLabel(jobCount: number): string {
  return jobCount > 0 ? `${jobCount} vị trí đang tuyển` : "Theo dõi hồ sơ công ty";
}

function CoverImage({
  company,
  imagePriority,
  sizes,
  className,
}: {
  company: PublicCompany;
  imagePriority: boolean;
  sizes: string;
  className?: string;
}) {
  if (!company.coverImage) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[var(--color-fdi-dark)]">
        <Building2 className="h-10 w-10 text-white/65" aria-hidden="true" />
      </div>
    );
  }

  return (
    <Image
      src={company.coverImage}
      alt=""
      fill
      priority={imagePriority}
      loading={imagePriority ? "eager" : "lazy"}
      sizes={sizes}
      className={`object-cover transition-transform duration-300 group-hover:scale-[1.03] ${className ?? ""}`}
    />
  );
}

export function CompanyCard({ company, imagePriority = false, variant = "standard" }: CompanyCardProps) {
  const jobCount = company._count.jobPostings;
  const companySize = getCompanySizeLabel(company.companySize);
  const hasStructuredPlace = Boolean(company.industrialZone || company.location);
  const isFeatured = variant === "featured";
  const isPriority = variant === "priority";

  if (isFeatured) {
    return (
      <Link
        href={`/cong-ty/${company.slug}`}
        className="group block h-full cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/40"
        style={{ touchAction: "manipulation" }}
      >
        <article className="grid h-full overflow-hidden rounded-xl border border-[var(--color-fdi-primary)]/25 bg-white shadow-[0_26px_70px_-48px_rgba(7,26,47,0.75)] transition-[border-color,box-shadow,transform] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:border-[var(--color-fdi-primary)]/45 group-hover:shadow-[0_34px_86px_-52px_rgba(7,26,47,0.9)] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative min-h-[224px] overflow-hidden bg-[var(--color-fdi-dark)] sm:min-h-[280px] lg:min-h-full">
            <CoverImage
              company={company}
              imagePriority={imagePriority}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="opacity-95"
            />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--color-fdi-ink)]/70 to-transparent" aria-hidden="true" />
            <div className="absolute bottom-5 left-5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-white/70 bg-white shadow-[0_18px_36px_-24px_rgba(7,26,47,0.8)]">
              <LogoImage
                src={company.logo}
                alt={company.companyName}
                size={96}
                sizes="96px"
                className="h-full w-full object-contain p-2"
                iconSize="h-9 w-9"
              />
            </div>
          </div>

          <div className="flex min-h-[280px] flex-col p-5 sm:p-6 lg:p-7">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-fdi-surface)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--color-fdi-primary)]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Đối tác nổi bật
              </span>
              {jobCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-[var(--color-fdi-accent-orange)]">
                  <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                  {getJobLabel(jobCount)}
                </span>
              )}
            </div>

            <h3
              className="text-2xl font-bold leading-tight text-[var(--color-fdi-text)] transition-colors group-hover:text-[var(--color-fdi-primary)] sm:text-3xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {company.companyName}
            </h3>

            {company.description && (
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--color-fdi-text-secondary)] sm:text-[15px]">
                {company.description}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-[var(--color-fdi-text-secondary)]">
              {company.industry && (
                <span className="rounded-full border border-[var(--color-fdi-border)] bg-white px-3 py-1.5">
                  {company.industry}
                </span>
              )}
              {companySize && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-fdi-border)] bg-white px-3 py-1.5">
                  <UsersRound className="h-3.5 w-3.5" aria-hidden="true" />
                  {companySize}
                </span>
              )}
              {company.industrialZone && (
                <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[var(--color-fdi-border)] bg-white px-3 py-1.5">
                  <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">KCN: {company.industrialZone}</span>
                </span>
              )}
              {company.location && (
                <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[var(--color-fdi-border)] bg-white px-3 py-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{company.location}</span>
                </span>
              )}
              {company.address && !hasStructuredPlace && (
                <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[var(--color-fdi-border)] bg-white px-3 py-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{company.address}</span>
                </span>
              )}
            </div>

            <div className="mt-auto pt-6">
              <span className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--color-fdi-primary)] px-5 py-2.5 text-sm font-bold text-white transition-[background-color,transform] duration-200 group-hover:bg-[var(--color-fdi-primary-hover)]">
                Xem hồ sơ công ty
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link
      href={`/cong-ty/${company.slug}`}
      className="group block h-full cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/40"
      style={{ touchAction: "manipulation" }}
    >
      <article
        className={`relative flex h-full min-h-[306px] flex-col overflow-hidden rounded-xl bg-white transition-[border-color,box-shadow,transform] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:border-[var(--color-fdi-primary)]/30 ${
          isPriority
            ? "border border-[var(--color-fdi-primary)]/25 shadow-[0_22px_54px_-42px_rgba(7,26,47,0.75)]"
            : "border border-[var(--color-fdi-border)] shadow-[0_14px_36px_-32px_rgba(7,26,47,0.55)]"
        }`}
      >
        {isPriority && (
          <div className="absolute inset-y-0 left-0 z-10 w-1 bg-[var(--color-fdi-accent-orange)]" aria-hidden="true" />
        )}

        <div className="relative h-32 w-full overflow-hidden bg-[var(--color-fdi-dark)]">
          <CoverImage
            company={company}
            imagePriority={imagePriority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {isPriority && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-[var(--color-fdi-primary)] shadow-[0_10px_24px_-18px_rgba(7,26,47,0.6)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--color-fdi-accent-orange)]" aria-hidden="true" />
              Ưu tiên hiển thị
            </span>
          )}
        </div>

        <div className="relative flex flex-1 flex-col px-5 pb-5 pt-0">
          <div className="flex items-start gap-3 -mt-8">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-white shadow-[0_14px_28px_-20px_rgba(7,26,47,0.75)]">
              <LogoImage
                src={company.logo}
                alt={company.companyName}
                size={72}
                sizes="72px"
                className="h-full w-full object-contain p-1.5"
                iconSize="h-7 w-7"
              />
            </div>
            <div className="min-w-0 pt-9">
              <h3
                className="line-clamp-2 text-sm font-bold leading-tight text-[var(--color-fdi-text)] transition-colors group-hover:text-[var(--color-fdi-primary)]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {company.companyName}
              </h3>
              {company.industry && (
                <p className="mt-1 line-clamp-1 text-xs text-[var(--color-fdi-text-secondary)]">
                  {company.industry}
                </p>
              )}
            </div>
          </div>

          {company.description && (
            <p className="mt-4 line-clamp-2 flex-1 text-xs leading-relaxed text-[var(--color-fdi-text-secondary)]">
              {company.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--color-fdi-text-secondary)]">
            {companySize && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-fdi-surface)] px-2.5 py-1 font-medium">
                <UsersRound className="h-3 w-3" aria-hidden="true" />
                {companySize}
              </span>
            )}
            {company.industrialZone && (
              <span className="inline-flex min-w-0 items-center gap-1 rounded-full bg-[var(--color-fdi-surface)] px-2.5 py-1 font-medium">
                <Building2 className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="truncate">KCN: {company.industrialZone}</span>
              </span>
            )}
            {company.location && (
              <span className="inline-flex min-w-0 items-center gap-1 rounded-full bg-[var(--color-fdi-surface)] px-2.5 py-1 font-medium">
                <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{company.location}</span>
              </span>
            )}
            {company.address && !hasStructuredPlace && (
              <span className="inline-flex min-w-0 items-center gap-1 rounded-full bg-[var(--color-fdi-surface)] px-2.5 py-1 font-medium">
                <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{company.address}</span>
              </span>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--color-fdi-border)] pt-4">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                jobCount > 0 ? "text-[var(--color-fdi-primary)]" : "text-[var(--color-fdi-text-secondary)]"
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
              {getJobLabel(jobCount)}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-fdi-primary)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              Xem
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
