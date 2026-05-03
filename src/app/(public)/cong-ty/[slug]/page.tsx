import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  Globe,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { ContentBlocksRenderer } from "@/components/content/ContentBlocksRenderer";
import { JobCard } from "@/components/public/JobCard";
import { LogoImage } from "@/components/public/LogoImage";
import { getCompanyBySlug, type CompanyProfile, type HomepageJob } from "@/lib/public-actions";
import {
  DEFAULT_COMPANY_THEME,
  normalizeCompanyCapabilities,
  normalizeCompanySidebarVisibility,
  normalizeCompanyTheme,
  normalizeContentBlocks,
  type CompanyProfileSidebarVisibility,
  type CompanyProfileTheme,
  type ContentBlock,
} from "@/lib/content-blocks";
import { normalizeCompanyMediaSettings } from "@/lib/company-media-settings";

const tierBadge: Record<string, { label: string; className: string }> = {
  VIP: { label: "VIP", className: "bg-amber-100 text-amber-800 ring-1 ring-amber-200" },
  PREMIUM: { label: "Premium", className: "bg-blue-100 text-blue-800 ring-1 ring-blue-200" },
  STANDARD: { label: "Standard", className: "bg-slate-100 text-slate-700 ring-1 ring-slate-200" },
  BASIC: { label: "Basic", className: "bg-slate-100 text-slate-600 ring-1 ring-slate-200" },
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
  const sidebarVisibility = normalizeCompanySidebarVisibility(company.profileConfig?.theme);
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

  const jobsPage = Math.max(1, Number(query?.jobsPage ?? 1) || 1);
  const jobsTotalPages = Math.max(1, Math.ceil(company.jobPostings.length / COMPANY_JOBS_PER_PAGE));
  const safeJobsPage = Math.min(jobsPage, jobsTotalPages);
  const visibleJobPostings = company.jobPostings.slice(
    (safeJobsPage - 1) * COMPANY_JOBS_PER_PAGE,
    safeJobsPage * COMPANY_JOBS_PER_PAGE
  );
  const companyJobsHref = `/viec-lam?company=${encodeURIComponent(company.slug)}`;
  const pageStyle = {
    background:
      "linear-gradient(180deg, #F7FAFC 0%, #EEF5F8 34%, #F8FAFC 100%)",
    color: theme.textColor,
  };
  const heroImageStyle = {
    objectPosition: `${company.coverPositionX ?? 50}% ${company.coverPositionY ?? 50}%`,
    transform: `scale(${(company.coverZoom ?? 100) / 100})`,
    transformOrigin: `${company.coverPositionX ?? 50}% ${company.coverPositionY ?? 50}%`,
  };

  return (
    <div id="main-content" className="min-h-screen" style={pageStyle}>
      <nav aria-label="Breadcrumb" className="border-b border-[#DCE7EE] bg-white/92 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-2 text-sm text-[#64748B]">
            <li>
              <Link
                href="/cong-ty"
                className="flex items-center gap-1 transition-colors hover:text-[#0A6F9D]"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Doanh nghiệp
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="max-w-xs truncate font-semibold text-[#102033]">
              {company.companyName}
            </li>
          </ol>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[22px] border border-[#BFD3DE] bg-[#EAF3F7] p-1.5 shadow-[0_28px_90px_-64px_rgba(15,35,55,0.55)]">
          <div
            className="relative isolate aspect-[var(--company-cover-ratio-mobile)] overflow-hidden rounded-[18px] bg-[#EAF3F7] sm:aspect-[var(--company-cover-ratio)]"
            style={{
              "--company-cover-ratio": mediaSettings.coverAspectRatio,
              "--company-cover-ratio-mobile": "16 / 10",
              maxHeight: "560px",
            } as CSSProperties}
          >
            {company.coverImage ? (
              <Image
                src={company.coverImage}
                alt={`${company.companyName} cover`}
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover"
                style={heroImageStyle}
              />
            ) : (
              <div className="h-full w-full bg-[linear-gradient(135deg,#063B5D,#07577E,#0A6F9D)]" />
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-[#D7E4EB] bg-white p-5 shadow-[0_20px_60px_-52px_rgba(15,35,55,0.48)] sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
              <CompanyLogoTile
                company={company}
                logoAspectRatio={mediaSettings.logoAspectRatio}
                logoZoom={mediaSettings.logoZoom}
                logoFit={mediaSettings.logoFit}
              />
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {badge ? (
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${badge.className}`}>
                      {badge.label}
                    </span>
                  ) : null}
                  <span className="inline-flex rounded-full border border-[#D7E4EB] bg-[#F4F8FA] px-3 py-1 text-xs font-semibold text-[#526173]">
                    Nhà tuyển dụng nổi bật
                  </span>
                </div>
                <h1
                  className="max-w-3xl text-3xl font-extrabold leading-tight text-[#102033] sm:text-4xl"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {company.companyName}
                </h1>
                {company.description ? (
                  <p className="mt-3 max-w-[48ch] text-sm font-medium leading-6 text-[#526173] sm:text-base">
                    {company.description}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="#jobs"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#D94B16] px-5 text-sm font-bold text-white shadow-none transition hover:-translate-y-0.5 hover:bg-[#BE3F12]"
              >
                Xem việc đang tuyển
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              {company.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#CFE0EA] bg-white px-5 text-sm font-bold text-[#0A6F9D] transition hover:-translate-y-0.5 hover:border-[#9FCBDA]"
                >
                  Website công ty
                  <Globe className="h-4 w-4" aria-hidden="true" />
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <CompanyFactStrip company={company} theme={theme} />
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <main className="min-w-0 space-y-10">
          <ContentBlocksRenderer
            blocks={sections}
            fallbackMarkdown={company.description}
            theme={theme}
            layout={company.profileConfig?.sectionLayout}
          />
          <JobsSection
            company={company}
            visibleJobPostings={visibleJobPostings}
            safeJobsPage={safeJobsPage}
            jobsTotalPages={jobsTotalPages}
          />
        </main>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <CompanySidebar
            company={company}
            companyJobsHref={companyJobsHref}
            theme={theme}
            visibility={sidebarVisibility}
          />
        </aside>
      </div>
    </div>
  );
}

function CompanyLogoTile({
  company,
  logoAspectRatio,
  logoZoom,
  logoFit,
}: {
  company: CompanyProfile;
  logoAspectRatio: string;
  logoZoom: number;
  logoFit: string;
}) {
  return (
    <div
      className="flex h-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E0E8EE] bg-white shadow-[0_18px_44px_-34px_rgba(2,15,25,0.45)] sm:h-32"
      style={{
        aspectRatio: logoAspectRatio === "auto" ? "1 / 1" : logoAspectRatio,
        maxWidth: "11rem",
        minWidth: "6rem",
      }}
    >
      <div className="h-full w-full" style={{ transform: `scale(${logoZoom / 100})` }}>
        <LogoImage
          src={company.logo}
          alt={company.companyName}
          size={144}
          className={`h-full w-full p-4 ${logoFit === "cover" ? "object-cover" : "object-contain"}`}
          iconSize="h-10 w-10"
          sizes="176px"
        />
      </div>
    </div>
  );
}

function CompanyFactStrip({ company, theme }: { company: CompanyProfile; theme: CompanyProfileTheme }) {
  const facts = [
    { icon: Briefcase, value: `${company.jobPostings.length}`, label: "vị trí đang tuyển" },
    { icon: Users, value: company.companySize ?? "Enterprise", label: "quy mô công ty" },
    { icon: MapPin, value: company.location ?? company.industrialZone ?? "Việt Nam", label: "địa điểm" },
    { icon: ShieldCheck, value: company.subscription?.tier ?? "Verified", label: "hồ sơ xác thực" },
  ];

  return (
    <dl className="grid overflow-hidden rounded-lg border border-[#D7E4EB] bg-[#F9FCFD] sm:grid-cols-2 lg:grid-cols-4">
      {facts.map((fact, index) => (
        <div key={fact.label} className={`flex items-center gap-3 px-5 py-4 ${index > 0 ? "border-t border-[#E4EEF3] sm:border-l sm:border-t-0" : ""}`}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF6F9]" style={{ color: theme.primaryColor }}>
            <fact.icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[#5C6D7E]">{fact.label}</dt>
            <dd className="text-base font-extrabold leading-snug text-[#102033]">{fact.value}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

function JobsSection({
  company,
  visibleJobPostings,
  safeJobsPage,
  jobsTotalPages,
}: {
  company: CompanyProfile;
  visibleJobPostings: HomepageJob[];
  safeJobsPage: number;
  jobsTotalPages: number;
}) {
  if (company.jobPostings.length === 0) {
    return (
      <section id="jobs" className="rounded-lg border border-[#D7E4EB] bg-white p-8 text-center text-[#64748B]">
        <Building2 className="mx-auto mb-3 h-10 w-10 opacity-35" aria-hidden="true" />
        <p className="text-sm font-semibold">Chưa có thông tin tuyển dụng</p>
      </section>
    );
  }

  return (
    <section id="jobs" className="scroll-mt-24">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#D94B16]">Đang tuyển dụng</p>
          <h2 className="mt-1 text-2xl font-extrabold text-[#102033]" style={{ fontFamily: "var(--font-heading)" }}>
            {company.jobPostings.length} cơ hội tại {company.companyName}
          </h2>
        </div>
        <Link href={`/viec-lam?company=${encodeURIComponent(company.slug)}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#CFE0EA] bg-white px-4 text-sm font-bold text-[#0A6F9D] transition hover:-translate-y-0.5 hover:border-[#9FCBDA]">
          Xem tất cả
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5">
        {visibleJobPostings.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {jobsTotalPages > 1 ? (
        <div className="mt-5 flex flex-col gap-3 border-t border-[#DCE7EE] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#64748B]">
            Hiển thị {(safeJobsPage - 1) * COMPANY_JOBS_PER_PAGE + 1}-
            {Math.min(safeJobsPage * COMPANY_JOBS_PER_PAGE, company.jobPostings.length)} / {company.jobPostings.length} vị trí
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={`/cong-ty/${company.slug}?jobsPage=${Math.max(1, safeJobsPage - 1)}#jobs`}
              aria-disabled={safeJobsPage === 1}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#CFE0EA] bg-white text-[#102033] transition ${safeJobsPage === 1 ? "pointer-events-none opacity-40" : "hover:-translate-y-0.5"}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <span className="rounded-lg border border-[#CFE0EA] bg-white px-3 py-2 text-sm font-bold text-[#102033]">
              {safeJobsPage}/{jobsTotalPages}
            </span>
            <Link
              href={`/cong-ty/${company.slug}?jobsPage=${Math.min(jobsTotalPages, safeJobsPage + 1)}#jobs`}
              aria-disabled={safeJobsPage === jobsTotalPages}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#CFE0EA] bg-white text-[#102033] transition ${safeJobsPage === jobsTotalPages ? "pointer-events-none opacity-40" : "hover:-translate-y-0.5"}`}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function CompanySidebar({
  company,
  companyJobsHref,
  theme,
  visibility,
}: {
  company: CompanyProfile;
  companyJobsHref: string;
  theme: CompanyProfileTheme;
  visibility: CompanyProfileSidebarVisibility;
}) {
  const infoItems = [
    { icon: Building2, label: "Ngành nghề", value: company.industry, visible: visibility.industry },
    { icon: Users, label: "Quy mô", value: company.companySize, visible: visibility.companySize },
    { icon: MapPin, label: "Khu vực", value: company.location, visible: visibility.location },
    { icon: Building2, label: "Khu công nghiệp", value: company.industrialZone, visible: visibility.industrialZone },
    { icon: MapPin, label: "Địa chỉ", value: company.address, visible: visibility.address },
    { icon: Globe, label: "Website", value: company.website, isLink: true, visible: visibility.website },
    { icon: Phone, label: "Điện thoại", value: company.phone, visible: visibility.phone },
  ].flatMap((item) => (item.visible && item.value ? [{ ...item, value: item.value }] : []));

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#D7E4EB] bg-white p-5 shadow-[0_20px_60px_-52px_rgba(15,35,55,0.48)]">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" style={{ color: theme.accentColor }} aria-hidden="true" />
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#102033]" style={{ fontFamily: "var(--font-heading)" }}>
            Thông tin công ty
          </h2>
        </div>
        <dl className="mt-4 divide-y divide-[#E4EEF3] text-sm">
          {infoItems.map((item) => (
              <div key={item.label} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <item.icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: theme.primaryColor }} aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-xs font-bold uppercase tracking-wide text-[#64748B]">{item.label}</dt>
                  {item.isLink ? (
                    <dd>
                      <a
                        href={item.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${item.value} mở trong tab mới`}
                        className="break-all font-semibold text-[#0A6F9D] hover:underline"
                      >
                        {item.value.replace(/^https?:\/\//, "")}
                      </a>
                    </dd>
                  ) : (
                    <dd className="font-semibold leading-snug text-[#102033]">{item.value}</dd>
                  )}
                </div>
              </div>
          ))}
        </dl>
      </div>

      <Link
        href={companyJobsHref}
        className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#D94B16] px-4 text-center text-sm font-bold text-white shadow-none transition hover:-translate-y-0.5 hover:bg-[#BE3F12]"
      >
        Xem vị trí đang tuyển
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>

    </div>
  );
}
