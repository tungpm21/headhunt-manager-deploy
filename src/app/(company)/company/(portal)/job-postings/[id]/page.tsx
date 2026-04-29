import JobPostingDetailPage from "@/app/(employer)/employer/(portal)/job-postings/[id]/page";

export default function CompanyJobPostingDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <JobPostingDetailPage
      {...props}
      routeBase="/company/job-postings"
    />
  );
}
