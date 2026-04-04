"use client";

import { useMemo, useState } from "react";
import type { Tag } from "@/types";
import type { CandidateWithTags } from "@/types/candidate-ui";
import { BulkActionBar } from "@/components/candidates/bulk-action-bar";
import { CandidateTable } from "@/components/candidates/candidate-table";

export function CandidateTableWrapper({
  candidates,
  allTags,
}: {
  candidates: CandidateWithTags[];
  allTags: Tag[];
}) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const visibleSelectedIds = useMemo(
    () =>
      new Set(
        [...selectedIds].filter((id) =>
          candidates.some((candidate) => candidate.id === id)
        )
      ),
    [candidates, selectedIds]
  );

  const toggleOne = (candidateId: number) => {
    setSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (nextIds.has(candidateId)) {
        nextIds.delete(candidateId);
      } else {
        nextIds.add(candidateId);
      }
      return nextIds;
    });
  };

  const toggleAll = () => {
    setSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds);
      const candidateIds = candidates.map((candidate) => candidate.id);
      const allVisibleSelected =
        candidateIds.length > 0 && candidateIds.every((id) => currentIds.has(id));

      if (allVisibleSelected) {
        candidateIds.forEach((id) => nextIds.delete(id));
        return nextIds;
      }

      candidateIds.forEach((id) => nextIds.add(id));
      return nextIds;
    });
  };

  const selectedCandidates = candidates.filter((candidate) =>
    visibleSelectedIds.has(candidate.id)
  );

  return (
    <div className="space-y-4">
      {selectedCandidates.length > 0 ? (
        <BulkActionBar
          selectedCandidates={selectedCandidates}
          allTags={allTags}
          onClearSelection={() => setSelectedIds(new Set())}
        />
      ) : null}

      <CandidateTable
        candidates={candidates}
        selectedIds={visibleSelectedIds}
        allSelected={
          candidates.length > 0 && visibleSelectedIds.size === candidates.length
        }
        onToggle={toggleOne}
        onToggleAll={toggleAll}
      />
    </div>
  );
}
