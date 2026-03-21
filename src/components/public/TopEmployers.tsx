import Link from "next/link";
import { Building2, Crown } from "lucide-react";
import type { HomepageEmployer } from "@/lib/public-actions";

const tierBadge: Record<string, { label: string; className: string }> = {
  VIP: { label: "VIP", className: "bg-amber-100 text-amber-700" },
  PREMIUM: { label: "Premium", className: "bg-purple-100 text-purple-700" },
  STANDARD: { label: "Standard", className: "bg-blue-100 text-blue-700" },
  BASIC: { label: "Basic", className: "bg-gray-100 text-gray-600" },
};

type TopEmployersProps = {
  employers: HomepageEmployer[];
};

export function TopEmployers({ employers }: TopEmployersProps) {
  if (employers.length === 0) return null;

  return (
    <section className="py-16 lg:py-20 bg-[var(--color-fdi-surface)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-10">
          <h2
            className="text-2xl sm:text-3xl font-bold text-[var(--color-fdi-text)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Nhà tuyển dụng hàng đầu
          </h2>
          <p
            className="mt-2 text-sm text-[var(--color-fdi-text-secondary)]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Các doanh nghiệp FDI uy tín đang tuyển dụng
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {employers.map((employer) => {
            const badge = employer.subscription
              ? tierBadge[employer.subscription.tier]
              : null;
            return (
              <Link
                key={employer.id}
                href={`/cong-ty/${employer.slug}`}
                className="group block cursor-pointer"
              >
                <div className="bg-white rounded-xl p-5 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-1 border border-gray-100">
                  {/* Logo */}
                  <div className="mx-auto h-16 w-16 rounded-xl bg-[var(--color-fdi-surface)] flex items-center justify-center overflow-hidden mb-3">
                    {employer.logo ? (
                      <img
                        src={employer.logo}
                        alt={employer.companyName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-7 w-7 text-[var(--color-fdi-primary)]" />
                    )}
                  </div>

                  {/* Name */}
                  <p className="text-xs font-semibold text-[var(--color-fdi-text)] line-clamp-2 mb-1 group-hover:text-[var(--color-fdi-primary)] transition-colors">
                    {employer.companyName}
                  </p>

                  {/* Industry */}
                  {employer.industry && (
                    <p className="text-[10px] text-[var(--color-fdi-text-secondary)] line-clamp-1 mb-2">
                      {employer.industry}
                    </p>
                  )}

                  {/* Tier badge */}
                  {badge && (
                    <span
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.className}`}
                    >
                      {employer.subscription?.tier === "VIP" && (
                        <Crown className="h-2.5 w-2.5" />
                      )}
                      {badge.label}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
