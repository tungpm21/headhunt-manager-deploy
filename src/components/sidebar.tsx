"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Building2,
  FileDown,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  LogOut,
  Package,
  SendHorizonal,
  ShieldCheck,
  UploadCloud,
  UserCog,
  Users,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import type { NotificationCounts } from "@/lib/notifications";

const navigation = [
  { name: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
  { name: "Talent Pool", href: "/candidates", icon: Users },
  { name: "Khách hàng", href: "/clients", icon: Building2 },
  { name: "Job Orders", href: "/jobs", icon: Briefcase },
  { name: "Submissions", href: "/submissions", icon: SendHorizonal },
  { name: "Nhập dữ liệu", href: "/import", icon: UploadCloud },
];

type BadgeKey = "pendingJobs" | "newApplications" | "pendingEmployers";

type SidebarNavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  badgeKey?: BadgeKey;
};

const fdiworkNav: SidebarNavItem[] = [
  {
    name: "Bài đăng",
    href: "/moderation",
    icon: ShieldCheck,
    badgeKey: "pendingJobs",
  },
  {
    name: "Applications",
    href: "/moderation/applications",
    icon: FileDown,
    badgeKey: "newApplications",
  },
  {
    name: "Nhà tuyển dụng",
    href: "/employers",
    icon: UserCog,
    badgeKey: "pendingEmployers",
  },
  { name: "Gói dịch vụ", href: "/packages", icon: Package },
  { name: "Bài viết", href: "/blog", icon: FileText },
];

export function Sidebar({
  isAdmin,
  className,
  counts,
}: {
  isAdmin: boolean;
  className?: string;
  counts?: NotificationCounts;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen w-64 flex-col border-r border-border bg-surface text-foreground",
        className
      )}
    >
      <div className="flex h-16 items-center border-b border-border px-6">
        <span className="text-2xl font-bold tracking-tight text-primary">HM</span>
        <span className="ml-3 truncate font-semibold tracking-tight text-foreground">
          Headhunt Manager
        </span>
      </div>

      <nav className="flex-1 space-y-1.5 px-3 py-6">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted">
          Menu chính
        </p>
        {navigation.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
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

        {isAdmin ? (
          <>
            <p className="px-3 pb-2 pt-6 text-xs font-semibold uppercase tracking-wider text-muted">
              FDIWork
            </p>
            {fdiworkNav.map((item) => {
              const isActive =
                item.href === "/moderation"
                  ? pathname === "/moderation"
                  : pathname.startsWith(item.href);
              const badgeCount = item.badgeKey ? counts?.[item.badgeKey] ?? 0 : 0;

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
                  <span>{item.name}</span>
                  {badgeCount > 0 ? (
                    <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-bold text-white">
                      {badgeCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </>
        ) : null}
      </nav>

      <div className="border-t border-border p-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
        >
          <LogOut className="mr-3 h-5 w-5" aria-hidden="true" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
