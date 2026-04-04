"use client";

import { useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { restoreCandidateAction } from "@/lib/actions";

export function RestoreCandidateButton({ candidateId }: { candidateId: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await restoreCandidateAction(candidateId);
        });
      }}
      className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/15 disabled:opacity-60"
    >
      <RotateCcw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
      {isPending ? "Dang khoi phuc..." : "Khoi phuc"}
    </button>
  );
}
