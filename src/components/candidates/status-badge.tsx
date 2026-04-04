import type { CandidateStatus } from "@/types/candidate-ui";
import { clsx } from "clsx";

const STATUS_CONFIG: Record<
  CandidateStatus,
  { label: string; className: string }
> = {
  AVAILABLE: {
    label: "Sẵn sàng",
    className: "bg-success/10 text-success border border-success/20",
  },
  EMPLOYED: {
    label: "Đã có việc",
    className: "bg-muted/10 text-muted border border-muted/20",
  },
  INTERVIEWING: {
    label: "Đang phỏng vấn",
    className: "bg-info/10 text-info border border-info/20",
  },
  BLACKLIST: {
    label: "Blacklist",
    className: "bg-danger/10 text-danger border border-danger/20",
  },
};

export function StatusBadge({ status }: { status: CandidateStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

export const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(
  ([value, { label }]) => ({ value, label })
);
