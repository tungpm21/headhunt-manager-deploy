import { Building } from "lucide-react";
import EmployerCompanyProfilePage from "@/app/(employer)/employer/(portal)/company/page";
import { requireCompanyPortalSession } from "@/lib/company-portal-auth";

export const metadata = { title: "Hồ sơ công ty - Company Portal" };

export default async function CompanyProfilePage() {
  const session = await requireCompanyPortalSession();

  if (!session.capabilities.employer) {
    return (
      <div className="rounded-xl border border-border bg-surface p-12 text-center text-muted">
        <Building className="mx-auto mb-3 h-10 w-10 opacity-40" />
        <p className="text-lg font-medium text-foreground">
          Workspace chưa liên kết Employer
        </p>
        <p className="mt-1 text-sm">
          Liên hệ admin để bật tính năng chỉnh sửa hồ sơ công ty.
        </p>
      </div>
    );
  }

  return <EmployerCompanyProfilePage />;
}
