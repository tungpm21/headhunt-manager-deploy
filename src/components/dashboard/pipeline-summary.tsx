"use client";

import Link from "next/link";
import { BarChart3, ChevronRight } from "lucide-react";
import type { JobCandidateStage } from "@/types/job";

type PipelineJobSummary = {
  id: number;
  title: string;
  companyName: string;
  quantity: number;
  totalCandidates: number;
  stageCounts: Record<JobCandidateStage, number>;
};

const STAGE_META: Record<JobCandidateStage, { label: string; colorClass: string }> = {
  SOURCED: { label: "Sourced", colorClass: "bg-slate-500" },
  CONTACTED: { label: "Contacted", colorClass: "bg-sky-500" },
  INTERVIEW: { label: "Interview", colorClass: "bg-violet-500" },
  OFFER: { label: "Offer", colorClass: "bg-amber-500" },
  PLACED: { label: "Placed", colorClass: "bg-emerald-500" },
  REJECTED: { label: "Rejected", colorClass: "bg-rose-500" },
};

const STAGE_ORDER: JobCandidateStage[] = [
  "SOURCED",
  "CONTACTED",
  "INTERVIEW",
  "OFFER",
  "PLACED",
  "REJECTED",
];

export function PipelineSummary({ jobs }: { jobs: PipelineJobSummary[] }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-muted">
            <BarChart3 className="h-4 w-4" />
            Pipeline Overview
          </p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">
            Tiến độ pipeline theo từng job đang mở
          </h2>
        </div>
        <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-muted">
          {jobs.length} job
        </span>
      </div>

      {jobs.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed border-border bg-background p-4 text-sm text-muted">
          Chưa có job đang mở để tổng hợp pipeline.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {jobs.map((job) => {
            const denominator = Math.max(job.totalCandidates, 1);

            return (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block rounded-xl border border-border bg-background p-4 transition hover:border-primary/20 hover:bg-surface"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-foreground">
                      {job.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted">{job.companyName}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span>
                      {job.totalCandidates}/{job.quantity} ứng viên
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-surface">
                  {STAGE_ORDER.map((stage) => {
                    const count = job.stageCounts[stage];
                    const width =
                      job.totalCandidates > 0 ? `${(count / denominator) * 100}%` : "0%";

                    if (!count) {
                      return null;
                    }

                    return (
                      <div
                        key={`${job.id}-${stage}`}
                        className={STAGE_META[stage].colorClass}
                        style={{ width }}
                        title={`${STAGE_META[stage].label}: ${count}`}
                      />
                    );
                  })}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {STAGE_ORDER.map((stage) => (
                    <span
                      key={`${job.id}-${stage}-label`}
                      className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted"
                    >
                      {STAGE_META[stage].label}: {job.stageCounts[stage]}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
