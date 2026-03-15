// Dashboard route group layout
// All main app pages (candidates, clients, jobs) use this layout
// Includes sidebar navigation + main content area

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar - will be implemented as a component */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-background">
        <div className="flex h-14 items-center border-b border-border px-4">
          <span className="text-lg font-bold text-primary">HM</span>
          <span className="ml-2 text-sm font-medium text-foreground">
            Headhunt Manager
          </span>
        </div>
        <nav className="flex-1 p-3">
          <p className="px-3 py-2 text-xs font-medium uppercase text-muted">
            Menu
          </p>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-surface">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
