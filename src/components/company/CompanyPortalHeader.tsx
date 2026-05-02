import type { CompanyPortalSession } from "@/lib/company-portal-auth";
import { getCompanyPortalNotificationData } from "@/lib/company-portal-notifications";
import { ThemeToggle } from "@/components/theme-toggle";
import { CompanyPortalNotificationBell } from "@/components/company/CompanyPortalNotificationBell";
import { CompanyPortalSearchTrigger } from "@/components/company/CompanyPortalSearchTrigger";

const roleLabel: Record<CompanyPortalSession["role"], string> = {
  OWNER: "Owner",
  MEMBER: "Member",
  VIEWER: "Viewer",
};

export async function CompanyPortalHeader({
  session,
}: {
  session: CompanyPortalSession;
}) {
  const notificationData = await getCompanyPortalNotificationData(session);
  const avatarLabel = session.email.charAt(0).toUpperCase();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
      <div className="font-bold text-primary md:hidden">CP</div>

      <div className="ml-auto flex min-w-0 items-center gap-3">
        <CompanyPortalSearchTrigger />
        <CompanyPortalNotificationBell data={notificationData} />
        <ThemeToggle />
        <div className="hidden max-w-56 text-right sm:block">
          <p className="truncate text-sm font-medium leading-none text-foreground">
            {session.email}
          </p>
          <p className="mt-1 text-xs text-muted">{roleLabel[session.role]}</p>
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
          {avatarLabel || "C"}
        </div>
      </div>
    </header>
  );
}
