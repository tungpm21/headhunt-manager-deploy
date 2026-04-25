import Link from "next/link";
import {
  getEmployersForSubscriptionSelect,
  getSubscriptions,
} from "@/lib/moderation-actions";
import { Package } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { AssignSubscriptionForm } from "./assign-form";

const TIER_COLORS: Record<string, string> = {
  BASIC: "bg-gray-100 text-gray-700",
  STANDARD: "bg-blue-100 text-blue-700",
  PREMIUM: "bg-amber-100 text-amber-700",
  VIP: "bg-teal-100 text-teal-700",
};

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; employerId?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const [data, employers] = await Promise.all([
    getSubscriptions(page),
    getEmployersForSubscriptionSelect(),
  ]);
  const initialEmployerId = params.employerId
    ? parseInt(params.employerId)
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Package className="h-7 w-7 text-primary" />
            Quản lý Gói dịch vụ
          </h1>
          <p className="text-muted mt-1">{data.total} gói đã cấp</p>
        </div>
      </div>

      {/* Assign Form */}
      <AssignSubscriptionForm
        employers={employers}
        initialEmployerId={initialEmployerId}
      />

      {/* Subscriptions Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-background border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted uppercase">Công ty</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted uppercase">Gói</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted uppercase">Quota</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted uppercase">Giá</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted uppercase">Thời hạn tin</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted uppercase">Hiệu lực</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted uppercase">Trạng thái</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted uppercase">Quyền lợi</th>
              </tr>
            </thead>
            <tbody>
              {data.subs.map((sub: {
                id: number;
                tier: string;
                status: string;
                jobsUsed: number;
                jobQuota: number;
                jobDuration: number;
                startDate: Date;
                endDate: Date;
                price: number;
                showLogo: boolean;
                showBanner: boolean;
                employer: {
                  id: number;
                  companyName: string;
                  email: string;
                  slug: string;
                };
              }) => {
                const isExpired = sub.status === "EXPIRED" || new Date(sub.endDate) < new Date();
                return (
                  <tr key={sub.id} className="border-b border-border/50 hover:bg-background/50">
                    <td className="py-3 px-4">
                      <Link
                        href={`/employers/${sub.employer.id}`}
                        className="font-medium text-foreground transition hover:text-primary"
                      >
                        {sub.employer.companyName}
                      </Link>
                      <p className="text-xs text-muted">#{sub.employer.id} · {sub.employer.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${TIER_COLORS[sub.tier] ?? TIER_COLORS.BASIC}`}>
                        {sub.tier}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">
                      {sub.jobsUsed}/{sub.jobQuota}
                    </td>
                    <td className="py-3 px-4 text-muted">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                        maximumFractionDigits: 0,
                      }).format(sub.price)}
                    </td>
                    <td className="py-3 px-4 text-muted">{sub.jobDuration} ngày</td>
                    <td className="py-3 px-4 text-xs text-muted">
                      {format(new Date(sub.startDate), "dd/MM/yy", { locale: vi })} → {format(new Date(sub.endDate), "dd/MM/yy", { locale: vi })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium ${isExpired ? "text-red-500" : "text-emerald-600"}`}>
                        {isExpired ? "Hết hạn" : "Hoạt động"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted">
                      {sub.showLogo && "🏷️ Logo "}
                      {sub.showBanner && "🎯 Banner"}
                      {!sub.showLogo && !sub.showBanner && "—"}
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
