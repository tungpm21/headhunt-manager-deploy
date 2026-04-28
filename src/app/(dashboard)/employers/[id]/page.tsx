import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
  Briefcase,
  Package,
} from "lucide-react";
import {
  getEmployerById,
} from "@/lib/moderation-actions";
import { getWorkspaceForEmployer } from "@/lib/workspace";
import { EmployerStatusActions } from "../employer-status-actions";
import { EmployerDetailTabs } from "./employer-detail-tabs";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Hoạt động", className: "bg-emerald-100 text-emerald-700" },
  PENDING: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700" },
  SUSPENDED: { label: "Bị khóa", className: "bg-red-100 text-red-700" },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EmployerDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const employerId = parseInt(resolvedParams.id, 10);

  if (Number.isNaN(employerId)) {
    notFound();
  }

  const [employer, workspace] = await Promise.all([
    getEmployerById(employerId),
    getWorkspaceForEmployer(employerId),
  ]);

  if (!employer) {
    notFound();
  }

  const statusConfig = STATUS_CONFIG[employer.status] ?? {
    label: employer.status,
    className: "bg-gray-100 text-gray-600",
  };

  const serializedEmployer = {
    id: employer.id,
    email: employer.email,
    companyName: employer.companyName,
    logo: employer.logo,
    description: employer.description,
    industry: employer.industry,
    companySize: employer.companySize,
    address: employer.address,
    website: employer.website,
    phone: employer.phone,
    status: employer.status,
    slug: employer.slug,
    createdAt: employer.createdAt.toISOString(),
    updatedAt: employer.updatedAt.toISOString(),
    jobCount: employer._count.jobPostings,
    client: employer.client
      ? {
          id: employer.client.id,
          companyName: employer.client.companyName,
          industry: employer.client.industry,
          website: employer.client.website,
          address: employer.client.address,
          status: employer.client.status,
        }
      : null,
    subscription: employer.subscription
      ? {
          id: employer.subscription.id,
          tier: employer.subscription.tier,
          status: employer.subscription.status,
          jobQuota: employer.subscription.jobQuota,
          jobsUsed: employer.subscription.jobsUsed,
          jobDuration: employer.subscription.jobDuration,
          showLogo: employer.subscription.showLogo,
          showBanner: employer.subscription.showBanner,
          startDate: employer.subscription.startDate.toISOString(),
          endDate: employer.subscription.endDate.toISOString(),
          price: employer.subscription.price,
          createdAt: employer.subscription.createdAt.toISOString(),
        }
      : null,
  };

  const serializedJobPostings = employer.jobPostings.map((job: {
    id: number;
    title: string;
    slug: string;
    status: string;
    viewCount: number;
    applyCount: number;
    createdAt: Date;
    publishedAt: Date | null;
    expiresAt: Date | null;
    location: string | null;
    workType: string | null;
  }) => ({
    id: job.id,
    title: job.title,
    slug: job.slug,
    status: job.status,
    viewCount: job.viewCount,
    applyCount: job.applyCount,
    createdAt: job.createdAt.toISOString(),
    publishedAt: job.publishedAt?.toISOString() ?? null,
    expiresAt: job.expiresAt?.toISOString() ?? null,
    location: job.location,
    workType: job.workType,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Link
          href="/employers"
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 transition hover:bg-surface hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Nhà tuyển dụng
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground truncate">{employer.companyName}</span>
      </div>

      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 rounded-2xl bg-background border border-border flex items-center justify-center overflow-hidden shrink-0">
              {employer.logo ? (
                <img
                  src={employer.logo}
                  alt={employer.companyName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 className="h-9 w-9 text-primary" />
              )}
            </div>

            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{employer.companyName}</h1>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.className}`}
                >
                  {statusConfig.label}
                </span>
                <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-muted">
                  #{employer.id}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
                {employer.industry && (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    {employer.industry}
                  </span>
                )}
                {employer.address && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {employer.address}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  {employer.email}
                </span>
                {employer.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-4 w-4" />
                    {employer.phone}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs font-medium text-muted">
                  <Briefcase className="h-3.5 w-3.5" />
                  {employer._count.jobPostings} bài đăng
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs font-medium text-muted">
                  <Package className="h-3.5 w-3.5" />
                  {employer.subscription?.tier ?? "Chưa có gói"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <EmployerStatusActions
              employerId={employer.id}
              currentStatus={employer.status}
            />

            {employer.status === "ACTIVE" ? (
              <Link
                href={`/cong-ty/${employer.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/15"
              >
                <Globe className="h-4 w-4" />
                Xem trang công ty
              </Link>
            ) : (
              <span
                className="inline-flex items-center rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted"
                title={`/cong-ty/${employer.slug}`}
              >
                Trang công ty chưa public
              </span>
            )}
          </div>
        </div>
      </div>

      <EmployerDetailTabs
        employer={serializedEmployer}
        jobPostings={serializedJobPostings}
        workspaceMappingHref={
          workspace ? `/companies/${workspace.id}?tab=mapping` : "/companies"
        }
      />
    </div>
  );
}
