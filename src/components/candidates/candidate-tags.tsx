"use client";

import { useTransition } from "react";
import type { Tag } from "@/types";
import { TagSelector } from "@/components/candidates/tag-selector";
import { addTagToCandidateAction, removeTagFromCandidateAction } from "@/lib/actions";

interface CandidateTagsProps {
  candidateId: number;
  currentTags: { tag: Tag }[];
  allTags: Tag[];
}

export function CandidateTags({ candidateId, currentTags, allTags }: CandidateTagsProps) {
  const [isPending, startTransition] = useTransition();
  const selectedTagIds = currentTags.map((ct) => ct.tag.id);

  const handleChange = (newIds: number[]) => {
    // Find what changes compared to current tags
    const addedId = newIds.find((id) => !selectedTagIds.includes(id));
    const removedId = selectedTagIds.find((id) => !newIds.includes(id));

    if (addedId) {
      startTransition(async () => {
        await addTagToCandidateAction(candidateId, addedId);
      });
    } else if (removedId) {
      startTransition(async () => {
        await removeTagFromCandidateAction(candidateId, removedId);
      });
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/10 font-semibold text-sm flex items-center justify-between">
        <span>Tags ({selectedTagIds.length})</span>
        {isPending && (
          <span className="text-xs text-muted-foreground animate-pulse">
            Đang lưu...
          </span>
        )}
      </div>
      <div className="p-5">
        <TagSelector
          allTags={allTags}
          selectedTagIds={selectedTagIds}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
