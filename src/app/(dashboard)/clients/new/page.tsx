import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/authz";

export default async function NewClientPage() {
  await requireAdmin();
  redirect("/companies?role=client");
}
