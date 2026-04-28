import { ListChecks } from "lucide-react";
import { EmployerPipelineBoard } from "@/components/employer/EmployerPipelineBoard";
import { getRecruitmentPipelineData } from "@/lib/employer-actions";

type PageProps = {
  searchParams: Promise<{ job?: string }>;
};

export default async function EmployerPipelinePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedJobId = params.job ? Number.parseInt(params.job, 10) : null;
  const data = await getRecruitmentPipelineData(
    selectedJobId && Number.isInteger(selectedJobId) ? selectedJobId : undefined
  );

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
          Quản lý ứng viên theo từng trạng thái tuyển dụng cho các tin đã đăng.
        </p>
      </div>

      <EmployerPipelineBoard
        initialApplications={applications}
        jobs={jobs}
        selectedJobId={selectedJobId && Number.isInteger(selectedJobId) ? selectedJobId : null}
      />
    </div>
  );
}
