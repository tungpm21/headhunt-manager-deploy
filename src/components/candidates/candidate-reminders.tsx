"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  BellRing,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Loader2,
} from "lucide-react";
import {
  addCandidateReminderAction,
  completeCandidateReminderAction,
} from "@/lib/actions";
import type { CandidateWithRelations } from "@/types/candidate-ui";

interface CandidateRemindersProps {
  candidateId: number;
  reminders: CandidateWithRelations["reminders"];
}

function formatDateTimeInputValue(date: Date) {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function formatDateTimeLabel(value: Date | string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getReminderMeta(reminder: CandidateWithRelations["reminders"][number]) {
  if (reminder.isCompleted) {
    return {
      badgeClassName: "bg-emerald-50 text-emerald-700",
      label: "Đã xong",
    };
  }

  const dueAt = new Date(reminder.dueAt);
  const now = new Date();
  const diffMs = dueAt.getTime() - now.getTime();

  if (diffMs < 0) {
    return {
      badgeClassName: "bg-rose-50 text-rose-700",
      label: "Quá hạn",
    };
  }

  if (diffMs <= 24 * 60 * 60 * 1000) {
    return {
      badgeClassName: "bg-amber-50 text-amber-700",
      label: "Trong 24h",
    };
  }

  return {
    badgeClassName: "bg-sky-50 text-sky-700",
    label: "Sap toi",
  };
}

export function CandidateReminders({
  candidateId,
  reminders,
}: CandidateRemindersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isCompleting, startCompleting] = useTransition();
  const boundAction = addCandidateReminderAction.bind(null, candidateId);
  const [state, formAction, isPending] = useActionState(boundAction, undefined);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state?.success]);

  const activeReminders = reminders.filter((reminder) => !reminder.isCompleted);
  const completedReminders = reminders.filter((reminder) => reminder.isCompleted);
  const [defaultDueAt] = useState(() =>
    formatDateTimeInputValue(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))
  );

  const handleComplete = (reminderId: number) => {
    startCompleting(async () => {
      await completeCandidateReminderAction(reminderId);
    });
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-muted">
            <BellRing className="h-4 w-4" />
            Follow-up
          </p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">
            Nhắc việc với ứng viên
          </h2>
        </div>
        <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-muted">
          {activeReminders.length} đang mở
        </span>
      </div>

      <form ref={formRef} action={formAction} className="mt-5 space-y-3">
        <div className="grid gap-3 md:grid-cols-[1.5fr_1fr]">
          <input
            type="text"
            name="title"
            required
            placeholder="Ví dụ: Gọi lại sau buổi phỏng vấn"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="datetime-local"
            name="dueAt"
            required
            defaultValue={defaultDueAt}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <textarea
          name="note"
          rows={2}
          placeholder="Nội dung cần nhớ: cần hỏi mức lương, xác nhận lịch, follow-up kết quả..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />

        {state?.error ? (
          <p className="text-sm text-danger">{state.error}</p>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <CalendarClock className="h-4 w-4" />
                Thêm nhắc việc
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-5 space-y-3">
        {activeReminders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-background px-4 py-6 text-center text-sm text-muted">
            Chưa có nhắc việc nào đang mở cho ứng viên này.
          </div>
        ) : (
          activeReminders.map((reminder) => {
            const meta = getReminderMeta(reminder);

            return (
              <div
                key={reminder.id}
                className="rounded-xl border border-border bg-background p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {reminder.title}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${meta.badgeClassName}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-2 flex items-center gap-1 text-xs text-muted">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatDateTimeLabel(reminder.dueAt)} •{" "}
                      {formatDistanceToNow(new Date(reminder.dueAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Phụ trách: {reminder.assignedTo.name}
                    </p>
                    {reminder.note ? (
                      <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
                        {reminder.note}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleComplete(reminder.id)}
                    disabled={isCompleting}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition hover:bg-surface/70 disabled:opacity-60"
                  >
                    {isCompleting ? (
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
          })
        )}
      </div>

      {completedReminders.length > 0 ? (
        <div className="mt-6 border-t border-border pt-4">
          <p className="text-sm font-medium text-muted">Đã xử lý gần đây</p>
          <div className="mt-3 space-y-2">
            {completedReminders.slice(0, 3).map((reminder) => (
              <div
                key={reminder.id}
                className="rounded-xl border border-border bg-background px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{reminder.title}</p>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    Đã xong
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {reminder.completedAt
                    ? `Hoàn thành ${formatDistanceToNow(new Date(reminder.completedAt), {
                      addSuffix: true,
                      locale: vi,
                    })}`
                    : "Đã hoàn thành"}
                  {reminder.completedBy ? ` bởi ${reminder.completedBy.name}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
