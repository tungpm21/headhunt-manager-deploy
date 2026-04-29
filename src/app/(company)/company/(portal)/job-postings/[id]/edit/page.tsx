import EditJobPostingRoute from "@/app/(employer)/employer/(portal)/job-postings/[id]/edit/EditJobPostingRoute";

export default function CompanyEditJobPostingPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <EditJobPostingRoute
      {...props}
      routeBase="/company/job-postings"
    />
  );
}
