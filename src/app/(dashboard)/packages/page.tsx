import Link from "next/link";
import { Package } from "lucide-react";
import {
  getEmployersForSubscriptionSelect,
  getSubscriptions,
} from "@/lib/moderation-actions";
import { SUBSCRIPTION_DISPLAY_POLICIES } from "@/lib/subscription-display";
import { AssignSubscriptionForm } from "./assign-form";
import { PackageSubscriptionTable } from "./package-subscription-table";

function buildPackagesHref(page: number, employerId?: number) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (employerId) params.set("employerId", String(employerId));
  return `/packages?${params.toString()}`;
}

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; employerId?: string }>;
}) {
  const params = await searchParams;
  const requestedPage = parseInt(params.page || "1", 10);
  const initialEmployerId = params.employerId
    ? parseInt(params.employerId, 10)
    : undefined;
  const [data, employers] = await Promise.all([
    getSubscriptions(requestedPage),
    getEmployersForSubscriptionSelect(),
  ]);
  const currentPage = data.page;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-foreground">
            <Package className="h-7 w-7 text-primary" />
            Quản lý gói dịch vụ
          </h1>
          <p className="mt-1 text-muted">{data.total} gói đã cấp</p>
        </div>
        {initialEmployerId ? (
          <Link
            href="/packages"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-background"
          >
            Bỏ chọn gói đang sửa
          </Link>
        ) : null}
      </div>

      <AssignSubscriptionForm
        employers={employers}
        initialEmployerId={initialEmployerId}
      />

      <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Quyền hiển thị public</p>
            <p className="text-xs text-muted">
              Thứ tự ưu tiên trên web: VIP &gt; Premium &gt; Standard &gt; Basic. Logo/Banner vẫn có thể bật tắt thủ công theo từng công ty.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {Object.values(SUBSCRIPTION_DISPLAY_POLICIES).map((policy) => (
            <div key={policy.tier} className="rounded-lg border border-border bg-background p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-foreground">{policy.label}</p>
                <span className="rounded-full bg-muted/15 px-2 py-0.5 text-[11px] font-semibold text-muted">
                  {policy.rankLabel}
                </span>
              </div>
              <p className="mt-2 min-h-10 text-xs text-muted">{policy.summary}</p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-semibold">
                <span className={`rounded-full px-2 py-0.5 ${policy.logoDefault ? "bg-blue-50 text-blue-700" : "bg-muted/10 text-muted"}`}>
                  Logo {policy.logoDefault ? "mặc định" : "tắt"}
                </span>
                <span className={`rounded-full px-2 py-0.5 ${policy.bannerDefault ? "bg-violet-50 text-violet-700" : "bg-muted/10 text-muted"}`}>
                  Banner {policy.bannerDefault ? "mặc định" : "tắt"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <PackageSubscriptionTable
        subscriptions={data.subs.map((sub) => ({
          ...sub,
          startDate: sub.startDate.toISOString(),
          endDate: sub.endDate.toISOString(),
        }))}
      />

      {data.totalPages > 1 ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            Trang <span className="font-semibold text-foreground">{currentPage}</span> /{" "}
            <span className="font-semibold text-foreground">{data.totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={buildPackagesHref(Math.max(1, currentPage - 1), initialEmployerId)}
              aria-disabled={currentPage <= 1}
              className={`rounded-lg border border-border px-3 py-2 font-semibold transition ${
                currentPage <= 1
                  ? "pointer-events-none opacity-50"
                  : "text-foreground hover:bg-background"
              }`}
            >
              Trước
            </Link>
            <Link
              href={buildPackagesHref(Math.min(data.totalPages, currentPage + 1), initialEmployerId)}
              aria-disabled={currentPage >= data.totalPages}
              className={`rounded-lg border border-border px-3 py-2 font-semibold transition ${
                currentPage >= data.totalPages
                  ? "pointer-events-none opacity-50"
                  : "text-foreground hover:bg-background"
              }`}
            >
              Sau
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
