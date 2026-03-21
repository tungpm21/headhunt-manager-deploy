import type { Metadata } from "next";
import { EmployerSidebar } from "@/components/employer/EmployerSidebar";
import { EmployerHeader } from "@/components/employer/EmployerHeader";

export const metadata: Metadata = {
  title: {
    default: "Quản lý tuyển dụng | FDIWork",
    template: "%s | FDIWork Employer",
  },
  description: "Quản lý tin tuyển dụng, ứng viên và hồ sơ công ty trên FDIWork.",
};

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <EmployerSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <EmployerHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
