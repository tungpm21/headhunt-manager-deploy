import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowRightLeft,
  BellRing,
  FileDown,
  MessageSquareText,
  UserPlus,
} from "lucide-react";

type ActivityItem = {
  id: string;
  type: "STAGE_CHANGE" | "STATUS_CHANGE" | "NOTE" | "IMPORT" | "REMINDER";
  actorName: string;
  title: string;
  subtitle?: string;
  href: string;
  timestamp: Date;
};

function getActivityIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "STAGE_CHANGE":
    case "STATUS_CHANGE":
      return <ArrowRightLeft className="h-4 w-4 text-violet-500" />;
    case "NOTE":
      return <MessageSquareText className="h-4 w-4 text-amber-500" />;
    case "IMPORT":
      return <FileDown className="h-4 w-4 text-emerald-500" />;
    case "REMINDER":
      return <BellRing className="h-4 w-4 text-sky-500" />;
    default:
      return <UserPlus className="h-4 w-4 text-sky-500" />;
  }
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div>
        <p className="text-sm font-medium text-muted">Recent Activity</p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">
          Hoạt động mới nhất trên CRM
        </h2>
      </div>

      {items.length === 0 ? (
        <p className="mt-5 rounded-xl border border-border bg-background p-4 text-sm text-muted">
          Chưa có hoạt động nào để hiển thị.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-start gap-3 rounded-xl border border-transparent bg-background p-4 transition hover:border-border hover:bg-background/80"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface">
                {getActivityIcon(item.type)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-sm text-muted">{item.actorName}</p>
                {item.subtitle ? (
                  <p className="mt-1 text-sm text-muted">{item.subtitle}</p>
                ) : null}
                <p className="mt-2 text-xs text-muted/80">
                  {formatDistanceToNow(item.timestamp, {
                    addSuffix: true,
                    locale: vi,
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
