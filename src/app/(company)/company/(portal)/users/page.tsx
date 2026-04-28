import { requireCompanyPortalSession } from "@/lib/company-portal-auth";
import { Users } from "lucide-react";

export const metadata = { title: "Người dùng — Company Portal" };

export default async function CompanyUsersPage() {
  const session = await requireCompanyPortalSession();
  if (!session.capabilities.manageUsers) {
    return (
      <div className="text-center py-12 text-muted">
        <p>Chỉ Owner mới có quyền quản lý người dùng.</p>
      </div>
    );
  }
  return (
    <div className="text-center py-12 text-muted">
      <Users className="mx-auto h-10 w-10 mb-3 opacity-40" />
      <p className="text-lg font-medium">Quản lý người dùng</p>
      <p className="text-sm mt-1">Sẽ được xây dựng trong Phase 3 (mở rộng).</p>
    </div>
  );
}
