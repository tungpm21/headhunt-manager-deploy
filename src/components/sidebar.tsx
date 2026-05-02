"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Building,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  LogOut,
  Package,
  SendHorizonal,
  Settings,
  UploadCloud,
  Users,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import type { NotificationCounts } from "@/lib/notifications";

type BadgeKey = keyof Pick<NotificationCounts, "pendingJobs" | "newApplications">;

type SidebarNavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  activePrefixes?: string[];
  adminBadgeKeys?: BadgeKey[];
};

const navigation: SidebarNavItem[] = [
  { name: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
  { name: "Talent Pool", href: "/candidates", icon: Users },
  { name: "Công ty", href: "/companies", icon: Building },
  {
    name: "Tuyển dụng",
    href: "/jobs",
    icon: Briefcase,
    activePrefixes: ["/jobs", "/moderation"],
    adminBadgeKeys: ["pendingJobs", "newApplications"],
  },
  { name: "Hồ sơ gửi khách", href: "/submissions", icon: SendHorizonal },
  { name: "Nhập dữ liệu", href: "/import", icon: UploadCloud },
];

const fdiworkNav: SidebarNavItem[] = [
  { name: "Gói dịch vụ", href: "/packages", icon: Package },
  { name: "Cấu hình", href: "/settings/options", icon: Settings },
  { name: "Bài viết", href: "/blog", icon: FileText },
];

function isItemActive(pathname: string, item: SidebarNavItem) {
  if (item.href === "/dashboard") {
    return pathname === "/dashboard";
  }

  if (item.activePrefixes) {
    return item.activePrefixes.some((prefix) => pathname.startsWith(prefix));
  }

  return pathname.startsWith(item.href);
}

function getBadgeCount(
  item: SidebarNavItem,
  isAdmin: boolean,
  counts?: NotificationCounts
) {
  if (!isAdmin || !item.adminBadgeKeys || !counts) {
    return 0;
  }

  return item.adminBadgeKeys.reduce((total, key) => total + (counts[key] ?? 0), 0);
}

function SidebarLink({
  item,
  isAdmin,
  counts,
}: {
  item: SidebarNavItem;
  isAdmin: boolean;
  counts?: NotificationCounts;
}) {
  const pathname = usePathname();
  const isActive = isItemActive(pathname, item);
  const badgeCount = getBadgeCount(item, isAdmin, counts);

  return (
    <Link
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
      <span className="truncate">{item.name}</span>
      {badgeCount > 0 ? (
        <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-bold text-white">
          {badgeCount}
        </span>
      ) : null}
    </Link>
  );
}

export function Sidebar({
  isAdmin,
  className,
  counts,
}: {
  isAdmin: boolean;
  className?: string;
  counts?: NotificationCounts;
}) {
  const [liveCounts, setLiveCounts] = useState(counts);

  useEffect(() => {
    const handleNotificationUpdate = (event: Event) => {
      setLiveCounts((event as CustomEvent<NotificationCounts>).detail);
    };

    window.addEventListener("admin-notifications:update", handleNotificationUpdate);
    return () => {
      window.removeEventListener(
        "admin-notifications:update",
        handleNotificationUpdate
      );
    };
  }, []);

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
        {navigation.map((item) => (
          <SidebarLink
            key={item.name}
            item={item}
            isAdmin={isAdmin}
            counts={liveCounts}
          />
        ))}

        {isAdmin ? (
          <>
            <p className="px-3 pb-2 pt-6 text-xs font-semibold uppercase tracking-wider text-muted">
              FDIWork
            </p>
            {fdiworkNav.map((item) => (
              <SidebarLink key={item.name} item={item} isAdmin={isAdmin} counts={liveCounts} />
            ))}
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
