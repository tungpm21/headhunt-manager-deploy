"use client";

import { useState } from "react";
import {
  importApplicationToCRM,
  importAndSubmitApplication,
} from "@/lib/moderation-actions";
import { Download, Loader2, CheckCircle2, ChevronDown, SendHorizonal } from "lucide-react";
import Link from "next/link";

type ImportState = "idle" | "menu" | "confirming-import" | "confirming-submit" | "loading" | "done";

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

  if (state === "confirming-import") {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleImport}
          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          Xác nhận Import
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

  if (state === "confirming-submit") {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleImportAndSubmit}
          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Xác nhận Import & Submit
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

  if (state === "menu") {
    return (
      <div className="relative flex flex-col gap-1">
        <button
          onClick={() => setState("confirming-import")}
          className="inline-flex w-full items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-foreground border border-border hover:bg-background transition-colors text-left"
        >
          <Download className="h-3.5 w-3.5 text-muted" />
          Import Talent Pool
        </button>
        {jobOrderId ? (
          <button
            onClick={() => setState("confirming-submit")}
            className="inline-flex w-full items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-xs font-medium text-foreground border border-border hover:bg-background transition-colors text-left"
          >
            <SendHorizonal className="h-3.5 w-3.5 text-blue-500" />
            Import & Submit
          </button>
        ) : null}
        <button
          onClick={() => setState("idle")}
          className="text-xs text-muted hover:text-foreground transition-colors mt-0.5"
        >
          Đóng
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setState("menu")}
      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90 transition-colors shadow-sm"
    >
      <Download className="h-3.5 w-3.5" />
      Import Talent Pool
      <ChevronDown className="h-3 w-3 opacity-70" />
    </button>
  );
}
