import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/authz";
import { getWorkspaceForEmployer } from "@/lib/workspace";

export default async function EmployerEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const employerId = Number(id);

  if (!Number.isInteger(employerId)) {
    redirect("/companies?role=employer&missing=employer:invalid");
  }

  const workspace = await getWorkspaceForEmployer(employerId);
  redirect(
    workspace
      ? `/companies/${workspace.id}?tab=mapping`
      : `/companies?role=employer&missing=employer:${employerId}`
  );
}
