"use client";

import { useEffect, useState } from "react";
import { Tag } from "@prisma/client";
import { CandidateWithTags } from "@/types/candidate";
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

  useEffect(() => {
    setSelectedIds((currentIds) => {
      const nextIds = new Set(
        [...currentIds].filter((id) => candidates.some((candidate) => candidate.id === id))
      );
      return nextIds;
    });
  }, [candidates]);

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
      if (candidates.length > 0 && currentIds.size === candidates.length) {
        return new Set();
      }

      return new Set(candidates.map((candidate) => candidate.id));
    });
  };

  const selectedCandidates = candidates.filter((candidate) =>
    selectedIds.has(candidate.id)
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
        selectedIds={selectedIds}
        allSelected={candidates.length > 0 && selectedIds.size === candidates.length}
        onToggle={toggleOne}
        onToggleAll={toggleAll}
      />
    </div>
  );
}
