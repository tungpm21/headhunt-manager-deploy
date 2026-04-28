import { requireCompanyPortalSession } from "@/lib/company-portal-auth";
import { Building } from "lucide-react";

export const metadata = { title: "Hồ sơ công ty — Company Portal" };

export default async function CompanyProfilePage() {
  const session = await requireCompanyPortalSession();
  if (!session.capabilities.employer) {
    return (
      <div className="text-center py-12 text-muted">
        <p>Workspace chưa liên kết Employer. Liên hệ admin.</p>
      </div>
    );
  }
  return (
    <div className="text-center py-12 text-muted">
      <Building className="mx-auto h-10 w-10 mb-3 opacity-40" />
      <p className="text-lg font-medium">Hồ sơ công ty</p>
      <p className="text-sm mt-1">Sẽ được xây dựng trong Phase 6.</p>
    </div>
  );
}
