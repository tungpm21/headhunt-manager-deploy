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

export const metadata = { title: "Billing - Company Portal" };

const tierMeta: Record<string, { label: string; className: string }> = {
  BASIC: { label: "Basic", className: "bg-slate-100 text-slate-700" },
  STANDARD: { label: "Standard", className: "bg-blue-100 text-blue-700" },
  PREMIUM: { label: "Premium", className: "bg-amber-100 text-amber-700" },
  VIP: { label: "VIP", className: "bg-teal-100 text-teal-700" },
};

const statusMeta: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Dang hoat dong", className: "bg-emerald-100 text-emerald-700" },
  EXPIRED: { label: "Het han", className: "bg-red-100 text-red-700" },
  CANCELLED: { label: "Da huy", className: "bg-slate-100 text-slate-700" },
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
        <p className="text-lg font-medium text-foreground">Workspace chua co billing</p>
        <p className="mt-1 text-sm">
          Billing chi kha dung khi Company Workspace duoc lien ket voi Employer.
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
            Billing & quota
          </h1>
          <p className="mt-1 text-sm text-muted">
            Thong tin goi dich vu cua {workspace?.displayName ?? "workspace"}.
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Chua co goi dich vu</p>
              <p className="mt-1 text-sm">
                Vui long lien he admin FDIWork de kich hoat hoac gia han goi.
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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold text-foreground">
          <CreditCard className="h-7 w-7 text-primary" />
          Billing & quota
        </h1>
        <p className="mt-1 text-sm text-muted">
          View-only subscription snapshot for {workspace?.employer?.companyName ?? workspace?.displayName}.
        </p>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border bg-primary px-6 py-5 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-white/75">Current plan</p>
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
                <p className="text-sm font-semibold">Goi da het han</p>
                <p className="mt-1 text-xs">Lien he admin de gia han truoc khi dang tin moi.</p>
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard icon={Calendar} label="Start date" value={formatDate(subscription.startDate)} />
            <InfoCard icon={Calendar} label="End date" value={formatDate(subscription.endDate)} />
            <InfoCard icon={Package} label="Job duration" value={`${subscription.jobDuration} ngay/tin`} />
          </div>

          <div className="rounded-xl border border-border bg-background p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <p className="font-semibold text-foreground">Quota dang tin</p>
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
            <p className="mt-2 text-sm text-muted">Con lai {remaining} tin.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Feature label="Hien logo tren trang chu" active={subscription.showLogo} />
            <Feature label="Banner slide VIP" active={subscription.showBanner} />
            <Feature label={`${subscription.jobQuota} tin tuyen dung`} active />
            <Feature label={`Moi tin hien thi ${subscription.jobDuration} ngay`} active />
          </div>

          <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted">
            Goi dich vu duoc quan ly boi admin FDIWork. Vui long lien he admin de nang cap,
            gia han hoac dieu chinh quota.
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
