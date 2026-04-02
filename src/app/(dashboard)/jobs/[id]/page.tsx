import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Briefcase, Building2 } from "lucide-react";
import { getJobById } from "@/lib/jobs";
import { getAllClients } from "@/lib/clients";
import { JobForm } from "@/components/jobs/job-form";
import { PipelineViewSwitcher } from "@/components/jobs/pipeline-view-switcher";
import {
  SerializedJobCandidateWithRelations,
  SerializedJobOrderWithRelations,
} from "@/types/job";

export const metadata = { title: "Chi tiết Vị trí tuyển dụng — Headhunt Manager" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  if (Number.isNaN(id)) notFound();

  const [job, clients] = await Promise.all([getJobById(id), getAllClients()]);

  if (!job) notFound();

  const serializedJob = JSON.parse(
    JSON.stringify(job)
  ) as SerializedJobOrderWithRelations;
  const serializedCandidates = JSON.parse(
    JSON.stringify(job.candidates || [])
  ) as SerializedJobCandidateWithRelations[];

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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <JobForm initialData={serializedJob} clients={clients} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="sticky top-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
            <PipelineViewSwitcher jobId={job.id} candidates={serializedCandidates} />
          </div>
        </div>
      </div>
    </div>
  );
}
