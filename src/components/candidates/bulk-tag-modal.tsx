"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Tag, X } from "lucide-react";
import { Tag as PrismaTag } from "@prisma/client";
import { bulkAddTag } from "@/lib/candidate-actions";

export function BulkTagModal({
  candidateIds,
  selectedCount,
  allTags,
  onClose,
  onApplied,
}: {
  candidateIds: number[];
  selectedCount: number;
  allTags: PrismaTag[];
  onClose: () => void;
  onApplied: () => void;
}) {
  const router = useRouter();
  const [selectedTagId, setSelectedTagId] = useState<number | null>(allTags[0]?.id ?? null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleApply = () => {
    if (!selectedTagId) {
      setMessage("Bạn cần chọn một tag trước khi áp dụng.");
      return;
    }

    startTransition(async () => {
      const result = await bulkAddTag(candidateIds, selectedTagId);
      setMessage(result.message);

      if (!result.success) {
        return;
      }

      onApplied();
      router.refresh();
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Gắn tag cho {selectedCount} ứng viên
            </h3>
            <p className="mt-1 text-sm text-muted">
              Chọn một tag để áp dụng hàng loạt cho các hồ sơ đã chọn.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted transition hover:bg-background hover:text-foreground"
            aria-label="Đóng modal gắn tag"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="grid grid-cols-1 gap-2">
            {allTags.map((tag) => {
              const isSelected = tag.id === selectedTagId;

              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setSelectedTagId(tag.id)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background hover:bg-surface"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-sm font-medium text-foreground">{tag.name}</span>
                  </div>
                  <Tag className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted"}`} />
                </button>
              );
            })}
          </div>

          {message ? (
            <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">
              {message}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-background"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isPending || !selectedTagId}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang gắn...
              </>
            ) : (
              "Gắn tag"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
