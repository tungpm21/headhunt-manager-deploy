"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronDown, Download, Loader2, SendHorizonal } from "lucide-react";
import {
  importApplicationToCRM,
  importAndSubmitApplication,
} from "@/lib/moderation-actions";

type ImportState = "idle" | "menu" | "loading" | "done";

export function ImportButton({
  applicationId,
  jobOrderId,
}: {
  applicationId: number;
  jobOrderId?: number | null;
}) {
  const [state, setState] = useState<ImportState>("idle");
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

  async function handleImportAndSubmit() {
    if (!jobOrderId) {
      setResult({ message: "Không tìm thấy Job Order liên kết." });
      setState("idle");
      return;
    }

    setState("loading");
    const res = await importAndSubmitApplication(applicationId, jobOrderId);
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
          Đã lưu Talent Pool
        </span>
        {result.candidateId ? (
          <Link
            href={`/candidates/${result.candidateId}`}
            className="text-xs text-primary hover:underline"
          >
            Xem UV #{result.candidateId}
          </Link>
        ) : null}
      </div>
    );
  }

  if (state === "loading") {
    return (
      <button
        disabled
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Đang import...
      </button>
    );
  }

  if (state === "menu") {
    return (
      <div className="relative flex flex-col gap-1">
        {jobOrderId ? (
          <button
            onClick={handleImportAndSubmit}
            className="inline-flex w-full items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-left text-xs font-medium text-foreground transition-colors hover:bg-background"
          >
            <SendHorizonal className="h-3.5 w-3.5 text-blue-500" />
            Import & Submit
          </button>
        ) : null}
        <button
          onClick={() => setState("idle")}
          className="mt-0.5 text-xs text-muted transition-colors hover:text-foreground"
        >
          Đóng
        </button>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center overflow-hidden rounded-lg shadow-sm">
      <button
        onClick={handleImport}
        className="inline-flex items-center gap-1.5 bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary/90"
      >
        <Download className="h-3.5 w-3.5" />
        Import Talent Pool
      </button>
      {jobOrderId ? (
        <button
          type="button"
          aria-label="Mở tùy chọn import"
          onClick={() => setState("menu")}
          className="inline-flex min-h-[30px] items-center border-l border-white/20 bg-primary px-2 text-white transition-colors hover:bg-primary/90"
        >
          <ChevronDown className="h-3.5 w-3.5 opacity-80" />
        </button>
      ) : null}
    </div>
  );
}
