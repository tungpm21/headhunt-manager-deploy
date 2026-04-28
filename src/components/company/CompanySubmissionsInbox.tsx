"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Download,
  Mail,
  MessageSquareText,
  Phone,
  Search,
  Send,
  UserRound,
} from "lucide-react";
import { submitCompanySubmissionFeedbackAction } from "@/lib/company-submission-actions";
import { cn } from "@/lib/utils";

type StageValue =
  | "SENT_TO_CLIENT"
  | "CLIENT_REVIEWING"
  | "INTERVIEW"
  | "FINAL_INTERVIEW"
  | "OFFER"
  | "HIRED"
  | "REJECTED";

type ResultValue = "PENDING" | "HIRED" | "REJECTED" | "WITHDRAWN";

type FeedbackDecisionValue =
  | "INTERESTED"
  | "NEED_MORE_INFO"
  | "INTERVIEW"
  | "REJECTED";

export type CompanySubmissionItem = {
  id: number;
  stage: StageValue;
  result: ResultValue;
  interviewDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  candidate: {
    id: number;
    fullName: string;
    email: string | null;
    phone: string | null;
    currentPosition: string | null;
    currentCompany: string | null;
    industry: string | null;
    yearsOfExp: number | null;
    location: string | null;
    level: string | null;
    skills: string[];
    cvFileUrl: string | null;
    cvFileName: string | null;
  };
  jobOrder: {
    id: number;
    title: string;
    status: string;
    industry: string | null;
    location: string | null;
  };
  feedback: {
    id: number;
    decision: FeedbackDecisionValue | null;
    message: string | null;
    createdAt: string;
    authorPortalUser: {
      name: string | null;
      email: string;
    } | null;
  }[];
};

export type CompanySubmissionsJobOption = {
  id: number;
  title: string;
  status: string;
  submissions: number;
};

export type CompanySubmissionsFilters = {
  q: string;
  stage: string;
  result: string;
  job: string;
  feedback: string;
  selected: string;
};

const stageMeta: Record<StageValue, { label: string; className: string }> = {
  SENT_TO_CLIENT: {
    label: "Đã gửi CV",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  CLIENT_REVIEWING: {
    label: "Client đang xem",
    className: "bg-sky-50 text-sky-700 border-sky-100",
  },
  INTERVIEW: {
    label: "Phỏng vấn",
    className: "bg-violet-50 text-violet-700 border-violet-100",
  },
  FINAL_INTERVIEW: {
    label: "PV vòng cuối",
    className: "bg-indigo-50 text-indigo-700 border-indigo-100",
  },
  OFFER: {
    label: "Đề nghị",
    className: "bg-amber-50 text-amber-700 border-amber-100",
  },
  HIRED: {
    label: "Đã tuyển",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  REJECTED: {
    label: "Từ chối",
    className: "bg-red-50 text-red-700 border-red-100",
  },
};

const resultMeta: Record<ResultValue, { label: string; className: string }> = {
  PENDING: {
    label: "Đang xử lý",
    className: "bg-slate-50 text-slate-600 border-slate-100",
  },
  HIRED: {
    label: "Tuyển thành công",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  REJECTED: {
    label: "Bị từ chối",
    className: "bg-red-50 text-red-700 border-red-100",
  },
  WITHDRAWN: {
    label: "Rút lui",
    className: "bg-amber-50 text-amber-700 border-amber-100",
  },
};

const feedbackDecisionLabels: Record<FeedbackDecisionValue, string> = {
  INTERESTED: "Quan tâm",
  NEED_MORE_INFO: "Cần thêm thông tin",
  INTERVIEW: "Muốn phỏng vấn",
  REJECTED: "Từ chối",
};

const stageOptions = [
  { value: "ALL", label: "Tất cả" },
  ...Object.entries(stageMeta).map(([value, meta]) => ({
    value,
    label: meta.label,
  })),
];

const resultOptions = [
  { value: "ALL", label: "Tất cả" },
  ...Object.entries(resultMeta).map(([value, meta]) => ({
    value,
    label: meta.label,
  })),
];

function formatDate(value: string | null) {
  if (!value) return "Chưa có lịch";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function Badge({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        className
      )}
    >
      {label}
    </span>
  );
}

export function CompanySubmissionsInbox({
  submissions,
  jobs,
  filters,
  total,
  page,
  pageSize,
  stageCounts,
}: {
  submissions: CompanySubmissionItem[];
  jobs: CompanySubmissionsJobOption[];
  filters: CompanySubmissionsFilters;
  total: number;
  page: number;
  pageSize: number;
  stageCounts: Partial<Record<StageValue, number>>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [feedbackDecision, setFeedbackDecision] =
    useState<FeedbackDecisionValue>("INTERESTED");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const selectedSubmission = useMemo(() => {
    const selectedId = Number(filters.selected);
    return (
      submissions.find((submission) => submission.id === selectedId) ??
      submissions[0] ??
      null
    );
  }, [filters.selected, submissions]);

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  function selectSubmission(submissionId: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("selected", String(submissionId));
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilters() {
    router.push(pathname);
  }

  function submitFeedback() {
    if (!selectedSubmission) return;
    setActionMessage(null);
    startTransition(async () => {
      const result = await submitCompanySubmissionFeedbackAction(
        selectedSubmission.id,
        feedbackDecision,
        feedbackMessage
      );
      setActionMessage(result.message);
      if (result.success) {
        setFeedbackMessage("");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <form className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1fr]">
          <label className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Từ khóa
            </span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                name="q"
                defaultValue={filters.q}
                placeholder="Tên, email, vị trí, job order"
                className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary"
              />
            </div>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Job order
            </span>
            <select
              name="job"
              defaultValue={filters.job}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
            >
              <option value="">Tất cả job</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} ({job.submissions})
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Stage
            </span>
            <select
              name="stage"
              defaultValue={filters.stage}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
            >
              {stageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Kết quả
            </span>
            <select
              name="result"
              defaultValue={filters.result}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
            >
              {resultOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">
              Feedback
            </span>
            <select
              name="feedback"
              defaultValue={filters.feedback}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
            >
              <option value="">Tất cả</option>
              <option value="with">Đã có feedback</option>
              <option value="without">Chưa có feedback</option>
            </select>
          </label>

          <div className="flex items-end gap-2 lg:col-span-5">
            <button
              type="submit"
              className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-sm transition hover:bg-primary-hover"
            >
              Lọc submission
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="h-10 rounded-lg border border-border px-4 text-sm font-medium text-muted transition hover:border-primary/40 hover:text-foreground"
            >
              Xóa lọc
            </button>
          </div>
        </form>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.9fr)]">
        <section className="min-w-0 rounded-xl border border-border bg-surface shadow-sm">
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Hồ sơ đã gửi
              </h2>
              <p className="text-sm text-muted">
                Hiển thị {from}-{to} / {total} submission
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {Object.entries(stageMeta).map(([stage, meta]) => (
                <span
                  key={stage}
                  className="rounded-full border border-border px-2 py-1 text-muted"
                >
                  {meta.label}:{" "}
                  <strong className="text-foreground">
                    {stageCounts[stage as StageValue] ?? 0}
                  </strong>
                </span>
              ))}
            </div>
          </div>

          {submissions.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
              <Send className="h-12 w-12 text-muted/40" />
              <p className="mt-3 text-base font-medium text-foreground">
                Chưa có submission phù hợp
              </p>
              <p className="mt-1 max-w-md text-sm text-muted">
                Thử xóa bớt bộ lọc hoặc chọn job order khác để xem hồ sơ.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    <th className="px-4 py-3">Ứng viên</th>
                    <th className="px-4 py-3">Job order</th>
                    <th className="px-4 py-3">Stage</th>
                    <th className="px-4 py-3">Kết quả</th>
                    <th className="px-4 py-3">Feedback</th>
                    <th className="px-4 py-3">Cập nhật</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {submissions.map((submission) => {
                    const isSelected =
                      selectedSubmission?.id === submission.id;
                    const latestFeedback = submission.feedback[0];
                    return (
                      <tr
                        key={submission.id}
                        className={cn(
                          "cursor-pointer transition hover:bg-muted/20",
                          isSelected && "bg-primary/5"
                        )}
                        onClick={() => selectSubmission(submission.id)}
                      >
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            className="text-left font-medium text-foreground hover:text-primary"
                          >
                            {submission.candidate.fullName}
                          </button>
                          <p className="mt-0.5 text-xs text-muted">
                            {submission.candidate.currentPosition ||
                              "Chưa có vị trí hiện tại"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">
                            {submission.jobOrder.title}
                          </p>
                          <p className="mt-0.5 text-xs text-muted">
                            {submission.jobOrder.status}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            label={stageMeta[submission.stage].label}
                            className={stageMeta[submission.stage].className}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            label={resultMeta[submission.result].label}
                            className={resultMeta[submission.result].className}
                          />
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {latestFeedback?.decision
                            ? feedbackDecisionLabels[latestFeedback.decision]
                            : "Chưa có"}
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {formatDate(submission.updatedAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="rounded-xl border border-border bg-surface shadow-sm">
          {!selectedSubmission ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
              <UserRound className="h-12 w-12 text-muted/40" />
              <p className="mt-3 text-base font-medium text-foreground">
                Chọn một submission để xem preview
              </p>
            </div>
          ) : (
            <div className="space-y-5 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Preview submission
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-foreground">
                    {selectedSubmission.candidate.fullName}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {selectedSubmission.jobOrder.title}
                  </p>
                </div>
                <Badge
                  label={stageMeta[selectedSubmission.stage].label}
                  className={stageMeta[selectedSubmission.stage].className}
                />
              </div>

              {actionMessage && (
                <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted">
                  {actionMessage}
                </div>
              )}

              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted">
                  <Briefcase className="h-4 w-4" />
                  {selectedSubmission.candidate.currentPosition ||
                    "Chưa có vị trí hiện tại"}
                </div>
                <a
                  href={`mailto:${selectedSubmission.candidate.email ?? ""}`}
                  className="flex items-center gap-2 text-muted hover:text-primary"
                >
                  <Mail className="h-4 w-4" />
                  {selectedSubmission.candidate.email || "Chưa có email"}
                </a>
                <div className="flex items-center gap-2 text-muted">
                  <Phone className="h-4 w-4" />
                  {selectedSubmission.candidate.phone || "Chưa có số điện thoại"}
                </div>
                <div className="flex items-center gap-2 text-muted">
                  <CalendarClock className="h-4 w-4" />
                  Lịch phỏng vấn: {formatDate(selectedSubmission.interviewDate)}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-3 text-sm text-muted">
                <p>
                  <strong className="text-foreground">Công ty hiện tại:</strong>{" "}
                  {selectedSubmission.candidate.currentCompany || "Chưa có"}
                </p>
                <p className="mt-1">
                  <strong className="text-foreground">Ngành:</strong>{" "}
                  {selectedSubmission.candidate.industry || "Chưa có"}
                </p>
                <p className="mt-1">
                  <strong className="text-foreground">Kinh nghiệm:</strong>{" "}
                  {selectedSubmission.candidate.yearsOfExp ?? "Chưa có"} năm
                </p>
                <p className="mt-1">
                  <strong className="text-foreground">Địa điểm:</strong>{" "}
                  {selectedSubmission.candidate.location || "Chưa có"}
                </p>
                {selectedSubmission.candidate.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {selectedSubmission.candidate.skills.slice(0, 12).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-muted/30 px-2 py-1 text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">CV</p>
                {selectedSubmission.candidate.cvFileUrl ? (
                  <a
                    href={selectedSubmission.candidate.cvFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary/50 hover:text-primary"
                  >
                    <Download className="h-4 w-4" />
                    {selectedSubmission.candidate.cvFileName || "Tải CV"}
                  </a>
                ) : (
                  <p className="rounded-lg bg-muted/20 px-3 py-2 text-sm text-muted">
                    Chưa có CV đính kèm.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  Ghi chú client-visible
                </p>
                <div className="max-h-40 overflow-auto rounded-lg border border-border bg-background p-3 text-sm leading-6 text-muted">
                  {selectedSubmission.notes || "Chưa có ghi chú."}
                </div>
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <MessageSquareText className="h-4 w-4" />
                  Feedback của công ty
                </p>
                {selectedSubmission.feedback.length > 0 ? (
                  <div className="max-h-48 space-y-2 overflow-auto">
                    {selectedSubmission.feedback.map((feedback) => (
                      <div
                        key={feedback.id}
                        className="rounded-lg border border-border bg-background p-3 text-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-foreground">
                            {feedback.decision
                              ? feedbackDecisionLabels[feedback.decision]
                              : "Feedback"}
                          </span>
                          <span className="text-xs text-muted">
                            {formatDate(feedback.createdAt)}
                          </span>
                        </div>
                        {feedback.message && (
                          <p className="mt-2 text-muted">{feedback.message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg bg-muted/20 px-3 py-2 text-sm text-muted">
                    Chưa có feedback từ công ty.
                  </p>
                )}

                <div className="grid gap-2">
                  <select
                    value={feedbackDecision}
                    onChange={(event) =>
                      setFeedbackDecision(event.target.value as FeedbackDecisionValue)
                    }
                    className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
                  >
                    {Object.entries(feedbackDecisionLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={feedbackMessage}
                    onChange={(event) => setFeedbackMessage(event.target.value)}
                    rows={4}
                    placeholder="Nhập nhận xét hoặc câu hỏi cho đội tuyển dụng"
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
                  />
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={submitFeedback}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-hover disabled:opacity-50"
                  >
                    {isPending ? (
                      "Đang gửi..."
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Gửi feedback
                      </>
                    )}
                  </button>
                  <p className="text-xs text-muted">
                    Feedback được gửi cho admin/recruiter, không tự đổi pipeline nội bộ.
                  </p>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
