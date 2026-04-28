"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Building,
    Briefcase,
    FileText,
    LayoutDashboard,
    LogOut,
    Mail,
    Send,
    Users,
    User,
    CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompanyPortalSession } from "@/lib/company-portal-auth";
import { companyPortalLogout } from "@/lib/company-portal-actions";

type NavItem = {
    name: string;
    href: string;
    icon: React.ElementType;
    show: boolean;
};

export function CompanyPortalSidebar({
    session,
}: {
    session: CompanyPortalSession;
}) {
    const pathname = usePathname();

    const navigation: NavItem[] = [
        { name: "Tổng quan", href: "/company/dashboard", icon: LayoutDashboard, show: true },
        {
            name: "Tin tuyển dụng",
            href: "/company/job-postings",
            icon: FileText,
            show: session.capabilities.employer,
        },
        {
            name: "Ứng tuyển",
            href: "/company/applications",
            icon: Mail,
            show: session.capabilities.employer,
        },
        {
            name: "Job Orders",
            href: "/company/job-orders",
            icon: Briefcase,
            show: session.capabilities.client,
        },
        {
            name: "Submissions",
            href: "/company/submissions",
            icon: Send,
            show: session.capabilities.client,
        },
        {
            name: "Hồ sơ công ty",
            href: "/company/profile",
            icon: Building,
            show: session.capabilities.employer,
        },
        {
            name: "Người dùng",
            href: "/company/users",
            icon: Users,
            show: session.capabilities.manageUsers,
        },
        {
            name: "Thanh toán",
            href: "/company/billing",
            icon: CreditCard,
            show: session.capabilities.billing,
        },
    ];

    const visibleNav = navigation.filter((item) => item.show);

    return (
        <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-border bg-surface text-foreground">
            <div className="flex h-16 items-center border-b border-border px-6">
                <span className="text-2xl font-bold tracking-tight text-primary">CP</span>
                <span className="ml-3 truncate font-semibold tracking-tight text-foreground">
                    Company Portal
                </span>
            </div>

            <nav className="flex-1 space-y-1.5 px-3 py-6">
                <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                    Menu
                </p>
                {visibleNav.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
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

            {/* User info + Logout */}
            <div className="border-t border-border p-4 space-y-3">
                <div className="flex items-center gap-2 px-3 text-sm text-muted">
                    <User className="h-4 w-4" />
                    <span className="truncate">{session.email}</span>
                </div>
                <form action={companyPortalLogout}>
                    <button
                        type="submit"
                        className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
                    >
                        <LogOut className="mr-3 h-5 w-5" aria-hidden="true" />
                        Đăng xuất
                    </button>
                </form>
            </div>
        </aside>
    );
}
