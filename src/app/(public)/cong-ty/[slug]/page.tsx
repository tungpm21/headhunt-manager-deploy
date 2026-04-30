import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
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
import { normalizeCompanyMediaSettings } from "@/lib/company-media-settings";

const tierBadge: Record<string, { label: string; className: string }> = {
  VIP: { label: "VIP", className: "bg-amber-100 text-amber-700" },
  PREMIUM: { label: "Premium", className: "bg-purple-100 text-purple-700" },
  STANDARD: { label: "Standard", className: "bg-blue-100 text-blue-700" },
  BASIC: { label: "Basic", className: "bg-gray-100 text-gray-600" },
};

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ jobsPage?: string }>;
};

const COMPANY_JOBS_PER_PAGE = 6;

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

export default async function CompanyProfilePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const company = await getCompanyBySlug(slug);
  if (!company) notFound();

  const badge = company.subscription ? tierBadge[company.subscription.tier] : null;
  const theme = normalizeCompanyTheme(company.profileConfig?.theme ?? DEFAULT_COMPANY_THEME);
  const mediaSettings = normalizeCompanyMediaSettings(company.profileConfig?.theme);
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
    { icon: MapPin, label: "Khu vực", value: company.location },
    { icon: Building2, label: "Khu công nghiệp", value: company.industrialZone },
    { icon: MapPin, label: "Địa chỉ", value: company.address },
    { icon: Globe, label: "Website", value: company.website, isLink: true },
  ];
  const pageStyle = { backgroundColor: theme.backgroundColor, color: theme.textColor };
  const panelStyle = {
    backgroundColor: theme.surfaceColor,
    borderColor: theme.borderColor,
    color: theme.textColor,
  };
  const mutedTextStyle = { color: `${theme.textColor}B3` };
  const jobsPage = Math.max(1, Number(query?.jobsPage ?? 1) || 1);
  const jobsTotalPages = Math.max(1, Math.ceil(company.jobPostings.length / COMPANY_JOBS_PER_PAGE));
  const safeJobsPage = Math.min(jobsPage, jobsTotalPages);
  const visibleJobPostings = company.jobPostings.slice(
    (safeJobsPage - 1) * COMPANY_JOBS_PER_PAGE,
    safeJobsPage * COMPANY_JOBS_PER_PAGE
  );
  const companyJobsHref = `/viec-lam?company=${encodeURIComponent(company.slug)}`;

  return (
    <div id="main-content" className="min-h-screen" style={pageStyle}>
      <nav aria-label="Breadcrumb" className="border-b bg-white" style={{ borderColor: theme.borderColor }}>
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-2 text-sm" style={mutedTextStyle}>
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
            <li aria-current="page" className="max-w-xs truncate font-medium" style={{ color: theme.textColor }}>
              {company.companyName}
            </li>
          </ol>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div
          className="relative min-h-[220px] overflow-hidden rounded-3xl shadow-lg"
          style={{ aspectRatio: mediaSettings.coverAspectRatio }}
        >
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
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-14 pl-6 sm:pl-10">
          <div
            className="flex h-28 items-center justify-center overflow-hidden rounded-3xl bg-white shadow-lg"
            style={{
              aspectRatio: mediaSettings.logoAspectRatio === "auto" ? "1 / 1" : mediaSettings.logoAspectRatio,
              color: theme.textColor,
              maxWidth: "11rem",
              minWidth: "7rem",
            }}
          >
            <div
              className="h-full w-full"
              style={{ transform: `scale(${mediaSettings.logoZoom / 100})` }}
            >
              <LogoImage
                src={company.logo}
                alt={company.companyName}
                size={112}
                className={`h-full w-full p-3 ${
                  mediaSettings.logoFit === "cover" ? "object-cover" : "object-contain"
                }`}
                iconSize="h-10 w-10"
                sizes="176px"
              />
            </div>
          </div>
        </div>

        <div className="mb-5 mt-4 pl-6 sm:pl-10">
          <div className="flex flex-wrap items-center gap-2">
            <h1
              className="text-2xl font-bold sm:text-3xl"
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
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm" style={mutedTextStyle}>
            {company.industry ? <span>{company.industry}</span> : null}
            {company.industrialZone ? (
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                {company.industrialZone}
              </span>
            ) : company.location ? (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {company.location}
              </span>
            ) : null}
            {company.jobPostings.length > 0 ? (
              <span className="flex items-center gap-1 font-medium" style={{ color: theme.accentColor }}>
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
                  className="mb-4 text-lg font-bold"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Vị trí đang tuyển ({company.jobPostings.length})
                </h2>
                <div className="rounded-2xl border p-3 shadow-sm sm:p-4" style={panelStyle}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5">
                    {visibleJobPostings.map((job: HomepageJob) => (
                      <div key={job.id} className="min-w-0">
                        <JobCard job={job} />
                      </div>
                    ))}
                  </div>
                  {jobsTotalPages > 1 ? (
                    <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: theme.borderColor }}>
                      <p className="text-sm" style={mutedTextStyle}>
                        Hiển thị {(safeJobsPage - 1) * COMPANY_JOBS_PER_PAGE + 1}-
                        {Math.min(safeJobsPage * COMPANY_JOBS_PER_PAGE, company.jobPostings.length)} / {company.jobPostings.length} vị trí
                      </p>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/cong-ty/${company.slug}?jobsPage=${Math.max(1, safeJobsPage - 1)}#jobs`}
                          aria-disabled={safeJobsPage === 1}
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                            safeJobsPage === 1 ? "pointer-events-none opacity-40" : "hover:-translate-y-0.5"
                          }`}
                          style={{ borderColor: theme.borderColor, color: theme.textColor }}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Link>
                        <span className="rounded-lg border px-3 py-2 text-sm font-semibold" style={{ borderColor: theme.borderColor }}>
                          {safeJobsPage}/{jobsTotalPages}
                        </span>
                        <Link
                          href={`/cong-ty/${company.slug}?jobsPage=${Math.min(jobsTotalPages, safeJobsPage + 1)}#jobs`}
                          aria-disabled={safeJobsPage === jobsTotalPages}
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                            safeJobsPage === jobsTotalPages ? "pointer-events-none opacity-40" : "hover:-translate-y-0.5"
                          }`}
                          style={{ borderColor: theme.borderColor, color: theme.textColor }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}

            {company.jobPostings.length === 0 && !company.description && sections.length === 0 ? (
              <div className="rounded-xl border p-8 text-center" style={{ ...panelStyle, ...mutedTextStyle }}>
                <Building2 className="mx-auto mb-3 h-10 w-10 opacity-30" />
                <p className="text-sm">Chưa có thông tin tuyển dụng</p>
              </div>
            ) : null}
          </main>

          <aside className="lg:w-80 lg:shrink-0">
            <div className="space-y-4 lg:sticky lg:top-24">
              <div className="rounded-2xl border p-6 shadow-sm" style={panelStyle}>
                <h3
                  className="text-sm font-semibold uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Thông tin liên hệ
                </h3>
                <dl className="mt-4 space-y-3 text-sm" style={mutedTextStyle}>
                  {infoItems.map(
                    (item) =>
                      item.value && (
                        <div key={item.label} className="flex items-start gap-2.5">
                          <item.icon
                            className="mt-0.5 h-4 w-4 shrink-0"
                            style={{ color: theme.primaryColor }}
                            aria-hidden="true"
                          />
                          <div>
                            <dt className="mb-0.5 text-xs uppercase tracking-wider" style={mutedTextStyle}>
                              {item.label}
                            </dt>
                            {item.isLink ? (
                              <dd>
                                <a
                                  href={item.value}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={`${item.value} (mở trong tab mới)`}
                                  className="break-all hover:underline"
                                  style={{ color: theme.accentColor }}
                                >
                                  {item.value.replace(/^https?:\/\//, "")}
                                </a>
                              </dd>
                            ) : (
                              <dd style={{ color: theme.textColor }}>{item.value}</dd>
                            )}
                          </div>
                        </div>
                      )
                  )}
                </dl>
              </div>

              <Link
                href={companyJobsHref}
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
