"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  CreditCard,
  FileText,
  ExternalLink,
  Eye,
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
  Link2,
  Clock3,
  PencilLine,
} from "lucide-react";

type TabKey = "jobs" | "subscription" | "info";

type EmployerDetailClient = {
  id: number;
  companyName: string;
  industry: string | null;
  website: string | null;
  address: string | null;
  status: string;
} | null;

type EmployerDetailSubscription = {
  id: number;
  tier: string;
  status: string;
  jobQuota: number;
  jobsUsed: number;
  jobDuration: number;
  showLogo: boolean;
  showBanner: boolean;
  startDate: string;
  endDate: string;
  price: number;
  createdAt: string;
} | null;

type EmployerDetailInfo = {
  id: number;
  email: string;
  companyName: string;
  logo: string | null;
  description: string | null;
  industry: string | null;
  companySize: string | null;
  address: string | null;
  website: string | null;
  phone: string | null;
  status: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  jobCount: number;
  client: EmployerDetailClient;
  subscription: EmployerDetailSubscription;
};

type EmployerJobPosting = {
  id: number;
  title: string;
  slug: string;
  status: string;
  viewCount: number;
  applyCount: number;
  createdAt: string;
  publishedAt: string | null;
  expiresAt: string | null;
  location: string | null;
  workType: string | null;
};

interface EmployerDetailTabsProps {
  employer: EmployerDetailInfo;
  jobPostings: EmployerJobPosting[];
  workspaceMappingHref: string;
}

const TABS: { key: TabKey; label: string; icon: typeof Briefcase }[] = [
  { key: "jobs", label: "Bài đăng", icon: Briefcase },
  { key: "subscription", label: "Gói dịch vụ", icon: CreditCard },
  { key: "info", label: "Thông tin", icon: FileText },
];

const JOB_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Nháp", className: "bg-slate-100 text-slate-700" },
  PENDING: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700" },
  APPROVED: { label: "Đang hiển thị", className: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Từ chối", className: "bg-red-100 text-red-700" },
  EXPIRED: { label: "Hết hạn", className: "bg-gray-100 text-gray-600" },
  PAUSED: { label: "Tạm ẩn", className: "bg-blue-100 text-blue-700" },
};

const TIER_CONFIG: Record<string, string> = {
  BASIC: "bg-gray-100 text-gray-700",
  STANDARD: "bg-blue-100 text-blue-700",
  PREMIUM: "bg-amber-100 text-amber-700",
  VIP: "bg-teal-100 text-teal-700",
};

const SUBSCRIPTION_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Hoạt động", className: "bg-emerald-100 text-emerald-700" },
  EXPIRED: { label: "Hết hạn", className: "bg-red-100 text-red-700" },
  CANCELLED: { label: "Đã hủy", className: "bg-gray-100 text-gray-600" },
};

const COMPANY_SIZE_LABELS: Record<string, string> = {
  SMALL: "Nhỏ",
  MEDIUM: "Vừa",
  LARGE: "Lớn",
  ENTERPRISE: "Tập đoàn",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("vi-VN");
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("vi-VN");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function normalizeWebsite(value: string) {
  return value.replace(/^https?:\/\//, "");
}

export function EmployerDetailTabs({
  employer,
  jobPostings,
  workspaceMappingHref,
}: EmployerDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("jobs");

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      <div className="border-b border-border bg-muted/10 p-2">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "bg-background text-foreground hover:bg-primary/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {activeTab === "jobs" && <JobPostingsTab jobPostings={jobPostings} />}
        {activeTab === "subscription" && (
          <SubscriptionTab
            employerId={employer.id}
            subscription={employer.subscription}
          />
        )}
        {activeTab === "info" && (
          <InfoTab employer={employer} workspaceMappingHref={workspaceMappingHref} />
        )}
      </div>
    </div>
  );
}

function JobPostingsTab({ jobPostings }: { jobPostings: EmployerJobPosting[] }) {
  if (jobPostings.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Chưa có bài đăng nào"
        description="Employer này chưa tạo tin tuyển dụng trên FDIWork."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Danh sách bài đăng</h3>
          <p className="text-sm text-muted">{jobPostings.length} bài đăng thuộc employer này</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-background border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">
                  Bài đăng
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">
                  Lượt xem
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">
                  Ứng tuyển
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted">
                  Ngày đăng
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted">
                  FDIWork
                </th>
              </tr>
            </thead>
            <tbody>
              {jobPostings.map((job) => {
                const statusConfig = JOB_STATUS_CONFIG[job.status] ?? {
                  label: job.status,
                  className: "bg-gray-100 text-gray-600",
                };
                const publicDate = job.publishedAt ?? job.createdAt;

                return (
                  <tr key={job.id} className="border-b border-border/60 last:border-b-0">
                    <td className="px-4 py-4 align-top">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{job.title}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                          {job.location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {job.location}
                            </span>
                          )}
                          {job.workType && (
                            <span className="inline-flex items-center gap-1">
                              <Clock3 className="h-3.5 w-3.5" />
                              {job.workType}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.className}`}
                      >
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top text-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5 text-muted" />
                        {job.viewCount}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top text-foreground">{job.applyCount}</td>
                    <td className="px-4 py-4 align-top text-muted">
                      <div>{formatDate(publicDate)}</div>
                      {job.expiresAt && (
                        <div className="text-xs">Hết hạn: {formatDate(job.expiresAt)}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 align-top text-right">
                      {job.status === "APPROVED" ? (
                        <Link
                          href={`/viec-lam/${job.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition hover:bg-primary/15"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Xem trên FDIWork
                        </Link>
                      ) : (
                        <span
                          className="inline-flex items-center rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted"
                          title={`/viec-lam/${job.slug}`}
                        >
                          Chưa public
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SubscriptionTab({
  employerId,
  subscription,
}: {
  employerId: number;
  subscription: EmployerDetailSubscription;
}) {
  if (!subscription) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={CreditCard}
          title="Chưa có gói dịch vụ"
          description="Employer này chưa được cấp subscription trên FDIWork."
        />
        <Link
          href={`/packages?employerId=${employerId}`}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
        >
          <CreditCard className="h-4 w-4" />
          Cấp gói ngay
        </Link>
      </div>
    );
  }

  const tierClassName = TIER_CONFIG[subscription.tier] ?? TIER_CONFIG.BASIC;
  const statusConfig = SUBSCRIPTION_STATUS_CONFIG[subscription.status] ?? {
    label: subscription.status,
    className: "bg-gray-100 text-gray-600",
  };
  const quotaRemaining = Math.max(subscription.jobQuota - subscription.jobsUsed, 0);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Gói dịch vụ hiện tại</h3>
            <p className="text-sm text-muted">
              Theo dõi quota, thời hạn và quyền lợi của employer này.
            </p>
          </div>
          <Link
            href={`/packages?employerId=${employerId}`}
            className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/15"
          >
            <CreditCard className="h-4 w-4" />
            Gia hạn gói
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Tier"
          value={
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tierClassName}`}>
              {subscription.tier}
            </span>
          }
          hint={
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.className}`}>
              {statusConfig.label}
            </span>
          }
        />
        <SummaryCard
          label="Quota"
          value={`${subscription.jobsUsed}/${subscription.jobQuota}`}
          hint={`Còn lại ${quotaRemaining} tin`}
        />
        <SummaryCard
          label="Thời hạn tin"
          value={`${subscription.jobDuration} ngày`}
          hint={`${formatDate(subscription.startDate)} → ${formatDate(subscription.endDate)}`}
        />
        <SummaryCard
          label="Giá gói"
          value={formatCurrency(subscription.price)}
          hint={`Tạo ngày ${formatDate(subscription.createdAt)}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-background p-5">
          <p className="text-sm font-semibold text-foreground mb-3">Quyền lợi đang bật</p>
          <div className="flex flex-wrap gap-2">
            <FeaturePill label={`Quota ${subscription.jobQuota} tin`} active />
            <FeaturePill label={`Hiển thị ${subscription.jobDuration} ngày/tin`} active />
            <FeaturePill label="Logo trang chủ" active={subscription.showLogo} />
            <FeaturePill label="Banner VIP" active={subscription.showBanner} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background p-5">
          <p className="text-sm font-semibold text-foreground mb-3">Lịch sử hiện có</p>
          <div className="space-y-3 text-sm">
            <HistoryRow label="Tạo gói" value={formatDateTime(subscription.createdAt)} />
            <HistoryRow label="Bắt đầu hiệu lực" value={formatDateTime(subscription.startDate)} />
            <HistoryRow label="Hết hạn" value={formatDateTime(subscription.endDate)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTab({
  employer,
  workspaceMappingHref,
}: {
  employer: EmployerDetailInfo;
  workspaceMappingHref: string;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Thông tin doanh nghiệp</h3>
          <p className="text-sm text-muted">
            Thông tin readonly cho trang công ty public và dữ liệu CRM liên quan.
          </p>
        </div>

        <Link
          href={`/employers/${employer.id}/edit`}
          className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/15"
        >
          <PencilLine className="h-4 w-4" />
          Chỉnh sửa thông tin
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InfoField label="Tên công ty" icon={Building2} value={employer.companyName} />
        <InfoField label="Email" icon={Mail} value={employer.email} />
        <InfoField label="Điện thoại" icon={Phone} value={employer.phone ?? "—"} />
        <InfoField label="Ngành nghề" icon={Building2} value={employer.industry ?? "—"} />
        <InfoField
          label="Quy mô"
          icon={Building2}
          value={
            employer.companySize
              ? COMPANY_SIZE_LABELS[employer.companySize] ?? employer.companySize
              : "—"
          }
        />
        <InfoField label="Địa chỉ" icon={MapPin} value={employer.address ?? "—"} />
        <InfoField
          label="Website"
          icon={Globe}
          value={
            employer.website ? (
              <a
                href={employer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all"
              >
                {normalizeWebsite(employer.website)}
              </a>
            ) : (
              "—"
            )
          }
        />
        <InfoField label="Slug public" icon={Link2} value={employer.slug} />
        <InfoField
          label="Ngày tạo"
          icon={Clock3}
          value={formatDateTime(employer.createdAt)}
        />
        <InfoField
          label="Cập nhật lần cuối"
          icon={Clock3}
          value={formatDateTime(employer.updatedAt)}
        />
      </div>

      <div className="rounded-xl border border-border bg-background p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                CRM Client mapping
              </p>
              <p className="text-sm text-muted">
                Mapping Employer/Client hiện được quản lý tập trung trong Company Workspace để tránh lệch dữ liệu legacy.
              </p>
            </div>

            {employer.client ? (
              <div className="space-y-1 text-sm">
                <Link
                  href={`/clients/${employer.client.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {employer.client.companyName}
                </Link>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                  {employer.client.industry && <span>{employer.client.industry}</span>}
                  {employer.client.address && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {employer.client.address}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">Chưa liên kết với Client nào trong CRM.</p>
            )}
          </div>

          <div className="shrink-0">
            <Link
              href={workspaceMappingHref}
              className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/15"
            >
              <Link2 className="h-4 w-4" />
              Mở Company Workspace
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
          Mô tả công ty
        </p>
        {employer.description ? (
          <div className="whitespace-pre-wrap text-sm leading-6 text-foreground">
            {employer.description}
          </div>
        ) : (
          <p className="text-sm text-muted italic">Chưa có mô tả công ty.</p>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">{label}</p>
      <div className="text-lg font-semibold text-foreground">{value}</div>
      <div className="mt-2 text-xs text-muted">{hint}</div>
    </div>
  );
}

function FeaturePill({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      {label}
    </span>
  );
}

function HistoryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

function InfoField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: typeof Building2;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center gap-2 text-muted mb-2">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-semibold uppercase tracking-wider">{label}</p>
      </div>
      <div className="text-sm text-foreground break-words">{value}</div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Briefcase;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-background px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </div>
  );
}
