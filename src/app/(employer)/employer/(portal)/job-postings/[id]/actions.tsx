"use client";

import { toggleJobPostingStatus } from "@/lib/employer-actions";
import { Pause, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function JobActionButtons({
  jobId,
  status,
}: {
  jobId: number;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const canToggle = status === "APPROVED" || status === "PAUSED";

  async function handleToggle() {
    setLoading(true);
    const result = await toggleJobPostingStatus(jobId);
    if (!result.success) {
      alert(result.message);
    }
    router.refresh();
    setLoading(false);
  }

  if (!canToggle) return null;

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${
        status === "APPROVED"
          ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
      }`}
    >
      {loading ? (
        <div className="h-4 w-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : status === "APPROVED" ? (
        <>
          <Pause className="h-4 w-4" />
          Tạm ẩn
        </>
      ) : (
        <>
          <Play className="h-4 w-4" />
          Bật lại
        </>
      )}
    </button>
  );
}
