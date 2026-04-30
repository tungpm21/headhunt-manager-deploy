"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Eye, FileText, Loader2, Star, Trash2, Upload } from "lucide-react";
import type { CandidateWithRelations } from "@/types/candidate-ui";
import {
  addCandidateCVAction,
  deleteCVAction,
  setPrimaryCVAction,
} from "@/lib/candidate-detail-actions";

interface CvListProps {
  candidateId: number;
  cvFiles: CandidateWithRelations["cvFiles"];
  legacyCvFileUrl?: string | null;
  legacyCvFileName?: string | null;
}

type ActionState = { error?: string; success?: boolean } | undefined;

function formatDate(date: Date | string) {
  return new Date(date).toLocaleString("vi-VN");
}

type DisplayCv = CandidateWithRelations["cvFiles"][number] & { isLegacy?: boolean };

export function CvList({
  candidateId,
  cvFiles,
  legacyCvFileUrl,
  legacyCvFileName,
}: CvListProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    addCandidateCVAction,
    undefined
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeCvId, setActiveCvId] = useState<number | null>(null);
  const [isMutating, startTransition] = useTransition();

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [router, state?.success]);

  const runAction = (
    cvId: number,
    action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>,
    confirmMessage?: string
  ) => {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return;
    }

    setActionError(null);
    setActiveCvId(cvId);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("cvId", String(cvId));
      formData.set("candidateId", String(candidateId));
      const result = await action(formData);
      if (result?.error) {
        setActionError(result.error);
      } else {
        router.refresh();
      }
      setActiveCvId(null);
    });
  };

  const displayCvFiles: DisplayCv[] =
    cvFiles.length > 0
      ? cvFiles
      : legacyCvFileUrl
        ? [
            {
              id: 0,
              fileUrl: legacyCvFileUrl,
              fileName: legacyCvFileName || "CV ứng viên",
              label: "CV legacy",
              isPrimary: true,
              uploadedAt: new Date(0),
              uploadedBy: { id: 0, name: "Dữ liệu cũ" },
              isLegacy: true,
            },
          ]
        : [];

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-foreground">Quản lý CV</h3>
        <p className="mt-1 text-sm text-muted">
          Mỗi ứng viên có thể lưu nhiều CV. CV primary sẽ được dùng làm bản mặc định để preview.
        </p>
      </div>

      <form ref={formRef} action={formAction} className="rounded-xl border border-border bg-background p-4 space-y-4">
        <input type="hidden" name="candidateId" value={candidateId} />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.2fr_1fr_auto]">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">File CV</label>
            <input
              name="file"
              type="file"
              accept=".pdf,.doc,.docx"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Nhãn</label>
            <input
              name="label"
              type="text"
              placeholder="VD: CV English, CV format client..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60 transition whitespace-nowrap"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tải
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload CV
                </>
              )}
            </button>
          </div>
        </div>

        {state?.error && (
          <p className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
            {state.error}
          </p>
        )}
      </form>

      {actionError && (
        <p className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
          {actionError}
        </p>
      )}

      {displayCvFiles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted/30" />
          <p className="mt-3 text-sm font-medium text-foreground">Chưa có CV nào</p>
          <p className="mt-1 text-sm text-muted">Upload CV đầu tiên để bắt đầu quản lý nhiều phiên bản.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayCvFiles.map((cv) => {
            const busy = isMutating && activeCvId === cv.id;

            return (
              <div key={`${cv.id}-${cv.fileUrl}`} className="rounded-xl border border-border bg-background p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{cv.fileName}</p>
                      {cv.isPrimary && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                          <Star className="h-3 w-3" />
                          Primary
                        </span>
                      )}
                    </div>
                    {cv.label && (
                      <p className="mt-1 text-sm text-muted">{cv.label}</p>
                    )}
                    <p className="mt-2 text-xs text-muted">
                      Upload lúc {formatDate(cv.uploadedAt)} bởi {cv.uploadedBy.name}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={cv.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface transition"
                    >
                      <Eye className="h-4 w-4" />
                      Xem
                    </a>
                    <a
                      href={cv.fileUrl}
                      download={cv.fileName}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface transition"
                    >
                      <Download className="h-4 w-4" />
                      Tải
                    </a>
                    {!cv.isPrimary && !cv.isLegacy && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => runAction(cv.id, setPrimaryCVAction)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 disabled:opacity-60 transition"
                      >
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
                        Đặt primary
                      </button>
                    )}
                    {!cv.isLegacy ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        runAction(
                          cv.id,
                          deleteCVAction,
                          "Xóa CV này khỏi hệ thống? File lưu trữ cũng sẽ bị xóa."
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-danger/20 bg-danger/10 px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger/15 disabled:opacity-60 transition"
                    >
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      Xóa
                    </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
