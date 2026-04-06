export default function DashboardLoading() {
    return (
        <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in duration-300">
            {/* Hero skeleton */}
            <div className="h-32 rounded-2xl bg-muted/20 animate-pulse" />

            {/* Stat cards skeleton */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="flex items-center gap-4 rounded-xl border border-border bg-surface p-6 shadow-sm"
                    >
                        <div className="h-12 w-12 animate-pulse rounded-lg bg-muted/20" />
                        <div className="space-y-2">
                            <div className="h-3 w-20 animate-pulse rounded bg-muted/20" />
                            <div className="h-7 w-12 animate-pulse rounded bg-muted/20" />
                        </div>
                    </div>
                ))}
            </div>

            {/* KPI row skeleton */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-border bg-surface p-5 shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-11 w-11 animate-pulse rounded-lg bg-muted/20" />
                            <div className="space-y-2">
                                <div className="h-3 w-16 animate-pulse rounded bg-muted/20" />
                                <div className="h-7 w-14 animate-pulse rounded bg-muted/20" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Revenue + pipeline skeleton */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="h-28 animate-pulse rounded-xl border border-border bg-surface shadow-sm"
                    />
                ))}
            </div>

            {/* Main content skeleton */}
            <div className="h-48 animate-pulse rounded-xl border border-border bg-surface shadow-sm" />
        </div>
    );
}
