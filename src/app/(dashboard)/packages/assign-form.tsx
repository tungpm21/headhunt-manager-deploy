"use client";

import { useState } from "react";
import { assignSubscription } from "@/lib/moderation-actions";
import { useRouter } from "next/navigation";
import { Plus, AlertCircle, CheckCircle2 } from "lucide-react";

const TIERS = ["BASIC", "STANDARD", "PREMIUM", "VIP"];

export function AssignSubscriptionForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
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
        <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
          message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
        }`}>
          {message.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      <form action={handleSubmit} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted mb-1">Employer ID *</label>
          <input
            name="employerId"
            type="number"
            required
            placeholder="VD: 1"
            className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1">Gói *</label>
          <select name="tier" required className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
            {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1">Quota tin *</label>
          <input
            name="jobQuota"
            type="number"
            min="1"
            required
            defaultValue="10"
            className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1">Ngày/tin</label>
          <input
            name="jobDuration"
            type="number"
            min="1"
            defaultValue="30"
            className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1">Số tháng</label>
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
            <input type="checkbox" name="showLogo" value="true" className="rounded" />
            Logo
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <input type="checkbox" name="showBanner" value="true" className="rounded" />
            Banner
          </label>
        </div>
        <div className="col-span-2 flex items-end gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-all"
          >
            {loading ? "Đang xử lý..." : "Cấp gói"}
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); setMessage(null); }}
            className="px-4 py-2 rounded-lg text-sm text-muted hover:bg-border/50 transition-all"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
