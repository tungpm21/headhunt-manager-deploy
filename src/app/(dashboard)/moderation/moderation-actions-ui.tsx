"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  Pause,
  Pencil,
  Play,
  Trash2,
  XCircle,
} from "lucide-react";
import { approveJobPosting, rejectJobPosting } from "@/lib/moderation-actions";
import {
  deleteAdminJobPosting,
  toggleAdminJobPostingVisibility,
} from "@/lib/admin-job-posting-actions";

export function ModerationActions({
  jobId,
  jobTitle,
  status,
}: {
  jobId: number;
  jobTitle: string;
  status: string;
}) {
  const router = useRouter();
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");
  const [loadingAction, setLoadingAction] = useState<
    "approve" | "reject" | "toggle" | "delete" | null
  >(null);

  const canApprove = ["PENDING", "REJECTED", "EXPIRED"].includes(status);
  const canReject = status === "PENDING";
  const canToggle = status === "APPROVED" || status === "PAUSED";

  function isLoading(action: typeof loadingAction) {
    return loadingAction === action;
  }

  async function handleApprove() {
    setLoadingAction("approve");
    const result = await approveJobPosting(jobId);
    if (!result.success) alert(result.message);
    router.refresh();
    setLoadingAction(null);
  }

  async function handleReject() {
    if (!reason.trim()) {
      alert("Vui lòng nhập lý do từ chối.");
      return;
    }

    setLoadingAction("reject");
    const result = await rejectJobPosting(jobId, reason);
    if (!result.success) {
      alert(result.message);
    } else {
      setRejectMode(false);
      setReason("");
    }
    router.refresh();
    setLoadingAction(null);
  }

  async function handleToggle() {
    setLoadingAction("toggle");
    const result = await toggleAdminJobPostingVisibility(jobId);
    if (!result.success) alert(result.message);
    router.refresh();
    setLoadingAction(null);
  }

  async function handleDelete() {
    if (!confirm(`Xóa bài đăng "${jobTitle}"?`)) {
      return;
    }

    setLoadingAction("delete");
    const result = await deleteAdminJobPosting(jobId);
    if (!result.success) alert(result.message);
    router.refresh();
    setLoadingAction(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/moderation/${jobId}/edit`}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-background"
        >
          <Pencil className="h-4 w-4" />
          Sửa
        </Link>

        {canApprove ? (
          <button
            onClick={handleApprove}
            disabled={loadingAction !== null}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
          >
            {isLoading("approve") ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {status === "REJECTED"
              ? "Duyệt lại"
              : status === "EXPIRED"
                ? "Đăng lại"
                : "Duyệt"}
          </button>
        ) : null}

        {canToggle ? (
          <button
            onClick={handleToggle}
            disabled={loadingAction !== null}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 ${
              status === "APPROVED"
                ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            {isLoading("toggle") ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : status === "APPROVED" ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {status === "APPROVED" ? "Tạm ẩn" : "Bật lại"}
          </button>
        ) : null}

        {canReject && !rejectMode ? (
          <button
            onClick={() => setRejectMode(true)}
            disabled={loadingAction !== null}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50 disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
            Từ chối
          </button>
        ) : null}

        <button
          onClick={handleDelete}
          disabled={loadingAction !== null}
          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50 disabled:opacity-50"
        >
          {isLoading("delete") ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Xóa
        </button>
      </div>

      {canReject && rejectMode ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Lý do từ chối..."
            className="min-w-[260px] flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <button
            onClick={handleReject}
            disabled={loadingAction !== null}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading("reject") ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Xác nhận từ chối
          </button>
          <button
            onClick={() => {
              setRejectMode(false);
              setReason("");
            }}
            disabled={loadingAction !== null}
            className="rounded-lg px-3 py-2 text-sm text-muted transition-all hover:bg-border/50 disabled:opacity-50"
          >
            Hủy
          </button>
        </div>
      ) : null}
    </div>
  );
}
