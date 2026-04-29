import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/authz";
import { getWorkspaceForClient } from "@/lib/workspace";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const clientId = Number(id);

  if (!Number.isInteger(clientId)) {
    redirect("/companies?role=client&missing=client:invalid");
  }

  const workspace = await getWorkspaceForClient(clientId);
  redirect(
    workspace
      ? `/companies/${workspace.id}`
      : `/companies?role=client&missing=client:${clientId}`
  );
}
