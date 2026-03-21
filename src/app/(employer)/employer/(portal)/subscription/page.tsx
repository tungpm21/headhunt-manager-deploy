import { getSubscriptionData } from "@/lib/employer-actions";
import { CreditCard, Calendar, Package, BarChart3, Star, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  BASIC: { label: "Basic", color: "text-gray-600", bg: "bg-gray-100" },
  STANDARD: { label: "Standard", color: "text-blue-600", bg: "bg-blue-100" },
  PREMIUM: { label: "Premium", color: "text-amber-600", bg: "bg-amber-100" },
  VIP: { label: "VIP", color: "text-teal-600", bg: "bg-teal-100" },
};

export default async function SubscriptionPage() {
  const employer = await getSubscriptionData();
  const sub = employer?.subscription;

  if (!sub) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <CreditCard className="h-7 w-7 text-teal-600" />
          Gói dịch vụ
        </h1>

        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Chưa có gói dịch vụ</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Tài khoản của bạn chưa được cấp gói dịch vụ. Vui lòng liên hệ admin FDIWork để được tư vấn
            và kích hoạt gói phù hợp.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-50 text-teal-700 text-sm font-medium">
            <span>📧</span> admin@fdiwork.com
          </div>
        </div>
      </div>
    );
  }

  const tier = TIER_CONFIG[sub.tier] ?? TIER_CONFIG.BASIC;
  const quotaPercent = sub.jobQuota > 0 ? (sub.jobsUsed / sub.jobQuota) * 100 : 0;
  const isExpired = sub.status === "EXPIRED" || new Date(sub.endDate) < new Date();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
        <CreditCard className="h-7 w-7 text-teal-600" />
        Gói dịch vụ
      </h1>

      {/* Tier Card */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-teal-100">Gói hiện tại</p>
              <h2 className="text-3xl font-bold mt-1 flex items-center gap-2">
                {tier.label}
                {sub.tier === "VIP" && <Star className="h-6 w-6 text-yellow-300 fill-yellow-300" />}
              </h2>
            </div>
            <div className={`h-14 w-14 rounded-xl ${tier.bg} flex items-center justify-center`}>
              <Package className={`h-7 w-7 ${tier.color}`} />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          {isExpired && (
            <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-700">Gói đã hết hạn</p>
                <p className="text-xs text-red-500 mt-1">Liên hệ admin để gia hạn.</p>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500">Ngày bắt đầu</span>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                {format(new Date(sub.startDate), "dd/MM/yyyy", { locale: vi })}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500">Ngày hết hạn</span>
              </div>
              <p className={`text-sm font-semibold ${isExpired ? "text-red-600" : "text-gray-800"}`}>
                {format(new Date(sub.endDate), "dd/MM/yyyy", { locale: vi })}
              </p>
            </div>
          </div>

          {/* Quota */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Quota đăng tin</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">
                {sub.jobsUsed}/{sub.jobQuota}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  quotaPercent >= 100
                    ? "bg-red-500"
                    : quotaPercent >= 80
                    ? "bg-amber-500"
                    : "bg-gradient-to-r from-teal-500 to-emerald-500"
                }`}
                style={{ width: `${Math.min(quotaPercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Còn lại {Math.max(sub.jobQuota - sub.jobsUsed, 0)} tin • Thời hạn tin: {sub.jobDuration} ngày
            </p>
          </div>

          {/* Features */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Quyền lợi gói</p>
            <div className="grid grid-cols-2 gap-3">
              <Feature label="Hiện logo trang chủ" active={sub.showLogo} />
              <Feature label="Banner slide VIP" active={sub.showBanner} />
              <Feature label={`${sub.jobQuota} tin tuyển dụng`} active={true} />
              <Feature label={`Hiển thị ${sub.jobDuration} ngày/tin`} active={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm ${active ? "text-emerald-500" : "text-gray-300"}`}>
        {active ? "✓" : "✗"}
      </span>
      <span className={`text-sm ${active ? "text-gray-700" : "text-gray-400"}`}>
        {label}
      </span>
    </div>
  );
}
