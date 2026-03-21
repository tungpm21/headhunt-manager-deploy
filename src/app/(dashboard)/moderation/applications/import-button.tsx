"use client";

import { useState } from "react";
import { importApplicationToCRM } from "@/lib/moderation-actions";
import { Download, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function ImportButton({ applicationId }: { applicationId: number }) {
  const [state, setState] = useState<"idle" | "confirming" | "loading" | "done">("idle");
  const [result, setResult] = useState<{ message: string; candidateId?: number } | null>(null);

  async function handleImport() {
    setState("loading");
    const res = await importApplicationToCRM(applicationId);
    if (res.success) {
      setResult({ message: res.message, candidateId: res.candidateId });
      setState("done");
    } else {
      setResult({ message: res.message });
      setState("idle");
    }
  }

  if (state === "done" && result) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Đã import
        </span>
        {result.candidateId && (
          <Link
            href={`/candidates/${result.candidateId}`}
            className="text-xs text-primary hover:underline"
          >
            Xem UV #{result.candidateId}
          </Link>
        )}
      </div>
    );
  }

  if (state === "confirming") {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleImport}
          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          Xác nhận
        </button>
        <button
          onClick={() => setState("idle")}
          className="inline-flex items-center gap-1 rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-muted border border-border hover:bg-background transition-colors"
        >
          Hủy
        </button>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <button disabled className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Đang import...
      </button>
    );
  }

  return (
    <button
      onClick={() => setState("confirming")}
      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90 transition-colors shadow-sm"
    >
      <Download className="h-3.5 w-3.5" />
      Import CRM
    </button>
  );
}
