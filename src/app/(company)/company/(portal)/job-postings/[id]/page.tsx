import JobPostingDetailRoute from "@/app/(employer)/employer/(portal)/job-postings/[id]/JobPostingDetailRoute";

export default function CompanyJobPostingDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <JobPostingDetailRoute
      {...props}
      routeBase="/company/job-postings"
    />
  );
}
