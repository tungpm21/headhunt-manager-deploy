import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  CreditCard,
  Package,
  Star,
} from "lucide-react";
import { requireCompanyPortalSession } from "@/lib/company-portal-auth";
import { prisma } from "@/lib/prisma";
import { getSubscriptionDisplayPolicy } from "@/lib/subscription-display";

export const metadata = { title: "Thanh toán - Company Portal" };

const tierMeta: Record<string, { label: string; className: string }> = {
  BASIC: { label: "Basic", className: "bg-slate-100 text-slate-700" },
  STANDARD: { label: "Standard", className: "bg-blue-100 text-blue-700" },
  PREMIUM: { label: "Premium", className: "bg-amber-100 text-amber-700" },
  VIP: { label: "VIP", className: "bg-teal-100 text-teal-700" },
};

const statusMeta: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Đang hoạt động", className: "bg-emerald-100 text-emerald-700" },
  EXPIRED: { label: "Hết hạn", className: "bg-red-100 text-red-700" },
  CANCELLED: { label: "Đã hủy", className: "bg-slate-100 text-slate-700" },
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

export default async function CompanyBillingPage() {
  const session = await requireCompanyPortalSession();

  if (!session.capabilities.billing) {
    return (
      <div className="rounded-xl border border-border bg-surface p-12 text-center text-muted">
        <CreditCard className="mx-auto mb-3 h-10 w-10 opacity-40" />
        <p className="text-lg font-medium text-foreground">Workspace chưa có thanh toán</p>
        <p className="mt-1 text-sm">
          Thanh toán chỉ khả dụng khi Company Workspace được liên kết với Employer.
        </p>
      </div>
    );
  }

  const workspace = await prisma.companyWorkspace.findUnique({
    where: { id: session.workspaceId },
    select: {
      displayName: true,
      employer: {
        select: {
          companyName: true,
          subscription: true,
        },
      },
    },
  });
  const subscription = workspace?.employer?.subscription;

  if (!subscription) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-foreground">
            <CreditCard className="h-7 w-7 text-primary" />
            Thanh toán & quota
          </h1>
          <p className="mt-1 text-sm text-muted">
            Thông tin gói dịch vụ của {workspace?.displayName ?? "workspace"}.
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Chưa có gói dịch vụ</p>
              <p className="mt-1 text-sm">
                Vui lòng liên hệ admin FDIWork để kích hoạt hoặc gia hạn gói.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tier = tierMeta[subscription.tier] ?? tierMeta.BASIC;
  const status = statusMeta[subscription.status] ?? {
    label: subscription.status,
    className: "bg-slate-100 text-slate-700",
  };
  const quotaPercent =
    subscription.jobQuota > 0
      ? Math.min(100, Math.round((subscription.jobsUsed / subscription.jobQuota) * 100))
      : 0;
  const remaining = Math.max(subscription.jobQuota - subscription.jobsUsed, 0);
  const isExpired = subscription.status === "EXPIRED";
  const displayPolicy = getSubscriptionDisplayPolicy(subscription.tier);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold text-foreground">
          <CreditCard className="h-7 w-7 text-primary" />
          Thanh toán & quota
        </h1>
        <p className="mt-1 text-sm text-muted">
          Snapshot gói dịch vụ chỉ đọc cho {workspace?.employer?.companyName ?? workspace?.displayName}.
        </p>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border bg-primary px-6 py-5 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-white/75">Gói hiện tại</p>
              <div className="mt-1 flex items-center gap-2">
                <h2 className="text-3xl font-bold">{tier.label}</h2>
                {subscription.tier === "VIP" ? (
                  <Star className="h-6 w-6 fill-yellow-300 text-yellow-300" />
                ) : null}
              </div>
            </div>
            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${status.className}`}>
              {status.label}
            </span>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {isExpired ? (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Gói đã hết hạn</p>
                <p className="mt-1 text-xs">Liên hệ admin để gia hạn trước khi đăng tin mới.</p>
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard icon={Calendar} label="Ngày bắt đầu" value={formatDate(subscription.startDate)} />
            <InfoCard icon={Calendar} label="Ngày hết hạn" value={formatDate(subscription.endDate)} />
            <InfoCard
              icon={Package}
              label="Thời gian hiển thị mỗi tin"
              value={`${subscription.jobDuration} ngày`}
            />
          </div>

          <div className="rounded-xl border border-border bg-background p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <p className="font-semibold text-foreground">Quota đăng tin</p>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {subscription.jobsUsed}/{subscription.jobQuota}
              </p>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-border">
              <div
                className={`h-full rounded-full ${
                  quotaPercent >= 100
                    ? "bg-danger"
                    : quotaPercent >= 80
                      ? "bg-warning"
                      : "bg-primary"
                }`}
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted">Còn lại {remaining} tin.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Feature label="Hiển thị logo trên trang chủ" active={subscription.showLogo} />
            <Feature label="Banner slide VIP" active={subscription.showBanner} />
            <Feature label={`${subscription.jobQuota} tin tuyển dụng`} active />
            <Feature label={`${subscription.jobDuration} ngày hiển thị cho mỗi tin`} active />
          </div>

          <div className="rounded-xl border border-border bg-background p-5">
            <p className="text-sm font-semibold text-foreground">Ưu tiên hiển thị Logo/Banner</p>
            <p className="mt-1 text-sm text-muted">
              Gói hiện tại thuộc {displayPolicy.rankLabel}. Thứ tự ưu tiên public là VIP &gt; Premium &gt; Standard &gt; Basic.
            </p>
            <div className="mt-3 grid gap-2 text-xs text-muted sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-surface px-3 py-2">
                <span className="font-semibold text-foreground">Logo:</span>{" "}
                {subscription.showLogo
                  ? "được hiển thị trong các danh sách công ty đủ điều kiện."
                  : "chưa được bật cho gói/công ty này."}
              </div>
              <div className="rounded-lg border border-border bg-surface px-3 py-2">
                <span className="font-semibold text-foreground">Banner:</span>{" "}
                {subscription.showBanner
                  ? "đủ điều kiện vào carousel homepage, sắp xếp theo ưu tiên gói."
                  : "chưa được bật nên không vào banner homepage."}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted">
            Gói dịch vụ được quản lý bởi admin FDIWork. Vui lòng liên hệ admin để nâng cấp,
            gia hạn hoặc điều chỉnh quota.
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Feature({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-3">
      <CheckCircle2 className={`h-4 w-4 ${active ? "text-emerald-600" : "text-muted"}`} />
      <span className={`text-sm ${active ? "text-foreground" : "text-muted"}`}>{label}</span>
    </div>
  );
}
