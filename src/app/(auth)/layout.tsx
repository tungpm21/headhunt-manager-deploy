// Auth route group layout
// Login and authentication pages live here

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      {children}
    </div>
  );
}
