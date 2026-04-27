export default function ApplicationsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-64 animate-pulse rounded bg-border" />
        <div className="h-4 w-80 animate-pulse rounded bg-border/60" />
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-4 gap-4 border-b border-border/50 p-4 last:border-b-0"
          >
            <div className="h-5 animate-pulse rounded bg-border/70" />
            <div className="h-5 animate-pulse rounded bg-border/70" />
            <div className="h-5 animate-pulse rounded bg-border/70" />
            <div className="h-5 animate-pulse rounded bg-border/70" />
          </div>
        ))}
      </div>
    </div>
  );
}
