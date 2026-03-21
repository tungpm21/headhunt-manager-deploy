"use client";

import { useState } from "react";
import { approveJobPosting, rejectJobPosting } from "@/lib/moderation-actions";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";

export function ModerationActions({ jobId }: { jobId: number }) {
  const router = useRouter();
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    const result = await approveJobPosting(jobId);
    if (!result.success) alert(result.message);
    router.refresh();
    setLoading(false);
  }

  async function handleReject() {
    if (!reason.trim()) {
      alert("Vui lòng nhập lý do từ chối.");
      return;
    }
    setLoading(true);
    const result = await rejectJobPosting(jobId, reason);
    if (!result.success) alert(result.message);
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleApprove}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-all"
      >
        <CheckCircle2 className="h-4 w-4" />
        Duyệt
      </button>

      {rejectMode ? (
        <div className="flex items-center gap-2 flex-1">
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Lý do từ chối..."
            className="flex-1 px-3 py-2 rounded-lg border border-red-200 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <button
            onClick={handleReject}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-all"
          >
            Xác nhận
          </button>
          <button
            onClick={() => setRejectMode(false)}
            className="px-3 py-2 rounded-lg text-sm text-muted hover:bg-border/50 transition-all"
          >
            Hủy
          </button>
        </div>
      ) : (
        <button
          onClick={() => setRejectMode(true)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-all"
        >
          <XCircle className="h-4 w-4" />
          Từ chối
        </button>
      )}
    </div>
  );
}
