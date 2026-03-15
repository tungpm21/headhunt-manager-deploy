import { Sidebar } from "@/components/sidebar";
import { auth } from "@/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header (Mobile toggle & User profile info) can go here */}
        <header className="h-16 flex items-center justify-between border-b border-border bg-surface px-6 md:justify-end shrink-0">
          <div className="md:hidden font-bold text-primary">HM</div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
              <p className="text-xs text-muted mt-1">{session?.user?.role === "ADMIN" ? "Admin" : "Thành viên"}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6 lg:p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
