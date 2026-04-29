import PipelineRoute from "@/app/(employer)/employer/(portal)/pipeline/PipelineRoute";

export const metadata = { title: "Pipeline tuyen dung - Company Portal" };

export default function CompanyPipelinePage(props: {
  searchParams: Promise<{ job?: string }>;
}) {
  return (
    <PipelineRoute
      {...props}
      routeBase="/company/pipeline"
      jobPostingBase="/company/job-postings"
    />
  );
}
