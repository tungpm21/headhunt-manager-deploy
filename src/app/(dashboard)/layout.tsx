import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileSidebar } from "@/components/mobile-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <MobileSidebar isAdmin={session.user.role === "ADMIN"} />
      <Sidebar isAdmin={session.user.role === "ADMIN"} className="hidden md:flex" />
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-6 md:justify-end">
          <div className="font-bold text-primary md:hidden">HM</div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-none">{session.user.name}</p>
              <p className="mt-1 text-xs text-muted">
                {session.user.role === "ADMIN" ? "Admin" : "Thành viên"}
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              {session.user.name?.charAt(0) || "U"}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
