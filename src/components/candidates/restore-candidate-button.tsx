"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw, Trash2 } from "lucide-react";
import { permanentlyDeleteCandidateAction, restoreCandidateAction } from "@/lib/actions";

export function RestoreCandidateButton({ candidateId }: { candidateId: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={isPending || isDeleting}
        onClick={() => {
          startTransition(async () => {
            const result = await restoreCandidateAction(candidateId);
            if (result?.error) window.alert(result.error);
            else router.refresh();
          });
        }}
        className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/15 disabled:opacity-60"
      >
        <RotateCcw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
        {isPending ? "Đang khôi phục..." : "Khôi phục"}
      </button>
      <button
        type="button"
        disabled={isPending || isDeleting}
        onClick={() => {
          if (!window.confirm("Xóa triệt để ứng viên này? Thao tác này không thể khôi phục.")) return;
          startDeleteTransition(async () => {
            const result = await permanentlyDeleteCandidateAction(candidateId);
            if (result?.error) window.alert(result.error);
            else router.refresh();
          });
        }}
        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-60"
      >
        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        {isDeleting ? "Đang xóa..." : "Xóa triệt để"}
      </button>
    </div>
  );
}
