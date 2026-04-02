import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Briefcase, Building2 } from "lucide-react";
import { getJobById } from "@/lib/jobs";
import { getAllClients } from "@/lib/clients";
import { JobForm } from "@/components/jobs/job-form";
import { JobPipeline } from "@/components/jobs/job-pipeline";
import { AssignCandidateModal } from "@/components/jobs/assign-candidate-modal";

export const metadata = { title: "Chi tiết Vị trí tuyển dụng — Headhunt Manager" };

interface PageProps { params: Promise<{ id: string }> }

export default async function JobDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);
  
  if (isNaN(id)) notFound();

  const [job, clients] = await Promise.all([
    getJobById(id),
    getAllClients(),
  ]);

  if (!job) notFound();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <Link href="/jobs" className="inline-flex items-center text-sm font-medium text-muted hover:text-foreground transition mb-4">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Danh sách Job Orders
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
              <div className="mt-1 flex items-center text-sm text-muted">
                <Building2 className="h-4 w-4 mr-1.5" />
                Dự án cho: <Link href={`/clients/${job.clientId}`} className="ml-1 hover:text-primary font-medium">{job.client.companyName}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: General Info */}
        <div className="xl:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-surface shadow-sm p-6">
            <JobForm initialData={job} clients={clients} />
          </div>
        </div>

        {/* Right: Pipeline */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-surface shadow-sm p-6 sticky top-6">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">Pipeline Ứng viên</h2>
                <p className="text-xs text-muted mt-0.5">Đang có {job.candidates?.length || 0} hồ sơ được gán</p>
              </div>
              <AssignCandidateModal jobId={job.id} />
            </div>
            
            <JobPipeline 
              jobId={job.id} 
              candidates={job.candidates || []} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
