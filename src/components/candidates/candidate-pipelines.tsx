import Link from "next/link";
import { Briefcase, ChevronRight } from "lucide-react";
import type { CandidateJobLink } from "@/types/candidate-ui";

const stageLabelMap: Record<CandidateJobLink["stage"], string> = {
  SOURCED: "Sourced",
  CONTACTED: "Contacted",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  PLACED: "Placed",
  REJECTED: "Rejected",
};

const resultLabelMap: Record<CandidateJobLink["result"], string> = {
  PENDING: "Pending",
  HIRED: "Hired",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

const stageClassMap: Record<CandidateJobLink["stage"], string> = {
  SOURCED: "bg-slate-100 text-slate-700",
  CONTACTED: "bg-sky-100 text-sky-700",
  INTERVIEW: "bg-violet-100 text-violet-700",
  OFFER: "bg-amber-100 text-amber-700",
  PLACED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
};

const resultClassMap: Record<CandidateJobLink["result"], string> = {
  PENDING: "bg-slate-100 text-slate-700",
  HIRED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  WITHDRAWN: "bg-amber-100 text-amber-700",
};

const jobStatusLabelMap: Record<CandidateJobLink["jobOrder"]["status"], string> = {
  OPEN: "Đang mở",
  PAUSED: "Tạm dừng",
  FILLED: "Đã tuyển",
  CANCELLED: "Đã hủy",
};

const jobStatusClassMap: Record<CandidateJobLink["jobOrder"]["status"], string> = {
  OPEN: "bg-primary/10 text-primary",
  PAUSED: "bg-warning/10 text-warning",
  FILLED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-danger/10 text-danger",
};

export function CandidatePipelines({ jobLinks }: { jobLinks: CandidateJobLink[] }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Briefcase className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-base font-semibold text-foreground">Pipeline hiện tại</h2>
          <p className="mt-1 text-sm text-muted">
            {jobLinks.length > 0
              ? `Ứng viên này đang nằm trong ${jobLinks.length} job.`
              : "Ứng viên này chưa được gán vào job nào."}
          </p>
        </div>
      </div>

      {jobLinks.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border bg-background px-4 py-6 text-sm text-muted">
          Chưa có dữ liệu pipeline để hiển thị.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {jobLinks.map((jobLink) => (
            <Link
              key={jobLink.id}
              href={`/jobs/${jobLink.jobOrder.id}`}
              className="block rounded-xl border border-border bg-background p-4 transition hover:border-primary/30 hover:bg-surface"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-foreground">
                      {jobLink.jobOrder.title}
                    </h3>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {jobLink.jobOrder.client.companyName}
                  </p>
                </div>

                <span
                  className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${jobStatusClassMap[jobLink.jobOrder.status]}`}
                >
                  {jobStatusLabelMap[jobLink.jobOrder.status]}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${stageClassMap[jobLink.stage]}`}
                >
                  Giai đoạn: {stageLabelMap[jobLink.stage]}
                </span>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${resultClassMap[jobLink.result]}`}
                >
                  Kết quả: {resultLabelMap[jobLink.result]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
