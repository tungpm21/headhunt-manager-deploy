"use client";

import { useTransition } from "react";
import { updateCandidateStageAction, removeCandidateAction } from "@/lib/job-actions";
import { JobCandidateWithRelations, JobCandidateStage } from "@/types/job";
import { Trash2, UserCircle, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";

interface JobPipelineProps {
  jobId: number;
  candidates: JobCandidateWithRelations[];
}

const STAGES: { value: JobCandidateStage; label: string }[] = [
  { value: "SOURCED", label: "Sourced (Đã tiếp cận)" },
  { value: "CONTACTED", label: "Contacted (Đã liên hệ)" },
  { value: "INTERVIEW", label: "Interview (Đang phỏng vấn)" },
  { value: "OFFER", label: "Offer (Mời làm việc)" },
  { value: "PLACED", label: "Placed (Đã nhận việc)" },
  { value: "REJECTED", label: "Rejected (Từ chối/Trượt)" },
];

export function JobPipeline({ jobId, candidates }: JobPipelineProps) {
  const [isPending, startTransition] = useTransition();

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
        return (
          <div key={jc.id} className="p-4 hover:bg-gray-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Candidate Info */}
            <div className="flex-1 min-w-0">
              <Link href={`/candidates/${c.id}`} className="font-semibold text-gray-900 text-sm hover:text-primary transition flex items-center">
                {c.fullName}
                <ChevronRight className="h-3.5 w-3.5 ml-1 text-gray-400" />
              </Link>
              <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2 items-center">
                <span>{c.currentPosition || "Chưa rō VP"} {c.currentCompany && `- ${c.currentCompany}`}</span>
                {jc.stage === "PLACED" && (
                  <span className="inline-flex items-center text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Successful
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <select
                value={jc.stage}
                disabled={isPending}
                onChange={(e) => handleStageChange(jc.id, e)}
                className={`text-sm rounded-md border-gray-300 py-1.5 pl-3 pr-8 focus:ring-primary focus:border-primary cursor-pointer ${
                  jc.stage === "PLACED" ? "bg-green-50 text-green-800 border-green-200" :
                  jc.stage === "REJECTED" ? "bg-red-50 text-red-800 border-red-200" :
                  "bg-white"
                }`}
              >
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>

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
        );
      })}
    </div>
  );
}
