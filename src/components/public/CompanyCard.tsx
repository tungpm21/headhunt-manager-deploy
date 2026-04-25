import Link from "next/link";
import Image from "next/image";
import { Briefcase, Crown } from "lucide-react";
import type { PublicCompany } from "@/lib/public-actions";
import { LogoImage } from "@/components/public/LogoImage";

const tierBadge: Record<string, { label: string; className: string }> = {
  VIP: { label: "VIP", className: "bg-amber-100 text-amber-700" },
  PREMIUM: { label: "Premium", className: "bg-purple-100 text-purple-700" },
  STANDARD: { label: "Standard", className: "bg-blue-100 text-blue-700" },
  BASIC: { label: "Basic", className: "bg-gray-100 text-gray-600" },
};

type CompanyCardProps = {
  company: PublicCompany;
  imagePriority?: boolean;
};

export function CompanyCard({ company, imagePriority = false }: CompanyCardProps) {
  const badge = company.subscription ? tierBadge[company.subscription.tier] : null;
  const jobCount = company._count.jobPostings;

  return (
    <Link href={`/cong-ty/${company.slug}`} className="group block cursor-pointer">
      <article
        className={`bg-white rounded-2xl border overflow-hidden transition-[border-color,box-shadow,transform] duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-[var(--color-fdi-primary)]/20 h-full flex flex-col ${company.subscription && ["VIP", "PREMIUM"].includes(company.subscription.tier)
            ? "border-amber-200 border-l-[3px] border-l-amber-400"
            : "border-gray-100"
          }`}
      >
        {/* Cover image header */}
        <div className="h-28 sm:h-32 w-full overflow-hidden relative">
          {company.coverImage ? (
            <Image
              src={company.coverImage}
              alt=""
              fill
              priority={imagePriority}
              loading={imagePriority ? "eager" : "lazy"}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--color-fdi-dark)] via-[#005A9E] to-[var(--color-fdi-primary)]" />
          )}
        </div>

        {/* Content area with overlapping logo */}
        <div className="relative px-5 pb-5 pt-0 flex-1 flex flex-col">
          {/* Logo — overlaps cover */}
          <div className="flex items-start gap-3 -mt-8">
            <div className="h-16 w-16 rounded-xl bg-white border-2 border-gray-100 shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
              <LogoImage
                src={company.logo}
                alt={company.companyName}
                className="h-full w-full object-contain p-1.5"
                iconSize="h-7 w-7"
              />
            </div>
            <div className="min-w-0 pt-9">
              <h3
                className="text-sm font-semibold text-[var(--color-fdi-text)] line-clamp-2 group-hover:text-[var(--color-fdi-primary)] transition-colors leading-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {company.companyName}
              </h3>
              {company.industry && (
                <p className="text-xs text-[var(--color-fdi-text-secondary)] line-clamp-1 mt-0.5">
                  {company.industry}
                </p>
              )}
            </div>
          </div>

          {/* Description excerpt */}
          {company.description && (
            <p className="text-xs text-[var(--color-fdi-text-secondary)] line-clamp-2 mt-3 flex-1 leading-relaxed">
              {company.description}
            </p>
          )}

          {/* Footer meta */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
            {jobCount > 0 ? (
              <span className="flex items-center gap-1 text-xs text-[var(--color-fdi-primary)] font-medium">
                <Briefcase className="h-3.5 w-3.5" />
                {jobCount} vị trí đang tuyển
              </span>
            ) : (
              <span className="text-xs text-[var(--color-fdi-text-secondary)]">
                Chưa có vị trí tuyển dụng
              </span>
            )}
            {badge && (
              <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.className}`}>
                {company.subscription?.tier === "VIP" && <Crown className="h-2.5 w-2.5" />}
                {badge.label}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
