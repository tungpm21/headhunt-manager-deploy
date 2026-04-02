"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronRight } from "lucide-react";
import { NotificationCounts } from "@/lib/notifications";

const notificationItems = (counts: NotificationCounts) => [
  {
    key: "newApplications",
    label: "CV mới chờ import",
    count: counts.newApplications,
    href: "/moderation/applications",
  },
  {
    key: "pendingJobs",
    label: "Tin chờ duyệt",
    count: counts.pendingJobs,
    href: "/moderation",
  },
  {
    key: "pendingEmployers",
    label: "Nhà tuyển dụng chờ duyệt",
    count: counts.pendingEmployers,
    href: "/employers",
  },
  {
    key: "expiringJobs",
    label: "Job sắp hết hạn",
    count: counts.expiringJobs,
    href: "/jobs",
  },
] as const;

function getTotalCount(counts: NotificationCounts) {
  return (
    counts.newApplications +
    counts.pendingJobs +
    counts.pendingEmployers +
    counts.expiringJobs
  );
}

export function NotificationBell({ counts }: { counts: NotificationCounts }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const totalCount = getTotalCount(counts);
  const items = notificationItems(counts);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="relative rounded-lg border border-border bg-background p-2 text-foreground transition hover:bg-surface"
        aria-label="Mở thông báo"
      >
        <Bell className="h-5 w-5" />
        {totalCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-bold text-white">
            {totalCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Thông báo</p>
            <p className="mt-1 text-xs text-muted">
              {totalCount > 0
                ? `Bạn có ${totalCount} mục cần theo dõi`
                : "Không có gì mới"}
            </p>
          </div>

          <div className="p-2">
            {totalCount === 0 ? (
              <div className="rounded-xl bg-background px-4 py-8 text-center text-sm text-muted">
                Không có gì mới để xử lý lúc này.
              </div>
            ) : (
              items.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-3 transition hover:bg-background"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="mt-1 text-xs text-muted">
                      {item.count > 0
                        ? `${item.count} mục đang chờ xử lý`
                        : "Hiện không có mục mới"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex min-w-8 justify-center rounded-full px-2 py-1 text-xs font-semibold ${
                        item.count > 0
                          ? "bg-danger/10 text-danger"
                          : "bg-muted/20 text-muted"
                      }`}
                    >
                      {item.count}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
