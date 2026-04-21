import { notFound } from "next/navigation";
import { getAdminJobPostingById } from "@/lib/admin-job-posting-actions";
import { JobPostingEditForm } from "./job-posting-edit-form";

export default async function JobPostingEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const jobId = Number(id);

  if (!Number.isInteger(jobId) || jobId <= 0) {
    notFound();
  }

  const job = await getAdminJobPostingById(jobId);

  if (!job) {
    notFound();
  }

  return (
    <JobPostingEditForm
      job={{
        id: job.id,
        title: job.title,
        slug: job.slug,
        description: job.description,
        requirements: job.requirements,
        benefits: job.benefits,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryDisplay: job.salaryDisplay,
        industry: job.industry,
        position: job.position,
        location: job.location,
        workType: job.workType,
        quantity: job.quantity,
        skills: job.skills,
        industrialZone: job.industrialZone,
        requiredLanguages: job.requiredLanguages,
        languageProficiency: job.languageProficiency,
        visaSupport: job.visaSupport,
        shiftType: job.shiftType,
        status: job.status,
        rejectReason: job.rejectReason,
        viewCount: job.viewCount,
        applyCount: job.applyCount,
        jobOrderId: job.jobOrderId,
        employer: job.employer,
        applicationsCount: job._count.applications,
      }}
    />
  );
}
