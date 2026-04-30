import Link from "next/link";
import { Briefcase, ExternalLink, SendHorizonal } from "lucide-react";

type HistoryData = {
  applications: Array<{
    id: number;
    status: string;
    createdAt: Date;
    cvFileName: string | null;
    jobPosting: {
      id: number;
      title: string;
      slug: string;
      jobOrderId: number | null;
      employer: { companyName: string };
    };
  }>;
  submissions: Array<{
    id: number;
    stage: string;
    result: string;
    updatedAt: Date;
    jobOrder: {
      id: number;
      title: string;
      client: { companyName: string };
    };
  }>;
};

function formatDate(value: Date) {
  return value.toLocaleDateString("vi-VN");
}

export function CandidateApplicationHistory({ history }: { history: HistoryData }) {
  const hasHistory = history.applications.length > 0 || history.submissions.length > 0;

  if (!hasHistory) return null;

  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">Lịch sử ứng tuyển</h2>
        <p className="mt-1 text-sm text-muted">
          Theo dõi hồ sơ public từ FDIWork và các lần gửi sang client trong CRM.
        </p>
      </div>

      <div className="space-y-3">
        {history.applications.map((application) => (
          <div key={`app-${application.id}`} className="rounded-lg border border-border bg-background p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <Link
                    href={`/viec-lam/${application.jobPosting.slug}`}
                    className="truncate text-sm font-semibold text-foreground hover:text-primary"
                    target="_blank"
                  >
                    {application.jobPosting.title}
                  </Link>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {application.jobPosting.employer.companyName} · Apply {formatDate(application.createdAt)}
                  {application.cvFileName ? ` · ${application.cvFileName}` : ""}
                </p>
              </div>
              <span className="w-fit rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                FDIWork: {application.status}
              </span>
            </div>
          </div>
        ))}

        {history.submissions.map((submission) => (
          <div key={`sub-${submission.id}`} className="rounded-lg border border-border bg-background p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <SendHorizonal className="h-4 w-4 text-emerald-600" />
                  <Link
                    href={`/jobs/${submission.jobOrder.id}`}
                    className="truncate text-sm font-semibold text-foreground hover:text-primary"
                  >
                    {submission.jobOrder.title}
                  </Link>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {submission.jobOrder.client.companyName} · Cập nhật {formatDate(submission.updatedAt)}
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                <ExternalLink className="h-3 w-3" />
                {submission.stage} · {submission.result}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
