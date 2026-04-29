import { redirect } from "next/navigation";

export default async function JobPostingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();

  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", params.page);

  redirect(`/company/job-postings${query.size ? `?${query.toString()}` : ""}`);
}
