import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";
import { differenceInCalendarDays, format } from "date-fns";
import { vi } from "date-fns/locale";

type JobAlert = {
  id: number;
  title: string;
  deadline: Date;
  companyName: string;
};

type SubscriptionAlert = {
  id: number;
  tier: string;
  endDate: Date;
  employerId: number;
  companyName: string;
};

function getAlertMeta(daysRemaining: number) {
  if (daysRemaining <= 2) {
    return {
      dotClassName: "bg-danger",
      badgeClassName: "bg-danger/10 text-danger",
      label: `${Math.max(daysRemaining, 0)} ngày`,
    };
  }

  if (daysRemaining <= 5) {
    return {
      dotClassName: "bg-warning",
      badgeClassName: "bg-warning/10 text-warning",
      label: `${daysRemaining} ngày`,
    };
  }

  return {
    dotClassName: "bg-orange-500",
    badgeClassName: "bg-orange-500/10 text-orange-600",
    label: `${daysRemaining} ngày`,
  };
}

export function DeadlineAlerts({
  jobs,
  subscriptions,
}: {
  jobs: JobAlert[];
  subscriptions: SubscriptionAlert[];
}) {
  const today = new Date();
  const alerts = [
    ...jobs.map((job) => ({
      kind: "job" as const,
      id: `job-${job.id}`,
      title: job.title,
      companyName: job.companyName,
      date: job.deadline,
      href: `/jobs/${job.id}`,
      helper: "Hạn chót tuyển dụng",
    })),
    ...subscriptions.map((subscription) => ({
      kind: "subscription" as const,
      id: `subscription-${subscription.id}`,
      title: `Gói ${subscription.tier}`,
      companyName: subscription.companyName,
      date: subscription.endDate,
      href: `/employers/${subscription.employerId}`,
      helper: "Thời hạn gói dịch vụ",
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-muted">
            <AlertTriangle className="h-4 w-4" />
            Cần chú ý
          </p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">
            Deadline sắp tới
          </h2>
        </div>
        <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-muted">
          {alerts.length} mục
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-border bg-background p-4 text-sm text-muted">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <span>Không có deadline nào sắp tới.</span>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {alerts.map((alert) => {
            const daysRemaining = differenceInCalendarDays(alert.date, today);
            const meta = getAlertMeta(daysRemaining);

            return (
              <Link
                key={alert.id}
                href={alert.href}
                className="flex items-start gap-3 rounded-xl border border-transparent bg-background p-4 transition hover:border-border hover:bg-background/80"
              >
                <span className={`mt-1 h-2.5 w-2.5 rounded-full ${meta.dotClassName}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {alert.title}
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${meta.badgeClassName}`}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">{alert.companyName}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                    <Clock3 className="h-3.5 w-3.5" />
                    {alert.helper} • {format(alert.date, "dd/MM/yyyy", { locale: vi })}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
