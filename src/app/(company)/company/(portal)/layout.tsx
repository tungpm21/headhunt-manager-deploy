import { requireCompanyPortalSession } from "@/lib/company-portal-auth";
import { CompanyPortalSidebar } from "@/components/company/CompanyPortalSidebar";

export default async function CompanyPortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await requireCompanyPortalSession();

    return (
        <div className="flex min-h-screen bg-background">
            <CompanyPortalSidebar session={session} />
            <main className="flex-1 overflow-auto">
                <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
            </main>
        </div>
    );
}
