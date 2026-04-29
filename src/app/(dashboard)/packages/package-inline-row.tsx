"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Pencil, Save } from "lucide-react";
import { updateSubscriptionInline } from "@/lib/moderation-actions";

const TIERS = ["BASIC", "STANDARD", "PREMIUM", "VIP"] as const;
const STATUSES = ["ACTIVE", "EXPIRED", "CANCELLED"] as const;

const TIER_COLORS: Record<string, string> = {
  BASIC: "bg-slate-100 text-slate-700 ring-slate-200",
  STANDARD: "bg-blue-50 text-blue-700 ring-blue-200",
  PREMIUM: "bg-amber-50 text-amber-700 ring-amber-200",
  VIP: "bg-teal-50 text-teal-700 ring-teal-200",
};

const controlClass =
  "min-h-9 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

export type PackageSubscriptionRowData = {
  id: number;
  tier: string;
  status: string;
  jobsUsed: number;
  jobQuota: number;
  jobDuration: number;
  startDate: string;
  endDate: string;
  price: number;
  showLogo: boolean;
  showBanner: boolean;
  employer: {
    id: number;
    companyName: string;
    email: string;
    slug: string;
  };
};

type DraftState = {
  tier: string;
  status: string;
  jobQuota: string;
  jobDuration: string;
  endDate: string;
  price: string;
  showLogo: boolean;
  showBanner: boolean;
};

function toDateInputValue(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function buildInitialDraft(subscription: PackageSubscriptionRowData): DraftState {
  return {
    tier: subscription.tier,
    status: subscription.status,
    jobQuota: String(subscription.jobQuota),
    jobDuration: String(subscription.jobDuration),
    endDate: toDateInputValue(subscription.endDate),
    price: String(Math.trunc(subscription.price)),
    showLogo: subscription.showLogo,
    showBanner: subscription.showBanner,
  };
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN");
}

function ResultMessage({ result }: { result: { success: boolean; message: string } | null }) {
  if (!result) return null;

  const Icon = result.success ? CheckCircle2 : AlertCircle;
  return (
    <p className={`mt-2 flex items-center justify-end gap-1 text-xs font-semibold ${result.success ? "text-emerald-600" : "text-red-600"}`}>
      <Icon className="h-3.5 w-3.5" />
      {result.message}
    </p>
  );
}

function StatusPreview({
  status,
  isExpired,
}: {
  status: string;
  isExpired: boolean;
}) {
  if (status === "CANCELLED") {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
        Đã hủy
      </span>
    );
  }

  if (isExpired) {
    return (
      <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-200">
        Hết hạn
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
      Đang hiệu lực
    </span>
  );
}

export function PackageInlineRow({
  subscription,
  mode,
  onEditMode,
}: {
  subscription: PackageSubscriptionRowData;
  mode: "preview" | "edit";
  onEditMode: () => void;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftState>(() => buildInitialDraft(subscription));
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const draftEndDate = draft.endDate ? new Date(`${draft.endDate}T23:59:59.999`) : new Date(subscription.endDate);
  const isExpired = draft.status === "EXPIRED" || draftEndDate < new Date();
  const quotaPercent = Math.min(100, Math.round((subscription.jobsUsed / Math.max(1, subscription.jobQuota)) * 100));

  function updateDraft<K extends keyof DraftState>(key: K, value: DraftState[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setResult(null);
  }

  function handleSave() {
    const formData = new FormData();
    formData.set("subscriptionId", String(subscription.id));
    formData.set("employerId", String(subscription.employer.id));
    formData.set("tier", draft.tier);
    formData.set("status", draft.status);
    formData.set("jobQuota", draft.jobQuota);
    formData.set("jobDuration", draft.jobDuration);
    formData.set("endDate", draft.endDate);
    formData.set("price", draft.price);
    formData.set("showLogo", String(draft.showLogo));
    formData.set("showBanner", String(draft.showBanner));

    startTransition(() => {
      void updateSubscriptionInline(formData).then((nextResult) => {
        setResult(nextResult);
        if (nextResult.success) router.refresh();
      });
    });
  }

  if (mode === "preview") {
    return (
      <tr className="border-b border-border/50 align-middle transition hover:bg-background/50">
        <td className="px-4 py-3">
          <Link
            href={`/companies?role=employer&search=${subscription.employer.id}`}
            className="font-semibold text-foreground transition hover:text-primary"
          >
            {subscription.employer.companyName}
          </Link>
          <p className="mt-0.5 text-xs text-muted">#{subscription.employer.id} · {subscription.employer.email}</p>
        </td>
        <td className="px-3 py-3">
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${TIER_COLORS[subscription.tier] ?? TIER_COLORS.BASIC}`}>
            {subscription.tier}
          </span>
        </td>
        <td className="px-3 py-3">
          <p className="text-sm font-semibold text-foreground">
            {subscription.jobsUsed}/{subscription.jobQuota}
          </p>
          <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-primary" style={{ width: `${quotaPercent}%` }} />
          </div>
        </td>
        <td className="px-3 py-3 font-medium text-foreground">{formatMoney(subscription.price)}</td>
        <td className="px-3 py-3 text-muted">{subscription.jobDuration} ngày</td>
        <td className="px-3 py-3">
          <p className="font-medium text-foreground">{formatDate(subscription.endDate)}</p>
          <p className="mt-0.5 text-xs text-muted">Từ {formatDate(subscription.startDate)}</p>
        </td>
        <td className="px-3 py-3">
          <StatusPreview status={subscription.status} isExpired={subscription.status === "EXPIRED" || new Date(subscription.endDate) < new Date()} />
        </td>
        <td className="px-3 py-3">
          <div className="flex flex-wrap gap-1.5">
            {subscription.showLogo ? (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">Logo</span>
            ) : null}
            {subscription.showBanner ? (
              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700">Banner</span>
            ) : null}
            {!subscription.showLogo && !subscription.showBanner ? (
              <span className="text-xs text-muted">Không có</span>
            ) : null}
          </div>
        </td>
        <td className="px-4 py-3 text-right">
          <button
            type="button"
            onClick={onEditMode}
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-foreground transition hover:bg-background hover:text-primary"
          >
            <Pencil className="h-3.5 w-3.5" />
            Sửa
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-border/50 align-top transition hover:bg-background/50">
      <td className="px-4 py-3">
        <Link
          href={`/companies?role=employer&search=${subscription.employer.id}`}
          className="font-semibold text-foreground transition hover:text-primary"
        >
          {subscription.employer.companyName}
        </Link>
        <p className="mt-0.5 text-xs text-muted">#{subscription.employer.id} · {subscription.employer.email}</p>
      </td>
      <td className="px-3 py-3">
        <select value={draft.tier} onChange={(event) => updateDraft("tier", event.target.value)} className={controlClass}>
          {TIERS.map((tier) => (
            <option key={tier} value={tier}>{tier}</option>
          ))}
        </select>
      </td>
      <td className="px-3 py-3">
        <input
          type="number"
          min={Math.max(1, subscription.jobsUsed)}
          value={draft.jobQuota}
          onChange={(event) => updateDraft("jobQuota", event.target.value)}
          className={controlClass}
        />
        <p className="mt-1 text-[11px] font-medium text-muted">Đã dùng {subscription.jobsUsed}</p>
      </td>
      <td className="px-3 py-3">
        <input
          type="number"
          min="0"
          step="1000"
          value={draft.price}
          onChange={(event) => updateDraft("price", event.target.value)}
          className={controlClass}
        />
      </td>
      <td className="px-3 py-3">
        <input
          type="number"
          min="1"
          value={draft.jobDuration}
          onChange={(event) => updateDraft("jobDuration", event.target.value)}
          className={controlClass}
        />
      </td>
      <td className="px-3 py-3">
        <input
          type="date"
          value={draft.endDate}
          onChange={(event) => updateDraft("endDate", event.target.value)}
          className={controlClass}
        />
        <p className="mt-1 text-[11px] font-medium text-muted">
          Từ {formatDate(subscription.startDate)}
        </p>
      </td>
      <td className="px-3 py-3">
        <select value={draft.status} onChange={(event) => updateDraft("status", event.target.value)} className={controlClass}>
          {STATUSES.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <p className={`mt-1 text-[11px] font-semibold ${isExpired ? "text-red-500" : "text-emerald-600"}`}>
          {isExpired ? "Hết hạn" : "Đang hiệu lực"}
        </p>
      </td>
      <td className="px-3 py-3">
        <div className="space-y-2 rounded-lg border border-border bg-background px-3 py-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <input type="checkbox" checked={draft.showLogo} onChange={(event) => updateDraft("showLogo", event.target.checked)} />
            Logo
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <input type="checkbox" checked={draft.showBanner} onChange={(event) => updateDraft("showBanner", event.target.checked)} />
            Banner
          </label>
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-xs font-semibold text-white transition hover:bg-primary-hover active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-3.5 w-3.5" />
          {isPending ? "Đang lưu" : "Lưu"}
        </button>
        <ResultMessage result={result} />
      </td>
    </tr>
  );
}
