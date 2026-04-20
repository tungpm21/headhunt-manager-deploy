import { notFound } from "next/navigation";
import type { Metadata } from "next";
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
} from "lucide-react";
import { getPublicJobBySlug, type HomepageJob } from "@/lib/public-actions";
import { JobCard } from "@/components/public/JobCard";
import { LogoImage } from "@/components/public/LogoImage";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicJobBySlug(slug);
  if (!result) return { title: "Việc làm không tồn tại" };
  return {
    title: `${result.job.title} - ${result.job.employer.companyName}`,
    description: result.job.description.slice(0, 160),
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
    <div className="min-h-screen bg-gray-50/50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-[var(--color-fdi-text-secondary)]">
            <Link
              href="/viec-lam"
              className="flex items-center gap-1 hover:text-[var(--color-fdi-primary)] transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              Việc làm
            </Link>
            <span>/</span>
            <span className="text-[var(--color-fdi-text)] font-medium truncate max-w-xs">
              {job.title}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Job Header Card */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="h-14 w-14 rounded-xl bg-[var(--color-fdi-surface)] flex items-center justify-center shrink-0 overflow-hidden">
                  <LogoImage
                    src={job.employer.logo}
                    alt={job.employer.companyName}
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
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-gray-50"
                      >
                        <item.icon className="h-4 w-4 text-[var(--color-fdi-primary)] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-[var(--color-fdi-text-secondary)] uppercase tracking-wider">
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
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-fdi-primary)] text-white font-semibold text-sm hover:bg-[var(--color-fdi-primary-hover)] transition-all hover:-translate-y-0.5 cursor-pointer"
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
            <div className="lg:sticky lg:top-24 bg-white rounded-xl border border-gray-100 p-6 space-y-4">
              <h3
                className="text-sm font-semibold text-[var(--color-fdi-text)] uppercase tracking-wider"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Thông tin công ty
              </h3>
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
                className="block w-full text-center px-4 py-2 rounded-lg border border-[var(--color-fdi-primary)] text-sm font-medium text-[var(--color-fdi-primary)] hover:bg-[var(--color-fdi-surface)] transition-colors cursor-pointer"
              >
                Xem trang công ty
              </Link>
            </div>

            {/* Suggested Jobs sidebar */}
            {suggestedJobs.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
                <h3
                  className="text-sm font-semibold text-[var(--color-fdi-text)] uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Việc làm gợi ý
                </h3>
                <div className="space-y-2.5">
                  {suggestedJobs.map((sj: HomepageJob) => (
                    <Link
                      key={sj.id}
                      href={`/viec-lam/${sj.slug}`}
                      className={`block p-3 rounded-lg border transition-colors hover:bg-gray-50 cursor-pointer ${sj.isFeatured
                          ? "border-amber-200 bg-amber-50/30"
                          : "border-gray-100"
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
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
      <h2
        className="text-lg font-bold text-[var(--color-fdi-text)] mb-4"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {title}
      </h2>
      <div
        className="prose prose-sm max-w-none text-[var(--color-fdi-text-secondary)] leading-relaxed whitespace-pre-line"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {content}
      </div>
    </div>
  );
}
