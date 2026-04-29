import PipelineRoute from "@/app/(employer)/employer/(portal)/pipeline/PipelineRoute";
import { requireCompanyPortalSession } from "@/lib/company-portal-auth";
import { GitBranch } from "lucide-react";

export const metadata = { title: "Pipeline tuyen dung - Company Portal" };

function capabilityEmptyState() {
  return (
    <div className="rounded-xl border border-border bg-surface p-12 text-center text-muted">
      <GitBranch className="mx-auto mb-3 h-10 w-10 opacity-40" />
      <p className="text-lg font-medium text-foreground">
        Workspace chưa liên kết Employer
      </p>
      <p className="mt-1 text-sm">
        Liên hệ admin để bật tính năng pipeline tuyển dụng.
      </p>
    </div>
  );
}

export default async function CompanyPipelinePage(props: {
  searchParams: Promise<{ job?: string }>;
}) {
  const session = await requireCompanyPortalSession();

  if (!session.capabilities.employer) {
    return capabilityEmptyState();
  }

  return (
    <PipelineRoute
      {...props}
      routeBase="/company/pipeline"
      jobPostingBase="/company/job-postings"
    />
  );
}
