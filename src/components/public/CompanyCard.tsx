import Link from "next/link";
import { Building2, MapPin, Briefcase, Crown } from "lucide-react";
import type { PublicCompany } from "@/lib/public-actions";

const tierBadge: Record<string, { label: string; className: string }> = {
  VIP: { label: "VIP", className: "bg-amber-100 text-amber-700" },
  PREMIUM: { label: "Premium", className: "bg-purple-100 text-purple-700" },
  STANDARD: { label: "Standard", className: "bg-blue-100 text-blue-700" },
  BASIC: { label: "Basic", className: "bg-gray-100 text-gray-600" },
};

type CompanyCardProps = {
  company: PublicCompany;
};

export function CompanyCard({ company }: CompanyCardProps) {
  const badge = company.subscription ? tierBadge[company.subscription.tier] : null;
  const jobCount = company._count.jobPostings;

  return (
    <Link href={`/cong-ty/${company.slug}`} className="group block cursor-pointer">
      <article className="bg-white rounded-xl border border-gray-100 p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-[var(--color-fdi-primary)]/20 h-full flex flex-col">
        {/* Logo + Name */}
        <div className="flex items-center gap-3 mb-3">
          <div className="h-12 w-12 rounded-xl bg-[var(--color-fdi-surface)] flex items-center justify-center shrink-0 overflow-hidden">
            {company.logo ? (
              <img src={company.logo} alt={company.companyName} className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-6 w-6 text-[var(--color-fdi-primary)]" />
            )}
          </div>
          <div className="min-w-0">
            <h3
              className="text-sm font-semibold text-[var(--color-fdi-text)] line-clamp-1 group-hover:text-[var(--color-fdi-primary)] transition-colors"
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
          <p className="text-xs text-[var(--color-fdi-text-secondary)] line-clamp-2 mb-3 flex-1">
            {company.description}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          <div className="flex items-center gap-3 text-xs text-[var(--color-fdi-text-secondary)]">
            {company.address && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate max-w-[120px]">{company.address}</span>
              </span>
            )}
            {jobCount > 0 && (
              <span className="flex items-center gap-1 text-[var(--color-fdi-primary)] font-medium">
                <Briefcase className="h-3 w-3" />
                {jobCount} việc
              </span>
            )}
          </div>
          {badge && (
            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.className}`}>
              {company.subscription?.tier === "VIP" && <Crown className="h-2.5 w-2.5" />}
              {badge.label}
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}
