"use client";

import { deleteJobPostingAction, toggleJobPostingStatus } from "@/lib/employer-actions";
import { Pause, Play, Trash2 } from "lucide-react";
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
  const [deleting, setDeleting] = useState(false);

  const canToggle = status === "APPROVED" || status === "PAUSED";

  async function handleToggle() {
    if (loading) return;
    setLoading(true);
    try {
      const result = await toggleJobPostingStatus(jobId);
      if (!result.success) {
        alert(result.message);
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (deleting) return;
    const confirmed = window.confirm(
      "Bạn chắc chắn muốn xoá tin này? Nếu tin đã có ứng viên, hệ thống sẽ chỉ tạm ẩn để giữ lịch sử."
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const result = await deleteJobPostingAction(jobId);
      alert(result.message);
      if (result.success && "deleted" in result && result.deleted) {
        router.push("/employer/job-postings");
      } else {
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {canToggle && (
        <button
          onClick={handleToggle}
          disabled={loading || deleting}
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
      )}
      <button
        onClick={handleDelete}
        disabled={loading || deleting}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-all disabled:opacity-50"
      >
        {deleting ? (
          <div className="h-4 w-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        Xoá tin
      </button>
    </>
  );
}
