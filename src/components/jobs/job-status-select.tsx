"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateJobStatusAction } from "@/lib/job-actions";
import type { JobStatus } from "@/types/job";

const STATUS_OPTIONS: Array<{ value: JobStatus; label: string }> = [
  { value: "OPEN", label: "Đang tuyển" },
  { value: "PAUSED", label: "Tạm dừng" },
  { value: "FILLED", label: "Đã tuyển" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const STATUS_CLASS: Record<JobStatus, string> = {
  OPEN: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PAUSED: "border-amber-200 bg-amber-50 text-amber-700",
  FILLED: "border-blue-200 bg-blue-50 text-blue-700",
  CANCELLED: "border-slate-200 bg-slate-50 text-slate-700",
};

export function JobStatusSelect({
  jobId,
  status,
}: {
  jobId: number;
  status: JobStatus;
}) {
  const router = useRouter();
  const [value, setValue] = useState<JobStatus>(status);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleChange(nextValue: JobStatus) {
    if (nextValue === value || saving) return;

    const previousValue = value;
    setValue(nextValue);
    setSaving(true);
    setMessage(null);

    const result = await updateJobStatusAction(jobId, nextValue);
    if (!result.success) {
      setValue(previousValue);
      setMessage(result.message ?? "Không thể cập nhật trạng thái.");
    } else {
      setMessage("Đã lưu");
      router.refresh();
    }

    setSaving(false);
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <select
        value={value}
        disabled={saving}
        onChange={(event) => handleChange(event.target.value as JobStatus)}
        className={`h-8 rounded-md border px-2 text-xs font-semibold outline-none transition focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60 ${STATUS_CLASS[value]}`}
        aria-label="Cập nhật trạng thái tuyển dụng"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {message ? (
        <span className={`text-[11px] ${message === "Đã lưu" ? "text-emerald-600" : "text-red-600"}`}>
          {message}
        </span>
      ) : null}
    </div>
  );
}
