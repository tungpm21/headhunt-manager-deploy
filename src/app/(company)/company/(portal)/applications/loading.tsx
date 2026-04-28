import { Mail } from "lucide-react";

export default function CompanyApplicationsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold text-foreground">
          <Mail className="h-7 w-7 text-primary" />
          Hồ sơ ứng tuyển
        </h1>
        <p className="mt-1 text-sm text-muted">Đang tải danh sách ứng tuyển.</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-10 animate-pulse rounded-lg bg-muted/30"
            />
          ))}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.9fr)]">
        <div className="h-[520px] animate-pulse rounded-xl border border-border bg-muted/20" />
        <div className="h-[520px] animate-pulse rounded-xl border border-border bg-muted/20" />
      </div>
    </div>
  );
}
