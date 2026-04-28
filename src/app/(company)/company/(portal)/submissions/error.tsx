"use client";

import { AlertTriangle } from "lucide-react";

export default function CompanySubmissionsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-border bg-surface p-8 text-center">
      <AlertTriangle className="h-12 w-12 text-amber-500" />
      <h2 className="mt-4 text-lg font-semibold text-foreground">
        Không tải được submissions
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted">
        Hãy thử tải lại trang. Nếu lỗi tiếp tục xảy ra, admin cần kiểm tra
        workspace client và dữ liệu JobCandidate.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-hover"
      >
        Tải lại
      </button>
    </div>
  );
}
