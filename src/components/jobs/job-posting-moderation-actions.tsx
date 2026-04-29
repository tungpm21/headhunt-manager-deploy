"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  CheckCircle2,
  Eye,
  Loader2,
  MoreHorizontal,
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

type ActionState = "approve" | "reject" | "toggle" | "delete" | null;

export function JobPostingModerationActions({
  jobId,
  jobTitle,
  status,
  slug,
  compact = false,
}: {
  jobId: number;
  jobTitle: string;
  status: string;
  slug: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");
  const [activeAction, setActiveAction] = useState<ActionState>(null);

  const canApprove = ["PENDING", "REJECTED", "EXPIRED"].includes(status);
  const canReject = status === "PENDING";
  const canToggle = status === "APPROVED" || status === "PAUSED";
  const canPreviewPublic = ["APPROVED", "PAUSED", "EXPIRED"].includes(status);
  const previewHref = canPreviewPublic ? `/viec-lam/${slug}` : `/moderation/${jobId}/edit`;
  const disabled = isPending || activeAction !== null;
  const neutralButton =
    compact
      ? "inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-white text-foreground transition hover:border-primary/40 hover:text-primary"
      : "inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-white px-2.5 text-xs font-semibold text-foreground transition hover:border-primary/40 hover:text-primary";
  const dangerButton =
    compact
      ? "inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 bg-white text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      : "inline-flex h-8 items-center gap-1.5 rounded-md border border-red-200 bg-white px-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50";

  function runAction(
    action: Exclude<ActionState, null>,
    callback: () => Promise<{ success: boolean; message: string }>
  ) {
    setActiveAction(action);
    startTransition(async () => {
      const result = await callback();
      if (!result.success) {
        alert(result.message);
      }
      if (result.success && action === "reject") {
        setRejectMode(false);
        setReason("");
      }
      router.refresh();
      setActiveAction(null);
    });
  }

  function handleReject() {
    const normalizedReason = reason.trim();
    if (!normalizedReason) {
      alert("Vui lòng nhập lý do từ chối.");
      return;
    }

    runAction("reject", () => rejectJobPosting(jobId, normalizedReason));
  }

  function handleDelete() {
    if (!confirm(`Xóa bài đăng "${jobTitle}"?`)) {
      return;
    }

    runAction("delete", () => deleteAdminJobPosting(jobId));
  }

  function handleCompactReject() {
    const normalizedReason = window.prompt("Lý do từ chối bài đăng?")?.trim();
    if (!normalizedReason) {
      return;
    }

    runAction("reject", () => rejectJobPosting(jobId, normalizedReason));
  }

  if (compact) {
    const menuItemClass =
      "flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-foreground transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";
    const dangerMenuItemClass =
      "flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50";

    return (
      <div className="flex items-center justify-end gap-1.5">
        <Link
          href={previewHref}
          target={canPreviewPublic ? "_blank" : undefined}
          rel={canPreviewPublic ? "noopener noreferrer" : undefined}
          className={neutralButton}
          title="Preview"
          aria-label="Preview bài đăng"
        >
          <Eye className="h-3.5 w-3.5" />
        </Link>

        <details className="group relative">
          <summary
            className="inline-flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-md border border-border bg-white text-foreground transition hover:border-primary/40 hover:text-primary [&::-webkit-details-marker]:hidden"
            title="Thao tác"
            aria-label="Mở menu thao tác"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </summary>
          <div className="absolute right-0 top-9 z-30 w-44 overflow-hidden rounded-lg border border-border bg-white py-1 text-left shadow-lg">
            <Link href={`/moderation/${jobId}/edit`} className={menuItemClass}>
              <Pencil className="h-3.5 w-3.5" />
              Sửa bài
            </Link>

            {canApprove ? (
              <button
                type="button"
                onClick={() => runAction("approve", () => approveJobPosting(jobId))}
                disabled={disabled}
                className={menuItemClass}
              >
                {activeAction === "approve" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                )}
                {status === "REJECTED" ? "Duyệt lại" : status === "EXPIRED" ? "Đăng lại" : "Duyệt bài"}
              </button>
            ) : null}

            {canToggle ? (
              <button
                type="button"
                onClick={() => runAction("toggle", () => toggleAdminJobPostingVisibility(jobId))}
                disabled={disabled}
                className={menuItemClass}
              >
                {activeAction === "toggle" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : status === "APPROVED" ? (
                  <Pause className="h-3.5 w-3.5 text-amber-600" />
                ) : (
                  <Play className="h-3.5 w-3.5 text-emerald-600" />
                )}
                {status === "APPROVED" ? "Tạm ẩn" : "Hiện lại"}
              </button>
            ) : null}

            {canReject ? (
              <button
                type="button"
                onClick={handleCompactReject}
                disabled={disabled}
                className={dangerMenuItemClass}
              >
                <XCircle className="h-3.5 w-3.5" />
                Từ chối
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleDelete}
              disabled={disabled}
              className={dangerMenuItemClass}
            >
              {activeAction === "delete" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Xóa bài
            </button>
          </div>
        </details>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className={compact ? "flex flex-nowrap justify-end gap-1.5" : "flex flex-wrap justify-end gap-2"}>
        <Link
          href={previewHref}
          target={canPreviewPublic ? "_blank" : undefined}
          rel={canPreviewPublic ? "noopener noreferrer" : undefined}
          className={neutralButton}
          title="Preview"
          aria-label="Preview bài đăng"
        >
          <Eye className="h-3.5 w-3.5" />
          {compact ? null : "Preview"}
        </Link>

        <Link
          href={`/moderation/${jobId}/edit`}
          className={neutralButton}
          title="Sửa"
          aria-label="Sửa bài đăng"
        >
          <Pencil className="h-3.5 w-3.5" />
          {compact ? null : "Sửa"}
        </Link>

        {canApprove ? (
          <button
            type="button"
            onClick={() => runAction("approve", () => approveJobPosting(jobId))}
            disabled={disabled}
            className={
              compact
                ? "inline-flex h-8 w-8 items-center justify-center rounded-md border border-emerald-600 bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                : "inline-flex h-8 items-center gap-1.5 rounded-md border border-emerald-600 bg-emerald-600 px-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            }
            title={status === "REJECTED" ? "Duyệt lại" : status === "EXPIRED" ? "Đăng lại" : "Duyệt"}
            aria-label={status === "REJECTED" ? "Duyệt lại" : status === "EXPIRED" ? "Đăng lại" : "Duyệt"}
          >
            {activeAction === "approve" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            {compact ? null : status === "REJECTED" ? "Duyệt lại" : status === "EXPIRED" ? "Đăng lại" : "Duyệt"}
          </button>
        ) : null}

        {canToggle ? (
          <button
            type="button"
            onClick={() => runAction("toggle", () => toggleAdminJobPostingVisibility(jobId))}
            disabled={disabled}
            className={
              status === "APPROVED"
                ? compact
                  ? "inline-flex h-8 w-8 items-center justify-center rounded-md border border-amber-200 bg-amber-50 text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                  : "inline-flex h-8 items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                : compact
                  ? "inline-flex h-8 w-8 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                  : "inline-flex h-8 items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
            }
            title={status === "APPROVED" ? "Tạm ẩn" : "Hiện lại"}
            aria-label={status === "APPROVED" ? "Tạm ẩn" : "Hiện lại"}
          >
            {activeAction === "toggle" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : status === "APPROVED" ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            {compact ? null : status === "APPROVED" ? "Tạm ẩn" : "Hiện lại"}
          </button>
        ) : null}

        {canReject && !rejectMode ? (
          <button
            type="button"
            onClick={() => setRejectMode(true)}
            disabled={disabled}
            className={dangerButton}
            title="Từ chối"
            aria-label="Từ chối bài đăng"
          >
            <XCircle className="h-3.5 w-3.5" />
            {compact ? null : "Từ chối"}
          </button>
        ) : null}

        <button
          type="button"
          onClick={handleDelete}
          disabled={disabled}
          className={dangerButton}
          title="Xóa"
          aria-label="Xóa bài đăng"
        >
          {activeAction === "delete" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
          {compact ? null : "Xóa"}
        </button>
      </div>

      {canReject && rejectMode ? (
        <div className="flex w-full min-w-[280px] flex-col gap-2 rounded-lg border border-red-100 bg-red-50 p-2 sm:w-[360px]">
          <input
            type="text"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Lý do từ chối..."
            className="h-8 rounded-md border border-red-200 bg-white px-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-red-300"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setRejectMode(false);
                setReason("");
              }}
              disabled={disabled}
              className="h-8 rounded-md px-3 text-xs font-semibold text-muted transition hover:bg-white"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={disabled}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-red-600 px-3 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {activeAction === "reject" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Xác nhận
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
