import { redirect } from "next/navigation";

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const target = new URLSearchParams({ tab: "posts" });

  if (params.status) {
    target.set("postStatus", params.status);
  }
  if (params.page) {
    target.set("postPage", params.page);
  }

  redirect(`/jobs?${target.toString()}`);
}
