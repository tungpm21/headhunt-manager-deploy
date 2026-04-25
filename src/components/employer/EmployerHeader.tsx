import { getEmployerSession } from "@/lib/employer-auth";
import { getEmployerNotificationData } from "@/lib/employer-actions";
import { EmployerNotificationBell } from "@/components/employer/EmployerNotificationBell";

export async function EmployerHeader() {
  const session = await getEmployerSession();
  const notificationData = session
    ? await getEmployerNotificationData()
    : { total: 0, items: [] };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-teal-100 bg-white/80 backdrop-blur-sm px-6">
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <span className="text-xl font-bold text-teal-600">FDI</span>
          <span className="text-xl font-bold text-gray-800">Work</span>
        </div>
        <h1 className="text-sm font-medium text-gray-500 hidden md:block">
          Quản lý tuyển dụng
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <EmployerNotificationBell initialData={notificationData} />
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-800">
            {session?.companyName ?? "Employer"}
          </p>
          <p className="text-xs text-gray-400">{session?.email}</p>
        </div>
        <div className="h-9 w-9 rounded-full bg-teal-100 flex items-center justify-center">
          <span className="text-sm font-bold text-teal-700">
            {session?.companyName?.charAt(0)?.toUpperCase() ?? "E"}
          </span>
        </div>
      </div>
    </header>
  );
}
