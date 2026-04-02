"use client";

import { useState } from "react";
import { Tag } from "@prisma/client";
import { CheckCircle2, Download, Tags, Briefcase, X } from "lucide-react";
import { CandidateWithTags } from "@/types/candidate";
import { exportCandidatesToCSV } from "@/lib/candidate-export";
import { BulkAssignModal } from "@/components/candidates/bulk-assign-modal";
import { BulkTagModal } from "@/components/candidates/bulk-tag-modal";

export function BulkActionBar({
  selectedCandidates,
  allTags,
  onClearSelection,
}: {
  selectedCandidates: CandidateWithTags[];
  allTags: Tag[];
  onClearSelection: () => void;
}) {
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isTagOpen, setIsTagOpen] = useState(false);

  return (
    <>
      <div className="sticky top-4 z-20 animate-in slide-in-from-top-2 duration-200">
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface/95 px-4 py-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Đã chọn {selectedCandidates.length} ứng viên
              </p>
              <p className="text-xs text-muted">
                Bạn có thể gán vào job, export CSV hoặc gắn tag hàng loạt.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAssignOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-surface"
            >
              <Briefcase className="h-4 w-4" />
              Gán vào Job
            </button>
            <button
              type="button"
              onClick={() => exportCandidatesToCSV(selectedCandidates)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-surface"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => setIsTagOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-surface"
            >
              <Tags className="h-4 w-4" />
              Gắn tag
            </button>
            <button
              type="button"
              onClick={onClearSelection}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-muted transition hover:bg-background hover:text-foreground"
            >
              <X className="h-4 w-4" />
              Bỏ chọn
            </button>
          </div>
        </div>
      </div>

      {isAssignOpen ? (
        <BulkAssignModal
          candidateIds={selectedCandidates.map((candidate) => candidate.id)}
          selectedCount={selectedCandidates.length}
          onAssigned={onClearSelection}
          onClose={() => setIsAssignOpen(false)}
        />
      ) : null}

      {isTagOpen ? (
        <BulkTagModal
          candidateIds={selectedCandidates.map((candidate) => candidate.id)}
          selectedCount={selectedCandidates.length}
          allTags={allTags}
          onApplied={onClearSelection}
          onClose={() => setIsTagOpen(false)}
        />
      ) : null}
    </>
  );
}
