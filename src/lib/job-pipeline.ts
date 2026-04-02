import { JobCandidateStage, SubmissionResult } from "@/types/job";

export const PIPELINE_STAGES: {
  value: JobCandidateStage;
  label: string;
  shortLabel: string;
  columnClassName: string;
  badgeClassName: string;
}[] = [
  {
    value: "SOURCED",
    label: "Đã tiếp cận",
    shortLabel: "Tiếp cận",
    columnClassName: "border-slate-200 bg-slate-50/60",
    badgeClassName: "bg-slate-100 text-slate-700",
  },
  {
    value: "CONTACTED",
    label: "Đã liên hệ",
    shortLabel: "Liên hệ",
    columnClassName: "border-sky-200 bg-sky-50/60",
    badgeClassName: "bg-sky-100 text-sky-700",
  },
  {
    value: "INTERVIEW",
    label: "Phỏng vấn",
    shortLabel: "Phỏng vấn",
    columnClassName: "border-violet-200 bg-violet-50/60",
    badgeClassName: "bg-violet-100 text-violet-700",
  },
  {
    value: "OFFER",
    label: "Đề nghị",
    shortLabel: "Đề nghị",
    columnClassName: "border-amber-200 bg-amber-50/60",
    badgeClassName: "bg-amber-100 text-amber-700",
  },
  {
    value: "PLACED",
    label: "Nhận việc",
    shortLabel: "Nhận việc",
    columnClassName: "border-emerald-200 bg-emerald-50/60",
    badgeClassName: "bg-emerald-100 text-emerald-700",
  },
  {
    value: "REJECTED",
    label: "Từ chối",
    shortLabel: "Từ chối",
    columnClassName: "border-rose-200 bg-rose-50/60",
    badgeClassName: "bg-rose-100 text-rose-700",
  },
];

export const PIPELINE_RESULTS: {
  value: SubmissionResult;
  label: string;
  className: string;
}[] = [
  {
    value: "PENDING",
    label: "Đang xử lý",
    className: "bg-muted/20 text-muted",
  },
  {
    value: "HIRED",
    label: "Tuyển thành công",
    className: "bg-success/10 text-success",
  },
  {
    value: "REJECTED",
    label: "Từ chối",
    className: "bg-danger/10 text-danger",
  },
  {
    value: "WITHDRAWN",
    label: "Rút lui",
    className: "bg-warning/10 text-warning",
  },
];

const FORWARD_STAGES: JobCandidateStage[] = [
  "SOURCED",
  "CONTACTED",
  "INTERVIEW",
  "OFFER",
  "PLACED",
];

export function getStageMeta(stage: JobCandidateStage) {
  return (
    PIPELINE_STAGES.find((item) => item.value === stage) ?? PIPELINE_STAGES[0]
  );
}

export function getResultMeta(result: SubmissionResult) {
  return (
    PIPELINE_RESULTS.find((item) => item.value === result) ?? PIPELINE_RESULTS[0]
  );
}

export function getNextStage(stage: JobCandidateStage): JobCandidateStage | null {
  const currentIndex = FORWARD_STAGES.indexOf(stage);

  if (currentIndex === -1 || currentIndex === FORWARD_STAGES.length - 1) {
    return null;
  }

  return FORWARD_STAGES[currentIndex + 1];
}

export function formatPipelineDate(date: Date | string | null | undefined) {
  if (!date) return null;

  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
