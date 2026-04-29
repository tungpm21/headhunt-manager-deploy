import { redirect } from "next/navigation";

export default async function JobPostingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  redirect(`/company/job-postings/${id}`);
}
