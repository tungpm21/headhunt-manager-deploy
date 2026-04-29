import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/authz";

export default async function ClientsPage() {
  await requireAdmin();
  redirect("/companies?role=client");
}
