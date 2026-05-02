"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import type { NotificationCounts } from "@/lib/notifications";

export function MobileSidebar({
  isAdmin,
  counts,
}: {
  isAdmin: boolean;
  counts?: NotificationCounts;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [liveCounts, setLiveCounts] = useState(counts);
  const pathname = usePathname();

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

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsOpen(false), 0);
    return () => window.clearTimeout(timeoutId);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg border border-border bg-surface p-2 text-foreground shadow-sm md:hidden"
        aria-label="Mở menu điều hướng"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsOpen(false)}
            aria-label="Đóng menu điều hướng"
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 md:hidden">
            <div className="relative h-full animate-in slide-in-from-left duration-200">
              <Sidebar isAdmin={isAdmin} counts={liveCounts} />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 rounded-lg border border-border bg-surface p-1 text-foreground shadow-sm transition hover:bg-background"
                aria-label="Đóng menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
