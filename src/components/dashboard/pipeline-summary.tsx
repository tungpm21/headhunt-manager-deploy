"use client";

import Link from "next/link";
import { BarChart3, ChevronRight } from "lucide-react";
import type { JobCandidateStage } from "@/types/job";

type StageDatum = {
  stage: JobCandidateStage;
  count: number;
};

const STAGE_META: Record<
  JobCandidateStage,
  { label: string; barClassName: string }
> = {
  SOURCED: { label: "Đã tiếp cận", barClassName: "bg-slate-500" },
  CONTACTED: { label: "Đã liên hệ", barClassName: "bg-sky-500" },
  INTERVIEW: { label: "Phỏng vấn", barClassName: "bg-violet-500" },
  OFFER: { label: "Đề nghị", barClassName: "bg-amber-500" },
  PLACED: { label: "Nhận việc", barClassName: "bg-emerald-500" },
  REJECTED: { label: "Từ chối", barClassName: "bg-rose-500" },
};

const STAGE_ORDER: JobCandidateStage[] = [
  "SOURCED",
  "CONTACTED",
  "INTERVIEW",
  "OFFER",
  "PLACED",
  "REJECTED",
];

export function PipelineSummary({ stageData }: { stageData: StageDatum[] }) {
  const countByStage = new Map(stageData.map((item) => [item.stage, item.count]));
  const rows = STAGE_ORDER.map((stage) => ({
    stage,
    count: countByStage.get(stage) ?? 0,
    ...STAGE_META[stage],
  }));

  const totalCount = rows.reduce((sum, item) => sum + item.count, 0);
  const maxCount = Math.max(...rows.map((item) => item.count), 1);

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-muted">
            <BarChart3 className="h-4 w-4" />
            Pipeline Overview
          </p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">
            Phân bổ ứng viên theo giai đoạn
          </h2>
        </div>
        <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-muted">
          {totalCount} ứng viên
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {rows.map((item) => {
          const width = `${Math.max((item.count / maxCount) * 100, item.count > 0 ? 8 : 0)}%`;

          return (
            <Link
              key={item.stage}
              href={`/jobs?stage=${item.stage}`}
              className="group block rounded-xl border border-transparent p-3 transition hover:border-border hover:bg-background"
            >
              <div className="flex items-center gap-3">
                <div className="w-28 shrink-0 text-xs font-semibold uppercase tracking-wide text-muted">
                  {item.label}
                </div>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-background">
                  <div
                    className={`h-full rounded-full ${item.barClassName} transition-[width] duration-300`}
                    style={{ width }}
                  />
                </div>
                <div className="w-9 shrink-0 text-right text-sm font-semibold text-foreground">
                  {item.count}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted transition group-hover:text-foreground" />
              </div>
            </Link>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-muted">
        Chạm vào từng giai đoạn để lọc danh sách Job Orders liên quan.
      </p>
    </section>
  );
}
