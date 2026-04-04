"use client";

import { useState } from "react";
import { Calendar, CheckCircle2, MessageSquare } from "lucide-react";
import {
  SerializedJobCandidateWithRelations,
  SubmissionResult,
} from "@/types/job";
import { PIPELINE_RESULTS } from "@/lib/job-pipeline";

type PipelineSaveInput = {
  result: SubmissionResult;
  interviewDate: string | null;
  notes: string | null;
};

export function PipelineDetailPanel({
  jobCandidate,
  isPending,
  onSave,
}: {
  jobCandidate: SerializedJobCandidateWithRelations;
  isPending: boolean;
  onSave: (jobCandidateId: number, data: PipelineSaveInput) => Promise<boolean>;
}) {
  const [interviewDate, setInterviewDate] = useState(
    jobCandidate.interviewDate
      ? new Date(jobCandidate.interviewDate).toISOString().split("T")[0]
      : ""
  );
  const [result, setResult] = useState<SubmissionResult>(jobCandidate.result);
  const [notes, setNotes] = useState(jobCandidate.notes || "");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const success = await onSave(jobCandidate.id, {
      result,
      interviewDate: interviewDate || null,
      notes: notes || null,
    });

    if (!success) {
      return;
    }

    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="border-t border-border bg-background/70 px-4 py-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            <Calendar className="mr-1 inline h-3 w-3" />
            Ngày hẹn phỏng vấn
          </label>
          <input
            type="date"
            value={interviewDate}
            onChange={(event) => setInterviewDate(event.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            <CheckCircle2 className="mr-1 inline h-3 w-3" />
            Kết quả
          </label>
          <select
            value={result}
            onChange={(event) => setResult(event.target.value as SubmissionResult)}
            className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {PIPELINE_RESULTS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            disabled={isPending}
            onClick={handleSave}
            className="w-full rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:opacity-60"
          >
            {saved ? "Đã lưu" : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      <div className="mt-3">
        <label className="mb-1 block text-xs font-medium text-muted">
          <MessageSquare className="mr-1 inline h-3 w-3" />
          Ghi chú / Feedback từ client
        </label>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={2}
          placeholder="Nhập feedback từ client, lý do từ chối, hoặc ghi chú follow-up..."
          className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
    </div>
  );
}
