"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Loader2, Search, X } from "lucide-react";
import {
  bulkAssignToJob,
  searchOpenJobsAction,
} from "@/lib/candidate-actions";

type JobOption = {
  id: number;
  title: string;
  status: string;
  client: {
    companyName: string;
  };
};

export function BulkAssignModal({
  candidateIds,
  selectedCount,
  onClose,
  onAssigned,
}: {
  candidateIds: number[];
  selectedCount: number;
  onClose: () => void;
  onAssigned: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoadingJobs, startJobSearch] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      startJobSearch(async () => {
        const nextJobs = (await searchOpenJobsAction(query)) as JobOption[];
        setJobs(nextJobs);
        if (!nextJobs.some((job) => job.id === selectedJobId)) {
          setSelectedJobId(nextJobs[0]?.id ?? null);
        }
      });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query, selectedJobId]);

  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? null;

  const handleAssign = () => {
    if (!selectedJobId) {
      setMessage("Bạn cần chọn một job order trước khi gán.");
      return;
    }

    startSubmit(async () => {
      const result = await bulkAssignToJob(candidateIds, selectedJobId);
      setMessage(result.message);

      if (!result.success) {
        return;
      }

      onAssigned();
      router.refresh();
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Gán {selectedCount} ứng viên vào Job Order
            </h3>
            <p className="mt-1 text-sm text-muted">
              Chọn job đang mở để gán toàn bộ ứng viên đã chọn.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted transition hover:bg-background hover:text-foreground"
            aria-label="Đóng modal gán job"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm job order..."
              className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="max-h-[320px] space-y-2 overflow-y-auto rounded-xl border border-border bg-background p-3">
            {isLoadingJobs ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tìm job order...
              </div>
            ) : jobs.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted">
                Không tìm thấy job order đang mở phù hợp.
              </div>
            ) : (
              jobs.map((job) => {
                const isSelected = job.id === selectedJobId;

                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => setSelectedJobId(job.id)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-surface hover:bg-background"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{job.title}</p>
                      <p className="mt-1 text-xs text-muted">
                        {job.client.companyName} ({job.status})
                      </p>
                    </div>
                    <Briefcase
                      className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted"}`}
                    />
                  </button>
                );
              })
            )}
          </div>

          {message ? (
            <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">
              {message}
            </div>
          ) : null}

          {selectedJob ? (
            <p className="text-sm text-muted">
              Sẽ gán vào: <span className="font-medium text-foreground">{selectedJob.title}</span>
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-background"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={isSubmitting || !selectedJobId}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang gán...
              </>
            ) : (
              "Gán ứng viên"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
