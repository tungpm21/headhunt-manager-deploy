import { requireCompanyPortalSession } from "@/lib/company-portal-auth";
import { Briefcase } from "lucide-react";

export const metadata = { title: "Job Orders — Company Portal" };

export default async function CompanyJobOrdersPage() {
  const session = await requireCompanyPortalSession();
  if (!session.capabilities.client) {
    return (
      <div className="text-center py-12 text-muted">
        <p>Workspace chưa liên kết Client. Liên hệ admin.</p>
      </div>
    );
  }
  return (
    <div className="text-center py-12 text-muted">
      <Briefcase className="mx-auto h-10 w-10 mb-3 opacity-40" />
      <p className="text-lg font-medium">Job Orders</p>
      <p className="text-sm mt-1">Sẽ được xây dựng trong Phase 5.</p>
    </div>
  );
}
