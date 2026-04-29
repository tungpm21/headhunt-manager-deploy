import { redirect } from "next/navigation";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const target = new URLSearchParams({ tab: "applications" });

  if (params.status) {
    target.set("applicationStatus", params.status);
  }
  if (params.page) {
    target.set("applicationPage", params.page);
  }

  redirect(`/jobs?${target.toString()}`);
}
