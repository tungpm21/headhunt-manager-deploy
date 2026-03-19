"use client";

import { useTransition } from "react";
import { deleteCandidateAction } from "@/lib/actions";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteCandidateButton({ candidateId }: { candidateId: number }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Bạn có chắc muốn xóa ứng viên này? Hành động này không thể hoàn tác.")) return;
    startTransition(() => deleteCandidateAction(candidateId));
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="flex items-center gap-2 rounded-lg border border-danger/20 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/5 disabled:opacity-60 transition"
    >
      {isPending ? (
        <><Loader2 className="h-4 w-4 animate-spin" /> Đang xóa...</>
      ) : (
        <><Trash2 className="h-4 w-4" /> Xóa ứng viên</>
      )}
    </button>
  );
}
