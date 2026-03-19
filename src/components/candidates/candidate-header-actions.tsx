"use client";

import { useTransition } from "react";
import { deleteCandidateAction, updateCandidateStatusAction } from "@/lib/actions";
import { CandidateStatus } from "@prisma/client";
import { Trash2, Edit, Loader2, ChevronDown } from "lucide-react";
import Link from "next/link";

interface Props {
  candidateId: number;
  currentStatus: CandidateStatus;
}

const STATUS_LABELS: Record<CandidateStatus, string> = {
  AVAILABLE: "Sẵn sàng",
  EMPLOYED: "Đã có việc",
  INTERVIEWING: "Đang PV",
  BLACKLIST: "Tạm ngưng",
};

export function CandidateHeaderActions({ candidateId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hồ sơ ứng viên này? (Dữ liệu vẫn có thể được khôi phục bởi Admin)")) {
      startTransition(async () => {
        await deleteCandidateAction(candidateId);
      });
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as CandidateStatus;
    if (newStatus === currentStatus) return;
    startTransition(async () => {
      await updateCandidateStatusAction(candidateId, newStatus);
    });
  };

  return (
    <div className="flex items-center gap-3">
      {/* Nút chọn Status */}
      <div className="relative">
        <select
          value={currentStatus}
          onChange={handleStatusChange}
          disabled={isPending}
          className={`appearance-none rounded-lg border px-4 py-2 pr-8 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/30 ${
            currentStatus === "AVAILABLE"
              ? "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
              : currentStatus === "EMPLOYED"
              ? "border-blue-500/30 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
              : currentStatus === "INTERVIEWING"
              ? "border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
              : "border-slate-500/30 bg-slate-50 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400"
          }`}
        >
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val} className="text-foreground bg-background">
              {label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none opacity-50" />
      </div>

      <Link
        href={`/candidates/${candidateId}/edit`}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-border/50 transition-colors"
      >
        <Edit className="h-4 w-4" />
        Sửa
      </Link>
      
      <button
        type="button"
        disabled={isPending}
        onClick={handleDelete}
        className="inline-flex items-center gap-2 rounded-lg border border-danger/20 bg-danger/10 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        Xóa
      </button>
    </div>
  );
}
