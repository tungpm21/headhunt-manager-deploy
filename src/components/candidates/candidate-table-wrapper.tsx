"use client";

import { useEffect, useState } from "react";
import { CandidateWithTags } from "@/types/candidate";
import { CandidateTable } from "@/components/candidates/candidate-table";

export function CandidateTableWrapper({
  candidates,
}: {
  candidates: CandidateWithTags[];
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

  return (
    <CandidateTable
      candidates={candidates}
      selectedIds={selectedIds}
      allSelected={candidates.length > 0 && selectedIds.size === candidates.length}
      onToggle={toggleOne}
      onToggleAll={toggleAll}
    />
  );
}
