"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteClientAction } from "@/lib/client-actions";

export function DeleteClientButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Bạn có chắc chắn muốn xóa doanh nghiệp này? Hành động này thao tác xóa mềm.")) {
      startTransition(async () => {
        await deleteClientAction(id);
      });
    }
  };

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleDelete}
      className="inline-flex items-center justify-center rounded-lg border border-danger/20 bg-danger/10 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/20 disabled:opacity-50 flex-shrink-0 transition"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {isPending ? "Đang xóa..." : "Xóa doanh nghiệp"}
    </button>
  );
}
