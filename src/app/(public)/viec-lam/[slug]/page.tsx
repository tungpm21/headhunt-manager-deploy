import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Briefcase,
  Clock,
  Users,
  Eye,
  FileText,
  Globe,
  ArrowRight,
  ChevronLeft,
  BadgeDollarSign,
  CalendarDays,
  Tag,
  Factory,
} from "lucide-react";
import { getPublicJobBySlug, type HomepageJob } from "@/lib/public-actions";
import { SafeRichContent } from "@/components/content/SafeRichContent";
import { JobCard } from "@/components/public/JobCard";
import { LogoImage } from "@/components/public/LogoImage";

const LANGUAGE_LABELS: Record<string, string> = {
  Japanese: "Tiếng Nhật",
  Korean: "Tiếng Hàn",
  English: "Tiếng Anh",
  Chinese: "Tiếng Trung",
  German: "Tiếng Đức",
  French: "Tiếng Pháp",
};

const SHIFT_LABELS: Record<string, string> = {
  DAY: "Ca ngày",
  NIGHT: "Ca đêm",
  ROTATING: "Xoay ca",
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicJobBySlug(slug);

  if (!result) {
    return { title: "Việc làm không tồn tại" };
  }

  const job = result.job;
  const title = `${job.title} - ${job.employer.companyName}`;
  const description = job.description.replace(/\n/g, " ").slice(0, 200);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: job.coverImage
        ? [
            {
              url: job.coverImage,
              width: 1200,
              height: 630,
              alt: job.coverAlt ?? title,
            },
          ]
        : job.employer.logo
        ? [
            {
              url: job.employer.logo,
              width: 400,
              height: 400,
              alt: job.employer.companyName,
            },
          ]
        : [],
    },
    twitter: {
      card: job.coverImage ? "summary_large_image" : "summary",
      title,
      description,
      images: job.coverImage ? [job.coverImage] : job.employer.logo ? [job.employer.logo] : [],
    },
  };
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function JobDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getPublicJobBySlug(slug);
  if (!result) notFound();

  const { job, similarJobs, sameEmployerJobs, suggestedJobs } = result;

  const infoItems = [
    { icon: MapPin, label: "Khu vực", value: job.location },
    { icon: Briefcase, label: "Hình thức", value: job.workType },
    { icon: BadgeDollarSign, label: "Mức lương", value: job.salaryDisplay },
    { icon: Users, label: "Số lượng", value: job.quantity > 1 ? `${job.quantity} người` : "1 người" },
    { icon: Tag, label: "Cấp bậc", value: job.position },
    { icon: CalendarDays, label: "Hạn nộp", value: job.expiresAt ? formatDate(job.expiresAt) : "Không giới hạn" },
  ];

  const skills = job.skills;

  return (
    <div id="main-content" className="min-h-screen bg-[var(--color-fdi-mist)]">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-[var(--color-fdi-mist)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center gap-2 text-sm text-[var(--color-fdi-text-secondary)]">
            <li>
              <Link
                href="/viec-lam"
                className="flex items-center gap-1 hover:text-[var(--color-fdi-primary)] transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Việc làm
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-[var(--color-fdi-text)] font-medium truncate max-w-xs">
              {job.title}
            </li>
          </ol>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {job.coverImage && (
              <div className="overflow-hidden rounded-2xl border border-[var(--color-fdi-mist)] bg-white shadow-sm">
                <Image
                  src={job.coverImage}
                  alt={job.coverAlt ?? job.title}
                  width={1200}
                  height={520}
                  priority
                  className="aspect-[16/7] w-full object-cover"
                />
              </div>
            )}

            {/* Job Header Card */}
            <div className="bg-white rounded-xl border border-[var(--color-fdi-mist)] p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="h-14 w-14 rounded-xl bg-[var(--color-fdi-surface)] flex items-center justify-center shrink-0 overflow-hidden">
                  <LogoImage
                    src={job.employer.logo}
                    alt={job.employer.companyName}
                    size={56}
                    sizes="56px"
                    className="h-full w-full object-contain p-1"
                    iconSize="h-7 w-7"
                  />
                </div>
                <div className="min-w-0">
                  <h1
                    className="text-xl sm:text-2xl font-bold text-[var(--color-fdi-text)]"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {job.title}
                  </h1>
                  <Link
                    href={`/cong-ty/${job.employer.slug}`}
                    className="text-sm text-[var(--color-fdi-primary)] hover:underline cursor-pointer mt-1 inline-block"
                  >
                    {job.employer.companyName}
                  </Link>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-fdi-text-secondary)]">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {job.viewCount} lượt xem
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" /> {job.applyCount} ứng tuyển
                    </span>
                    {job.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Đăng ngày {formatDate(job.publishedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {infoItems.map(
                  (item) =>
                    item.value && (
                      <div
                        key={item.label}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[var(--color-fdi-mist)]"
                      >
                        <item.icon className="h-4 w-4 text-[var(--color-fdi-primary)] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-[var(--color-fdi-text-secondary)] uppercase tracking-wider">
                            {item.label}
                          </p>
                          <p className="text-sm font-medium text-[var(--color-fdi-text)] truncate">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    )
                )}
              </div>

              {(job.requiredLanguages.length > 0 ||
                job.industrialZone ||
                job.shiftType) && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {job.requiredLanguages.map((lang) => (
                    <span
                      key={lang}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-fdi-primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--color-fdi-primary)]"
                    >
                      <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                      {LANGUAGE_LABELS[lang] ?? lang}
                      {job.languageProficiency && ` · ${job.languageProficiency}`}
                    </span>
                  ))}
                  {job.industrialZone && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
                      <Factory className="h-3.5 w-3.5" aria-hidden="true" />
                      {job.industrialZone}
                    </span>
                  )}
                  {job.shiftType && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-700">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {SHIFT_LABELS[job.shiftType] ?? job.shiftType}
                    </span>
                  )}
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-md bg-[var(--color-fdi-surface)] text-xs font-medium text-[var(--color-fdi-primary)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA */}
              <Link
                href={`/ung-tuyen?job=${job.id}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--color-fdi-primary)] px-6 py-3 text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-fdi-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/35 cursor-pointer"
              >
                Ứng tuyển ngay
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Description */}
            <ContentSection title="Mô tả công việc" content={job.description} />
            {job.requirements && <ContentSection title="Yêu cầu ứng viên" content={job.requirements} />}
            {job.benefits && <ContentSection title="Quyền lợi" content={job.benefits} />}
          </div>

          {/* Sidebar — Company Info */}
          <div className="lg:w-80 shrink-0">
              <div className="lg:sticky lg:top-24 bg-white rounded-xl border border-[var(--color-fdi-mist)] p-6 space-y-4">
              <h2
                className="text-sm font-semibold text-[var(--color-fdi-text)] uppercase tracking-wider"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Thông tin công ty
              </h2>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-[var(--color-fdi-surface)] flex items-center justify-center overflow-hidden shrink-0">
                  <LogoImage
                    src={job.employer.logo}
                    alt={job.employer.companyName}
                    className="h-full w-full object-contain p-1"
                    iconSize="h-6 w-6"
                  />
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/cong-ty/${job.employer.slug}`}
                    className="text-sm font-semibold text-[var(--color-fdi-text)] hover:text-[var(--color-fdi-primary)] transition-colors cursor-pointer"
                  >
                    {job.employer.companyName}
                  </Link>
                  {job.employer.industry && (
                    <p className="text-xs text-[var(--color-fdi-text-secondary)] mt-0.5">
                      {job.employer.industry}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2.5 text-sm text-[var(--color-fdi-text-secondary)]">
                {job.employer.companySize && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 shrink-0" />
                    <span>Quy mô: {job.employer.companySize}</span>
                  </div>
                )}
                {job.employer.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="line-clamp-2">{job.employer.address}</span>
                  </div>
                )}
                {job.employer.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 shrink-0" />
                    <a
                      href={job.employer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-fdi-primary)] hover:underline cursor-pointer truncate"
                    >
                      {job.employer.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
              </div>

              <Link
                href={`/cong-ty/${job.employer.slug}`}
                className="flex min-h-11 w-full items-center justify-center rounded-lg border border-[var(--color-fdi-primary)] px-4 py-2 text-center text-sm font-medium text-[var(--color-fdi-primary)] transition-colors hover:bg-[var(--color-fdi-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fdi-primary)]/30 cursor-pointer"
              >
                Xem trang công ty
              </Link>
            </div>

            {/* Suggested Jobs sidebar */}
            {suggestedJobs.length > 0 && (
              <div className="bg-white rounded-xl border border-[var(--color-fdi-mist)] p-5 space-y-3">
                <h2
                  className="text-sm font-semibold text-[var(--color-fdi-text)] uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Việc làm gợi ý
                </h2>
                <div className="space-y-2.5">
                  {suggestedJobs.map((sj: HomepageJob) => (
                    <Link
                      key={sj.id}
                      href={`/viec-lam/${sj.slug}`}
                      className={`block p-3 rounded-lg border transition-colors hover:bg-gray-50 cursor-pointer ${
                        sj.isFeatured
                          ? "border-amber-200 bg-amber-50/30"
                          : "border-[var(--color-fdi-mist)]"
                      }`}
                    >
                      <p className="text-sm font-medium text-[var(--color-fdi-text)] line-clamp-2 leading-snug">
                        {sj.title}
                      </p>
                      <p className="text-xs text-[var(--color-fdi-text-secondary)] mt-1">
                        {sj.employer.companyName}
                      </p>
                      {sj.salaryDisplay && (
                        <p className="text-xs text-[var(--color-fdi-primary)] font-medium mt-0.5">
                          {sj.salaryDisplay}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
                <Link
                  href={`/viec-lam?industry=${encodeURIComponent(job.industry || "")}`}
                  className="block text-center text-xs font-medium text-[var(--color-fdi-primary)] hover:underline cursor-pointer pt-1"
                >
                  Xem thêm việc làm →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Same Employer Jobs */}
        {sameEmployerJobs.length > 0 && (
          <section className="mt-10">
            <h2
              className="text-xl font-bold text-[var(--color-fdi-text)] mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Việc làm khác tại {job.employer.companyName}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sameEmployerJobs.map((sj: HomepageJob) => (
                <JobCard key={sj.id} job={sj} />
              ))}
            </div>
          </section>
        )}

        {/* Similar Jobs */}
        {similarJobs.length > 0 && (
          <section className="mt-12">
            <h2
              className="text-xl font-bold text-[var(--color-fdi-text)] mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Việc làm tương tự
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarJobs.map((sj: HomepageJob) => (
                <JobCard key={sj.id} job={sj} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ContentSection({ title, content }: { title: string; content: string }) {
  if (!content.trim()) return null;

  return (
    <div className="bg-white rounded-xl border border-[var(--color-fdi-mist)] p-6 sm:p-8">
      <h2
        className="text-lg font-bold text-[var(--color-fdi-text)] mb-4"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {title}
      </h2>
      <SafeRichContent content={content} allowHtml className="text-[var(--color-fdi-text-secondary)]" />
    </div>
  );
}
