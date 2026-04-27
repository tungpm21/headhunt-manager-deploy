import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Briefcase,
  Building2,
  ChevronLeft,
  Globe,
  MapPin,
  Users,
} from "lucide-react";
import { ContentBlocksRenderer } from "@/components/content/ContentBlocksRenderer";
import { JobCard } from "@/components/public/JobCard";
import { LogoImage } from "@/components/public/LogoImage";
import { getCompanyBySlug, type HomepageJob } from "@/lib/public-actions";
import {
  DEFAULT_COMPANY_THEME,
  normalizeCompanyCapabilities,
  normalizeCompanyTheme,
  normalizeContentBlocks,
  type ContentBlock,
} from "@/lib/content-blocks";

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
      images: company.coverImage
        ? [{ url: company.coverImage, alt: `${company.companyName} cover` }]
        : company.logo
          ? [{ url: company.logo, width: 400, height: 400, alt: company.companyName }]
          : [],
    },
    twitter: {
      card: company.coverImage ? "summary_large_image" : "summary",
      title,
      description,
      images: company.coverImage ? [company.coverImage] : company.logo ? [company.logo] : [],
    },
  };
}

export default async function CompanyProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  if (!company) notFound();

  const badge = company.subscription ? tierBadge[company.subscription.tier] : null;
  const theme = normalizeCompanyTheme(company.profileConfig?.theme ?? DEFAULT_COMPANY_THEME);
  const capabilities = normalizeCompanyCapabilities(company.profileConfig?.capabilities);
  const configuredSections = normalizeContentBlocks(company.profileConfig?.sections);
  const sections: ContentBlock[] = [
    ...configuredSections,
    ...(capabilities.video && company.profileConfig?.primaryVideoUrl
      ? [{
          id: "primary-company-video",
          type: "video" as const,
          title: "Video giới thiệu",
          url: company.profileConfig.primaryVideoUrl,
        }]
      : []),
  ];

  const infoItems = [
    { icon: Building2, label: "Ngành nghề", value: company.industry },
    { icon: Users, label: "Quy mô", value: company.companySize },
    { icon: MapPin, label: "Địa chỉ", value: company.address },
    { icon: Globe, label: "Website", value: company.website, isLink: true },
  ];

  return (
    <div id="main-content" className="min-h-screen" style={{ backgroundColor: theme.backgroundColor }}>
      <nav aria-label="Breadcrumb" className="border-b border-[var(--color-fdi-mist)] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-2 text-sm text-[var(--color-fdi-text-secondary)]">
            <li>
              <Link
                href="/cong-ty"
                className="flex items-center gap-1 transition-colors hover:text-[var(--color-fdi-primary)]"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Doanh nghiệp
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="max-w-xs truncate font-medium text-[var(--color-fdi-text)]">
              {company.companyName}
            </li>
          </ol>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="relative h-72 overflow-hidden rounded-3xl shadow-lg sm:h-80 lg:h-96">
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
            <div
              className="h-full w-full"
              style={{
                background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
              }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, transparent 35%, ${theme.primaryColor}E6 100%)`,
            }}
          />
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-14 pl-6 sm:pl-10">
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl bg-white shadow-lg ring-[6px] ring-white">
            <LogoImage
              src={company.logo}
              alt={company.companyName}
              size={112}
              className="h-full w-full object-contain p-3"
              iconSize="h-10 w-10"
            />
          </div>
        </div>

        <div className="mb-5 mt-4 pl-6 sm:pl-10">
          <div className="flex flex-wrap items-center gap-2">
            <h1
              className="text-2xl font-bold text-[var(--color-fdi-text)] sm:text-3xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {company.companyName}
            </h1>
            {badge ? (
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
                {badge.label}
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[var(--color-fdi-text-secondary)]">
            {company.industry ? <span>{company.industry}</span> : null}
            {company.jobPostings.length > 0 ? (
              <span className="flex items-center gap-1 font-medium text-[var(--color-fdi-primary)]">
                <Briefcase className="h-3.5 w-3.5" />
                {company.jobPostings.length} vị trí đang tuyển
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <main className="min-w-0 flex-1 space-y-8">
            <ContentBlocksRenderer blocks={sections} fallbackMarkdown={company.description} theme={theme} />

            {company.jobPostings.length > 0 ? (
              <section id="jobs">
                <h2
                  className="mb-4 text-lg font-bold text-[var(--color-fdi-text)]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Vị trí đang tuyển ({company.jobPostings.length})
                </h2>
                <div className="rounded-2xl bg-white p-3 shadow-sm sm:p-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5">
                    {company.jobPostings.map((job: HomepageJob) => (
                      <div key={job.id} className="min-w-0">
                        <JobCard job={job} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {company.jobPostings.length === 0 && !company.description && sections.length === 0 ? (
              <div className="rounded-xl border border-[var(--color-fdi-mist)] bg-white p-8 text-center text-[var(--color-fdi-text-secondary)]">
                <Building2 className="mx-auto mb-3 h-10 w-10 opacity-30" />
                <p className="text-sm">Chưa có thông tin tuyển dụng</p>
              </div>
            ) : null}
          </main>

          <aside className="lg:w-80 lg:shrink-0">
            <div className="space-y-4 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-[var(--color-fdi-mist)] bg-white p-6 shadow-sm">
                <h3
                  className="text-sm font-semibold uppercase tracking-wider text-[var(--color-fdi-text)]"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Thông tin liên hệ
                </h3>
                <dl className="mt-4 space-y-3 text-sm text-[var(--color-fdi-text-secondary)]">
                  {infoItems.map(
                    (item) =>
                      item.value && (
                        <div key={item.label} className="flex items-start gap-2.5">
                          <item.icon
                            className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-fdi-primary)]"
                            aria-hidden="true"
                          />
                          <div>
                            <dt className="mb-0.5 text-xs uppercase tracking-wider text-[var(--color-fdi-text-secondary)]">
                              {item.label}
                            </dt>
                            {item.isLink ? (
                              <dd>
                                <a
                                  href={item.value}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={`${item.value} (mở trong tab mới)`}
                                  className="break-all text-[var(--color-fdi-primary)] hover:underline"
                                >
                                  {item.value.replace(/^https?:\/\//, "")}
                                </a>
                              </dd>
                            ) : (
                              <dd className="text-[var(--color-fdi-text)]">{item.value}</dd>
                            )}
                          </div>
                        </div>
                      )
                  )}
                </dl>
              </div>

              <Link
                href="#jobs"
                className="flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
                style={{ backgroundColor: theme.accentColor }}
              >
                Xem vị trí đang tuyển
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
