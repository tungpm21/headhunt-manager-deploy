"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2 } from "lucide-react";
import type { EmployerNotificationData } from "@/lib/employers";

const toneClassName: Record<string, string> = {
  blue: "bg-blue-50 text-blue-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  emerald: "bg-emerald-50 text-emerald-700",
};

export function EmployerNotificationBell({
  initialData,
}: {
  initialData: EmployerNotificationData;
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(initialData);

  useEffect(() => {
    let cancelled = false;

    async function refreshNotifications() {
      try {
        const response = await fetch("/api/employer/notifications", {
          cache: "no-store",
        });
        if (!response.ok) return;
        const nextData: EmployerNotificationData = await response.json();
        if (!cancelled) {
          setData(nextData);
        }
      } catch {
        // Polling is best-effort; keep the last known notification snapshot.
      }
    }

    const timer = window.setInterval(refreshNotifications, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const countLabel = data.total > 9 ? "9+" : data.total.toString();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Thông báo nhà tuyển dụng"
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-teal-100 bg-white text-gray-500 transition hover:bg-teal-50 hover:text-teal-700"
      >
        <Bell className="h-4 w-4" />
        {data.total > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {countLabel}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-800">Thông báo</p>
            <p className="text-xs text-gray-400">
              Cập nhật hồ sơ, trạng thái tin và quota
            </p>
          </div>

          {data.items.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {data.items.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-start justify-between gap-3 px-4 py-3 text-sm transition hover:bg-gray-50"
                >
                  <span className="text-gray-700">{item.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      toneClassName[item.tone] ?? toneClassName.blue
                    }`}
                  >
                    {item.count}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-5 text-sm text-gray-500">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Chưa có thông báo mới.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
