import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Briefcase, Building2 } from "lucide-react";
import { requireViewerScope } from "@/lib/authz";
import { getAssignableUsers, getJobBridgeSummary, getJobById } from "@/lib/jobs";
import { getAllClients } from "@/lib/clients";
import { OPTION_GROUPS } from "@/lib/config-option-definitions";
import { getOptionsForSelect } from "@/lib/config-options";
import { JobBridgeCard } from "@/components/jobs/job-bridge-card";
import { JobInfoCard } from "@/components/jobs/job-info-card";
import { PipelineViewSwitcher } from "@/components/jobs/pipeline-view-switcher";
import {
  SerializedJobBridgeSummary,
  SerializedJobCandidateWithRelations,
  SerializedJobOrderWithRelations,
} from "@/types/job";

export const metadata = { title: "Chi tiết Vị trí tuyển dụng — Headhunt Manager" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: PageProps) {
  const scope = await requireViewerScope();
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  if (Number.isNaN(id)) notFound();

  const [job, users, bridge] = await Promise.all([
    getJobById(id, scope),
    getAssignableUsers(),
    getJobBridgeSummary(id, scope),
  ]);

  if (!job || !bridge) notFound();

  const [clientOptions, industryOptions, statusOptions, feeTypeOptions] = await Promise.all([
    getAllClients({ pageSize: 10, includeIds: [job.clientId] }, scope),
    getOptionsForSelect(OPTION_GROUPS.industry, { currentValue: job.industry }),
    getOptionsForSelect(OPTION_GROUPS.jobStatus, { currentValue: job.status }),
    getOptionsForSelect(OPTION_GROUPS.feeType, { currentValue: job.feeType }),
  ]);

  const serializedJob = JSON.parse(
    JSON.stringify(job)
  ) as SerializedJobOrderWithRelations;
  const serializedCandidates = JSON.parse(
    JSON.stringify(job.candidates || [])
  ) as SerializedJobCandidateWithRelations[];
  const serializedBridge = JSON.parse(
    JSON.stringify(bridge)
  ) as SerializedJobBridgeSummary;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <Link
            href="/jobs"
            className="mb-4 inline-flex items-center text-sm font-medium text-muted transition hover:text-foreground"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Danh sách Job Orders
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
              <div className="mt-1 flex items-center text-sm text-muted">
                <Building2 className="mr-1.5 h-4 w-4" />
                Dự án cho:
                <Link
                  href={`/clients/${job.clientId}`}
                  className="ml-1 font-medium transition hover:text-primary"
                >
                  {job.client.companyName}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <JobInfoCard
          job={serializedJob}
          initialClients={clientOptions.clients}
          users={users}
          industryOptions={industryOptions}
          statusOptions={statusOptions}
          feeTypeOptions={feeTypeOptions}
        />

        <JobBridgeCard bridge={serializedBridge} />

        <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
          <PipelineViewSwitcher
            jobId={job.id}
            jobTitle={job.title}
            companyName={job.client.companyName}
            requiredSkills={job.requiredSkills}
            candidates={serializedCandidates}
          />
        </div>
      </div>
    </div>
  );
}
