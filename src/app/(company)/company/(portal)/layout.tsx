import { requireCompanyPortalSession } from "@/lib/company-portal-auth";
import { CompanyPortalSidebar } from "@/components/company/CompanyPortalSidebar";
import { CompanyPortalHeader } from "@/components/company/CompanyPortalHeader";
import { CompanyPortalSearch } from "@/components/company/CompanyPortalSearch";

export default async function CompanyPortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await requireCompanyPortalSession();

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <CompanyPortalSearch />
            <CompanyPortalSidebar session={session} />
            <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
                <CompanyPortalHeader session={session} />
                <main className="min-w-0 flex-1 overflow-auto">
                    <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
                </main>
            </div>
        </div>
    );
}
