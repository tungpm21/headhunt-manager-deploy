"use client";

import Link from "next/link";
import { useTransition } from "react";
import { differenceInCalendarDays, format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  BellRing,
  CheckCircle2,
  Clock3,
  Loader2,
} from "lucide-react";
import { completeCandidateReminderAction } from "@/lib/actions";

type ReminderItem = {
  id: number;
  title: string;
  dueAt: Date;
  assignedTo: {
    name: string;
  };
  candidate: {
    id: number;
    fullName: string;
    currentPosition: string | null;
  };
};

function getReminderMeta(daysRemaining: number) {
  if (daysRemaining < 0) {
    return {
      badgeClassName: "bg-danger/10 text-danger",
      label: "Quá hạn",
    };
  }

  if (daysRemaining === 0) {
    return {
      badgeClassName: "bg-amber-50 text-amber-700",
      label: "Hôm nay",
    };
  }

  if (daysRemaining <= 2) {
    return {
      badgeClassName: "bg-sky-50 text-sky-700",
      label: `${daysRemaining} ngày`,
    };
  }

  return {
    badgeClassName: "bg-emerald-50 text-emerald-700",
    label: `${daysRemaining} ngày`,
  };
}

export function FollowUpReminders({ items }: { items: ReminderItem[] }) {
  const [isPending, startTransition] = useTransition();
  const today = new Date();

  const handleComplete = (reminderId: number) => {
    startTransition(async () => {
      await completeCandidateReminderAction(reminderId);
    });
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-muted">
            <BellRing className="h-4 w-4" />
            Follow-up
          </p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">
            Nhắc việc sắp đến hạn
          </h2>
        </div>
        <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-muted">
          {items.length} mục
        </span>
      </div>

      {items.length === 0 ? (
        <div className="mt-5 rounded-xl border border-border bg-background p-4 text-sm text-muted">
          Chưa có follow-up nào đến hạn trong 7 ngày tới.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {items.map((item) => {
            const daysRemaining = differenceInCalendarDays(item.dueAt, today);
            const meta = getReminderMeta(daysRemaining);

            return (
              <div
                key={item.id}
                className="rounded-xl border border-transparent bg-background p-4 transition hover:border-border"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/candidates/${item.candidate.id}`}
                        className="truncate text-sm font-semibold text-foreground hover:text-primary"
                      >
                        {item.title}
                      </Link>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${meta.badgeClassName}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted">{item.candidate.fullName}</p>
                    <p className="mt-1 text-xs text-muted">
                      {item.candidate.currentPosition || "Chưa cập nhật vị trí"} •{" "}
                      {item.assignedTo.name}
                    </p>
                    <p className="mt-2 flex items-center gap-1 text-xs text-muted">
                      <Clock3 className="h-3.5 w-3.5" />
                      {format(item.dueAt, "dd/MM/yyyy HH:mm", { locale: vi })}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleComplete(item.id)}
                    disabled={isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition hover:bg-surface/70 disabled:opacity-60"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang cập nhật...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Hoàn thành
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
