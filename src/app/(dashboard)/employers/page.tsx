import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/authz";

export default async function EmployersPage() {
  await requireAdmin();
  redirect("/companies?role=employer");
}
