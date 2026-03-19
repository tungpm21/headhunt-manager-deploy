"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Building2, Briefcase, LayoutDashboard, LogOut, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const navigation = [
  { name: "Tổng quan", href: "/", icon: LayoutDashboard },
  { name: "Ứng viên", href: "/candidates", icon: Users },
  { name: "Khách hàng", href: "/clients", icon: Building2 },
  { name: "Job Orders", href: "/jobs", icon: Briefcase },
  { name: "Nhập dữ liệu", href: "/import", icon: UploadCloud },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-surface text-foreground h-screen sticky top-0">
      <div className="flex h-16 items-center border-b border-border px-6">
        <span className="text-2xl font-bold tracking-tight text-primary">HM</span>
        <span className="ml-3 font-semibold tracking-tight text-foreground truncate">
          Headhunt Manager
        </span>
      </div>

      <nav className="flex-1 space-y-1.5 px-3 py-6">
        <p className="px-3 pb-2 text-xs font-semibold tracking-wider text-muted uppercase">
          Menu chính
        </p>
        {navigation.map((item) => {
          const isActive = 
            item.href === "/" 
              ? pathname === "/" 
              : pathname.startsWith(item.href);
              
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:bg-border/50 hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-white" : "text-muted group-hover:text-foreground"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" aria-hidden="true" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
