"use client";

import { useTransition, useState } from "react";
import {
  updateCandidateStageAction,
  updateCandidatePipelineAction,
  removeCandidateAction,
} from "@/lib/job-actions";
import { JobCandidateWithRelations, JobCandidateStage, SubmissionResult } from "@/types/job";
import {
  Trash2, UserCircle, CheckCircle2, ChevronRight,
  Calendar, ChevronDown, ChevronUp, MessageSquare,
} from "lucide-react";
import Link from "next/link";

interface JobPipelineProps {
  jobId: number;
  candidates: JobCandidateWithRelations[];
}

const STAGES: { value: JobCandidateStage; label: string }[] = [
  { value: "SOURCED",   label: "Sourced (Đã tiếp cận)" },
  { value: "CONTACTED", label: "Contacted (Đã liên hệ)" },
  { value: "INTERVIEW", label: "Interview (Đang phỏng vấn)" },
  { value: "OFFER",     label: "Offer (Mời làm việc)" },
  { value: "PLACED",    label: "Placed (Đã nhận việc)" },
  { value: "REJECTED",  label: "Rejected (Từ chối/Trượt)" },
];

const RESULTS: { value: SubmissionResult; label: string; cls: string }[] = [
  { value: "PENDING",   label: "Đang xử lý",      cls: "bg-muted/20 text-muted" },
  { value: "HIRED",     label: "Tuyển thành công", cls: "bg-success/10 text-success" },
  { value: "REJECTED",  label: "Từ chối",          cls: "bg-danger/10 text-danger" },
  { value: "WITHDRAWN", label: "Rút lui",          cls: "bg-warning/10 text-warning" },
];

function formatDate(d: Date | null | undefined) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function JobPipeline({ jobId, candidates }: JobPipelineProps) {
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState<number | null>(null);

  const handleStageChange = (jobCandidateId: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStage = e.target.value as JobCandidateStage;
    startTransition(async () => {
      await updateCandidateStageAction(jobCandidateId, newStage);
    });
  };

  const handleRemove = (candidateId: number) => {
    if (confirm("Gỡ ứng viên này khỏi Job Order? Dữ liệu lịch sử cho job này sẽ bị xóa.")) {
      startTransition(async () => {
        await removeCandidateAction(jobId, candidateId);
      });
    }
  };

  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 bg-gray-50 border border-dashed rounded-lg">
        <UserCircle className="h-10 w-10 text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">Job này chưa có ứng viên nào.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 border rounded-lg overflow-hidden bg-white">
      {candidates.map((jc) => {
        const c = jc.candidate;
        const isExpanded = expanded === jc.id;
        const resultCfg = RESULTS.find((r) => r.value === jc.result) || RESULTS[0];

        return (
          <div key={jc.id} className="hover:bg-gray-50 transition">
            {/* Main row */}
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Candidate Info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/candidates/${c.id}`}
                  className="font-semibold text-gray-900 text-sm hover:text-primary transition flex items-center"
                >
                  {c.fullName}
                  <ChevronRight className="h-3.5 w-3.5 ml-1 text-gray-400" />
                </Link>
                <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2 items-center">
                  <span>{c.currentPosition || "Chưa rõ VP"} {c.currentCompany && `- ${c.currentCompany}`}</span>

                  {/* Level chip */}
                  {c.level && (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {c.level.replace("_", "-")}
                    </span>
                  )}

                  {/* Interview date indicator */}
                  {jc.interviewDate && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-medium text-blue-700">
                      <Calendar className="h-3 w-3" />
                      PV: {formatDate(jc.interviewDate)}
                    </span>
                  )}

                  {/* Result badge */}
                  {jc.result !== "PENDING" && (
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${resultCfg.cls}`}>
                      {resultCfg.label}
                    </span>
                  )}

                  {jc.stage === "PLACED" && (
                    <span className="inline-flex items-center text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Successful
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={jc.stage}
                  disabled={isPending}
                  onChange={(e) => handleStageChange(jc.id, e)}
                  className={`text-sm rounded-md border-gray-300 py-1.5 pl-3 pr-8 focus:ring-primary focus:border-primary cursor-pointer ${
                    jc.stage === "PLACED"   ? "bg-green-50 text-green-800 border-green-200" :
                    jc.stage === "REJECTED" ? "bg-red-50 text-red-800 border-red-200" :
                    jc.stage === "INTERVIEW"? "bg-blue-50 text-blue-800 border-blue-200" :
                    "bg-white"
                  }`}
                >
                  {STAGES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>

                {/* Expand/collapse detail panel */}
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : jc.id)}
                  className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition"
                  title="Chi tiết & ghi chú"
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleRemove(c.id)}
                  disabled={isPending}
                  className="p-1.5 text-gray-400 hover:text-danger hover:bg-danger/10 rounded transition disabled:opacity-50"
                  title="Gỡ ứng viên"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Expandable detail panel */}
            {isExpanded && (
              <PipelineDetailPanel
                jc={jc}
                isPending={isPending}
                startTransition={startTransition}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Inline detail panel for interview date, result, notes
function PipelineDetailPanel({
  jc,
  isPending,
  startTransition,
}: {
  jc: JobCandidateWithRelations;
  isPending: boolean;
  startTransition: (fn: () => Promise<void>) => void;
}) {
  const [interviewDate, setInterviewDate] = useState(
    jc.interviewDate ? new Date(jc.interviewDate).toISOString().split("T")[0] : ""
  );
  const [result, setResult] = useState<SubmissionResult>(jc.result);
  const [notes, setNotes] = useState(jc.notes || "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    startTransition(async () => {
      await updateCandidatePipelineAction(jc.id, {
        result,
        interviewDate: interviewDate || null,
        notes: notes || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Interview Date */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            <Calendar className="inline h-3 w-3 mr-1" />
            Ngày hẹn phỏng vấn
          </label>
          <input
            type="date"
            value={interviewDate}
            onChange={(e) => setInterviewDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {/* Result */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            <CheckCircle2 className="inline h-3 w-3 mr-1" />
            Kết quả
          </label>
          <select
            value={result}
            onChange={(e) => setResult(e.target.value as SubmissionResult)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            {RESULTS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Save button */}
        <div className="flex items-end">
          <button
            type="button"
            disabled={isPending}
            onClick={handleSave}
            className="w-full rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60 transition"
          >
            {saved ? "✓ Đã lưu" : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      {/* Notes */}
      <div className="mt-3">
        <label className="mb-1 block text-xs font-medium text-gray-500">
          <MessageSquare className="inline h-3 w-3 mr-1" />
          Ghi chú / Feedback từ client
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Nhập feedback từ client, lý do từ chối, hoặc ghi chú follow-up..."
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
        />
      </div>
    </div>
  );
}
