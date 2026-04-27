"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Plus,
  Search,
} from "lucide-react";
import { assignSubscription } from "@/lib/moderation-actions";

const TIERS = ["BASIC", "STANDARD", "PREMIUM", "VIP"] as const;

type EmployerOption = {
  id: number;
  companyName: string;
  email: string;
  status: string;
  subscription: {
    tier: string;
    status: string;
    jobQuota: number;
    jobsUsed: number;
    jobDuration: number;
    endDate: Date;
    price: number;
    showLogo: boolean;
    showBanner: boolean;
  } | null;
};

export function AssignSubscriptionForm({
  employers,
  initialEmployerId,
}: {
  employers: EmployerOption[];
  initialEmployerId?: number;
}) {
  const router = useRouter();
  const initialSelectedId =
    initialEmployerId && employers.some((employer) => employer.id === initialEmployerId)
      ? String(initialEmployerId)
      : "";
  const [open, setOpen] = useState(Boolean(initialSelectedId));
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedEmployerId, setSelectedEmployerId] = useState(initialSelectedId);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const filteredEmployers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase().replace(/^#/, "");
    if (!normalizedQuery) return employers;

    return employers.filter((employer) => {
      const haystack = [
        employer.id.toString(),
        employer.companyName,
        employer.email,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [employers, query]);

  const selectedEmployer = employers.find(
    (employer) => employer.id.toString() === selectedEmployerId
  );
  const selectEmployers =
    selectedEmployer && !filteredEmployers.some((employer) => employer.id === selectedEmployer.id)
      ? [selectedEmployer, ...filteredEmployers]
      : filteredEmployers;
  const selectedSubscription = selectedEmployer?.subscription;

  async function handleSubmit(formData: FormData) {
    if (!selectedEmployerId) {
      setMessage({ type: "error", text: "Vui lòng chọn employer." });
      return;
    }

    setMessage(null);
    setLoading(true);
    const result = await assignSubscription(formData);
    setMessage({ type: result.success ? "success" : "error", text: result.message });
    if (result.success) {
      router.refresh();
      setTimeout(() => setOpen(false), 2000);
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-all shadow-sm"
      >
        <Plus className="h-4 w-4" />
        Cấp / Gia hạn gói
      </button>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
      <h3 className="font-semibold text-foreground">Cấp / Gia hạn gói dịch vụ</h3>

      {message && (
        <div
          className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
            message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {message.text}
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <label htmlFor="employer-search" className="block text-xs font-medium text-muted mb-1">
            Tìm employer theo tên, email hoặc ID
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              id="employer-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="VD: Samsung, hr@company.com hoặc #12"
              className="w-full rounded-lg border border-border px-9 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {selectedEmployer ? (
          <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm">
            <p className="font-medium text-foreground">
              #{selectedEmployer.id} · {selectedEmployer.companyName}
            </p>
            <p className="mt-0.5 text-xs text-muted">{selectedEmployer.email}</p>
            {selectedSubscription ? (
              <p className="mt-1 text-xs text-primary">
                Hiện tại: {selectedSubscription.tier} · {selectedSubscription.jobsUsed}/
                {selectedSubscription.jobQuota} tin · hạn{" "}
                {new Date(selectedSubscription.endDate).toLocaleDateString("vi-VN")}
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted">Chưa có gói dịch vụ.</p>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-background px-4 py-3 text-sm text-muted">
            Chưa chọn employer.
          </div>
        )}
      </div>

      <form
        key={selectedEmployerId || "empty"}
        action={handleSubmit}
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        <div className="col-span-2">
          <label className="block text-xs font-medium text-muted mb-1">Employer *</label>
          <select
            name="employerId"
            required
            value={selectedEmployerId}
            onChange={(event) => setSelectedEmployerId(event.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Chọn employer</option>
            {selectEmployers.map((employer) => (
              <option key={employer.id} value={employer.id}>
                #{employer.id} · {employer.companyName} · {employer.email}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1">Gói *</label>
          <select
            name="tier"
            required
            defaultValue={selectedSubscription?.tier ?? "BASIC"}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {TIERS.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1">Quota tin *</label>
          <input
            name="jobQuota"
            type="number"
            min={Math.max(1, selectedSubscription?.jobsUsed ?? 1)}
            required
            defaultValue={selectedSubscription?.jobQuota ?? 10}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1">Giá gói (VND)</label>
          <input
            name="price"
            type="number"
            min="0"
            step="1000"
            defaultValue={selectedSubscription?.price ?? 0}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1">Ngày/tin</label>
          <input
            name="jobDuration"
            type="number"
            min="1"
            defaultValue={selectedSubscription?.jobDuration ?? 30}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1">Số tháng cộng thêm</label>
          <input
            name="durationMonths"
            type="number"
            min="1"
            defaultValue="12"
            className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-end gap-4">
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <input
              type="checkbox"
              name="showLogo"
              value="true"
              defaultChecked={selectedSubscription?.showLogo ?? false}
              className="rounded"
            />
            Logo
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <input
              type="checkbox"
              name="showBanner"
              value="true"
              defaultChecked={selectedSubscription?.showBanner ?? false}
              className="rounded"
            />
            Banner
          </label>
        </div>
        <div className="col-span-2 flex items-end gap-2">
          <button
            type="submit"
            disabled={loading || !selectedEmployerId}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-all"
          >
            {loading ? "Đang xử lý..." : "Cấp / Gia hạn"}
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setMessage(null);
            }}
            className="px-4 py-2 rounded-lg text-sm text-muted hover:bg-border/50 transition-all"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
