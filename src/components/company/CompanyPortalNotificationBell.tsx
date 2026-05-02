"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Check, CheckCircle2, ChevronRight } from "lucide-react";
import type {
  CompanyPortalNotificationData,
  CompanyPortalNotificationEventItem,
  CompanyPortalNotificationTone,
} from "@/lib/company-portal-notifications";

const toneClassName: Record<CompanyPortalNotificationTone, string> = {
  blue: "bg-blue-50 text-blue-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  emerald: "bg-emerald-50 text-emerald-700",
};

const severityClassName = {
  INFO: "bg-blue-50 text-blue-700",
  SUCCESS: "bg-emerald-50 text-emerald-700",
  WARNING: "bg-amber-50 text-amber-700",
  DANGER: "bg-red-50 text-red-700",
};

export function CompanyPortalNotificationBell({
  data: initialData,
}: {
  data: CompanyPortalNotificationData;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(initialData);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const countLabel = data.total > 99 ? "99+" : data.total.toString();

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/company/notifications", {
        cache: "no-store",
      });
      if (!response.ok) return;
      setData((await response.json()) as CompanyPortalNotificationData);
    } catch {
      // Notification polling should stay silent when offline.
    }
  }, []);

  const markRead = useCallback(async (eventIds?: number[]) => {
    setIsMarkingRead(true);
    try {
      const response = await fetch("/api/company/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventIds?.length ? { ids: eventIds } : { all: true }),
      });
      if (!response.ok) return;
      setData((await response.json()) as CompanyPortalNotificationData);
    } finally {
      setIsMarkingRead(false);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(refresh, 20_000);
    const handleFocus = () => refresh();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refresh]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setIsOpen((currentValue) => !currentValue);
          void refresh();
        }}
        className="relative rounded-lg border border-border bg-background p-2 text-foreground transition hover:bg-surface"
        aria-label="Mở thông báo"
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" />
        {data.total > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-bold text-white">
            {countLabel}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-40 mt-2 w-[360px] overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Thông báo</p>
                <p className="mt-1 text-xs text-muted">
                  {data.total > 0
                    ? `Bạn có ${data.total} mục cần theo dõi`
                    : "Không có gì mới"}
                </p>
              </div>
              {data.unreadTotal > 0 ? (
                <button
                  type="button"
                  disabled={isMarkingRead}
                  onClick={() => markRead()}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted transition hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  Đã đọc
                </button>
              ) : null}
            </div>
          </div>

          <div className="max-h-[70vh] overflow-auto p-2">
            {data.total === 0 ? (
              <div className="flex items-center gap-3 rounded-lg bg-background px-4 py-5 text-sm text-muted">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Chưa có thông báo mới.
              </div>
            ) : (
              <>
                <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Cần xử lý
                </p>
                {data.actionableItems.length === 0 ? (
                  <div className="rounded-lg bg-background px-3 py-3 text-xs text-muted">
                    Không có mục cần xử lý.
                  </div>
                ) : (
                  data.actionableItems.map((item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 transition hover:bg-background"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {item.label}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {item.description}
                        </p>
                      </div>
                      <div className="ml-3 flex shrink-0 items-center gap-2">
                        <span
                          className={`inline-flex min-w-8 justify-center rounded-full px-2 py-1 text-xs font-semibold ${
                            item.count > 0
                              ? toneClassName[item.tone]
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

                <p className="px-2 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Thông báo mới
                </p>
                {data.eventItems.length === 0 ? (
                  <div className="rounded-lg bg-background px-3 py-3 text-xs text-muted">
                    Chưa có thông báo chưa đọc.
                  </div>
                ) : (
                  data.eventItems.map((item) => (
                    <EventLink
                      key={item.id}
                      item={item}
                      onClick={() => {
                        void markRead([item.id]);
                        setIsOpen(false);
                      }}
                    />
                  ))
                )}
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EventLink({
  item,
  onClick,
}: {
  item: CompanyPortalNotificationEventItem;
  onClick: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className="flex items-center justify-between rounded-lg px-3 py-2.5 transition hover:bg-background"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
        {item.body ? (
          <p className="mt-1 line-clamp-2 text-xs text-muted">{item.body}</p>
        ) : null}
      </div>
      <span
        className={`ml-3 inline-flex shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${
          severityClassName[item.severity]
        }`}
      >
        Mới
      </span>
    </Link>
  );
}
