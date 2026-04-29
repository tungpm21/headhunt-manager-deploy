import { ListChecks } from "lucide-react";
import { EmployerPipelineBoard } from "@/components/employer/EmployerPipelineBoard";
import { getRecruitmentPipelineData } from "@/lib/employer-actions";

type PageProps = {
  searchParams: Promise<{ job?: string }>;
  routeBase?: string;
  jobPostingBase?: string;
};

export default async function PipelineRoute({
  searchParams,
  routeBase = "/employer/pipeline",
  jobPostingBase = "/employer/job-postings",
}: PageProps) {
  const params = await searchParams;
  const selectedJobId = params.job ? Number.parseInt(params.job, 10) : null;
  const normalizedJobId =
    selectedJobId && Number.isInteger(selectedJobId) ? selectedJobId : null;
  const data = await getRecruitmentPipelineData(normalizedJobId ?? undefined);

  const applications = data.applications.map((application) => ({
    id: application.id,
    fullName: application.fullName,
    email: application.email,
    phone: application.phone,
    coverLetter: application.coverLetter,
    cvFileUrl: application.cvFileUrl,
    cvFileName: application.cvFileName,
    status: application.status,
    createdAt: application.createdAt.toISOString(),
    updatedAt: application.updatedAt.toISOString(),
    jobPosting: application.jobPosting,
  }));

  const jobs = data.jobs.map((job) => ({
    id: job.id,
    title: job.title,
    status: job.status,
    applicationsCount: job._count.applications,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-800">
          <ListChecks className="h-7 w-7 text-teal-600" />
          Pipeline tuyển dụng
        </h1>
        <p className="mt-1 text-gray-500">
          Quản lý ứng viên theo từng tin tuyển dụng, có Kanban phụ và thao tác nhanh không cần kéo thả.
        </p>
      </div>

      <EmployerPipelineBoard
        key={normalizedJobId ?? "job-selector"}
        initialApplications={applications}
        jobs={jobs}
        selectedJobId={normalizedJobId}
        routeBase={routeBase}
        jobPostingBase={jobPostingBase}
      />
    </div>
  );
}
