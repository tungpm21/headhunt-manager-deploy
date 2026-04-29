import { redirect } from "next/navigation";

export default async function EmployerPipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();

  if (params.job) query.set("job", params.job);

  redirect(`/company/pipeline${query.size ? `?${query.toString()}` : ""}`);
}
