import { requireCompanyPortalSession } from "@/lib/company-portal-auth";
import { CreditCard } from "lucide-react";

export const metadata = { title: "Thanh toán — Company Portal" };

export default async function CompanyBillingPage() {
  const session = await requireCompanyPortalSession();
  if (!session.capabilities.billing) {
    return (
      <div className="text-center py-12 text-muted">
        <p>Workspace chưa liên kết Employer hoặc chưa có subscription.</p>
      </div>
    );
  }
  return (
    <div className="text-center py-12 text-muted">
      <CreditCard className="mx-auto h-10 w-10 mb-3 opacity-40" />
      <p className="text-lg font-medium">Thanh toán & Subscription</p>
      <p className="text-sm mt-1">Sẽ được xây dựng trong Phase 6.</p>
    </div>
  );
}
