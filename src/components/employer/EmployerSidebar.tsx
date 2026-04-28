"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  CreditCard,
  ListChecks,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutEmployerAction } from "@/lib/employer-actions";

const navigation = [
  { name: "Tổng quan", href: "/employer/dashboard", icon: LayoutDashboard },
  { name: "Tin tuyển dụng", href: "/employer/job-postings", icon: Briefcase },
  { name: "Pipeline tuyển dụng", href: "/employer/pipeline", icon: ListChecks },
  { name: "Hồ sơ công ty", href: "/employer/company", icon: Building2 },
  { name: "Gói dịch vụ", href: "/employer/subscription", icon: CreditCard },
];

export function EmployerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-teal-100 bg-white h-screen sticky top-0">
      <div className="flex h-16 items-center border-b border-teal-100 px-6">
        <span className="text-2xl font-bold tracking-tight text-teal-600">
          FDI
        </span>
        <span className="ml-1 text-2xl font-bold tracking-tight text-gray-800">
          Work
        </span>
      </div>

      <nav className="flex-1 space-y-1.5 px-3 py-6">
        <p className="px-3 pb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
          Quản lý
        </p>
        {navigation.map((item) => {
          const isActive =
            item.href === "/employer/dashboard"
              ? pathname === "/employer/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-teal-600 text-white shadow-sm shadow-teal-200"
                  : "text-gray-500 hover:bg-teal-50 hover:text-teal-700"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  isActive
                    ? "text-white"
                    : "text-gray-400 group-hover:text-teal-600"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-teal-100 p-4">
        <form action={logoutEmployerAction}>
          <button
            type="submit"
            className="group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" aria-hidden="true" />
            Đăng xuất
          </button>
        </form>
      </div>
    </aside>
  );
}
