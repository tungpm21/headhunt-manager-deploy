import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Globe,
  Phone,
  Users,
  Briefcase,
  ChevronLeft,
} from "lucide-react";
import { getCompanyBySlug, type HomepageJob } from "@/lib/public-actions";
import { JobCard } from "@/components/public/JobCard";
import { LogoImage } from "@/components/public/LogoImage";

const tierBadge: Record<string, { label: string; className: string }> = {
  VIP: { label: "VIP", className: "bg-amber-100 text-amber-700" },
  PREMIUM: { label: "Premium", className: "bg-purple-100 text-purple-700" },
  STANDARD: { label: "Standard", className: "bg-blue-100 text-blue-700" },
  BASIC: { label: "Basic", className: "bg-gray-100 text-gray-600" },
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);

  if (!company) {
    return { title: "Công ty không tồn tại" };
  }

  const title = `${company.companyName} | Tuyển dụng FDI`;
  const description =
    (company.description ?? "").replace(/\n/g, " ").slice(0, 200) ||
    `${company.companyName} đang tuyển dụng tại FDIWork - Job board FDI hàng đầu Việt Nam.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: company.logo
        ? [
            {
              url: company.logo,
              width: 400,
              height: 400,
              alt: company.companyName,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: company.logo ? [company.logo] : [],
    },
  };
}

export default async function CompanyProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  if (!company) notFound();

  const badge = company.subscription ? tierBadge[company.subscription.tier] : null;

  const infoItems = [
    { icon: Building2, label: "Ngành nghề", value: company.industry },
    { icon: Users, label: "Quy mô", value: company.companySize },
    { icon: MapPin, label: "Địa chỉ", value: company.address },
    { icon: Phone, label: "Điện thoại", value: company.phone },
    {
      icon: Globe,
      label: "Website",
      value: company.website,
      isLink: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-[var(--color-fdi-text-secondary)]">
            <Link
              href="/cong-ty"
              className="flex items-center gap-1 hover:text-[var(--color-fdi-primary)] transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              Doanh nghiệp
            </Link>
            <span>/</span>
            <span className="text-[var(--color-fdi-text)] font-medium truncate max-w-xs">
              {company.companyName}
            </span>
          </div>
        </div>
      </div>

      {/* Cover image — taller, rounded corners */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className="relative h-72 sm:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-lg">
          {company.coverImage ? (
            <Image
              src={company.coverImage}
              alt={`${company.companyName} cover`}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover"
              style={{
                objectPosition: `${company.coverPositionX ?? 50}% ${company.coverPositionY ?? 50}%`,
                transform: `scale(${(company.coverZoom ?? 100) / 100})`,
                transformOrigin: `${company.coverPositionX ?? 50}% ${company.coverPositionY ?? 50}%`,
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[var(--color-fdi-dark)] via-[#005A9E] to-[var(--color-fdi-primary)]" />
          )}
          {company.coverImage && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          )}
        </div>
      </div>

      {/* Logo + Company info — stacked, logo overlaps cover edge */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-14 pl-6 sm:pl-10">
          <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-white ring-[5px] ring-white shadow-lg flex items-center justify-center overflow-hidden">
            <LogoImage
              src={company.logo}
              alt={company.companyName}
              className="h-full w-full object-contain p-2.5"
              iconSize="h-10 w-10"
            />
          </div>
        </div>

        <div className="mt-3 mb-4 pl-6 sm:pl-10">
          <div className="flex items-center gap-2 flex-wrap">
            <h1
              className="text-xl sm:text-2xl font-bold text-[var(--color-fdi-text)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {company.companyName}
            </h1>
            {badge && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                {badge.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-[var(--color-fdi-text-secondary)]">
            {company.industry && <span>{company.industry}</span>}
            {company.jobPostings.length > 0 && (
              <span className="flex items-center gap-1 text-[var(--color-fdi-primary)] font-medium">
                <Briefcase className="h-3.5 w-3.5" />
                {company.jobPostings.length} vị trí đang tuyển
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Description */}
            {company.description && (
              <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
                <h2
                  className="text-base font-semibold text-[var(--color-fdi-text)] mb-3"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Giới thiệu công ty
                </h2>
                <div
                  className="prose prose-sm max-w-none text-[var(--color-fdi-text-secondary)] leading-relaxed whitespace-pre-line"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {company.description}
                </div>
              </div>
            )}

            {/* Active Jobs */}
            {company.jobPostings.length > 0 && (
              <div>
                <h2
                  className="text-lg font-bold text-[var(--color-fdi-text)] mb-4"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Vị trí đang tuyển ({company.jobPostings.length})
                </h2>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-x divide-gray-100">
                    {company.jobPostings.map((job: HomepageJob, i: number) => (
                      <div
                        key={job.id}
                        className={`${i >= 2 ? "border-t border-gray-100" : ""}`}
                      >
                        <JobCard job={job} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {company.jobPostings.length === 0 && !company.description && (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-[var(--color-fdi-text-secondary)]">
                <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Chưa có thông tin tuyển dụng</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 shrink-0">
            <div className="lg:sticky lg:top-24 bg-white rounded-xl border border-gray-100 p-6 space-y-4">
              <h3
                className="text-sm font-semibold text-[var(--color-fdi-text)] uppercase tracking-wider"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Thông tin liên hệ
              </h3>
              <div className="space-y-3 text-sm text-[var(--color-fdi-text-secondary)]">
                {infoItems.map(
                  (item) =>
                    item.value && (
                      <div key={item.label} className="flex items-start gap-2.5">
                        <item.icon className="h-4 w-4 text-[var(--color-fdi-primary)] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-[var(--color-fdi-text-secondary)] uppercase tracking-wider mb-0.5">
                            {item.label}
                          </p>
                          {item.isLink ? (
                            <a
                              href={item.value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--color-fdi-primary)] hover:underline cursor-pointer break-all"
                            >
                              {item.value.replace(/^https?:\/\//, "")}
                            </a>
                          ) : (
                            <p className="text-[var(--color-fdi-text)]">{item.value}</p>
                          )}
                        </div>
                      </div>
                    )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
