import EditJobPostingPage from "@/app/(employer)/employer/(portal)/job-postings/[id]/edit/page";

export default function CompanyEditJobPostingPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <EditJobPostingPage
      {...props}
      routeBase="/company/job-postings"
    />
  );
}
